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
    const out={},re=/([a-zA-Z0-9_:-]+)="([^"]*)"/g;let m;
    while((m=re.exec(raw))) out[m[1]]=m[2];
    return out;
  }
  function buildOpenTag(tag,attrs){
    const a=Object.entries(attrs).map(([k,v])=>`${k}="${String(v).replace(/"/g,'&quot;')}"`).join(' ');
    return `[${tag}${a?' '+a:''}]`;
  }
  function addClass(attrs,name){
    const c=String(attrs.module_class||'').split(/\s+/).filter(Boolean);
    if(!c.includes(name)) c.push(name);
    attrs.module_class=c.join(' ');
  }
  function firstFont(value){return String(value||'Arial').split(',')[0].replace(/["']/g,'').trim()||'Arial';}
  function safeCss(value,fallback=''){const s=String(value??fallback).trim().replace(/[{}<>;]/g,'');return s||fallback;}
  function plainText(content=''){return String(content).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}

  DM.isDesignDisplayAttrs=(attrs={},content='')=>{
    const hint=`${attrs.module_class||''} ${attrs.admin_label||''}`.toLowerCase();
    const text=plainText(content),compact=text.length>0&&text.length<=26&&text.split(/\s+/).length<=3;
    if(/intro-number|editorial|oversize|oversized|giant|mega[-_ ]?word|big[-_ ]?word|display[-_ ]?word|wordmark/.test(hint)) return true;
    if(compact&&/(?:^|\s)(?:número|numero|nãºmero)(?:\s|$)/.test(hint)) return true;
    const large=Object.entries(attrs).some(([k,v])=>/font_size$/.test(k)&&!/_tablet$|_phone$/.test(k)&&(/^\d+(?:\.\d+)?px$/.test(v)&&Number(v.slice(0,-2))>80));
    return compact&&large;
  };

  function headingPrefix(level){return level===1?'header':`header_${level}`;}
  function belongsToHeading(key,level){return level===1?/^header_(?![2-6]_)/.test(key):new RegExp(`^header_${level}_`).test(key);}
  function copyHeadingAttrs(attrs,from,to){
    if(from===to)return;
    const fp=headingPrefix(from),tp=headingPrefix(to);
    for(const [key,value] of Object.entries({...attrs})){
      if(!belongsToHeading(key,from))continue;
      const target=`${tp}${key.slice(fp.length)}`;
      if(attrs[target]===undefined)attrs[target]=value;
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
      attrs.header_font=`${font}|${r.h1Weight}|||||||`;attrs.header_font_size=r.h1Size;attrs.header_font_size_phone=r.h1Mobile;attrs.header_font_size_last_edited='on|phone';attrs.header_line_height=`${r.h1Line}em`;attrs.header_letter_spacing=r.h1Letter;
    }
    if(levels.has(2)){
      attrs.header_2_font=`${font}|${r.h2Weight}|||||||`;attrs.header_2_font_size=r.h2Size;attrs.header_2_font_size_phone=r.h2Mobile;attrs.header_2_font_size_last_edited='on|phone';attrs.header_2_line_height=`${r.h2Line}em`;attrs.header_2_letter_spacing=r.h2Letter;
    }
    if(levels.has(3)){
      attrs.header_3_font=`${font}|${r.h3Weight}|||||||`;attrs.header_3_font_size=r.h3Size;
    }
    if(/kicker|eyebrow/.test(hint)){
      attrs.text_font=`${font}|${r.kickerWeight}|||||||`;attrs.text_font_size=r.kickerSize;attrs.text_letter_spacing=r.kickerLetter;
    }else if(/hero[-_ ]?lead|\blead\b/.test(hint)){
      attrs.text_font=`${font}|${r.leadWeight}|||||||`;attrs.text_font_size=r.leadSize;attrs.text_line_height=`${r.leadLine}em`;
    }else if(/<p\b|<li\b/i.test(content)){
      attrs.text_font=`${font}|${r.bodyWeight}|||||||`;attrs.text_font_size=r.bodySize;
    }
  }

  function normalizeTextModules(input,stats,applyClasses,rules){
    const state={first:true,seenH2:false},r={...DM.DEFAULT_TYPOGRAPHY,...(rules||{})};
    return String(input||'').replace(/\[et_pb_text([^\]]*)\]([\s\S]*?)\[\/et_pb_text\]/gi,(full,raw,originalContent)=>{
      const attrs=parseAttrs(raw),levels=new Set();
      const design=DM.isDesignDisplayAttrs(attrs,originalContent);
      const content=originalContent.replace(/<h([1-6])(\b[^>]*)>([\s\S]*?)<\/h\1>/gi,(heading,level,extra,body)=>{
        const from=Number(level),to=targetHeadingLevel(from,state);levels.add(to);
        if(from!==to){copyHeadingAttrs(attrs,from,to);stats.headings++;}
        return `<h${to}${extra}>${body}</h${to}>`;
      });

      if(applyClasses){
        const hint=`${attrs.module_class||''} ${attrs.admin_label||''}`.toLowerCase();
        if(design){
          addClass(attrs,'dm-design-display');
          stats.designProtected=(stats.designProtected||0)+1;
        }else{
          if(levels.has(1))addClass(attrs,'dm-typo-h1');
          if(levels.has(2))addClass(attrs,'dm-typo-h2');
          if(levels.has(3))addClass(attrs,'dm-typo-h3');
          if(/kicker|eyebrow/.test(hint))addClass(attrs,'dm-typo-kicker');
          else if(/hero[-_ ]?lead|\blead\b/.test(hint))addClass(attrs,'dm-typo-lead');
          else if(/<p\b|<li\b/i.test(content))addClass(attrs,'dm-typo-body');
          applyDiviTypography(attrs,levels,hint,content,r);
        }
      }
      return `${buildOpenTag('et_pb_text',attrs)}${content}[/et_pb_text]`;
    });
  }

  function force(cls,child=''){
    const base=`:is(#dm-typo-force-a,.${cls}):is(#dm-typo-force-b,.${cls})`;
    return child?`${base} ${child}`:base;
  }
  function cssFor(input){
    const r={...DM.DEFAULT_TYPOGRAPHY,...input},family=safeCss(r.family,DM.DEFAULT_TYPOGRAPHY.family);
    const h1w=safeCss(r.h1Weight,'600'),h1s=safeCss(r.h1Size,DM.DEFAULT_TYPOGRAPHY.h1Size),h1m=safeCss(r.h1Mobile,DM.DEFAULT_TYPOGRAPHY.h1Mobile),h1l=safeCss(r.h1Line,'0.9'),h1ls=safeCss(r.h1Letter,'-0.06em');
    const h2w=safeCss(r.h2Weight,'600'),h2s=safeCss(r.h2Size,DM.DEFAULT_TYPOGRAPHY.h2Size),h2m=safeCss(r.h2Mobile,DM.DEFAULT_TYPOGRAPHY.h2Mobile),h2l=safeCss(r.h2Line,'0.93'),h2ls=safeCss(r.h2Letter,'-0.06em');
    const leadw=safeCss(r.leadWeight,'400'),leads=safeCss(r.leadSize,'17px'),leadl=safeCss(r.leadLine,'1.55');
    const bodyw=safeCss(r.bodyWeight,'400'),bodys=safeCss(r.bodySize,'16px');
    const h3w=safeCss(r.h3Weight,'700'),h3s=safeCss(r.h3Size,'18px');
    const kw=safeCss(r.kickerWeight,'700'),ks=safeCss(r.kickerSize,'10px'),kls=safeCss(r.kickerLetter,'.17em');
    return `${force('dm-typo-h1','h1')}{font-family:${family}!important;font-weight:${h1w}!important;font-size:${h1s}!important;line-height:${h1l}!important;letter-spacing:${h1ls}!important;text-transform:uppercase!important}\n${force('dm-typo-h2','h2')}{font-family:${family}!important;font-weight:${h2w}!important;font-size:${h2s}!important;line-height:${h2l}!important;letter-spacing:${h2ls}!important;text-transform:uppercase!important}\n${force('dm-typo-h3','h3')}{font-family:${family}!important;font-weight:${h3w}!important;font-size:${h3s}!important}\n${force('dm-typo-lead')},${force('dm-typo-lead','p')}{font-family:${family}!important;font-weight:${leadw}!important;font-size:${leads}!important;line-height:${leadl}!important}\n${force('dm-typo-body')},${force('dm-typo-body','p')},${force('dm-typo-body','li')}{font-family:${family}!important;font-weight:${bodyw}!important;font-size:${bodys}!important}\n${force('dm-typo-kicker')},${force('dm-typo-kicker','*')}{font-family:${family}!important;font-weight:${kw}!important;font-size:${ks}!important;letter-spacing:${kls}!important;text-transform:uppercase!important}\n.dm-design-display h1,.dm-design-display h2,.dm-design-display h3{white-space:nowrap!important;word-break:normal!important;overflow-wrap:normal!important;max-width:100%!important}\n@media(max-width:767px){${force('dm-typo-h1','h1')}{font-size:${h1m}!important}${force('dm-typo-h2','h2')}{font-size:${h2m}!important}}`;
  }

  function typographyCode(css){return DM.shortcode('et_pb_code',{admin_label:'DM · Reglas tipográficas',module_class:'dm-typography-rules',_builder_version:K.builderVersion,global_colors_info:'{}'},`<style id="dm-typography-rules">${css}</style>`);}
  function upsertTypographyCss(input,css){
    const marker=/<style id="dm-typography-rules">[\s\S]*?<\/style>/i,style=`<style id="dm-typography-rules">${css}</style>`;
    if(marker.test(input))return input.replace(marker,style);
    const codeClose=input.indexOf('[/et_pb_code]');
    if(codeClose>=0)return input.slice(0,codeClose)+style+input.slice(codeClose);
    const colClose=input.indexOf('[/et_pb_column]');
    if(colClose>=0)return input.slice(0,colClose)+typographyCode(css)+input.slice(colClose);
    return input;
  }

  DM.applyHeadingAndTypography=(input,options={})=>{
    const stats=options.stats||{headings:0,typography:0,designProtected:0};
    let out=normalizeTextModules(input,stats,!!options.enabled,options.rules||{});
    if(options.enabled){out=upsertTypographyCss(out,cssFor(options.rules||{}));stats.typography++;}
    return{shortcodes:out,stats};
  };
})();