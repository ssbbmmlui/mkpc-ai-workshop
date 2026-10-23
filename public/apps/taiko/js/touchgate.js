/* =============================================================================
 * touchgate.js — 觸控連打去重，以及「事件真正發生」的歌曲時間
 *
 * iPhone / iPad / Android 同一下敲擊會先後送出 touchstart 與 pointerdown。
 * iPad 的 pointerdown 常常晚 20–40ms；若兩種都當擊打，密集音符會被多判一顆。
 * 反過來，譜面一密、主執行緒一忙，其中一種事件又可能整段被系統吃掉。
 * 所以：先到的那一個算數，另一個在短時間、近距離內視為同一下。
 * 兩隻手指（大音符、左右手）id 不同，不會被併成一下。
 * ===========================================================================*/
(function (global) {
  'use strict';

  var PAIR_MS = 48;
  var PAIR_PX = 32;
  var PAIR_PX2 = PAIR_PX * PAIR_PX;
  var KEEP_MS = 90;
  /* 主執行緒卡住時，事件時間戳和處理當下可以差到約一個 GC。
     再長就比較像時鐘基準不同，不要拿來平移判定。 */
  var MAX_LAG_SEC = 0.22;

  function createTouchGate() {
    var claims = [];

    function prune(now) {
      var i = 0;
      while (i < claims.length) {
        if (now - claims[i].t > KEEP_MS) claims.splice(i, 1);
        else i++;
      }
    }

    /**
     * @returns {boolean} true 表示這是新的一下，呼叫端應該判定
     */
    function claim(x, y, id, source, now) {
      if (typeof now !== 'number' || !isFinite(now)) {
        now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      }
      prune(now);
      var sid = (id === undefined || id === null || id === '') ? null : (source + ':' + id);

      if (sid) {
        for (var i = 0; i < claims.length; i++) {
          if (!claims[i].seen[sid]) continue;
          // 只擋同一個事件被 document / SVG 各送一次。
          // 手指抬起後瀏覽器會重用 identifier，70ms 後的新連打必須留下。
          var age = now - claims[i].t;
          if (age < 0) age = -age;
          if (age <= 40) return false;
        }
      }

      var best = -1;
      var bestD = PAIR_PX2;
      for (var j = 0; j < claims.length; j++) {
        var c = claims[j];
        if (c.paired || c.source === source) continue;
        var dt = now - c.t;
        if (dt < 0) dt = -dt;
        if (dt > PAIR_MS) continue;
        var dx = c.x - x;
        var dy = c.y - y;
        var d2 = dx * dx + dy * dy;
        if (d2 <= bestD) {
          bestD = d2;
          best = j;
        }
      }
      if (best >= 0) {
        claims[best].paired = true;
        if (sid) claims[best].seen[sid] = 1;
        return false;
      }

      var seen = {};
      if (sid) seen[sid] = 1;
      claims.push({
        t: now, x: x, y: y, source: source, paired: false, seen: seen
      });
      return true;
    }

    function reset() { claims.length = 0; }

    return { claim: claim, reset: reset };
  }

  /**
   * 把 performance 時間軸上的事件時間，換算成「手指落下當下」的歌曲時間。
   * 事件若被擠到下一個影格才跑，用處理當下的時鐘會整段偏晚，連打就對不到音符。
   */
  function songTimeOfHit(songNow, perfNow, stamp) {
    if (typeof songNow !== 'number' || !isFinite(songNow)) return songNow;
    if (typeof perfNow !== 'number' || typeof stamp !== 'number') return songNow;
    if (!isFinite(perfNow) || !isFinite(stamp)) return songNow;
    var lag = (perfNow - stamp) / 1000;
    if (!(lag > 0) || lag > MAX_LAG_SEC) return songNow;
    return songNow - lag;
  }

  global.TKTouchGate = {
    create: createTouchGate,
    songTimeOfHit: songTimeOfHit,
    PAIR_MS: PAIR_MS,
    PAIR_PX: PAIR_PX,
    MAX_LAG_SEC: MAX_LAG_SEC
  };
})(typeof window !== 'undefined' ? window : globalThis);
