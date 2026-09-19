/* hrzip.js —— 纯前端零依赖「改写已有 docx」模块。
 * 作用：读取 store 模式（无压缩）docx，把全文「XXAI原生组织」替换为企业名称，
 *       并在文档开头插入企业信息说明块，重新打包成可编辑 docx（store）。
 * 依赖：docxgen.js 必须先行加载（提供 WBDocx._zipStore / crc32）。
 * 适用：resources/人力资源体系文件模板集/ 下的 store 版 docx。
 */
(function (root) {
  'use strict';
  var enc = new TextEncoder();
  var dec = new TextDecoder('utf-8');

  // 小端读取（兼容 ArrayBuffer / Uint8Array）
  function rdU16(b, o) { return (b[o] | (b[o + 1] << 8)) >>> 0; }
  function rdU32(b, o) { return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0; }

  // 读出 store 模式 zip 的所有条目（保持顺序）
  function readStoreZip(buf) {
    var bytes = (buf instanceof Uint8Array) ? buf : new Uint8Array(buf);
    var off = 0, n = bytes.length, entries = [];
    while (off + 4 <= n) {
      var sig = rdU32(bytes, off);
      if (sig !== 0x04034b50) break; // 不是 local file header 即停止（中央目录/EOCD）
      var method = rdU16(bytes, off + 8);
      if (method !== 0) throw new Error('模板压缩格式不受支持，请使用工作台提供的模板文件');
      var compSize = rdU32(bytes, off + 18);
      var nameLen = rdU16(bytes, off + 26);
      var extraLen = rdU16(bytes, off + 28);
      var name = dec.decode(bytes.subarray(off + 30, off + 30 + nameLen));
      var dataStart = off + 30 + nameLen + extraLen;
      if (dataStart + compSize > n) throw new Error('模板文件不完整');
      var data = bytes.subarray(dataStart, dataStart + compSize);
      entries.push({ name: name, method: method, data: data });
      off = dataStart + compSize;
    }
    if (!entries.some(function(e){return e.name === 'word/document.xml';})) throw new Error('不是有效的Word模板');
    return entries;
  }

  function escXml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // 文档开头插入的企业信息说明块（OOXML 段落）
  function infoBlock(company, industry, scale, date) {
    return '<w:p><w:pPr><w:spacing w:before="120" w:after="60"/><w:jc w:val="center"/></w:pPr>' +
      '<w:r><w:rPr><w:b/><w:color w:val="16A06A"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr>' +
      '<w:t xml:space="preserve">【' + escXml(company) + ' · 人力资源体系文件】</w:t></w:r></w:p>' +
      '<w:p><w:pPr><w:spacing w:before="40" w:after="80"/></w:pPr>' +
      '<w:r><w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/><w:color w:val="6B7280"/></w:rPr>' +
      '<w:t xml:space="preserve">使用HR自动化工作台的人力资源模板生成 · 行业：' + escXml(industry || '通用') +
      ' · 规模：约 ' + escXml(String(scale || '—')) + ' 人 · 生成日期：' + escXml(date || '') +
      '。请按本企业实际情况修订后使用。</w:t></w:r></w:p>' +
      '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="16A06A"/></w:pBdr>' +
      '<w:spacing w:after="120"/></w:pPr></w:p>';
  }

  // 改写一份 store docx：company 替换全文「XXAI原生组织」，开头插入说明块
  function replaceInDocx(buf, opts) {
    opts = opts || {};
    var company = opts.company || '【贵公司】';
    var entries = readStoreZip(buf);
    var out = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.name === 'word/document.xml') {
        var xml = dec.decode(e.data);
        // 1) 公司名替换
        xml = xml.split('XXAI原生组织').join(escXml(company));
        // 2) 在 <w:body> 后插入说明块（仅首处）
        var bi = xml.indexOf('<w:body>');
        if (bi >= 0) {
          xml = xml.slice(0, bi + '<w:body>'.length) +
            infoBlock(company, opts.industry, opts.scale, opts.date) +
            xml.slice(bi + '<w:body>'.length);
        }
        out.push({ name: e.name, data: enc.encode(xml) });
      } else if (e.name === 'docProps/core.xml' || e.name === 'docProps/app.xml') {
        var t = dec.decode(e.data).split('XXAI原生组织').join(escXml(company));
        out.push({ name: e.name, data: enc.encode(t) });
      } else {
        out.push({ name: e.name, data: e.data });
      }
    }
    return WBDocx._zipStore(out); // 返回 Uint8Array
  }

  var api = { readStoreZip: readStoreZip, replaceInDocx: replaceInDocx, infoBlock: infoBlock };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.WBHRZip = api;
})(typeof window !== 'undefined' ? window : null);
