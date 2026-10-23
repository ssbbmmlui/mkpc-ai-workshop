/* =============================================================================
 * svg.js — SVG 建構輔助工具 + 太鼓之達人風格向量美術資源
 * 本檔案不依賴任何其他模組，可獨立被 index.html 與 generator.html 引用。
 * ===========================================================================*/
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  /* ------------------------------------------------------------------ *
   * 基礎建構輔助
   * ------------------------------------------------------------------ */

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) setAttrs(n, attrs);
    if (parent) parent.appendChild(n);
    return n;
  }

  function setAttrs(node, attrs) {
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v === null || v === undefined) continue;
      node.setAttribute(k, v);
    }
    return node;
  }

  function txt(parent, str, attrs) {
    var t = el('text', attrs, parent);
    t.textContent = str;
    return t;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
    return node;
  }

  function show(node, visible) {
    node.style.display = visible ? '' : 'none';
  }

  function tf(node, x, y, scale, rot) {
    var s = 'translate(' + fx(x) + ',' + fx(y) + ')';
    if (rot) s += ' rotate(' + fx(rot) + ')';
    if (scale !== undefined && scale !== 1) {
      s += ' scale(' + (typeof scale === 'object'
        ? fx(scale.x) + ',' + fx(scale.y)
        : fx(scale)) + ')';
    }
    node.setAttribute('transform', s);
  }

  /** 數字縮短，避免 SVG 屬性字串過長影響效能 */
  function fx(v) {
    return Math.round(v * 100) / 100;
  }

  function pol(cx, cy, r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  /** 圓角矩形 path（可分別指定四角） */
  function roundRectPath(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    return 'M' + (x + r) + ',' + y +
      'h' + (w - 2 * r) + 'a' + r + ',' + r + ' 0 0 1 ' + r + ',' + r +
      'v' + (h - 2 * r) + 'a' + r + ',' + r + ' 0 0 1 ' + (-r) + ',' + r +
      'h' + (-(w - 2 * r)) + 'a' + r + ',' + r + ' 0 0 1 ' + (-r) + ',' + (-r) +
      'v' + (-(h - 2 * r)) + 'a' + r + ',' + r + ' 0 0 1 ' + r + ',' + (-r) + 'z';
  }

  /** 平行四邊形（太鼓 UI 常見的斜切面板） */
  function skewBoxPath(x, y, w, h, slant) {
    return 'M' + (x + slant) + ',' + y + 'H' + (x + w) + 'L' + (x + w - slant) +
      ',' + (y + h) + 'H' + x + 'Z';
  }

  /* ------------------------------------------------------------------ *
   * 漸層 / defs
   * ------------------------------------------------------------------ */

  function defsOf(svg) {
    var d = svg.querySelector('defs');
    if (!d) {
      d = el('defs', null, svg);
      svg.insertBefore(d, svg.firstChild);
    }
    return d;
  }

  function linGrad(defs, id, stops, opts) {
    opts = opts || {};
    if (defs.ownerDocument.getElementById(id)) return id;
    var g = el('linearGradient', {
      id: id,
      x1: opts.x1 === undefined ? '0' : opts.x1,
      y1: opts.y1 === undefined ? '0' : opts.y1,
      x2: opts.x2 === undefined ? '0' : opts.x2,
      y2: opts.y2 === undefined ? '1' : opts.y2
    }, defs);
    stops.forEach(function (s) {
      el('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] }, g);
    });
    return id;
  }

  function radGrad(defs, id, stops, opts) {
    opts = opts || {};
    if (defs.ownerDocument.getElementById(id)) return id;
    var g = el('radialGradient', {
      id: id,
      cx: opts.cx === undefined ? '0.5' : opts.cx,
      cy: opts.cy === undefined ? '0.5' : opts.cy,
      r: opts.r === undefined ? '0.6' : opts.r,
      fx: opts.fx, fy: opts.fy
    }, defs);
    stops.forEach(function (s) {
      el('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] }, g);
    });
    return id;
  }

  /* ------------------------------------------------------------------ *
   * 色票（貼近太鼓之達人官方配色）
   * ------------------------------------------------------------------ */

  var C = {
    don: '#f0483c',        // 面（紅／咚）
    donDark: '#b8261c',
    donLight: '#ff7f6b',
    ka: '#38b3e8',         // 縁（藍／咔）
    kaDark: '#1668ad',
    kaLight: '#8fd9f7',
    roll: '#f5b400',       // 連打（黃）
    rollDark: '#c07f00',
    balloon: '#ff8fb3',    // 風船（粉）
    lane: '#252525',
    laneAlt: '#2e2e2e',
    panel: '#141414',
    gold: '#ffd34a',
    cream: '#f6e6c8',
    wood: '#a8642c',
    woodDark: '#6f3c15',
    good: '#ffe14d',
    ok: '#ffffff',
    bad: '#5a7fa8',
    // 四難度顏色（かんたん / ふつう / むずかしい / おに）
    easy: '#e8395c',
    normal: '#63c34a',
    hard: '#3f9fe0',
    oni: '#9b4fd8'
  };

  /* ------------------------------------------------------------------ *
   * 難度徽章：梅・竹・松・鬼
   * ------------------------------------------------------------------ */

  /** 梅花（かんたん） */
  function plumIcon(parent, size, color) {
    var g = el('g', null, parent);
    var r = size * 0.5;
    for (var i = 0; i < 5; i++) {
      var a = (i * 72 - 90) * Math.PI / 180;
      el('circle', {
        cx: fx(Math.cos(a) * r * 0.52),
        cy: fx(Math.sin(a) * r * 0.52),
        r: fx(r * 0.44),
        fill: color || '#ffffff'
      }, g);
    }
    el('circle', { cx: 0, cy: 0, r: fx(r * 0.24), fill: '#ffe9a8' }, g);
    return g;
  }

  /** 竹（ふつう） */
  function bambooIcon(parent, size, color) {
    var g = el('g', null, parent);
    var c = color || '#ffffff';
    var h = size, w = size * 0.30;
    for (var i = 0; i < 3; i++) {
      var y = -h / 2 + i * (h / 3) + 1;
      el('rect', {
        x: fx(-w / 2), y: fx(y), width: fx(w), height: fx(h / 3 - 2.5),
        rx: fx(w * 0.28), fill: c
      }, g);
    }
    el('path', {
      d: 'M' + fx(w / 2) + ',' + fx(-h * 0.16) + ' q' + fx(size * 0.42) + ',' +
        fx(-size * 0.10) + ' ' + fx(size * 0.50) + ',' + fx(-size * 0.30) +
        ' q' + fx(-size * 0.36) + ',' + fx(size * 0.02) + ' ' + fx(-size * 0.50) + ',' + fx(size * 0.30) + 'z',
      fill: c, opacity: 0.92
    }, g);
    el('path', {
      d: 'M' + fx(-w / 2) + ',' + fx(h * 0.10) + ' q' + fx(-size * 0.42) + ',' +
        fx(-size * 0.10) + ' ' + fx(-size * 0.50) + ',' + fx(-size * 0.30) +
        ' q' + fx(size * 0.36) + ',' + fx(size * 0.02) + ' ' + fx(size * 0.50) + ',' + fx(size * 0.30) + 'z',
      fill: c, opacity: 0.92
    }, g);
    return g;
  }

  /** 松（むずかしい） */
  function pineIcon(parent, size, color) {
    var g = el('g', null, parent);
    var c = color || '#ffffff';
    var s = size * 0.5;
    el('rect', {
      x: fx(-s * 0.13), y: fx(s * 0.42), width: fx(s * 0.26), height: fx(s * 0.58),
      rx: fx(s * 0.1), fill: c, opacity: 0.85
    }, g);
    [[-0.95, 0.28], [-0.28, 0.52], [0.36, 0.78]].forEach(function (lv) {
      el('path', {
        d: 'M0,' + fx(s * lv[0]) + ' L' + fx(s * lv[1]) + ',' + fx(s * (lv[0] + 0.62)) +
          ' L' + fx(-s * lv[1]) + ',' + fx(s * (lv[0] + 0.62)) + ' Z',
        fill: c
      }, g);
    });
    return g;
  }

  /** 鬼面（おに） */
  function oniIcon(parent, size, color) {
    var g = el('g', null, parent);
    var c = color || '#ffffff';
    var s = size * 0.5;
    // 角
    el('path', {
      d: 'M' + fx(-s * 0.62) + ',' + fx(-s * 0.46) + ' L' + fx(-s * 0.92) + ',' +
        fx(-s * 1.02) + ' L' + fx(-s * 0.22) + ',' + fx(-s * 0.72) + ' Z',
      fill: c
    }, g);
    el('path', {
      d: 'M' + fx(s * 0.62) + ',' + fx(-s * 0.46) + ' L' + fx(s * 0.92) + ',' +
        fx(-s * 1.02) + ' L' + fx(s * 0.22) + ',' + fx(-s * 0.72) + ' Z',
      fill: c
    }, g);
    // 臉
    el('path', {
      d: 'M0,' + fx(-s * 0.78) + ' C' + fx(s * 0.92) + ',' + fx(-s * 0.78) + ' ' +
        fx(s * 0.86) + ',' + fx(s * 0.34) + ' 0,' + fx(s * 0.98) +
        ' C' + fx(-s * 0.86) + ',' + fx(s * 0.34) + ' ' + fx(-s * 0.92) + ',' + fx(-s * 0.78) + ' 0,' + fx(-s * 0.78) + 'Z',
      fill: c
    }, g);
    // 眼、嘴（挖空）
    el('path', {
      d: 'M' + fx(-s * 0.55) + ',' + fx(-s * 0.20) + ' L' + fx(-s * 0.14) + ',' +
        fx(-s * 0.02) + ' L' + fx(-s * 0.52) + ',' + fx(s * 0.10) + 'Z',
      fill: 'rgba(0,0,0,.62)'
    }, g);
    el('path', {
      d: 'M' + fx(s * 0.55) + ',' + fx(-s * 0.20) + ' L' + fx(s * 0.14) + ',' +
        fx(-s * 0.02) + ' L' + fx(s * 0.52) + ',' + fx(s * 0.10) + 'Z',
      fill: 'rgba(0,0,0,.62)'
    }, g);
    el('path', {
      d: 'M' + fx(-s * 0.40) + ',' + fx(s * 0.36) + ' Q0,' + fx(s * 0.78) + ' ' +
        fx(s * 0.40) + ',' + fx(s * 0.36) + ' Q0,' + fx(s * 0.54) + ' ' + fx(-s * 0.40) + ',' + fx(s * 0.36) + 'Z',
      fill: 'rgba(0,0,0,.62)'
    }, g);
    return g;
  }

  var DIFF_ICONS = { easy: plumIcon, normal: bambooIcon, hard: pineIcon, oni: oniIcon };

  function diffIcon(parent, diff, size, color) {
    return (DIFF_ICONS[diff] || plumIcon)(parent, size, color);
  }

  /* ------------------------------------------------------------------ *
   * 星星（★難易度）
   * ------------------------------------------------------------------ */

  function starPath(r, inner) {
    var d = '', ir = r * (inner || 0.44);
    for (var i = 0; i < 10; i++) {
      var rr = i % 2 ? ir : r;
      var p = pol(0, 0, rr, i * 36);
      d += (i ? 'L' : 'M') + fx(p[0]) + ',' + fx(p[1]);
    }
    return d + 'Z';
  }

  function star(parent, x, y, r, fill, stroke) {
    var g = el('g', { transform: 'translate(' + fx(x) + ',' + fx(y) + ')' }, parent);
    el('path', {
      d: starPath(r), fill: fill || C.gold,
      stroke: stroke || 'rgba(0,0,0,.35)', 'stroke-width': r * 0.14,
      'stroke-linejoin': 'round'
    }, g);
    return g;
  }

  /** 一排星星（太鼓風：10 顆為一行，超過折行） */
  function starRow(parent, count, max, size, gap, fill) {
    var g = el('g', null, parent);
    var perRow = max > 5 ? Math.ceil(max / 2) : max;
    for (var i = 0; i < max; i++) {
      var row = Math.floor(i / perRow), col = i % perRow;
      var on = i < count;
      star(g, col * (size + gap), row * (size + gap),
        size / 2, on ? (fill || C.gold) : 'rgba(255,255,255,.16)',
        on ? 'rgba(120,60,0,.45)' : 'rgba(255,255,255,.10)');
    }
    return g;
  }

  /* ------------------------------------------------------------------ *
   * 王冠（結算用：虹 / 金 / 銀）
   * ------------------------------------------------------------------ */

  function crown(parent, kind, size) {
    var g = el('g', null, parent);
    var s = size / 100;
    var fill = kind === 'rainbow' ? 'url(#gradRainbow)'
      : kind === 'gold' ? 'url(#gradGold)' : 'url(#gradSilver)';
    var body = el('g', { transform: 'scale(' + fx(s) + ')' }, g);
    el('path', {
      d: 'M-52,26 L-60,-34 L-24,-6 L0,-44 L24,-6 L60,-34 L52,26 Z',
      fill: fill, stroke: 'rgba(90,50,0,.55)', 'stroke-width': 4,
      'stroke-linejoin': 'round'
    }, body);
    el('rect', {
      x: -54, y: 26, width: 108, height: 18, rx: 7,
      fill: fill, stroke: 'rgba(90,50,0,.55)', 'stroke-width': 4
    }, body);
    [[-60, -34], [0, -44], [60, -34]].forEach(function (p) {
      el('circle', { cx: p[0], cy: p[1], r: 8, fill: '#fff8d8', stroke: 'rgba(90,50,0,.5)', 'stroke-width': 3 }, body);
    });
    return g;
  }

  /** 建立 crown 需要的漸層（每份文件呼叫一次即可） */
  function installCrownGradients(svg) {
    var d = defsOf(svg);
    linGrad(d, 'gradGold', [[0, '#fff3b0'], [0.45, '#ffcf3a'], [1, '#d18f00']]);
    linGrad(d, 'gradSilver', [[0, '#ffffff'], [0.45, '#d7e0e8'], [1, '#8e9aa6']]);
    linGrad(d, 'gradRainbow', [
      [0, '#ff5f6d'], [0.2, '#ffc371'], [0.4, '#8dff8f'],
      [0.6, '#54d3ff'], [0.8, '#b18cff'], [1, '#ff7ad9']
    ], { x2: '1', y2: '0.4' });
  }

  /* ------------------------------------------------------------------ *
   * 音符圖形
   * ------------------------------------------------------------------ */

  var NOTE_R = 33;
  var NOTE_R_BIG = 47;

  function installNoteGradients(svg) {
    var d = defsOf(svg);
    radGrad(d, 'gradDon', [[0, '#ff9a86'], [0.5, C.don], [1, C.donDark]], { cx: '0.36', cy: '0.30', r: '0.78' });
    radGrad(d, 'gradKa', [[0, '#a9e4fb'], [0.5, C.ka], [1, C.kaDark]], { cx: '0.36', cy: '0.30', r: '0.78' });
    radGrad(d, 'gradRoll', [[0, '#ffe38a'], [0.5, C.roll], [1, C.rollDark]], { cx: '0.36', cy: '0.30', r: '0.78' });
    radGrad(d, 'gradBalloon', [[0, '#ffd0e0'], [0.5, C.balloon], [1, '#e2537e']], { cx: '0.34', cy: '0.28', r: '0.8' });
  }

  /** 建立一個可重複使用的音符節點（回傳 <g>，內含 shape 們） */
  function makeNoteNode(parent) {
    var g = el('g', { 'pointer-events': 'none' }, parent);
    var o = {
      root: g,
      roll: el('g', null, g),
      rollBody: null,
      head: el('g', null, g),
      circle: null,
      ring: null,
      inner: null,
      balloon: el('g', null, g),
      label: null
    };
    // 連打條
    o.rollBody = el('path', { fill: 'url(#gradRoll)', stroke: '#ffffff', 'stroke-width': 4, 'stroke-linejoin': 'round' }, o.roll);
    // 音符本體
    o.circle = el('circle', { r: NOTE_R, fill: 'url(#gradDon)' }, o.head);
    o.ring = el('circle', { r: NOTE_R, fill: 'none', stroke: '#ffffff', 'stroke-width': 5 }, o.head);
    o.inner = el('circle', { r: NOTE_R * 0.62, fill: 'none', stroke: 'rgba(255,255,255,.35)', 'stroke-width': 3 }, o.head);
    return o;
  }

  /* ------------------------------------------------------------------ *
   * どんちゃん（Don-chan）角色
   * ------------------------------------------------------------------ */

  /**
   * 建立 Don-chan。回傳控制器物件：
   *   root        : <g>，請自行 transform 定位
   *   swing(side) : 觸發打擊動作 'l' | 'r'
   *   setMood(m)  : 'idle' | 'happy' | 'sad' | 'clear'
   *   update(t,b) : t = 秒；b = 目前拍數（float），每幀呼叫
   */
  function donChan(parent, scale) {
    var root = el('g', null, parent);
    var world = el('g', { transform: 'scale(' + (scale || 1) + ')' }, root);

    el('ellipse', { cx: 0, cy: 132, rx: 96, ry: 17, fill: 'rgba(0,0,0,.30)' }, world);

    var bob = el('g', null, world);      // 上下彈跳
    var squash = el('g', null, bob);     // 擠壓伸展

    // ---- 腳 ----
    var legs = el('g', null, squash);
    [-42, 42].forEach(function (x) {
      el('line', {
        x1: x, y1: 78, x2: x * 0.86, y2: 120,
        stroke: '#f7e6c4', 'stroke-width': 25, 'stroke-linecap': 'round'
      }, legs);
      el('ellipse', { cx: x * 0.84, cy: 126, rx: 22, ry: 12, fill: '#e04a34' }, legs);
    });

    // ---- 手臂（以肩為軸旋轉）----
    function makeArm(sign) {
      var g = el('g', null, squash);
      var sx = sign * 78, sy = 6;
      var pivot = el('g', { transform: 'rotate(0 ' + sx + ' ' + sy + ')' }, g);
      el('line', {
        x1: sx, y1: sy, x2: sx + sign * 56, y2: sy + 52,
        stroke: '#f7e6c4', 'stroke-width': 22, 'stroke-linecap': 'round'
      }, pivot);
      // 撥（ばち）
      var bachi = el('g', {
        transform: 'translate(' + (sx + sign * 56) + ',' + (sy + 52) + ') rotate(' + (sign * 34) + ')'
      }, pivot);
      el('rect', { x: -5, y: -66, width: 10, height: 74, rx: 5, fill: '#c98a4b' }, bachi);
      el('rect', { x: -7, y: -74, width: 14, height: 20, rx: 7, fill: '#fdf3dd' }, bachi);
      el('circle', { cx: sx + sign * 56, cy: sy + 52, r: 19, fill: '#ef5a44', stroke: '#b8261c', 'stroke-width': 3 }, pivot);
      return { g: g, pivot: pivot, cx: sx, cy: sy };
    }
    var armL = makeArm(-1);
    var armR = makeArm(1);

    // ---- 太鼓身體 ----
    var body = el('g', null, squash);
    el('circle', { r: 104, fill: '#a52a1c' }, body);
    el('circle', { r: 98, fill: 'url(#gradDonBody)' }, body);
    for (var i = 0; i < 18; i++) {
      var p = pol(0, 0, 90, i * 20);
      el('circle', { cx: fx(p[0]), cy: fx(p[1]), r: 4.2, fill: '#ffd85c', opacity: 0.9 }, body);
    }
    el('circle', { r: 82, fill: 'url(#gradDonFace)' }, body);
    el('path', {
      d: 'M-66,-34 A78,78 0 0 1 -8,-78',
      fill: 'none', stroke: 'rgba(255,255,255,.42)', 'stroke-width': 13, 'stroke-linecap': 'round'
    }, body);

    // ---- 臉 ----
    var face = el('g', null, body);
    var browL = el('path', { d: 'M-56,-42 L-16,-30', stroke: '#7a1c11', 'stroke-width': 11, 'stroke-linecap': 'round', fill: 'none' }, face);
    var browR = el('path', { d: 'M56,-42 L16,-30', stroke: '#7a1c11', 'stroke-width': 11, 'stroke-linecap': 'round', fill: 'none' }, face);
    var eyeL = el('g', null, face);
    var eyeR = el('g', null, face);
    function buildEye(g, x) {
      el('ellipse', { cx: x, cy: -8, rx: 17, ry: 21, fill: '#ffffff' }, g);
      var pupil = el('circle', { cx: x + (x < 0 ? 2 : -2), cy: -5, r: 10, fill: '#20242e' }, g);
      el('circle', { cx: x + (x < 0 ? -2 : -6), cy: -11, r: 3.6, fill: '#ffffff' }, g);
      return pupil;
    }
    buildEye(eyeL, -31);
    buildEye(eyeR, 31);
    var starEyes = el('g', { opacity: 0 }, face);
    star(starEyes, -31, -8, 19, '#ffe14d');
    star(starEyes, 31, -8, 19, '#ffe14d');
    el('circle', { cx: -58, cy: 22, r: 12, fill: '#ff9c8a', opacity: 0.55 }, face);
    el('circle', { cx: 58, cy: 22, r: 12, fill: '#ff9c8a', opacity: 0.55 }, face);
    var mouth = el('path', { d: '', fill: '#7a1c11' }, face);

    var MOUTHS = {
      smile: 'M-28,26 Q0,54 28,26 Q0,40 -28,26 Z',
      open: 'M-26,22 Q0,20 26,22 Q22,60 0,60 Q-22,60 -26,22 Z',
      big: 'M-34,18 Q0,14 34,18 Q30,66 0,66 Q-30,66 -34,18 Z',
      sad: 'M-26,42 Q0,18 26,42 Q0,32 -26,42 Z'
    };
    mouth.setAttribute('d', MOUTHS.smile);

    /* ---- 動畫狀態 ---- */
    var st = {
      swingL: 0, swingR: 0, mood: 'idle', mouthT: 0, blink: 0, nextBlink: 2 + Math.random() * 3
    };

    function swing(side) {
      if (side === 'l') st.swingL = 1; else st.swingR = 1;
      st.mouthT = 0.16;
    }

    function setMood(m) {
      st.mood = m;
      starEyes.setAttribute('opacity', m === 'clear' ? 1 : 0);
      eyeL.setAttribute('opacity', m === 'clear' ? 0 : 1);
      eyeR.setAttribute('opacity', m === 'clear' ? 0 : 1);
      if (m === 'sad') {
        mouth.setAttribute('d', MOUTHS.sad);
        browL.setAttribute('d', 'M-56,-32 L-16,-44');
        browR.setAttribute('d', 'M56,-32 L16,-44');
      } else {
        browL.setAttribute('d', 'M-56,-42 L-16,-30');
        browR.setAttribute('d', 'M56,-42 L16,-30');
      }
    }

    var lastT = 0;
    function update(t, beat) {
      var dt = Math.min(0.05, Math.max(0, t - lastT));
      lastT = t;
      var mood = st.mood;
      var energy = mood === 'clear' ? 1.5 : mood === 'happy' ? 1.22 : mood === 'sad' ? 0.35 : 1;

      // 節拍彈跳
      var ph = beat - Math.floor(beat);
      var hop = Math.abs(Math.sin(ph * Math.PI));
      var by = -hop * 11 * energy;
      var sq = 1 + 0.05 * Math.cos(ph * Math.PI * 2) * energy;
      bob.setAttribute('transform', 'translate(0,' + fx(by) + ')');
      squash.setAttribute('transform', 'scale(' + fx(2 - sq) + ',' + fx(sq) + ')');

      // 手臂
      st.swingL = Math.max(0, st.swingL - dt * 6.5);
      st.swingR = Math.max(0, st.swingR - dt * 6.5);
      var baseL = mood === 'clear' ? -52 : mood === 'sad' ? 16 : -6 + Math.sin(beat * Math.PI) * 6;
      var baseR = mood === 'clear' ? 52 : mood === 'sad' ? -16 : 6 - Math.sin(beat * Math.PI) * 6;
      var sl = baseL + st.swingL * 74;
      var sr = baseR - st.swingR * 74;
      armL.pivot.setAttribute('transform', 'rotate(' + fx(sl) + ' ' + armL.cx + ' ' + armL.cy + ')');
      armR.pivot.setAttribute('transform', 'rotate(' + fx(sr) + ' ' + armR.cx + ' ' + armR.cy + ')');

      // 嘴巴
      if (mood !== 'sad') {
        st.mouthT = Math.max(0, st.mouthT - dt);
        mouth.setAttribute('d', mood === 'clear' ? MOUTHS.big : (st.mouthT > 0 || mood === 'happy' ? MOUTHS.open : MOUTHS.smile));
      }

      // 眨眼
      if (mood !== 'clear') {
        st.blink += dt;
        if (st.blink > st.nextBlink) {
          var k = (st.blink - st.nextBlink) / 0.12;
          if (k > 1) { st.blink = 0; st.nextBlink = 2 + Math.random() * 4; k = 0; }
          var sy = k < 0.5 ? 1 - k * 2 : (k - 0.5) * 2;
          eyeL.setAttribute('transform', 'translate(0,-8) scale(1,' + fx(Math.max(0.06, sy)) + ') translate(0,8)');
          eyeR.setAttribute('transform', 'translate(0,-8) scale(1,' + fx(Math.max(0.06, sy)) + ') translate(0,8)');
        } else {
          eyeL.removeAttribute('transform');
          eyeR.removeAttribute('transform');
        }
      }
    }

    return { root: root, swing: swing, setMood: setMood, update: update };
  }

  function installDonChanGradients(svg) {
    var d = defsOf(svg);
    radGrad(d, 'gradDonBody', [[0, '#ff8f74'], [0.55, '#ef4a35'], [1, '#c02a1b']], { cx: '0.36', cy: '0.28', r: '0.82' });
    radGrad(d, 'gradDonFace', [[0, '#ff9d80'], [0.6, '#f2543d'], [1, '#d0331f']], { cx: '0.38', cy: '0.30', r: '0.80' });
  }

  /* ------------------------------------------------------------------ *
   * 太鼓（畫面下方的打擊面板）
   * ------------------------------------------------------------------ */

  /**
   * 建立太鼓打擊面板。回傳：
   *   root, flash(zone) — zone: 'dl' | 'dr' | 'kl' | 'kr'
   *   zones: 各分區節點（可綁定 pointer 事件）
   */
  function taikoDrum(parent, radius) {
    var R = radius || 120;
    var root = el('g', null, parent);

    el('ellipse', { cx: 0, cy: R * 0.98, rx: R * 0.92, ry: R * 0.20, fill: 'rgba(0,0,0,.32)' }, root);
    // 木桶
    el('rect', {
      x: -R * 0.86, y: -R * 0.1, width: R * 1.72, height: R * 1.02, rx: R * 0.2,
      fill: 'url(#gradWood)'
    }, root);
    // 鼓面外框
    el('circle', { r: R, fill: '#7d4a1e' }, root);
    el('circle', { r: R * 0.955, fill: 'url(#gradHeadRim)' }, root);
    el('circle', { r: R * 0.70, fill: 'url(#gradHead)' }, root);

    var zones = {};
    function zone(id, d, color) {
      var g = el('g', { class: 'drum-zone', 'data-zone': id, style: 'cursor:pointer' }, root);
      el('path', { d: d, fill: 'rgba(0,0,0,0.01)', 'pointer-events': 'all' }, g);
      var fl = el('path', { d: d, fill: color, opacity: 0, 'pointer-events': 'none' }, g);
      zones[id] = { g: g, flash: fl, t: 0 };
      return g;
    }
    var ro = R * 0.955;
    // Entire drum face is don (F/J) — ka (D/K) is handled by the background zone
    zone('dl', 'M0,' + fx(-ro) + ' A' + ro + ',' + ro + ' 0 0 0 0,' + fx(ro) + ' Z', C.don);
    zone('dr', 'M0,' + fx(-ro) + ' A' + ro + ',' + ro + ' 0 0 1 0,' + fx(ro) + ' Z', C.don);

    el('line', { x1: 0, y1: -ro, x2: 0, y2: ro, stroke: 'rgba(0,0,0,.14)', 'stroke-width': 2, 'pointer-events': 'none' }, root);

    function flash(id) {
      var z = zones[id];
      if (z) z.t = 1;
    }
    function update(dt) {
      for (var k in zones) {
        var z = zones[k];
        if (z.t > 0) {
          z.t = Math.max(0, z.t - dt * 7);
          z.flash.setAttribute('opacity', fx(z.t * 0.85));
        }
      }
    }
    return { root: root, flash: flash, update: update, zones: zones };
  }

  function installDrumGradients(svg) {
    var d = defsOf(svg);
    linGrad(d, 'gradWood', [[0, '#c8813f'], [0.5, '#8f5522'], [1, '#5e340f']], { x2: '0', y2: '1' });
    radGrad(d, 'gradHeadRim', [[0, '#f3dcb0'], [1, '#c9a267']], { cx: '0.4', cy: '0.32', r: '0.75' });
    radGrad(d, 'gradHead', [[0, '#fdf3de'], [0.7, '#f0dfbc'], [1, '#dcc596']], { cx: '0.4', cy: '0.32', r: '0.78' });
  }

  /* ------------------------------------------------------------------ *
   * 一次安裝所有 defs
   * ------------------------------------------------------------------ */
  function installAll(svg) {
    installNoteGradients(svg);
    installDonChanGradients(svg);
    installDrumGradients(svg);
    installCrownGradients(svg);
    var d = defsOf(svg);
    linGrad(d, 'gradGauge', [[0, '#ffe97a'], [0.5, '#ffb01f'], [1, '#ff7a00']], { x2: '0', y2: '1' });
    linGrad(d, 'gradGaugeClear', [
      [0, '#fff59a'], [0.25, '#ffd24a'], [0.5, '#ff8a4a'], [0.75, '#ff5aa8'], [1, '#c07bff']
    ], { x2: '1', y2: '0' });
    linGrad(d, 'gradSkyNormal', [[0, '#1d2b53'], [0.55, '#2b4b8f'], [1, '#3f7fbf']]);
    linGrad(d, 'gradSkyClear', [[0, '#ff9a3c'], [0.4, '#ffd166'], [0.75, '#8fe3ff'], [1, '#4fb3ff']]);
    linGrad(d, 'gradFlameA', [
      [0, '#fffce0', 1], [0.28, '#ffe14d', 1], [0.62, '#ff8a12', 1], [1, '#e03800', 0.92]
    ], { x2: '0', y2: '1' });
    linGrad(d, 'gradFlameB', [
      [0, '#ffffff', 1], [0.22, '#fff4a8', 1], [0.55, '#ffb020', 1], [1, '#ff4a00', 0.88]
    ], { x2: '0', y2: '1' });
    radGrad(d, 'gradSoulFire', [
      [0, '#fff6d0', 0.95], [0.32, '#ffb020', 0.55], [0.7, '#ff5a00', 0.18], [1, '#ff2a00', 0]
    ], { r: '0.85' });
    if (!svg.ownerDocument.getElementById('gaugeFireGlow')) {
      var fireFilter = el('filter', {
        id: 'gaugeFireGlow', x: '-60%', y: '-80%', width: '220%', height: '260%'
      }, d);
      el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '2.4', result: 'b' }, fireFilter);
      var mer = el('feMerge', null, fireFilter);
      el('feMergeNode', { in: 'b' }, mer);
      el('feMergeNode', { in: 'SourceGraphic' }, mer);
    }
  }

  function flamePath(h, w) {
    h = h || 22;
    w = w || 8;
    return 'M0,2 C' + fx(-w) + ',' + fx(-h * 0.18) + ' ' + fx(-w * 0.5) + ',' + fx(-h * 0.58) +
      ' 0,' + fx(-h) + ' C' + fx(w * 0.42) + ',' + fx(-h * 0.62) + ' ' + fx(w) + ',' + fx(-h * 0.22) + ' 0,2Z';
  }

  /**
   * 滿魂時圍繞魂圖示的動態火焰環。
   */
  function soulFlame(parent) {
    var root = el('g', { opacity: '0', 'pointer-events': 'none' }, parent);
    var glow = el('circle', { r: 38, fill: 'url(#gradSoulFire)', opacity: 0.7 }, root);
    var ringA = el('g', null, root);
    var ringB = el('g', null, root);
    var tongues = [];

    function addTongue(ring, ang, h, w, fill, baseR, ph, spd) {
      var wrap = el('g', null, ring);
      el('path', { d: flamePath(h, w), fill: fill }, wrap);
      tongues.push({ wrap: wrap, ang: ang, baseR: baseR, ph: ph, spd: spd });
    }

    var i, n = 10;
    for (i = 0; i < n; i++) {
      addTongue(ringA, i * 36, 19, 6.4, 'url(#gradFlameA)', 25, i * 0.83, 8.2 + (i % 3) * 1.6);
      addTongue(ringB, i * 36 + 18, 13, 4.4, 'url(#gradFlameB)', 24, i * 1.11 + 0.4, 11 + (i % 4) * 1.2);
    }

    var vis = 0, want = false, rot = 0, tAcc = 0;

    function setOn(on) { want = !!on; }

    function reset() {
      want = false;
      vis = 0;
      rot = 0;
      tAcc = 0;
      root.setAttribute('opacity', '0');
    }

    function update(dt, beatPos) {
      vis += ((want ? 1 : 0) - vis) * Math.min(1, dt * 7);
      if (vis < 0.004) {
        vis = 0;
        root.setAttribute('opacity', '0');
        return;
      }
      tAcc += dt;
      rot += dt * 48;
      var pulse = 1 + 0.08 * Math.abs(Math.sin((beatPos || 0) * Math.PI));
      root.setAttribute('opacity', fx(vis));
      root.setAttribute('transform', 'scale(' + fx(pulse) + ')');
      glow.setAttribute('opacity', fx(0.42 + 0.28 * Math.abs(Math.sin(tAcc * 5.2))));
      ringA.setAttribute('transform', 'rotate(' + fx(rot) + ')');
      ringB.setAttribute('transform', 'rotate(' + fx(-rot * 1.35) + ')');
      for (var j = 0; j < tongues.length; j++) {
        var f = tongues[j];
        var flick = 0.7 + 0.42 * (0.5 + 0.5 * Math.sin(tAcc * f.spd + f.ph));
        var wob = 7 * Math.sin(tAcc * f.spd * 0.82 + f.ph * 1.6);
        var fat = 0.86 + 0.16 * Math.sin(tAcc * 6.4 + f.ph);
        f.wrap.setAttribute('transform',
          'rotate(' + fx(f.ang + wob) + ') translate(0,' + fx(-f.baseR) + ') scale(' +
          fx(fat) + ',' + fx(flick) + ')');
      }
    }

    return { root: root, setOn: setOn, reset: reset, update: update };
  }

  /**
   * 滿魂時包圍魂條的動態火焰（沿用先前魂條火焰動畫，不含任何文字）。
   */
  function gaugeFlame(parent, geom) {
    var gg = geom.gauge;
    var root = el('g', { 'pointer-events': 'none', opacity: '0' }, parent);
    var fireG = el('g', { filter: 'url(#gaugeFireGlow)' }, root);
    var rim = el('rect', {
      x: gg.x - 5, y: gg.y - 6, width: gg.w + 10, height: gg.h + 12, rx: 10,
      fill: 'none', stroke: '#ffb020', 'stroke-width': 4, opacity: 0.85
    }, fireG);

    var flames = [];
    function addFlame(x, y, h, w, rot, ph, alt) {
      var grp = el('g', null, fireG);
      el('path', {
        d: flamePath(h, w),
        fill: alt ? 'url(#gradFlameA)' : 'url(#gradFlameB)'
      }, grp);
      flames.push({ g: grp, x: x, y: y, rot: rot || 0, ph: ph });
    }

    var n = 14;
    var i;
    for (i = 0; i < n; i++) {
      var fxpos = gg.x + 8 + i * (gg.w - 16) / (n - 1);
      addFlame(fxpos, gg.y + 2, 22 + (i % 3) * 6, 7 + (i % 2) * 1.5, 0, i * 0.73, i % 2);
      addFlame(fxpos + 3, gg.y + gg.h - 2, 13 + (i % 2) * 4, 6, 180, i * 0.73 + 1.1, !(i % 2));
    }
    addFlame(gg.x + 2, gg.y + gg.h * 0.28, 15, 5.5, -90, 0.2, 1);
    addFlame(gg.x + 2, gg.y + gg.h * 0.72, 15, 5.5, -90, 1.15, 0);
    addFlame(gg.x + gg.w - 2, gg.y + gg.h * 0.28, 15, 5.5, 90, 0.55, 0);
    addFlame(gg.x + gg.w - 2, gg.y + gg.h * 0.72, 15, 5.5, 90, 1.4, 1);

    var vis = 0, want = false;

    function setOn(on) { want = !!on; }

    function reset() {
      want = false;
      vis = 0;
      root.setAttribute('opacity', '0');
    }

    function update(dt, beatPos) {
      vis += ((want ? 1 : 0) - vis) * Math.min(1, dt * 8);
      if (vis < 0.004) {
        vis = 0;
        root.setAttribute('opacity', '0');
        return;
      }
      root.setAttribute('opacity', fx(vis));
      var bp = beatPos || 0;
      rim.setAttribute('opacity', fx(0.55 + 0.35 * Math.abs(Math.sin(bp * Math.PI * 2))));
      for (var fi = 0; fi < flames.length; fi++) {
        var f = flames[fi];
        var flick = 0.78 + 0.28 * Math.abs(Math.sin(bp * 8.4 + f.ph));
        var sway = Math.sin(bp * 5.2 + f.ph * 1.3) * 4;
        f.g.setAttribute('transform',
          'translate(' + fx(f.x) + ',' + fx(f.y) + ') rotate(' + fx(f.rot + sway) + ') scale(' +
          fx(0.9 + flick * 0.15) + ',' + fx(flick) + ')');
      }
    }

    return { root: root, setOn: setOn, reset: reset, update: update };
  }

  /* ------------------------------------------------------------------ *
   * 觀眾：依魂ゲージ逐步出現，滿魂時更擁擠
   * ------------------------------------------------------------------ */

  var CROWD_BODY = ['#ffd166', '#8fd9a8', '#8fc7ff', '#ffa8c5', '#d3b0ff', '#ffb07a', '#9ee7e0', '#f6a6c1'];
  var CROWD_SKIN = ['#ffe0bd', '#f6d0a8', '#ffd8c4', '#e8c49a'];
  var CROWD_HAIR = ['#3a2a20', '#1a120c', '#6a3418', '#2c1b14', '#4a2c1a'];

  function crowdMember(parent, spec) {
    spec = spec || {};
    var skin = spec.skin || CROWD_SKIN[0];
    var body = spec.body || CROWD_BODY[0];
    var hair = spec.hair || CROWD_HAIR[0];
    var root = el('g', { opacity: '0', 'pointer-events': 'none' }, parent);
    var inner = el('g', null, root);

    el('ellipse', { cx: 0, cy: 12, rx: 15, ry: 4.5, fill: 'rgba(0,0,0,.30)' }, inner);

    var armL = el('g', { transform: 'translate(-15,-4)' }, inner);
    el('line', {
      x1: 0, y1: 0, x2: -7, y2: 15,
      stroke: skin, 'stroke-width': 6, 'stroke-linecap': 'round'
    }, armL);
    var armR = el('g', { transform: 'translate(15,-4)' }, inner);
    el('line', {
      x1: 0, y1: 0, x2: 7, y2: 15,
      stroke: skin, 'stroke-width': 6, 'stroke-linecap': 'round'
    }, armR);

    el('ellipse', { cx: 0, cy: 2, rx: 17, ry: 21, fill: body }, inner);
    el('circle', { cx: 0, cy: -26, r: 13.5, fill: skin }, inner);

    var hs = spec.hairStyle || 0;
    if (hs === 1) {
      el('path', { d: 'M-13,-30 Q0,-50 13,-30 Q8,-24 -13,-30 Z', fill: hair }, inner);
    } else if (hs === 2) {
      el('ellipse', { cx: 0, cy: -36, rx: 14, ry: 8, fill: hair }, inner);
      el('circle', { cx: -13, cy: -28, r: 5, fill: hair }, inner);
      el('circle', { cx: 13, cy: -28, r: 5, fill: hair }, inner);
    } else if (hs === 3) {
      el('path', { d: 'M-12,-32 Q-4,-46 0,-34 Q4,-46 12,-32 Q0,-26 -12,-32 Z', fill: hair }, inner);
    } else {
      el('ellipse', { cx: 0, cy: -35, rx: 13, ry: 8, fill: hair }, inner);
    }

    el('circle', { cx: -4.6, cy: -27, r: 2.05, fill: '#2a2018' }, inner);
    el('circle', { cx: 4.6, cy: -27, r: 2.05, fill: '#2a2018' }, inner);
    el('path', {
      d: 'M-3.6,-20 Q0,-16.5 3.6,-20',
      fill: 'none', stroke: '#c44a3a', 'stroke-width': 1.5, 'stroke-linecap': 'round'
    }, inner);

    if (spec.hat === 'cone') {
      el('path', { d: 'M-11,-36 L0,-56 L11,-36 Z', fill: '#e8483a', stroke: '#8f1f14', 'stroke-width': 1.2 }, inner);
      el('circle', { cx: 0, cy: -56, r: 3.2, fill: '#ffd24a' }, inner);
    } else if (spec.hat === 'band') {
      el('rect', { x: -12, y: -36, width: 24, height: 5, rx: 1.5, fill: '#e8483a' }, inner);
      el('rect', { x: -4, y: -42, width: 8, height: 8, rx: 1, fill: '#ffd24a' }, inner);
    }

    var flag = null;
    if (spec.flag) {
      flag = el('g', { transform: 'translate(22,-6)' }, inner);
      el('line', { x1: 0, y1: 20, x2: 0, y2: -30, stroke: '#5a3010', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, flag);
      el('path', { d: 'M0,-30 L24,-22 L24,-6 L0,-14 Z', fill: spec.flag, stroke: 'rgba(0,0,0,.2)', 'stroke-width': 1 }, flag);
    }

    return { root: root, inner: inner, armL: armL, armR: armR, flag: flag };
  }

  function petalPath() {
    return 'M0,0 C7,-5 9,5 0,14 C-9,5 -7,-5 0,0 Z';
  }

  /**
   * 連段光環 + 里程碑爆發。放在 combo 數字的座標系原點。
   */
  function comboFx(parent) {
    var root = el('g', { 'pointer-events': 'none' }, parent);
    var aura = el('g', { opacity: '0' }, root);
    var ringA = el('circle', {
      r: 54, fill: 'none', stroke: '#ffe89a', 'stroke-width': 3,
      'stroke-dasharray': '10 8', 'stroke-linecap': 'round'
    }, aura);
    var ringB = el('circle', {
      r: 68, fill: 'none', stroke: '#ffb020', 'stroke-width': 2.2,
      'stroke-dasharray': '4 10'
    }, aura);
    var orbit = [];
    var oi;
    for (oi = 0; oi < 6; oi++) {
      var og = el('g', null, aura);
      el('path', { d: starPath(9), fill: '#ffe14d', stroke: '#fff6d0', 'stroke-width': 1 }, og);
      orbit.push(og);
    }
    var flames = el('g', { opacity: '0' }, aura);
    for (oi = 0; oi < 8; oi++) {
      var fg = el('g', { transform: 'rotate(' + (oi * 45) + ')' }, flames);
      el('path', { d: flamePath(18, 5), fill: 'url(#gradFlameA)', transform: 'translate(0,-52)' }, fg);
    }

    var burstG = el('g', null, root);
    var bits = [];
    for (oi = 0; oi < 20; oi++) {
      var bg = el('g', { opacity: '0' }, burstG);
      var kind = oi % 3;
      if (kind === 0) el('path', { d: starPath(11), fill: '#ffe14d' }, bg);
      else if (kind === 1) el('path', { d: petalPath(), fill: '#ff8ab0' }, bg);
      else el('circle', { r: 5, fill: '#fff4a8' }, bg);
      bits.push({ g: bg, ang: oi * 0.314, dist: 20, spin: 0, fill: kind });
    }

    var flash = txt(root, '', {
      y: -58, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': 22, 'font-weight': 900, fill: '#ffe14d',
      stroke: 'rgba(0,0,0,.55)', 'stroke-width': 4, 'paint-order': 'stroke',
      opacity: '0'
    });

    var tier = 0, burstT = 0, burstKind = 0, rot = 0;

    function setTier(t) {
      tier = t || 0;
      aura.setAttribute('opacity', tier >= 10 ? '1' : '0');
      ringA.setAttribute('stroke', tier >= 300 ? '#ff6ad5' : tier >= 200 ? '#ff9c1a' : tier >= 100 ? '#ffd24a' : '#ffe89a');
      ringB.setAttribute('opacity', tier >= 50 ? '1' : '0');
      flames.setAttribute('opacity', tier >= 200 ? '0.9' : '0');
      for (var i = 0; i < orbit.length; i++) {
        orbit[i].setAttribute('opacity', tier >= 100 ? '1' : tier >= 50 && i < 3 ? '0.85' : '0');
      }
    }

    function burst(kind) {
      burstT = 1;
      burstKind = kind;
      flash.textContent = String(kind);
      var colors = {
        10: ['#ffffff', '#cfe8ff', '#ffe14d'],
        50: ['#ffe89a', '#ffd24a', '#ffffff'],
        100: ['#ffd24a', '#ff9c1a', '#fff6d0'],
        200: ['#ff9c1a', '#ff5a00', '#ffe14d'],
        300: ['#ff6ad5', '#ffe14d', '#8fe3ff']
      };
      var pal = colors[kind] || colors[10];
      for (var i = 0; i < bits.length; i++) {
        var b = bits[i];
        b.ang = (i / bits.length) * Math.PI * 2 + (kind * 0.17);
        b.dist = 18 + (i % 5) * 6;
        b.spin = (i % 2 ? 1 : -1) * (180 + kind * 0.4);
        var node = b.g.firstChild;
        if (node) {
          if (b.fill === 2) node.setAttribute('fill', pal[i % pal.length]);
          else if (b.fill === 1) node.setAttribute('fill', pal[(i + 1) % pal.length]);
          else node.setAttribute('fill', pal[0]);
        }
      }
    }

    function update(dt, beatPos) {
      if (tier < 10 && burstT <= 0) return;
      rot += dt * (tier >= 300 ? 140 : tier >= 100 ? 90 : 55);
      ringA.setAttribute('transform', 'rotate(' + fx(rot) + ')');
      ringB.setAttribute('transform', 'rotate(' + fx(-rot * 0.7) + ')');
      flames.setAttribute('transform', 'rotate(' + fx(rot * 0.45) + ')');
      var pulse = 1 + 0.06 * Math.abs(Math.sin((beatPos || 0) * Math.PI * 2));
      aura.setAttribute('transform', 'scale(' + fx(pulse) + ')');
      var nOrbit = tier >= 100 ? 6 : 3;
      for (var i = 0; i < orbit.length; i++) {
        var a = (i / nOrbit) * Math.PI * 2 + rot * Math.PI / 180;
        var rr = tier >= 200 ? 78 : 62;
        tf(orbit[i], Math.cos(a) * rr, Math.sin(a) * rr * 0.72, 0.85 + 0.15 * Math.sin(a * 2));
      }
      if (burstT > 0) {
        burstT = Math.max(0, burstT - dt * (burstKind >= 200 ? 1.15 : 1.55));
        var p = 1 - burstT;
        flash.setAttribute('opacity', fx(burstT > 0.55 ? 1 : burstT / 0.55));
        flash.setAttribute('transform', 'translate(0,' + fx(-p * 28) + ') scale(' + fx(1 + p * 0.35) + ')');
        var reach = burstKind >= 300 ? 210 : burstKind >= 100 ? 160 : 110;
        for (i = 0; i < bits.length; i++) {
          var b = bits[i];
          var d = b.dist + p * reach;
          var x = Math.cos(b.ang) * d;
          var y = Math.sin(b.ang) * d * 0.78 - p * 20;
          b.g.setAttribute('opacity', fx(burstT));
          b.g.setAttribute('transform',
            'translate(' + fx(x) + ',' + fx(y) + ') rotate(' + fx(p * b.spin) + ') scale(' + fx(0.7 + burstT * 0.5) + ')');
        }
      } else {
        flash.setAttribute('opacity', '0');
      }
    }

    setTier(0);
    return { root: root, setTier: setTier, burst: burst, update: update };
  }

  /**
   * 滿魂時舞台落花／彩紙。
   */
  function festFx(parent, geom) {
    var root = el('g', { 'pointer-events': 'none', opacity: '0' }, parent);
    var bits = [];
    var i;
    for (i = 0; i < 22; i++) {
      var g = el('g', null, root);
      var isPetal = i % 3 !== 0;
      if (isPetal) el('path', { d: petalPath(), fill: i % 2 ? '#ff8ab0' : '#fff1f6', opacity: 0.9 }, g);
      else el('rect', { x: -4, y: -6, width: 8, height: 12, rx: 1, fill: ['#ffd24a', '#ff6a4a', '#8fe3ff'][i % 3], opacity: 0.85 }, g);
      bits.push({
        g: g,
        x: (i * 97 + 40) % geom.W,
        y: geom.stageY + (i * 53) % Math.max(40, geom.H - geom.stageY),
        rot: i * 27,
        spd: 38 + (i % 7) * 12,
        sway: 18 + (i % 5) * 6,
        ph: i * 0.7
      });
    }
    var vis = 0;
    function update(dt, on, geom2) {
      vis += ((on ? 1 : 0) - vis) * Math.min(1, dt * 4);
      if (vis < 0.004) vis = 0;
      root.setAttribute('opacity', fx(vis));
      if (vis < 0.01) return;
      var H = geom2.H, stageY = geom2.stageY, W = geom2.W;
      for (var k = 0; k < bits.length; k++) {
        var b = bits[k];
        b.y += b.spd * dt;
        b.rot += dt * 80;
        if (b.y > H + 16) {
          b.y = stageY - 10;
          b.x = (b.x + 160) % W;
        }
        var x = b.x + Math.sin(b.y * 0.02 + b.ph) * b.sway;
        b.g.setAttribute('transform',
          'translate(' + fx(x) + ',' + fx(b.y) + ') rotate(' + fx(b.rot) + ')');
      }
    }
    return { root: root, update: update };
  }

  /* ------------------------------------------------------------------ */

  global.TKSvg = {
    NS: NS, el: el, setAttrs: setAttrs, txt: txt, clear: clear, show: show,
    tf: tf, fx: fx, pol: pol,
    roundRectPath: roundRectPath, skewBoxPath: skewBoxPath, starPath: starPath,
    defsOf: defsOf, linGrad: linGrad, radGrad: radGrad,
    C: C, NOTE_R: NOTE_R, NOTE_R_BIG: NOTE_R_BIG,
    diffIcon: diffIcon, plumIcon: plumIcon, bambooIcon: bambooIcon,
    pineIcon: pineIcon, oniIcon: oniIcon,
    star: star, starRow: starRow, crown: crown,
    makeNoteNode: makeNoteNode, donChan: donChan, taikoDrum: taikoDrum,
    installAll: installAll, flamePath: flamePath, soulFlame: soulFlame, gaugeFlame: gaugeFlame,
    crowdMember: crowdMember, comboFx: comboFx, festFx: festFx
  };
})(window);
