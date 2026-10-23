/* =============================================================================
 * chartgen.js — 太鼓譜面自動生成引擎
 *
 * 流程：
 *   1. 音訊降頻成 22.05kHz 單聲道
 *   2. STFT → SuperFlux 頻譜通量（含三頻段分離，用於判斷咚／咔）
 *   3. 自適應門檻挑出 onset（起音點），再用波形能量精修到毫秒級
 *   4. 自相關估 BPM（含倍頻校正 + 節奏心理學權重），再用 onset 求節拍相位
 *   5. 將 onset 量化到 16 分音符格線（可選：中途變速，每段用自己的 BPM）
 *   6. 只從真實起音點挑選音符（依難度密度／細分／強度），再指派咚咔、大音符、連打、風船
 *   7. 計算★難易度與配點（滿人數約 100 萬分）
 *
 * 遊戲與 generator.html 共用本檔案。
 * ===========================================================================*/
(function (global) {
  'use strict';

  var SR = 22050;      // 分析取樣率
  var FRAME = 1024;    // STFT 視窗
  var HOP = 256;       // 跳距 → 每幀 11.6ms

  /* ================================================================== *
   * 通用工具
   * ================================================================== */

  function nextTick() {
    return new Promise(function (r) { setTimeout(r, 0); });
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function quantile(sortedArr, q) {
    if (!sortedArr.length) return 0;
    var i = clamp(Math.floor(q * (sortedArr.length - 1)), 0, sortedArr.length - 1);
    return sortedArr[i];
  }

  function rng(seed) {
    var s = (seed >>> 0) || 22050;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  /** 就地二分插入（維持時間排序） */
  function insertSorted(arr, item, keyFn) {
    var lo = 0, hi = arr.length;
    var k = keyFn(item);
    while (lo < hi) {
      var mid = (lo + hi) >> 1;
      if (keyFn(arr[mid]) < k) lo = mid + 1; else hi = mid;
    }
    arr.splice(lo, 0, item);
    return lo;
  }

  function lowerBound(arr, value, keyFn) {
    var lo = 0, hi = arr.length;
    while (lo < hi) {
      var mid = (lo + hi) >> 1;
      if (keyFn(arr[mid]) < value) lo = mid + 1; else hi = mid;
    }
    return lo;
  }

  /* ================================================================== *
   * FFT（原地 radix-2）
   * ================================================================== */

  function makeFFT(n) {
    var levels = Math.round(Math.log(n) / Math.LN2);
    var cosT = new Float32Array(n / 2), sinT = new Float32Array(n / 2);
    for (var i = 0; i < n / 2; i++) {
      cosT[i] = Math.cos(2 * Math.PI * i / n);
      sinT[i] = Math.sin(2 * Math.PI * i / n);
    }
    var rev = new Uint32Array(n);
    for (var j = 0; j < n; j++) {
      var x = j, r = 0;
      for (var b = 0; b < levels; b++) { r = (r << 1) | (x & 1); x >>>= 1; }
      rev[j] = r;
    }
    return function (re, im) {
      var i, j, t, tw, l, tre, tim;
      for (i = 0; i < n; i++) {
        j = rev[i];
        if (j > i) {
          t = re[i]; re[i] = re[j]; re[j] = t;
          t = im[i]; im[i] = im[j]; im[j] = t;
        }
      }
      for (var size = 2; size <= n; size <<= 1) {
        var half = size >> 1, step = n / size;
        for (i = 0; i < n; i += size) {
          for (j = i, tw = 0; j < i + half; j++, tw += step) {
            l = j + half;
            tre = re[l] * cosT[tw] + im[l] * sinT[tw];
            tim = -re[l] * sinT[tw] + im[l] * cosT[tw];
            re[l] = re[j] - tre; im[l] = im[j] - tim;
            re[j] += tre; im[j] += tim;
          }
        }
      }
    };
  }

  /* ================================================================== *
   * 1. 前處理：混單聲道 + 降頻
   * ================================================================== */

  function toMono(buffer, targetRate) {
    var chs = buffer.numberOfChannels;
    var n = buffer.length;
    var datas = [];
    for (var c = 0; c < chs; c++) datas.push(buffer.getChannelData(c));

    // 先混成單聲道
    var mono = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      var s = 0;
      for (var c2 = 0; c2 < chs; c2++) s += datas[c2][i];
      mono[i] = s / chs;
    }

    var ratio = buffer.sampleRate / targetRate;
    if (ratio <= 1.001) return { data: mono, rate: buffer.sampleRate };

    // 抗混疊：長度為 ratio 的移動平均
    var w = Math.max(2, Math.round(ratio));
    var acc = 0, sm = new Float32Array(n);
    for (var p = 0; p < n; p++) {
      acc += mono[p];
      if (p >= w) acc -= mono[p - w];
      sm[p] = acc / Math.min(p + 1, w);
    }

    var outLen = Math.floor(n / ratio);
    var out = new Float32Array(outLen);
    for (var o = 0; o < outLen; o++) {
      var pos = o * ratio;
      var i0 = pos | 0, frac = pos - i0, i1 = Math.min(i0 + 1, n - 1);
      out[o] = sm[i0] * (1 - frac) + sm[i1] * frac;
    }
    return { data: out, rate: targetRate, original: mono, originalRate: buffer.sampleRate };
  }

  /* ================================================================== *
   * 2. STFT + SuperFlux 頻譜通量
   * ================================================================== */

  function computeFlux(x, sr, onProgress) {
    var nFrames = Math.max(1, Math.floor((x.length - FRAME) / HOP) + 1);
    var bins = FRAME >> 1;
    var fft = makeFFT(FRAME);
    var win = new Float32Array(FRAME);
    for (var w = 0; w < FRAME; w++) win[w] = 0.5 - 0.5 * Math.cos(2 * Math.PI * w / (FRAME - 1));

    var re = new Float32Array(FRAME), im = new Float32Array(FRAME);
    var prev = new Float32Array(bins), cur = new Float32Array(bins), pmax = new Float32Array(bins);

    var flux = new Float32Array(nFrames);
    var fLow = new Float32Array(nFrames);
    var fMid = new Float32Array(nFrames);
    var fHigh = new Float32Array(nFrames);
    var rms = new Float32Array(nFrames);

    var binHz = sr / FRAME;
    var bLow = Math.max(1, Math.round(260 / binHz));
    var bMid = Math.round(2200 / binHz);
    var norm = 2 / FRAME;

    var frame = 0;

    function step(budgetMs) {
      var t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      while (frame < nFrames) {
        var base = frame * HOP;
        var e = 0, i;
        for (i = 0; i < FRAME; i++) {
          var v = x[base + i] || 0;
          e += v * v;
          re[i] = v * win[i];
          im[i] = 0;
        }
        rms[frame] = Math.sqrt(e / FRAME);
        fft(re, im);
        for (i = 1; i < bins; i++) {
          var mag = Math.sqrt(re[i] * re[i] + im[i] * im[i]) * norm;
          cur[i] = Math.log(1 + 40 * mag);
        }
        if (frame > 0) {
          // 頻率方向 max-filter（抑制顫音誤判）
          for (i = 1; i < bins; i++) {
            var a = prev[i - 1] || 0, b = prev[i], c = (i + 1 < bins ? prev[i + 1] : 0);
            pmax[i] = a > b ? (a > c ? a : c) : (b > c ? b : c);
          }
          var tot = 0, lo = 0, md = 0, hi = 0;
          for (i = 1; i < bins; i++) {
            var d = cur[i] - pmax[i];
            if (d > 0) {
              tot += d;
              if (i < bLow) lo += d;
              else if (i < bMid) md += d;
              else hi += d;
            }
          }
          flux[frame] = tot; fLow[frame] = lo; fMid[frame] = md; fHigh[frame] = hi;
        }
        var tmp = prev; prev = cur; cur = tmp;
        frame++;
        if ((frame & 255) === 0) {
          var now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
          if (now - t0 > budgetMs) return false;
        }
      }
      return true;
    }

    return (function loop() {
      var done = step(24);
      if (onProgress) onProgress(frame / nFrames);
      if (done) {
        return Promise.resolve({
          nFrames: nFrames, fps: sr / HOP, flux: flux,
          low: fLow, mid: fMid, high: fHigh, rms: rms
        });
      }
      return nextTick().then(loop);
    })();
  }

  /* ================================================================== *
   * 3. Onset 挑選
   * ================================================================== */

  function pickOnsets(F, x, sr, opts) {
    opts = opts || {};
    var flux = F.flux, n = F.nFrames, fps = F.fps;

    // 正規化
    var sorted = Array.prototype.slice.call(flux).sort(function (a, b) { return a - b; });
    var scale = quantile(sorted, 0.985) || 1;
    var env = new Float32Array(n);
    for (var i = 0; i < n; i++) env[i] = flux[i] / scale;

    var preAvg = Math.round(fps * 0.14);   // ≈140ms
    var postAvg = Math.round(fps * 0.14);
    var preMax = 3, postMax = 3;
    var delta = opts.delta === undefined ? 0.085 : opts.delta;
    var lambda = opts.lambda === undefined ? 1.06 : opts.lambda;
    var minGapFrames = Math.max(2, Math.round(fps * 0.032));

    // 滑動平均
    var win = preAvg + postAvg + 1;
    var run = 0, mean = new Float32Array(n);
    for (i = 0; i < n; i++) {
      run += env[i];
      if (i >= win) run -= env[i - win];
      var c = Math.min(i + 1, win);
      var center = i - postAvg;
      if (center >= 0) mean[center] = run / c;
    }
    for (i = Math.max(0, n - postAvg); i < n; i++) mean[i] = mean[Math.max(0, n - postAvg - 1)];

    var peaks = [];
    var last = -1e9;
    for (i = 1; i < n - 1; i++) {
      var v = env[i];
      if (v < delta) continue;
      if (v < mean[i] * lambda + delta) continue;
      var isMax = true;
      for (var k = Math.max(0, i - preMax); k <= Math.min(n - 1, i + postMax); k++) {
        if (env[k] > v) { isMax = false; break; }
      }
      if (!isMax) continue;
      if (i - last < minGapFrames) continue;
      last = i;
      peaks.push(i);
    }

    // 精修到波形能量的實際起音位置
    var onsets = [];
    for (var p = 0; p < peaks.length; p++) {
      var fi = peaks[p];
      var t = refineOnset(x, fi * HOP, sr);
      var lo = F.low[fi] + F.low[Math.min(n - 1, fi + 1)] * 0.5;
      var md = F.mid[fi] + F.mid[Math.min(n - 1, fi + 1)] * 0.5;
      var hi = F.high[fi] + F.high[Math.min(n - 1, fi + 1)] * 0.5;
      var sum = lo + md + hi || 1;
      onsets.push({
        t: t,
        frame: fi,
        s: env[fi],
        lo: lo / sum,
        mid: md / sum,
        hi: hi / sum,
        // 高頻佔比：越高越像小鼓／鈸／碎音 → 傾向「咔」
        hiRatio: (hi + md * 0.35) / sum
      });
    }

    // 強度重新正規化到 0~1
    var ss = onsets.map(function (o) { return o.s; }).sort(function (a, b) { return a - b; });
    var hiN = quantile(ss, 0.95) || 1;
    onsets.forEach(function (o) { o.s = clamp(o.s / hiN, 0, 1.6); });

    return { onsets: onsets, env: env, mean: mean };
  }

  /**
   * 以短時能量的最大上升點，把 onset 精修到毫秒級。
   * STFT 的通量峰值會落後真實起音約 3/4 個視窗，這裡在波形上找回來。
   */
  function refineOnset(x, frameStart, sr) {
    var B = 32;
    var from = Math.max(0, frameStart + Math.round(FRAME * 0.15));
    var to = Math.min(x.length - B, frameStart + Math.round(FRAME * 1.2));
    if (to <= from) return frameStart / sr;
    var nb = Math.floor((to - from) / B);
    if (nb < 3) return (frameStart + FRAME * 0.6) / sr;
    var e = new Float32Array(nb);
    for (var b = 0; b < nb; b++) {
      var acc = 0, o = from + b * B;
      for (var i = 0; i < B; i++) { var v = x[o + i]; acc += v * v; }
      e[b] = Math.sqrt(acc / B);
    }
    var bestD = -1, bestB = 1;
    for (var j = 1; j < nb; j++) {
      var d = e[j] - e[j - 1];
      if (d > bestD) { bestD = d; bestB = j; }
    }
    return (from + (bestB - 0.5) * B) / sr;
  }

  /* ================================================================== *
   * 4. BPM 與節拍相位
   * ================================================================== */

  function estimateTempo(env, fps, opts) {
    opts = opts || {};
    var minBpm = opts.minBpm || 60, maxBpm = opts.maxBpm || 220;
    var n = env.length;

    // 平滑後去均值
    var e = new Float32Array(n), mean = 0;
    for (var i = 0; i < n; i++) {
      e[i] = (env[Math.max(0, i - 1)] + env[i] * 2 + env[Math.min(n - 1, i + 1)]) / 4;
      mean += e[i];
    }
    mean /= n;
    for (i = 0; i < n; i++) e[i] -= mean;

    var maxLag = Math.min(n - 1, Math.round(fps * 4.2));
    var minLag = Math.max(2, Math.round(fps * 60 / maxBpm));
    var ac = new Float64Array(maxLag + 1);
    var stride = n > 40000 ? 2 : 1;   // 長曲子抽樣加速
    for (var lag = minLag; lag <= maxLag; lag++) {
      var sum = 0;
      for (var t = 0; t + lag < n; t += stride) sum += e[t] * e[t + lag];
      ac[lag] = sum * stride;
    }
    var acMax = 0;
    for (i = minLag; i <= maxLag; i++) if (ac[i] > acMax) acMax = ac[i];
    if (acMax <= 0) return { bpm: 120, confidence: 0 };
    for (i = minLag; i <= maxLag; i++) ac[i] /= acMax;

    function acAt(l) {
      if (l < minLag || l >= maxLag) return 0;
      var i0 = Math.floor(l), f = l - i0;
      return ac[i0] * (1 - f) + ac[i0 + 1] * f;
    }

    var best = null, list = [];
    for (var bpm = minBpm; bpm <= maxBpm; bpm += 0.1) {
      var lag0 = fps * 60 / bpm;
      // 以 1、2、3、4 倍週期加權（一拍、兩拍、三拍、一小節）
      var sc = acAt(lag0) + 0.85 * acAt(lag0 * 2) + 0.45 * acAt(lag0 * 3) + 0.70 * acAt(lag0 * 4);
      // 節奏心理學先驗：偏好 100~160
      var prior = Math.exp(-0.5 * Math.pow(Math.log(bpm / 128) / Math.LN2 / 0.62, 2));
      var total = sc * (0.45 + 0.55 * prior);
      list.push([bpm, total]);
      if (!best || total > best[1]) best = [bpm, total, sc];
    }

    var chosen = best[0];
    // 倍頻修正
    if (chosen < 88) {
      var d = chosen * 2;
      if (d <= maxBpm) chosen = d;
    } else if (chosen > 200) {
      chosen = chosen / 2;
    }

    // 在選中值附近細找
    var refined = chosen, bestLocal = -1;
    for (var b2 = chosen - 1.2; b2 <= chosen + 1.2; b2 += 0.02) {
      var l2 = fps * 60 / b2;
      var s2 = acAt(l2) + 0.85 * acAt(l2 * 2) + 0.45 * acAt(l2 * 3) + 0.70 * acAt(l2 * 4);
      if (s2 > bestLocal) { bestLocal = s2; refined = b2; }
    }

    return {
      bpm: Math.round(refined * 100) / 100,
      confidence: clamp(best[1], 0, 1),
      curve: list
    };
  }

  /** 以 onset 求節拍相位（在真實時間軸上運算，避免 STFT 延遲誤差） */
  function estimatePhase(onsets, bpm) {
    var P = 60 / bpm;
    if (!onsets.length) return { offset: 0, measureOffset: 0 };
    var sigma = P * 0.11;

    function score(phi) {
      var sc = 0;
      for (var i = 0; i < onsets.length; i++) {
        var o = onsets[i];
        var d = (o.t - phi) % P;
        if (d < 0) d += P;
        var dd = Math.min(d, P - d);
        sc += o.s * Math.exp(-0.5 * (dd / sigma) * (dd / sigma));
      }
      return sc;
    }

    var bestPhi = 0, bestSc = -1, steps = 180;
    for (var k = 0; k < steps; k++) {
      var phi = k * P / steps;
      var s = score(phi);
      if (s > bestSc) { bestSc = s; bestPhi = phi; }
    }
    // 細修
    var span = P / steps;
    for (var f = -span; f <= span; f += span / 12) {
      var s2 = score(bestPhi + f);
      if (s2 > bestSc) { bestSc = s2; bestPhi = bestPhi + f; }
    }
    bestPhi = ((bestPhi % P) + P) % P;

    // 小節第一拍（4/4）
    var mScore = [0, 0, 0, 0];
    for (var i2 = 0; i2 < onsets.length; i2++) {
      var o2 = onsets[i2];
      var bIdx = Math.round((o2.t - bestPhi) / P);
      var dev = Math.abs(o2.t - (bestPhi + bIdx * P));
      if (dev > P * 0.2) continue;
      var m = ((bIdx % 4) + 4) % 4;
      // 低頻能量（大鼓）對判斷小節首拍最有意義
      mScore[m] += o2.s * (0.5 + o2.lo);
    }
    var bestM = 0;
    for (var m2 = 1; m2 < 4; m2++) if (mScore[m2] > mScore[bestM]) bestM = m2;

    return {
      offset: bestPhi,
      measureOffset: bestPhi + bestM * P,
      beatStrength: bestSc / Math.max(1, onsets.length)
    };
  }

  /* ================================================================== *
   * 5. 量化到 16 分格線
   * ================================================================== */

  var SUBDIV = 4;   // 每拍細分 → 16 分音符

  /**
   * 變速點必須晚於第一小節起點。落在起點上或更早的列會被略過，
   * 開頭速度仍以 bpm 欄位為準，避免靜默改掉整首的節拍。
   * 同一秒只留最後一列。
   */
  function laterBpmChanges(measureOffset, changes) {
    if (!changes || !changes.length) return [];
    var rows = [];
    var i;
    for (i = 0; i < changes.length; i++) {
      var c = changes[i];
      if (!c) continue;
      var ct = +c.t;
      var cb = +c.bpm;
      if (!(cb > 0) || !isFinite(cb) || !isFinite(ct)) continue;
      if (ct <= measureOffset + 1e-4) continue;
      rows.push({ t: ct, bpm: cb });
    }
    rows.sort(function (a, b) { return a.t - b.t; });
    var out = [];
    for (i = 0; i < rows.length; i++) {
      if (out.length && Math.abs(out[out.length - 1].t - rows[i].t) <= 1e-4) out[out.length - 1] = rows[i];
      else out.push(rows[i]);
    }
    return out;
  }

  /** 開頭速度在 measureOffset，其後每個 {t, bpm} 都是新速度的第一拍。 */
  function normalizeBpmChanges(bpm, measureOffset, changes) {
    var openBpm = (bpm > 0 && isFinite(bpm)) ? bpm : 120;
    var openT = (typeof measureOffset === 'number' && isFinite(measureOffset)) ? measureOffset : 0;
    var map = [{ t: openT, bpm: openBpm }];
    var extra = laterBpmChanges(openT, changes);
    for (var i = 0; i < extra.length; i++) map.push(extra[i]);
    return map;
  }

  function sectionIndexAt(tempo, t) {
    var idx = 0;
    for (var i = 1; i < tempo.length; i++) {
      if (t + 1e-9 >= tempo[i].t) idx = i;
      else break;
    }
    return idx;
  }

  /** 每段的 16 分索引起點都對齊小節（% 16 === 0），段與段的索引不重疊。 */
  function sectionIndexBases(tempo) {
    var bases = [0];
    for (var s = 0; s < tempo.length - 1; s++) {
      var step = (60 / tempo[s].bpm) / SUBDIV;
      var span = tempo[s + 1].t - tempo[s].t;
      var n16 = Math.ceil(span / step - 1e-9);
      if (n16 < 0) n16 = 0;
      var next = bases[s] + n16;
      var mod = ((next % 16) + 16) % 16;
      if (mod !== 0) next += 16 - mod;
      bases.push(next);
    }
    return bases;
  }

  function buildSlotsOnMap(onsets, tempo) {
    var bases = sectionIndexBases(tempo);
    var buckets = {};
    var kept = 0;

    for (var i = 0; i < onsets.length; i++) {
      var o = onsets[i];
      var si = sectionIndexAt(tempo, o.t);
      var sec = tempo[si];
      var step = (60 / sec.bpm) / SUBDIV;
      var tol = step * 0.46;
      var local = Math.round((o.t - sec.t) / step);
      var gt = sec.t + local * step;
      var nextT = si + 1 < tempo.length ? tempo[si + 1].t : Infinity;
      if (si > 0 && local < 0) continue;
      // 交界上的正拍屬於下一段，不能把前一段的起音點吸過去
      if (gt >= nextT - 1e-9) continue;
      if (Math.abs(o.t - gt) > tol) continue;
      kept++;
      var idx = bases[si] + local;
      var cur = buckets[idx];
      if (!cur) {
        buckets[idx] = {
          i: idx, t: gt, s: o.s, hiRatio: o.hiRatio, lo: o.lo, n: 1,
          dev: o.t - gt
        };
      } else if (o.s > cur.s) {
        cur.s = o.s; cur.hiRatio = o.hiRatio; cur.lo = o.lo; cur.dev = o.t - gt; cur.n++;
      } else { cur.n++; }
    }

    var slots = [];
    for (var key in buckets) slots.push(buckets[key]);
    slots.sort(function (a, b) { return a.i - b.i; });
    var beat0 = 60 / tempo[0].bpm;
    return {
      slots: slots,
      step: beat0 / SUBDIV,
      beat: beat0,
      quantizeRate: onsets.length ? kept / onsets.length : 0
    };
  }

  function buildSlots(onsets, bpm, measureOffset, changes) {
    if (changes && changes.length) {
      var tempo = normalizeBpmChanges(bpm, measureOffset, changes);
      if (tempo.length > 1) return buildSlotsOnMap(onsets, tempo);
    }
    var beat = 60 / bpm;
    var step = beat / SUBDIV;
    var tol = step * 0.46;
    var map = {};
    var kept = 0;

    for (var i = 0; i < onsets.length; i++) {
      var o = onsets[i];
      var idx = Math.round((o.t - measureOffset) / step);
      var gt = measureOffset + idx * step;
      if (Math.abs(o.t - gt) > tol) continue;
      kept++;
      var cur = map[idx];
      if (!cur) {
        map[idx] = {
          i: idx, t: gt, s: o.s, hiRatio: o.hiRatio, lo: o.lo, n: 1,
          dev: o.t - gt
        };
      } else if (o.s > cur.s) {
        cur.s = o.s; cur.hiRatio = o.hiRatio; cur.lo = o.lo; cur.dev = o.t - gt; cur.n++;
      } else { cur.n++; }
    }

    var slots = [];
    for (var key in map) slots.push(map[key]);
    slots.sort(function (a, b) { return a.i - b.i; });

    return {
      slots: slots,
      step: step,
      beat: beat,
      quantizeRate: onsets.length ? kept / onsets.length : 0
    };
  }

  /* ================================================================== *
   * 6. 難度設定
   * ================================================================== */

  var DIFFS = {
    easy: {
      key: 'easy', jp: 'かんたん', zh: '梅', en: 'Easy', color: '#e8395c',
      maxLevel: 5, minLevel: 1,
      subdivLimit: 1,        // 只用 4 分音符
      density: 1.25,         // 平均每秒音符數
      peakFactor: 1.7,
      relFloor: 0.52,        // 相對局部最強拍的最低強度
      minGapAbs: 0.30,
      bigRate: 0.085, bigGapBeats: 0.90,
      donRatio: 0.66,
      maxRun: 3, metricBonus: 0.80,
      rollEvery: 28, balloonRate: 1.8,
      normaRate: 0.60, missMult: 1.6, strictJudge: false,
      lvBase: 0.3, lvK1: 1.60, lvK2: 0.30, lvK3: 1.5
    },
    normal: {
      key: 'normal', jp: 'ふつう', zh: '竹', en: 'Normal', color: '#63c34a',
      maxLevel: 7, minLevel: 2,
      subdivLimit: 2,        // 到 8 分音符
      density: 2.05,
      peakFactor: 1.8,
      relFloor: 0.40,
      minGapAbs: 0.185,
      bigRate: 0.055, bigGapBeats: 0.70,
      donRatio: 0.62,
      maxRun: 4, metricBonus: 0.50,
      rollEvery: 36, balloonRate: 2.8,
      normaRate: 0.65, missMult: 2.2, strictJudge: false,
      lvBase: 0.1, lvK1: 1.40, lvK2: 0.28, lvK3: 2.0
    },
    hard: {
      key: 'hard', jp: 'むずかしい', zh: '松', en: 'Hard', color: '#3f9fe0',
      maxLevel: 8, minLevel: 3,
      subdivLimit: 4,        // 到 16 分音符
      density: 3.30,
      peakFactor: 2.0,
      relFloor: 0.27,
      minGapAbs: 0.105,
      bigRate: 0.032, bigGapBeats: 0.46,
      donRatio: 0.58,
      maxRun: 5, metricBonus: 0.30,
      rollEvery: 44, balloonRate: 4.0,
      normaRate: 0.70, missMult: 2.8, strictJudge: true,
      lvBase: 0.2, lvK1: 1.15, lvK2: 0.25, lvK3: 2.0
    },
    oni: {
      key: 'oni', jp: 'おに', zh: '鬼', en: 'Extreme', color: '#9b4fd8',
      maxLevel: 10, minLevel: 4,
      subdivLimit: 4,
      density: 4.90,
      peakFactor: 2.2,
      relFloor: 0.15,
      minGapAbs: 0.074,
      bigRate: 0.020, bigGapBeats: 0.40,
      donRatio: 0.56,
      maxRun: 6, metricBonus: 0.15,
      rollEvery: 52, balloonRate: 5.2,
      normaRate: 0.75, missMult: 3.4, strictJudge: true,
      lvBase: 0.0, lvK1: 1.05, lvK2: 0.28, lvK3: 2.2
    }
  };

  var DIFF_ORDER = ['easy', 'normal', 'hard', 'oni'];

  /* ================================================================== *
   * 7. 音符挑選
   * ================================================================== */

  function localMaxStrength(slots, windowSec) {
    // 為每個 slot 計算「±windowSec 內的最強強度」
    var res = new Float32Array(slots.length);
    var lo = 0, hi = 0;
    for (var i = 0; i < slots.length; i++) {
      var t = slots[i].t;
      while (lo < slots.length && slots[lo].t < t - windowSec) lo++;
      while (hi < slots.length && slots[hi].t <= t + windowSec) hi++;
      var m = 0;
      for (var j = lo; j < hi; j++) if (slots[j].s > m) m = slots[j].s;
      res[i] = m || 1;
    }
    return res;
  }

  /**
   * 節拍層級權重：小節首拍最重，16 分反拍最輕。
   * 低難度乘上較大的權重係數，譜面就會自然落在強拍上；
   * 高難度係數小，音符分布幾乎完全跟著音樂本身走。
   */
  function metricWeight(i) {
    var m = ((i % 16) + 16) % 16;
    if (m === 0) return 1.0;      // 第 1 拍
    if (m === 8) return 0.78;     // 第 3 拍
    if (m % 4 === 0) return 0.58; // 第 2、4 拍
    if (m % 2 === 0) return 0.34; // 8 分反拍
    return 0.18;                  // 16 分
  }

  /**
   * 只從量化後的真實起音點挑音符（第一版做法）。
   * 這樣每一顆咚／咔都對應歌曲裡實際的節奏，不會為了湊密度而在空拍上發明音符。
   * 調難度／星等只會改變「挑多少顆、挑多細」，不會改變節奏來源。
   */
  function selectNotes(slots, cfg, beat, playFrom, playTo, tempoMap) {
    var stride = Math.max(1, Math.round(4 / Math.max(1, cfg.subdivLimit || 1)));
    var relMax = localMaxStrength(slots, 3.0);
    var mb = cfg.metricBonus === undefined ? 0.3 : cfg.metricBonus;
    var useMap = tempoMap && tempoMap.length > 1;

    var pool = [];
    for (var i = 0; i < slots.length; i++) {
      var s = slots[i];
      if (s.t < playFrom - 0.05 || s.t > playTo + 0.05) continue;
      if (((s.i % stride) + stride) % stride !== 0) continue;
      var rel = s.s / (relMax[i] || 1e-6);
      if (rel < cfg.relFloor) continue;
      pool.push({
        slot: s, i: s.i, t: s.t, s: s.s, rel: rel,
        hiRatio: s.hiRatio, lo: s.lo,
        onBeat: (((s.i % 4) + 4) % 4) === 0,
        onDown: (((s.i % 16) + 16) % 16) === 0,
        prio: s.s * (1 + mb * metricWeight(s.i)) + rel * 0.25
      });
    }

    var span = Math.max(1, playTo - playFrom);
    var target = Math.max(4, Math.round(cfg.density * span));
    var minGap = Math.max(cfg.minGapAbs || 0, beat / Math.max(1, cfg.subdivLimit) * 0.90);
    var windowCap = Math.max(3, Math.ceil(cfg.density * (cfg.peakFactor || 1.8) * 4));

    var order = pool.slice().sort(function (a, b) { return b.prio - a.prio; });
    var chosen = [];
    for (var k = 0; k < order.length && chosen.length < target; k++) {
      var c = order[k];
      var pos = lowerBound(chosen, c.t, function (n) { return n.t; });
      var prev = chosen[pos - 1], next = chosen[pos];
      var gap = minGap;
      if (useMap) {
        var localBeat = 60 / tempoMap[sectionIndexAt(tempoMap, c.t)].bpm;
        gap = Math.max(cfg.minGapAbs || 0, localBeat / Math.max(1, cfg.subdivLimit) * 0.90);
      }
      if (prev && c.t - prev.t < gap - 1e-6) continue;
      if (next && next.t - c.t < gap - 1e-6) continue;
      var a = lowerBound(chosen, c.t - 2, function (n) { return n.t; });
      var b = lowerBound(chosen, c.t + 2, function (n) { return n.t; });
      if (b - a >= windowCap) continue;
      chosen.splice(pos, 0, c);
    }
    return chosen;
  }

  /** 補齊連續音群：讓 16 分連打不會缺一顆，聽起來更順 */
  function fillRuns(chosen, slots, cfg, beat) {
    if (cfg.subdivLimit < 4 || chosen.length < 3) return chosen;
    var byIndex = {};
    slots.forEach(function (s) { byIndex[s.i] = s; });
    var have = {};
    chosen.forEach(function (c) { have[c.i] = true; });
    var added = [];
    var maxAdd = Math.round(chosen.length * 0.10);

    for (var k = 1; k < chosen.length && added.length < maxAdd; k++) {
      var a = chosen[k - 1], b = chosen[k];
      if (b.i - a.i !== 2) continue;                       // 中間剛好缺一個 16 分
      var mid = byIndex[a.i + 1];
      if (!mid || have[mid.i]) continue;
      var neighbourRun = (k >= 2 && chosen[k - 1].i - chosen[k - 2].i <= 2) ||
        (k + 1 < chosen.length && chosen[k + 1].i - chosen[k].i <= 2);
      if (!neighbourRun) continue;
      if (mid.s < Math.min(a.s, b.s) * 0.42) continue;
      added.push({
        slot: mid, i: mid.i, t: mid.t, s: mid.s, rel: 0.6, hiRatio: mid.hiRatio,
        lo: mid.lo, onBeat: (mid.i % 4) === 0, onDown: (mid.i % 16) === 0, filled: true
      });
      have[mid.i] = true;
    }
    if (!added.length) return chosen;
    var out = chosen.concat(added);
    out.sort(function (p, q) { return p.t - q.t; });
    return out;
  }

  /* ================================================================== *
   * 8. 咚 / 咔 指派
   * ================================================================== */

  function assignColors(notes, cfg, step, rand, tempoMap) {
    if (!notes.length) return;
    var ratios = notes.map(function (n) { return n.hiRatio; }).sort(function (a, b) { return a - b; });
    var thr = quantile(ratios, cfg.donRatio);

    notes.forEach(function (n) {
      n.ka = n.hiRatio > thr;
    });

    // 小節首拍偏向「咚」（低頻通常是大鼓）
    notes.forEach(function (n) {
      if (n.onDown && n.lo > 0.22) n.ka = false;
    });

    // 16 分連打：以「兩顆一組」統一顏色，形成 どどかか 這類太鼓經典手順
    var i = 0;
    var useMap = tempoMap && tempoMap.length > 1;
    while (i < notes.length) {
      var j = i;
      while (j + 1 < notes.length) {
        var st = step;
        if (useMap) {
          var si = sectionIndexAt(tempoMap, notes[j].t);
          st = (60 / tempoMap[si].bpm) / SUBDIV;
        }
        if (Math.abs((notes[j + 1].t - notes[j].t) - st) >= st * 0.34) break;
        j++;
      }
      var len = j - i + 1;
      if (len >= 6) {
        for (var g = i; g <= j; g += 2) {
          if (g + 1 <= j) {
            var vote = (notes[g].hiRatio + notes[g + 1].hiRatio) / 2 > thr;
            notes[g].ka = vote; notes[g + 1].ka = vote;
          }
        }
      }
      i = j + 1;
    }

    // 避免整首單一顏色（之後還要再套一次同色上限，避免這裡又拉長連續）
    var kaCount = notes.filter(function (n) { return n.ka; }).length;
    if (kaCount < notes.length * 0.12) {
      notes.forEach(function (n, idx) { if (idx % 4 === 2 && rand() < 0.7) n.ka = true; });
    }

    limitColorRuns(notes, cfg.maxRun);
  }

  /** 把同色連續截到 maxRun 顆（最後一步，確保參數一定生效） */
  function limitColorRuns(notes, maxRun) {
    var cap = Math.max(1, maxRun || 4);
    var run = 1;
    for (var k = 1; k < notes.length; k++) {
      if (notes[k].ka === notes[k - 1].ka) {
        run++;
        if (run > cap) {
          notes[k].ka = !notes[k].ka;
          run = 1;
        }
      } else run = 1;
    }
  }

  /* ================================================================== *
   * 9. 大音符
   * ================================================================== */

  function assignBigNotes(notes, cfg, beat) {
    var count = Math.round(notes.length * cfg.bigRate);
    if (count < 1) return;
    // 密度高的難度本來就少有大空隙，門檻要跟著放寬，否則整首只會有一兩顆大音符
    var gapNeed = beat * (cfg.bigGapBeats === undefined ? 0.9 : cfg.bigGapBeats);
    var cands = [];
    for (var i = 0; i < notes.length; i++) {
      var n = notes[i];
      var prevGap = i > 0 ? n.t - notes[i - 1].t : 99;
      var nextGap = i < notes.length - 1 ? notes[i + 1].t - n.t : 99;
      if (prevGap < gapNeed || nextGap < gapNeed * 0.62) continue;
      var phraseEnd = nextGap > beat * 1.8 ? 0.5 : 0;
      cands.push({ n: n, score: n.s + phraseEnd + (n.onDown ? 0.3 : 0) });
    }
    cands.sort(function (a, b) { return b.score - a.score; });
    var placedTimes = [];
    var minSep = beat * 4;
    for (var pass = 0; pass < 2 && placedTimes.length < count; pass++) {
      // 第一輪維持間隔，若數量還不夠再放寬
      var sep = pass === 0 ? minSep : beat * 1.5;
      for (var k = 0; k < cands.length && placedTimes.length < count; k++) {
        var n2 = cands[k].n;
        if (n2.big) continue;
        var tooClose = false;
        for (var m = 0; m < placedTimes.length; m++) {
          if (Math.abs(n2.t - placedTimes[m]) < sep) { tooClose = true; break; }
        }
        if (tooClose) continue;
        n2.big = true;
        placedTimes.push(n2.t);
      }
    }
  }

  /* ================================================================== *
   * 10. 連打 / 風船
   * ================================================================== */

  /**
   * 掃描整首歌，找出「音樂本身最安靜」的小節放連打。
   *
   * 不能用「已選音符之間的空隙」來找：鬼難度會把空隙都填滿，
   * 結果整首一個連打都排不出來。改成直接看量化後的起音點強度，
   * 這樣四種難度的連打會落在同樣的音樂段落，跟原作的做法一致。
   */
  function addRolls(slots, cfg, beat, measureOffset, playFrom, playTo, rand, tempoMap) {
    var rolls = [];
    var span = playTo - playFrom;
    if (span < 12 || slots.length < 8) return rolls;
    var budget = clamp(Math.round(span / cfg.rollEvery), 1, 7);
    var seg = span / budget;
    var minSpacing = Math.max(6, seg * 0.45);

    // 前綴和，讓任意區間的起音強度都能 O(log n) 取得
    var slotT = function (s) { return s.t; };
    var cum = new Float64Array(slots.length + 1);
    for (var ci = 0; ci < slots.length; ci++) cum[ci + 1] = cum[ci] + slots[ci].s;
    function strengthIn(a, b) {
      return cum[lowerBound(slots, b, slotT)] - cum[lowerBound(slots, a, slotT)];
    }
    function perBeat(a, b) {
      a = Math.max(a, playFrom); b = Math.min(b, playTo);
      if (b - a < beat) return 0;
      return strengthIn(a, b) / ((b - a) / beat);
    }

    var avgPerBeat = perBeat(playFrom, playTo);
    if (avgPerBeat <= 0) return rolls;

    var lens = [8, 6, 4, 3, 2];
    var cands = [];
    var useMap = tempoMap && tempoMap.length > 1;
    var b0 = useMap ? 0 : Math.ceil((playFrom + beat - measureOffset) / beat);
    var b1 = useMap ? -1 : Math.floor((playTo - beat - measureOffset) / beat);
    if (useMap) {
      for (var s = 0; s < tempoMap.length; s++) {
        var secBeat = 60 / tempoMap[s].bpm;
        var secStart = tempoMap[s].t;
        var secEnd = s + 1 < tempoMap.length ? tempoMap[s + 1].t : playTo;
        var fromT = Math.max(playFrom, secStart);
        var lastT = Math.min(playTo, secEnd);
        var sb0 = Math.ceil((fromT + secBeat - secStart) / secBeat - 1e-12);
        var sb1 = Math.floor((lastT - secBeat - secStart) / secBeat + 1e-12);
        if (sb0 < 0) sb0 = 0;
        for (var sb = sb0; sb <= sb1; sb++) {
          var st = secStart + sb * secBeat;
          if (st >= secEnd - 1e-9) continue;
          var sref = Math.max(perBeat(st - 15, st + 15), avgPerBeat);
          for (var sli = 0; sli < lens.length; sli++) {
            var sL = lens[sli], sdur = sL * secBeat;
            if (st + sdur > playTo - secBeat * 0.5) continue;
            if (st + sdur > secEnd - 1e-9) continue;
            var sdens = strengthIn(st - secBeat * 0.3, st + sdur + secBeat * 0.3) / sL;
            if (sdens > avgPerBeat * 1.35) continue;
            cands.push({
              t: st, dur: sdur, ratio: sdens / sref,
              score: sdens / sref - sL * 0.007 - ((((sb % 4) + 4) % 4) === 0 ? 0.04 : 0)
            });
          }
        }
      }
    }
    for (var b = b0; b <= b1; b++) {
      var t = measureOffset + b * beat;
      // 全曲平均與鄰近 ±15 秒兩個基準取寬鬆者。
      // 只看全曲平均，後半段整體較吵時那裡永遠選不出位置；
      // 只看鄰近段落，整段都很安靜的地方又會因為「跟鄰居一樣安靜」而落選。
      var ref = Math.max(perBeat(t - 15, t + 15), avgPerBeat);
      for (var li = 0; li < lens.length; li++) {
        var L = lens[li], dur = L * beat;
        if (t + dur > playTo - beat * 0.5) continue;
        var dens = strengthIn(t - beat * 0.3, t + dur + beat * 0.3) / L;
        if (dens > avgPerBeat * 1.35) continue;   // 絕對音量太大的地方仍然不放
        cands.push({
          t: t, dur: dur, ratio: dens / ref,
          // 加權要小，只在安靜程度接近時才用來決勝負，
          // 否則每個連打都會變成同樣的最長長度
          score: dens / ref - L * 0.007 - ((((b % 4) + 4) % 4) === 0 ? 0.04 : 0)
        });
      }
    }
    cands.sort(function (a, b2) { return a.score - b2.score; });

    // 把歌曲切成 budget 段，每段各挑一個最安靜的位置，
    // 連打才會平均散布在整首歌，而不是全部擠在最安靜的那一段。
    // 第一輪只收明顯安靜的；第二輪對還空著的時段放寬門檻補一次。
    var chosen = [];
    var filled = [];
    [0.72, 0.92].forEach(function (thr) {
      for (var si = 0; si < budget; si++) {
        if (filled[si]) continue;
        var segA = playFrom + si * seg, segB = segA + seg;
        for (var k = 0; k < cands.length; k++) {
          var c = cands[k];
          if (c.t < segA || c.t >= segB || c.ratio > thr) continue;
          var clash = false;
          for (var j = 0; j < chosen.length; j++) {
            if (c.t < chosen[j].t + chosen[j].dur + minSpacing &&
              c.t + c.dur + minSpacing > chosen[j].t) { clash = true; break; }
          }
          if (clash) continue;
          chosen.push(c);
          filled[si] = true;
          break;    // cands 已依 score 排序，段內第一個合格的就是最佳解
        }
      }
    });
    chosen.sort(function (a, b3) { return a.t - b3.t; });

    chosen.forEach(function (r, idx) {
      var isBalloon = (idx % 2 === 1) && cfg.subdivLimit >= 1 && r.dur >= beat * 2;
      if (isBalloon) {
        rolls.push({
          t: r.t, type: 7, dur: r.dur,
          hits: clamp(Math.round(r.dur * cfg.balloonRate), 3, 45)
        });
      } else {
        var big = r.dur >= beat * 4 && rand() < 0.4;
        rolls.push({ t: r.t, type: big ? 6 : 5, dur: r.dur, hits: 0 });
      }
    });
    return rolls;
  }

  /* ================================================================== *
   * 11. ★難易度、配點
   * ================================================================== */

  function computeStats(taps, rolls, playFrom, playTo, beat) {
    var span = Math.max(1, playTo - playFrom);
    var density = taps.length / span;
    // 峰值密度：4 秒滑動視窗
    var peak = 0;
    for (var i = 0; i < taps.length; i++) {
      var a = lowerBound(taps, taps[i].t, function (n) { return n.t; });
      var b = lowerBound(taps, taps[i].t + 4, function (n) { return n.t; });
      if (b - a > peak) peak = b - a;
    }
    peak = peak / 4;
    var sixteenth = 0;
    for (var k = 1; k < taps.length; k++) {
      if (taps[k].t - taps[k - 1].t < beat * 0.31) sixteenth++;
    }
    var maxColorRun = 0, colorRun = 0, lastKa = null;
    for (var ci = 0; ci < taps.length; ci++) {
      if (lastKa !== null && taps[ci].ka === lastKa) colorRun++;
      else colorRun = 1;
      lastKa = taps[ci].ka;
      if (colorRun > maxColorRun) maxColorRun = colorRun;
    }
    return {
      notes: taps.length,
      rolls: rolls.length,
      density: density,
      peakDensity: peak,
      sixteenthRatio: taps.length ? sixteenth / taps.length : 0,
      maxColorRun: maxColorRun
    };
  }

  function estimateLevel(stats, cfg) {
    var raw = cfg.lvBase + cfg.lvK1 * stats.density + cfg.lvK2 * stats.peakDensity +
      cfg.lvK3 * stats.sixteenthRatio;
    return clamp(Math.round(raw), cfg.minLevel, cfg.maxLevel);
  }

  /** 依照太鼓經典連段加成，反推每顆音符基礎配分，使全良約 100 萬 */
  function comboBonus(combo) {
    if (combo < 10) return 0;
    if (combo < 30) return 100;
    if (combo < 50) return 200;
    if (combo < 100) return 400;
    if (combo < 200) return 800;
    if (combo < 300) return 1000;
    return 1300;
  }

  function computeScoreInit(taps, rolls) {
    var n = taps.length;
    if (!n) return 1000;
    var bonusTotal = 0, weight = 0;
    for (var i = 0; i < n; i++) {
      bonusTotal += comboBonus(i + 1);
      weight += taps[i].big ? 2 : 1;
    }
    var rollBonus = (rolls || []).reduce(function (acc, r) {
      return acc + (r.type === 7 ? 5000 + (r.hits || 0) * 100 : Math.round((r.dur || 0) * 8) * 100);
    }, 0);
    var target = 1000000 - bonusTotal - rollBonus * 0.5;
    var base = Math.max(100, Math.round(target / Math.max(1, weight) / 10) * 10);
    return base;
  }

  /** 依 BPM 決定捲動速度，讓音符在畫面上停留 1.3~2.4 秒 */
  function defaultScroll(bpm) {
    var natural = 4 * 60 / bpm;                 // 一小節秒數
    var travel = clamp(natural, 1.30, 2.40);
    return Math.round(natural / travel * 100) / 100;
  }

  /* ================================================================== *
   * 12. 組裝單一難度譜面
   * ================================================================== */

  function buildChart(analysis, diffKey, overrides) {
    var base = DIFFS[diffKey];
    var cfg = {};
    for (var k in base) cfg[k] = base[k];
    if (overrides) for (var k2 in overrides) if (overrides[k2] !== undefined) cfg[k2] = overrides[k2];

    var beat = 60 / analysis.bpm;
    var rand = rng(
      Math.round(analysis.bpm * 1000) + diffKey.length * 7717 +
      Math.round((cfg.density || 0) * 1000) + (cfg.maxRun || 0) * 97 +
      Math.round((cfg.donRatio || 0) * 1000) + (cfg.subdivLimit || 0) * 13
    );
    var q = analysis.quant;
    var tempoMap = analysis.tempoMap && analysis.tempoMap.length > 1 ? analysis.tempoMap : null;

    var chosen = selectNotes(q.slots, cfg, beat, analysis.playFrom, analysis.playTo, tempoMap);
    chosen = fillRuns(chosen, q.slots, cfg, beat);
    assignColors(chosen, cfg, q.step, rand, tempoMap);
    assignBigNotes(chosen, cfg, beat);

    var rolls = addRolls(q.slots, cfg, beat, analysis.measureOffset,
      analysis.playFrom, analysis.playTo, rand, tempoMap);

    // 移除與連打重疊的音符
    var taps = chosen.filter(function (n) {
      for (var i = 0; i < rolls.length; i++) {
        if (n.t > rolls[i].t - beat * 0.4 && n.t < rolls[i].t + rolls[i].dur + beat * 0.4) return false;
      }
      return true;
    });

    var stats = computeStats(taps, rolls, analysis.playFrom, analysis.playTo, beat);
    var level = estimateLevel(stats, cfg);
    var scoreInit = computeScoreInit(taps, rolls);

    // 輸出（TJA 相容的音符代碼）
    var out = [];
    taps.forEach(function (n) {
      out.push({ t: n.t, type: n.big ? (n.ka ? 4 : 3) : (n.ka ? 2 : 1) });
    });
    rolls.forEach(function (r) {
      out.push({ t: r.t, type: r.type, dur: r.dur, hits: r.hits });
    });
    out.sort(function (a, b) { return a.t - b.t; });

    return {
      level: level,
      scoreInit: scoreInit,
      scroll: defaultScroll(analysis.bpm),
      normaRate: cfg.normaRate,
      missMult: cfg.missMult,
      strictJudge: cfg.strictJudge,
      notes: out,
      stats: stats
    };
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  /**
   * 依難度譜面＋目標★，產出一組生成參數。
   * 星等越高：越密、越細、越少過濾、同色連續可以更長。
   */
  function paramsForStar(diffKey, star) {
    var base = DIFFS[diffKey];
    if (!base) return {};
    star = clamp(Math.round(Number(star) || base.minLevel), 1, 10);
    var t = (star - base.minLevel) / Math.max(1, base.maxLevel - base.minLevel);
    t = clamp(t, -0.2, 1.4);

    var subdiv;
    if (diffKey === 'easy') subdiv = star >= 5 ? 2 : 1;
    else if (diffKey === 'normal') subdiv = star >= 6 ? 4 : star >= 4 ? 2 : 1;
    else if (diffKey === 'hard') subdiv = star >= 5 ? 4 : 2;
    else subdiv = star >= 6 ? 4 : 2;

    var dens = { easy: [0.55, 1.85], normal: [1.10, 2.90], hard: [2.00, 4.20], oni: [2.80, 6.40] };
    var gaps = { easy: [0.42, 0.22], normal: [0.28, 0.14], hard: [0.16, 0.085], oni: [0.12, 0.055] };
    var dR = dens[diffKey] || dens.oni;
    var gR = gaps[diffKey] || gaps.oni;

    return {
      density: Math.round(lerp(dR[0], dR[1], t) * 100) / 100,
      subdivLimit: subdiv,
      relFloor: Math.round(lerp(0.68, Math.max(0.08, base.relFloor * 0.65), t) * 100) / 100,
      peakFactor: Math.round(lerp(1.35, base.peakFactor + 0.35, t) * 100) / 100,
      maxRun: Math.round(lerp(2, Math.min(10, base.maxRun + 2), t)),
      bigRate: Math.round(lerp(base.bigRate * 1.35, Math.max(0.008, base.bigRate * 0.55), t) * 1000) / 1000,
      donRatio: base.donRatio,
      rollEvery: Math.round(lerp(base.rollEvery * 0.75, base.rollEvery * 1.15, t)),
      minGapAbs: Math.round(lerp(gR[0], gR[1], t) * 1000) / 1000,
      metricBonus: Math.round(lerp(base.metricBonus * 1.15, base.metricBonus * 0.45, t) * 100) / 100,
      targetLevel: star
    };
  }

  /** 套用目標★參數並微調密度，讓譜面接近該星等；匯出的 level 以玩家選的為準 */
  function buildChartForStar(analysis, diffKey, star, extraOverrides) {
    var preset = paramsForStar(diffKey, star);
    var overrides = {};
    var k;
    for (k in preset) overrides[k] = preset[k];
    if (extraOverrides) {
      for (k in extraOverrides) {
        if (extraOverrides[k] !== undefined && k !== 'targetLevel') overrides[k] = extraOverrides[k];
      }
    }
    var chart = buildChart(analysis, diffKey, overrides);
    for (var i = 0; i < 6 && chart.level !== star; i++) {
      if (chart.level < star) {
        overrides.density = Math.min(9, overrides.density * 1.12);
        overrides.relFloor = Math.max(0.06, overrides.relFloor * 0.90);
      } else {
        overrides.density = Math.max(0.4, overrides.density * 0.90);
        overrides.relFloor = Math.min(0.78, overrides.relFloor + 0.035);
      }
      chart = buildChart(analysis, diffKey, overrides);
    }
    chart.level = star;
    if (chart.stats) chart.stats.targetLevel = star;
    chart.usedParams = overrides;
    return chart;
  }

  /* ================================================================== *
   * 13. 對外 API
   * ================================================================== */

  /** 分析音訊，回傳可重複使用的分析結果（改參數重新生成譜面時不需重算） */
  function analyzeBuffer(audioBuffer, opts, onProgress) {
    opts = opts || {};
    onProgress = onProgress || function () { };
    onProgress(0.02, '準備音訊');

    var mono = toMono(audioBuffer, SR);
    var x = mono.data, sr = mono.rate;

    return nextTick().then(function () {
      return computeFlux(x, sr, function (p) { onProgress(0.05 + p * 0.55, '分析頻譜'); });
    }).then(function (F) {
      onProgress(0.62, '偵測起音點');
      var od = pickOnsets(F, x, sr, opts);
      var onsets = od.onsets;

      // 有聲區間
      var maxR = 0, i;
      for (i = 0; i < F.rms.length; i++) if (F.rms[i] > maxR) maxR = F.rms[i];
      var thr = maxR * 0.045;
      var a = 0, b = F.rms.length - 1;
      while (a < F.rms.length && F.rms[a] < thr) a++;
      while (b > a && F.rms[b] < thr) b--;
      var audioFrom = a * HOP / sr;
      var audioTo = Math.min(audioBuffer.duration, (b * HOP + FRAME) / sr);

      onProgress(0.72, '估算 BPM');
      var tempo = opts.bpm
        ? { bpm: opts.bpm, confidence: 1, forced: true }
        : estimateTempo(od.env, F.fps, opts);

      onProgress(0.86, '對齊節拍');
      var phase = estimatePhase(onsets, tempo.bpm);
      if (opts.offset !== undefined && opts.offset !== null) {
        phase.offset = opts.offset;
        phase.measureOffset = opts.offset;
      }

      // 讓 measureOffset 落在音訊開頭之前的最近位置
      var beat = 60 / tempo.bpm;
      var mo = phase.measureOffset;
      while (mo - beat * 4 > 0) mo -= beat * 4;

      var quant = buildSlots(onsets, tempo.bpm, mo);
      var bpmChanges = null;
      var tempoMap = null;
      if (opts.bpmChanges && opts.bpmChanges.length) {
        var later = laterBpmChanges(mo, opts.bpmChanges);
        if (later.length) {
          bpmChanges = later;
          tempoMap = normalizeBpmChanges(tempo.bpm, mo, later);
          quant = buildSlots(onsets, tempo.bpm, mo, later);
        }
      }

      onProgress(0.95, '量化節奏');

      // 波形縮圖（100Hz 峰值），供生成器繪圖
      var wfRate = 100;
      var wfLen = Math.ceil(audioBuffer.duration * wfRate);
      var wf = new Float32Array(wfLen);
      var blk = Math.floor(sr / wfRate);
      for (i = 0; i < wfLen; i++) {
        var o = i * blk, m = 0;
        for (var j = 0; j < blk; j += 3) {
          var v = Math.abs(x[o + j] || 0);
          if (v > m) m = v;
        }
        wf[i] = m;
      }

      onProgress(1, '完成');
      var result = {
        duration: audioBuffer.duration,
        sampleRate: sr,
        bpm: tempo.bpm,
        bpmConfidence: tempo.confidence,
        offset: phase.offset,
        measureOffset: mo,
        beatStrength: phase.beatStrength,
        onsets: onsets,
        env: od.env,
        fps: F.fps,
        rms: F.rms,
        quant: quant,
        playFrom: audioFrom,
        playTo: audioTo,
        waveform: wf,
        waveformRate: wfRate
      };
      if (bpmChanges) {
        result.bpmChanges = bpmChanges;
        result.tempoMap = tempoMap;
      }
      return result;
    });
  }

  /**
   * 改變 BPM / 節拍起點後重新量化。
   * 不需要重跑頻譜分析，所以在生成器裡調參數是即時的。
   */
  function requantize(analysis, bpm, measureOffset, changes) {
    analysis.bpm = bpm;
    var beat = 60 / bpm;
    var mo = measureOffset;
    while (mo - beat * 4 > 0) mo -= beat * 4;
    while (mo < -1e-6) mo += beat * 4;
    analysis.measureOffset = mo;
    analysis.offset = mo;
    var later = null;
    if (arguments.length >= 4) later = laterBpmChanges(mo, changes);
    else if (analysis.bpmChanges && analysis.bpmChanges.length) later = laterBpmChanges(mo, analysis.bpmChanges);
    if (later && later.length) {
      analysis.bpmChanges = later;
      analysis.tempoMap = normalizeBpmChanges(bpm, mo, later);
      analysis.quant = buildSlots(analysis.onsets, bpm, mo, later);
    } else {
      if (arguments.length >= 4 || analysis.bpmChanges) {
        delete analysis.bpmChanges;
        delete analysis.tempoMap;
      }
      analysis.quant = buildSlots(analysis.onsets, bpm, mo);
    }
    return analysis;
  }

  /** 匯出用。沒有變速點時回傳 null，JSON 就不會多出這個欄位。 */
  function listBpmChanges(bpm, measureOffset, changes) {
    var later = laterBpmChanges(measureOffset, changes);
    if (!later.length) return null;
    var out = [];
    for (var i = 0; i < later.length; i++) {
      out.push({
        t: Math.round(later[i].t * 1000) / 1000,
        bpm: Math.round(later[i].bpm * 100) / 100
      });
    }
    return out;
  }

  /**
   * 小節線時間。沒有變速點時與遊戲原本的迴圈相同：
   * for (bt = offset; bt < endT + 4; bt += beat * 4)
   */
  function barTimes(offset, bpm, endT, changes) {
    var tempo = normalizeBpmChanges(bpm, offset, changes);
    var limit = endT + 4;
    var bars = [];
    if (tempo.length === 1) {
      var beat = 60 / tempo[0].bpm;
      for (var bt = tempo[0].t; bt < limit; bt += beat * 4) {
        if (bt > -4) bars.push(bt);
      }
      return bars;
    }
    for (var s = 0; s < tempo.length; s++) {
      var barLen = 60 / tempo[s].bpm * 4;
      var end = s + 1 < tempo.length ? tempo[s + 1].t : limit;
      var cap = end < limit ? end : limit;
      for (var i = 0; ; i++) {
        var t = tempo[s].t + i * barLen;
        if (t >= cap - 1e-9) break;
        if (t > -4) bars.push(t);
      }
    }
    return bars;
  }

  /** 從第一小節起算的拍數（含小數）。單段時等於 (time - offset) / beat。 */
  function beatAt(map, time) {
    if (!map || !map.length) return 0;
    var acc = 0;
    for (var s = 0; s < map.length; s++) {
      var beat = 60 / map[s].bpm;
      var end = s + 1 < map.length ? map[s + 1].t : Infinity;
      if (time < end) return acc + (time - map[s].t) / beat;
      acc += (end - map[s].t) / beat;
    }
    var last = map[map.length - 1];
    return acc + (time - last.t) / (60 / last.bpm);
  }

  /** 第 index 拍（整數，可為負）的秒數。index 0 是第一小節起點。 */
  function beatTimeAt(map, index) {
    var left = index;
    for (var s = 0; s < map.length; s++) {
      var beat = 60 / map[s].bpm;
      var end = s + 1 < map.length ? map[s + 1].t : Infinity;
      var span = (end - map[s].t) / beat;
      if (left < span - 1e-9 || s === map.length - 1) return map[s].t + left * beat;
      left -= span;
    }
    return map[0].t;
  }

  /** 大於等於 from 的最小拍號，對應原本的 Math.ceil((from - offset) / beat)。 */
  function beatIndexAt(map, from) {
    var lo = -1000000;
    var hi = 1000000;
    while (lo < hi) {
      var mid = Math.floor((lo + hi) / 2);
      if (beatTimeAt(map, mid) < from - 1e-9) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function beatIsDownbeat(map, index) {
    var t = beatTimeAt(map, index);
    var si = sectionIndexAt(map, t);
    var beat = 60 / map[si].bpm;
    var local = Math.round((t - map[si].t) / beat);
    return ((local % 4) + 4) % 4 === 0;
  }

  /** 把一個時間吸到所在段落的 16 分格線。交界正拍屬於下一段。 */
  function snapTime(offset, bpm, time, changes) {
    var tempo = normalizeBpmChanges(bpm, offset, changes);
    if (tempo.length === 1) {
      var gstep = 60 / tempo[0].bpm / SUBDIV;
      var idx = Math.round((time - tempo[0].t) / gstep);
      return tempo[0].t + idx * gstep;
    }
    var si = sectionIndexAt(tempo, time);
    var sec = tempo[si];
    var step = (60 / sec.bpm) / SUBDIV;
    var local = Math.round((time - sec.t) / step);
    var gt = sec.t + local * step;
    var nextT = si + 1 < tempo.length ? tempo[si + 1].t : Infinity;
    if (si > 0 && gt < sec.t) gt = sec.t;
    if (gt >= nextT - 1e-9) {
      gt = sec.t + (local - 1) * step;
      if (gt < sec.t) gt = sec.t;
    }
    return gt;
  }

  /** 譜面被手動編輯後，重新計算配點讓全良仍約為 100 萬分 */
  function rescore(notes) {
    var taps = [], rolls = [];
    notes.forEach(function (n) {
      var arr = Array.isArray(n) ? n : [n.t, n.type, n.dur, n.hits];
      if (arr[1] >= 5) rolls.push({ t: arr[0], type: arr[1], dur: arr[2] || 0, hits: arr[3] || 0 });
      else taps.push({ t: arr[0], big: arr[1] === 3 || arr[1] === 4 });
    });
    return computeScoreInit(taps, rolls);
  }

  /** 依分析結果一次生成四種難度 */
  function generateAll(analysis, overridesByDiff) {
    var charts = {};
    DIFF_ORDER.forEach(function (d) {
      charts[d] = buildChart(analysis, d, (overridesByDiff || {})[d]);
    });
    return charts;
  }

  /** 一步到位：AudioBuffer → 完整譜面資料 */
  function generateFromBuffer(audioBuffer, opts, onProgress) {
    return analyzeBuffer(audioBuffer, opts, onProgress).then(function (an) {
      return {
        analysis: an,
        data: packSongData(an, generateAll(an, (opts || {}).diffs), opts || {})
      };
    });
  }

  /** 打包成可存檔 / 可被遊戲讀取的 JSON 結構 */
  function packSongData(analysis, charts, meta) {
    var out = {
      format: 'mkpc-taiko-chart',
      version: 1,
      id: meta.id || 'song',
      title: meta.title || '',
      titleZh: meta.titleZh || '',
      subtitle: meta.subtitle || '',
      subtitleZh: meta.subtitleZh || '',
      audio: meta.audio || '',
      bpm: Math.round(analysis.bpm * 100) / 100,
      offset: Math.round(analysis.measureOffset * 1000) / 1000,
      duration: Math.round(analysis.duration * 100) / 100,
      demoStart: Math.round(Math.min(analysis.playFrom + 20, analysis.duration * 0.35) * 10) / 10,
      generatedAt: new Date().toISOString(),
      charts: {}
    };
    var packedChanges = listBpmChanges(analysis.bpm, analysis.measureOffset, analysis.bpmChanges);
    if (packedChanges) out.bpmChanges = packedChanges;
    DIFF_ORDER.forEach(function (d) {
      var c = charts[d];
      if (!c) return;
      out.charts[d] = {
        level: c.level,
        scoreInit: c.scoreInit,
        scroll: c.scroll,
        notes: c.notes.map(function (n) {
          var t = Math.round(n.t * 1000) / 1000;
          if (n.type === 7) return [t, n.type, Math.round(n.dur * 1000) / 1000, n.hits];
          if (n.type === 5 || n.type === 6) return [t, n.type, Math.round(n.dur * 1000) / 1000];
          return [t, n.type];
        }),
        stats: {
          notes: c.stats.notes,
          rolls: c.stats.rolls,
          density: Math.round(c.stats.density * 100) / 100,
          peakDensity: Math.round(c.stats.peakDensity * 100) / 100,
          maxColorRun: c.stats.maxColorRun || 0
        }
      };
    });
    return out;
  }

  /** 把緊湊陣列格式展開成遊戲用物件 */
  function expandNotes(arr) {
    return arr.map(function (a) {
      if (Array.isArray(a)) {
        return { t: a[0], type: a[1], dur: a[2] || 0, hits: a[3] || 0 };
      }
      return { t: a.t, type: a.type, dur: a.dur || 0, hits: a.hits || 0 };
    });
  }

  /* ================================================================== */

  global.TaikoChartGen = {
    SR: SR, FRAME: FRAME, HOP: HOP, SUBDIV: SUBDIV,
    DIFFS: DIFFS, DIFF_ORDER: DIFF_ORDER,
    analyzeBuffer: analyzeBuffer,
    generateAll: generateAll,
    buildChart: buildChart,
    paramsForStar: paramsForStar,
    buildChartForStar: buildChartForStar,
    requantize: requantize,
    normalizeBpmChanges: normalizeBpmChanges,
    listBpmChanges: listBpmChanges,
    barTimes: barTimes,
    beatAt: beatAt,
    beatTimeAt: beatTimeAt,
    beatIndexAt: beatIndexAt,
    beatIsDownbeat: beatIsDownbeat,
    snapTime: snapTime,
    rescore: rescore,
    generateFromBuffer: generateFromBuffer,
    packSongData: packSongData,
    expandNotes: expandNotes,
    defaultScroll: defaultScroll,
    comboBonus: comboBonus,
    computeScoreInit: computeScoreInit,
    estimateTempo: estimateTempo,
    estimatePhase: estimatePhase,
    buildSlots: buildSlots,
    toMono: toMono,
    utils: { clamp: clamp, quantile: quantile, lowerBound: lowerBound, rng: rng }
  };
})(window);
