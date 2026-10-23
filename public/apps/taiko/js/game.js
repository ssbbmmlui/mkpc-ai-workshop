/* =============================================================================
 * game.js — 遊玩畫面：判定、計分、魂ゲージ、SVG 演出
 * ===========================================================================*/
(function (global) {
  'use strict';

  var S = global.TKSvg;
  var A = global.TKAudio;
  var CG = global.TaikoChartGen;

  /* 判定視窗（秒），貼近街機設定並針對鍵盤稍作放寬 */
  var JUDGE_WIN = {
    strict: { good: 0.032, ok: 0.084, bad: 0.118 },
    lenient: { good: 0.048, ok: 0.112, bad: 0.142 }
  };

  var NOTE_R = 33, NOTE_R_BIG = 47;

  function tr(key, vars) {
    var I = global.TKI18n;
    return (I && I.t) ? I.t(key, vars) : key;
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fx(v) { return Math.round(v * 100) / 100; }

  function comboBonus(combo) {
    var CG = global.TaikoChartGen;
    if (CG && CG.comboBonus) return CG.comboBonus(combo);
    if (combo < 10) return 0;
    if (combo < 30) return 100;
    if (combo < 50) return 200;
    if (combo < 100) return 400;
    if (combo < 200) return 800;
    if (combo < 300) return 1000;
    return 1300;
  }

  /* ================================================================== *
   * 建構
   * ================================================================== */

  function Game(opts) {
    this.svg = opts.svg;
    this.root = opts.layer;
    this.lay = opts.layout;
    this.onFinish = opts.onFinish || function () { };
    this.onQuit = opts.onQuit || function () { };
    this.onRestart = opts.onRestart || function () { };
    this.onQuitToSongs = opts.onQuitToSongs || function () { };
    this.player = new A.Player();
    this.built = false;
    this.running = false;
    this.paused = false;
    this.lastPress = { donL: -9, donR: -9, kaL: -9, kaR: -9 };
    this.pendingBig = null;
    this._chain = null;
    this._pendingHit = null;
    this._touchPreferred = false;
    this._screenTouchOn = false;
    this._screenInputBound = false;
    this._touchGate = (global.TKTouchGate && global.TKTouchGate.create)
      ? global.TKTouchGate.create() : null;
    this.effects = [];
    this.notePool = [];
    this.fxPool = [];
    this.mood = '';
    this.comboMilestone = 0;
    this.crowdCheer = 0;
  }

  /* ------------------------------------------------------------------ *
   * 版面
   * ------------------------------------------------------------------ */

  Game.prototype.geom = function () {
    var L = this.lay;
    var g = {
      W: L.W, H: L.H,
      headerH: 60,
      gaugeY: 62, gaugeH: 54,
      laneY: 126, laneH: 152,
      panelW: 284
    };
    g.laneMid = g.laneY + g.laneH / 2;
    g.judgeX = g.panelW + 92;
    g.stageY = g.laneY + g.laneH;
    g.stageH = L.H - g.stageY;
    return g;
  };

  /* ------------------------------------------------------------------ *
   * 建立所有 SVG 節點
   * ------------------------------------------------------------------ */

  Game.prototype.build = function () {
    if (this.built) return;
    var g = this.geom();
    var root = S.clear(this.root);
    this.g = g;

    /* ---- 舞台背景 ---- */
    var bg = S.el('g', null, root);
    this.bgSky = S.el('rect', { x: 0, y: g.stageY, width: g.W, height: g.stageH, fill: 'url(#gradSkyNormal)' }, bg);
    this.bgClear = S.el('rect', {
      x: 0, y: g.stageY, width: g.W, height: g.stageH, fill: 'url(#gradSkyClear)', opacity: 0
    }, bg);

    // 遠山
    var hills = S.el('g', { opacity: 0.55 }, bg);
    var hy = g.stageY + g.stageH * 0.42;
    S.el('path', {
      d: 'M0,' + fx(hy + 90) + ' Q160,' + fx(hy - 60) + ' 330,' + fx(hy + 40) +
        ' Q470,' + fx(hy - 40) + ' 640,' + fx(hy + 60) +
        ' Q820,' + fx(hy - 80) + ' 1010,' + fx(hy + 30) +
        ' Q1160,' + fx(hy - 30) + ' 1280,' + fx(hy + 70) +
        ' L1280,' + fx(g.H) + ' L0,' + fx(g.H) + 'Z',
      fill: 'rgba(255,255,255,.16)'
    }, hills);

    // 燈籠
    var lanterns = S.el('g', null, bg);
    this.lanterns = [];
    for (var li = 0; li < 7; li++) {
      var lx = 90 + li * 185;
      var lg = S.el('g', { transform: 'translate(' + lx + ',' + fx(g.stageY + 46) + ')' }, lanterns);
      S.el('line', { x1: 0, y1: -46, x2: 0, y2: -24, stroke: 'rgba(0,0,0,.35)', 'stroke-width': 3 }, lg);
      S.el('ellipse', { cx: 0, cy: 0, rx: 22, ry: 28, fill: '#e8483a', stroke: '#8f1f14', 'stroke-width': 3 }, lg);
      S.el('rect', { x: -12, y: -30, width: 24, height: 6, rx: 2, fill: '#5a3010' }, lg);
      S.el('rect', { x: -12, y: 24, width: 24, height: 6, rx: 2, fill: '#5a3010' }, lg);
      this.lanterns.push(lg);
    }

    // 舞台地板
    S.el('rect', {
      x: 0, y: g.H - g.stageH * 0.30, width: g.W, height: g.stageH * 0.30,
      fill: 'rgba(20,10,6,.45)'
    }, bg);

    this.festArt = S.festFx(bg, g);
    this.crowdBack = S.el('g', { 'pointer-events': 'none' }, bg);

    /* ---- Don-chan ---- */
    this.donHolder = S.el('g', null, root);
    this.don = S.donChan(this.donHolder, 1);

    /* ---- 背景打擊區（觸控裝置按鼓外 = ka） ---- */
    this.bgHitZone = S.el('rect', {
      x: 0, y: g.stageY, width: g.W, height: g.H - g.stageY,
      fill: 'transparent', style: 'cursor:pointer; touch-action:manipulation'
    }, root);
    var self = this;
    this.bindPlayHit(this.bgHitZone, function (e) {
      self.input('ka', self.eventSide(e), false, self.eventWhen(e));
    });

    /* ---- Ka glow overlays（淺色背景閃光，在太鼓後方） ---- */
    var halfW = Math.ceil(g.W / 2);
    var stageH = g.H - g.stageY;
    this.kaGlowL = S.el('rect', {
      x: 0, y: g.stageY, width: halfW, height: stageH,
      fill: '#38bdf8', opacity: 0, 'pointer-events': 'none'
    }, root);
    this.kaGlowR = S.el('rect', {
      x: halfW, y: g.stageY, width: halfW, height: stageH,
      fill: '#38bdf8', opacity: 0, 'pointer-events': 'none'
    }, root);
    this.kaGlowT = { l: 0, r: 0 };

    /* ---- 太鼓 ---- */
    this.drumHolder = S.el('g', null, root);
    this.drum = S.taikoDrum(this.drumHolder, 112);
    this.bindDrumPointer();

    /* ---- 觀眾（後排在角色後方，前排不擋鼓心） ---- */
    this.crowdFront = S.el('g', { 'pointer-events': 'none' }, root);
    this.crowd = [];
    this.spawnCrowd();

    /* ---- 音符軌道 ---- */
    var lane = S.el('g', null, root);
    S.el('rect', { x: 0, y: g.laneY, width: g.W, height: g.laneH, fill: '#242424' }, lane);
    S.el('rect', { x: 0, y: g.laneY, width: g.W, height: 5, fill: 'rgba(255,255,255,.14)' }, lane);
    S.el('rect', { x: 0, y: g.laneY + g.laneH - 5, width: g.W, height: 5, fill: 'rgba(0,0,0,.45)' }, lane);

    // 小節線層
    this.barLayer = S.el('g', null, lane);
    // 判定圈
    var jg = S.el('g', { transform: 'translate(' + g.judgeX + ',' + fx(g.laneMid) + ')' }, lane);
    S.el('circle', { r: NOTE_R_BIG + 4, fill: 'rgba(0,0,0,.35)' }, jg);
    S.el('circle', { r: NOTE_R_BIG, fill: 'none', stroke: 'rgba(255,255,255,.30)', 'stroke-width': 4 }, jg);
    S.el('circle', { r: NOTE_R, fill: 'none', stroke: 'rgba(255,255,255,.42)', 'stroke-width': 4 }, jg);
    this.judgeFlash = S.el('circle', { r: NOTE_R_BIG, fill: '#ffffff', opacity: 0 }, jg);

    this.noteLayer = S.el('g', null, lane);
    this.fxLayer = S.el('g', null, lane);
    // 寬螢幕會把 viewBox 置中，x<0 的音符會畫進左右留白、露在黑面板外面。
    // 裁在畫面座標裡，滑出左緣就看不到。
    var frameClip = S.el('clipPath', {
      id: 'clipTaikoFrame', clipPathUnits: 'userSpaceOnUse'
    }, S.defsOf(this.svg));
    S.el('rect', { x: 0, y: 0, width: g.W, height: g.H }, frameClip);
    this.noteLayer.setAttribute('clip-path', 'url(#clipTaikoFrame)');
    this.barLayer.setAttribute('clip-path', 'url(#clipTaikoFrame)');

    /* ---- 左側面板（難度 / 連段） ---- */
    var panel = S.el('g', null, root);
    S.el('rect', { x: 0, y: g.laneY, width: g.panelW, height: g.laneH, fill: '#101010' }, panel);
    S.el('rect', { x: g.panelW - 4, y: g.laneY, width: 4, height: g.laneH, fill: 'rgba(255,255,255,.10)' }, panel);
    this.panelDiff = S.el('g', { transform: 'translate(56,' + fx(g.laneMid) + ')' }, panel);
    this.comboBox = S.el('g', { transform: 'translate(196,' + fx(g.laneMid) + ')' }, panel);
    this.comboNum = S.txt(this.comboBox, '', {
      y: -4, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': 62, 'font-weight': 900, fill: '#ffffff', stroke: 'rgba(0,0,0,.6)', 'stroke-width': 5,
      'paint-order': 'stroke'
    });
    this.comboLabel = S.txt(this.comboBox, tr('combo'), {
      y: 40, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': 17, 'font-weight': 700, fill: 'rgba(255,255,255,.6)'
    });
    this.comboFx = S.comboFx(this.comboBox);
    S.show(this.comboBox, false);

    /* ---- 頂部：分數 + 曲名 ---- */
    var head = S.el('g', null, root);
    S.el('rect', { x: 0, y: 0, width: g.W, height: g.headerH, fill: '#0d0d0d' }, head);
    S.el('path', {
      d: S.skewBoxPath(14, 10, 250, 42, 14), fill: '#1d1d1d',
      stroke: 'rgba(255,255,255,.18)', 'stroke-width': 2
    }, head);
    this.scoreText = S.txt(head, '0', {
      x: 246, y: 32, 'text-anchor': 'end', 'dominant-baseline': 'central',
      'font-size': 30, 'font-weight': 900, fill: '#ffe45c'
    });
    this.watchBadge = S.el('g', { opacity: 0, 'pointer-events': 'none' }, head);
    S.el('path', {
      d: S.skewBoxPath(268, 10, 156, 42, 12),
      fill: '#5b1d8c', stroke: '#ffd24a', 'stroke-width': 2
    }, this.watchBadge);
    this.watchBadgeText = S.txt(this.watchBadge, '', {
      x: 346, y: 32, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': 16, 'font-weight': 900, fill: '#ffe45c'
    });
    this.titleText = S.txt(head, '', {
      x: g.W - 78, y: 24, 'text-anchor': 'end', 'dominant-baseline': 'central',
      'font-size': 24, 'font-weight': 800, fill: '#ffffff'
    });
    this.subTitleText = S.txt(head, '', {
      x: g.W - 78, y: 46, 'text-anchor': 'end', 'dominant-baseline': 'central',
      'font-size': 14, 'font-weight': 600, fill: 'rgba(255,255,255,.55)'
    });

    /* ---- 魂ゲージ ---- */
    var gau = S.el('g', null, root);
    S.el('rect', { x: 0, y: g.gaugeY, width: g.W, height: g.gaugeH, fill: '#161616' }, gau);
    var gx = 300, gw = g.W - gx - 96, gy = g.gaugeY + 11, gh = 32;
    this.gaugeGeom = { x: gx, y: gy, w: gw, h: gh };
    S.txt(gau, '魂', {
      x: 250, y: g.gaugeY + 27, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': 26, 'font-weight': 900, fill: 'rgba(255,255,255,.35)'
    });
    S.el('rect', { x: gx, y: gy, width: gw, height: gh, rx: 5, fill: '#2a2a2a', stroke: 'rgba(255,255,255,.12)', 'stroke-width': 2 }, gau);
    this.gaugeFill = S.el('rect', { x: gx + 2, y: gy + 2, width: 0, height: gh - 4, rx: 3, fill: 'url(#gradGauge)' }, gau);
    this.gaugeClearFill = S.el('rect', { x: gx + 2, y: gy + 2, width: 0, height: gh - 4, rx: 3, fill: 'url(#gradGaugeClear)', opacity: 0 }, gau);
    // 分段線
    var segs = S.el('g', { 'pointer-events': 'none' }, gau);
    for (var si = 1; si < 25; si++) {
      S.el('rect', { x: fx(gx + gw * si / 25), y: gy, width: 2, height: gh, fill: 'rgba(0,0,0,.45)' }, segs);
    }
    this.clearMark = S.el('g', null, gau);
    this.gaugeFlame = S.gaugeFlame(gau, { gauge: this.gaugeGeom });
    // 魂圖示
    this.soulIcon = S.el('g', { transform: 'translate(' + fx(g.W - 48) + ',' + fx(g.gaugeY + 27) + ')' }, gau);
    this.soulFlame = S.soulFlame(this.soulIcon);
    this.soulCircle = S.el('circle', { r: 24, fill: '#333', stroke: 'rgba(255,255,255,.2)', 'stroke-width': 3 }, this.soulIcon);
    this.soulText = S.txt(this.soulIcon, '魂', {
      y: 2, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': 26, 'font-weight': 900, fill: 'rgba(255,255,255,.35)'
    });

    /* ---- 判定文字 ---- */
    this.judgeTextG = S.el('g', {
      transform: 'translate(' + g.judgeX + ',' + fx(g.laneY - 8) + ')', opacity: 0
    }, root);
    this.judgeText = S.txt(this.judgeTextG, '', {
      'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': 40, 'font-weight': 900, fill: '#ffe14d',
      stroke: 'rgba(0,0,0,.65)', 'stroke-width': 6, 'paint-order': 'stroke'
    });

    /* ---- 連打計數 ---- */
    this.rollCounter = S.el('g', {
      transform: 'translate(' + g.judgeX + ',' + fx(g.laneY - 40) + ')', opacity: 0
    }, root);
    S.el('ellipse', { rx: 62, ry: 26, fill: 'rgba(0,0,0,.55)' }, this.rollCounter);
    this.rollCountText = S.txt(this.rollCounter, '0', {
      y: 1, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': 32, 'font-weight': 900, fill: '#ffd24a'
    });

    /* ---- 歌詞字幕 (HTML overlay) ---- */
    this.subtitleEl = document.getElementById('subtitleOverlay');
    this.subtitles = [];
    this._lastSub = '';

    /* ---- HTML 打擊層：蓋住 SVG。真正聽擊打的是 document（見 bindScreenInput） ---- */
    this.hitLayer = document.getElementById('hitLayer');
    this.bindHitLayer(this.hitLayer);

    /* ---- 提示層（READY / 暫停） ---- */
    this.overlay = S.el('g', null, root);

    /* ---- 暫停按鈕（置頂，方便平板／手機點按） ---- */
    this.pauseBtn = S.el('g', { style: 'cursor:pointer' }, root);
    S.el('rect', {
      x: -26, y: -22, width: 52, height: 44, rx: 12,
      fill: 'rgba(8,10,16,.72)', stroke: 'rgba(255,255,255,.4)', 'stroke-width': 2
    }, this.pauseBtn);
    S.el('rect', { x: -10, y: -11, width: 7, height: 22, rx: 2, fill: '#fff' }, this.pauseBtn);
    S.el('rect', { x: 3, y: -11, width: 7, height: 22, rx: 2, fill: '#fff' }, this.pauseBtn);
    this.bindTap(this.pauseBtn, function () {
      if (self.running) self.togglePause();
    });

    this.relayout();
    this.built = true;
  };

  Game.prototype.relayout = function () {
    var g = this.geom();
    this.g = g;
    if (!this.donHolder) return;
    var scale = clamp(g.stageH / 620, 0.62, 1.0);
    var drumScale = scale * 2.0;
    S.tf(this.donHolder, 214, g.H - 196 * scale - 34, scale);
    S.tf(this.drumHolder, g.W / 2, g.H - 150 * drumScale - 10, drumScale);
    if (this.bgHitZone) {
      S.setAttrs(this.bgHitZone, { y: g.stageY, width: g.W, height: g.H - g.stageY });
    }
    if (this.kaGlowL) {
      var halfW = Math.ceil(g.W / 2);
      var stageH = g.H - g.stageY;
      S.setAttrs(this.kaGlowL, { y: g.stageY, width: halfW, height: stageH });
      S.setAttrs(this.kaGlowR, { x: halfW, y: g.stageY, width: halfW, height: stageH });
    }
    if (this.pauseBtn) S.tf(this.pauseBtn, g.W - 40, 30);
    if (this.titleText) this.titleText.setAttribute('x', g.W - 78);
    if (this.subTitleText) this.subTitleText.setAttribute('x', g.W - 78);
    this.positionCrowd();
    this.positionSubtitle();
  };

  Game.prototype.crowdY = function (row) {
    var g = this.g;
    if (row === 'front') return g.H - g.stageH * 0.08;
    if (row === 'mid') return g.H - g.stageH * 0.20;
    return g.stageY + g.stageH * 0.60;
  };

  Game.prototype.spawnCrowd = function () {
    var self = this;
    var bodies = ['#ffd166', '#8fd9a8', '#8fc7ff', '#ffa8c5', '#d3b0ff', '#ffb07a', '#9ee7e0', '#f6a6c1'];
    var skins = ['#ffe0bd', '#f6d0a8', '#ffd8c4', '#e8c49a'];
    var hairs = ['#3a2a20', '#1a120c', '#6a3418', '#2c1b14', '#4a2c1a'];
    var hats = [null, null, 'band', null, 'cone', null];
    this.crowd = [];

    function add(layer, xf, row, unlock, extra) {
      extra = extra || {};
      var i = self.crowd.length;
      var art = S.crowdMember(layer, {
        body: bodies[i % bodies.length],
        skin: skins[i % skins.length],
        hair: hairs[i % hairs.length],
        hairStyle: i % 4,
        hat: extra.hat !== undefined ? extra.hat : hats[i % hats.length],
        flag: extra.flag || null
      });
      self.crowd.push({
        art: art,
        node: art.root,
        xf: xf,
        row: row,
        x: 0,
        y: 0,
        scale: extra.scale || (row === 'back' ? 0.78 : row === 'mid' ? 0.92 : 1.05),
        unlock: unlock,
        appear: unlock <= 0 ? 1 : 0,
        ph: i * 0.41,
        dancer: !!extra.dancer,
        flag: extra.flag || null
      });
      if (unlock <= 0) art.root.setAttribute('opacity', '1');
    }

    var backUnlock = [0, 16, 30, 42, 54, 66, 66, 54, 42, 30, 16, 0];
    var bi;
    for (bi = 0; bi < 12; bi++) {
      add(this.crowdBack, 0.045 + bi * 0.082, 'back', backUnlock[bi], { scale: 0.72 + (bi % 3) * 0.05 });
    }

    var frontL = [[0.045, 22], [0.105, 40], [0.165, 58], [0.225, 74]];
    var frontR = [[0.775, 24], [0.835, 42], [0.895, 60], [0.955, 76]];
    frontL.concat(frontR).forEach(function (p) {
      add(self.crowdFront, p[0], 'front', p[1], { scale: 1.02 });
    });

    var extras = [
      [0.28, 'mid', 86, 0.95], [0.34, 'mid', 90, 0.9],
      [0.66, 'mid', 86, 0.95], [0.72, 'mid', 90, 0.9],
      [0.08, 'mid', 94, 1.0], [0.92, 'mid', 94, 1.0],
      [0.40, 'back', 97, 0.7], [0.60, 'back', 97, 0.7]
    ];
    extras.forEach(function (p) {
      var layer = (p[0] > 0.35 && p[0] < 0.65) ? self.crowdBack : self.crowdFront;
      add(layer, p[0], p[1], p[2], { scale: p[3], hat: p[2] >= 94 ? 'cone' : 'band' });
    });

    add(this.crowdFront, 0.06, 'front', 100, { scale: 1.18, flag: '#e8483a', hat: 'cone', dancer: true });
    add(this.crowdFront, 0.94, 'front', 100, { scale: 1.18, flag: '#ffd24a', hat: 'cone', dancer: true });
    add(this.crowdFront, 0.18, 'mid', 100, { scale: 1.12, hat: 'band', dancer: true });
    add(this.crowdFront, 0.82, 'mid', 100, { scale: 1.12, hat: 'band', dancer: true });

    this.positionCrowd();
  };

  Game.prototype.positionCrowd = function () {
    if (!this.crowd) return;
    var g = this.g;
    for (var i = 0; i < this.crowd.length; i++) {
      var c = this.crowd[i];
      c.x = c.xf * g.W;
      c.y = this.crowdY(c.row);
    }
  };

  Game.prototype.updateCrowd = function (dt, beatPos, gauge) {
    var full = gauge >= 99.5;
    var cheer = clamp(gauge / 100, 0, 1);
    if (this.st && this.st.combo >= 50) cheer = Math.min(1, cheer + 0.1);
    if (this.crowdCheer > 0) {
      this.crowdCheer = Math.max(0, this.crowdCheer - dt * 1.8);
      cheer = Math.min(1, cheer + this.crowdCheer);
    }
    var bounceMul = (0.55 + cheer * 1.15) * (full ? 1.25 : 1);
    var armCheer = -cheer * 78;
    for (var i = 0; i < this.crowd.length; i++) {
      var c = this.crowd[i];
      var want = gauge >= c.unlock - 0.01 ? 1 : 0;
      c.appear += (want - c.appear) * Math.min(1, dt * (want ? 5.5 : 4));
      if (c.appear < 0.004) {
        c.appear = 0;
        c.node.setAttribute('opacity', '0');
        continue;
      }
      var b = Math.abs(Math.sin((beatPos + c.ph) * Math.PI));
      if (c.dancer) b = Math.abs(Math.sin((beatPos * 2 + c.ph) * Math.PI));
      var yOff = (1 - c.appear) * 28 - b * 12 * bounceMul;
      var xOff = c.dancer ? Math.sin(beatPos * Math.PI * 2 + c.ph) * 10 : 0;
      var sc = c.scale * (0.35 + 0.65 * c.appear);
      c.node.setAttribute('opacity', fx(c.appear));
      c.node.setAttribute('transform',
        'translate(' + fx(c.x + xOff) + ',' + fx(c.y + yOff) + ') scale(' + fx(sc) + ')');
      var wob = Math.sin(beatPos * Math.PI * 2 + c.ph) * (10 + cheer * 14);
      c.art.armL.setAttribute('transform', 'translate(-15,-4) rotate(' + fx(armCheer - wob) + ')');
      c.art.armR.setAttribute('transform', 'translate(15,-4) rotate(' + fx(-(armCheer + wob * 0.8)) + ')');
      if (c.art.flag) {
        c.art.flag.setAttribute('transform',
          'translate(22,-6) rotate(' + fx(Math.sin(beatPos * 6 + c.ph) * 16) + ')');
      }
    }
    if (this.festArt) this.festArt.update(dt, full, this.g);
  };

  Game.prototype.positionSubtitle = function () {
    var el = this.subtitleEl;
    var svg = this.svg;
    if (!el || !svg || typeof svg.createSVGPoint !== 'function') return;
    var g = this.g || this.geom();
    var lanternBottom = g.stageY + 76;
    var pt = svg.createSVGPoint();
    pt.x = 0;
    pt.y = lanternBottom + 8;
    var ctm = svg.getScreenCTM();
    if (!ctm) return;
    el.style.top = Math.round(pt.matrixTransform(ctm).y) + 'px';
  };

  /* ------------------------------------------------------------------ *
   * 太鼓觸控 / 滑鼠
   * ------------------------------------------------------------------ */

  Game.prototype.pointerSide = function (e) {
    var w = window.innerWidth || 1280;
    return (e.clientX < w / 2) ? 'l' : 'r';
  };

  Game.prototype.touchSide = function (touch) {
    var w = window.innerWidth || 1280;
    return (touch.clientX < w / 2) ? 'l' : 'r';
  };

  Game.prototype.srtTime = function (h, m, s, frac) {
    var f = 0;
    if (frac) {
      if (frac.length <= 2) f = parseInt(frac, 10) / Math.pow(10, frac.length);
      else f = parseInt(frac.slice(0, 3), 10) / 1000;
    }
    return (+h) * 3600 + (+m) * 60 + (+s) + f;
  };

  Game.prototype.parseSRT = function (text) {
    var subs = [];
    var cleaned = String(text || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim();
    if (!cleaned) return subs;
    cleaned = cleaned.replace(/^WEBVTT[^\n]*\n+/, '');
    var blocks = cleaned.split(/\n\n+/);
    var tsRe = /(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)/;
    for (var i = 0; i < blocks.length; i++) {
      var lines = blocks[i].split('\n').filter(function (ln) { return ln.trim() !== ''; });
      if (!lines.length) continue;
      var tsAt = -1;
      for (var li = 0; li < lines.length; li++) {
        if (tsRe.test(lines[li])) { tsAt = li; break; }
        tsRe.lastIndex = 0;
      }
      if (tsAt < 0) continue;
      var m = lines[tsAt].match(tsRe);
      if (!m) continue;
      var body = lines.slice(tsAt + 1).join(' ').trim();
      if (!body) continue;
      subs.push([
        this.srtTime(m[1], m[2], m[3], m[4]),
        this.srtTime(m[5], m[6], m[7], m[8]),
        body
      ]);
    }
    return subs;
  };

  Game.prototype.subtitleUrl = function (song) {
    if (!song) return '';
    if (song.lyrics) return song.lyrics;
    if (song.id) return 'subtitle/' + encodeURIComponent(song.id) + '.srt';
    return '';
  };

  Game.prototype.fetchSubtitles = function (song) {
    var self = this;
    var url = this.subtitleUrl(song);
    if (!url) return;
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    }).then(function (text) {
      if (self.song !== song) return;
      self.subtitles = self.parseSRT(text);
    }).catch(function () {
      if (self.song !== song) return;
      self.subtitles = [];
    });
  };

  Game.prototype.clearSubtitle = function () {
    this.subtitles = [];
    this._lastSub = '';
    if (this.subtitleEl) {
      this.subtitleEl.textContent = '';
      this.subtitleEl.classList.remove('visible');
    }
  };

  Game.prototype.updateSubtitle = function () {
    if (!this.subtitleEl) return;
    if (!this.subtitles.length) {
      if (this._lastSub) this.clearSubtitle();
      return;
    }
    var t = this.time();
    var cur = '';
    for (var i = 0; i < this.subtitles.length; i++) {
      var s = this.subtitles[i];
      if (t >= s[0] && t <= s[1]) { cur = s[2]; break; }
    }
    if (cur !== this._lastSub) {
      this._lastSub = cur;
      this.subtitleEl.textContent = cur;
      if (cur) this.subtitleEl.classList.add('visible');
      else this.subtitleEl.classList.remove('visible');
    }
  };

  Game.prototype.updateKaGlow = function (dt) {
    var t = this.kaGlowT;
    if (t.l > 0) { t.l = Math.max(0, t.l - dt * 1.2); this.kaGlowL.setAttribute('opacity', t.l); }
    if (t.r > 0) { t.r = Math.max(0, t.r - dt * 1.2); this.kaGlowR.setAttribute('opacity', t.r); }
  };

  Game.prototype.eventSide = function (e) {
    var x = e.clientX;
    if ((x === undefined || x === null) && e.changedTouches && e.changedTouches[0]) {
      x = e.changedTouches[0].clientX;
    }
    var w = window.innerWidth || 1280;
    return (x < w / 2) ? 'l' : 'r';
  };

  /**
   * 同一個物理觸點只算一下。document 與鼓面 SVG 都會收到事件，
   * 先到的登記，後到的（含 iPad 晚 20–40ms 的 pointerdown）丟掉。
   */
  Game.prototype.acceptContact = function (x, y, id, source, stamp) {
    if (!this._touchGate) return true;
    var now = (typeof stamp === 'number' && isFinite(stamp) && stamp > 0)
      ? stamp
      : ((typeof performance !== 'undefined' ? performance.now() : Date.now()));
    return this._touchGate.claim(x, y, id, source, now);
  };

  /** 手指落下的歌曲時間，而不是這段處理函式終於跑到的時間。 */
  Game.prototype.eventWhen = function (e) {
    var perf = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    var stamp = (e && typeof e.timeStamp === 'number' && e.timeStamp > 0) ? e.timeStamp : perf;
    var TG = global.TKTouchGate;
    var song = (TG && TG.songTimeOfHit) ? TG.songTimeOfHit(this.time(), perf, stamp) : this.time();
    return { song: song, real: stamp / 1000 };
  };

  Game.prototype.bindPlayHit = function (node, onHit) {
    var self = this;
    if (node.style) node.style.touchAction = 'manipulation';
    function hitPointer(e) {
      var pt = {
        clientX: e.clientX, clientY: e.clientY, timeStamp: e.timeStamp
      };
      onHit(pt);
    }
    node.addEventListener('pointerdown', function (e) {
      var type = e.pointerType || 'touch';
      var source = type === 'mouse' ? 'mouse' : 'pointer';
      if (source !== 'mouse') self._touchPreferred = true;
      if (e.cancelable) e.preventDefault();
      if (!self.acceptContact(e.clientX, e.clientY, e.pointerId, source, e.timeStamp)) return;
      hitPointer(e);
    });
    node.addEventListener('touchstart', function (e) {
      self._touchPreferred = true;
      if (e.cancelable) e.preventDefault();
      var touches = e.changedTouches || [];
      for (var i = 0; i < touches.length; i++) {
        var t = touches[i];
        if (!self.acceptContact(t.clientX, t.clientY, t.identifier, 'touch', e.timeStamp)) continue;
        onHit({ clientX: t.clientX, clientY: t.clientY, timeStamp: e.timeStamp });
      }
    }, { passive: false });
    node.addEventListener('touchmove', function (e) {
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
    node.addEventListener('touchend', function (e) {
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
  };

  Game.prototype.setHitLayer = function (on) {
    if (!this.hitLayer && typeof document !== 'undefined' && document.getElementById) {
      this.hitLayer = document.getElementById('hitLayer');
    }
    this.bindScreenInput();
    this._screenTouchOn = !!on;
    if (on && this._touchGate) this._touchGate.reset();
    if (!this.hitLayer) return;
    if (on) this.hitLayer.classList.add('active');
    else this.hitLayer.classList.remove('active');
  };

  /**
   * 聽在 document 上，而不是只聽全螢幕 div。
   * iOS 在同一層快速連點時會漏掉 touchstart；譜面一密更容易發生。
   * touchmove 也要 preventDefault，否則系統仍會把連點當成雙擊縮放或捲動而吞掉下一下。
   */
  Game.prototype.bindScreenInput = function () {
    if (this._screenInputBound) return;
    if (typeof document === 'undefined' || !document.addEventListener) return;
    this._screenInputBound = true;
    var self = this;
    var doc = document;

    function playing() {
      return self._screenTouchOn && self.running && !self.paused;
    }

    doc.addEventListener('touchstart', function (e) {
      if (!playing()) return;
      self._touchPreferred = true;
      if (e.cancelable) e.preventDefault();
      var list = e.changedTouches || [];
      var when = self.eventWhen(e);
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        if (!self.acceptContact(t.clientX, t.clientY, t.identifier, 'touch', e.timeStamp)) continue;
        self.hitFromClient(t.clientX, t.clientY, when);
      }
    }, { passive: false, capture: true });

    doc.addEventListener('touchmove', function (e) {
      if (!playing()) return;
      if (e.cancelable) e.preventDefault();
    }, { passive: false, capture: true });

    doc.addEventListener('touchend', function (e) {
      if (!self._screenTouchOn) return;
      if (e.cancelable) e.preventDefault();
    }, { passive: false, capture: true });

    doc.addEventListener('touchcancel', function (e) {
      if (!self._screenTouchOn) return;
      if (e.cancelable) e.preventDefault();
    }, { passive: false, capture: true });

    doc.addEventListener('pointerdown', function (e) {
      if (!playing()) return;
      var type = e.pointerType || 'touch';
      if (e.cancelable) e.preventDefault();
      if (type === 'mouse') {
        if (!self.acceptContact(e.clientX, e.clientY, e.pointerId, 'mouse', e.timeStamp)) return;
        self.hitFromClient(e.clientX, e.clientY, self.eventWhen(e));
        return;
      }
      self._touchPreferred = true;
      if (!self.acceptContact(e.clientX, e.clientY, e.pointerId, 'pointer', e.timeStamp)) return;
      self.hitFromClient(e.clientX, e.clientY, self.eventWhen(e));
    }, true);

    doc.addEventListener('gesturestart', function (e) {
      if (self._screenTouchOn && e.cancelable) e.preventDefault();
    }, { passive: false, capture: true });

    doc.addEventListener('contextmenu', function (e) {
      if (self._screenTouchOn) e.preventDefault();
    }, true);
  };

  Game.prototype.clientToSvg = function (x, y) {
    var svg = this.svg;
    if (!svg || typeof svg.createSVGPoint !== 'function') return null;
    var ctm = svg.getScreenCTM();
    if (!ctm) return null;
    var pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(ctm.inverse());
  };

  Game.prototype.hitFromClient = function (x, y, when) {
    if (!this.running || this.paused) return;
    var g = this.g || this.geom();
    var p = this.clientToSvg(x, y);
    var sx = p ? p.x : (x / (window.innerWidth || 1)) * g.W;
    var sy = p ? p.y : (y / (window.innerHeight || 1)) * g.H;

    if (sx >= g.W - 70 && sy <= 58) {
      this.togglePause();
      return;
    }
    if (sy < g.laneY) return;

    var scale = clamp(g.stageH / 620, 0.62, 1.0);
    var drumScale = scale * 2.0;
    var R = 112 * drumScale;
    var cx = g.W / 2;
    var cy = g.H - 150 * drumScale - 10;
    var dx = sx - cx;
    var dy = sy - cy;
    var inFace = dx * dx + dy * dy <= (R * 1.02) * (R * 1.02);
    var inBody = Math.abs(dx) <= R * 0.86 && dy >= -R * 0.12 && dy <= R * 0.95;
    var kind = (inFace || inBody) ? 'don' : 'ka';
    this.input(kind, sx < g.W / 2 ? 'l' : 'r', false, when);
  };

  Game.prototype.bindHitLayer = function (el) {
    if (el) el._taikoBound = true;
    this.bindScreenInput();
  };

  Game.prototype.bindDrumPointer = function () {
    var self = this;
    var map = { dl: ['don', 'l'], dr: ['don', 'r'] };
    Object.keys(this.drum.zones).forEach(function (id) {
      var z = self.drum.zones[id];
      self.bindPlayHit(z.g, function (e) {
        var m = map[id];
        self.input(m[0], m[1], false, self.eventWhen(e));
      });
    });
    // 鼓面其他地方（iPad 點不到半圓 zone 時）仍算咚
    this.bindPlayHit(this.drumHolder, function (e) {
      self.input('don', self.eventSide(e), false, self.eventWhen(e));
    });
  };

  /* ------------------------------------------------------------------ *
   * 開始遊玩
   * ------------------------------------------------------------------ */

  /**
   * @param {object} song    歌曲 metadata
   * @param {object} chart   { level, scoreInit, scroll, notes:[...] }
   * @param {string} diffKey easy|normal|hard|oni
   * @param {AudioBuffer} buffer
   */
  Game.prototype.start = function (song, chart, diffKey, buffer, options) {
    this.build();
    options = options || {};
    var g = this.g;
    var CG = global.TaikoChartGen;
    var diffCfg = CG.DIFFS[diffKey];

    this.song = song;
    this.clearSubtitle();
    this.fetchSubtitles(song);
    this.chart = chart;
    this.diffKey = diffKey;
    this.speedMult = options.speed || 1;
    this.autoPlay = !!options.autoPlay;

    // 音符
    var raw = CG.expandNotes(chart.notes);
    var notes = [];
    for (var i = 0; i < raw.length; i++) {
      var n = raw[i];
      notes.push({
        idx: i, t: n.t, type: n.type, dur: n.dur || 0, hits: n.hits || 0,
        ka: (n.type === 2 || n.type === 4),
        big: (n.type === 3 || n.type === 4 || n.type === 6),
        isRoll: (n.type === 5 || n.type === 6 || n.type === 7),
        isBalloon: n.type === 7,
        judged: false, hit: false, done: false, rollHits: 0, view: null
      });
    }
    this.notes = notes;
    this.taps = notes.filter(function (n) { return !n.isRoll; });
    this.rolls = notes.filter(function (n) { return n.isRoll; });

    // 判定與計分參數
    this.win = diffCfg.strictJudge ? JUDGE_WIN.strict : JUDGE_WIN.lenient;
    this.scoreInit = chart.scoreInit || 1000;
    var total = Math.max(1, this.taps.length);
    // 跟原作一樣：魂ゲージ在命中率達到 normaRate 時就會滿格（良算 1、可算 0.5），
    // 而合格線只在 80% 的位置，所以實際合格門檻是 normaRate 的八成。
    // 打得好的話中途就會滿格，之後再靠不可扣回來。
    this.goodGain = 100 / (diffCfg.normaRate * total);
    this.okGain = this.goodGain * 0.5;
    this.missLoss = this.goodGain * diffCfg.missMult;

    // 狀態
    this.st = {
      score: 0, shownScore: 0, combo: 0, maxCombo: 0,
      good: 0, ok: 0, bad: 0, rollHits: 0, gauge: 0, shownGauge: 0,
      clearFlag: false, finished: false
    };
    this.tapCursor = 0;
    this.rollCursor = 0;
    this.activeRoll = null;
    this.viewLo = 0; this.viewHi = 0;
    this.pendingBig = null;
    this._chain = null;
    this._pendingHit = null;
    if (this._touchGate) this._touchGate.reset();
    this.lastRealTime = 0;

    // 捲動速度：判定點到右邊界的像素／秒
    var travelPx = g.W + 90 - g.judgeX;
    var bpm = song.bpm || chart.bpm || 130;
    var travelSec = clamp(4 * 60 / bpm, 1.3, 2.4) / (chart.scroll || 1) / this.speedMult;
    this.pps = travelPx / travelSec;
    this.bpm = bpm;
    this.beat = 60 / bpm;
    this.songOffset = song.offset || 0;
    var rawChanges = song.bpmChanges;
    var tempoMap = (rawChanges && rawChanges.length)
      ? CG.normalizeBpmChanges(bpm, this.songOffset, rawChanges)
      : null;
    // 沒有變速點時維持原本的等速節拍，避免小節線跟舊譜差一個浮點誤差
    this.tempoMap = (tempoMap && tempoMap.length > 1) ? tempoMap : null;

    // 小節線
    this.bars = [];
    var endT = buffer ? buffer.duration : (notes.length ? notes[notes.length - 1].t + 4 : 60);
    if (this.tempoMap) {
      this.bars = CG.barTimes(this.songOffset, bpm, endT, rawChanges);
    } else {
      for (var bt = this.songOffset; bt < endT + 4; bt += this.beat * 4) {
        if (bt > -4) this.bars.push(bt);
      }
    }
    this.barPool = [];
    S.clear(this.barLayer);
    for (var bi = 0; bi < 26; bi++) {
      this.barPool.push(S.el('rect', {
        x: 0, y: g.laneY + 6, width: 3, height: g.laneH - 12,
        fill: 'rgba(255,255,255,.22)', opacity: 0
      }, this.barLayer));
    }

    // 清空音符節點
    S.clear(this.noteLayer);
    S.clear(this.fxLayer);
    this.notePool = [];
    this.effects = [];
    this.fxPool = [];

    // 面板
    S.clear(this.panelDiff);
    S.diffIcon(this.panelDiff, diffKey, 44, '#ffffff');
    S.txt(this.panelDiff, (global.TKI18n && global.TKI18n.diffName) ? global.TKI18n.diffName(diffKey) : diffCfg.jp, {
      y: 44, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': 15, 'font-weight': 800, fill: 'rgba(255,255,255,.75)'
    });
    S.txt(this.panelDiff, '★' + (chart.level || 1), {
      y: 66, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': 15, 'font-weight': 800, fill: diffCfg.color
    });

    this.titleText.textContent = (global.TKI18n && global.TKI18n.songTitle) ? global.TKI18n.songTitle(song) : (song.title || '');
    this.subTitleText.textContent = (global.TKI18n && global.TKI18n.songSub) ? global.TKI18n.songSub(song) : (song.subtitle || song.titleZh || '');
    if (this.comboLabel) {
      this.comboLabel.textContent = tr('combo');
      this.comboLabel.setAttribute('font-size', (global.TKI18n && global.TKI18n.lang === 'en') ? 15 : 17);
    }
    this.scoreText.textContent = '0';
    this.comboNum.textContent = '';
    S.show(this.comboBox, false);
    this.comboMilestone = 0;
    this.crowdCheer = 0;
    if (this.comboFx) this.comboFx.setTier(0);
    if (this.crowd) {
      for (var ci = 0; ci < this.crowd.length; ci++) {
        this.crowd[ci].appear = this.crowd[ci].unlock <= 0 ? 1 : 0;
        this.crowd[ci].node.setAttribute('opacity', this.crowd[ci].appear ? '1' : '0');
      }
    }
    this.mood = 'idle';
    this.don.setMood('idle');
    if (this.bgClear) this.bgClear.setAttribute('opacity', 0);
    this._soulState = 'empty';
    if (this.soulCircle) {
      this.soulCircle.setAttribute('fill', '#333');
      this.soulCircle.setAttribute('stroke', 'rgba(255,255,255,.2)');
    }
    if (this.soulText) this.soulText.setAttribute('fill', 'rgba(255,255,255,.35)');
    if (this.soulFlame) this.soulFlame.reset();
    if (this.gaugeFlame) this.gaugeFlame.reset();
    if (this.gaugeFill) this.gaugeFill.setAttribute('width', 0);
    if (this.gaugeClearFill) {
      this.gaugeClearFill.setAttribute('width', 0);
      this.gaugeClearFill.setAttribute('opacity', 0);
    }
    this.kaGlowT = { l: 0, r: 0 };
    if (this.kaGlowL) this.kaGlowL.setAttribute('opacity', 0);
    if (this.kaGlowR) this.kaGlowR.setAttribute('opacity', 0);
    this._autoHand = 'l';

    // 合格線標記
    S.clear(this.clearMark);
    var gg = this.gaugeGeom;
    var cx = gg.x + gg.w * 0.8;
    S.el('rect', { x: fx(cx - 2), y: gg.y - 5, width: 4, height: gg.h + 10, fill: '#ffd24a', opacity: 0.9 }, this.clearMark);
    S.el('path', {
      d: 'M' + fx(cx) + ',' + fx(gg.y - 7) + ' l-7,-9 h14 z', fill: '#ffd24a'
    }, this.clearMark);

    // 音訊
    this.player.load(buffer);
    this.startedAt = 0;
    this.leadIn = 2.4;
    this.player.play(-this.leadIn, 0.15);
    this.running = true;
    this.paused = false;
    this._autoRollAt = -9;
    this._autoRollSide = 'l';
    this.setHitLayer(!this.autoPlay);
    if (this.watchBadge) {
      this.watchBadge.setAttribute('opacity', this.autoPlay ? 1 : 0);
      if (this.watchBadgeText) this.watchBadgeText.textContent = tr('watchMode');
    }
    this.showOverlayText('READY', this.autoPlay ? tr('watchReadyHint') : '');
    var self = this;
    setTimeout(function () { self.hideOverlay(); }, 1400);
  };

  Game.prototype.bindTap = function (node, fn) {
    node.addEventListener('touchstart', function (e) {
      e.preventDefault();
      e.stopPropagation();
      fn();
    }, { passive: false });
    node.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      e.preventDefault();
      e.stopPropagation();
      fn();
    });
  };

  Game.prototype.showOverlayText = function (str, sub) {
    S.clear(this.overlay);
    var g = this.g;
    var y = g.stageY + g.stageH * 0.30;
    S.txt(this.overlay, str, {
      x: g.W / 2, y: y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': 76, 'font-weight': 900, fill: '#ffffff',
      stroke: 'rgba(0,0,0,.6)', 'stroke-width': 9, 'paint-order': 'stroke'
    });
    if (sub) {
      S.txt(this.overlay, sub, {
        x: g.W / 2, y: y + 62, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 22, 'font-weight': 700, fill: 'rgba(255,255,255,.85)'
      });
    }
  };

  Game.prototype.hideOverlay = function () { S.clear(this.overlay); };

  Game.prototype.pauseButton = function (x, y, w, h, label, color, onClick) {
    var g = S.el('g', { style: 'cursor:pointer' }, this.overlay);
    S.el('rect', {
      x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2,
      fill: color, stroke: 'rgba(0,0,0,.35)', 'stroke-width': 3
    }, g);
    S.el('rect', {
      x: x - w / 2 + 6, y: y - h / 2 + 5, width: w - 12, height: h * 0.36, rx: h * 0.18,
      fill: 'rgba(255,255,255,.22)'
    }, g);
    S.txt(g, label, {
      x: x, y: y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': 24, 'font-weight': 800, fill: '#fff',
      stroke: 'rgba(0,0,0,.35)', 'stroke-width': 4, 'paint-order': 'stroke'
    });
    this.bindTap(g, function () { A.sfx.select(); onClick(); });
    return g;
  };

  Game.prototype.showPauseMenu = function () {
    S.clear(this.overlay);
    var g = this.g;
    var self = this;
    var dim = S.el('rect', {
      x: 0, y: 0, width: g.W, height: g.H,
      fill: 'rgba(0,0,0,.55)'
    }, this.overlay);
    this.bindTap(dim, function () { });

    var y0 = g.stageY + g.stageH * 0.22;
    S.txt(this.overlay, 'PAUSE', {
      x: g.W / 2, y: y0, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': 64, 'font-weight': 900, fill: '#ffffff',
      stroke: 'rgba(0,0,0,.6)', 'stroke-width': 8, 'paint-order': 'stroke'
    });
    S.txt(this.overlay, tr('pauseHint'), {
      x: g.W / 2, y: y0 + 48, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-size': 16, 'font-weight': 700, fill: 'rgba(255,255,255,.7)'
    });
    this.pauseButton(g.W / 2, y0 + 118, 300, 64, tr('resume'), '#3f7fd0', function () {
      self.togglePause();
    });
    this.pauseButton(g.W / 2, y0 + 198, 300, 64, tr('restart'), '#e8443a', function () {
      self.onRestart();
    });
    this.pauseButton(g.W / 2, y0 + 278, 300, 64, tr('backToSongs'), '#63a34a', function () {
      self.onQuitToSongs();
    });
  };

  /* ------------------------------------------------------------------ *
   * 暫停
   * ------------------------------------------------------------------ */

  Game.prototype.togglePause = function () {
    if (!this.running) return;
    if (this.paused) {
      this.paused = false;
      this.hideOverlay();
      this.setHitLayer(!this.autoPlay);
      this.player.resumeFrom(0);
    } else {
      this.paused = true;
      this.setHitLayer(false);
      this.player.pause();
      this.showPauseMenu();
    }
  };

  Game.prototype.stop = function () {
    this.running = false;
    this.paused = false;
    this.setHitLayer(false);
    this.player.stop();
    this.hideOverlay();
    this.clearSubtitle();
  };

  /* ------------------------------------------------------------------ *
   * 時間
   * ------------------------------------------------------------------ */

  Game.prototype.time = function () {
    return this.player.time() + (A.settings.offsetMs / 1000);
  };

  /* ------------------------------------------------------------------ *
   * 輸入
   * ------------------------------------------------------------------ */

  Game.prototype.input = function (kind, side, fromAuto, when) {
    if (!this.running || this.paused) return;
    if (this.autoPlay && !fromAuto) return;
    // 連打被擠在同一個影格才送達時，仍用每一下真正落下的時間，避免整串對到同一顆。
    var now = (when && typeof when.song === 'number') ? when.song : this.time();
    // 先把已經穿過判定窗的音符記成不可，再看這一擊。否則後面的紅會先算到，藍還掛在畫面上。
    this.expireNotes(now);
    var real = (when && typeof when.real === 'number')
      ? when.real
      : ((typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000);
    var isKa = kind === 'ka';

    // 音效與演出
    if (kind === 'don') A.don(); else A.ka();
    this.drum.flash((kind === 'don' ? 'd' : 'k') + side);
    if (kind === 'ka') this.kaGlowT[side] = 0.18;
    this.don.swing(side);

    var key = kind + (side === 'l' ? 'L' : 'R');
    this.lastPress[key] = real;

    // 大音符的另一手補打
    if (this.pendingBig && this.pendingBig.need === key && real - this.pendingBig.at < 0.06) {
      this.applyBigUpgrade();
      return;
    }

    // 連打中
    if (this.activeRoll && now >= this.activeRoll.t - 0.05 && now <= this.activeRoll.t + this.activeRoll.dur) {
      this.hitRoll(this.activeRoll);
      return;
    }

    // 只打最前面那一顆。太早是空打；顏色不對就是這顆不可，不會順到後面的音符。
    var n = this.findJudgeable(now);
    if (!n) return;
    var dt = now - n.t;
    var ad = Math.abs(dt);
    if (ad > this.win.bad) return;

    if (n.ka !== isKa) {
      // 紅被打成藍、藍被打成紅都記不可，音符都留在軌道上繼續往左流。
      // 這一擊仍然只結算最前面那顆，後面的音符不能先算到。
      this.judgeNote(n, 'bad', dt, side, true);
      return;
    }
    var result = ad <= this.win.good ? 'good' : ad <= this.win.ok ? 'ok' : 'bad';
    this.judgeNote(n, result, dt, side);
  };

  /**
   * 判定窗已經走完的音符先記成不可。
   * 擊打與每幀更新都走這裡，避免「藍還沒結算，下一顆紅已經良」。
   */
  Game.prototype.expireNotes = function (now) {
    while (this.tapCursor < this.taps.length) {
      var tn = this.taps[this.tapCursor];
      if (tn.judged) { this.tapCursor++; continue; }
      if (!(now - tn.t > this.win.bad)) break;
      this.missNote(tn);
      this.tapCursor++;
    }
  };

  Game.prototype.findJudgeable = function (now) {
    for (var i = this.tapCursor; i < this.taps.length; i++) {
      var n = this.taps[i];
      if (n.judged) continue;
      if (Math.abs(now - n.t) > this.win.bad) return null;
      return n;
    }
    return null;
  };

  /* ------------------------------------------------------------------ *
   * 判定
   * ------------------------------------------------------------------ */

  Game.prototype.judgeNote = function (n, result, dt, side, keepOnLane) {
    n.judged = true;
    var st = this.st;
    var g = this.g;

    if (result === 'bad') {
      st.bad++;
      st.combo = 0;
      st.gauge = clamp(st.gauge - this.missLoss, 0, 100);
      if (!keepOnLane) this.dismissNote(n);
      this.popJudge(tr('judgeBad'), '#7ea3c9');
      this.updateCombo();
      return;
    }

    n.hit = true;
    var base = result === 'good' ? this.scoreInit : Math.floor(this.scoreInit / 2 / 10) * 10;
    if (result === 'good') { st.good++; st.gauge = clamp(st.gauge + this.goodGain, 0, 100); }
    else { st.ok++; st.gauge = clamp(st.gauge + this.okGain, 0, 100); }

    st.combo++;
    if (st.combo > st.maxCombo) st.maxCombo = st.combo;

    var gain = base + comboBonus(st.combo);
    st.score += gain;

    // 大音符：另一手在 60ms 內補上就是雙倍
    if (n.big) {
      var real = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      var kind = n.ka ? 'ka' : 'don';
      var otherKey = kind + (side === 'l' ? 'R' : 'L');
      if (real - this.lastPress[otherKey] < 0.06) {
        st.score += gain;
        this.spawnHitFx(n, result, true);
        this.popJudge(result === 'good' ? tr('judgeGood') : tr('judgeOk'), result === 'good' ? '#ffe14d' : '#ffffff', true);
        this.updateCombo();
        this.flashJudge(result);
        return;
      }
      this.pendingBig = { note: n, need: otherKey, at: real, gain: gain, result: result };
    }

    this.spawnHitFx(n, result, false);
    this.popJudge(result === 'good' ? tr('judgeGood') : tr('judgeOk'), result === 'good' ? '#ffe14d' : '#ffffff');
    this.flashJudge(result);
    this.updateCombo();
  };

  Game.prototype.applyBigUpgrade = function () {
    var p = this.pendingBig;
    this.pendingBig = null;
    if (!p) return;
    this.st.score += p.gain;
    this.spawnHitFx(p.note, p.result, true);
  };

  Game.prototype.missNote = function (n) {
    n.judged = true;
    this.st.bad++;
    this.st.combo = 0;
    this.st.gauge = clamp(this.st.gauge - this.missLoss, 0, 100);
    // 沒打到的音符繼續沿軌道往左走。左側黑面板蓋在音符層上面，滑進去就看不見。
    this.popJudge(tr('judgeBad'), '#7ea3c9');
    this.updateCombo();
  };

  /** 打對顏色但落在不可窗時才立刻離場。打錯顏色與沒打到的錯過都留在軌道上。 */
  Game.prototype.dismissNote = function (n) {
    n.hit = true;
    if (n.view) this.releaseNote(n);
  };

  /** 左緣已經越過畫面左界。寬螢幕的留白在這條線外面，不能再畫。 */
  Game.prototype.pastLeftEdge = function (x, radius) {
    return x - radius <= 0;
  };

  Game.prototype.hitRoll = function (r) {
    if (r.isBalloon && r.rollHits >= r.hits) return;   // 已經打爆了
    r.rollHits++;
    this.st.rollHits++;
    if (r.isBalloon) {
      if (r.rollHits >= r.hits) {
        this.st.score += 5000;
        r.popped = true;
        A.pop();
        this.spawnBalloonPop();
        this.rollCounter.setAttribute('opacity', 0);
        if (r.view) r.view.head.setAttribute('opacity', 0);
        this.flashJudge('roll');
        return;
      }
      this.st.score += 300;
    } else {
      this.st.score += (r.type === 6 ? 200 : 100);
    }
    this.rollCountText.textContent = r.isBalloon
      ? Math.max(0, r.hits - r.rollHits) : r.rollHits;
    this.rollCounter.setAttribute('opacity', 1);
    this.flashJudge('roll');
  };

  function comboTier(combo) {
    if (combo >= 300) return 300;
    if (combo >= 200) return 200;
    if (combo >= 100) return 100;
    if (combo >= 50) return 50;
    if (combo >= 10) return 10;
    return 0;
  }

  Game.prototype.updateCombo = function () {
    var c = this.st.combo;
    if (c < 10) {
      S.show(this.comboBox, false);
      this.comboMilestone = 0;
      if (this.comboFx) this.comboFx.setTier(0);
      return;
    }
    S.show(this.comboBox, true);
    this.comboNum.textContent = c;
    var tier = comboTier(c);
    var fills = { 10: '#ffffff', 50: '#ffe89a', 100: '#ffd24a', 200: '#ff9c1a', 300: '#ff6ad5' };
    this.comboNum.setAttribute('fill', fills[tier] || '#ffffff');
    this.comboPulse = 1;
    if (this.comboFx) {
      this.comboFx.setTier(tier);
      if (tier > (this.comboMilestone || 0)) {
        this.comboFx.burst(tier);
        this.crowdCheer = tier >= 100 ? 1 : 0.55;
        this.comboMilestone = tier;
      }
    }
  };

  Game.prototype.popJudge = function (label, color, big) {
    this.judgeText.textContent = label;
    this.judgeText.setAttribute('fill', color);
    this.judgeText.setAttribute('font-size', big ? 52 : 40);
    this.judgeTextG.setAttribute('opacity', 1);
    this.judgeAnim = 1;
  };

  Game.prototype.flashJudge = function (kind) {
    this.judgeFlashT = 1;
    this.judgeFlash.setAttribute('fill', kind === 'good' ? '#fff3b0' : kind === 'roll' ? '#ffd24a' : '#ffffff');
  };

  /* ------------------------------------------------------------------ *
   * 打擊特效
   * ------------------------------------------------------------------ */

  Game.prototype.takeFx = function () {
    var f = this.fxPool.pop();
    if (!f) {
      var g = S.el('g', { 'pointer-events': 'none' }, this.fxLayer);
      var c = S.el('circle', { r: NOTE_R, fill: 'url(#gradDon)' }, g);
      var ring = S.el('circle', { r: NOTE_R, fill: 'none', stroke: '#fff', 'stroke-width': 5 }, g);
      f = { g: g, c: c, ring: ring };
    }
    f.g.style.display = '';
    return f;
  };

  Game.prototype.spawnHitFx = function (n, result, big) {
    var g = this.g;
    var f = this.takeFx();
    var r = (n.big ? NOTE_R_BIG : NOTE_R) * (big ? 1.15 : 1);
    f.c.setAttribute('r', r);
    f.ring.setAttribute('r', r);
    f.c.setAttribute('fill', n.ka ? 'url(#gradKa)' : 'url(#gradDon)');
    // 從音符被打到的位置飛出，不要瞬移回判定圈。
    // 可判定或加速捲動時，音符離圈可能有上百像素，從圈上起飛會像「跳回去再彈走」。
    var x = g.judgeX + (n.t - this.time()) * this.pps;
    this.effects.push({
      f: f, t: 0, life: 0.55, x0: x, y0: g.laneMid,
      vx: 400, vy: -580, gr: 980
    });
    if (n.view) this.releaseNote(n);
  };

  Game.prototype.spawnBalloonPop = function () {
    var g = this.g;
    for (var i = 0; i < 8; i++) {
      var f = this.takeFx();
      var r = 12 + Math.random() * 8;
      f.c.setAttribute('r', r);
      f.ring.setAttribute('r', r);
      f.c.setAttribute('fill', 'url(#gradBalloon)');
      var a = (i / 8) * Math.PI * 2;
      this.effects.push({
        f: f, t: 0, life: 0.5, x0: g.judgeX, y0: g.laneMid,
        vx: Math.cos(a) * 340, vy: Math.sin(a) * 340 - 120, gr: 700
      });
    }
  };

  /* ------------------------------------------------------------------ *
   * 音符節點池
   * ------------------------------------------------------------------ */

  Game.prototype.takeNote = function () {
    var v = this.notePool.pop();
    if (!v) v = S.makeNoteNode(this.noteLayer);
    v.root.style.display = '';
    // 剛進場的音符排在最底層，越早該打的音符就疊在越上面（與原作一致）
    this.noteLayer.insertBefore(v.root, this.noteLayer.firstChild);
    return v;
  };

  Game.prototype.releaseNote = function (n) {
    if (!n.view) return;
    n.view.root.style.display = 'none';
    this.notePool.push(n.view);
    n.view = null;
  };

  Game.prototype.drawNote = function (n, x) {
    var g = this.g;
    var v = n.view;
    var y = g.laneMid;
    var r = n.big ? NOTE_R_BIG : NOTE_R;

    if (n.isRoll) {
      var len = n.dur * this.pps;
      if (n.isBalloon) {
        // 風船：到達判定圈後固定在原地，每打一下就縮小一點
        S.show(v.roll, false);
        if (n.popped) { v.head.setAttribute('opacity', 0); return; }
        var active = this.activeRoll === n;
        var bx = active ? g.judgeX : x;
        var remain = Math.max(0, n.hits - n.rollHits);
        var scale = active ? clamp(0.5 + 0.5 * (remain / Math.max(1, n.hits)), 0.32, 1.15) : 1;
        v.circle.setAttribute('r', NOTE_R_BIG * scale);
        v.ring.setAttribute('r', NOTE_R_BIG * scale);
        v.inner.setAttribute('r', NOTE_R_BIG * scale * 0.6);
        v.circle.setAttribute('fill', 'url(#gradBalloon)');
        S.tf(v.head, bx, y);
        v.head.setAttribute('opacity', 1);
        return;
      }
      // 連打條
      S.show(v.roll, true);
      v.head.setAttribute('opacity', 1);
      var rr = n.big ? NOTE_R_BIG : NOTE_R;
      var x0 = x, x1 = x + len;
      v.rollBody.setAttribute('d',
        'M' + fx(x0) + ',' + fx(y - rr) +
        ' H' + fx(x1) + ' A' + rr + ',' + rr + ' 0 0 1 ' + fx(x1) + ',' + fx(y + rr) +
        ' H' + fx(x0) + ' A' + rr + ',' + rr + ' 0 0 1 ' + fx(x0) + ',' + fx(y - rr) + 'Z');
      v.rollBody.setAttribute('transform', '');
      v.circle.setAttribute('r', rr);
      v.ring.setAttribute('r', rr);
      v.inner.setAttribute('r', rr * 0.62);
      v.circle.setAttribute('fill', 'url(#gradRoll)');
      S.tf(v.head, x, y);
      return;
    }

    S.show(v.roll, false);
    v.circle.setAttribute('r', r);
    v.ring.setAttribute('r', r);
    v.inner.setAttribute('r', r * 0.62);
    v.circle.setAttribute('fill', n.ka ? 'url(#gradKa)' : 'url(#gradDon)');
    v.head.setAttribute('opacity', n.hit ? 0 : 1);
    S.tf(v.head, x, y);
  };

  /* ------------------------------------------------------------------ *
   * 每幀更新
   * ------------------------------------------------------------------ */

  Game.prototype.update = function (rt) {
    if (!this.running) return;
    var dt = clamp(rt - this.lastRealTime, 0, 0.06);
    this.lastRealTime = rt;
    if (this.paused) { this.drum.update(dt); this.updateKaGlow(dt); return; }

    var g = this.g;
    var now = this.time();
    var beatPos = this.tempoMap
      ? CG.beatAt(this.tempoMap, now)
      : (now - this.songOffset) / this.beat;

    /* --- 演奏模式先打完到期音符，避免掉幀被判不可 --- */
    if (this.autoPlay) this.autoStep(now);

    /* --- 錯過的音符（沒有擊打時也要自己結算，不能等下一顆先被打到） --- */
    this.expireNotes(now);

    /* --- 大音符補打逾時 --- */
    if (this.pendingBig) {
      var realNow = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      if (realNow - this.pendingBig.at > 0.06) this.pendingBig = null;
    }

    /* --- 連打狀態 --- */
    var ar = null;
    for (var ri = this.rollCursor; ri < this.rolls.length; ri++) {
      var r = this.rolls[ri];
      if (now > r.t + r.dur) {
        if (!r.done) { r.done = true; r.judged = true; }
        if (ri === this.rollCursor) this.rollCursor++;
        continue;
      }
      if (now >= r.t) ar = r;
      break;
    }
    if (ar !== this.activeRoll) {
      if (this.activeRoll) this.rollCounter.setAttribute('opacity', 0);
      this.activeRoll = ar;
      if (ar) {
        this.rollCountText.textContent = ar.isBalloon ? ar.hits : 0;
        this.rollCounter.setAttribute('opacity', 1);
      }
    }
    if (this.autoPlay) this.autoStepRolls(now);

    /* --- 小節線 --- */
    var leftT = now - (g.judgeX + 60) / this.pps;
    var rightT = now + (g.W + 90 - g.judgeX) / this.pps;
    var bp = 0;
    for (var bi = 0; bi < this.bars.length && bp < this.barPool.length; bi++) {
      var bt = this.bars[bi];
      if (bt < leftT) continue;
      if (bt > rightT) break;
      var barX = g.judgeX + (bt - now) * this.pps;
      var node = this.barPool[bp++];
      node.setAttribute('x', fx(barX));
      node.setAttribute('opacity', barX < 0 ? 0 : 0.9);
    }
    for (; bp < this.barPool.length; bp++) this.barPool[bp].setAttribute('opacity', 0);

    /* --- 音符 --- */
    var notes = this.notes;
    while (this.viewLo < notes.length) {
      var nl = notes[this.viewLo];
      var endT = nl.t + (nl.isRoll ? nl.dur : 0);
      if (endT < leftT - 0.4) { this.releaseNote(nl); this.viewLo++; continue; }
      break;
    }
    while (this.viewHi < notes.length && notes[this.viewHi].t <= rightT) this.viewHi++;
    for (var vi = this.viewLo; vi < this.viewHi; vi++) {
      var n = notes[vi];
      if (n.hit && !n.isRoll) { if (n.view) this.releaseNote(n); continue; }
      var nx = g.judgeX + (n.t - now) * this.pps;
      if (!n.isRoll && this.pastLeftEdge(nx, n.big ? NOTE_R_BIG : NOTE_R)) {
        if (n.view) this.releaseNote(n);
        continue;
      }
      if (!n.view) n.view = this.takeNote();
      this.drawNote(n, nx);
    }

    /* --- 特效 --- */
    for (var ei = this.effects.length - 1; ei >= 0; ei--) {
      var e = this.effects[ei];
      e.t += dt;
      var p = e.t / e.life;
      if (p >= 1) {
        e.f.g.style.display = 'none';
        this.fxPool.push(e.f);
        this.effects.splice(ei, 1);
        continue;
      }
      var ex = e.x0 + e.vx * e.t;
      var ey = e.y0 + e.vy * e.t + 0.5 * e.gr * e.t * e.t;
      S.tf(e.f.g, ex, ey);
      e.f.g.setAttribute('opacity', fx(1 - p * p));
    }

    /* --- 判定圈閃光 --- */
    if (this.judgeFlashT > 0) {
      this.judgeFlashT = Math.max(0, this.judgeFlashT - dt * 6);
      this.judgeFlash.setAttribute('opacity', fx(this.judgeFlashT * 0.55));
      this.judgeFlash.setAttribute('r', fx(NOTE_R_BIG * (1 + (1 - this.judgeFlashT) * 0.25)));
    }

    /* --- 判定文字 --- */
    if (this.judgeAnim > 0) {
      this.judgeAnim = Math.max(0, this.judgeAnim - dt * 2.6);
      var jp = 1 - this.judgeAnim;
      this.judgeTextG.setAttribute('opacity', fx(this.judgeAnim > 0.75 ? 1 : this.judgeAnim / 0.75));
      this.judgeTextG.setAttribute('transform',
        'translate(' + g.judgeX + ',' + fx(g.laneY - 8 - jp * 16) + ') scale(' +
        fx(1 + (this.judgeAnim > 0.8 ? (1 - this.judgeAnim) * 1.5 : 0.1)) + ')');
    }

    /* --- 連段跳動 --- */
    if (this.comboPulse > 0) {
      this.comboPulse = Math.max(0, this.comboPulse - dt * 7);
      var cs = 1 + this.comboPulse * 0.22;
      this.comboNum.setAttribute('transform', 'scale(' + fx(cs) + ')');
      this.comboNum.setAttribute('y', fx(-4 / cs));
    }
    if (this.comboFx) this.comboFx.update(dt, beatPos);

    /* --- 分數 --- */
    var st = this.st;
    if (st.shownScore !== st.score) {
      var diff = st.score - st.shownScore;
      st.shownScore += Math.max(1, Math.ceil(Math.abs(diff) * 0.25)) * (diff > 0 ? 1 : -1);
      if (Math.abs(st.score - st.shownScore) < 2) st.shownScore = st.score;
      this.scoreText.textContent = st.shownScore;
    }

    /* --- 魂ゲージ --- */
    st.shownGauge += (st.gauge - st.shownGauge) * Math.min(1, dt * 11);
    var gg = this.gaugeGeom;
    var frac = st.shownGauge / 100;
    var clear = st.gauge >= 80;
    if (clear !== st.clearFlag) {
      st.clearFlag = clear;
      this.bgClear.setAttribute('opacity', clear ? 1 : 0);
    }
    var full = st.shownGauge >= 99.5;
    var soulState = full ? 'full' : (clear ? 'clear' : 'empty');
    if (soulState !== this._soulState) {
      this._soulState = soulState;
      if (soulState === 'full') {
        this.soulCircle.setAttribute('fill', '#ff5310');
        this.soulCircle.setAttribute('stroke', '#ffe14d');
        this.soulText.setAttribute('fill', '#fffce8');
      } else if (soulState === 'clear') {
        this.soulCircle.setAttribute('fill', '#ff9c1a');
        this.soulCircle.setAttribute('stroke', 'rgba(255,255,255,.2)');
        this.soulText.setAttribute('fill', '#fff6d0');
      } else {
        this.soulCircle.setAttribute('fill', '#333');
        this.soulCircle.setAttribute('stroke', 'rgba(255,255,255,.2)');
        this.soulText.setAttribute('fill', 'rgba(255,255,255,.35)');
      }
    }
    if (this.soulFlame) {
      this.soulFlame.setOn(full);
      this.soulFlame.update(dt, beatPos);
    }
    if (this.gaugeFlame) {
      this.gaugeFlame.setOn(full);
      this.gaugeFlame.update(dt, beatPos);
    }
    var wNormal = Math.min(frac, 0.8) / 0.8 * (gg.w - 4) * 0.8;
    this.gaugeFill.setAttribute('width', fx(Math.max(0, wNormal)));
    this.gaugeClearFill.setAttribute('width', fx(Math.max(0, frac * (gg.w - 4))));
    this.gaugeClearFill.setAttribute('opacity', clear ? 1 : 0);

    /* --- 角色 / 場景 --- */
    var mood = st.gauge >= 80 ? 'clear' : (st.gauge < 22 && st.bad > 4 ? 'sad' : (st.combo >= 50 ? 'happy' : 'idle'));
    if (mood !== this.mood) { this.mood = mood; this.don.setMood(mood); }
    this.don.update(rt, beatPos);
    this.drum.update(dt);
    this.updateKaGlow(dt);
    this.updateSubtitle();
    this.updateCrowd(dt, beatPos, st.shownGauge);
    var bounce = Math.abs(Math.sin(beatPos * Math.PI));
    var lanternGlow = 0.55 + bounce * 0.2 + clamp(st.shownGauge / 100, 0, 1) * 0.25;
    for (var lj = 0; lj < this.lanterns.length; lj++) {
      this.lanterns[lj].setAttribute('opacity', fx(lanternGlow));
    }

    /* --- 結束判定 --- */
    var last = notes.length ? notes[notes.length - 1] : null;
    var endAt = last ? last.t + (last.dur || 0) + 2.6 : 5;
    if (this.player.buffer) endAt = Math.min(endAt, this.player.buffer.duration + 0.6);
    if (!st.finished && now >= endAt) {
      st.finished = true;
      this.finish();
    }
  };

  /* ------------------------------------------------------------------ *
   * 演奏模式：電腦全良
   * ------------------------------------------------------------------ */

  Game.prototype.autoHitPerfect = function (n) {
    if (n.judged) return;
    var kind = n.ka ? 'ka' : 'don';
    var side = this._autoHand === 'r' ? 'r' : 'l';
    this._autoHand = side === 'l' ? 'r' : 'l';
    if (kind === 'don') A.don(); else A.ka();
    this.drum.flash((kind === 'don' ? 'd' : 'k') + side);
    if (kind === 'ka') this.kaGlowT[side] = 0.18;
    this.don.swing(side);
    this.judgeNote(n, 'good', 0, side);
    if (n.big) {
      var other = side === 'l' ? 'r' : 'l';
      this.drum.flash((kind === 'don' ? 'd' : 'k') + other);
      if (kind === 'ka') this.kaGlowT[other] = 0.18;
      this.don.swing(other);
      if (this.pendingBig) this.applyBigUpgrade();
    }
  };

  Game.prototype.autoStep = function (now) {
    for (var i = this.tapCursor; i < this.taps.length; i++) {
      var n = this.taps[i];
      if (n.judged) continue;
      if (n.t - now > 0.004) break;
      this.autoHitPerfect(n);
    }
  };

  Game.prototype.autoStepRolls = function (now) {
    var r = this.activeRoll;
    if (r && now >= r.t && now <= r.t + r.dur) {
      if (now - this._autoRollAt >= 0.04) {
        this._autoRollAt = now;
        this._autoRollSide = this._autoRollSide === 'l' ? 'r' : 'l';
        this.input('don', this._autoRollSide, true);
      }
    }
  };

  /* ------------------------------------------------------------------ *
   * 結算
   * ------------------------------------------------------------------ */

  Game.prototype.finish = function () {
    this.running = false;
    this.setHitLayer(false);
    this.clearSubtitle();
    var st = this.st;
    this.player.fadeOut(1.2);
    var cleared = st.gauge >= 80;
    var crown = null;
    if (cleared) {
      if (st.bad === 0 && st.ok === 0) crown = 'rainbow';
      else if (st.bad === 0) crown = 'gold';
      else crown = 'silver';
    }
    var self = this;
    setTimeout(function () {
      self.onFinish({
        score: st.score, good: st.good, ok: st.ok, bad: st.bad,
        maxCombo: st.maxCombo, rollHits: st.rollHits,
        gauge: st.gauge, cleared: cleared, crown: crown,
        totalNotes: self.taps.length,
        song: self.song, diff: self.diffKey, level: self.chart.level,
        autoPlay: !!self.autoPlay
      });
    }, 900);
  };

  global.TKGame = { Game: Game, JUDGE_WIN: JUDGE_WIN, comboBonus: comboBonus };
})(window);
