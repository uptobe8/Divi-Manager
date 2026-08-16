(() => {
  'use strict';
  const DM=window.DM;

  function parseAttrs(raw=''){
    const out={},re=/([a-zA-Z0-9_:-]+)="([^"]*)"/g;
    let m;
    while((m=re.exec(raw))) out[m[1]]=m[2];
    return out;
  }

  function buildOpenTag(tag,attrs){
    const a=Object.entries(attrs)
      .map(([k,v])=>`${k}="${String(v).replace(/"/g,'&quot;')}"`)
      .join(' ');
    return `[${tag}${a?' '+a:''}]`;
  }

  function spacingParts(value=''){
    const parts=String(value||'').split('|');
    while(parts.length<6) parts.push('');
    return parts;
  }

  function setResponsive(attrs,key,tablet,phone,stats,bucket){
    let changed=false;
    if(tablet!==null && tablet!==undefined && attrs[`${key}_tablet`]===undefined){
      attrs[`${key}_tablet`]=tablet;
      changed=true;
    }
    if(phone!==null && phone!==undefined && attrs[`${key}_phone`]===undefined){
      attrs[`${key}_phone`]=phone;
      changed=true;
    }
    if(changed){
      if(attrs[`${key}_last_edited`]===undefined) attrs[`${key}_last_edited`]='on|desktop';
      stats[bucket]++;
    }
  }

  function repairSpacing(attrs,key,stats){
    if(!attrs[key]) return;
    const parts=spacingParts(attrs[key]);
    const right=DM.pxNum(parts[1]), left=DM.pxNum(parts[3]);
    const isPadding=key==='custom_padding';
    const limit=isPadding?140:160;
    const horizontal=[right,left].filter(v=>v!==null).map(Math.abs);
    if(!horizontal.length || Math.max(...horizontal)<=limit) return;

    const tab=parts.slice();
    const phone=parts.slice();
    [1,3].forEach(i=>{
      const n=DM.pxNum(parts[i]);
      if(n===null) return;
      const sign=n<0?-1:1;
      tab[i]=`${sign*Math.min(Math.abs(n),isPadding?48:40)}px`;
      phone[i]=`${sign*Math.min(Math.abs(n),isPadding?24:20)}px`;
    });

    setResponsive(attrs,key,tab.join('|'),phone.join('|'),stats,'responsive');
  }

  function repairTypography(attrs,stats){
    Object.keys(attrs)
      .filter(k=>/(?:^|_)(?:font_size|text_size)$/.test(k) && !/_tablet$|_phone$|_last_edited$/.test(k))
      .forEach(key=>{
        const n=DM.pxNum(attrs[key]);
        if(n===null || n<=80) return;
        const tablet=`${Math.max(36,Math.min(64,Math.round(n*.78)))}px`;
        const phone=`${Math.max(30,Math.min(48,Math.round(n*.58)))}px`;
        setResponsive(attrs,key,tablet,phone,stats,'typography');
      });
  }

  function repairWidths(tag,attrs,stats){
    for(const key of ['width','inner_width']){
      const n=DM.pxNum(attrs[key]);
      if(n===null || n<=980) continue;
      setResponsive(attrs,key,'90%','calc(100% - 30px)',stats,'widths');
    }

    if(tag==='et_pb_image'){
      const width=DM.pxNum(attrs.width);
      const max=DM.pxNum(attrs.max_width);
      const pct=v=>{const m=String(v||'').trim().match(/^([\d.]+)%$/);return m?Number(m[1]):null;};
      const widthPct=pct(attrs.width), maxPct=pct(attrs.max_width);
      const oversized=(width!==null&&width>980)||(max!==null&&max>980)||(widthPct!==null&&widthPct>100)||(maxPct!==null&&maxPct>100);
      if(oversized){
        setResponsive(attrs,'max_width','100%','100%',stats,'images');
        if(attrs.module_alignment_phone===undefined){
          attrs.module_alignment_phone='center';
          if(attrs.module_alignment_last_edited===undefined) attrs.module_alignment_last_edited='on|desktop';
          stats.images++;
        }
      }
    }
  }

  function repairInlineCss(attrs,stats){
    for(const key of Object.keys(attrs).filter(k=>k.startsWith('custom_css_'))){
      const css=String(attrs[key]||'');
      if(!css || /max-width\s*:/i.test(css)) continue;
      const m=css.match(/(?:^|;)\s*width\s*:\s*(\d+(?:\.\d+)?)px\s*!?\s*(?:important)?\s*;?/i);
      if(!m || Number(m[1])<=980) continue;
      attrs[key]=`${css.trim().replace(/;?$/,';')}max-width:100%;box-sizing:border-box;`;
      stats.css++;
    }
  }

  function repairAttrs(tag,attrs,stats){
    repairSpacing(attrs,'custom_padding',stats);
    repairSpacing(attrs,'custom_margin',stats);
    repairTypography(attrs,stats);
    repairWidths(tag,attrs,stats);
    repairInlineCss(attrs,stats);
    return attrs;
  }

  DM.repairShortcodes=(input,stats)=>String(input||'').replace(
    /\[(et_pb_[a-zA-Z0-9_]+)([^\]]*)\]/g,
    (full,tag,raw)=>buildOpenTag(tag,repairAttrs(tag,parseAttrs(raw),stats))
  );

  function walk(value,stats){
    if(typeof value==='string'&&value.includes('[et_pb_')) return DM.repairShortcodes(value,stats);
    if(Array.isArray(value)) return value.map(v=>walk(v,stats));
    if(value&&typeof value==='object'){
      const o={};
      for(const[k,v]of Object.entries(value)) o[k]=walk(v,stats);
      return o;
    }
    return value;
  }

  DM.repairJsonFile=async file=>{
    const raw=await file.text();
    let json;
    try{ json=JSON.parse(raw); }
    catch{ throw new Error('El archivo no es un JSON válido.'); }
    if(!json||typeof json!=='object') throw new Error('JSON Divi no reconocido.');

    const stats={responsive:0,typography:0,widths:0,images:0,css:0};
    const repaired=walk(json,stats);

    if(!JSON.stringify(repaired).includes('[et_pb_section')){
      throw new Error('No se han encontrado shortcodes Divi dentro del JSON.');
    }

    return{json:repaired,stats};
  };
})();
