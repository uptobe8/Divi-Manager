(() => {
  'use strict';
  const DM=window.DM,K=DM.K;

  DM.DEFAULT_TYPOGRAPHY={
    family:'Arial, Helvetica, sans-serif',
    h1Weight:'600',h1Size:'clamp(42px, 5.2vw, 74px)',h1Mobile:'clamp(38px, 12vw, 54px)',h1Line:'0.9',h1Letter:'-0.06em',
    h2Weight:'600',h2Size:'clamp(34px, 4.25vw, 56px)',h2Mobile:'clamp(30px, 9.5vw, 42px)',h2Line:'0.93',h2Letter:'-0.06em',
    leadWeight:'400',leadSize:'17px',leadLine:'1.55',
    bodyWeight:'400',bodySize:'16px',
    h3Weight:'700',h3Size:'18px',
    kickerWeight:'700',kickerSize:'10px',kickerLetter:'.17em'
  };

  function parseAttrs(raw=''){
    const out={},re=/([a-zA-Z0-9_:-]+)="([^"]*)"/g;
    let m;
    while((m=re.exec(raw))) out[m[1]]=m[2];
    return out;
  }

  function buildOpenTag(tag,attrs){
    const a=Object.entries(attrs).map(([k,v])=>`${k}="${String(v).replace(/"/g,'&quot;')}"`).join(' ');
    return `[${tag}${a?' '+a:''}]`;
  }

  function safeCss(value,fallback=''){
    const s=String(value??fallback).trim().replace(/[{}<>;]/g,'');
    return s||fallback;
  }

  function addClass(attrs,name){
    const classes=String(attrs.module_class||'').split(/\s+/).filter(Boolean);
    if(!classes.includes(name)) classes.push(name);
    attrs.module_class=classes.join(' ');
  }

  function normalizeHeadings(input,stats){
    let first=true,seenH2=false;
    return String(input||'').replace(/<h([1-6])(\b[^>]*)>([\s\S]*?)<\/h\1>/gi,(full,level,extra,body)=>{
      const original=Number(level);
      let target;
      if(first){target=1;first=false;}
      else if(original<=2){target=2;seenH2=true;}
      else if(!seenH2){target=2;seenH2=true;}
      else target=3;
      if(original!==target) stats.headings++;
      return `<h${target}${extra}>${body}</h${target}>`;
    });
  }

  function cssFor(r){
    const family=safeCss(r.family,DM.DEFAULT_TYPOGRAPHY.family);
    const h1w=safeCss(r.h1Weight,'600'),h1s=safeCss(r.h1Size,DM.DEFAULT_TYPOGRAPHY.h1Size),h1m=safeCss(r.h1Mobile,DM.DEFAULT_TYPOGRAPHY.h1Mobile),h1l=safeCss(r.h1Line,'0.9'),h1ls=safeCss(r.h1Letter,'-0.06em');
    const h2w=safeCss(r.h2Weight,'600'),h2s=safeCss(r.h2Size,DM.DEFAULT_TYPOGRAPHY.h2Size),h2m=safeCss(r.h2Mobile,DM.DEFAULT_TYPOGRAPHY.h2Mobile),h2l=safeCss(r.h2Line,'0.93'),h2ls=safeCss(r.h2Letter,'-0.06em');
    const leadw=safeCss(r.leadWeight,'400'),leads=safeCss(r.leadSize,'17px'),leadl=safeCss(r.leadLine,'1.55');
    const bodyw=safeCss(r.bodyWeight,'400'),bodys=safeCss(r.bodySize,'16px');
    const h3w=safeCss(r.h3Weight,'700'),h3s=safeCss(r.h3Size,'18px');
    const kw=safeCss(r.kickerWeight,'700'),ks=safeCss(r.kickerSize,'10px'),kls=safeCss(r.kickerLetter,'.17em');
    return `.dm-typo-h1 h1{font-family:${family}!important;font-weight:${h1w}!important;font-size:${h1s}!important;line-height:${h1l}!important;letter-spacing:${h1ls}!important;text-transform:uppercase!important}.dm-typo-h2 h2{font-family:${family}!important;font-weight:${h2w}!important;font-size:${h2s}!important;line-height:${h2l}!important;letter-spacing:${h2ls}!important;text-transform:uppercase!important}.dm-typo-h3 h3{font-family:${family}!important;font-weight:${h3w}!important;font-size:${h3s}!important}.dm-typo-lead,.dm-typo-lead p{font-family:${family}!important;font-weight:${leadw}!important;font-size:${leads}!important;line-height:${leadl}!important}.dm-typo-body,.dm-typo-body p,.dm-typo-body li{font-family:${family}!important;font-weight:${bodyw}!important;font-size:${bodys}!important}.dm-typo-kicker,.dm-typo-kicker p{font-family:${family}!important;font-weight:${kw}!important;font-size:${ks}!important;letter-spacing:${kls}!important;text-transform:uppercase!important}@media(max-width:767px){.dm-typo-h1 h1{font-size:${h1m}!important}.dm-typo-h2 h2{font-size:${h2m}!important}}`;
  }

  function classifyTextModules(input){
    return String(input||'').replace(/\[et_pb_text([^\]]*)\]([\s\S]*?)\[\/et_pb_text\]/gi,(full,raw,content)=>{
      const attrs=parseAttrs(raw),hint=`${attrs.module_class||''} ${attrs.admin_label||''}`.toLowerCase();
      if(/<h1\b/i.test(content)) addClass(attrs,'dm-typo-h1');
      if(/<h2\b/i.test(content)) addClass(attrs,'dm-typo-h2');
      if(/<h3\b/i.test(content)) addClass(attrs,'dm-typo-h3');
      if(/kicker|eyebrow/.test(hint)) addClass(attrs,'dm-typo-kicker');
      else if(/hero[-_ ]?lead|\blead\b/.test(hint)) addClass(attrs,'dm-typo-lead');
      else if(/<p\b|<li\b/i.test(content)) addClass(attrs,'dm-typo-body');
      return `${buildOpenTag('et_pb_text',attrs)}${content}[/et_pb_text]`;
    });
  }

  function typographySection(css){
    const code=DM.shortcode('et_pb_code',{admin_label:'DM · Reglas tipográficas',module_class:'dm-typography-rules',_builder_version:K.builderVersion,global_colors_info:'{}'},`<style id="dm-typography-rules">${css}</style>`);
    const col=DM.shortcode('et_pb_column',{type:'4_4',_builder_version:K.builderVersion,global_colors_info:'{}'},code);
    const row=DM.shortcode('et_pb_row',{admin_label:'DM · Tipografía',_builder_version:K.builderVersion,global_colors_info:'{}'},col);
    return DM.shortcode('et_pb_section',{fb_built:'1',admin_label:'DM · Tipografía',module_class:'dm-typography-config',_builder_version:K.builderVersion,custom_padding:'0px|0px|0px|0px|true|true',global_colors_info:'{}'},row);
  }

  function upsertTypographyCss(input,css){
    const marker=/<style id="dm-typography-rules">[\s\S]*?<\/style>/i;
    if(marker.test(input)) return input.replace(marker,`<style id="dm-typography-rules">${css}</style>`);
    return `${typographySection(css)}\n${input}`;
  }

  DM.applyHeadingAndTypography=(input,options={})=>{
    const stats=options.stats||{headings:0,typography:0};
    let out=normalizeHeadings(input,stats);
    if(options.enabled){
      out=classifyTextModules(out);
      out=upsertTypographyCss(out,cssFor({...DM.DEFAULT_TYPOGRAPHY,...(options.rules||{})}));
      stats.typography++;
    }
    return{shortcodes:out,stats};
  };
})();