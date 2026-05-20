const config = window.DIVI_MANAGER_CONFIG || {};

const state = {
  fileName: '',
  originalHtml: '',
  result: null,
  activeTab: 'shortcodes'
};

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
  return value.replace(/\s+/g, ' ').trim();
}

function escapeAttr(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(value = '') {
  return String(value)
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

  const hash = await sha256(accessKey.value || '');
  if (hash === config.accessKeyHash) {
    unlockApp();
  } else {
    accessError.hidden = false;
  }
}

function getClasses(node) {
  return Array.from(node.classList || []);
}

function isButtonLike(node) {
  const classes = getClasses(node).join(' ').toLowerCase();
  const tag = node.tagName ? node.tagName.toLowerCase() : '';
  const role = (node.getAttribute('role') || '').toLowerCase();
  return ['a', 'button'].includes(tag) && (
    role === 'button' || /btn|button|cta|primary|secondary|link-button/.test(classes)
  );
}

function isCardLike(node) {
  const classes = getClasses(node).join(' ').toLowerCase();
  return /card|feature|service|item|box|tile|benefit|package|product|review|step|kpi/.test(classes);
}

function cleanNodeHtml(html = '') {
  return html.trim();
}

function createTextModule(node) {
  return {
    type: 'text',
    html: cleanNodeHtml(node.outerHTML || node.innerHTML || node.textContent || ''),
    tag: node.tagName ? node.tagName.toLowerCase() : 'text'
  };
}

function createButtonModule(node) {
  return {
    type: 'button',
    text: normalizeText(node.textContent || 'Botón'),
    url: node.getAttribute('href') || '#',
    target: node.getAttribute('target') || '',
    classes: getClasses(node)
  };
}

function createImageModule(node) {
  return {
    type: 'image',
    src: node.getAttribute('src') || '',
    alt: node.getAttribute('alt') || '',
    title: node.getAttribute('title') || '',
    classes: getClasses(node)
  };
}

function createBlurbModule(node) {
  const heading = node.querySelector('h1,h2,h3,h4,h5,h6');
  const image = node.querySelector('img');
  const clone = node.cloneNode(true);
  const cloneHeading = clone.querySelector('h1,h2,h3,h4,h5,h6');
  const cloneImage = clone.querySelector('img');
  if (cloneHeading) cloneHeading.remove();
  if (cloneImage) cloneImage.remove();

  return {
    type: 'blurb',
    title: normalizeText(heading?.textContent || node.textContent || '').slice(0, 90),
    image: image?.getAttribute('src') || '',
    body: cleanNodeHtml(clone.innerHTML || ''),
    classes: getClasses(node)
  };
}

function createCodeModule(node) {
  return {
    type: 'code',
    html: cleanNodeHtml(node.outerHTML || '')
  };
}

function shouldSkipNode(node) {
  if (!node.tagName) return true;
  return ['script', 'style', 'link', 'meta', 'title'].includes(node.tagName.toLowerCase());
}

function parseModules(container, mode) {
  const modules = [];
  const children = Array.from(container.children || []).filter((node) => !shouldSkipNode(node));

  for (const node of children) {
    const tag = node.tagName.toLowerCase();

    if (isButtonLike(node)) {
      modules.push(createButtonModule(node));
      continue;
    }

    if (tag === 'img') {
      modules.push(createImageModule(node));
      continue;
    }

    if (mode !== 'safe' && isCardLike(node)) {
      modules.push(createBlurbModule(node));
      continue;
    }

    if (['h1','h2','h3','h4','h5','h6','p','ul','ol','blockquote'].includes(tag)) {
      modules.push(createTextModule(node));
      continue;
    }

    const directButtons = Array.from(node.children || []).filter(isButtonLike);
    if (directButtons.length && normalizeText(node.textContent || '').length < 260) {
      const textClone = node.cloneNode(true);
      Array.from(textClone.querySelectorAll('a,button')).forEach((item) => item.remove());
      const text = normalizeText(textClone.textContent || '');
      if (text) modules.push({ type: 'text', html: `<p>${escapeHtml(text)}</p>`, tag: 'p' });
      directButtons.forEach((button) => modules.push(createButtonModule(button)));
      continue;
    }

    const onlyImage = node.children.length === 1 && node.children[0].tagName?.toLowerCase() === 'img';
    if (onlyImage) {
      modules.push(createImageModule(node.children[0]));
      continue;
    }

    const simpleNestedCount = node.querySelectorAll('h1,h2,h3,h4,h5,h6,p,ul,ol,a,button,img').length;
    if (mode === 'editable' && simpleNestedCount > 0 && simpleNestedCount <= 14) {
      const nested = parseModules(node, mode);
      if (nested.length) {
        modules.push(...nested);
        continue;
      }
    }

    if (mode === 'safe') {
      modules.push(createCodeModule(node));
      continue;
    }

    if (simpleNestedCount > 0 && simpleNestedCount <= 8) {
      const nested = parseModules(node, mode);
      if (nested.length) {
        modules.push(...nested);
      } else {
        modules.push(createCodeModule(node));
      }
      continue;
    }

    modules.push(createCodeModule(node));
  }

  return modules;
}

function extractCss(doc) {
  const inlineCss = Array.from(doc.querySelectorAll('style')).map((node) => node.textContent || '').filter(Boolean);
  const external = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map((node) => `/* External CSS: ${node.getAttribute('href')} */`);
  return [...inlineCss, ...external].join('\n\n');
}

function detectSections(doc) {
  const sections = Array.from(doc.querySelectorAll('body > section, main > section, section'));
  if (sections.length) return sections;
  const main = doc.querySelector('main');
  if (main) return [main];
  const body = doc.body;
  return body ? [body] : [];
}

function convertHtml(html, mode = 'balanced') {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const css = extractCss(doc);
  const title = normalizeText(doc.querySelector('title')?.textContent || state.fileName || 'Divi Layout');
  const sectionNodes = detectSections(doc);

  const sections = sectionNodes.map((section, index) => {
    const modules = parseModules(section, mode).map((module) => ({ ...module, column: 1 }));
    return {
      id: section.id || `section-${index + 1}`,
      tag: section.tagName.toLowerCase(),
      classes: getClasses(section),
      rows: [{ columns: 1, modules }]
    };
  }).filter((section) => section.rows.some((row) => row.modules.length));

  const layout = {
    version: '0.1.0-pages-app',
    title,
    fileName: state.fileName,
    mode,
    generatedAt: new Date().toISOString(),
    sections
  };

  return {
    layout,
    css,
    shortcodes: renderShortcodes(layout),
    previewHtml: renderPreview(layout, css)
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
    return shortcode('et_pb_text', { _builder_version: '4.27.0', global_colors_info: '{}' }, module.html || '');
  }
  if (module.type === 'button') {
    return shortcode('et_pb_button', {
      button_url: module.url || '#',
      url_new_window: module.target === '_blank' ? 'on' : 'off',
      button_text: module.text || 'Botón',
      _builder_version: '4.27.0',
      global_colors_info: '{}'
    }, '');
  }
  if (module.type === 'image') {
    return shortcode('et_pb_image', {
      src: module.src || '',
      alt: module.alt || '',
      title_text: module.title || module.alt || '',
      _builder_version: '4.27.0',
      global_colors_info: '{}'
    }, '');
  }
  if (module.type === 'blurb') {
    return shortcode('et_pb_blurb', {
      title: module.title || '',
      image: module.image || '',
      _builder_version: '4.27.0',
      global_colors_info: '{}'
    }, module.body || '');
  }
  return shortcode('et_pb_code', { _builder_version: '4.27.0', global_colors_info: '{}' }, module.html || '');
}

function renderShortcodes(layout) {
  return layout.sections.map((section) => {
    const rows = section.rows.map((row) => {
      const modules = row.modules.map(renderModuleShortcode).join('\n');
      return shortcode('et_pb_row', { _builder_version: '4.27.0', global_colors_info: '{}' }, `\n${modules}\n`);
    }).join('\n');
    return shortcode('et_pb_section', { fb_built: '1', _builder_version: '4.27.0', global_colors_info: '{}' }, `\n${rows}\n`);
  }).join('\n\n');
}

function renderPreviewModule(module) {
  if (module.type === 'text') return module.html || '';
  if (module.type === 'button') return `<p><a class="dm-button" href="${escapeAttr(module.url || '#')}">${escapeHtml(module.text || 'Botón')}</a></p>`;
  if (module.type === 'image') return `<img src="${escapeAttr(module.src || '')}" alt="${escapeAttr(module.alt || '')}">`;
  if (module.type === 'blurb') {
    return `<article class="dm-blurb">${module.image ? `<img src="${escapeAttr(module.image)}" alt="">` : ''}<h3>${escapeHtml(module.title || '')}</h3><div>${module.body || ''}</div></article>`;
  }
  return module.html || '';
}

function renderPreview(layout, css) {
  const body = layout.sections.map((section) => {
    const rows = section.rows.map((row) => `<div class="dm-row">${row.modules.map(renderPreviewModule).join('\n')}</div>`).join('\n');
    const className = ['dm-section', ...(section.classes || [])].join(' ');
    return `<section id="${escapeAttr(section.id)}" class="${escapeAttr(className)}">${rows}</section>`;
  }).join('\n');

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css || ''}\n.dm-section{padding:48px 24px}.dm-row{max-width:1180px;margin:auto}.dm-button{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:13px 18px;background:#ff5a1f;color:#fff;text-decoration:none;font-weight:900}.dm-blurb{border:1px solid #e9edf1;border-radius:22px;padding:20px;background:#fff;margin:12px 0}.dm-blurb img{max-width:100%;height:auto;display:block;margin-bottom:14px}</style></head><body>${body}</body></html>`;
}

function renderPreviews() {
  originalPreview.srcdoc = state.originalHtml;
  createdPreview.srcdoc = state.originalHtml;
  originalSize.textContent = `${Math.round(state.originalHtml.length / 1024)} KB`;
  const sections = state.result.layout.sections.length;
  const modules = state.result.layout.sections.reduce((sum, section) => sum + section.rows.reduce((rowSum, row) => rowSum + row.modules.length, 0), 0);
  createdStats.textContent = `${sections} secciones · ${modules} módulos`;
}

function setOutputTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab').forEach((item) => item.classList.toggle('active', item.dataset.tab === tab));
  if (!state.result) return;
  if (tab === 'shortcodes') outputCode.value = state.result.shortcodes;
  if (tab === 'json') outputCode.value = JSON.stringify(state.result.layout, null, 2);
  if (tab === 'css') outputCode.value = state.result.css || '/* No se ha detectado CSS */';
}

function downloadText(name, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
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
  if (state.result) downloadText(`${baseName()}.layout.json`, JSON.stringify(state.result.layout, null, 2), 'application/json');
});

el('download-css').addEventListener('click', () => {
  if (state.result) downloadText(`${baseName()}.css`, state.result.css || '', 'text/css');
});

el('download-preview').addEventListener('click', () => {
  if (state.result) downloadText(`${baseName()}.preview.html`, state.result.previewHtml, 'text/html');
});

if (!config.accessGateEnabled || sessionStorage.getItem('divi-manager-unlocked') === '1') {
  unlockApp();
}
