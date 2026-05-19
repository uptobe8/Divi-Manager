function escapeAttr(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function shortcodeAttrs(attrs = {}) {
  return Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}="${escapeAttr(value)}"`)
    .join(' ');
}

function wrap(tag, attrs, content = '') {
  const attrText = shortcodeAttrs(attrs);
  return `[${tag}${attrText ? ` ${attrText}` : ''}]${content}[/${tag}]`;
}

function renderModule(module) {
  switch (module.type) {
    case 'text':
      return wrap('et_pb_text', {
        _builder_version: '4.27.0',
        global_colors_info: '{}'
      }, module.html || '');

    case 'button':
      return wrap('et_pb_button', {
        button_url: module.url || '#',
        url_new_window: module.target === '_blank' ? 'on' : 'off',
        button_text: module.text || 'Button',
        _builder_version: '4.27.0',
        global_colors_info: '{}'
      }, '');

    case 'image':
      return wrap('et_pb_image', {
        src: module.src || '',
        alt: module.alt || '',
        title_text: module.title || module.alt || '',
        _builder_version: '4.27.0',
        global_colors_info: '{}'
      }, '');

    case 'blurb':
      return wrap('et_pb_blurb', {
        title: module.title || '',
        image: module.image || '',
        _builder_version: '4.27.0',
        global_colors_info: '{}'
      }, module.body || '');

    case 'code':
    default:
      return wrap('et_pb_code', {
        _builder_version: '4.27.0',
        global_colors_info: '{}'
      }, module.html || '');
  }
}

function renderRow(row) {
  const modules = row.modules.map(renderModule).join('\n');
  return wrap('et_pb_row', {
    _builder_version: '4.27.0',
    global_colors_info: '{}'
  }, `\n${modules}\n`);
}

function renderSection(section) {
  const rows = section.rows.map(renderRow).join('\n');
  return wrap('et_pb_section', {
    fb_built: '1',
    _builder_version: '4.27.0',
    custom_padding: '||',
    global_colors_info: '{}'
  }, `\n${rows}\n`);
}

export function renderDiviShortcodes(layout) {
  return layout.sections.map(renderSection).join('\n\n');
}
