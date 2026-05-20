/* Divi output modes: editable columns vs visual Code Module fidelity. */
(function () {
  function norm(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
  function esc(value) { return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function textEsc(value) { return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function classes(node) { return Array.from(node.classList || []); }
  function columnType(count) { return ({ 1: '4_4', 2: '1_2', 3: '1_3', 4: '1_4', 5: '1_5', 6: '1_6' })[count] || '4_4'; }
  function skip(node) { return !node.tagName || ['script', 'style', 'link', 'meta', 'title'].includes(node.tagName.toLowerCase()); }
  function buttonLike(node) {
    const tag = (node.tagName || '').toLowerCase();
    const cls = classes(node).join(' ').toLowerCase();
    const role = (node.getAttribute('role') || '').toLowerCase();
    return ['a', 'button'].includes(tag) && (role === 'button' || /btn|button|cta|primary|secondary|link-button/.test(cls));
  }
  function cardLike(node) {
    return /card|feature|service|item|box|tile|benefit|package|product|review|step|kpi/.test(classes(node).join(' ').toLowerCase());
  }
  function columnCandidate(node) {
    return /(^|\s)(col|column|card|feature|service|item|box|tile|benefit|package|product|review|step|kpi)|span|w-|basis/.test(classes(node).join(' ').toLowerCase());
  }
  function columnGroup(node) {
    return /grid|row|columns|cols|cards|features|services|items|list|wrapper/.test(classes(node).join(' ').toLowerCase());
  }
  function textModule(node) { return { type: 'text', html: (node.outerHTML || node.innerHTML || node.textContent || '').trim(), tag: (node.tagName || 'text').toLowerCase() }; }
  function buttonModule(node) { return { type: 'button', text: norm(node.textContent || 'Botón'), url: node.getAttribute('href') || '#', target: node.getAttribute('target') || '', classes: classes(node) }; }
  function imageModule(node) { return { type: 'image', src: node.getAttribute('src') || '', alt: node.getAttribute('alt') || '', title: node.getAttribute('title') || '', classes: classes(node) }; }
  function codeModule(nodeOrHtml) { return { type: 'code', html: (typeof nodeOrHtml === 'string' ? nodeOrHtml : nodeOrHtml.outerHTML || '').trim() }; }
  function blurbModule(node) {
    const heading = node.querySelector('h1,h2,h3,h4,h5,h6');
    const image = node.querySelector('img');
    const clone = node.cloneNode(true);
    const cloneHeading = clone.querySelector('h1,h2,h3,h4,h5,h6');
    const cloneImage = clone.querySelector('img');
    if (cloneHeading) cloneHeading.remove();
    if (cloneImage) cloneImage.remove();
    return { type: 'blurb', title: norm((heading && heading.textContent) || node.textContent || '').slice(0, 90), image: image ? image.getAttribute('src') || '' : '', body: (clone.innerHTML || '').trim(), classes: classes(node) };
  }
  function parseModules(container, mode) {
    const out = [];
    const children = Array.from(container.children || []).filter(function (node) { return !skip(node); });
    children.forEach(function (node) {
      const tag = (node.tagName || '').toLowerCase();
      if (buttonLike(node)) { out.push(buttonModule(node)); return; }
      if (tag === 'img') { out.push(imageModule(node)); return; }
      if (mode !== 'safe' && cardLike(node)) { out.push(blurbModule(node)); return; }
      if (['h1','h2','h3','h4','h5','h6','p','ul','ol','blockquote'].includes(tag)) { out.push(textModule(node)); return; }
      const directButtons = Array.from(node.children || []).filter(buttonLike);
      if (directButtons.length && norm(node.textContent || '').length < 260) {
        const clone = node.cloneNode(true);
        Array.from(clone.querySelectorAll('a,button')).forEach(function (item) { item.remove(); });
        const text = norm(clone.textContent || '');
        if (text) out.push({ type: 'text', html: '<p>' + textEsc(text) + '</p>', tag: 'p' });
        directButtons.forEach(function (button) { out.push(buttonModule(button)); });
        return;
      }
      const onlyImage = node.children.length === 1 && node.children[0].tagName && node.children[0].tagName.toLowerCase() === 'img';
      if (onlyImage) { out.push(imageModule(node.children[0])); return; }
      const simpleCount = node.querySelectorAll('h1,h2,h3,h4,h5,h6,p,ul,ol,a,button,img').length;
      if ((mode === 'editable' && simpleCount > 0 && simpleCount <= 14) || (simpleCount > 0 && simpleCount <= 8)) {
        const nested = parseModules(node, mode);
        if (nested.length) { out.push.apply(out, nested); return; }
      }
      out.push(codeModule(node));
    });
    return out;
  }
  function buildColumns(nodes, mode) {
    const type = columnType(nodes.length);
    return nodes.map(function (node, index) { return { type: type, classes: classes(node), modules: parseModules(node, mode).map(function (module) { return Object.assign({}, module, { column: index + 1 }); }) }; });
  }
  function detectColumns(section, mode) {
    const children = Array.from(section.children || []).filter(function (node) { return !skip(node); });
    const direct = children.filter(columnCandidate);
    if (direct.length >= 2 && direct.length <= 6) return buildColumns(direct, mode);
    const group = children.find(function (node) {
      const nested = Array.from(node.children || []).filter(function (child) { return !skip(child); });
      return columnGroup(node) && nested.length >= 2 && nested.length <= 6;
    });
    if (group) return buildColumns(Array.from(group.children || []).filter(function (node) { return !skip(node); }), mode);
    return [{ type: '4_4', classes: classes(section), modules: parseModules(section, mode).map(function (module) { return Object.assign({}, module, { column: 1 }); }) }];
  }
  function cssFrom(doc) {
    const inline = Array.from(doc.querySelectorAll('style')).map(function (node) { return node.textContent || ''; }).filter(Boolean);
    const external = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(function (node) { return '/* External CSS: ' + (node.getAttribute('href') || '') + ' */'; });
    return inline.concat(external).join('\n\n');
  }
  function sectionsFrom(doc) {
    const sections = Array.from(doc.querySelectorAll('body > section, main > section, section'));
    if (sections.length) return sections;
    const main = doc.querySelector('main');
    if (main) return [main];
    return doc.body ? [doc.body] : [];
  }
  function rowModules(row) {
    if (Array.isArray(row.columnsData) && row.columnsData.length) return row.columnsData.flatMap(function (column) { return column.modules || []; });
    return row.modules || [];
  }
  function editableLayout(doc, mode, title) {
    const sections = sectionsFrom(doc).map(function (section, index) {
      const columnsData = detectColumns(section, mode).filter(function (column) { return column.modules.length; });
      const modules = columnsData.flatMap(function (column) { return column.modules; });
      return { id: section.id || 'section-' + (index + 1), tag: (section.tagName || 'section').toLowerCase(), classes: classes(section), rows: [{ columns: columnsData.length || 1, columnsData: columnsData.length ? columnsData : [{ type: '4_4', classes: [], modules: modules }], modules: modules }] };
    }).filter(function (section) { return section.rows.some(function (row) { return rowModules(row).length; }); });
    return { version: '0.2.0-divi-columns', title: title, fileName: (typeof state !== 'undefined' && state.fileName) || '', mode: mode, generatedAt: new Date().toISOString(), sections: sections };
  }
  function visualLayout(doc, css, title, mode) {
    Array.from(doc.querySelectorAll('script,noscript,style,link[rel="stylesheet"]')).forEach(function (node) { node.remove(); });
    const modules = [];
    if (css) modules.push({ type: 'code', html: '<style id="divi-manager-inline-css">\n' + css + '\n</style>', column: 1 });
    Array.from((doc.body && doc.body.children) || []).filter(function (node) { return !skip(node); }).forEach(function (node) { modules.push(Object.assign({}, codeModule(node), { column: 1 })); });
    if (!modules.length) modules.push({ type: 'code', html: '<!-- Empty visual conversion -->', column: 1 });
    return { version: '0.2.0-visual-code', title: title, fileName: (typeof state !== 'undefined' && state.fileName) || '', mode: mode, generatedAt: new Date().toISOString(), sections: [{ id: 'visual-code-output', tag: 'body', classes: [], rows: [{ columns: 1, columnsData: [{ type: '4_4', classes: [], modules: modules }], modules: modules }] }] };
  }
  function attrs(values) {
    return Object.entries(values || {}).filter(function (entry) { return entry[1] !== undefined && entry[1] !== null && entry[1] !== ''; }).map(function (entry) { return entry[0] + '="' + esc(entry[1]) + '"'; }).join(' ');
  }
  function shortcode(tag, attributes, content) { const a = attrs(attributes); return '[' + tag + (a ? ' ' + a : '') + ']' + (content || '') + '[/' + tag + ']'; }
  function moduleShortcode(module) {
    if (module.type === 'text') return shortcode('et_pb_text', { _builder_version: '4.27.0', global_colors_info: '{}' }, module.html || '');
    if (module.type === 'button') return shortcode('et_pb_button', { button_url: module.url || '#', url_new_window: module.target === '_blank' ? 'on' : 'off', button_text: module.text || 'Botón', _builder_version: '4.27.0', global_colors_info: '{}' }, '');
    if (module.type === 'image') return shortcode('et_pb_image', { src: module.src || '', alt: module.alt || '', title_text: module.title || module.alt || '', _builder_version: '4.27.0', global_colors_info: '{}' }, '');
    if (module.type === 'blurb') return shortcode('et_pb_blurb', { title: module.title || '', image: module.image || '', _builder_version: '4.27.0', global_colors_info: '{}' }, module.body || '');
    return shortcode('et_pb_code', { _builder_version: '4.27.0', global_colors_info: '{}' }, module.html || '');
  }
  function rowColumns(row) {
    if (Array.isArray(row.columnsData) && row.columnsData.length) return row.columnsData;
    const count = Math.max(1, Math.min(Number(row.columns) || 1, 6));
    const type = columnType(count);
    return Array.from({ length: count }, function (_, index) { return { type: type, modules: (row.modules || []).filter(function (module) { return (module.column || 1) === index + 1; }) }; });
  }
  function shortcodes(layout) {
    return layout.sections.map(function (section) {
      const rows = section.rows.map(function (row) {
        const columns = rowColumns(row);
        const fallback = columnType(columns.length);
        const structure = columns.map(function (column) { return column.type || fallback; }).join(',');
        const renderedColumns = columns.map(function (column) { return shortcode('et_pb_column', { type: column.type || fallback, _builder_version: '4.27.0', custom_padding: '|||', global_colors_info: '{}' }, '\n' + (column.modules || []).map(moduleShortcode).join('\n') + '\n'); }).join('\n');
        return shortcode('et_pb_row', { column_structure: structure, _builder_version: '4.27.0', global_colors_info: '{}' }, '\n' + renderedColumns + '\n');
      }).join('\n');
      return shortcode('et_pb_section', { fb_built: '1', _builder_version: '4.27.0', global_colors_info: '{}' }, '\n' + rows + '\n');
    }).join('\n\n');
  }
  function previewModule(module) {
    if (module.type === 'text') return module.html || '';
    if (module.type === 'button') return '<p><a class="dm-button" href="' + esc(module.url || '#') + '">' + textEsc(module.text || 'Botón') + '</a></p>';
    if (module.type === 'image') return '<img src="' + esc(module.src || '') + '" alt="' + esc(module.alt || '') + '">';
    if (module.type === 'blurb') return '<article class="dm-blurb">' + (module.image ? '<img src="' + esc(module.image) + '" alt="">' : '') + '<h3>' + textEsc(module.title || '') + '</h3><div>' + (module.body || '') + '</div></article>';
    return module.html || '';
  }
  function preview(layout, css) {
    const body = layout.sections.map(function (section) {
      const rows = section.rows.map(function (row) {
        const columns = rowColumns(row);
        return '<div class="dm-row" data-columns="' + columns.length + '">' + columns.map(function (column) { return '<div class="dm-column dm-column-' + esc(column.type || '4_4') + '">' + (column.modules || []).map(previewModule).join('\n') + '</div>'; }).join('\n') + '</div>';
      }).join('\n');
      return '<section id="' + esc(section.id) + '" class="' + esc(['dm-section'].concat(section.classes || []).join(' ')) + '">' + rows + '</section>';
    }).join('\n');
    return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>' + (css || '') + '\n.dm-section{padding:48px 24px}.dm-row{max-width:1180px;margin:auto;display:grid;gap:24px}.dm-row[data-columns="1"]{grid-template-columns:1fr}.dm-row[data-columns="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}.dm-row[data-columns="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}.dm-row[data-columns="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}.dm-row[data-columns="5"]{grid-template-columns:repeat(5,minmax(0,1fr))}.dm-row[data-columns="6"]{grid-template-columns:repeat(6,minmax(0,1fr))}.dm-button{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:13px 18px;background:#ff5a1f;color:#fff;text-decoration:none;font-weight:900}.dm-blurb{border:1px solid #e9edf1;border-radius:22px;padding:20px;background:#fff;margin:12px 0}.dm-blurb img{max-width:100%;height:auto;display:block;margin-bottom:14px}@media(max-width:900px){.dm-row{grid-template-columns:1fr!important}}</style></head><body>' + body + '</body></html>';
  }
  function visualPreview(layout, css) {
    const modules = layout.sections.flatMap(function (section) { return section.rows.flatMap(rowModules); });
    const body = modules.filter(function (module) { return !(module.html || '').trim().startsWith('<style'); }).map(function (module) { return module.html || ''; }).join('\n');
    return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>' + (css || '') + '</style></head><body>' + body + '</body></html>';
  }
  function convertHtmlV2(html, mode) {
    const selectedMode = mode || 'balanced';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const css = cssFrom(doc);
    const title = norm((doc.querySelector('title') || {}).textContent || (typeof state !== 'undefined' && state.fileName) || 'Divi Layout');
    const layout = selectedMode === 'visual' ? visualLayout(doc, css, title, selectedMode) : editableLayout(doc, selectedMode, title);
    return { layout: layout, css: css, shortcodes: shortcodes(layout), previewHtml: selectedMode === 'visual' ? visualPreview(layout, css) : preview(layout, css) };
  }
  function renderPreviewsV2() {
    if (typeof state === 'undefined' || !state.result) return;
    const original = document.getElementById('original-preview');
    const created = document.getElementById('created-preview');
    const originalSize = document.getElementById('original-size');
    const createdStats = document.getElementById('created-stats');
    if (original) original.srcdoc = state.originalHtml;
    if (created) created.srcdoc = state.result.previewHtml;
    if (originalSize) originalSize.textContent = Math.round(state.originalHtml.length / 1024) + ' KB';
    if (createdStats) {
      const sections = state.result.layout.sections.length;
      const modules = state.result.layout.sections.reduce(function (sum, section) { return sum + section.rows.reduce(function (rowSum, row) { return rowSum + rowModules(row).length; }, 0); }, 0);
      createdStats.textContent = sections + ' secciones · ' + modules + ' módulos';
    }
  }
  window.DIVI_MANAGER_OUTPUT_MODES = { convertHtml: convertHtmlV2, renderShortcodes: shortcodes };
  try { convertHtml = convertHtmlV2; renderPreviews = renderPreviewsV2; } catch (error) { window.convertHtml = convertHtmlV2; window.renderPreviews = renderPreviewsV2; }
})();
