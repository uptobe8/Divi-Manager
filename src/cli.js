#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { convertHtmlToDivi } from './converter.js';

const args = process.argv.slice(2);
const command = args.shift();
let mode = 'balanced';
const positional = [];

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === '--mode') {
    mode = args[index + 1] || mode;
    index += 1;
  } else if (arg.startsWith('--mode=')) {
    mode = arg.slice('--mode='.length) || mode;
  } else {
    positional.push(arg);
  }
}

const [inputDir = './examples', outputDir = './dist'] = positional;
const allowedModes = new Set(['balanced', 'editable', 'safe', 'visual']);

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function listHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function convertFolder(sourceDir, targetDir) {
  await ensureDir(targetDir);
  const files = await listHtmlFiles(sourceDir);

  if (!files.length) {
    throw new Error(`No HTML files found in ${sourceDir}`);
  }

  const summary = [];

  for (const file of files) {
    const html = await fs.readFile(file, 'utf8');
    const result = convertHtmlToDivi(html, { sourceFile: file, mode });
    const base = path.basename(file, path.extname(file));

    await fs.writeFile(path.join(targetDir, `${base}.divi-shortcodes.txt`), result.shortcodes, 'utf8');
    await fs.writeFile(path.join(targetDir, `${base}.layout.json`), JSON.stringify(result.layout, null, 2), 'utf8');
    await fs.writeFile(path.join(targetDir, `${base}.css`), result.css, 'utf8');

    summary.push({
      file,
      mode,
      sections: result.layout.sections.length,
      modules: result.layout.sections.reduce((total, section) => total + section.rows.reduce((rowTotal, row) => rowTotal + row.modules.length, 0), 0)
    });
  }

  await fs.writeFile(path.join(targetDir, 'conversion-summary.json'), JSON.stringify(summary, null, 2), 'utf8');
  console.log(`Converted ${files.length} HTML file(s) into ${targetDir} using ${mode} mode`);
}

async function main() {
  if (command !== 'convert') {
    console.log('Usage: node src/cli.js convert ./input-html ./dist [--mode=balanced|editable|safe|visual]');
    process.exit(1);
  }

  if (!allowedModes.has(mode)) {
    throw new Error(`Invalid mode "${mode}". Use balanced, editable, safe or visual.`);
  }

  await convertFolder(inputDir, outputDir);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
