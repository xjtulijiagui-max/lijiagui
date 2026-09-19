/* HR 自动化工作台 · 公共脚本
   提供 CSV 导出（Excel 可直接打开，带 UTF-8 BOM 中文不乱码）与数字格式化 */

function wbCSV(rows, filename) {
  if (!rows || !rows.length) { alert('还没有可以导出的内容。'); return; }
  var csv = rows.map(function (r) {
    return (r || []).map(function (c) {
      c = (c == null ? '' : String(c));
      return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c;
    }).join(',');
  }).join('\r\n');
  var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename || '导出.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function wbNum(id) {
  var v = parseFloat(document.getElementById(id));
  return isNaN(v) ? null : v;
}
function wbVal(id) {
  var el = typeof id === 'string' ? document.getElementById(id) : id;
  return el ? el.value : '';
}
function wbF1(v) { return v == null ? '—' : v.toFixed(1); }
function wbF2(v) { return v == null ? '—' : v.toFixed(2); }
function wbF0(v) { return v == null ? '—' : Math.round(v).toLocaleString('zh-CN'); }
function wbPct(v) { return v == null ? '—' : v.toFixed(2) + '%'; }
function wbDate() {
  var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
  return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
}
function wbEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

/* 存入方案：把当前工具算出的结果汇总到 localStorage，供生成器带入 */
function wbToast(msg) {
  var t = document.getElementById('wb-toast');
  if (!t) { t = document.createElement('div'); t.id = 'wb-toast'; t.style.cssText =
    'position:fixed;left:50%;top:18px;transform:translateX(-50%);background:#1F2328;color:#fff;' +
    'padding:9px 16px;border-radius:10px;font-size:13px;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.2)';
    document.body.appendChild(t); }
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(t._t); t._t = setTimeout(function () { t.style.opacity = '0'; }, 2200);
}
function wbPlanSave() {
  try {
    var p = {};
    var e = window.__last; if (e) { if (e.C) p.员工人数 = e.C; if (e.R) p.年营收 = e.R; if (e.packs) p.人工成本 = e.packs; }
    var c = window.__comp; if (c) { var rp = (c.redN || 0) + (c.midN || 0); if (rp) p.合规风险点 = rp; if (c.total) p.预估赔付 = c.total; }
    var s = window.__salary; if (s) { if (s.curCost) p.人工成本 = s.curCost; if (s.pack) p.工资包 = s.pack; }
    var j = window.__job; if (j && j.elastic) p.建议编制 = j.elastic;
    if (!Object.keys(p).length) { wbToast('当前页面还没有可存入的方案，先点一下「计算」'); return; }
    var prev = {}; try { prev = JSON.parse(localStorage.getItem('hr_bench_plan_v1') || '{}'); } catch (er) {}
    var keys = Object.keys(p);
    keys.forEach(function (k) { prev[k] = p[k]; });
    prev._from = document.title || 'HR工具';
    localStorage.setItem('hr_bench_plan_v1', JSON.stringify(prev));
    wbToast('已存入方案（' + keys.join('、') + '），可在「生成企业专属制度」带入');
  } catch (err) { wbToast('存入失败：' + err.message); }
}

/* 统一外壳：注入头部导航与页脚 */
function wbShell(title) {
  var head = document.createElement('div');
  head.className = 'wb-head';
  head.innerHTML =
    '<div class="wb-hwrap">' +
      '<a class="wb-back" href="index.html">&larr; HR工作台</a>' +
      '<span class="wb-title">' + title + '</span>' +
      '<span class="wb-space"></span>' +
      '<button class="wb-btn" onclick="window.print()">打印/存PDF</button>' +
      '<button class="wb-btn wb-primary" onclick="wbExport()">导出 Excel</button>' +
      '<button class="wb-btn wb-plan" onclick="wbPlanSave()">存入方案</button>' +
    '</div>';
  document.body.insertBefore(head, document.body.firstChild);

  var foot = document.createElement('div');
  foot.className = 'wb-foot';
  foot.innerHTML = '<div class="wb-fwrap"><b>HR 自动化工作台</b> ｜ HR 工具与资料分享' +
    '　·　测算在浏览器内完成，重要结果请导出备份</div>';
  document.body.appendChild(foot);
  wbAuthGate();
  wbSidebar();
}

/* 静态工作台无需登录；保留旧页面的兼容调用。 */
function wbAuthGate() {}

/* 通用导出：把页面里所有表格抓成 CSV。
   任何页面接进来就能导出，不必逐个了解内部结构。
   页面可自行覆盖 wbExport() 做定制化导出。 */
function wbExportTables(filename) {
  var tables = document.querySelectorAll('table');
  if (!tables.length) { alert('页面上还没有生成表格，先做完测算再导出。'); return; }
  var rows = [];
  for (var i = 0; i < tables.length; i++) {
    var trs = tables[i].querySelectorAll('tr');
    for (var j = 0; j < trs.length; j++) {
      var cells = trs[j].querySelectorAll('th,td');
      var r = [];
      for (var k = 0; k < cells.length; k++) {
        r.push((cells[k].innerText || cells[k].textContent || '').trim().replace(/\s+/g, ' '));
      }
      if (r.length) rows.push(r);
    }
    rows.push([]);
  }
  wbCSV(rows, filename || '导出_' + wbDate() + '.csv');
}

function wbExport() { wbExportTables(); }

/* 极简 XLSX 兼容层
   现成资产里有页面依赖 SheetJS CDN 做 Excel 导出/导入。
   这里用纯前端实现顶掉：导出转 CSV 下载，导入解析 CSV/TSV。
   目的：去掉 CDN，保证断网可用。若环境里已加载真 SheetJS 则让位给它。 */
(function () {
  if (typeof window.XLSX !== 'undefined') return;
  function aoa_to_sheet(data) { return { __aoa: data || [] }; }
  function book_new() { return { SheetNames: [], Sheets: {} }; }
  function book_append_sheet(wb, ws, name) { wb.SheetNames.push(name); wb.Sheets[name] = ws; }
  function sheet_to_json(ws) { return (ws.__aoa || []).slice(); }
  function writeFile(wb, filename) {
    var rows = [];
    wb.SheetNames.forEach(function (n) {
      rows.push([n]);
      (wb.Sheets[n].__aoa || []).forEach(function (r) { rows.push(r); });
      rows.push([]);
    });
    wbCSV(rows, String(filename || '导出').replace(/\.xlsx?$/i, '') + '.csv');
  }
  function decode(data) {
    if (typeof data === 'string') return data;
    try { return new TextDecoder('utf-8').decode(data); } catch (e) {
      var s = '';
      for (var i = 0; i < data.length; i++) s += String.fromCharCode(data[i]);
      return decodeURIComponent(escape(s));
    }
  }
  function read(data) {
    var txt = decode(data);
    var delim = txt.indexOf('\t') >= 0 ? '\t' : (txt.indexOf(',') >= 0 ? ',' : null);
    if (!delim || /PK\x03\x04/.test(txt.slice(0, 4)))
      throw new Error('这是 xlsx 二进制文件。请「另存为 CSV」后再上传，或直接从 Excel 复制粘贴。');
    var aoa = txt.split(/\r\n|\r|\n/).map(function (line) {
      return line.split(delim).map(function (c) { return c.trim(); });
    }).filter(function (r) { return r.some(function (c) { return c !== ''; }); });
    return { SheetNames: ['Sheet1'], Sheets: { Sheet1: aoa_to_sheet(aoa) } };
  }
  window.XLSX = {
    utils: {
      aoa_to_sheet: aoa_to_sheet, book_new: book_new,
      book_append_sheet: book_append_sheet, sheet_to_json: sheet_to_json
    },
    writeFile: writeFile, read: read
  };
})();

/* 左侧资源栏：所有页面统一注入。
   读 resources.js 的 WB_RESOURCES 渲染分类可展开列表；
   ready 项为可下载链接，未 ready 显示灰色「待上传」。
   移动端用汉堡按钮唤出 + 遮罩。 */
function wbSidebar() {
  function ensureToggle() {
    if (document.getElementById('wb-sb-toggle')) return;
    var t = document.createElement('button');
    t.id = 'wb-sb-toggle';
    t.innerHTML = '☰ 资料';
    t.addEventListener('click', function () {
      var sb = document.getElementById('wb-sidebar');
      var m = document.getElementById('wb-sb-mask');
      if (sb) sb.classList.toggle('open');
      if (m) m.classList.toggle('open');
    });
    document.body.appendChild(t);
  }
  function render() {
    if (document.getElementById('wb-sidebar')) return;
    var data = window.WB_RESOURCES || [];
    var sb = document.createElement('div');
    sb.id = 'wb-sidebar';
    var html = '<div class="sb-head">资料下载</div>';
    data.forEach(function (g, gi) {
      html += '<div class="sb-cat" data-i="' + gi + '">' +
        '<span>' + (g.icon ? '<span style="font-size:14px">' + g.icon + '</span> ' : '') +
        wbEsc(g.cat) + '</span><span class="ar">▾</span></div>';
      html += '<div class="sb-items">';
      (g.items || []).forEach(function (it) {
        if (it.ready) {
          if (it.zip) {
            html += '<a class="sb-item sb-bundle" href="#" data-dir="' + wbEsc(it.zip) +
              '" data-zip="' + wbEsc(it.zipname || 'bundle.zip') + '">' + wbEsc(it.name) +
              (it.note ? '<span class="sb-note">' + wbEsc(it.note) + '</span>' : '') + '</a>';
          } else if (it.link) {
            html += '<a class="sb-item" href="' + wbEsc(it.link) + '">' + wbEsc(it.name) +
              (it.note ? '<span class="sb-note">' + wbEsc(it.note) + '</span>' : '') + '</a>';
          } else {
          html += '<a class="sb-item" href="' + wbEsc(it.file) + '" download>' + wbEsc(it.name) +
            (it.note ? '<span class="sb-note">' + wbEsc(it.note) + '</span>' : '') + '</a>';
          }
        } else {
          html += '<span class="sb-item pending">' + wbEsc(it.name || '待上传') +
            '<span class="sb-note">待上传</span></span>';
        }
      });
      html += '</div>';
    });
    html += '<div class="sb-tip">HR 制度与表单可直接下载。示例企业为 XXAI原生组织，使用前请按实际情况修订。</div>';
    sb.innerHTML = html;
    document.body.appendChild(sb);
    sb.querySelectorAll('.sb-cat').forEach(function (c) {
      c.addEventListener('click', function () { c.classList.toggle('collapsed'); });
    });
    sb.querySelectorAll('.sb-bundle').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        wbDownloadBundle(el.getAttribute('data-dir'), el.getAttribute('data-zip'));
      });
    });
    if (!document.getElementById('wb-sb-mask')) {
      var mask = document.createElement('div');
      mask.id = 'wb-sb-mask';
      mask.addEventListener('click', function () {
        sb.classList.remove('open'); mask.classList.remove('open');
      });
      document.body.appendChild(mask);
    }
  }
  ensureToggle();
  if (window.WB_RESOURCES) { render(); }
  else {
    var s = document.createElement('script');
    s.src = 'resources.js';
    s.onload = render; s.onerror = render;
    document.head.appendChild(s);
  }
}

/* 整套打包下载：把某个目录下的所有文件（按 manifest.json 清单）打包成 zip 下载。
   零依赖：自写 CRC32 + store zip（文件名按 UTF-8 编码，解压不乱码）。
   数据全部来自本地 resources/，不上传服务器。 */
(function () {
  function crc32(bytes) {
    var t = crc32._t || (crc32._t = (function () {
      var a = new Uint32Array(256);
      for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        a[n] = c >>> 0;
      }
      return a;
    })());
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ t[(crc ^ bytes[i]) & 0xFF];
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  function u16(v) { return new Uint8Array([v & 0xFF, (v >>> 8) & 0xFF]); }
  function u32(v) { return new Uint8Array([v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF]); }
  function concat(arrs) {
    var len = 0, i;
    for (i = 0; i < arrs.length; i++) len += arrs[i].length;
    var out = new Uint8Array(len), off = 0;
    for (i = 0; i < arrs.length; i++) { out.set(arrs[i], off); off += arrs[i].length; }
    return out;
  }
  var ENC = (typeof TextEncoder !== 'undefined') ? new TextEncoder() : null;
  function strBytes(s) {
    if (ENC) return ENC.encode(s);
    var a = [], i;
    for (i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x80) a.push(c); else if (c < 0x800) { a.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F)); }
      else { a.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)); }
    }
    return new Uint8Array(a);
  }
  function zipBytes(files) {
    var UTF8 = 0x0800; // 通用位 bit11：文件名用 UTF-8
    var locals = [], centrals = [], offset = 0;
    for (var i = 0; i < files.length; i++) {
      var name = strBytes(files[i].name), data = files[i].data, crc = crc32(data);
      var lh = concat([
        u32(0x04034b50), u16(20), u16(UTF8), u16(0), u16(0x21), u16(0x40),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name, data
      ]);
      locals.push(lh);
      centrals.push(concat([
        u32(0x02014b50), u16(20), u16(20), u16(UTF8), u16(0), u16(0x21), u16(0x40),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name
      ]));
      offset += lh.length;
    }
    var cd = concat(centrals), eocd = concat([
      u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
      u32(cd.length), u32(offset), u16(0)
    ]);
    return concat(locals.concat([cd, eocd]));
  }
  window.wbBundleZip = zipBytes; // 供测试复用
  window.wbDownloadBundle = function (dir, zipname) {
    if (!dir) return;
    wbToast('正在打包 ' + (zipname || '资源') + '，请稍候…');
    var manifestUrl = dir.replace(/\/?$/, '/') + 'manifest.json';
    fetch(manifestUrl).then(function (r) {
      if (!r.ok) throw new Error('找不到清单 manifest.json');
      return r.json();
    }).then(function (list) {
      if (!list || !list.length) throw new Error('清单为空');
      var jobs = list.map(function (it) {
        var fn = (it.file || it.name);
        var base = dir.replace(/\/?$/, '/');
        var url = fn.indexOf(base) === 0 || fn.indexOf('resources/') === 0 ? fn : base + fn;
        return fetch(url).then(function (r) {
          if (!r.ok) throw new Error('读取失败：' + fn);
          return r.arrayBuffer();
        }).then(function (buf) {
          return { name: fn.split('/').pop(), data: new Uint8Array(buf) };
        });
      });
      return Promise.all(jobs);
    }).then(function (entries) {
      var zip = zipBytes(entries);
      var blob = new Blob([zip], { type: 'application/zip' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = zipname || 'bundle.zip';
      document.body.appendChild(a); a.click(); a.remove();
      wbToast('已下载『' + (zipname || 'bundle.zip') + '』（' + entries.length + ' 份）');
    }).catch(function (e) {
      wbToast('打包失败：' + (e && e.message ? e.message : e));
    });
  };
})();

/* 使用说明弹层：所有页面统一注入一个浮动「❓ 使用说明」按钮 + 弹窗。
   覆盖首页、16 个 HR 工具、效率工具页（含不走 wbShell 的页），
   讲清三步上手与「免手填」数据接口（自动留存 / 粘贴导入 / 导出）。 */
(function () {
  var CSS =
    '#wb-help-fab{position:fixed;right:18px;bottom:18px;z-index:9990;' +
    'display:inline-flex;align-items:center;gap:7px;background:#16A06A !important;color:#fff !important;' +
    'font:700 14px/1 "Microsoft YaHei","微软雅黑",sans-serif;padding:11px 16px;border-radius:24px;' +
    'cursor:pointer;border:none;box-shadow:0 6px 18px rgba(22,160,106,.35);transition:transform .15s,box-shadow .15s;}' +
    '#wb-help-fab:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(22,160,106,.45);}' +
    '#wb-help-fab span{white-space:nowrap;}' +
    /* 注意：弹窗内部元素用的是 class（不是 id），选择器必须用 .wb-help-xxx，
       否则整套样式不生效，弹窗会变成裸文字直接叠在页面上。 */
    '#wb-help-modal{position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;' +
    'display:flex !important;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;}' +
    '#wb-help-modal.wb-help-hide{display:none !important;}' +
    '#wb-help-modal *{box-sizing:border-box;}' +
    '#wb-help-modal .wb-help-mask{position:absolute;top:0;left:0;right:0;bottom:0;' +
    'background:rgba(4,7,10,.88) !important;}' +
    '#wb-help-modal .wb-help-box{position:relative;z-index:1;width:min(680px,94vw);max-height:86vh;overflow:hidden;' +
    'background:#12161B !important;color:#F3F5F7 !important;color-scheme:dark;' +
    'border:1px solid #2C3540;border-radius:18px;box-shadow:0 30px 90px rgba(0,0,0,.7);' +
    'display:flex;flex-direction:column;' +
    'font-family:"Microsoft YaHei","微软雅黑","PingFang SC",sans-serif;}' +
    '#wb-help-modal .wb-help-head{display:flex;align-items:center;justify-content:space-between;' +
    'padding:17px 22px;flex:0 0 auto;background:#0D1116 !important;' +
    'border-bottom:1px solid #2C3540;font-size:17px;font-weight:700;color:#FFFFFF !important;}' +
    '#wb-help-modal .wb-help-h{display:inline-flex;align-items:center;gap:9px;color:#FFFFFF !important;}' +
    '#wb-help-modal .wb-help-h::before{content:"";width:9px;height:9px;border-radius:50%;' +
    'background:#2FD98A;display:inline-block;flex:0 0 9px;}' +
    '#wb-help-modal .wb-help-x{border:none;background:none;font-size:22px;color:#9AA6B2 !important;' +
    'cursor:pointer;line-height:1;padding:2px 6px;}' +
    '#wb-help-modal .wb-help-x:hover{color:#FFFFFF !important;}' +
    '#wb-help-modal .wb-help-body{padding:20px 24px 22px;overflow-y:auto;flex:1 1 auto;' +
    'background:#12161B !important;color:#E4E8ED !important;font-size:15px;line-height:1.9;}' +
    '#wb-help-modal .wb-help-body h3{font-size:16.5px;color:#2FD98A !important;margin:20px 0 9px;font-weight:800;}' +
    '#wb-help-modal .wb-help-body h3:first-child{margin-top:0;}' +
    '#wb-help-modal .wb-help-body p{margin:0 0 8px;color:#E4E8ED !important;}' +
    '#wb-help-modal .wb-help-body ul{margin:6px 0 10px;padding-left:22px;}' +
    '#wb-help-modal .wb-help-body li{margin:6px 0;color:#E4E8ED !important;}' +
    '#wb-help-modal .wb-help-body b{color:#FFFFFF !important;font-weight:700;}' +
    '#wb-help-modal .wb-help-body .note{background:#1A2027 !important;border:1px solid #2C3540;border-radius:10px;' +
    'padding:11px 13px;color:#9AA6B2 !important;font-size:13px;margin-top:18px;text-align:center;}' +
    '#wb-help-modal .wb-help-actions{text-align:center;margin-top:16px;padding-top:16px;border-top:1px solid #2C3540;}' +
    '#wb-help-modal .wb-help-close{display:inline-flex;align-items:center;gap:7px;' +
    'background:#16A06A !important;color:#fff !important;border:none;border-radius:10px;padding:11px 24px;' +
    'font:700 15px/1 "Microsoft YaHei","微软雅黑",sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(22,160,106,.4);}' +
    '#wb-help-modal .wb-help-close:hover{background:#12B577 !important;}' +
    '#wb-help-modal .wb-help-close::after{content:"✕";font-size:15px;opacity:.9;}' +
    '#wb-sidebar.wb-help-under{visibility:hidden !important;}';

  function modalBody() {
    return '' +
      '<h3>HR 自动化工作台</h3>' +
      '<p>工作台包含 <b>16 个 HR 工具</b>、68 份人力资源模板、管理制度与配套表单，用于组织诊断、岗位与编制、招聘、薪酬绩效、人才发展、用工合规和人效分析。</p>' +
      '<p>工具按内置规则和你填入的数据生成测算结果，<b>未连接在线 AI 推理服务</b>。示例企业统一为「XXAI原生组织」；示例数据仅用于体验，请替换为企业实际数据。</p>' +
      '<h3>开始使用</h3>' +
      '<ul>' +
      '<li><b>选工具</b>：按当前 HR 工作进入对应页面，先查看示例，再填写或导入数据。</li>' +
      '<li><b>查看结果</b>：点击页面上的计算、分析或生成按钮。评分、测算和建议需要结合企业情况复核。</li>' +
      '<li><b>保存成果</b>：使用导出或打印功能留存结果；支持「存入方案」的页面可汇总关键参数，供企业制度生成器带入。</li>' +
      '</ul>' +
      '<h3>数据导入与保存</h3>' +
      '<p>带「数据接口」的页面支持本地字段留存或表格粘贴，具体以页面提供的操作为准。使用 Excel 数据时，可粘贴制表符分隔内容；上传时请遵循该工具提示的格式。</p>' +
      '<p>通用「导出 Excel」按钮实际生成 Excel 可打开的 CSV 文件；部分工具另有专用导出。制度生成器输出可编辑 Word 文件。</p>' +
      '<h3>存储与离线使用</h3>' +
      '<p>测算在当前浏览器内完成。启用保存的字段和方案写入本机 localStorage，不会自动同步到其他浏览器或设备。清除站点数据会删除这些记录，重要结果请及时导出。</p>' +
      '<p>完整本地副本可支持离线测算。网页资料下载、模板读取和整套打包仍需网络，或通过本地 HTTP 服务打开完整副本；直接双击 HTML 时，浏览器可能限制读取资料文件。</p>' +
      '<div class="note">HR 内容分享 · 模板和测算结果请结合企业实际复核后使用</div>' +
      '<div class="wb-help-actions"><button class="wb-help-close">关闭说明，返回工具</button></div>';
  }

  function ensureStyle() {
    if (document.getElementById('wb-help-style')) return;
    var s = document.createElement('style');
    s.id = 'wb-help-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function setSidebar(under) {
    var sb = document.getElementById('wb-sidebar');
    if (!sb) return;
    if (under) sb.classList.add('wb-help-under');
    else sb.classList.remove('wb-help-under');
  }
  function wbHelpOpen() {
    var m = document.getElementById('wb-help-modal');
    if (m) m.classList.remove('wb-help-hide');
    document.body.style.overflow = 'hidden';
    setSidebar(true);
  }
  function wbHelpClose() {
    var m = document.getElementById('wb-help-modal');
    if (m) m.classList.add('wb-help-hide');
    document.body.style.overflow = '';
    setSidebar(false);
  }
  window.wbHelp = wbHelpOpen;
  window.wbHelpClose = wbHelpClose;

  function inject() {
    ensureStyle();
    if (!document.getElementById('wb-help-fab')) {
      var fab = document.createElement('div');
      fab.id = 'wb-help-fab';
      fab.innerHTML = '❓<span>使用说明</span>';
      fab.addEventListener('click', wbHelpOpen);
      document.body.appendChild(fab);
    }
    if (!document.getElementById('wb-help-modal')) {
      var m = document.createElement('div');
      m.id = 'wb-help-modal';
      m.className = 'wb-help-hide';
      m.innerHTML =
        '<div class="wb-help-mask"></div>' +
        '<div class="wb-help-box">' +
        '<div class="wb-help-head"><span class="wb-help-h">使用说明 · HR 自动化工作台</span>' +
        '<button class="wb-help-x" aria-label="关闭">✕</button></div>' +
        '<div class="wb-help-body">' + modalBody() + '</div>' +
        '</div>';
      document.body.appendChild(m);
      m.querySelector('.wb-help-mask').addEventListener('click', wbHelpClose);
      m.querySelector('.wb-help-x').addEventListener('click', wbHelpClose);
      var closeBtn = m.querySelector('.wb-help-close');
      if (closeBtn) closeBtn.addEventListener('click', wbHelpClose);
    }
    if (!window.__wbHelpKey) {
      window.__wbHelpKey = true;
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.key === 'Esc') wbHelpClose();
      });
    }
  }

  if (document.body) inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();

