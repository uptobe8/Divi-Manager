const config = window.DIVI_MANAGER_CONFIG || {};

const state = {
  fileName: '',
  originalHtml: '',
  result: null,
  activeTab: 'shortcodes'
};

const DIVI_VERSION = '4.27.0';
const IMPORT_ID = '100001';

const el = (id) => document.getElementById(id);

const accessScreen = el('access-screen');
const appScreen = el('app-screen');
const accessForm = el('access-form');
const accessKey = el('access-key');
const accessError = el('access-error');
const fileInput = el('file-input');
const dropzone = el('dropzone');
const fileMeta = el('file-meta');
const controlsPanel = el('controls-panel');
const resultPanel = el('result-panel');
const convertBtn = el('convert-btn');
const resetBtn = el('reset-btn');
const outputName = el('output-name');
const conversionMode = el('conversion-mode');
const originalPreview = el('original-preview');
const createdPreview = el('created-preview');
const originalSize = el('original-size');
const createdStats = el('created-stats');
const outputCode = el('output-code');

function normalizeText(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function escapeAttr(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sha256(value) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function unlockApp() {
  accessScreen.hidden = true;
  appScreen.hidden = false;
  sessionStorage.setItem('divi-manager-unlocked', '1');
}

async function handleAccess(event) {
  event.preventDefault();

  if (!config.accessGateEnabled) {
    unlockApp();
    return;
  }

  const typedKey = accessKey.value || '';
  const hash = await sha256(typedKey);
  const validByHash = hash === config.accessKeyHash;
  const validByPlainKey = typedKey === config.accessKey;

  if (validByHash || validByPlainKey) {
    unlockApp();
  } else {
    accessError.hidden = false;
  }
}

function getClasses(node) {
  return Array.from(node && node.classList ? node.classList : []);
}

function tagName(node) {
  return node && node.tagName ? node.tagName.toLowerCase() : '';
}

function shouldSkipNode(node) {
  const tag = tagName(node);
  return !tag || ['script', 'style', 'link', 'meta', 'title', 'noscript'].includes(tag);
}

function classText(node) {
  return getClasses(node).join(' ').toLowerCase();
}

function isButtonLike(node) {
  const tag = tagName(node);
  const role = (node.getAttribute('role') || '').toLowerCase();
  const cls = classText(node);
  return ['a', 'button'].includes(tag) && (
    role === 'button' || /btn|button|cta|primary|secondary|ghost|soft|whatsapp|call|link-button/.test(cls)
  );
}

function isCardLike(node) {
  return /card|feature|service|item|box|tile|benefit|package|product|review|step|kpi|option|metric|buybox|notice|testimonial|post/.test(classText(node));
}

function isLayoutGroup(node) {
  return /container|grid|row|columns|cols|cards|features|services|items|list|wrapper|split|hero-grid|footer-grid|kpi-strip|trust-row|steps/.test(classText(node));
}

function isColumnCandidate(node) {
  return /(^|\s)(col|column|card|feature|service|item|box|tile|benefit|package|product|review|step|kpi)|span|w-|basis/.test(classText(node));
}

function children(node) {
  return Array.from(node && node.children ? node.children : []).filter((child) => !shouldSkipNode(child));
}

function cleanHtml(value = '') {
  return String(value || '').trim();
}

function createTextModule(node, html) {
  return {
    type: 'text',
    html: cleanHtml(html || node.outerHTML || node.innerHTML || node.textContent || ''),
    label: normalizeText(node.textContent || '').slice(0, 90) || 'Texto'
  };
}

function createButtonModule(node) {
  return {
    type: 'button',
    text: normalizeText(node.textContent || 'Botón'),
    url: node.getAttribute('href') || '#',
    target: node.getAttribute('target') || '',
    classes: getClasses(node),
    label: normalizeText(node.textContent || 'Botón')
  };
}

function createImageModule(node) {
  return {
    type: 'image',
    src: node.getAttribute('src') || '',
    alt: node.getAttribute('alt') || '',
    title: node.getAttribute('title') || node.getAttribute('alt') || '',
    classes: getClasses(node),
    label: node.getAttribute('alt') || 'Imagen'
  };
}

function createBlurbModule(node) {
  const heading = node.querySelector('h1,h2,h3,h4,h5,h6,strong');
  const image = node.querySelector('img');
  const clone = node.cloneNode(true);
  const cloneHeading = clone.querySelector('h1,h2,h3,h4,h5,h6,strong');
  const cloneImage = clone.querySelector('img');
  if (cloneHeading) cloneHeading.remove();
  if (cloneImage) cloneImage.remove();
  const title = normalizeText((heading && heading.textContent) || node.textContent || '').slice(0, 90) || 'Blurb';

  return {
    type: 'blurb',
    title,
    image: image ? image.getAttribute('src') || '' : '',
    body: cleanHtml(clone.innerHTML || ''),
    classes: getClasses(node),
    label: title
  };
}

function createToggleModule(node) {
  const heading = node.querySelector('summary,h3,h4,h5,strong');
  const clone = node.cloneNode(true);
  const cloneHeading = clone.querySelector('summary,h3,h4,h5,strong');
  if (cloneHeading) cloneHeading.remove();
  const title = normalizeText((heading && heading.textContent) || 'Pregunta');

  return {
    type: 'toggle',
    title,
    body: cleanHtml(clone.innerHTML || '<p></p>'),
    label: title
  };
}

function createDividerModule() {
  return { type: 'divider', label: 'Separador' };
}

function createCodeModule(nodeOrHtml) {
  return {
    type: 'code',
    html: cleanHtml(typeof nodeOrHtml === 'string' ? nodeOrHtml : nodeOrHtml.outerHTML || ''),
    label: 'Code Module'
  };
}

function createContactFormModule(node) {
  const detectedFields = Array.from(node.querySelectorAll('input,textarea,select'))
    .filter((field) => !['submit', 'button', 'hidden'].includes((field.getAttribute('type') || '').toLowerCase()))
    .map((field, index) => ({
      id: (field.getAttribute('name') || field.getAttribute('id') || `field_${index + 1}`).replace(/[^a-z0-9_]/gi, '_'),
      title: field.getAttribute('placeholder') || field.getAttribute('name') || field.getAttribute('id') || `Campo ${index + 1}`,
      type: tagName(field) === 'textarea' ? 'text' : 'input'
    }));

  return {
    type: 'contact_form',
    title: 'Formulario',
    fields: detectedFields.length ? detectedFields : [
      { id: 'name', title: 'Nombre', type: 'input' },
      { id: 'phone', title: 'Teléfono', type: 'input' }
    ],
    label: 'Formulario'
  };
}

function parseModules(container, mode = 'balanced', depth = 0) {
  if (mode === 'visual') {
    return [createCodeModule(container)];
  }

  const modules = [];

  for (const node of children(container)) {
    const tag = tagName(node);

    if (tag === 'hr') {
      modules.push(createDividerModule());
      continue;
    }

    if (tag === 'details') {
      modules.push(createToggleModule(node));
      continue;
    }

    if (tag === 'form') {
      modules.push(createContactFormModule(node));
      continue;
    }

    if (isButtonLike(node)) {
      modules.push(createButtonModule(node));
      continue;
    }

    if (tag === 'img') {
      modules.push(createImageModule(node));
      continue;
    }

    if (['h1','h2','h3','h4','h5','h6','p','ul','ol','blockquote'].includes(tag)) {
      modules.push(createTextModule(node));
      continue;
    }

    const nodeChildren = children(node);

    if (nodeChildren.length === 1 && tagName(nodeChildren[0]) === 'img') {
      modules.push(createImageModule(nodeChildren[0]));
      continue;
    }

    const directButtons = nodeChildren.filter(isButtonLike);
    if (directButtons.length && normalizeText(node.textContent || '').length < 320) {
      const textClone = node.cloneNode(true);
      Array.from(textClone.querySelectorAll('a,button')).forEach((item) => item.remove());
      const text = normalizeText(textClone.textContent || '');
      if (text) modules.push({ type: 'text', html: `<p>${escapeHtml(text)}</p>`, label: text.slice(0, 90) });
      directButtons.forEach((button) => modules.push(createButtonModule(button)));
      continue;
    }

    if (isCardLike(node) && mode !== 'editable') {
      modules.push(createBlurbModule(node));
      continue;
    }

    const nestedCount = node.querySelectorAll('h1,h2,h3,h4,h5,h6,p,ul,ol,a,button,img,details,form,hr').length;
    const shouldDecompose = (
      (mode === 'editable' && nestedCount > 0 && depth < 14) ||
      (mode === 'balanced' && nestedCount > 0 && nestedCount <= 12 && depth < 10)
    );

    if (shouldDecompose || isLayoutGroup(node)) {
      const nested = parseModules(node, mode, depth + 1);
      if (nested.length) {
        modules.push(...nested);
        continue;
      }
    }

    if (mode === 'safe') {
      modules.push(createCodeModule(node));
      continue;
    }

    modules.push(createCodeModule(node));
  }

  return modules.length ? modules : [createCodeModule(container)];
}

function extractCss(doc) {
  const inlineCss = Array.from(doc.querySelectorAll('style')).map((node) => node.textContent || '').filter(Boolean);
  const external = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map((node) => `/* External CSS: ${node.getAttribute('href') || ''} */`);
  return [...external, ...inlineCss].join('\n\n');
}

function detectSections(doc) {
  const bodyChildren = Array.from(doc.body ? doc.body.children : []).filter((node) => !shouldSkipNode(node));
  const semanticSections = bodyChildren.filter((node) => ['section', 'main', 'header', 'footer'].includes(tagName(node)));
  if (semanticSections.length) return semanticSections;
  const sections = Array.from(doc.querySelectorAll('body > section, main > section, section'));
  if (sections.length) return sections;
  const main = doc.querySelector('main');
  if (main) return [main];
  return doc.body ? [doc.body] : [];
}

function getColumnType(count) {
  return ({ 1: '4_4', 2: '1_2', 3: '1_3', 4: '1_4', 5: '1_5', 6: '1_6' })[count] || '4_4';
}

function makeColumn(nodes, count, index, mode) {
  const modules = nodes.flatMap((node) => parseModules(node, mode, 0)).map((module) => ({ ...module, column: index + 1 }));
  return {
    type: getColumnType(count),
    modules
  };
}

function detectColumnsForRow(container, mode) {
  const direct = children(container);

  if (mode === 'visual') {
    return [{ type: '4_4', modules: parseModules(container, mode).map((module) => ({ ...module, column: 1 })) }];
  }

  const nestedGroup = direct.find((node) => isLayoutGroup(node) && children(node).length >= 2 && children(node).length <= 6);
  if (nestedGroup) {
    const groupChildren = children(nestedGroup);
    const count = Math.min(groupChildren.length, 6);
    return groupChildren.map((node, index) => makeColumn([node], count, index, mode)).filter((column) => column.modules.length);
  }

  const directColumns = direct.filter(isColumnCandidate);
  if (directColumns.length >= 2 && directColumns.length <= 6) {
    const count = directColumns.length;
    return directColumns.map((node, index) => makeColumn([node], count, index, mode)).filter((column) => column.modules.length);
  }

  return [{ type: '4_4', modules: parseModules(container, mode).map((module) => ({ ...module, column: 1 })) }];
}

function createRows(section, mode) {
  const sectionChildren = children(section);
  const explicitRows = sectionChildren.filter((node) => isLayoutGroup(node) && children(node).length >= 2);

  if (mode !== 'visual' && explicitRows.length >= 1) {
    return explicitRows.map((rowNode) => {
      const columnsData = detectColumnsForRow(rowNode, mode);
      return {
        columns: columnsData.length,
        columnsData,
        modules: columnsData.flatMap((column) => column.modules)
      };
    }).filter((row) => row.modules.length);
  }

  const columnsData = detectColumnsForRow(section, mode);
  return [{
    columns: columnsData.length,
    columnsData,
    modules: columnsData.flatMap((column) => column.modules)
  }].filter((row) => row.modules.length);
}

function convertHtml(html, mode = 'balanced') {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const css = extractCss(doc);
  const title = normalizeText(doc.querySelector('title')?.textContent || state.fileName || 'Divi Layout');
  const sections = detectSections(doc).map((section, index) => ({
    id: section.id || `section-${index + 1}`,
    tag: tagName(section) || 'section',
    classes: getClasses(section),
    rows: createRows(section, mode)
  })).filter((section) => section.rows.some((row) => row.modules.length));

  const layout = {
    version: '1.0.0-stable-divi-import',
    title,
    fileName: state.fileName,
    mode,
    generatedAt: new Date().toISOString(),
    sections
  };

  const shortcodes = renderShortcodes(layout, css);
  const diviJson = createDiviImportJson(shortcodes);
  const validation = validateDiviOutput(shortcodes, diviJson);

  return {
    layout,
    css,
    shortcodes,
    diviJson,
    validation,
    previewHtml: renderPreview(layout, css),
    original: {
      html,
      css,
      text: normalizeText(doc.body?.innerText || ''),
      previewHtml: html
    }
  };
}

function attrs(values = {}) {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}="${escapeAttr(value)}"`).join(' ');
}

function shortcode(tag, attributes, content = '') {
  const attrText = attrs(attributes);
  return `[${tag}${attrText ? ` ${attrText}` : ''}]${content}[/${tag}]`;
}

function renderModuleShortcode(module) {
  if (module.type === 'text') {
    return shortcode('et_pb_text', { _builder_version: DIVI_VERSION, global_colors_info: '{}' }, module.html || '');
  }

  if (module.type === 'button') {
    return shortcode('et_pb_button', {
      button_url: module.url || '#',
      url_new_window: module.target === '_blank' ? 'on' : 'off',
      button_text: module.text || 'Botón',
      _builder_version: DIVI_VERSION,
      global_colors_info: '{}'
    }, '');
  }

  if (module.type === 'image') {
    return shortcode('et_pb_image', {
      src: module.src || '',
      alt: module.alt || '',
      title_text: module.title || module.alt || '',
      _builder_version: DIVI_VERSION,
      global_colors_info: '{}'
    }, '');
  }

  if (module.type === 'blurb') {
    return shortcode('et_pb_blurb', {
      title: module.title || '',
      image: module.image || '',
      _builder_version: DIVI_VERSION,
      global_colors_info: '{}'
    }, module.body || '');
  }

  if (module.type === 'toggle') {
    return shortcode('et_pb_toggle', {
      title: module.title || '',
      open: 'off',
      _builder_version: DIVI_VERSION,
      global_colors_info: '{}'
    }, module.body || '');
  }

  if (module.type === 'divider') {
    return shortcode('et_pb_divider', { _builder_version: DIVI_VERSION, global_colors_info: '{}' }, '');
  }

  if (module.type === 'contact_form') {
    const fields = (module.fields || []).map((field) => shortcode('et_pb_contact_field', {
      field_id: field.id,
      field_title: field.title,
      field_type: field.type,
      required_mark: 'on',
      _builder_version: DIVI_VERSION,
      global_colors_info: '{}'
    }, '')).join('\n');

    return shortcode('et_pb_contact_form', {
      title: module.title || '',
      submit_button_text: 'Enviar',
      _builder_version: DIVI_VERSION,
      global_colors_info: '{}'
    }, `\n${fields}\n`);
  }

  return shortcode('et_pb_code', { _builder_version: DIVI_VERSION, global_colors_info: '{}' }, module.html || '');
}

function renderCssSection(css) {
  if (!css) return '';
  const cssModule = shortcode('et_pb_code', { _builder_version: DIVI_VERSION, global_colors_info: '{}' }, `<style id="divi-manager-inline-css">\n${css}\n</style>`);
  const column = shortcode('et_pb_column', { type: '4_4', _builder_version: DIVI_VERSION, global_colors_info: '{}' }, `\n${cssModule}\n`);
  const row = shortcode('et_pb_row', { column_structure: '4_4', _builder_version: DIVI_VERSION, global_colors_info: '{}' }, `\n${column}\n`);
  return shortcode('et_pb_section', { fb_built: '1', _builder_version: DIVI_VERSION, global_colors_info: '{}' }, `\n${row}\n`);
}

function renderShortcodes(layout, css = '') {
  const sections = layout.sections.map((section) => {
    const rows = section.rows.map((row) => {
      const columns = row.columnsData && row.columnsData.length ? row.columnsData : [{ type: '4_4', modules: row.modules || [] }];
      const structure = columns.map((column) => column.type || getColumnType(columns.length)).join(',');
      const renderedColumns = columns.map((column) => {
        const modules = (column.modules || []).map(renderModuleShortcode).join('\n');
        return shortcode('et_pb_column', {
          type: column.type || getColumnType(columns.length),
          _builder_version: DIVI_VERSION,
          global_colors_info: '{}'
        }, `\n${modules}\n`);
      }).join('\n');

      return shortcode('et_pb_row', {
        column_structure: structure,
        _builder_version: DIVI_VERSION,
        global_colors_info: '{}'
      }, `\n${renderedColumns}\n`);
    }).join('\n');

    return shortcode('et_pb_section', {
      fb_built: '1',
      _builder_version: DIVI_VERSION,
      global_colors_info: '{}'
    }, `\n${rows}\n`);
  });

  return [renderCssSection(css), ...sections].filter(Boolean).join('\n\n');
}

function createDiviImportJson(shortcodes) {
  return {
    context: 'et_builder',
    data: {
      [IMPORT_ID]: shortcodes
    },
    presets: {},
    images: {}
  };
}

function countMatches(value, regex) {
  return (String(value || '').match(regex) || []).length;
}

function validateDiviOutput(shortcodes, diviJson) {
  const checks = {
    jsonParseable: true,
    contextEtBuilder: diviJson.context === 'et_builder',
    hasData: !!(diviJson.data && Object.keys(diviJson.data).length),
    hasSection: shortcodes.includes('[et_pb_section'),
    hasRow: shortcodes.includes('[et_pb_row'),
    hasColumn: shortcodes.includes('[et_pb_column'),
    hasModule: /\[et_pb_(text|button|image|blurb|code|toggle|divider|contact_form)/.test(shortcodes),
    balancedSections: countMatches(shortcodes, /\[et_pb_section\b/g) === countMatches(shortcodes, /\[\/et_pb_section\]/g),
    balancedRows: countMatches(shortcodes, /\[et_pb_row\b/g) === countMatches(shortcodes, /\[\/et_pb_row\]/g),
    balancedColumns: countMatches(shortcodes, /\[et_pb_column\b/g) === countMatches(shortcodes, /\[\/et_pb_column\]/g)
  };

  return {
    ok: Object.values(checks).every(Boolean),
    checks
  };
}

function renderPreviewModule(module) {
  if (module.type === 'text') return module.html || '';
  if (module.type === 'button') return `<p><a class="dm-button" href="${escapeAttr(module.url || '#')}">${escapeHtml(module.text || 'Botón')}</a></p>`;
  if (module.type === 'image') return `<img src="${escapeAttr(module.src || '')}" alt="${escapeAttr(module.alt || '')}">`;
  if (module.type === 'blurb') {
    return `<article class="dm-blurb">${module.image ? `<img src="${escapeAttr(module.image)}" alt="">` : ''}<h3>${escapeHtml(module.title || '')}</h3><div>${module.body || ''}</div></article>`;
  }
  if (module.type === 'toggle') return `<details><summary>${escapeHtml(module.title || '')}</summary>${module.body || ''}</details>`;
  if (module.type === 'divider') return '<hr>';
  if (module.type === 'contact_form') {
    return `<form class="dm-form">${(module.fields || []).map((field) => `<input placeholder="${escapeAttr(field.title)}">`).join('')}<button type="button">Enviar</button></form>`;
  }
  return module.html || '';
}

function renderPreview(layout, css) {
  const body = layout.sections.map((section) => {
    const rows = section.rows.map((row) => {
      const columns = row.columnsData && row.columnsData.length ? row.columnsData : [{ type: '4_4', modules: row.modules || [] }];
      return `<div class="dm-row" data-columns="${columns.length}">${columns.map((column) => `<div class="dm-preview-col dm-preview-col-${escapeAttr(column.type || '4_4')}">${(column.modules || []).map(renderPreviewModule).join('\n')}</div>`).join('\n')}</div>`;
    }).join('\n');
    const className = ['dm-section', ...(section.classes || [])].join(' ');
    return `<section id="${escapeAttr(section.id)}" class="${escapeAttr(className)}">${rows}</section>`;
  }).join('\n');

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css || ''}\n.dm-section{padding:48px 24px}.dm-row{max-width:1180px;margin:auto;display:grid;gap:24px}.dm-row[data-columns="1"]{grid-template-columns:1fr}.dm-row[data-columns="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}.dm-row[data-columns="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}.dm-row[data-columns="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}.dm-row[data-columns="5"]{grid-template-columns:repeat(5,minmax(0,1fr))}.dm-row[data-columns="6"]{grid-template-columns:repeat(6,minmax(0,1fr))}.dm-button{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:13px 18px;background:#ff5a1f;color:#fff;text-decoration:none;font-weight:900}.dm-blurb{border:1px solid #e9edf1;border-radius:22px;padding:20px;background:#fff;margin:12px 0}.dm-blurb img{max-width:100%;height:auto;display:block;margin-bottom:14px}.dm-form{display:grid;gap:12px}.dm-form input{padding:12px;border:1px solid #d8dee8;border-radius:10px}@media(max-width:900px){.dm-row{grid-template-columns:1fr!important}}</style></head><body>${body}</body></html>`;
}

function renderPreviews() {
  originalPreview.srcdoc = state.originalHtml;
  createdPreview.srcdoc = state.result.previewHtml;
  originalSize.textContent = `${Math.round(state.originalHtml.length / 1024)} KB`;
  const sections = state.result.layout.sections.length;
  const modules = state.result.layout.sections.reduce((sum, section) => sum + section.rows.reduce((rowSum, row) => rowSum + row.modules.length, 0), 0);
  createdStats.textContent = `${sections} secciones · ${modules} módulos · ${state.result.validation.ok ? 'JSON Divi OK' : 'revisar JSON'}`;
}

function setOutputTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab').forEach((item) => item.classList.toggle('active', item.dataset.tab === tab));
  if (!state.result) return;
  if (tab === 'shortcodes') outputCode.value = state.result.shortcodes;
  if (tab === 'json') outputCode.value = JSON.stringify(state.result.diviJson, null, 2);
  if (tab === 'css') outputCode.value = state.result.css || '/* No se ha detectado CSS */';
}

function downloadText(name, content, type = 'text/plain') {
  const blob = new Blob([content || ''], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function baseName() {
  return (outputName.value || config.defaultOutputPrefix || 'divi-layout').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'divi-layout';
}

function crc32(bytes) {
  let crc = -1;
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function u16(n) { return [n & 255, (n >>> 8) & 255]; }
function u32(n) { return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }

function createZip(files) {
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;

  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const data = encoder.encode(file.content || '');
    const crc = crc32(data);
    const local = new Uint8Array([
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0),
      ...name, ...data
    ]);
    chunks.push(local);
    central.push(new Uint8Array([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0), ...u16(0),
      ...u16(0), ...u16(0), ...u32(0), ...u32(offset), ...name
    ]));
    offset += local.length;
  });

  const centralSize = central.reduce((sum, chunk) => sum + chunk.length, 0);
  const end = new Uint8Array([
    ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length),
    ...u32(centralSize), ...u32(offset), ...u16(0)
  ]);

  return new Blob([...chunks, ...central, end], { type: 'application/zip' });
}

function exportFiles() {
  const name = baseName();
  const result = state.result;
  return [
    { name: '01-divi-import.json', content: JSON.stringify(result.diviJson, null, 2) },
    { name: '02-divi-shortcodes.txt', content: result.shortcodes || '' },
    { name: '03-preview.html', content: result.previewHtml || '' },
    { name: '04-styles.css', content: result.css || '' },
    { name: '05-layout-tecnico.json', content: JSON.stringify(result.layout || {}, null, 2) },
    { name: '06-validation-report.json', content: JSON.stringify(result.validation || {}, null, 2) },
    { name: '07-original.html', content: state.originalHtml || '' },
    { name: '08-readme-importacion.txt', content: `Archivo principal para importar en Divi: 01-divi-import.json\nContexto: et_builder\nModo usado: ${result.layout.mode}\nValidación: ${result.validation.ok ? 'OK' : 'REVISAR'}\n` }
  ].map((file) => ({ ...file, name: `${name}/${file.name}` }));
}

function downloadZip() {
  if (!state.result) return;
  const blob = createZip(exportFiles());
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${baseName()}.divi-package.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function handleFile(file) {
  if (!file) return;
  state.fileName = file.name;
  state.originalHtml = await file.text();
  state.result = null;
  fileMeta.textContent = `${file.name} · ${Math.round(file.size / 1024)} KB`;
  outputName.value = file.name.replace(/\.(html|htm)$/i, '') || config.defaultOutputPrefix || 'divi-layout';
  controlsPanel.hidden = false;
  resultPanel.hidden = true;
  originalPreview.srcdoc = state.originalHtml;
  createdPreview.srcdoc = '';
}

function runConversion() {
  if (!state.originalHtml) return;
  state.result = convertHtml(state.originalHtml, conversionMode.value);
  resultPanel.hidden = false;
  renderPreviews();
  setOutputTab('shortcodes');
}

function resetApp() {
  state.fileName = '';
  state.originalHtml = '';
  state.result = null;
  fileInput.value = '';
  fileMeta.textContent = 'Sin archivo cargado.';
  controlsPanel.hidden = true;
  resultPanel.hidden = true;
  originalPreview.srcdoc = '';
  createdPreview.srcdoc = '';
  outputCode.value = '';
}

accessForm.addEventListener('submit', handleAccess);
fileInput.addEventListener('change', (event) => handleFile(event.target.files?.[0]));

dropzone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropzone.classList.add('is-dragover');
});

dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragover'));

dropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropzone.classList.remove('is-dragover');
  handleFile(event.dataTransfer.files?.[0]);
});

convertBtn.addEventListener('click', runConversion);
resetBtn.addEventListener('click', resetApp);

document.querySelectorAll('.tab').forEach((button) => {
  button.addEventListener('click', () => setOutputTab(button.dataset.tab));
});

el('download-shortcodes').addEventListener('click', () => {
  if (state.result) downloadText(`${baseName()}.divi-shortcodes.txt`, state.result.shortcodes);
});

el('download-json').addEventListener('click', () => {
  if (state.result) downloadText(`${baseName()}.divi-import.json`, JSON.stringify(state.result.diviJson, null, 2), 'application/json');
});

el('download-css').addEventListener('click', () => {
  if (state.result) downloadText(`${baseName()}.css`, state.result.css || '', 'text/css');
});

el('download-preview').addEventListener('click', () => {
  if (state.result) downloadText(`${baseName()}.preview.html`, state.result.previewHtml, 'text/html');
});

el('download-zip').addEventListener('click', downloadZip);

window.DIVI_MANAGER_APP = {
  convertHtml,
  validateDiviOutput,
  createDiviImportJson,
  exportFiles,
  getState: () => state
};

if (!config.accessGateEnabled || sessionStorage.getItem('divi-manager-unlocked') === '1') {
  unlockApp();
}