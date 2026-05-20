import * as cheerio from 'cheerio';
import { renderDiviShortcodes } from './divi-shortcodes.js';

function normalizeText(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

function cleanHtml(value = '') {
  return value
    .replace(/\sdata-[^=]+="[^"]*"/g, '')
    .replace(/\saria-[^=]+="[^"]*"/g, '')
    .trim();
}

function getClasses($node) {
  return ($node.attr('class') || '')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
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

function isButtonLike($node) {
  const classes = getClasses($node).join(' ').toLowerCase();
  const role = ($node.attr('role') || '').toLowerCase();
  return $node.is('a,button') && (
    role === 'button' ||
    /btn|button|cta|primary|secondary|link-button/.test(classes)
  );
}

function isCardLike($node) {
  const classes = getClasses($node).join(' ').toLowerCase();
  return /card|feature|service|item|box|tile|benefit|package|product|review|step|kpi/.test(classes);
}

function isColumnCandidate($node) {
  const classes = getClasses($node).join(' ').toLowerCase();
  return /(^|\s)(col|column|card|feature|service|item|box|tile|benefit|package|product|review|step|kpi)|span|w-|basis/.test(classes);
}

function isColumnGroup($node) {
  const classes = getClasses($node).join(' ').toLowerCase();
  return /grid|row|columns|cols|cards|features|services|items|list|wrapper/.test(classes);
}

function extractCss($) {
  const css = [];

  $('style').each((_, node) => {
    const content = normalizeText($(node).html() || '');
    if (content) css.push(content);
  });

  $('link[rel="stylesheet"]').each((_, node) => {
    const href = $(node).attr('href');
    if (href) css.push(`/* External stylesheet detected: ${href} */`);
  });

  return css.join('\n\n');
}

function createTextModule(html, meta = {}) {
  return {
    type: 'text',
    html: cleanHtml(html),
    meta
  };
}

function createButtonModule($, node) {
  const $node = $(node);
  return {
    type: 'button',
    text: normalizeText($node.text()),
    url: $node.attr('href') || '#',
    target: $node.attr('target') || '',
    classes: getClasses($node)
  };
}

function createImageModule($, node) {
  const $node = $(node);
  return {
    type: 'image',
    src: $node.attr('src') || '',
    alt: $node.attr('alt') || '',
    title: $node.attr('title') || '',
    classes: getClasses($node)
  };
}

function createBlurbModule($, node) {
  const $node = $(node);
  const heading = normalizeText($node.find('h1,h2,h3,h4,h5,h6').first().text());
  const image = $node.find('img').first().attr('src') || '';
  const bodyClone = $node.clone();
  bodyClone.find('h1,h2,h3,h4,h5,h6').first().remove();
  bodyClone.find('img').first().remove();

  return {
    type: 'blurb',
    title: heading || normalizeText($node.text()).slice(0, 80),
    image,
    body: cleanHtml(bodyClone.html() || ''),
    classes: getClasses($node)
  };
}

function createCodeModule($, node) {
  const html = typeof node === 'string' ? node : $.html(node);
  return {
    type: 'code',
    html: cleanHtml(html)
  };
}

function parseModulesFromContainer($, container, mode = 'balanced') {
  const modules = [];
  const consumed = new Set();

  $(container).children().each((_, node) => {
    if (consumed.has(node)) return;

    const $node = $(node);

    if ($node.is('script,style,link,meta')) return;

    if (isButtonLike($node)) {
      modules.push(createButtonModule($, node));
      consumed.add(node);
      return;
    }

    if ($node.is('img')) {
      modules.push(createImageModule($, node));
      consumed.add(node);
      return;
    }

    if (mode !== 'safe' && isCardLike($node)) {
      modules.push(createBlurbModule($, node));
      consumed.add(node);
      return;
    }

    const directButtons = $node.children('a,button').filter((__, child) => isButtonLike($(child)));
    if ($node.is('h1,h2,h3,h4,h5,h6,p,ul,ol,blockquote')) {
      modules.push(createTextModule($.html(node), { tag: node.tagName }));
      consumed.add(node);
      return;
    }

    if (directButtons.length && normalizeText($node.clone().children('a,button').remove().end().text()).length < 120) {
      directButtons.each((__, button) => modules.push(createButtonModule($, button)));
      consumed.add(node);
      return;
    }

    const images = $node.children('img');
    if (images.length === 1 && normalizeText($node.text()).length < 80) {
      modules.push(createImageModule($, images.get(0)));
      consumed.add(node);
      return;
    }

    const nestedSimple = $node.find('h1,h2,h3,h4,h5,h6,p,ul,ol,a,button,img').length;
    if ((mode === 'editable' && nestedSimple > 0 && nestedSimple <= 14) || (nestedSimple > 0 && nestedSimple <= 8)) {
      const nestedModules = parseModulesFromContainer($, node, mode);
      if (nestedModules.length) {
        modules.push(...nestedModules);
      } else {
        modules.push(mode === 'safe'
          ? createCodeModule($, node)
          : createTextModule($node.html() || $.html(node), { source: 'nested' }));
      }
      consumed.add(node);
      return;
    }

    modules.push(createCodeModule($, node));
    consumed.add(node);
  });

  return modules;
}

function buildColumns($, nodes, mode) {
  const type = getColumnType(nodes.length);
  return nodes.map((node, index) => ({
    type,
    classes: getClasses($(node)),
    modules: parseModulesFromContainer($, node, mode).map((module) => ({
      ...module,
      column: index + 1
    }))
  }));
}

function detectColumns($, section, mode = 'balanced') {
  const directChildren = $(section).children().filter((_, child) => !$(child).is('script,style,link,meta'));
  const directColumnCandidates = directChildren.filter((_, child) => isColumnCandidate($(child)));

  if (directColumnCandidates.length >= 2 && directColumnCandidates.length <= 6) {
    return buildColumns($, directColumnCandidates.toArray(), mode);
  }

  const nestedGroup = directChildren.filter((_, child) => isColumnGroup($(child))).toArray().find((node) => {
    const children = $(node).children().filter((__, child) => !$(child).is('script,style,link,meta'));
    return children.length >= 2 && children.length <= 6;
  });

  if (nestedGroup) {
    const children = $(nestedGroup).children().filter((_, child) => !$(child).is('script,style,link,meta')).toArray();
    return buildColumns($, children, mode);
  }

  return [{
    type: '4_4',
    classes: getClasses($(section)),
    modules: parseModulesFromContainer($, section, mode).map((module) => ({
      ...module,
      column: 1
    }))
  }];
}

function createVisualSections($, css) {
  $('script,noscript').remove();
  const blocks = $('body').children().filter((_, node) => !$(node).is('script,style,link,meta,title')).toArray();
  const modules = [];

  if (css) {
    modules.push({
      type: 'code',
      html: `<style id="divi-manager-inline-css">\n${css}\n</style>`,
      column: 1
    });
  }

  blocks.forEach((node) => {
    modules.push({
      ...createCodeModule($, node),
      column: 1
    });
  });

  if (!modules.length) {
    modules.push({
      type: 'code',
      html: '<!-- Empty visual conversion -->',
      column: 1
    });
  }

  return [{
    id: 'visual-code-output',
    tag: 'body',
    classes: [],
    rows: [{
      columns: 1,
      columnsData: [{ type: '4_4', classes: [], modules }],
      modules
    }]
  }];
}

function parseSections($, mode = 'balanced') {
  let candidates = $('main > section, body > section, section').toArray();

  if (!candidates.length) {
    const main = $('main').first();
    if (main.length) candidates = [main.get(0)];
  }

  if (!candidates.length) {
    const body = $('body').first();
    if (body.length) candidates = [body.get(0)];
  }

  return candidates.map((section, index) => {
    const $section = $(section);
    const columnsData = detectColumns($, section, mode).filter((column) => column.modules.length);
    const modules = columnsData.flatMap((column) => column.modules);

    return {
      id: $section.attr('id') || `section-${index + 1}`,
      tag: section.tagName || 'section',
      classes: getClasses($section),
      rows: [
        {
          columns: columnsData.length || 1,
          columnsData: columnsData.length ? columnsData : [{ type: '4_4', classes: [], modules }],
          modules
        }
      ]
    };
  }).filter((section) => section.rows.some((row) => row.modules.length));
}

export function convertHtmlToDivi(html, options = {}) {
  const mode = options.mode || 'balanced';
  const $ = cheerio.load(html, { decodeEntities: false });
  const title = normalizeText($('title').first().text()) || options.sourceFile || 'Untitled Divi Layout';
  const css = extractCss($);
  $('script,style,noscript').remove();

  const sections = mode === 'visual'
    ? createVisualSections($, css)
    : parseSections($, mode);

  const layout = {
    version: mode === 'visual' ? '0.2.0-visual-code' : '0.2.0-divi-columns',
    source: options.sourceFile || null,
    title,
    mode,
    generatedAt: new Date().toISOString(),
    sections
  };

  return {
    layout,
    css,
    shortcodes: renderDiviShortcodes(layout)
  };
}
