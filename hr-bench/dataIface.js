(function () {
  'use strict';
  const instances = new Map();
  const controls = 'input:not([type=file]):not([type=password]):not([type=hidden]):not([type=button]):not([type=submit]),textarea,select';
  const makers = { empRows: 'addEmp', jbRows: 'addJob', kpiBox: 'addKpi', positionList: 'addPositionRow' };
  const valueOf = el => ['checkbox', 'radio'].includes(el.type) ? el.checked : el.value;
  function setValue(el, value) {
    if (['checkbox', 'radio'].includes(el.type)) el.checked = value === true || value === 'true' || value === '1';
    else el.value = String(value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function parseRows(text) {
    const delimiter = text.split(/\r?\n/, 1)[0].includes('\t') ? '\t' : ',';
    const rows = []; let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
        else if (quoted || cell === '') quoted = !quoted;
        else cell += char;
      } else if (!quoted && (char === delimiter || char === '\n' || char === '\r')) {
        row.push(cell); cell = '';
        if (char !== delimiter) {
          if (char === '\r' && text[i + 1] === '\n') i++;
          if (row.some(value => value.trim())) rows.push(row);
          row = [];
        }
      } else cell += char;
    }
    if (quoted) throw new Error('引号未闭合，请检查粘贴内容。');
    row.push(cell); if (row.some(value => value.trim())) rows.push(row);
    return rows;
  }
  function download(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement('a'); link.href = url; link.download = name;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function setup(config) {
    if (!config || !config.pageKey) throw new Error('数据工具缺少页面标识。');
    if (instances.has(config.pageKey)) return instances.get(config.pageKey);
    const key = 'hr_bench_' + config.pageKey;
    const tables = (config.tables || []).filter(table => document.getElementById(table.id));
    const rowsOf = table => Array.from(document.getElementById(table.id).querySelectorAll(table.rowSel));
    const fields = () => Array.from(document.querySelectorAll(controls)).filter(el =>
      el.id && !el.closest('[data-hr-data-tools],#out,.wb-head,.wb-sidebar') &&
      !tables.some(table => document.getElementById(table.id).contains(el)));
    let restoring = false, timer;
    const box = document.createElement('details'); box.dataset.hrDataTools = ''; box.className = 'hr-data-tools';
    box.innerHTML = '<summary>本页数据 · 自动保存与备份</summary><div class="hr-data-body"><p>输入只保存在当前浏览器。换设备前，请下载 JSON 备份。</p><div class="hr-data-actions"></div><div class="hr-data-import"></div><p class="hr-data-status" role="status" aria-live="polite"></p></div>';
    const status = box.querySelector('.hr-data-status');
    const report = text => { status.textContent = text; };
    const snapshot = () => ({ version: 1, pageKey: config.pageKey,
      fields: Object.fromEntries(fields().map(el => [el.id, valueOf(el)])),
      tables: Object.fromEntries(tables.map(table => [table.id, rowsOf(table).map(row =>
        Array.from(row.querySelectorAll(table.cellSel)).map(valueOf))])) });
    function save(silent) {
      if (restoring) return;
      try { localStorage.setItem(key, JSON.stringify(snapshot())); if (!silent) report('已保存到当前浏览器。'); }
      catch (error) { report('浏览器未能保存，请下载 JSON 备份。'); }
    }
    function schedule() { if (!restoring) { clearTimeout(timer); timer = setTimeout(() => save(true), 300); } }
    function checkTable(table, data) {
      if (!Array.isArray(data) || data.length > 5000 || data.some(row => !Array.isArray(row) ||
        row.length !== table.cols.length || row.some(value => !['string', 'number', 'boolean'].includes(typeof value)))) {
        throw new Error('表格格式不匹配：' + table.label);
      }
      if (data.length > rowsOf(table).length && typeof window[makers[table.id]] !== 'function') {
        throw new Error('此表格无法新增行，请先在页面中添加足够的行。');
      }
    }
    function fillTable(table, data) {
      while (rowsOf(table).length < data.length) window[makers[table.id]]();
      const rows = rowsOf(table);
      rows.slice(data.length).forEach(row => row.remove());
      data.forEach((values, index) => Array.from(rows[index].querySelectorAll(table.cellSel))
        .forEach((el, column) => setValue(el, values[column])));
      if (table.id === 'positionList' && typeof window.updateAutoNote === 'function') window.updateAutoNote();
    }
    function restore(data) {
      if (!data || data.version !== 1 || data.pageKey !== config.pageKey || !data.fields ||
        typeof data.fields !== 'object' || Array.isArray(data.fields) || !data.tables ||
        typeof data.tables !== 'object' || Array.isArray(data.tables)) throw new Error('请选择本页导出的 JSON 备份。');
      const available = fields();
      if (Object.values(data.fields).some(value => !['string', 'boolean'].includes(typeof value))) throw new Error('备份中的字段格式有误。');
      tables.forEach(table => { if (Object.hasOwn(data.tables, table.id)) checkTable(table, data.tables[table.id]); });
      restoring = true;
      try {
        available.forEach(el => { if (Object.hasOwn(data.fields, el.id)) setValue(el, data.fields[el.id]); });
        tables.forEach(table => { if (Object.hasOwn(data.tables, table.id)) fillTable(table, data.tables[table.id]); });
        if (!config.noRecomputeOnLoad && typeof config.afterLoad === 'function') config.afterLoad();
      } finally { restoring = false; }
      save(); report(config.noRecomputeOnLoad ? '已恢复输入，请点击页面原有按钮重新生成结果。' : '已恢复本页输入。');
    }
    function button(label, handler, parent) {
      const el = document.createElement('button'); el.type = 'button'; el.className = 'wb-btn'; el.textContent = label;
      el.addEventListener('click', handler); (parent || box.querySelector('.hr-data-actions')).append(el); return el;
    }
    button('下载 JSON 备份', () => download(config.pageKey + '.json', JSON.stringify(snapshot(), null, 2), 'application/json;charset=utf-8'));
    const file = document.createElement('input'); file.type = 'file'; file.accept = '.json,application/json'; file.hidden = true;
    box.append(file); button('恢复 JSON 备份', () => file.click());
    file.addEventListener('change', async () => {
      if (!file.files.length) return;
      try {
        if (file.files[0].size > 5 * 1024 * 1024) throw new Error('备份文件超过 5 MB，请检查文件。');
        restore(JSON.parse(await file.files[0].text()));
      } catch (error) { report('未恢复：' + error.message); }
      file.value = '';
    });
    const selector = document.createElement('select'); selector.setAttribute('aria-label', '导入导出的数据表');
    if (tables.length) tables.forEach(table => selector.add(new Option(table.label, table.id)));
    else selector.add(new Option('本页表单（字段 ID / 值）', 'fields'));
    box.querySelector('.hr-data-actions').prepend(selector);
    const selected = () => tables.find(table => table.id === selector.value);
    button('导出 CSV', () => {
      const table = selected(), data = snapshot();
      const rows = table ? [table.cols, ...data.tables[table.id]] : [['字段', '值'], ...Object.entries(data.fields)];
      const csv = rows.map(row => row.map(value => {
        let text = String(value); if (/^[=+@]/.test(text)) text = "'" + text;
        return '"' + text.replace(/"/g, '""') + '"';
      }).join(',')).join('\r\n');
      download(config.pageKey + '-' + selector.value + '.csv', '\uFEFF' + csv, 'text/csv;charset=utf-8');
    });
    if (!config.noImportBox) {
      const area = document.createElement('textarea'); area.rows = 4; area.setAttribute('aria-label', '粘贴 CSV 或 Excel 表格');
      area.placeholder = tables.length ? '从 Excel 复制数据，或粘贴 CSV。列顺序按所选表格，可包含表头。' : '按“字段 ID、值”两列粘贴；先导出 CSV 可查看字段 ID。';
      const panel = box.querySelector('.hr-data-import'); panel.append(area);
      button('将粘贴内容替换到所选数据表', () => {
        try {
          const parsed = parseRows(area.value.replace(/^\uFEFF/, '')); if (!parsed.length) throw new Error('请先粘贴数据。');
          const table = selected(), data = snapshot();
          if (table) {
            if (table.cols.every((column, index) => parsed[0][index]?.trim() === column)) parsed.shift();
            if (!parsed.length) throw new Error('表头下面没有数据。');
            checkTable(table, parsed); data.tables[table.id] = parsed;
          } else {
            if (['字段', '字段 ID'].includes(parsed[0][0]?.trim())) parsed.shift();
            if (!parsed.length || parsed.some(row => row.length !== 2 || !Object.hasOwn(data.fields, row[0].trim()))) throw new Error('请使用导出 CSV 中的字段 ID，每行两列。');
            parsed.forEach(row => { data.fields[row[0].trim()] = typeof data.fields[row[0].trim()] === 'boolean' ? ['true', '1'].includes(row[1]) : row[1]; });
          }
          restore(data); report('已导入 ' + parsed.length + ' 行，并保存到当前浏览器。');
        } catch (error) { report('未导入：' + error.message); }
      }, panel);
    }
    if (!document.getElementById('hr-data-style')) {
      const style = document.createElement('style'); style.id = 'hr-data-style';
      style.textContent = '.hr-data-tools{margin:12px 0 18px;border:1px solid #dce8e1;border-radius:8px;background:#fff;font-size:13px;color:#374151}.hr-data-tools summary{padding:12px 16px;cursor:pointer;color:#147d55;font-weight:600}.hr-data-body{padding:0 16px 14px}.hr-data-body p{margin:8px 0}.hr-data-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.hr-data-tools select{max-width:100%;padding:8px;border:1px solid #dce8e1;border-radius:6px;background:#fff}.hr-data-import textarea{display:block;box-sizing:border-box;width:100%;margin:12px 0 8px;padding:10px;border:1px solid #dce8e1;border-radius:6px;resize:vertical;font:inherit}.hr-data-status{color:#147d55;font-size:12px}@media print{.hr-data-tools{display:none}}';
      document.head.append(style);
    }
    (document.querySelector('main') || document.body).prepend(box);
    try { const saved = localStorage.getItem(key); if (saved) restore(JSON.parse(saved)); else report('修改输入后会自动保存。'); }
    catch (error) { report('未恢复历史输入：' + error.message + ' 可继续编辑或导入备份。'); }
    document.addEventListener('input', event => { if (!box.contains(event.target)) schedule(); });
    document.addEventListener('change', event => { if (!box.contains(event.target)) schedule(); });
    document.addEventListener('click', event => { if (!box.contains(event.target)) schedule(); });
    tables.forEach(table => new MutationObserver(schedule).observe(document.getElementById(table.id), { childList: true, subtree: true }));
    window.addEventListener('pagehide', save);
    const api = { save, snapshot, restore }; instances.set(config.pageKey, api); return api;
  }
  window.wbDataIface = { setup };
})();
