(() => {
  'use strict';
  const K = window.DIVI4_KNOWLEDGE;
  const DM = window.DM = window.DM || {};
  DM.K = K;
  DM.state = { html: null, json: null };
  DM.$ = (s, root = document) => root.querySelector(s);
  DM.$$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  DM.escAttr = (value = '') => String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  DM.shortcode = (tag, attrs = {}, content = '') => {
    const a = Object.entries(attrs).filter(([,v]) => v !== '' && v !== null && v !== undefined).map(([k,v]) => `${k}="${DM.escAttr(v)}"`).join(' ');
    return `[${tag}${a ? ` ${a}` : ''}]${content}[/${tag}]`;
  };
  DM.cleanName = (name, fallback = 'divi-layout') => String(name || fallback).replace(/\.[^.]+$/,'').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'') || fallback;
  DM.downloadJson = (name, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  DM.rgbToHex = value => {
    const m = String(value || '').match(/^rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/i);
    if (!m) return value || '';
    if (m[4] !== undefined && Number(m[4]) === 0) return '';
    return '#' + [m[1],m[2],m[3]].map(n => Math.max(0,Math.min(255,Number(n))).toString(16).padStart(2,'0')).join('');
  };
  DM.pxNum = value => { const m = String(value || '').trim().match(/^(-?[\d.]+)px$/); return m ? Number(m[1]) : null; };
  DM.diviSpacing = (style, prefix) => {
    if (!style) return '';
    const vals = ['Top','Right','Bottom','Left'].map(s => style[`${prefix}${s}`] || '0px');
    return `${vals[0]}|${vals[1]}|${vals[2]}|${vals[3]}|true|true`;
  };
  DM.firstFont = value => String(value || 'Arial').split(',')[0].replace(/["']/g,'').trim() || 'Arial';
  DM.fontValue = style => `${DM.firstFont(style?.fontFamily)}|${String(style?.fontWeight || '400')}|${String(style?.fontStyle || '') === 'italic' ? 'on' : ''}||||||`;
  DM.meaningfulColor = v => {
    const s = String(v || '');
    if (!s || s === 'rgba(0, 0, 0, 0)' || s === 'transparent') return '';
    return DM.rgbToHex(s);
  };
  DM.responsive = (attrs, key, desktop, tablet, phone) => {
    if (desktop) attrs[key] = desktop;
    let edited = false;
    if (tablet && String(desktop || '') !== String(tablet)) { attrs[`${key}_tablet`] = tablet; edited = true; }
    if (phone && String(desktop || '') !== String(phone)) { attrs[`${key}_phone`] = phone; edited = true; }
    if (edited) attrs[`${key}_last_edited`] = 'on|desktop';
  };
})();
