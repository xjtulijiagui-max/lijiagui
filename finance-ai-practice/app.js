(function () {
  'use strict';
  var D = window.COURSE_DATA;
  if (!D) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function kb(n) { return n < 1024 ? (n / 1024).toFixed(1) + ' KB' : n + ' B'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  // 顶部说明区
  $('#workflow').innerHTML = D.workflow.map(function (w) {
    return '<div class="rounded-lg px-2.5 py-2 col-span-2 sm:col-span-1" style="background:rgba(255,255,255,.12)">' +
      '<div class="text-[10px]" style="color:#bcd3f7">STEP ' + w.step + '</div>' +
      '<div class="text-[13px] font-bold mt-0.5">' + w.name + '</div>' +
      '<div class="text-[10px] leading-tight mt-0.5" style="color:#d3e2fa">' + w.detail + '</div></div>';
  }).join('');
  $('#workspaceList').innerHTML = D.workspace.map(function (x) { return '<li>▸ ' + esc(x) + '</li>'; }).join('');
  $('#redlineList').innerHTML = D.redlines.map(function (x) { return '<li>✕ ' + esc(x) + '</li>'; }).join('');
  $('#headerTitle').textContent = D.meta.title + ' · 课堂练习台';

  // 状态
  var state = { query: '', activeTask: null };
  var STORE_KEY = 'fap-checked-v1';
  var checked = {};
  try { checked = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch (e) { checked = {}; }
  function saveChecked() { try { localStorage.setItem(STORE_KEY, JSON.stringify(checked)); } catch (e) {} }

  // 侧边栏渲染
  var nav = $('#nav');
  function renderNav(list) {
    nav.innerHTML = '';
    D.modules.forEach(function (m) {
      var tasks = list.filter(function (t) { return t.module === m.id; });
      if (!tasks.length) return;
      var wrap = el('div', 'mb-1');
      var gh = el('button', 'nav-group-btn px-5 pt-3 pb-1.5 flex items-center gap-1.5');
      gh.innerHTML = '<span class="shrink-0 inline-block w-1.5 h-1.5 rounded-full" style="background:' + modColor(m.color) + '"></span>' +
        '<span class="text-[11px] font-bold tracking-wide truncate flex-1" style="color:#9fb6da">' + m.no + ' · ' + esc(m.name) + '</span>' +
        '<span class="shrink-0 text-[10px]" style="color:#7f9ac6">' + tasks.length + '</span>';
      wrap.appendChild(gh);
      tasks.forEach(function (t) {
        var b = el('button', 'nav-task py-1.5 pl-9 pr-4 text-[12px]');
        b.setAttribute('data-goto', t.id);
        b.innerHTML = '<span class="whitespace-nowrap" style="color:#7f9ac6">' + String(t.no).padStart(2, '0') + '</span><span class="ml-2">' + esc(t.title) + '</span>';
        if (state.activeTask === t.id) b.className += ' active';
        wrap.appendChild(b);
      });
      nav.appendChild(wrap);
    });
  }
  function modColor(c) {
    return ({ indigo: '#8aa2f0', blue: '#6fb6f5', violet: '#b79bf2', teal: '#5fd4c4', rose: '#f295a6' })[c] || '#8aa2f0';
  }

  // 任务卡渲染
  var listWrap = $('#taskList');
  function renderTasks(list) {
    listWrap.innerHTML = '';
    list.forEach(function (t) {
      var m = D.modules.filter(function (x) { return x.id === t.module; })[0];
      var card = el('article', 'task-card rounded-2xl border overflow-hidden', '');
      card.id = t.id;
      card.style.background = '#fff';
      card.style.borderColor = 'var(--line)';

      // 头部
      var head = el('div', 'px-5 sm:px-6 pt-5 pb-4');
      head.style.background = 'linear-gradient(90deg,' + modTint(m.color) + ',#ffffff)';
      head.innerHTML =
        '<div class="flex items-center gap-2 flex-wrap">' +
          '<span class="text-[11px] font-bold px-2 py-0.5 rounded" style="background:' + modColor(m.color) + ';color:#142644">' + m.no + '</span>' +
          '<span class="text-[11px] px-2 py-0.5 rounded" style="background:#eef3fb;color:#254a8c">PPT ' + esc(t.pptPages) + '</span>' +
          '<span class="text-[11px] px-2 py-0.5 rounded" style="background:#fff4e8;color:#b35a11">' + esc(t.level) + '</span>' +
          '<span class="ml-auto text-[11px]" style="color:#7c8ba1">任务 ' + String(t.no).padStart(2, '0') + ' / 17</span>' +
        '</div>' +
        '<h3 class="text-lg font-bold mt-2">' + t.no + '. ' + esc(t.title) + '</h3>' +
        '<p class="text-[13px] mt-1 leading-relaxed" style="color:#4a5b74">' + esc(t.goal) + '</p>' +
        '<div class="text-[11px] mt-2 flex flex-wrap gap-x-5 gap-y-1" style="color:#73839b">' +
          '<span>所需输入：' + esc(t.inputs) + '</span>' +
          '<span>产出：' + esc(t.output) + '</span>' +
        '</div>';
      card.appendChild(head);

      var body = el('div', 'px-5 sm:px-6 pb-5 pt-4 grid lg:grid-cols-[300px_1fr] gap-5');

      // 左列：数据集
      var left = el('div');
      left.innerHTML = '<div class="text-xs font-bold mb-2 flex items-center gap-1.5" style="color:#254a8c">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h10"/></svg>' +
        '配套数据集 <span class="font-normal" style="color:#8a97ab">(' + t.files.length + ')</span></div>';
      t.files.forEach(function (f) {
        var a = el('a', 'flex items-center gap-2 rounded-lg px-2.5 py-2 mb-1.5 text-[12px] border group');
        a.href = 'data/' + encodeURIComponent(f.name);
        a.setAttribute('download', f.name);
        a.style.cssText = 'background:#f8fafe;border-color:#e3eaf5;color:#2c3f5e';
        a.innerHTML = '<svg class="shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c07a1f" stroke-width="2"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3"/></svg>' +
          '<span class="truncate flex-1" title="' + esc(f.name) + '">' + esc(f.name) + '</span>' +
          '<span class="shrink-0 text-[10px]" style="color:#93a1b6">' + kb(f.size) + '</span>';
        left.appendChild(a);
      });
      var note = el('div', 'text-[10px] leading-relaxed mt-1.5 px-1', '仅模拟/脱敏副本。下载后放入 01-原始数据，原名保存、勿覆盖。');
      note.style.color = '#8a97ab';
      left.appendChild(note);
      body.appendChild(left);

      // 右列：提示词 + 验收
      var right = el('div');
      t.prompts.forEach(function (p, pi) {
        var pc = el('div', 'rounded-xl border mb-3 overflow-hidden');
        pc.style.borderColor = '#dde4ef';
        var ph = el('div', 'flex items-center gap-2 px-3.5 py-2.5', '');
        ph.style.background = '#f1f5fc';
        ph.innerHTML = '<span class="text-[11px] font-bold px-1.5 py-0.5 rounded" style="background:#254a8c;color:#fff">提示词 ' + esc(p.id) + '</span>' +
          '<span class="text-[13px] font-bold">' + esc(p.title) + '</span>' +
          '<span class="ml-auto hidden sm:block text-[10px]" style="color:#8392a8">' + esc(p.source) + '</span>';
        pc.appendChild(ph);

        var ta = el('div', 'px-3.5 py-3', '');
        ta.style.background = '#fbfcfe';
        var pre = el('pre', 'prompt-pre text-[12.5px] leading-[1.75] m-0', p.text);
        pre.style.color = '#26354d';
        pre.setAttribute('data-prompt', t.id + '-' + pi);
        ta.appendChild(pre);
        // 手动复制入口
        var manual = el('details', 'mt-2');
        var summary = el('summary', 'text-[11px] cursor-pointer', '手动复制 / 查看纯文本');
        summary.style.color = '#6d7f9b';
        manual.appendChild(summary);
        var box = el('textarea', 'w-full mt-2 rounded p-2 text-[12px] leading-relaxed', p.text);
        box.setAttribute('readonly', 'readonly');
        box.rows = Math.min(14, Math.max(4, p.text.split('\n').length + 2));
        box.style.cssText = 'border:1px solid #dde4ef;background:#fff;color:#26354d';
        box.addEventListener('focus', function () { box.select(); });
        manual.appendChild(box);
        ta.appendChild(manual);
        pc.appendChild(ta);

        var pf = el('div', 'px-3.5 py-2.5 border-t flex items-center justify-between gap-2');
        pf.style.cssText = 'border-color:#e8edf5;background:#fff';
        var src = el('span', 'text-[10px] sm:hidden', p.source);
        src.style.color = '#8392a8';
        pf.appendChild(src);
        var btn = el('button', 'inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-lg');
        btn.style.cssText = 'background:#254a8c;color:#fff';
        btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>复制完整提示词';
        btn.addEventListener('click', function () { copyText(p.text, btn); });
        pf.appendChild(btn);
        pc.appendChild(pf);
        right.appendChild(pc);
      });

      // 验收清单
      var ac = el('div', 'rounded-xl border p-3.5 mt-1');
      ac.style.cssText = 'border-color:#e3eaf5;background:#f8fafe';
      var acTitle = el('div', 'text-xs font-bold mb-2 flex items-center gap-1.5', '对照验收清单');
      acTitle.style.color = '#254a8c';
      ac.appendChild(acTitle);
      var ck = checked[t.id] || {};
      t.acceptance.forEach(function (a, ai) {
        var lab = el('label', 'flex items-start gap-2 text-[12px] py-1 cursor-pointer');
        lab.style.color = '#3a4a64';
        var cb = el('input');
        cb.type = 'checkbox';
        cb.checked = !!ck[ai];
        cb.className = 'mt-0.5';
        cb.style.accentColor = '#254a8c';
        cb.addEventListener('change', function () {
          if (!checked[t.id]) checked[t.id] = {};
          checked[t.id][ai] = cb.checked;
          lab.style.textDecoration = cb.checked ? 'line-through' : '';
          lab.style.color = cb.checked ? '#93a1b6' : '#3a4a64';
          saveChecked();
        });
        if (cb.checked) { lab.style.textDecoration = 'line-through'; lab.style.color = '#93a1b6'; }
        lab.appendChild(cb);
        lab.appendChild(el('span', '', esc(a)));
        ac.appendChild(lab);
      });
      right.appendChild(ac);
      body.appendChild(right);
      card.appendChild(body);
      listWrap.appendChild(card);
    });
  }

  function modTint(c) {
    return ({ indigo: '#eef1fd', blue: '#eaf4fe', violet: '#f3edfd', teal: '#e8f9f5', rose: '#fdeef1' })[c] || '#eef1fd';
  }

  // 复制
  function copyText(text, btn) {
    var done = function (ok) {
      var old = btn.innerHTML;
      btn.innerHTML = ok
        ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 5 5L20 7"/></svg>已复制完整提示词'
        : '复制失败，请用下方纯文本手动复制';
      btn.style.background = ok ? '#2e7d5b' : '#b35a11';
      toast(ok ? '已复制完整中文提示词' : '剪贴板不可用，请使用手动复制框');
      setTimeout(function () { btn.innerHTML = old; btn.style.background = '#254a8c'; }, 2200);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(text, done); });
    } else { fallback(text, done); }
  }
  function fallback(text, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      done(ok);
    } catch (e) { done(false); }
  }
  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }

  // 筛选与搜索
  function matches(t) {
    var q = state.query.trim().toLowerCase();
    if (!q) return true;
    var hay = [t.no, t.title, t.goal, t.inputs, t.output, t.pptPages]
      .concat(t.tags || [])
      .concat(t.files.map(function (f) { return f.name; }))
      .concat(t.prompts.map(function (p) { return p.id + ' ' + p.title + ' ' + p.text; }))
      .join(' ').toLowerCase();
    return hay.indexOf(q) !== -1;
  }
  function apply() {
    var list = D.tasks.filter(matches);
    renderTasks(list);
    renderNav(list);
    $('#emptyState').classList.toggle('hidden', list.length > 0);
    $('#resultInfo').textContent = state.query
      ? '搜索「' + state.query + '」 · 命中 ' + list.length + ' 个任务'
      : '按PPT顺序排列 · 共 17 个任务';
    $('#navCount').textContent = state.query ? '命中 ' + list.length + ' / 17' : '显示全部 17 个任务';
    $('#clearBtn').classList.toggle('hidden', !state.query);
    if (state.activeTask) highlight();
  }
  function highlight() {
    $$('.nav-task').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-goto') === state.activeTask);
    });
  }

  // 事件
  $('#searchInput').addEventListener('input', function (e) { state.query = e.target.value; apply(); });
  $('#clearBtn').addEventListener('click', function () {
    state.query = ''; $('#searchInput').value = ''; apply(); $('#searchInput').focus();
  });
  nav.addEventListener('click', function (e) {
    var b = e.target.closest('[data-goto]');
    if (!b) return;
    state.activeTask = b.getAttribute('data-goto');
    highlight();
    var target = document.getElementById(state.activeTask);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    closeDrawer();
  });

  // 抽屉
  var sidebar = $('#sidebar'), overlay = $('#overlay');
  function openDrawer() { sidebar.classList.remove('-translate-x-full'); overlay.classList.remove('hidden'); $('#searchInput').focus(); }
  function closeDrawer() { sidebar.classList.add('-translate-x-full'); overlay.classList.add('hidden'); }
  $('#menuBtn').addEventListener('click', openDrawer);
  $('#closeBtn').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !sidebar.classList.contains('-translate-x-full')) closeDrawer();
  });

  // 打包下载：在 GitHub Pages 上提供 zip（与单文件同目录）
  $('#downloadAllBtn').addEventListener('click', function () {
    window.location.href = 'data/AI赋能财务效率与共享升级_练习数据集（27个文件）.zip';
  });

  $$('#statTask').forEach(function (n) { n.textContent = D.tasks.length; });
  $$('#statPrompt').forEach(function (n) { n.textContent = D.tasks.reduce(function (s, t) { return s + t.prompts.length; }, 0); });
  var uniqueFiles = {};
  D.tasks.forEach(function (t) { t.files.forEach(function (f) { uniqueFiles[f.name] = 1; }); });
  $$('#statData').forEach(function (n) { n.textContent = Object.keys(uniqueFiles).length; });

  apply();
})();
