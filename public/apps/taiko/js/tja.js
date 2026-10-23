/* =============================================================================
 * tja.js — 把 TJA 譜面轉成遊戲已經在用的 mkpc-taiko-chart 物件
 *
 * 時間規則跟 taiko-web / TJAPlayer 相同：
 *   音符時間 = 譜面進行時間 - OFFSET
 *   負的 OFFSET 會讓音符變晚（音訊先開始）
 *   一小節秒數 = 60 * (分子/分母) * 4 / BPM
 *   小節裡的每個數字平分這一小節；#BPMCHANGE 可以出現在小節中間
 *   #DELAY 把後面的譜往後推，單位是秒
 * 分歧譜沒有遊玩中的切換，固定走達人（#M），沒有就依序用玄人、普通。
 * ===========================================================================*/
(function (global) {
  'use strict';

  var COURSE_KEYS = {
    '0': 'easy', 'easy': 'easy', 'かんたん': 'easy',
    '1': 'normal', 'normal': 'normal', 'ふつう': 'normal',
    '2': 'hard', 'hard': 'hard', 'むずかしい': 'hard',
    '3': 'oni', 'oni': 'oni', 'おに': 'oni',
    '4': 'edit', 'edit': 'edit', 'ura': 'edit'
  };

  function round3(v) { return Math.round(v * 1000) / 1000; }
  function round2(v) { return Math.round(v * 100) / 100; }

  function courseKey(value) {
    var v = String(value || '').trim().toLowerCase();
    return COURSE_KEYS[v] || 'oni';
  }

  function stripComments(text) {
    return String(text || '').replace(/^\uFEFF/, '').split(/\r\n|\n|\r/).map(function (line) {
      var cut = line.indexOf('//');
      return cut >= 0 ? line.slice(0, cut) : line;
    }).join('\n');
  }

  function headerValue(line) {
    var m = line.match(/^([A-Za-z][A-Za-z0-9]*)\s*:\s*(.*)$/);
    if (!m) return null;
    return { key: m[1].toUpperCase(), value: m[2].trim() };
  }

  function parseNumberList(value) {
    if (!value) return [];
    return value.split(',').map(function (part) {
      var n = parseInt(part.trim(), 10);
      return n > 0 ? n : 0;
    }).filter(function (n) { return n > 0; });
  }

  function blankCourse(key) {
    return {
      key: key,
      level: 1,
      balloons: [],
      balloonNor: null,
      balloonExp: null,
      balloonMas: null,
      bodies: {}
    };
  }

  function tokenize(body) {
    var tokens = [];
    var i = 0;
    var text = body;
    while (i < text.length) {
      var c = text.charAt(i);
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
      if (c === ',') { tokens.push({ kind: 'bar' }); i++; continue; }
      if (c === '#') {
        var end = text.indexOf('\n', i);
        if (end < 0) end = text.length;
        tokens.push({ kind: 'cmd', line: text.slice(i, end).trim() });
        i = end;
        continue;
      }
      if (/[0-9A-Fa-f]/.test(c)) {
        tokens.push({ kind: 'note', value: c.toUpperCase() });
        i++;
        continue;
      }
      i++;
    }
    return tokens;
  }

  function commandName(line) {
    var m = String(line || '').match(/^#([A-Za-z]+)\s*(.*)$/);
    if (!m) return null;
    return { name: m[1].toUpperCase(), arg: m[2].trim() };
  }

  function branchChoice(tokens, from) {
    var has = { N: false, E: false, M: false };
    for (var i = from; i < tokens.length; i++) {
      var cmd = tokens[i].kind === 'cmd' ? commandName(tokens[i].line) : null;
      if (!cmd) continue;
      if (cmd.name === 'BRANCHEND' || cmd.name === 'BRANCHSTART') break;
      if (cmd.name === 'N' || cmd.name === 'E' || cmd.name === 'M') has[cmd.name] = true;
    }
    if (has.M) return 'M';
    if (has.E) return 'E';
    return 'N';
  }

  function measureSeconds(bpm, numerator, denominator) {
    return 60 * (numerator / denominator) * 4 / bpm;
  }

  /**
   * 把一個 COURSE 的譜面內文變成 notes 陣列。
   * 回傳 { notes, bpm, bpmChanges, scroll }。
   */
  function compileCourse(body, tjaOffset, bpm, balloons, scroll) {
    var tokens = tokenize(body);
    var time = -tjaOffset;
    var origin = time;
    var currentBpm = bpm > 0 ? bpm : 120;
    var initialBpm = currentBpm;
    var numerator = 4;
    var denominator = 4;
    var notes = [];
    var changes = [];
    var open = null;
    var balloonAt = 0;
    var mode = 'play';
    var chosen = 'M';
    var measure = [];
    var chartScroll = scroll > 0 ? scroll : 1;
    var pendingMeasure = null;

    function takeMeasureChange() {
      if (!pendingMeasure) return;
      numerator = pendingMeasure.num;
      denominator = pendingMeasure.den;
      pendingMeasure = null;
    }

    function takeBalloon() {
      var n = balloonAt < balloons.length ? balloons[balloonAt] : 5;
      balloonAt++;
      return n;
    }

    function pushChange(at, nextBpm) {
      var last = changes.length ? changes[changes.length - 1] : null;
      var row = { t: round3(at), bpm: round2(nextBpm) };
      if (last && Math.abs(last.t - row.t) < 0.0005) changes[changes.length - 1] = row;
      else changes.push(row);
    }

    function setBpm(next) {
      if (!(next > 0) || Math.abs(next - currentBpm) < 1e-6) return;
      currentBpm = next;
      if (Math.abs(time - origin) < 1e-4) initialBpm = currentBpm;
      else pushChange(time, currentBpm);
    }

    function closeOpen(at) {
      if (!open) return;
      var dur = Math.max(0.001, at - open.t);
      if (open.type === 7) notes.push([round3(open.t), 7, round3(dur), open.hits]);
      else notes.push([round3(open.t), open.type, round3(dur)]);
      open = null;
    }

    function place(value, at) {
      if (value === '0' || value === 'F') return;
      if (value === '8') { closeOpen(at); return; }
      if (value === '9' && open && open.type === 7) {
        closeOpen(at);
        open = { type: 7, t: at, hits: takeBalloon() };
        return;
      }
      var type = value === '1' || value === 'A' ? 1
        : value === '2' || value === 'B' ? 2
        : value === '3' ? 3
        : value === '4' ? 4
        : value === '5' ? 5
        : value === '6' ? 6
        : value === '7' || value === '9' ? 7
        : 0;
      if (!type) return;
      if (type >= 5) {
        if (open) closeOpen(at);
        open = { type: type, t: at, hits: type === 7 ? takeBalloon() : 0 };
        return;
      }
      notes.push([round3(at), type]);
    }

    function applyCommand(cmd, notesSeen) {
      if (!cmd) return;
      if (cmd.name === 'BPMCHANGE') setBpm(parseFloat(cmd.arg));
      else if (cmd.name === 'DELAY') {
        var delay = parseFloat(cmd.arg);
        if (isFinite(delay)) time += delay;
      } else if (cmd.name === 'MEASURE') {
        var parts = cmd.arg.split('/');
        var num = parseFloat(parts[0]);
        var den = parseFloat(parts[1]);
        if (!(num > 0 && den > 0)) return;
        if (notesSeen === 0) {
          numerator = num;
          denominator = den;
        } else {
          pendingMeasure = { num: num, den: den };
        }
      } else if (cmd.name === 'SCROLL') {
        var nextScroll = parseFloat(cmd.arg);
        if (nextScroll > 0 && notes.length === 0 && !open) chartScroll = nextScroll;
      }
    }

    function flushMeasure(closed) {
      takeMeasureChange();
      var slots = 0;
      var i;
      for (i = 0; i < measure.length; i++) if (measure[i].kind === 'note') slots++;
      if (slots === 0) {
        for (i = 0; i < measure.length; i++) applyCommand(commandName(measure[i].line), 0);
        if (closed && currentBpm > 0) time += measureSeconds(currentBpm, numerator, denominator);
        measure = [];
        return;
      }
      var seen = 0;
      for (i = 0; i < measure.length; i++) {
        var token = measure[i];
        if (token.kind === 'cmd') {
          applyCommand(commandName(token.line), seen);
          continue;
        }
        var step = measureSeconds(currentBpm, numerator, denominator) / slots;
        place(token.value, time);
        time += step;
        seen++;
      }
      measure = [];
    }

    var index;
    for (index = 0; index < tokens.length; index++) {
      var token = tokens[index];
      var cmd = token.kind === 'cmd' ? commandName(token.line) : null;
      if (cmd && (cmd.name === 'BRANCHSTART' || cmd.name === 'N' || cmd.name === 'E' || cmd.name === 'M' || cmd.name === 'BRANCHEND')) {
        if (measure.length) flushMeasure(true);
        if (cmd.name === 'BRANCHSTART') {
          chosen = branchChoice(tokens, index + 1);
          mode = 'skip';
        } else if (cmd.name === 'BRANCHEND') {
          mode = 'play';
        } else {
          mode = cmd.name === chosen ? 'play' : 'skip';
        }
        continue;
      }
      if (mode === 'skip') {
        if (token.kind === 'note' && (token.value === '7' || token.value === '9')) takeBalloon();
        continue;
      }
      if (token.kind === 'bar') flushMeasure(true);
      else measure.push(token);
    }
    flushMeasure(false);
    closeOpen(time);

    notes.sort(function (a, b) { return a[0] - b[0]; });
    return {
      notes: notes,
      bpm: round2(initialBpm),
      bpmChanges: changes,
      scroll: chartScroll
    };
  }

  function scoreInitFor(notes) {
    var CG = global.TaikoChartGen;
    if (!CG || !CG.computeScoreInit) return 1000;
    var taps = [];
    var rolls = [];
    notes.forEach(function (note) {
      if (note[1] >= 5) rolls.push({ t: note[0], type: note[1], dur: note[2] || 0, hits: note[3] || 0 });
      else taps.push({ t: note[0], big: note[1] === 3 || note[1] === 4 });
    });
    return CG.computeScoreInit(taps, rolls);
  }

  function parseTja(text, meta) {
    meta = meta || {};
    var lines = stripComments(text).split('\n');
    var song = { bpm: 120, offset: 0, demoStart: 0, title: '', subtitle: '', wave: '', scroll: 1 };
    var courses = [];
    var current = null;
    var inChart = false;
    var chartPlayer = '';
    var chartLines = [];

    function ensureCourse() {
      if (!current) {
        current = blankCourse('oni');
        courses.push(current);
      }
      return current;
    }

    function finishChart() {
      var course = ensureCourse();
      var player = chartPlayer || 'SINGLE';
      course.bodies[player] = chartLines.join('\n');
      chartLines = [];
      chartPlayer = '';
    }

    var lineNo;
    for (lineNo = 0; lineNo < lines.length; lineNo++) {
      var raw = lines[lineNo];
      var trimmed = raw.trim();
      if (inChart) {
        if (/^#END\b/i.test(trimmed)) {
          inChart = false;
          finishChart();
        } else {
          chartLines.push(raw);
        }
        continue;
      }
      if (!trimmed) continue;
      if (/^#START\b/i.test(trimmed)) {
        var start = commandName(trimmed);
        chartPlayer = start && start.arg ? start.arg.toUpperCase() : '';
        inChart = true;
        chartLines = [];
        continue;
      }
      var header = headerValue(trimmed);
      if (!header) continue;
      if (header.key === 'COURSE') {
        current = blankCourse(courseKey(header.value));
        courses.push(current);
      } else if (header.key === 'BPM') {
        var bpm = parseFloat(header.value);
        if (bpm > 0) song.bpm = bpm;
      } else if (header.key === 'OFFSET') {
        var offset = parseFloat(header.value);
        if (isFinite(offset)) song.offset = offset;
      } else if (header.key === 'DEMOSTART') {
        var demo = parseFloat(header.value);
        if (isFinite(demo)) song.demoStart = demo;
      } else if (header.key === 'TITLE') {
        song.title = header.value;
      } else if (header.key === 'SUBTITLE') {
        song.subtitle = header.value.replace(/^(--|\+\+)\s*/, '');
      } else if (header.key === 'WAVE') {
        song.wave = header.value;
      } else if (header.key === 'HEADSCROLL') {
        var headScroll = parseFloat(header.value);
        if (headScroll > 0) song.scroll = headScroll;
      } else if (header.key === 'LEVEL') {
        var level = Math.round(parseFloat(header.value));
        if (level > 0) ensureCourse().level = Math.max(1, Math.min(10, level));
      } else if (header.key === 'BALLOON') {
        ensureCourse().balloons = parseNumberList(header.value);
      } else if (header.key === 'BALLOONNOR') {
        ensureCourse().balloonNor = parseNumberList(header.value);
      } else if (header.key === 'BALLOONEXP') {
        ensureCourse().balloonExp = parseNumberList(header.value);
      } else if (header.key === 'BALLOONMAS') {
        ensureCourse().balloonMas = parseNumberList(header.value);
      }
    }
    if (inChart) finishChart();

    var charts = {};
    var timing = {};
    var edit = null;
    courses.forEach(function (course) {
      var body = course.bodies.SINGLE || course.bodies.P1 || course.bodies.P2 || '';
      if (!body.trim()) return;
      var balloons = course.balloons;
      if (!balloons.length && course.balloonMas && course.balloonMas.length) balloons = course.balloonMas;
      var compiled = compileCourse(body, song.offset, song.bpm, balloons, song.scroll);
      var chart = {
        level: course.level,
        scoreInit: scoreInitFor(compiled.notes),
        scroll: compiled.scroll,
        notes: compiled.notes
      };
      timing[course.key] = compiled;
      if (course.key === 'edit') edit = chart;
      else charts[course.key] = chart;
    });
    if (!charts.oni && edit) charts.oni = edit;
    var barSource = timing.oni || timing.edit || timing.hard || timing.normal || timing.easy;
    var timingBpm = barSource && barSource.bpm > 0 ? barSource.bpm : song.bpm;
    var bpmChanges = barSource && barSource.bpmChanges.length ? barSource.bpmChanges : null;

    var data = {
      format: 'mkpc-taiko-chart',
      version: 1,
      source: 'tja',
      id: meta.id || '',
      title: meta.title || song.title || '',
      titleZh: meta.titleZh || '',
      subtitle: meta.subtitle || song.subtitle || '',
      subtitleZh: meta.subtitleZh || '',
      audio: meta.audio || '',
      wave: song.wave,
      bpm: timingBpm,
      offset: round3(-song.offset),
      demoStart: song.demoStart,
      charts: charts
    };
    if (bpmChanges && bpmChanges.length) data.bpmChanges = bpmChanges;
    return data;
  }

  if (global.TaikoChartGen) global.TaikoChartGen.parseTja = parseTja;
  global.TaikoTja = { parse: parseTja };
})(window);
