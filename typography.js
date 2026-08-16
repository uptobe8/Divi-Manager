(() => {
  'use strict';
  const DM=window.DM,K=DM.K;

  DM.DEFAULT_TYPOGRAPHY={
    family:'Arial, Helvetica, sans-serif',
    h1Weight:'600',h1Size:'clamp(42px, 5.2vw, 74px)',h1Mobile:'clamp(38px, 12vw, 54px)',h1Line:'0.9',h1Letter:'-0.06em',
    h2Weight:'600',h2Size:'clamp(34px, 4.25vw, 56px)',h2Mobile:'clamp(30px, 9.5vw, 42px)',h2Line:'0.93',h2Letter:'-0.06em',
    leadWeight:'400',leadSize:'17px',leadLine:'1.55',
    bodyWeight:'400',bodySize:'16px',
    h3Weight:'700',h3Size:'18px',h3Line:'1.08',
    kickerWeight:'700',kickerSize:'10px',kickerLetter:'.17em',kickerFamily:'monospace',
    cardH3Size:'22px',cardH3Line:'1.05',cardBodySize:'15px',cardBodyLine:'1.58',
    ctaH2Size:'clamp(40px, 4.8vw, 66px)',ctaH2Mobile:'clamp(34px, 10.5vw, 46px)',ctaH2Line:'0.91'
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

  function firstFont(value){
    return String(value||'Arial').split(',')[0].replace(/["']/g,'').trim()||'Arial';
  }

  function addClass(attrs,name){
    const classes=String(attrs.module_class||'').split(/\s+/).filter(Boolean);
    if(!classes.includes(name)) classes.push(name);
    attrs.module_class=classes.join(' ');
  }

  function headingPrefix(level){
    return level===1?'header':`header_${level}`;
  }

  function belongsToHeading(key,level){
    if(level===1) return /^header_(?![2-6]_)/.test(key);
    return new RegExp(`^header_${level}_`).test(key);
  }

  function copyHeadingAttrs(attrs,from,to){
    if(from===to) return;
    const fromPrefix=headingPrefix(from),toPrefix=headingPrefix(to);
    for(const [key,value] of Object.entries({...attrs})){
      if(!belongsToHeading(key,from)) continue;
      const suffix=key.slice(fromPrefix.length);
      const target=`${toPrefix}${suffix}`;
      if(attrs[target]===undefined) attrs[target]=value;
    }
  }

  function targetHeadingLevel(original,state){
    if(state.first){state.first=false;return 1;}
    if(original<=2){state.seenH2=true;return 2;}
    if(!state.seenH2){state.seenH2=true;return 2;}
    return 3;
  }

  function applyDiviTypography(attrs,levels,hint,content,r){
    const font=firstFont(r.family);
    if(levels.has(1)){
      attrs.header_font=`${font}|${r.h1Weight}|||||||`;
      attrs.header_font_size=r.h1Size;
      attrs.header_font_size_phone=r.h1Mobile;
      attrs.header_font_size_last_edited='on|phone';
      attrs.header_line_height=`${r.h1Line}em`;
      attrs.header_letter_spacing=r.h1Letter;
    }
    if(levels.has(2)){
      attrs.header_2_font=`${font}|${r.h2Weight}|||||||`;
      attrs.header_2_font_size=r.h2Size;
      attrs.header_2_font_size_phone=r.h2Mobile;
      attrs.header_2_font_size_last_edited='on|phone';
      attrs.header_2_line_height=`${r.h2Line}em`;
      attrs.header_2_letter_spacing=r.h2Letter;
    }
    if(levels.has(3)){
      attrs.header_3_font=`${font}|${r.h3Weight}|||||||`;
      attrs.header_3_font_size=r.h3Size;
      attrs.header_3_line_height=`${r.h3Line}em`;
    }

    if(/kicker|eyebrow/.test(hint)){
      attrs.text_font=`Courier New|${r.kickerWeight}|||||||`;
      attrs.text_font_size=r.kickerSize;
      attrs.text_letter_spacing=r.kickerLetter;
    }else if(/hero[-_ ]?lead|\blead\b/.test(hint)){
      attrs.text_font=`${font}|${r.leadWeight}|||||||`;
      attrs.text_font_size=r.leadSize;
      attrs.text_line_height=`${r.leadLine}em`;
    }else if(/<p\b|<li\b/i.test(content)){
      attrs.text_font=`${font}|${r.bodyWeight}|||||||`;
      attrs.text_font_size=r.bodySize;
    }
  }

  function normalizeTextModules(input,stats,applyClasses,rules){
    const state={first:true,seenH2:false};
    const r={...DM.DEFAULT_TYPOGRAPHY,...(rules||{})};
    return String(input||'').replace(/\[et_pb_text([^\]]*)\]([\s\S]*?)\[\/et_pb_text\]/gi,(full,raw,originalContent)=>{
      const attrs=parseAttrs(raw),levels=new Set();
      const content=originalContent.replace(/<h([1-6])(\b[^>]*)>([\s\S]*?)<\/h\1>/gi,(heading,level,extra,body)=>{
        const from=Number(level),to=targetHeadingLevel(from,state);
        levels.add(to);
        if(from!==to){copyHeadingAttrs(attrs,from,to);stats.headings++;}
        return `<h${to}${extra}>${body}</h${to}>`;
      });

      if(applyClasses){
        const hint=`${attrs.module_class||''} ${attrs.admin_label||''}`.toLowerCase();
        if(levels.has(1)) addClass(attrs,'dm-typo-h1');
        if(levels.has(2)) addClass(attrs,'dm-typo-h2');
        if(levels.has(3)) addClass(attrs,'dm-typo-h3');
        if(/kicker|eyebrow/.test(hint)) addClass(attrs,'dm-typo-kicker');
        else if(/hero[-_ ]?lead|\blead\b/.test(hint)) addClass(attrs,'dm-typo-lead');
        else if(/<p\b|<li\b/i.test(content)) addClass(attrs,'dm-typo-body');
        applyDiviTypography(attrs,levels,hint,content,r);
      }

      return `${buildOpenTag('et_pb_text',attrs)}${content}[/et_pb_text]`;
    });
  }

  function force(cls,child=''){
    const base=`:is(#dm-oreja-force-a,.${cls}):is(#dm-oreja-force-b,.${cls})`;
    return child?`${base} ${child}`:base;
  }

  function cssFor(input){
    const r={...DM.DEFAULT_TYPOGRAPHY,...input};
    const family=safeCss(r.family,DM.DEFAULT_TYPOGRAPHY.family);
    const h1w=safeCss(r.h1Weight,'600'),h1s=safeCss(r.h1Size,DM.DEFAULT_TYPOGRAPHY.h1Size),h1m=safeCss(r.h1Mobile,DM.DEFAULT_TYPOGRAPHY.h1Mobile),h1l=safeCss(r.h1Line,'0.9'),h1ls=safeCss(r.h1Letter,'-0.06em');
    const h2w=safeCss(r.h2Weight,'600'),h2s=safeCss(r.h2Size,DM.DEFAULT_TYPOGRAPHY.h2Size),h2m=safeCss(r.h2Mobile,DM.DEFAULT_TYPOGRAPHY.h2Mobile),h2l=safeCss(r.h2Line,'0.93'),h2ls=safeCss(r.h2Letter,'-0.06em');
    const leadw=safeCss(r.leadWeight,'400'),leads=safeCss(r.leadSize,'17px'),leadl=safeCss(r.leadLine,'1.55');
    const bodyw=safeCss(r.bodyWeight,'400'),bodys=safeCss(r.bodySize,'16px');
    const h3w=safeCss(r.h3Weight,'700'),h3s=safeCss(r.h3Size,'18px'),h3l=safeCss(r.h3Line,'1.08');
    const kw=safeCss(r.kickerWeight,'700'),ks=safeCss(r.kickerSize,'10px'),kls=safeCss(r.kickerLetter,'.17em'),kf=safeCss(r.kickerFamily,'monospace');
    const cardH3=safeCss(r.cardH3Size,'22px'),cardH3Line=safeCss(r.cardH3Line,'1.05'),cardBody=safeCss(r.cardBodySize,'15px'),cardBodyLine=safeCss(r.cardBodyLine,'1.58');
    const ctaH2=safeCss(r.ctaH2Size,'clamp(40px, 4.8vw, 66px)'),ctaH2M=safeCss(r.ctaH2Mobile,'clamp(34px, 10.5vw, 46px)'),ctaH2L=safeCss(r.ctaH2Line,'0.91');

    return `${force('dm-typo-h1','h1')}{font-family:${family}!important;font-weight:${h1w}!important;font-size:${h1s}!important;line-height:${h1l}!important;letter-spacing:${h1ls}!important;text-transform:uppercase!important}
${force('dm-typo-h2','h2')}{font-family:${family}!important;font-weight:${h2w}!important;font-size:${h2s}!important;line-height:${h2l}!important;letter-spacing:${h2ls}!important;text-transform:uppercase!important}
${force('dm-typo-h3','h3')}{font-family:${family}!important;font-weight:${h3w}!important;font-size:${h3s}!important;line-height:${h3l}!important}
${force('dm-typo-lead')},${force('dm-typo-lead','p')}{font-family:${family}!important;font-weight:${leadw}!important;font-size:${leads}!important;line-height:${leadl}!important}
${force('dm-typo-body')},${force('dm-typo-body','p')},${force('dm-typo-body','li')}{font-family:${family}!important;font-weight:${bodyw}!important;font-size:${bodys}!important}
${force('dm-typo-kicker')},${force('dm-typo-kicker','*')}{font-family:${kf}!important;font-weight:${kw}!important;font-size:${ks}!important;line-height:1!important;letter-spacing:${kls}!important;text-transform:uppercase!important}
.inkt4 .quick-strip ${force('dm-typo-h3','h3')},.inkt4 .decision-grid ${force('dm-typo-h3','h3')}{font-size:${h3s}!important;line-height:${h3l}!important;font-weight:${h3w}!important}
.inkt4 .quick-strip ${force('dm-typo-body','p')},.inkt4 .decision-grid ${force('dm-typo-body','p')},.inkt4 .style-card-copy${force('dm-typo-body').replace(/^:/,' :')} p{font-size:${cardBody}!important;line-height:${cardBodyLine}!important;font-weight:400!important}
.inkt4 .artist-label${force('dm-typo-h3').replace(/^:/,' :')} h3,.inkt4 .style-card-copy${force('dm-typo-h3').replace(/^:/,' :')} h3,.ink-contact-oreja-type ${force('dm-typo-h3','h3')}{font-size:${cardH3}!important;line-height:${cardH3Line}!important;font-weight:700!important;letter-spacing:normal!important}
.inkt4 .cta ${force('dm-typo-h2','h2')}{font-size:${ctaH2}!important;line-height:${ctaH2L}!important;letter-spacing:${h2ls}!important}
@media(max-width:767px){${force('dm-typo-h1','h1')}{font-size:${h1m}!important}${force('dm-typo-h2','h2')}{font-size:${h2m}!important}.inkt4 .cta ${force('dm-typo-h2','h2')}{font-size:${ctaH2M}!important;line-height:${ctaH2L}!important}}`;
  }

  function typographyCode(css){
    return DM.shortcode('et_pb_code',{admin_label:'DM · Reglas tipográficas Oreja',module_class:'dm-typography-rules',_builder_version:K.builderVersion,global_colors_info:'{}'},`<style id="dm-typography-rules">${css}</style>`);
  }

  function upsertTypographyCss(input,css){
    const marker=/<style id="dm-typography-rules">[\s\S]*?<\/style>/i;
    if(marker.test(input)) return input.replace(marker,`<style id="dm-typography-rules">${css}</style>`);

    const style=`<style id="dm-typography-rules">${css}</style>`;
    const firstCodeClose=input.indexOf('[/et_pb_code]');
    if(firstCodeClose>=0) return input.slice(0,firstCodeClose)+style+input.slice(firstCodeClose);

    const firstColumnClose=input.indexOf('[/et_pb_column]');
    if(firstColumnClose>=0){
      const code=typographyCode(css);
      return input.slice(0,firstColumnClose)+code+input.slice(firstColumnClose);
    }
    return input;
  }

  DM.applyHeadingAndTypography=(input,options={})=>{
    const stats=options.stats||{headings:0,typography:0};
    let out=normalizeTextModules(input,stats,!!options.enabled,options.rules||{});
    if(options.enabled){
      out=upsertTypographyCss(out,cssFor(options.rules||{}));
      stats.typography++;
    }
    return{shortcodes:out,stats};
  };
})();