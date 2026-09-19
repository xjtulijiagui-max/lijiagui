/* 纯前端「真·Word」生成器：零依赖、断网可用。
 * 用 OOXML(免压缩 store) + 自写 CRC32/zip 写出可编辑 .docx。
 * 浏览器：window.WBDocx.build(elements) -> Blob
 * Node 测试：module.exports.buildElements(...)
 */
(function (root) {
  'use strict';

  // ---------- CRC32 ----------
  var CRC_T = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ CRC_T[(crc ^ bytes[i]) & 0xFF];
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  // ---------- 字节工具 ----------
  function u16(v) { return new Uint8Array([v & 0xFF, (v >>> 8) & 0xFF]); }
  function u32(v) { return new Uint8Array([v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF]); }
  function concat(arrs) {
    var len = 0, i;
    for (i = 0; i < arrs.length; i++) len += arrs[i].length;
    var out = new Uint8Array(len), off = 0;
    for (i = 0; i < arrs.length; i++) { out.set(arrs[i], off); off += arrs[i].length; }
    return out;
  }
  function strBytes(s) { return new TextEncoder().encode(s); }

  // ---------- ZIP (store, 无压缩) ----------
  // 各头部严格按 PKZIP 规范字段数拼接，避免偏移错位。
  function zipStore(files) {
    var locals = [], centrals = [], offset = 0;
    for (var i = 0; i < files.length; i++) {
      var f = files[i], name = strBytes(f.name), data = f.data, crc = crc32(data);
      // Local file header (30 字节 + name + data)
      var lh = concat([
        u32(0x04034b50), // 签名
        u16(20),         // version needed
        u16(0),          // flag
        u16(0),          // method = store
        u16(0x21), u16(0x40), // modtime / moddate
        u32(crc), u32(data.length), u32(data.length), // crc / comp / uncomp
        u16(name.length), u16(0), // name len / extra len
        name, data
      ]);
      locals.push(lh);
      // Central directory header (46 字节 + name)
      centrals.push(concat([
        u32(0x02014b50),
        u16(20), u16(20), // version made by / needed
        u16(0), u16(0),   // flag / method
        u16(0x21), u16(0x40), // time / date
        u32(crc), u32(data.length), u32(data.length),
        u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), // name/extra/comment/disk/intAttr/extAttr
        u32(offset), name
      ]));
      offset += lh.length;
    }
    var cd = concat(centrals), cdSize = cd.length, cdOff = offset;
    var eocd = concat([
      u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
      u32(cdSize), u32(cdOff), u16(0)
    ]);
    return concat(locals.concat([cd, eocd]));
  }

  // ---------- XML ----------
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var FONT = '微软雅黑';
  function run(text, opts) {
    opts = opts || {};
    var rpr = '';
    if (opts.bold) rpr += '<w:b/>';
    if (opts.size) rpr += '<w:sz w:val="' + opts.size + '"/><w:szCs w:val="' + opts.size + '"/>';
    if (opts.color) rpr += '<w:color w:val="' + opts.color + '"/>';
    rpr = '<w:rFonts w:ascii="' + FONT + '" w:hAnsi="' + FONT + '" w:eastAsia="' + FONT + '"/>' + rpr;
    var runs = String(text).split('\n').map(function (line, idx, arr) {
      var t = '<w:t xml:space="preserve">' + esc(line) + '</w:t>';
      if (idx < arr.length - 1) return '<w:r>' + rpr + t + '</w:r><w:r><w:br/></w:r>';
      return '<w:r>' + rpr + t + '</w:r>';
    }).join('');
    return runs;
  }

  function para(text, opts) {
    opts = opts || {};
    var ppr = '';
    if (opts.align) ppr += '<w:jc w:val="' + opts.align + '"/>';
    if (opts.spacingBefore) ppr += '<w:spacing w:before="' + opts.spacingBefore + '" w:after="' + opts.spacingAfter + '"/>';
    if (opts.shd) ppr += '<w:shd w:val="clear" w:color="auto" w:fill="' + opts.shd + '"/>';
    if (ppr) ppr = '<w:pPr>' + ppr + '</w:pPr>';
    return '<w:p>' + ppr + run(text, opts) + '</w:p>';
  }

  function heading(text, size) {
    return '<w:p><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/></w:pPr>' +
      run(text, { bold: true, size: size || 30, color: '1F2328' }) + '</w:p>';
  }

  function tableBlock(rows, header) {
    var grid = rows[0].map(function () { return '<w:gridCol w:w="2400"/>'; }).join('');
    var body = rows.map(function (r, ri) {
      var isH = header && ri === 0;
      var cells = r.map(function (c) {
        var shd = isH ? '<w:shd w:val="clear" w:color="auto" w:fill="EAF7F1"/>' : '';
        return '<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/>' + shd +
          '<w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr>' +
          run(c, { bold: isH, size: 21 }) + '</w:p></w:tc>';
      }).join('');
      return '<w:tr>' + cells + '</w:tr>';
    }).join('');
    return '<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/>' +
      '<w:tblBorders>' +
      '<w:top w:val="single" w:sz="4" w:space="0" w:color="C7DCD3"/>' +
      '<w:left w:val="single" w:sz="4" w:space="0" w:color="C7DCD3"/>' +
      '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="C7DCD3"/>' +
      '<w:right w:val="single" w:sz="4" w:space="0" w:color="C7DCD3"/>' +
      '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="C7DCD3"/>' +
      '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="C7DCD3"/>' +
      '</w:tblBorders><w:tblGrid>' + grid + '</w:tblGrid></w:tblPr>' + body + '</w:tbl>';
  }

  function buildDocumentXml(doc) {
    var parts = [];
    // 封面
    parts.push('<w:p><w:pPr><w:spacing w:before="1200" w:after="200"/></w:pPr>' +
      run(doc.company || '【贵公司】', { bold: true, size: 44, color: '16A06A', align: 'center' }) + '</w:p>');
    if (doc.coverTag) parts.push(para(doc.coverTag, { align: 'center', color: '6B7280', size: 22 }));
    parts.push('<w:p><w:pPr><w:spacing w:before="400" w:after="600"/></w:pPr>' +
      run(doc.title || '', { bold: true, size: 40, align: 'center' }) + '</w:p>');
    // 封面信息表
    if (doc.meta && doc.meta.length) {
      var mrows = doc.meta.map(function (m) { return [m.k, m.v]; });
      parts.push(tableBlock([['项目', '内容']].concat(mrows), true));
    }
    parts.push('<w:p><w:pPr><w:spacing w:before="600" w:after="200"/></w:pPr>' +
      run(doc.note || '本制度为HR管理参考模板，请结合企业实际修订、审核后使用。', { color: '9AA0A6', size: 20, align: 'center' }) + '</w:p>');
    parts.push('<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="16A06A"/></w:pBdr><w:spacing w:after="200"/></w:pPr></w:p>');

    // 正文 blocks
    (doc.blocks || []).forEach(function (b) {
      if (b.t === 'h') parts.push(heading(b.text));
      else if (b.t === 'table') parts.push(tableBlock(b.rows, true));
      else if (b.t === 'note') {
        parts.push(heading('【' + b.title + '】', 26));
        (b.items || []).forEach(function (it) {
          parts.push(para('· ' + it, { size: 22, color: '118A5A' }));
        });
      } else parts.push(para(b.text, { size: 22 }));
    });

    // 页脚公司名
    if (doc.company) {
      parts.push('<w:p><w:pPr><w:spacing w:before="400"/></w:pPr>' +
        run('—— 本文档由 ' + doc.company + ' 使用HR自动化工作台生成', { size: 18, color: 'B4B2A9', align: 'center' }) + '</w:p>');
    }

    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:body>' + parts.join('') +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>' +
      '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>' +
      '</w:body></w:document>';
  }

  var CONTENT_TYPES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '</Types>';
  var RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>';

  function build(doc) {
    var docXml = strBytes(buildDocumentXml(doc));
    var files = [
      { name: '[Content_Types].xml', data: strBytes(CONTENT_TYPES) },
      { name: '_rels/.rels', data: strBytes(RELS) },
      { name: 'word/document.xml', data: docXml }
    ];
    var zip = zipStore(files);
    if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
      return new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    }
    return zip; // Node 测试返回 Uint8Array
  }

  var api = { build: build, crc32: crc32, _zipStore: zipStore };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.WBDocx = api;
})(typeof window !== 'undefined' ? window : null);
