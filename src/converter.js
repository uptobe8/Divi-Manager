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
  return /card|feature|service|item|box|tile|benefit/.test(classes);
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
  const html = $.html(node);
  return {
    type: 'code',
    html: cleanHtml(html)
  };
}

function parseModulesFromContainer($, container) {
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

    if (isCardLike($node)) {
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
    if (nestedSimple > 0 && nestedSimple <= 8) {
      const nestedModules = parseModulesFromContainer($, node);
      if (nestedModules.length) {
        modules.push(...nestedModules);
      } else {
        modules.push(createTextModule($node.html() || $.html(node), { source: 'nested' }));
      }
      consumed.add(node);
      return;
    }

    modules.push(createCodeModule($, node));
    consumed.add(node);
  });

  return modules;
}

function detectColumns($, section) {
  const directChildren = $(section).children().filter((_, child) => !$(child).is('script,style,link,meta'));
  const columnCandidates = directChildren.filter((_, child) => {
    const classes = getClasses($(child)).join(' ').toLowerCase();
    return /col|column|grid|span|w-|basis|card|feature|service/.test(classes);
  });

  if (columnCandidates.length >= 2 && columnCandidates.length <= 6) {
    return columnCandidates.toArray().map((node) => ({
      classes: getClasses($(node)),
      modules: parseModulesFromContainer($, node)
    }));
  }

  return [{
    classes: getClasses($(section)),
    modules: parseModulesFromContainer($, section)
  }];
}

function parseSections($) {
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
    const columns = detectColumns($, section);

    return {
      id: $section.attr('id') || `section-${index + 1}`,
      tag: section.tagName || 'section',
      classes: getClasses($section),
      rows: [
        {
          columns: columns.length,
          modules: columns.flatMap((column, columnIndex) => column.modules.map((module) => ({
            ...module,
            column: columnIndex + 1
          })))
        }
      ]
    };
  }).filter((section) => section.rows.some((row) => row.modules.length));
}

export function convertHtmlToDivi(html, options = {}) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const title = normalizeText($('title').first().text()) || options.sourceFile || 'Untitled Divi Layout';
  const css = extractCss($);
  $('script,style,noscript').remove();

  const layout = {
    version: '0.1.0',
    source: options.sourceFile || null,
    title,
    generatedAt: new Date().toISOString(),
    sections: parseSections($)
  };

  return {
    layout,
    css,
    shortcodes: renderDiviShortcodes(layout)
  };
}
