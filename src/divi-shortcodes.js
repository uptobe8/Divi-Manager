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

function getColumnType(count) {
  return ({
    1: '4_4',
    2: '1_2',
    3: '1_3',
    4: '1_4',
    5: '1_5',
    6: '1_6'
  })[count] || '4_4';
}

function getRowColumns(row) {
  if (Array.isArray(row.columnsData) && row.columnsData.length) {
    return row.columnsData;
  }

  const count = Math.max(1, Math.min(Number(row.columns) || 1, 6));
  const type = getColumnType(count);
  return Array.from({ length: count }, (_, index) => ({
    type,
    modules: (row.modules || []).filter((module) => (module.column || 1) === index + 1)
  }));
}

function renderColumn(column, fallbackType = '4_4') {
  const modules = (column.modules || []).map(renderModule).join('\n');
  return wrap('et_pb_column', {
    type: column.type || fallbackType,
    _builder_version: '4.27.0',
    custom_padding: '|||',
    global_colors_info: '{}'
  }, `\n${modules}\n`);
}

function renderRow(row) {
  const columns = getRowColumns(row);
  const fallbackType = getColumnType(columns.length);
  const columnStructure = columns.map((column) => column.type || fallbackType).join(',');
  const renderedColumns = columns.map((column) => renderColumn(column, fallbackType)).join('\n');

  return wrap('et_pb_row', {
    column_structure: columnStructure,
    _builder_version: '4.27.0',
    global_colors_info: '{}'
  }, `\n${renderedColumns}\n`);
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
