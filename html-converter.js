(() => {
  'use strict';
  const DM = window.DM, K = DM.K, $ = DM.$, $$ = DM.$$;
  const CAPTURE = ['display','position','flexDirection','gridTemplateColumns','gap','width','maxWidth','minWidth','height','maxHeight','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft','fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','textAlign','textTransform','color','backgroundColor','backgroundImage','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderTopColor','borderRadius','objectFit','boxShadow','justifyContent','alignItems'];

  function sanitizeHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    $$('script,noscript,iframe,object,embed', doc).forEach(n => n.remove());
    $$('*', doc).forEach((node, i) => {
      node.setAttribute('data-dm-id', String(i + 1));
      Array.from(node.attributes).forEach(attr => { if (/^on/i.test(attr.name)) node.removeAttribute(attr.name); });
    });
    return doc;
  }
  async function captureStyles(serialized, width) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox','allow-same-origin');
    iframe.style.cssText = `position:fixed;left:-30000px;top:0;width:${width}px;height:1800px;visibility:hidden;border:0`;
    document.body.appendChild(iframe);
    const loaded = new Promise(resolve => {
      let done = false;
      const finish = () => { if (done) return; done = true; setTimeout(resolve, 80); };
      iframe.addEventListener('load', finish, { once:true });
      setTimeout(finish, 700);
    });
    iframe.srcdoc = serialized;
    await loaded;
    const out = {};
    $$('[data-dm-id]', iframe.contentDocument).forEach(node => {
      const cs = iframe.contentWindow.getComputedStyle(node), obj = {};
      CAPTURE.forEach(p => obj[p] = cs[p]);
      out[node.getAttribute('data-dm-id')] = obj;
    });
    iframe.remove();
    return out;
  }
  const styleAt = (node,maps,kind='desktop') => maps[kind]?.[node.getAttribute('data-dm-id')] || {};
  const nodeChildren = node => Array.from(node?.children || []).filter(n => !['STYLE','LINK','META','TITLE'].includes(n.tagName));
  function isLayout(node,maps) {
    const s = styleAt(node,maps), c = String(node.className || '').toLowerCase();
    return s.display.includes('flex') || s.display.includes('grid') || /\b(container|row|grid|columns|cols|cards|features|services|wrapper|split|content)\b/.test(c);
  }
  function buttonLike(node,maps) {
    const tag=node.tagName.toLowerCase(); if(!['a','button'].includes(tag)) return false;
    const c=String(node.className||'').toLowerCase(), s=styleAt(node,maps);
    const pad=[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft].map(DM.pxNum).filter(v=>v!==null);
    return tag==='button' || /btn|button|cta|primary|secondary|whatsapp|contact|call|book|reserve/.test(c) || !!DM.meaningfulColor(s.backgroundColor) || pad.some(v=>v>=8);
  }
  const isContentNode = node => /^(H[1-6]|P|UL|OL|BLOCKQUOTE|IMG|A|BUTTON|DETAILS|FORM|HR|FIGURE)$/.test(node.tagName);
  function sectionNodes(doc) {
    const a=$$('main > section',doc); if(a.length) return a;
    const b=$$('body > section',doc); if(b.length) return b;
    const body=doc.body, direct=nodeChildren(body); if(direct.length>1) return direct;
    const main=$('main',doc); if(main) return nodeChildren(main).length ? nodeChildren(main) : [main];
    return body ? [body] : [];
  }
  function baseAttrs(style,tablet,phone,kind) {
    const a={_builder_version:K.builderVersion,global_colors_info:'{}'}, bg=DM.meaningfulColor(style.backgroundColor); if(bg)a.background_color=bg;
    if([style.paddingTop,style.paddingRight,style.paddingBottom,style.paddingLeft].some(v=>DM.pxNum(v))) DM.responsive(a,'custom_padding',DM.diviSpacing(style,'padding'),DM.diviSpacing(tablet,'padding'),DM.diviSpacing(phone,'padding'));
    if(!['section','row'].includes(kind) && [style.marginTop,style.marginRight,style.marginBottom,style.marginLeft].some(v=>(DM.pxNum(v)||0)!==0)) DM.responsive(a,'custom_margin',DM.diviSpacing(style,'margin'),DM.diviSpacing(tablet,'margin'),DM.diviSpacing(phone,'margin'));
    const radius=DM.pxNum(style.borderRadius); if(radius&&radius>0)a.border_radii=`on|${style.borderRadius}|${style.borderRadius}|${style.borderRadius}|${style.borderRadius}`;
    const bw=Math.max(...[style.borderTopWidth,style.borderRightWidth,style.borderBottomWidth,style.borderLeftWidth].map(v=>DM.pxNum(v)||0)); if(bw>0){a.border_width_all=`${bw}px`;const bc=DM.meaningfulColor(style.borderTopColor);if(bc)a.border_color_all=bc;}
    if(kind==='row'){a.width='90%';a.width_tablet='90%';a.width_phone='90%';a.width_last_edited='on|desktop';const mw=style.maxWidth&&style.maxWidth!=='none'?style.maxWidth:'';if(mw&&(DM.pxNum(mw)===null||DM.pxNum(mw)<=1600))a.max_width=mw;}
    const m=String(style.backgroundImage||'').match(/^url\(["']?(.*?)["']?\)$/); if(m)a.background_image=m[1];
    return a;
  }
  function textAttrs(node,maps) {
    const d=styleAt(node,maps),t=styleAt(node,maps,'tablet'),p=styleAt(node,maps,'phone'),a={_builder_version:K.builderVersion,global_colors_info:'{}'};
    const heading=/^h([1-6])$/.exec(node.tagName.toLowerCase()), prefix=heading?(heading[1]==='1'?'header':`header_${heading[1]}`):'text';
    a[`${prefix}_font`]=DM.fontValue(d); const color=DM.meaningfulColor(d.color);if(color)a[`${prefix}_text_color`]=color;
    DM.responsive(a,`${prefix}_font_size`,d.fontSize,t.fontSize,p.fontSize);DM.responsive(a,`${prefix}_line_height`,d.lineHeight,t.lineHeight,p.lineHeight);
    if(d.textAlign&&d.textAlign!=='start')a[heading?`${prefix}_text_align`:'text_text_align']=d.textAlign;
    if(d.letterSpacing&&d.letterSpacing!=='normal')a[`${prefix}_letter_spacing`]=d.letterSpacing;
    if([d.marginTop,d.marginRight,d.marginBottom,d.marginLeft].some(v=>(DM.pxNum(v)||0)!==0))DM.responsive(a,'custom_margin',DM.diviSpacing(d,'margin'),DM.diviSpacing(t,'margin'),DM.diviSpacing(p,'margin'));
    return a;
  }
  function buttonAttrs(node,maps) {
    const d=styleAt(node,maps),t=styleAt(node,maps,'tablet'),p=styleAt(node,maps,'phone');
    const a={button_text:(node.textContent||'Botón').trim(),button_url:node.getAttribute('href')||'#',url_new_window:node.getAttribute('target')==='_blank'?'on':'off',custom_button:'on',_builder_version:K.builderVersion,global_colors_info:'{}'};
    const color=DM.meaningfulColor(d.color),bg=DM.meaningfulColor(d.backgroundColor);if(color)a.button_text_color=color;if(bg)a.button_bg_color=bg;a.button_font=DM.fontValue(d);DM.responsive(a,'button_text_size',d.fontSize,t.fontSize,p.fontSize);
    const bw=DM.pxNum(d.borderTopWidth);if(bw!==null)a.button_border_width=`${bw}px`;const bc=DM.meaningfulColor(d.borderTopColor);if(bc)a.button_border_color=bc;const r=DM.pxNum(d.borderRadius);if(r!==null)a.button_border_radius=String(Math.round(r));
    return a;
  }
  function imageAttrs(node,maps) {
    const d=styleAt(node,maps),t=styleAt(node,maps,'tablet'),p=styleAt(node,maps,'phone');
    const a={src:node.getAttribute('src')||'',alt:node.getAttribute('alt')||'',title_text:node.getAttribute('title')||node.getAttribute('alt')||'',_builder_version:K.builderVersion,global_colors_info:'{}'};
    const mw=d.maxWidth&&d.maxWidth!=='none'?d.maxWidth:'';if(mw&&DM.pxNum(mw)&&DM.pxNum(mw)<1200)DM.responsive(a,'max_width',mw,t.maxWidth,p.maxWidth);else{a.max_width='100%';a.max_width_tablet='100%';a.max_width_phone='100%';a.max_width_last_edited='on|desktop';}
    const radius=DM.pxNum(d.borderRadius);if(radius&&radius>0)a.border_radii=`on|${d.borderRadius}|${d.borderRadius}|${d.borderRadius}|${d.borderRadius}`;a.align=d.marginLeft==='auto'&&d.marginRight==='auto'?'center':d.marginLeft==='auto'?'right':'left';return a;
  }
  function cleanNodeHtml(node){const clone=node.cloneNode(true);clone.removeAttribute?.('data-dm-id');$$('[data-dm-id]',clone).forEach(n=>n.removeAttribute('data-dm-id'));return clone.outerHTML||clone.innerHTML||'';}
  const textModule=(node,maps,html='')=>DM.shortcode('et_pb_text',textAttrs(node,maps),html||cleanNodeHtml(node));
  function renderForm(node){const fields=$$('input,textarea,select',node).filter(f=>!['submit','button','hidden'].includes((f.getAttribute('type')||'').toLowerCase())).map((f,i)=>DM.shortcode('et_pb_contact_field',{field_id:(f.getAttribute('name')||f.id||`field_${i+1}`).replace(/[^a-z0-9_]/gi,'_'),field_title:f.getAttribute('placeholder')||f.getAttribute('aria-label')||f.getAttribute('name')||`Campo ${i+1}`,field_type:f.tagName==='TEXTAREA'?'text':'input',required_mark:f.required?'on':'off',_builder_version:K.builderVersion,global_colors_info:'{}'},'')).join('\n');return DM.shortcode('et_pb_contact_form',{title:'Formulario',submit_button_text:'Enviar',_builder_version:K.builderVersion,global_colors_info:'{}'},`\n${fields}\n`);}
  function renderNode(node,maps,depth=0){if(!node||depth>18)return[];const tag=node.tagName.toLowerCase();if(/^h[1-6]$/.test(tag)||['p','ul','ol','blockquote'].includes(tag))return[textModule(node,maps)];if(tag==='img')return[DM.shortcode('et_pb_image',imageAttrs(node,maps),'')];if(['a','button'].includes(tag))return buttonLike(node,maps)?[DM.shortcode('et_pb_button',buttonAttrs(node,maps),'')]:[textModule(node,maps,`<p>${cleanNodeHtml(node)}</p>`)];if(tag==='details'){const summary=$('summary',node),clone=node.cloneNode(true);$('summary',clone)?.remove();return[DM.shortcode('et_pb_toggle',{title:(summary?.textContent||'').trim(),open:'off',_builder_version:K.builderVersion,global_colors_info:'{}'},clone.innerHTML)];}if(tag==='form')return[renderForm(node)];if(tag==='hr')return[DM.shortcode('et_pb_divider',{_builder_version:K.builderVersion,global_colors_info:'{}'},'')];return nodeChildren(node).flatMap(n=>renderNode(n,maps,depth+1));}
  function columnRoots(section,maps){let root=section,direct=nodeChildren(section);if(direct.length===1&&!isContentNode(direct[0]))root=direct[0];let kids=nodeChildren(root);if(kids.length===1&&isLayout(kids[0],maps)){root=kids[0];kids=nodeChildren(root);}const rs=styleAt(root,maps);if((rs.display.includes('flex')||rs.display.includes('grid'))&&kids.length>=2&&kids.length<=6)return{root,cols:kids};const group=kids.find(n=>isLayout(n,maps)&&nodeChildren(n).length>=2&&nodeChildren(n).length<=6);return group?{root:group,cols:nodeChildren(group)}:{root,cols:[root]};}
  const colType=count=>({1:'4_4',2:'1_2',3:'1_3',4:'1_4',5:'1_5',6:'1_6'})[count]||'4_4';
  DM.convertHtmlFile = async file => {
    const raw=await file.text(),doc=sanitizeHtml(raw),serialized='<!doctype html>\n'+doc.documentElement.outerHTML;
    const [desktop,tablet,phone]=await Promise.all([captureStyles(serialized,1440),captureStyles(serialized,900),captureStyles(serialized,390)]),maps={desktop,tablet,phone};let moduleCount=0;
    const sections=sectionNodes(doc).map(section=>{const{root,cols}=columnRoots(section,maps),type=colType(cols.length);const columns=cols.map(col=>{let modules=nodeChildren(col).flatMap(n=>renderNode(n,maps));if(!modules.length)modules=renderNode(col,maps);moduleCount+=modules.length;return DM.shortcode('et_pb_column',{type,...baseAttrs(styleAt(col,maps),styleAt(col,maps,'tablet'),styleAt(col,maps,'phone'),'column')},`\n${modules.join('\n')}\n`);}).join('\n');const row=DM.shortcode('et_pb_row',{column_structure:Array(cols.length).fill(type).join(','),...baseAttrs(styleAt(root,maps),styleAt(root,maps,'tablet'),styleAt(root,maps,'phone'),'row')},`\n${columns}\n`);return DM.shortcode('et_pb_section',{fb_built:'1',...baseAttrs(styleAt(section,maps),styleAt(section,maps,'tablet'),styleAt(section,maps,'phone'),'section')},`\n${row}\n`);}).filter(Boolean);
    if(!sections.length)throw new Error('No se ha podido detectar contenido convertible en el HTML.');const shortcodes=sections.join('\n\n');if(shortcodes.includes('[et_pb_code'))throw new Error('La conversión ha generado un módulo Code.');return{json:{context:'et_builder',data:{[K.importId]:shortcodes},presets:{},images:{}},sections:sections.length,modules:moduleCount};
  };
})();
