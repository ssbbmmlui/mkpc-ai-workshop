/* =============================================================================
 * audio.js — 音訊引擎
 *   ・以 Web Audio API 播放歌曲，取得取樣級精準的時間軸（HTMLAudio 會漂移）
 *   ・支援 GitHub blob 連結自動轉 raw 連結
 *   ・咚、咔、氣球爆破播放 assets 裡的音效檔
 *   ・選單音與節拍器仍以合成方式產生
 * ===========================================================================*/
(function (global) {
  'use strict';

  var ctx = null;
  var master = null, musicGain = null, sfxGain = null;
  var bufferCache = {};

  var settings = {
    music: 0.75,
    sfx: 0.92,
    offsetMs: 0          // 音訊延遲校正（正值＝判定往後）
  };

  try {
    var saved = JSON.parse(localStorage.getItem('taiko.audio') || '{}');
    for (var k in saved) if (k in settings) settings[k] = saved[k];
  } catch (e) { /* localStorage 不可用時忽略 */ }

  function saveSettings() {
    try { localStorage.setItem('taiko.audio', JSON.stringify(settings)); } catch (e) { }
  }

  function isAppleTouch() {
    try {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    } catch (e) { return false; }
  }

  /**
   * iPad 聽到的聲音比 currentTime 晚。
   * Safari 的 outputLatency 常常只有 callback 緩衝（20–40ms），不含喇叭，
   * 若照單全收，判定會偏晚，手感像「慢半拍」。
   */
  function hardwareLatency() {
    if (!ctx) return 0;
    var base = ctx.baseLatency || 0;
    var out = ctx.outputLatency || 0;
    var sum = base + out;
    if (isAppleTouch()) return Math.min(0.22, Math.max(sum, 0.10));
    if (sum > 0.012) return Math.min(0.22, sum);
    return 0;
  }

  var keepAlive = null;
  function ensureKeepAlive() {
    if (!ctx || keepAlive) return;
    try {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      g.gain.value = 0.00008;
      osc.frequency.value = 20;
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      keepAlive = osc;
    } catch (e) { /* 保活失敗不影響遊玩 */ }
  }

  function init() {
    if (ctx) return ctx;
    var AC = global.AudioContext || global.webkitAudioContext;
    try { ctx = new AC({ latencyHint: 'interactive' }); }
    catch (e) { ctx = new AC(); }
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = settings.music;
    musicGain.connect(master);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = settings.sfx;
    sfxGain.connect(master);
    ensureKeepAlive();
    decodeReadyHits();
    return ctx;
  }

  function resume() {
    init();
    var p = (ctx.state === 'suspended' && ctx.resume) ? ctx.resume() : Promise.resolve();
    return Promise.resolve(p).then(function () { ensureKeepAlive(); });
  }

  function setVolume(kind, v) {
    init();
    settings[kind] = v;
    (kind === 'music' ? musicGain : sfxGain).gain.value = v;
    saveSettings();
  }

  /* ------------------------------------------------------------------ *
   * 網址處理：GitHub blob → raw
   * ------------------------------------------------------------------ */

  function toRawUrl(url) {
    if (!url) return url;
    url = url.trim();
    // https://github.com/{user}/{repo}/blob/{ref}/{path}
    var m = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/i);
    if (m) return 'https://raw.githubusercontent.com/' + m[1] + '/' + m[2] + '/' + m[3];
    // https://github.com/{user}/{repo}/raw/{ref}/{path}
    m = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/raw\/(.+)$/i);
    if (m) return 'https://raw.githubusercontent.com/' + m[1] + '/' + m[2] + '/' + m[3];
    return url;
  }

  /* ------------------------------------------------------------------ *
   * 載入 / 解碼
   * ------------------------------------------------------------------ */

  function fetchArrayBuffer(url, onProgress) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function (e) {
        if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total);
      };
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
        else reject(new Error('HTTP ' + xhr.status + ' — ' + url));
      };
      xhr.onerror = function () {
        var prefix = (global.TKI18n && global.TKI18n.t) ? global.TKI18n.t('audioFail') : 'Could not download audio: ';
        reject(new Error(prefix + url));
      };
      xhr.send();
    });
  }

  function decode(arrayBuffer) {
    init();
    return new Promise(function (resolve, reject) {
      var p = ctx.decodeAudioData(arrayBuffer, resolve, reject);
      if (p && p.then) p.then(resolve, reject);
    });
  }

  /** 載入歌曲（含快取）。onProgress(0~1, stage) */
  function loadSong(url, onProgress) {
    var raw = toRawUrl(url);
    if (bufferCache[raw]) return Promise.resolve(bufferCache[raw]);
    return fetchArrayBuffer(raw, function (p) { if (onProgress) onProgress(p * 0.85, 'download'); })
      .then(function (ab) {
        if (onProgress) onProgress(0.88, 'decode');
        return decode(ab);
      })
      .then(function (buf) {
        bufferCache[raw] = buf;
        if (onProgress) onProgress(1, 'done');
        return buf;
      });
  }

  function loadFile(file, onProgress) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onprogress = function (e) {
        if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total * 0.8, 'read');
      };
      fr.onerror = function () {
        var msg = (global.TKI18n && global.TKI18n.t) ? global.TKI18n.t('fileFail') : 'Failed to read file';
        reject(new Error(msg));
      };
      fr.onload = function () {
        if (onProgress) onProgress(0.85, 'decode');
        decode(fr.result).then(function (b) {
          if (onProgress) onProgress(1, 'done');
          resolve(b);
        }, reject);
      };
      fr.readAsArrayBuffer(file);
    });
  }

  /* ------------------------------------------------------------------ *
   * 歌曲播放器（提供精準時間軸）
   * ------------------------------------------------------------------ */

  function Player() {
    this.buffer = null;
    this.source = null;
    this.startCtxTime = 0;
    this.startOffset = 0;
    this.playing = false;   // 音訊是否還在輸出
    this.running = false;   // 時間軸是否還在走（音訊播完後仍會繼續走）
    this.pausedAt = 0;
    this.rate = 1;
    this.onended = null;
  }

  Player.prototype.load = function (buffer) {
    this.stop();
    this.buffer = buffer;
    this.pausedAt = 0;
    return this;
  };

  /**
   * @param {number} at        從歌曲的第幾秒開始（可為負，代表倒數前奏）
   * @param {number} delay     延遲幾秒後才真正開始（讓畫面先就緒）
   */
  Player.prototype.play = function (at, delay) {
    init();
    if (!this.buffer) return;
    this.stop();
    at = at || 0;
    delay = delay || 0;
    var self = this;
    var src = ctx.createBufferSource();
    src.buffer = this.buffer;
    src.playbackRate.value = this.rate;
    src.connect(musicGain);
    var when = ctx.currentTime + delay + (at < 0 ? -at / this.rate : 0);
    src.start(when, Math.max(0, at));
    src.onended = function () {
      if (self.source !== src) return;
      // 只代表音訊輸出結束，時間軸必須繼續走，
      // 否則歌曲播完的瞬間 time() 會跳回暫停點，遊戲就結算不了。
      self.playing = false;
      if (self.onended) self.onended();
    };
    this.source = src;
    this.startCtxTime = ctx.currentTime + delay;
    this.startOffset = at;
    this.playing = true;
    this.running = true;
  };

  /** 排程用的歌曲時間（不含喇叭延遲） */
  Player.prototype.rawTime = function () {
    if (!this.running) return this.pausedAt;
    var elapsed = (ctx.currentTime - this.startCtxTime) * this.rate;
    if (elapsed < 0) return this.startOffset;
    return elapsed + this.startOffset;
  };

  /** 玩家聽到的歌曲時間。iPad 會扣硬體延遲，避免打下去已經過判定。 */
  Player.prototype.time = function () {
    var t = this.rawTime();
    if (!this.running) return t;
    return t - hardwareLatency();
  };

  Player.prototype.duration = function () {
    return this.buffer ? this.buffer.duration : 0;
  };

  /** 把「歌曲時間」換算成 AudioContext 的絕對時間，用於精準排程音效 */
  Player.prototype.ctxTimeOf = function (songTime) {
    return this.startCtxTime + (songTime - this.startOffset) / this.rate;
  };

  Player.prototype.pause = function () {
    this.stop();
  };

  Player.prototype.resumeFrom = function (delay) {
    this.play(this.pausedAt, delay || 0);
  };

  /** 停止播放並把時間軸凍結在當下，之後 resumeFrom() 才會接在正確的位置。 */
  Player.prototype.stop = function () {
    if (this.running) this.pausedAt = this.rawTime();
    if (this.source) {
      try { this.source.onended = null; this.source.stop(); } catch (e) { }
      try { this.source.disconnect(); } catch (e) { }
      this.source = null;
    }
    this.playing = false;
    this.running = false;
  };

  Player.prototype.fadeOut = function (sec) {
    if (!this.playing) { this.stop(); return; }
    var g = musicGain.gain;
    var now = ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0.0001, now + sec);
    var self = this;
    var src = this.source;
    setTimeout(function () {
      // 淡出期間玩家可能已經按了「もう一度」，那就不能把新的播放停掉
      if (self.source === src) self.stop();
      g.cancelScheduledValues(ctx.currentTime);
      g.setValueAtTime(settings.music, ctx.currentTime);
    }, sec * 1000 + 60);
  };

  /* ------------------------------------------------------------------ *
   * 打擊音效（assets 取樣）與選單合成音
   * ------------------------------------------------------------------ */

  var HIT_URLS = {
    don: 'assets/Don.wav',
    ka: 'assets/Katsu.wav',
    pop: 'assets/Balloon.wav'
  };
  var HIT_GAIN = 0.75;
  var hitRaw = {};
  var hitBuf = {};
  var hitDecode = {};

  function preloadHitSamples() {
    Object.keys(HIT_URLS).forEach(function (name) {
      fetchArrayBuffer(HIT_URLS[name]).then(function (ab) {
        hitRaw[name] = ab;
        if (ctx) decodeHit(name);
      }).catch(function (err) {
        if (global.console && console.warn) console.warn('[taiko] hit sample', name, err);
      });
    });
  }

  function decodeHit(name) {
    if (hitBuf[name]) return Promise.resolve(hitBuf[name]);
    if (hitDecode[name]) return hitDecode[name];
    var raw = hitRaw[name]
      ? Promise.resolve(hitRaw[name])
      : fetchArrayBuffer(HIT_URLS[name]).then(function (ab) {
        hitRaw[name] = ab;
        return ab;
      });
    hitDecode[name] = raw.then(function (ab) { return decode(ab); }).then(function (buf) {
      hitBuf[name] = buf;
      return buf;
    }, function (err) {
      hitDecode[name] = null;
      throw err;
    });
    return hitDecode[name];
  }

  function decodeReadyHits() {
    Object.keys(HIT_URLS).forEach(function (name) {
      if (hitRaw[name] && !hitBuf[name]) decodeHit(name);
    });
  }

  /** 播放已解碼的打擊取樣。when 是 AudioContext 時間，給生成器提前排程。 */
  function playHit(name, vol, when) {
    init();
    var v = (vol === undefined ? 1 : vol) * HIT_GAIN;
    var t = (when === undefined || when === null) ? ctx.currentTime : when;
    function start(buf) {
      if (!buf || !ctx) return;
      var at = Math.max(t, ctx.currentTime);
      var src = ctx.createBufferSource();
      src.buffer = buf;
      var g = ctx.createGain();
      g.gain.value = v;
      src.connect(g);
      g.connect(sfxGain);
      try { src.start(at); } catch (e) { }
    }
    if (hitBuf[name]) { start(hitBuf[name]); return; }
    decodeHit(name).then(start).catch(function (err) {
      if (global.console && console.warn) console.warn('[taiko] hit sample', name, err);
    });
  }

  function env(gain, t0, peak, attack, decay) {
    gain.setValueAtTime(0.0001, t0);
    gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
    gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
  }

  /** ドン（面） */
  function don(vol, when) { playHit('don', vol, when); }

  /** カッ（縁） */
  function ka(vol, when) { playHit('ka', vol, when); }

  /** 節拍器（生成器校正 BPM 用）。accent = 小節第一拍 */
  function tick(accent, when) {
    init();
    var t = when === undefined ? ctx.currentTime : Math.max(when, ctx.currentTime);
    var osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(accent ? 1760 : 1175, t);
    var g = ctx.createGain();
    env(g.gain, t, accent ? 0.28 : 0.16, 0.001, 0.035);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 0.08);
  }

  /** 風船爆破 */
  function pop() { playHit('pop', 1); }

  /** 選單移動 */
  function blip(freq, dur, type, vol) {
    init();
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq || 880, t);
    var g = ctx.createGain();
    env(g.gain, t, (vol === undefined ? 0.18 : vol), 0.004, dur || 0.08);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + (dur || 0.08) + 0.05);
  }

  function chord(freqs, dur, type, vol, spread) {
    init();
    var t0 = ctx.currentTime;
    freqs.forEach(function (f, i) {
      var t = t0 + i * (spread === undefined ? 0.085 : spread);
      var osc = ctx.createOscillator();
      osc.type = type || 'triangle';
      osc.frequency.setValueAtTime(f, t);
      var g = ctx.createGain();
      env(g.gain, t, vol === undefined ? 0.2 : vol, 0.008, dur || 0.4);
      osc.connect(g); g.connect(sfxGain);
      osc.start(t); osc.stop(t + (dur || 0.4) + 0.1);
    });
  }

  var SFX = {
    move: function () { blip(760, 0.05, 'square', 0.12); },
    select: function () { chord([784, 1046], 0.14, 'square', 0.14, 0.05); },
    back: function () { blip(320, 0.09, 'square', 0.13); },
    clear: function () { chord([523, 659, 784, 1046, 1319], 0.55, 'triangle', 0.22, 0.11); },
    fail: function () { chord([392, 330, 262, 196], 0.5, 'sawtooth', 0.14, 0.13); },
    fullcombo: function () { chord([659, 784, 988, 1319, 1568, 2093], 0.6, 'triangle', 0.2, 0.09); },
    count: function () { blip(1200, 0.06, 'square', 0.16); }
  };

  /* ------------------------------------------------------------------ */

  global.TKAudio = {
    init: init,
    resume: resume,
    get ctx() { return ctx; },
    settings: settings,
    setVolume: setVolume,
    saveSettings: saveSettings,
    toRawUrl: toRawUrl,
    loadSong: loadSong,
    loadFile: loadFile,
    decode: decode,
    fetchArrayBuffer: fetchArrayBuffer,
    Player: Player,
    don: don, ka: ka, pop: pop, tick: tick, blip: blip, chord: chord, sfx: SFX,
    hardwareLatency: hardwareLatency, isAppleTouch: isAppleTouch
  };

  preloadHitSamples();
})(window);
