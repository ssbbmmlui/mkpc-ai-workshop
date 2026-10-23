/* =============================================================================
 * screens.js — 畫面流程：標題 → 選曲 → 選難度 → 載入 → 遊玩 → 結算
 * ===========================================================================*/
(function (global) {
  'use strict';

  var S = global.TKSvg;
  var A = global.TKAudio;
  var CG = global.TaikoChartGen;

  var SUBJECT = 'music';
  var GAME_ID = 'taiko';
  var CACHE_VERSION = 2;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fx(v) { return Math.round(v * 100) / 100; }

  var DIFF_ORDER = ['easy', 'normal', 'hard', 'oni'];

  /* ================================================================== *
   * 語言
   * ================================================================== */

  var I18N = {
    zh: {
      start: '開始遊戲',
      options: '設定',
      hintSelect: '選擇',
      hintConfirm: '決定',
      hintBack: '返回',
      hintChangeSong: '切換歌曲',
      hintChangeDiff: '選擇難度',
      hintStartPlay: '開始',
      hintSwipe: '可左右滑動',
      playMode: '遊玩',
      watchMode: '演奏模式',
      watchHint: '觀看電腦全良，分數不上榜',
      watchReadyHint: '演奏模式　分數不上榜',
      notRanked: '演奏模式　此分數不上榜',
      mode: '模式',
      selectSong: '選擇歌曲',
      noSongs: '尚未加入任何歌曲',
      noSongsHint: '請編輯 songs.js 加入歌曲',
      back: '返回',
      home: '主選單',
      autoGen: '自動生成',
      noteSpeed: '音符速度',
      loading: '載入中',
      preparing: '準備中…',
      loadHint: '第一次遊玩此曲時會自動分析節奏並生成譜面，可能需要數秒',
      downloading: '下載歌曲…',
      readingChart: '讀取譜面',
      readingCache: '讀取譜面快取',
      analyzing: '分析節奏…',
      generating: '生成譜面…',
      prepAudio: '準備音訊',
      analyzeSpectrum: '分析頻譜',
      detectOnsets: '偵測起音點',
      estimateBpm: '估算 BPM',
      alignBeat: '對齊節拍',
      quantize: '量化節奏',
      done: '完成',
      errorTitle: '發生錯誤',
      errorHint: '請確認歌曲連結可公開存取',
      backToSongs: '返回選曲',
      noChart: '此歌曲沒有「{diff}」譜面',
      clear: '過關！',
      fail: '失敗…',
      allGood: '全良',
      fullCombo: '全連',
      cleared: '過關',
      judgeGood: '良',
      judgeOk: '可',
      judgeBad: '不可',
      maxCombo: '最大連段',
      rollHits: '連打次數',
      score: '分數',
      accuracy: '精度 {n}%',
      retry: '再來一次',
      pickDiff: '難度選擇',
      pickSong: '選曲',
      optionsTitle: '設定',
      musicVol: '音樂音量',
      sfxVol: '打擊音量',
      offset: '判定offset',
      offsetHint: '覺得自己總是「太早打」→ 把 offset 調成正值；總是「太慢」→ 調成負值',
      practice: '試打（D F ／ J K）',
      clearCache: '清除譜面快取',
      combo: '連段',
      resume: '繼續',
      restart: '重來',
      pauseHint: 'Space 繼續　　R 重來　　Esc 離開',
      bootFail: '遊戲載入失敗：',
      audioFail: '無法下載音訊（網路或 CORS 錯誤）：',
      fileFail: '讀取檔案失敗'
    },
    en: {
      start: 'Start Game',
      options: 'Settings',
      hintSelect: 'Select',
      hintConfirm: 'Confirm',
      hintBack: 'Back',
      hintChangeSong: 'Change song',
      hintChangeDiff: 'Difficulty',
      hintStartPlay: 'Start',
      hintSwipe: 'or swipe',
      playMode: 'Play',
      watchMode: 'Demo',
      watchHint: 'Watch a perfect run. Score is not submitted.',
      watchReadyHint: 'Demo — score not submitted',
      notRanked: 'Demo — this score is not submitted',
      mode: 'Mode',
      selectSong: 'Select Song',
      noSongs: 'No songs added yet',
      noSongsHint: 'Add songs in songs.js',
      back: 'Back',
      home: 'Main Menu',
      autoGen: 'Auto-generated',
      noteSpeed: 'Note Speed',
      loading: 'Now Loading',
      preparing: 'Preparing…',
      loadHint: 'The first play of a song may take a few seconds to analyse the beat and generate charts.',
      downloading: 'Downloading song…',
      readingChart: 'Loading chart',
      readingCache: 'Loading cached chart',
      analyzing: 'Analysing rhythm…',
      generating: 'Generating chart…',
      prepAudio: 'Preparing audio',
      analyzeSpectrum: 'Analysing spectrum',
      detectOnsets: 'Detecting onsets',
      estimateBpm: 'Estimating BPM',
      alignBeat: 'Aligning beat',
      quantize: 'Quantizing rhythm',
      done: 'Done',
      errorTitle: 'Error',
      errorHint: 'Please check that the song link is publicly accessible.',
      backToSongs: 'Back to Songs',
      noChart: 'This song has no {diff} chart',
      clear: 'CLEAR!',
      fail: 'FAILED…',
      allGood: 'ALL GOOD',
      fullCombo: 'FULL COMBO',
      cleared: 'CLEAR',
      judgeGood: 'GOOD',
      judgeOk: 'OK',
      judgeBad: 'BAD',
      maxCombo: 'Max Combo',
      rollHits: 'Drumrolls',
      score: 'SCORE',
      accuracy: 'Accuracy {n}%',
      retry: 'Retry',
      pickDiff: 'Difficulty',
      pickSong: 'Songs',
      optionsTitle: 'Settings',
      musicVol: 'Music Volume',
      sfxVol: 'Hit Volume',
      offset: 'Judgement Offset',
      offsetHint: 'If you always hit early, raise offset; if you always hit late, lower it.',
      practice: 'Practice (D F / J K)',
      clearCache: 'Clear Chart Cache',
      combo: 'COMBO',
      resume: 'Resume',
      restart: 'Restart',
      pauseHint: 'Space Resume    R Restart    Esc Quit',
      bootFail: 'Failed to load game: ',
      audioFail: 'Could not download audio (network or CORS): ',
      fileFail: 'Failed to read file'
    }
  };

  var PROGRESS_KEYS = {
    '下載歌曲…': 'downloading',
    '讀取譜面': 'readingChart',
    '讀取譜面快取': 'readingCache',
    '分析節奏…': 'analyzing',
    '生成譜面…': 'generating',
    '準備音訊': 'prepAudio',
    '分析頻譜': 'analyzeSpectrum',
    '偵測起音點': 'detectOnsets',
    '估算 BPM': 'estimateBpm',
    '對齊節拍': 'alignBeat',
    '量化節奏': 'quantize',
    '完成': 'done'
  };

  function readLang() {
    try {
      var saved = localStorage.getItem('taiko.lang') || localStorage.getItem('mkpc-play-lang');
      if (saved === 'en' || saved === 'zh') return saved;
    } catch (e) { }
    return 'en';
  }

  function applyLang(lang) {
    lang = (lang === 'zh') ? 'zh' : 'en';
    TKI18n.lang = lang;
    try { localStorage.setItem('taiko.lang', lang); } catch (e) { }
    try { document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en'; } catch (e) { }
    return lang;
  }

  function t(key, vars) {
    var pack = I18N[TKI18n.lang] || I18N.en;
    var s = pack[key] || I18N.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = String(s).split('{' + k + '}').join(vars[k]);
      });
    }
    return s;
  }

  var TKI18n = {
    lang: readLang(),
    t: t,
    songTitle: function (song) {
      if (!song) return '';
      if (TKI18n.lang === 'zh') return song.titleZh || song.title || song.id || '';
      return song.title || song.id || '';
    },
    songSub: function (song) {
      if (!song) return '';
      if (TKI18n.lang === 'zh') return song.subtitleZh || '';
      return song.subtitle || '';
    },
    diffName: function (key) {
      var cfg = CG.DIFFS[key];
      if (!cfg) return key;
      return TKI18n.lang === 'zh' ? cfg.zh : cfg.en;
    }
  };
  global.TKI18n = TKI18n;

  /* ================================================================== *
   * 譜面快取
   * ================================================================== */

  function cacheKey(id) { return 'taiko.chart.v' + CACHE_VERSION + '.' + id; }

  function readCache(id) {
    try {
      var raw = localStorage.getItem(cacheKey(id));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function writeCache(id, data) {
    try { localStorage.setItem(cacheKey(id), JSON.stringify(data)); } catch (e) { }
  }

  /* ================================================================== *
   * 主程式
   * ================================================================== */

  var App = {
    svg: null,
    layers: {},
    screen: '',
    songs: [],
    songIdx: 0,
    diffIdx: 3,
    bestResults: {},
    lastResult: null,
    speed: 1,
    playMode: 'play',
    lang: 'en',
    nav: { items: [], index: 0, ring: null },
    prepared: null,

    /* -------------------------------------------------------------- */
    init: function (svg) {
      this.svg = svg;
      S.installAll(svg);

      this.layers.ui = S.el('g', null, svg);
      this.layers.game = S.el('g', null, svg);
      this.layers.top = S.el('g', null, svg);

      this.lay = { W: 1280, H: 820 };
      this.songs = (global.TAIKO_SONGS || []).slice();
      this.lang = applyLang(readLang());

      try { this.speed = parseFloat(localStorage.getItem('taiko.speed')) || 1; } catch (e) { }
      try { this.playMode = localStorage.getItem('taiko.playMode') === 'watch' ? 'watch' : 'play'; } catch (e) { }

      var self = this;
      this.game = new global.TKGame.Game({
        svg: svg, layer: this.layers.game, layout: this.lay,
        onFinish: this.onFinish.bind(this),
        onRestart: function () {
          var diff = self.game.diffKey;
          var watch = !!self.game.autoPlay;
          self.game.stop();
          self.startSong(diff, { autoPlay: watch });
        },
        onQuitToSongs: function () {
          self.game.stop();
          self.go('songs');
        }
      });
      window.addEventListener('resize', function () { self.resize(); });
      window.addEventListener('keydown', function (e) { self.onKeyDown(e); });
      window.addEventListener('keyup', function (e) { self.onKeyUp(e); });
      window.addEventListener('message', function (e) {
        if (e.data && e.data.type === 'mkpc:requestScore') self.postScore();
      });
      window.addEventListener('pagehide', function () { self.postScore(); });

      this.keyState = {};
      this.bindSongSwipe();
      this.resize();
      this.go('title');
      this.loop(0);
    },

    resize: function () {
      var w = window.innerWidth || 1100, h = window.innerHeight || 750;
      var H = clamp(Math.round(1280 * h / Math.max(1, w)), 700, 1040);
      this.lay.W = 1280;
      this.lay.H = H;
      this.svg.setAttribute('viewBox', '0 0 1280 ' + H);
      if (this.game && this.game.built) {
        // 遊玩中只微調位置；不在遊玩中就標記重建，下次開始時重新排版整個舞台
        if (this.game.running) this.game.relayout();
        else this.game.built = false;
      }
      if (this.screen && this.screen !== 'game' && this['screen_' + this.screen]) this.go(this.screen);
    },

    loop: function (ms) {
      var self = this;
      var t = ms / 1000;
      var dt = clamp(t - (this._lastLoop || t), 0, 0.06);
      this._lastLoop = t;
      if (this.screen === 'game') this.game.update(t);
      else if (this.screen === 'result' && this.resultDon) this.resultDon.update(t, t * 2);
      else if (this.screen === 'title' && this.titleDon) this.titleDon.update(t, t * 1.6);
      else if (this.screen === 'options' && this.optDrum) {
        this.optDrum.update(dt);
        if (this.optKaT) {
          if (this.optKaT.l > 0) {
            this.optKaT.l = Math.max(0, this.optKaT.l - dt * 1.2);
            if (this.optKaGlowL) this.optKaGlowL.setAttribute('opacity', this.optKaT.l);
          }
          if (this.optKaT.r > 0) {
            this.optKaT.r = Math.max(0, this.optKaT.r - dt * 1.2);
            if (this.optKaGlowR) this.optKaGlowR.setAttribute('opacity', this.optKaT.r);
          }
        }
      }
      requestAnimationFrame(function (m) { self.loop(m); });
    },

    /* -------------------------------------------------------------- *
     * 畫面切換
     * -------------------------------------------------------------- */
    go: function (name) {
      this.screen = name;
      this.titleDon = null;
      this.resultDon = null;
      this.optDrum = null;
      this.optKaGlowL = null;
      this.optKaGlowR = null;
      this.nav.items = [];
      this.nav.index = 0;
      S.clear(this.layers.ui);
      S.clear(this.layers.top);
      S.show(this.layers.game, name === 'game');
      if (this.svg) this.svg.style.touchAction = (name === 'songs' || name === 'game') ? 'manipulation' : '';
      if (name !== 'game' && this.game) {
        this.game.setHitLayer(false);
        if (this.game.running) this.game.stop();
      }
      if (name !== 'songs' && name !== 'diff') this.stopPreview();

      var fn = this['screen_' + name];
      if (fn) fn.call(this);
    },

    /* ================================================================ *
     * 共用元件
     * ================================================================ */

    bg: function (parent, tone) {
      var L = this.lay;
      S.el('rect', { x: 0, y: 0, width: L.W, height: L.H, fill: tone || '#12161f' }, parent);
      // 斜紋
      var g = S.el('g', { opacity: 0.07 }, parent);
      for (var i = -20; i < 46; i++) {
        S.el('path', {
          d: 'M' + (i * 40) + ',0 l' + L.H * 0.4 + ',' + L.H + ' h26 l' + (-L.H * 0.4) + ',' + (-L.H) + 'z',
          fill: i % 2 ? '#ffffff' : '#ff8a5c'
        }, g);
      }
      // 上下紅帶
      S.el('rect', { x: 0, y: 0, width: L.W, height: 8, fill: '#e8443a' }, parent);
      S.el('rect', { x: 0, y: L.H - 8, width: L.W, height: 8, fill: '#e8443a' }, parent);
      return parent;
    },

    bindTap: function (node, fn) {
      var last = 0;
      function fire(e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        var now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        if (now - last < 400) return;
        last = now;
        fn();
      }
      node.addEventListener('touchstart', fire, { passive: false });
      node.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return;
        fire(e);
      });
    },

    button: function (parent, o) {
      var g = S.el('g', { style: 'cursor:pointer' }, parent);
      var w = o.w || 240, h = o.h || 60;
      S.el('rect', {
        x: o.x - w / 2, y: o.y - h / 2, width: w, height: h, rx: h / 2,
        fill: o.color || '#e8443a', stroke: 'rgba(0,0,0,.35)', 'stroke-width': 3
      }, g);
      S.el('rect', {
        x: o.x - w / 2 + 6, y: o.y - h / 2 + 5, width: w - 12, height: h * 0.36, rx: h * 0.18,
        fill: 'rgba(255,255,255,.22)'
      }, g);
      S.txt(g, o.label, {
        x: o.x, y: o.y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': o.size || 24, 'font-weight': 800, fill: '#fff',
        stroke: 'rgba(0,0,0,.35)', 'stroke-width': 4, 'paint-order': 'stroke'
      });
      S.el('rect', {
        x: o.x - w / 2, y: o.y - h / 2, width: w, height: h, rx: h / 2,
        fill: 'rgba(0,0,0,0.01)'
      }, g);
      this.bindTap(g, function () { A.sfx.select(); o.onClick(); });
      this.addNav(g, o.onClick, { x: o.x, y: o.y, w: w, h: h });
      return g;
    },

    addNav: function (node, onActivate, box) {
      this.nav.items.push({ node: node, activate: onActivate, box: box });
      var idx = this.nav.items.length - 1;
      var self = this;
      node.addEventListener('pointerenter', function () { self.navFocus(idx, true); });
    },

    t: function (key, vars) { return t(key, vars); },

    toggleLang: function () {
      this.lang = applyLang(this.lang === 'zh' ? 'en' : 'zh');
      this.go(this.screen || 'title');
    },

    drawControlHint: function (parent, y, groups) {
      var L = this.lay;
      var keyH = 30, keyGap = 6, labelGap = 10, groupGap = 34;
      var fontSize = 18;
      function keyWidth(label) { return String(label).length > 1 ? 48 : 34; }
      function labelWidth(s) {
        s = String(s || '');
        var w = 0;
        for (var ci = 0; ci < s.length; ci++) {
          w += s.charCodeAt(ci) > 127 ? fontSize + 1 : fontSize * 0.58;
        }
        return w + 6;
      }
      var total = 0;
      var i, g, k, x, boxW;
      for (i = 0; i < groups.length; i++) {
        g = groups[i];
        if (i) total += groupGap;
        boxW = 0;
        for (k = 0; k < g.keys.length; k++) {
          if (k) boxW += keyGap;
          boxW += keyWidth(g.keys[k]);
        }
        g._labelW = labelWidth(g.label);
        total += boxW + (g.label ? labelGap + g._labelW : 0);
      }
      x = L.W / 2 - total / 2;
      for (i = 0; i < groups.length; i++) {
        g = groups[i];
        if (i) x += groupGap;
        for (k = 0; k < g.keys.length; k++) {
          if (k) x += keyGap;
          var kw = keyWidth(g.keys[k]);
          S.el('rect', {
            x: x, y: y - keyH / 2, width: kw, height: keyH, rx: 7,
            fill: 'rgba(8,10,16,.82)', stroke: '#ffd24a', 'stroke-width': 2
          }, parent);
          S.txt(parent, g.keys[k], {
            x: x + kw / 2, y: y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central',
            'font-size': g.keys[k].length > 1 ? 13 : 17, 'font-weight': 900, fill: '#ffd24a'
          });
          x += kw;
        }
        if (g.label) {
          x += labelGap;
          S.txt(parent, g.label, {
            x: x, y: y + 1, 'dominant-baseline': 'central',
            'font-size': fontSize, 'font-weight': 800, fill: 'rgba(255,255,255,.88)'
          });
          x += g._labelW;
        }
      }
    },

    drawLangToggle: function (parent, x, y) {
      var self = this;
      var w = 176, h = 46;
      var g = S.el('g', { style: 'cursor:pointer' }, parent);
      S.el('rect', {
        x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2,
        fill: 'rgba(8,10,16,.72)', stroke: 'rgba(255,255,255,.28)', 'stroke-width': 2
      }, g);
      var zhOn = this.lang === 'zh';
      var half = (w - 10) / 2;
      S.el('rect', {
        x: x - w / 2 + 5, y: y - h / 2 + 5, width: half, height: h - 10, rx: (h - 10) / 2,
        fill: zhOn ? '#e8443a' : 'transparent'
      }, g);
      S.el('rect', {
        x: x + 0, y: y - h / 2 + 5, width: half, height: h - 10, rx: (h - 10) / 2,
        fill: zhOn ? 'transparent' : '#3f7fd0'
      }, g);
      S.txt(g, '中文', {
        x: x - w / 4, y: y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 16, 'font-weight': 800, fill: '#fff'
      });
      S.txt(g, 'EN', {
        x: x + w / 4, y: y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 16, 'font-weight': 800, fill: '#fff'
      });
      this.bindTap(g, function () { A.sfx.select(); self.toggleLang(); });
      this.addNav(g, function () { self.toggleLang(); }, { x: x, y: y, w: w, h: h });
      return g;
    },

    progressText: function (label) {
      if (!label) return t('preparing');
      var raw = String(label).replace(/[….]+$/, '').trim();
      var key = PROGRESS_KEYS[label] || PROGRESS_KEYS[raw] || PROGRESS_KEYS[raw + '…'];
      return key ? t(key) : label;
    },

    navFocus: function (i, silent) {
      if (!this.nav.items.length) return;
      this.nav.index = ((i % this.nav.items.length) + this.nav.items.length) % this.nav.items.length;
      if (!silent) A.sfx.move();
      var it = this.nav.items[this.nav.index];
      if (!this.nav.ring || !this.nav.ring.parentNode) {
        this.nav.ring = S.el('rect', {
          fill: 'none', stroke: '#ffd24a', 'stroke-width': 4, rx: 14,
          'pointer-events': 'none', opacity: 0.95
        }, this.layers.top);
      }
      var b = it.box;
      S.setAttrs(this.nav.ring, {
        x: b.x - b.w / 2 - 7, y: b.y - b.h / 2 - 7,
        width: b.w + 14, height: b.h + 14,
        rx: b.r === undefined ? Math.min(20, b.h / 2 + 7) : b.r
      });
      if (it.onFocus) it.onFocus();
    },

    navActivate: function () {
      var it = this.nav.items[this.nav.index];
      if (it) { A.sfx.select(); it.activate(); }
    },

    /* ================================================================ *
     * 標題畫面
     * ================================================================ */

    screen_title: function () {
      var L = this.lay, p = this.layers.ui;
      this.bg(p, '#181d2b');

      // 太陽
      S.el('circle', { cx: L.W / 2, cy: L.H * 0.36, r: 250, fill: 'rgba(232,68,58,.16)' }, p);
      S.el('circle', { cx: L.W / 2, cy: L.H * 0.36, r: 190, fill: 'rgba(232,68,58,.22)' }, p);

      var ty = L.H * 0.20;
      var logo = S.el('g', { transform: 'translate(' + L.W / 2 + ',' + fx(ty) + ')' }, p);
      S.txt(logo, 'MKPC 太鼓の達人', {
        'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 104, 'font-weight': 900, fill: '#ffd24a',
        stroke: '#8f1f14', 'stroke-width': 16, 'paint-order': 'stroke'
      });
      S.txt(logo, 'MKPC 太鼓の達人', {
        'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 104, 'font-weight': 900, fill: '#ffd24a'
      });
      S.txt(logo, 'MKPC Taiko no Tatsujin', {
        y: 74, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 21, 'font-weight': 800, fill: '#ffffff', 'letter-spacing': 5
      });

      // Don-chan
      var dh = S.el('g', { transform: 'translate(' + (L.W / 2) + ',' + fx(L.H * 0.53) + ') scale(0.86)' }, p);
      this.titleDon = S.donChan(dh, 1);
      this.titleDon.setMood('idle');

      var by = L.H * 0.78;
      var self = this;
      this.button(p, { x: L.W / 2 - 140, y: by, w: 250, h: 66, label: t('start'), color: '#e8443a', onClick: function () { self.go('songs'); } });
      this.button(p, { x: L.W / 2 + 140, y: by, w: 220, h: 66, label: t('options'), color: '#3f7fd0', onClick: function () { self.go('options'); } });
      this.drawLangToggle(p, L.W - 110, 48);

      this.drawControlHint(p, L.H - 42, [
        { keys: ['D', 'K'], label: t('hintSelect') },
        { keys: ['F', 'J'], label: t('hintConfirm') },
        { keys: ['Esc'], label: t('hintBack') }
      ]);
      this.navFocus(0, true);
    },

    /* ================================================================ *
     * 選曲畫面
     * ================================================================ */

    screen_songs: function () {
      var L = this.lay, p = this.layers.ui, self = this;
      this.bg(p, '#101826');

      S.txt(p, t('selectSong'), {
        x: 40, y: 52, 'dominant-baseline': 'central',
        'font-size': 30, 'font-weight': 900, fill: '#ffd24a'
      });
      this.button(p, {
        x: L.W - 120, y: 48, w: 200, h: 50, size: 20,
        label: t('home'), color: '#666',
        onClick: function () { self.go('title'); }
      });

      if (!this.songs.length) {
        S.txt(p, t('noSongs'), {
          x: L.W / 2, y: L.H / 2 - 30, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 34, 'font-weight': 800, fill: '#fff'
        });
        S.txt(p, t('noSongsHint'), {
          x: L.W / 2, y: L.H / 2 + 18, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 19, 'font-weight': 600, fill: 'rgba(255,255,255,.6)'
        });
        this.button(p, { x: L.W / 2, y: L.H / 2 + 100, label: t('back'), color: '#666', onClick: function () { self.go('title'); } });
        this.navFocus(0, true);
        return;
      }

      this.songIdx = clamp(this.songIdx, 0, this.songs.length - 1);
      var cardW = 330, cardH = 128, gap = 26;
      var cy = L.H * 0.44;
      var listG = S.el('g', null, p);
      this.songListG = listG;

      this.songs.forEach(function (song, i) {
        var g = S.el('g', { style: 'cursor:pointer' }, listG);
        var col = song.color || '#3f7fd0';
        S.el('rect', {
          x: -cardW / 2, y: -cardH / 2, width: cardW, height: cardH, rx: 16,
          fill: col, stroke: 'rgba(0,0,0,.4)', 'stroke-width': 4
        }, g);
        S.el('rect', {
          x: -cardW / 2 + 8, y: -cardH / 2 + 7, width: cardW - 16, height: 30, rx: 14,
          fill: 'rgba(255,255,255,.20)'
        }, g);
        S.txt(g, TKI18n.songTitle(song), {
          y: -22, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 25, 'font-weight': 900, fill: '#fff',
          stroke: 'rgba(0,0,0,.35)', 'stroke-width': 4, 'paint-order': 'stroke'
        });
        S.txt(g, TKI18n.songSub(song), {
          y: 4, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 15, 'font-weight': 700, fill: 'rgba(255,255,255,.85)'
        });
        // 難度小標
        var pips = S.el('g', { transform: 'translate(0,36)' }, g);
        DIFF_ORDER.forEach(function (d, k) {
          var lv = song.levels && song.levels[d];
          var px = (k - 1.5) * 72;
          var pg = S.el('g', { transform: 'translate(' + px + ',0)' }, pips);
          S.el('rect', { x: -32, y: -13, width: 64, height: 26, rx: 13, fill: 'rgba(0,0,0,.35)' }, pg);
          S.diffIcon(S.el('g', { transform: 'translate(-18,0)' }, pg), d, 17, CG.DIFFS[d].color);
          S.txt(pg, lv ? '★' + lv : '★?', {
            x: 12, y: 1, 'text-anchor': 'middle', 'dominant-baseline': 'central',
            'font-size': 14, 'font-weight': 800, fill: '#fff'
          });
        });
        song._node = g;
        g.addEventListener('click', function () {
          if (self._songDidSwipe) { self._songDidSwipe = false; return; }
          if (self.songIdx === i) { A.sfx.select(); self.go('diff'); }
          else { self.songIdx = i; self.layoutSongs(); A.sfx.move(); self.queuePreview(); }
        });
      });

      this.drawControlHint(p, L.H - 46, [
        { keys: ['D', 'K'], label: t('hintChangeSong') },
        { keys: ['F', 'J'], label: t('hintConfirm') },
        { keys: ['Esc'], label: t('hintBack') }
      ]);
      S.txt(p, t('hintSwipe'), {
        x: L.W / 2, y: L.H - 18, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 13, 'font-weight': 700, fill: 'rgba(255,255,255,.38)'
      });

      this.songGeom = { cardW: cardW, cardH: cardH, gap: gap, cy: cy };
      this.layoutSongs();
      this.queuePreview();
    },

    shiftSong: function (dir) {
      if (this.songs.length < 2) return;
      this.songIdx = (this.songIdx + dir + this.songs.length) % this.songs.length;
      this.layoutSongs();
      A.sfx.move();
      this.queuePreview();
    },

    bindSongSwipe: function () {
      var self = this;
      var startX = 0, startY = 0, tracking = false;

      function svgY(e) {
        if (!self.svg || typeof self.svg.createSVGPoint !== 'function') return 0;
        var ctm = self.svg.getScreenCTM();
        if (!ctm) return 0;
        var pt = self.svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        return pt.matrixTransform(ctm.inverse()).y;
      }

      window.addEventListener('pointerdown', function (e) {
        if (self.screen !== 'songs' || !self.songs.length) return;
        if (e.button) return;
        var y = svgY(e);
        if (y < 90 || y > self.lay.H - 80) return;
        tracking = true;
        self._songDidSwipe = false;
        startX = e.clientX;
        startY = e.clientY;
      });
      window.addEventListener('pointerup', function (e) {
        if (!tracking) return;
        tracking = false;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.15) {
          self._songDidSwipe = true;
          self.shiftSong(dx < 0 ? 1 : -1);
        }
      });
      window.addEventListener('pointercancel', function () { tracking = false; });
    },

    layoutSongs: function () {
      var L = this.lay, gm = this.songGeom;
      var self = this;
      this.songs.forEach(function (song, i) {
        var d = i - self.songIdx;
        var sc = d === 0 ? 1.14 : 0.9;
        var x = L.W / 2 + d * (gm.cardW + gm.gap) * 0.95;
        var y = gm.cy + Math.abs(d) * 8;
        song._node.setAttribute('transform',
          'translate(' + fx(x) + ',' + fx(y) + ') scale(' + sc + ')');
        song._node.setAttribute('opacity', Math.abs(d) > 2 ? 0 : (d === 0 ? 1 : 0.72));
        song._node.style.pointerEvents = Math.abs(d) > 2 ? 'none' : 'auto';
      });
    },

    queuePreview: function () {
      var self = this;
      var song = this.songs[this.songIdx];
      if (song && this._previewSongId === song.id) return;
      clearTimeout(this._prevT);
      this.stopPreview();
      this._prevT = setTimeout(function () { self.playPreview(); }, 650);
    },

    playPreview: function () {
      var song = this.songs[this.songIdx];
      if (!song || !song.audio) return;
      var self = this;
      var token = ++this._prevToken;
      this._previewSongId = song.id;
      A.loadSong(song.audio).then(function (buf) {
        if (token !== self._prevToken) return;
        if (self.screen !== 'songs' && self.screen !== 'diff') return;
        self.preview = new A.Player();
        self.preview.load(buf);
        self.preview.play(Math.min(song.demoStart || 25, Math.max(0, buf.duration - 20)), 0);
      }).catch(function () { });
    },

    stopPreview: function () {
      this._prevToken = (this._prevToken || 0) + 1;
      this._previewSongId = null;
      clearTimeout(this._prevT);
      if (this.preview) { this.preview.stop(); this.preview = null; }
    },

    /* ================================================================ *
     * 難度選擇
     * ================================================================ */

    screen_diff: function () {
      var L = this.lay, p = this.layers.ui, self = this;
      var song = this.songs[this.songIdx];
      this.bg(p, '#141020');

      S.txt(p, TKI18n.songTitle(song), {
        x: L.W / 2, y: 68, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 40, 'font-weight': 900, fill: '#ffd24a',
        stroke: 'rgba(0,0,0,.5)', 'stroke-width': 7, 'paint-order': 'stroke'
      });
      S.txt(p, TKI18n.songSub(song), {
        x: L.W / 2, y: 108, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 19, 'font-weight': 700, fill: 'rgba(255,255,255,.6)'
      });

      var pw = 232, ph = 372, gap = 24;
      var total = 4 * pw + 3 * gap;
      var x0 = (L.W - total) / 2 + pw / 2;
      var cy = L.H * 0.50;

      DIFF_ORDER.forEach(function (d, i) {
        var cfg = CG.DIFFS[d];
        var x = x0 + i * (pw + gap);
        var g = S.el('g', { transform: 'translate(' + fx(x) + ',' + fx(cy) + ')', style: 'cursor:pointer' }, p);
        S.el('rect', {
          x: -pw / 2, y: -ph / 2, width: pw, height: ph, rx: 20,
          fill: cfg.color, stroke: 'rgba(0,0,0,.42)', 'stroke-width': 4
        }, g);
        S.el('rect', {
          x: -pw / 2 + 9, y: -ph / 2 + 9, width: pw - 18, height: 54, rx: 16,
          fill: 'rgba(255,255,255,.20)'
        }, g);
        S.txt(g, TKI18n.diffName(d), {
          y: -ph / 2 + 36, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 34, 'font-weight': 900, fill: '#fff'
        });
        S.diffIcon(S.el('g', { transform: 'translate(0,' + fx(-ph / 2 + 128) + ')' }, g), d, 96, 'rgba(255,255,255,.95)');
        S.txt(g, cfg.jp, {
          y: -ph / 2 + 214, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 27, 'font-weight': 900, fill: '#fff',
          stroke: 'rgba(0,0,0,.3)', 'stroke-width': 4, 'paint-order': 'stroke'
        });
        var lv = song.levels && song.levels[d];
        var starsG = S.el('g', { transform: 'translate(0,' + fx(-ph / 2 + 262) + ')' }, g);
        if (lv) {
          var per = cfg.maxLevel > 5 ? Math.ceil(cfg.maxLevel / 2) : cfg.maxLevel;
          var rowW = per * 22;
          var sg = S.el('g', { transform: 'translate(' + fx(-rowW / 2 + 10) + ',0)' }, starsG);
          S.starRow(sg, lv, cfg.maxLevel, 18, 4, '#ffe14d');
        } else {
          S.txt(starsG, '★ ? ?', {
            'text-anchor': 'middle', 'dominant-baseline': 'central',
            'font-size': 20, 'font-weight': 800, fill: 'rgba(255,255,255,.75)'
          });
        }
        S.txt(g, lv ? 'Lv. ' + lv : t('autoGen'), {
          y: ph / 2 - 34, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 18, 'font-weight': 800, fill: 'rgba(255,255,255,.9)'
        });
        self.bindTap(g, function () { A.sfx.select(); self.startSong(d); });
        self.addNav(g, function () { self.startSong(d); }, { x: x, y: cy, w: pw, h: ph, r: 24 });
      });

      // 遊玩 / 演奏
      var my = L.H - 148;
      S.txt(p, t('mode'), {
        x: L.W / 2 - 150, y: my, 'text-anchor': 'end', 'dominant-baseline': 'central',
        'font-size': 19, 'font-weight': 800, fill: 'rgba(255,255,255,.7)'
      });
      [['play', t('playMode'), '#3f7fd0'], ['watch', t('watchMode'), '#8a3fd0']].forEach(function (row, i) {
        var x = L.W / 2 - 70 + i * 180;
        var on = self.playMode === row[0];
        var g = S.el('g', { style: 'cursor:pointer' }, p);
        S.el('rect', {
          x: x - 80, y: my - 20, width: 160, height: 40, rx: 20,
          fill: on ? row[2] : 'rgba(255,255,255,.13)',
          stroke: on ? '#ffd24a' : 'rgba(0,0,0,.3)', 'stroke-width': 2
        }, g);
        S.txt(g, row[1], {
          x: x, y: my + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 18, 'font-weight': 800, fill: '#fff'
        });
        self.bindTap(g, function () {
          self.playMode = row[0];
          try { localStorage.setItem('taiko.playMode', row[0]); } catch (e) { }
          A.sfx.move();
          self.go('diff', true);
        });
      });
      S.txt(p, t('watchHint'), {
        x: L.W / 2, y: my + 28, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 13, 'font-weight': 600, fill: 'rgba(255,255,255,.45)'
      });

      // 音符速度
      var sy = L.H - 88;
      S.txt(p, t('noteSpeed'), {
        x: L.W / 2 - 150, y: sy, 'text-anchor': 'end', 'dominant-baseline': 'central',
        'font-size': 19, 'font-weight': 800, fill: 'rgba(255,255,255,.7)'
      });
      var speeds = [1, 1.5, 2, 2.5, 3, 4];
      speeds.forEach(function (sp, i) {
        var x = L.W / 2 - 110 + i * 74;
        var on = Math.abs(self.speed - sp) < 0.01;
        var g = S.el('g', { style: 'cursor:pointer' }, p);
        S.el('rect', {
          x: x - 32, y: sy - 19, width: 64, height: 38, rx: 19,
          fill: on ? '#ffd24a' : 'rgba(255,255,255,.13)',
          stroke: 'rgba(0,0,0,.3)', 'stroke-width': 2
        }, g);
        S.txt(g, '×' + sp, {
          x: x, y: sy + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 17, 'font-weight': 800, fill: on ? '#402800' : '#fff'
        });
        self.bindTap(g, function () {
          self.speed = sp;
          try { localStorage.setItem('taiko.speed', String(sp)); } catch (e) { }
          A.sfx.move();
          self.go('diff', true);
        });
      });

      this.drawControlHint(p, L.H - 40, [
        { keys: ['D', 'K'], label: t('hintChangeDiff') },
        { keys: ['F', 'J'], label: t('hintStartPlay') },
        { keys: ['Esc'], label: t('hintBack') }
      ]);

      this.button(p, {
        x: L.W - 140, y: 48, w: 248, h: 50, size: 18,
        label: t('backToSongs'), color: '#666',
        onClick: function () { self.go('songs'); }
      });

      this.navFocus(this.diffIdx, true);
    },

    /* ================================================================ *
     * 載入畫面
     * ================================================================ */

    screen_loading: function () {
      var L = this.lay, p = this.layers.ui;
      this.bg(p, '#101826');
      S.txt(p, t('loading'), {
        x: L.W / 2, y: L.H * 0.34, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 30, 'font-weight': 900, fill: 'rgba(255,255,255,.55)'
      });
      this.loadLabel = S.txt(p, t('preparing'), {
        x: L.W / 2, y: L.H * 0.42, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 26, 'font-weight': 800, fill: '#ffd24a'
      });
      var bw = 640, bx = (L.W - bw) / 2, by = L.H * 0.50;
      S.el('rect', { x: bx, y: by, width: bw, height: 26, rx: 13, fill: 'rgba(255,255,255,.12)' }, p);
      this.loadBar = S.el('rect', { x: bx + 3, y: by + 3, width: 0, height: 20, rx: 10, fill: 'url(#gradGauge)' }, p);
      this.loadBarGeom = { x: bx + 3, w: bw - 6 };
      this.loadHint = S.txt(p, t('loadHint'), {
        x: L.W / 2, y: by + 66, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 16, 'font-weight': 600, fill: 'rgba(255,255,255,.45)'
      });
    },

    setLoading: function (p, label) {
      if (this.loadBar) this.loadBar.setAttribute('width', fx(clamp(p, 0, 1) * this.loadBarGeom.w));
      if (label && this.loadLabel) this.loadLabel.textContent = label;
    },

    /* ================================================================ *
     * 開始遊玩
     * ================================================================ */

    startSong: function (diffKey, opts) {
      var self = this;
      opts = opts || {};
      var watch = opts.autoPlay !== undefined ? !!opts.autoPlay : this.playMode === 'watch';
      this._startingWatch = watch;
      var song = this.songs[this.songIdx];
      this.diffIdx = DIFF_ORDER.indexOf(diffKey);
      this.stopPreview();
      A.resume();
      this.go('loading');

      this.prepare(song, function (p, label) { self.setLoading(p, self.progressText(label)); })
        .then(function (res) {
          var chart = res.data.charts[diffKey];
          if (!chart) throw new Error(t('noChart', { diff: TKI18n.diffName(diffKey) }));
          // 回填難度星等，讓選單顯示
          song.levels = song.levels || {};
          DIFF_ORDER.forEach(function (d) {
            if (res.data.charts[d]) song.levels[d] = res.data.charts[d].level;
          });
          var meta = {
            id: song.id, title: song.title, titleZh: song.titleZh,
            subtitle: song.subtitle, subtitleZh: song.subtitleZh,
            lyrics: song.lyrics, bpm: res.data.bpm, offset: res.data.offset
          };
          if (res.data.bpmChanges && res.data.bpmChanges.length) {
            meta.bpmChanges = res.data.bpmChanges;
          }
          self.go('game');
          self.game.start(meta, chart, diffKey, res.buffer, {
            speed: self.speed,
            autoPlay: watch
          });
        })
        .catch(function (err) { self.showError(err); });
    },

    /** 取得音訊 + 譜面 */
    prepare: function (song, onProgress) {
      var self = this;
      return A.loadSong(song.audio, function (p) { onProgress(p * 0.42, '下載歌曲…'); })
        .then(function (buffer) {
          return self.getChart(song, buffer, function (p, label) {
            onProgress(0.42 + p * 0.58, label);
          }).then(function (data) { return { buffer: buffer, data: data }; });
        });
    },

    getChart: function (song, buffer, onProgress) {
      if (song.charts) return Promise.resolve(song);
      var url = song.chartUrl || ('charts/' + song.id + '.json');
      var isTja = /\.tja(\?|#|$)/i.test(url);
      // 譜面檔優先於快取，這樣放進 charts/ 的新檔案會立刻生效
      return fetch(url)
        .then(function (r) {
          if (!r.ok) throw new Error('no chart file');
          return isTja ? r.text() : r.json();
        })
        .then(function (body) {
          var json = isTja ? CG.parseTja(body, {
            id: song.id, title: song.title, titleZh: song.titleZh,
            subtitle: song.subtitle, subtitleZh: song.subtitleZh, audio: song.audio
          }) : body;
          if (!json || !json.charts) throw new Error(isTja ? 'bad tja file' : 'bad chart file');
          onProgress(1, '讀取譜面');
          return json;
        })
        .catch(function (err) {
          // 指定的 TJA 解析失敗時要顯示錯誤，不能改去自動生成另一份譜
          if (isTja) throw err;
          var cached = readCache(song.id);
          if (cached && cached.charts) {
            onProgress(1, '讀取譜面快取');
            return cached;
          }
          onProgress(0.02, '分析節奏…');
          var opts = {
            id: song.id, title: song.title, titleZh: song.titleZh,
            subtitle: song.subtitle, subtitleZh: song.subtitleZh, audio: song.audio
          };
          if (song.bpm) opts.bpm = song.bpm;
          if (song.offset !== undefined && song.offset !== null) opts.offset = song.offset;
          if (song.bpmChanges && song.bpmChanges.length) opts.bpmChanges = song.bpmChanges;
          return CG.generateFromBuffer(buffer, opts, function (p, label) {
            onProgress(clamp(p, 0, 1), label ? label + '…' : '生成譜面…');
          }).then(function (res) {
            writeCache(song.id, res.data);
            return res.data;
          });
        });
    },

    showError: function (err) {
      var L = this.lay, self = this;
      this.screen = 'error';
      var p = S.clear(this.layers.ui);
      S.clear(this.layers.top);
      this.nav.items = [];
      this.bg(p, '#2a1418');
      S.txt(p, t('errorTitle'), {
        x: L.W / 2, y: L.H * 0.33, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 40, 'font-weight': 900, fill: '#ff8a7a'
      });
      var msg = String(err && err.message ? err.message : err);
      S.txt(p, msg.slice(0, 90), {
        x: L.W / 2, y: L.H * 0.43, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 19, 'font-weight': 600, fill: 'rgba(255,255,255,.8)'
      });
      S.txt(p, t('errorHint'), {
        x: L.W / 2, y: L.H * 0.49, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 16, 'font-weight': 600, fill: 'rgba(255,255,255,.45)'
      });
      this.button(p, {
        x: L.W / 2, y: L.H * 0.62, label: t('backToSongs'), color: '#e8443a',
        onClick: function () { self.go('songs'); }
      });
      this.navFocus(0, true);
    },

    /* ================================================================ *
     * 結算
     * ================================================================ */

    onFinish: function (r) {
      this.lastResult = r;
      if (!r.autoPlay) {
        var key = (r.song && r.song.id || 'unknown') + ':' + (r.diff || '');
        var prev = this.bestResults[key];
        if (!prev || r.score > prev.score) this.bestResults[key] = r;
        this.postScore();
      }
      this.go('result');
    },

    screen_result: function () {
      var L = this.lay, p = this.layers.ui, self = this;
      var r = this.lastResult;
      if (!r) { this.go('songs'); return; }
      this.bg(p, r.cleared ? '#1a2438' : '#241820');

      S.txt(p, r.cleared ? t('clear') : t('fail'), {
        x: L.W / 2, y: 58, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 48, 'font-weight': 900,
        fill: r.cleared ? '#ffd24a' : '#8fa4c0',
        stroke: 'rgba(0,0,0,.5)', 'stroke-width': 8, 'paint-order': 'stroke'
      });

      S.txt(p, TKI18n.songTitle(r.song), {
        x: L.W / 2, y: 108, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 30, 'font-weight': 900, fill: '#ffffff',
        stroke: 'rgba(0,0,0,.45)', 'stroke-width': 6, 'paint-order': 'stroke'
      });
      var songSub = TKI18n.songSub(r.song);
      if (songSub) {
        S.txt(p, songSub, {
          x: L.W / 2, y: 134, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 16, 'font-weight': 700, fill: 'rgba(255,255,255,.6)'
        });
      }

      if (r.crown) {
        var cg = S.el('g', { transform: 'translate(' + (L.W / 2) + ',208)' }, p);
        S.crown(cg, r.crown, 120);
        S.txt(cg, r.crown === 'rainbow' ? t('allGood') : r.crown === 'gold' ? t('fullCombo') : t('cleared'), {
          y: 62, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 20, 'font-weight': 900, fill: '#fff'
        });
      }

      // 左：Don-chan
      var dh = S.el('g', { transform: 'translate(190,' + fx(L.H * 0.62) + ') scale(0.78)' }, p);
      this.resultDon = S.donChan(dh, 1);
      this.resultDon.setMood(r.cleared ? 'clear' : 'sad');

      // 中：成績表
      var bx = 420, by = r.crown ? 300 : (songSub ? 186 : 166), bw = 470;
      S.el('rect', { x: bx, y: by, width: bw, height: 232, rx: 18, fill: 'rgba(0,0,0,.42)' }, p);
      var rows = [
        [t('judgeGood'), r.good, '#ffe14d'],
        [t('judgeOk'), r.ok, '#ffffff'],
        [t('judgeBad'), r.bad, '#7ea3c9'],
        [t('maxCombo'), r.maxCombo, '#ffb84d'],
        [t('rollHits'), r.rollHits, '#ffd24a']
      ];
      rows.forEach(function (row, i) {
        var y = by + 32 + i * 42;
        S.txt(p, row[0], {
          x: bx + 30, y: y, 'dominant-baseline': 'central',
          'font-size': 22, 'font-weight': 800, fill: 'rgba(255,255,255,.8)'
        });
        S.txt(p, String(row[1]), {
          x: bx + bw - 30, y: y, 'text-anchor': 'end', 'dominant-baseline': 'central',
          'font-size': 28, 'font-weight': 900, fill: row[2]
        });
      });

      // 右：分數
      var sx = 1000;
      S.el('rect', { x: sx - 130, y: by, width: 280, height: 232, rx: 18, fill: 'rgba(0,0,0,.42)' }, p);
      S.txt(p, t('score'), {
        x: sx + 10, y: by + 40, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 20, 'font-weight': 800, fill: 'rgba(255,255,255,.7)'
      });
      S.txt(p, String(r.score), {
        x: sx + 10, y: by + 92, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 46, 'font-weight': 900, fill: '#ffe45c'
      });
      if (r.autoPlay) {
        S.txt(p, t('notRanked'), {
          x: sx + 10, y: by + 128, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 14, 'font-weight': 800, fill: '#d4a0ff'
        });
      }
      var acc = r.totalNotes ? ((r.good + r.ok * 0.5) / r.totalNotes * 100) : 0;
      S.txt(p, t('accuracy', { n: acc.toFixed(1) }), {
        x: sx + 10, y: by + (r.autoPlay ? 154 : 142), 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 21, 'font-weight': 800, fill: '#fff'
      });
      var dcfg = CG.DIFFS[r.diff];
      S.txt(p, TKI18n.diffName(r.diff) + '　' + dcfg.jp + '　★' + (r.level || '?'), {
        x: sx + 10, y: by + 186, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 18, 'font-weight': 800, fill: dcfg.color
      });

      var byy = L.H - 92;
      this.button(p, { x: L.W / 2 - 250, y: byy, w: 220, h: 62, label: t('retry'), color: '#e8443a', onClick: function () { self.startSong(r.diff, { autoPlay: !!r.autoPlay }); } });
      this.button(p, { x: L.W / 2, y: byy, w: 220, h: 62, label: t('pickDiff'), color: '#3f7fd0', onClick: function () { self.go('diff'); } });
      this.button(p, { x: L.W / 2 + 250, y: byy, w: 220, h: 62, label: t('pickSong'), color: '#63a34a', onClick: function () { self.go('songs'); } });
      this.navFocus(0, true);
    },

    /* ================================================================ *
     * 設定
     * ================================================================ */

    screen_options: function () {
      var L = this.lay, p = this.layers.ui, self = this;
      this.bg(p, '#131a26');
      S.txt(p, t('optionsTitle'), {
        x: L.W / 2, y: 76, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 40, 'font-weight': 900, fill: '#ffd24a'
      });

      function slider(y, label, value, min, max, step, fmt, onChange) {
        S.txt(p, label, {
          x: 300, y: y, 'text-anchor': 'end', 'dominant-baseline': 'central',
          'font-size': 22, 'font-weight': 800, fill: '#fff'
        });
        var tx = 350, tw = 500;
        S.el('rect', { x: tx, y: y - 7, width: tw, height: 14, rx: 7, fill: 'rgba(255,255,255,.14)' }, p);
        var fill = S.el('rect', {
          x: tx, y: y - 7, width: fx((value - min) / (max - min) * tw), height: 14, rx: 7, fill: '#ffd24a'
        }, p);
        var knob = S.el('circle', {
          cx: fx(tx + (value - min) / (max - min) * tw), cy: y, r: 15,
          fill: '#fff', stroke: '#c98a00', 'stroke-width': 3
        }, p);
        var vt = S.txt(p, fmt(value), {
          x: tx + tw + 30, y: y, 'dominant-baseline': 'central',
          'font-size': 21, 'font-weight': 800, fill: '#ffd24a'
        });
        var hit = S.el('rect', {
          x: tx - 16, y: y - 24, width: tw + 32, height: 48, fill: 'transparent', style: 'cursor:pointer'
        }, p);
        function apply(clientX) {
          var pt = self.svg.createSVGPoint();
          pt.x = clientX; pt.y = 0;
          var loc = pt.matrixTransform(self.svg.getScreenCTM().inverse());
          var v = clamp((loc.x - tx) / tw, 0, 1) * (max - min) + min;
          v = Math.round(v / step) * step;
          fill.setAttribute('width', fx((v - min) / (max - min) * tw));
          knob.setAttribute('cx', fx(tx + (v - min) / (max - min) * tw));
          vt.textContent = fmt(v);
          onChange(v);
        }
        var dragging = false;
        hit.addEventListener('pointerdown', function (e) { dragging = true; hit.setPointerCapture(e.pointerId); apply(e.clientX); });
        hit.addEventListener('pointermove', function (e) { if (dragging) apply(e.clientX); });
        hit.addEventListener('pointerup', function (e) { dragging = false; try { hit.releasePointerCapture(e.pointerId); } catch (err) { } });
        return { apply: apply };
      }

      slider(180, t('musicVol'), A.settings.music, 0, 1, 0.05,
        function (v) { return Math.round(v * 100) + '%'; },
        function (v) { A.setVolume('music', v); });
      slider(252, t('sfxVol'), A.settings.sfx, 0, 1, 0.05,
        function (v) { return Math.round(v * 100) + '%'; },
        function (v) { A.setVolume('sfx', v); A.don(); });
      slider(324, t('offset'), A.settings.offsetMs, -150, 150, 5,
        function (v) { return (v > 0 ? '+' : '') + v + ' ms'; },
        function (v) { A.settings.offsetMs = v; A.saveSettings(); });

      S.txt(p, t('offsetHint'), {
        x: L.W / 2, y: 372, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 16, 'font-weight': 600, fill: 'rgba(255,255,255,.45)'
      });

      // 試打區
      var halfW = L.W / 2;
      this.optKaT = { l: 0, r: 0 };
      this.optKaGlowL = S.el('rect', {
        x: 0, y: 400, width: halfW, height: L.H - 400,
        fill: '#38bdf8', opacity: 0, 'pointer-events': 'none'
      }, p);
      this.optKaGlowR = S.el('rect', {
        x: halfW, y: 400, width: halfW, height: L.H - 400,
        fill: '#38bdf8', opacity: 0, 'pointer-events': 'none'
      }, p);
      S.txt(p, t('practice'), {
        x: L.W / 2, y: 428, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': 19, 'font-weight': 800, fill: 'rgba(255,255,255,.7)'
      });
      var dh = S.el('g', { transform: 'translate(' + L.W / 2 + ',' + fx(L.H * 0.72) + ') scale(0.8)' }, p);
      this.optDrum = S.taikoDrum(dh, 112);
      Object.keys(this.optDrum.zones).forEach(function (id) {
        self.optDrum.zones[id].g.addEventListener('pointerdown', function () {
          self.optDrum.flash(id);
          if (id[0] === 'd') A.don(); else A.ka();
        });
      });

      this.button(p, {
        x: L.W / 2, y: L.H - 66, label: t('back'), color: '#666',
        onClick: function () { self.go('title'); }
      });

      // 清除譜面快取
      this.button(p, {
        x: L.W - 190, y: L.H - 66, w: 260, h: 54, size: 19, label: t('clearCache'), color: '#8a4a4a',
        onClick: function () {
          try {
            var del = [];
            for (var i = 0; i < localStorage.length; i++) {
              var k = localStorage.key(i);
              if (k && k.indexOf('taiko.chart.') === 0) del.push(k);
            }
            del.forEach(function (k) { localStorage.removeItem(k); });
          } catch (e) { }
          A.sfx.select();
        }
      });
      this.navFocus(0, true);
    },

    /* ================================================================ *
     * 分數回傳
     * ================================================================ */

    postScore: function () {
      try {
        if (!window.parent || window.parent === window) return;
        var results = this.bestResults;
        for (var key in results) {
          var r = results[key];
          if (!r || !r.score) continue;
          window.parent.postMessage({
            type: 'mkpc:score', subject: SUBJECT, gameId: GAME_ID,
            score: r.score,
            metadata: {
              songId: r.song && r.song.id, song: r.song && r.song.title,
              difficulty: r.diff, level: r.level,
              cleared: !!r.cleared, crown: r.crown || null,
              good: r.good, ok: r.ok, bad: r.bad, maxCombo: r.maxCombo
            }
          }, '*');
        }
      } catch (e) { }
    },

    /* ================================================================ *
     * 鍵盤
     * ================================================================ */

    onKeyDown: function (e) {
      var k = String(e.key || '').toLowerCase();
      if (this.keyState[k]) return;
      this.keyState[k] = true;

      if (this.screen === 'game') {
        if (k === 'f' || k === 'j' || k === 'd' || k === 'k' ||
          k === 'z' || k === 'x' || k === 'c' || k === 'v') {
          e.preventDefault();
          var isDon = (k === 'f' || k === 'j' || k === 'x' || k === 'c');
          var isLeft = (k === 'd' || k === 'f' || k === 'z' || k === 'x');
          this.game.input(isDon ? 'don' : 'ka', isLeft ? 'l' : 'r');
          return;
        }
        if (k === 'escape') {
          if (this.game.paused) { this.game.stop(); this.go('songs'); }
          else this.game.togglePause();
          return;
        }
        if (k === ' ') { e.preventDefault(); this.game.togglePause(); return; }
        if (k === 'r' && this.game.paused) {
          var watch = !!this.game.autoPlay;
          this.game.stop();
          this.startSong(this.game.diffKey, { autoPlay: watch });
          return;
        }
        return;
      }

      // 設定畫面可以試打
      if (this.screen === 'options' && this.optDrum &&
        (k === 'd' || k === 'f' || k === 'j' || k === 'k')) {
        e.preventDefault();
        var zone = (k === 'f' || k === 'j' ? 'd' : 'k') + (k === 'd' || k === 'f' ? 'l' : 'r');
        this.optDrum.flash(zone);
        if (zone[0] === 'd') A.don(); else A.ka();
        if (zone[0] === 'k' && this.optKaT) this.optKaT[zone[1]] = 0.18;
        return;
      }

      // 選單導覽
      if (k === 'escape' || k === 'backspace') {
        e.preventDefault();
        A.sfx.back();
        if (this.screen === 'songs' || this.screen === 'options') this.go('title');
        else if (this.screen === 'diff') this.go('songs');
        else if (this.screen === 'result') this.go('songs');
        else if (this.screen === 'error') this.go('songs');
        return;
      }
      if (k === 'enter' || k === ' ' || k === 'f' || k === 'j') {
        e.preventDefault();
        if (this.screen === 'songs') { A.sfx.select(); this.go('diff'); }
        else this.navActivate();
        return;
      }
      if (k === 'arrowleft' || k === 'a' || k === 'd') {
        e.preventDefault();
        if (this.screen === 'songs') this.shiftSong(-1);
        else this.navFocus(this.nav.index - 1);
        return;
      }
      if (k === 'arrowright' || k === 'k') {
        e.preventDefault();
        if (this.screen === 'songs') this.shiftSong(1);
        else this.navFocus(this.nav.index + 1);
        return;
      }
      if (k === 'arrowup') { e.preventDefault(); this.navFocus(this.nav.index - 1); return; }
      if (k === 'arrowdown') { e.preventDefault(); this.navFocus(this.nav.index + 1); return; }
    },

    onKeyUp: function (e) {
      this.keyState[e.key.toLowerCase()] = false;
    }
  };

  global.TKApp = App;
})(window);
