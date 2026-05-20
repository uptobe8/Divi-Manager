/* Divi Manager native fixes over 611559f: body-direct sections, native fallback, grid columns, ZIP. */
(function(){
  const V='4.27.0';
  const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
  const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const strip=s=>norm(String(s||'').replace(/<[^>]*>/g,' '));
  const tag=n=>n&&n.tagName?n.tagName.toLowerCase():'';
  const classes=n=>Array.from(n&&n.classList?n.classList:[]);
  const cls=n=>classes(n).join(' ').toLowerCase();
  const skip=n=>!n||!n.tagName||['script','style','link','meta','title','noscript'].includes(tag(n));
  const isBtn=n=>['a','button'].includes(tag(n))&&(((n.getAttribute('role')||'').toLowerCase()==='button')||/btn|button|cta|primary|secondary|ghost|soft|green|whatsapp|call|moment|link-button/.test(cls(n)));
  const isCard=n=>/card|feature|service|item|box|tile|benefit|package|product|review|step|kpi|option|metric|cat-card|blog-card|trust-pill|notice|buybox/.test(cls(n));
  const isLayout=n=>/container|split|grid-2|grid-3|grid-4|hero-grid|hero-inner|hero-actions|trust-row|visual-overlay|section-head|steps|kpi-strip|footer-grid|moment-contact-bar|banner|faq|comparison/.test(cls(n));
  const kids=n=>Array.from(n&&n.children?n.children:[]).filter(x=>!skip(x));
  const text=(html,label)=>({type:'text',html:String(html||'').trim(),tag:'text',label:label||strip(html).slice(0,90)||'Texto'});
  const img=n=>({type:'image',src:n.getAttribute('src')||'',alt:n.getAttribute('alt')||'',title:n.getAttribute('title')||n.getAttribute('alt')||'',classes:classes(n),label:n.getAttribute('alt')||'Imagen'});
  const btn=n=>({type:'button',text:norm(n.textContent||'Botón'),url:n.getAttribute('href')||'#',target:n.getAttribute('target')||'',classes:classes(n),label:norm(n.textContent||'Botón')});
  const divider=()=>({type:'divider',label:'Divider'});
  const code=n=>({type:'code',html:(n.outerHTML||'').trim(),label:'Code Module'});
  const fallback=(n,mode)=>mode==='visual'?code(n):text(n.outerHTML||n.innerHTML||n.textContent||'','HTML en Text Module');
  function blurb(n){const h=n.querySelector('h1,h2,h3,h4,h5,h6,strong'), im=n.querySelector('img'), c=n.cloneNode(true); c.querySelector('h1,h2,h3,h4,h5,h6,strong')?.remove(); c.querySelector('img')?.remove(); const title=norm((h&&h.textContent)||n.textContent||'').slice(0,90)||'Blurb'; return{type:'blurb',title,image:im?im.getAttribute('src')||'':'',body:(c.innerHTML||'').trim(),classes:classes(n),label:title};}
  function toggle(n){const h=n.querySelector('summary,h3,h4,h5,strong'), c=n.cloneNode(true); c.querySelector('summary,h3,h4,h5,strong')?.remove(); const title=norm((h&&h.textContent)||'Pregunta'); return{type:'toggle',title,body:(c.innerHTML||'').trim()||'<p></p>',label:title};}
  function form(n){const fields=Array.from(n.querySelectorAll('input,textarea,select')).filter(f=>!['submit','button','hidden'].includes((f.getAttribute('type')||'').toLowerCase())).map((f,i)=>({id:(f.getAttribute('name')||f.getAttribute('id')||`field_${i+1}`).replace(/[^a-z0-9_]/gi,'_'),title:f.getAttribute('placeholder')||f.getAttribute('name')||f.getAttribute('id')||`Campo ${i+1}`,type:tag(f)==='textarea'?'text':'input'})); return{type:'contact_form',title:'Formulario',fields:fields.length?fields:[{id:'name',title:'Nombre',type:'input'},{id:'phone',title:'Teléfono',type:'input'}],label:'Contact Form'};}
  function mods(root,mode='balanced',depth=0){
    if(mode==='visual')return[code(root)];
    const out=[];
    for(const n of kids(root)){
      const t=tag(n);
      if(t==='hr'){out.push(divider());continue}
      if(t==='details'){out.push(toggle(n));continue}
      if(t==='form'){out.push(form(n));continue}
      if(isBtn(n)){out.push(btn(n));continue}
      if(t==='img'){out.push(img(n));continue}
      if(['h1','h2','h3','h4','h5','h6','p','ul','ol','blockquote','span','strong'].includes(t)){out.push(text(n.outerHTML||n.textContent||'',norm(n.textContent||'').slice(0,90)));continue}
      if(n.children.length===1&&tag(n.children[0])==='img'){out.push(img(n.children[0]));continue}
      if(isLayout(n)&&depth<12){const m=mods(n,mode,depth+1);if(m.length){out.push(...m);continue}}
      if(isCard(n)&&mode!=='editable'){
        if(n.querySelector('a.btn,button,.btn')){const m=mods(n,mode,depth+1);if(m.length){out.push(...m);continue}}
        out.push(blurb(n));continue
      }
      const directBtns=Array.from(n.children||[]).filter(isBtn);
      if(directBtns.length&&norm(n.textContent||'').length<320){const c=n.cloneNode(true);Array.from(c.querySelectorAll('a,button')).forEach(x=>x.remove());const tx=norm(c.textContent||'');if(tx)out.push(text(`<p>${esc(tx)}</p>`,tx.slice(0,90)));directBtns.forEach(b=>out.push(btn(b)));continue}
      const nested=n.querySelectorAll('h1,h2,h3,h4,h5,h6,p,ul,ol,a,button,img,details,form,hr,span,strong').length;
      if(nested>0&&depth<12){const m=mods(n,mode,depth+1);if(m.length){out.push(...m);continue}}
      out.push(fallback(n,mode));
    }
    return out.length?out:[fallback(root,mode)];
  }
  function colCount(n){const c=cls(n); if(/grid-4|footer-grid|kpi-strip/.test(c))return 4; if(/grid-3|steps|trust-row/.test(c))return 3; if(/grid-2|split|hero-grid|hero-inner|hero-actions|visual-overlay|moment-contact-bar|banner|section-head/.test(c))return 2; return 1;}
  const colType=n=>n===2?'1_2':n===3?'1_3':n>=4?'1_4':'4_4';
  function oneRow(ms){const rowMods=ms.map(m=>({...m,column:1}));return{columns:1,columnsData:[{type:'4_4',modules:rowMods}],modules:rowMods};}
  function gridRow(n,mode){let children=kids(n);if(classes(n).includes('container')&&children.length===1&&isLayout(children[0]))return gridRow(children[0],mode);const count=Math.min(Math.max(colCount(n),1),4);if(!children.length)children=[n];const cols=children.slice(0,count).map(ch=>mods(ch,mode,0));children.slice(count).forEach(ch=>cols[cols.length-1].push(...mods(ch,mode,0)));const columnsData=cols.map((ms,i)=>({type:colType(cols.length),modules:ms.map(m=>({...m,column:i+1}))}));return{columns:columnsData.length,columnsData,modules:columnsData.flatMap(c=>c.modules)};}
  function rows(sec,mode){if(mode==='visual')return[oneRow([code(sec)])];if(isLayout(sec))return[gridRow(sec,mode)];const out=[];for(const n of kids(sec)){const k=kids(n);if(classes(n).includes('container')&&k.length===1&&isLayout(k[0])){out.push(gridRow(k[0],mode));continue}if(isLayout(n)){out.push(gridRow(n,mode));continue}if(k.some(isLayout)){k.forEach(ch=>out.push(isLayout(ch)?gridRow(ch,mode):oneRow(mods(ch,mode,0))));continue}out.push(oneRow(mods(n,mode,0)));}return out.length?out:[oneRow(mods(sec,mode,0))];}
  function css(doc){const inline=Array.from(doc.querySelectorAll('style')).map(n=>n.textContent||'').filter(Boolean), external=Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(n=>`/* External CSS: ${n.getAttribute('href')} */`);return[...inline,...external].join('\n\n');}
  function sections(doc){const direct=Array.from(doc.body?.children||[]).filter(n=>!skip(n));if(direct.length)return direct;const main=doc.querySelector('main');return main?[main]:(doc.body?[doc.body]:[]);}
  const attrs=o=>Object.entries(o).filter(([,v])=>v!==undefined&&v!==null&&v!=='').map(([k,v])=>`${k}="${esc(v)}"`).join(' ');
  const sc=(t,a={},c='')=>`[${t}${attrs(a)?' '+attrs(a):''}]${c}[/${t}]`;
  function modSC(m){
    if(m.type==='text')return sc('et_pb_text',{_builder_version:V,global_colors_info:'{}'},m.html||'');
    if(m.type==='button')return sc('et_pb_button',{button_url:m.url||'#',url_new_window:m.target==='_blank'?'on':'off',button_text:m.text||'Botón',_builder_version:V,global_colors_info:'{}'},'');
    if(m.type==='image')return sc('et_pb_image',{src:m.src||'',alt:m.alt||'',title_text:m.title||m.alt||'',_builder_version:V,global_colors_info:'{}'},'');
    if(m.type==='blurb')return sc('et_pb_blurb',{title:m.title||'',image:m.image||'',_builder_version:V,global_colors_info:'{}'},m.body||'');
    if(m.type==='toggle')return sc('et_pb_toggle',{title:m.title||'',open:'off',_builder_version:V,global_colors_info:'{}'},m.body||'');
    if(m.type==='divider')return sc('et_pb_divider',{_builder_version:V,global_colors_info:'{}'},'');
    if(m.type==='contact_form'){const fs=m.fields.map(f=>sc('et_pb_contact_field',{field_id:f.id,field_title:f.title,field_type:f.type,required_mark:'on',_builder_version:V,global_colors_info:'{}'},'')).join('\n');return sc('et_pb_contact_form',{email:'',title:m.title||'',submit_button_text:'Enviar',_builder_version:V,global_colors_info:'{}'},`\n${fs}\n`)}
    return sc('et_pb_code',{_builder_version:V,global_colors_info:'{}'},m.html||'');
  }
  function shortcodes(layout){return layout.sections.map(s=>sc('et_pb_section',{fb_built:'1',_builder_version:V,global_colors_info:'{}'},`\n${s.rows.map(r=>{const cs=r.columnsData?.length?r.columnsData:[{type:'4_4',modules:r.modules||[]}];return sc('et_pb_row',{_builder_version:V,global_colors_info:'{}'},`\n${cs.map(c=>sc('et_pb_column',{type:c.type||colType(cs.length),_builder_version:V,global_colors_info:'{}'},`\n${(c.modules||[]).map(modSC).join('\n')}\n`)).join('\n')}\n`)}).join('\n')}\n`)).join('\n\n')}
  function prev(m){if(m.type==='text')return m.html||'';if(m.type==='button')return`<p><a class="dm-button" href="${esc(m.url||'#')}">${esc(m.text||'Botón')}</a></p>`;if(m.type==='image')return`<img src="${esc(m.src||'')}" alt="${esc(m.alt||'')}">`;if(m.type==='blurb')return`<article class="dm-blurb">${m.image?`<img src="${esc(m.image)}" alt="">`:''}<h3>${esc(m.title||'')}</h3><div>${m.body||''}</div></article>`;if(m.type==='toggle')return`<details><summary>${esc(m.title||'')}</summary>${m.body||''}</details>`;if(m.type==='divider')return'<hr>';if(m.type==='contact_form')return`<form>${m.fields.map(f=>`<input placeholder="${esc(f.title)}">`).join('')}<button>Enviar</button></form>`;return m.html||'';}
  function preview(layout,style){const body=layout.sections.map(s=>`<section id="${esc(s.id)}" class="${esc(['dm-section',...(s.classes||[])].join(' '))}">${s.rows.map(r=>{const cs=r.columnsData?.length?r.columnsData:[{modules:r.modules||[]}];return`<div class="dm-row">${cs.map(c=>`<div class="dm-preview-col">${(c.modules||[]).map(prev).join('\n')}</div>`).join('\n')}</div>`}).join('\n')}</section>`).join('\n');return`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${style||''}\n.dm-section{padding:48px 24px}.dm-row{max-width:1180px;margin:auto;display:flex;gap:24px}.dm-preview-col{flex:1;min-width:0}.dm-button{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:13px 18px;background:#ff5a1f;color:#fff;text-decoration:none;font-weight:900}.dm-blurb{border:1px solid #e9edf1;border-radius:22px;padding:20px;background:#fff;margin:12px 0}.dm-blurb img{max-width:100%;height:auto;display:block;margin-bottom:14px}@media(max-width:760px){.dm-row{display:block}}</style></head><body>${body}</body></html>`}
  window.convertHtml=function(html,mode='balanced'){const doc=new DOMParser().parseFromString(html,'text/html'),style=css(doc),title=norm(doc.querySelector('title')?.textContent||state.fileName||'Divi Layout');const layout={version:'0.2.0-native-fix',title,fileName:state.fileName,mode,generatedAt:new Date().toISOString(),sections:sections(doc).map((s,i)=>({id:s.id||`section-${i+1}`,tag:tag(s),classes:classes(s),rows:rows(s,mode)})).filter(s=>s.rows.some(r=>r.modules.length))};const sh=shortcodes(layout);return{layout,css:style,shortcodes:sh,diviJson:{context:'et_builder',data:{'100001':sh},presets:{},images:{}},previewHtml:preview(layout,style),original:{html,css:style,text:strip(doc.body?.innerHTML||html),previewHtml:html}}};
  window.setOutputTab=function(tab){state.activeTab=tab;document.querySelectorAll('.tab').forEach(i=>i.classList.toggle('active',i.dataset.tab===tab));if(!state.result)return;if(tab==='shortcodes')outputCode.value=state.result.shortcodes;if(tab==='json')outputCode.value=JSON.stringify(state.result.diviJson,null,2);if(tab==='css')outputCode.value=state.result.css||'/* No se ha detectado CSS */'};
  const enc=new TextEncoder(), table=(()=>{let c,t=[];for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
  const crc=d=>{let c=0xffffffff;for(let i=0;i<d.length;i++)c=table[(c^d[i])&255]^(c>>>8);return(c^0xffffffff)>>>0}, u16=n=>[n&255,(n>>>8)&255], u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
  function makeZip(files){let local=[],central=[],offset=0;for(const f of files){const name=enc.encode(f.name),data=enc.encode(f.content||''),cr=crc(data),head=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(cr),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...name]);local.push(new Uint8Array([...head,...data]));central.push(new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(cr),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset),...name]));offset+=head.length+data.length}const csize=central.reduce((a,b)=>a+b.length,0),end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(csize),...u32(offset),...u16(0)]);return new Blob([...local,...central,end],{type:'application/zip'})}
  function downloadZip(){if(!state.result)return;const r=state.result,files=[{name:'original/original.html',content:state.originalHtml||''},{name:'original/original.css',content:r.original?.css||r.css||''},{name:'original/original.txt',content:r.original?.text||''},{name:'original/original-preview.html',content:r.original?.previewHtml||state.originalHtml||''},{name:'generado/divi-shortcodes.txt',content:r.shortcodes||''},{name:'generado/divi.json',content:JSON.stringify(r.diviJson,null,2)},{name:'generado/generated.css',content:r.css||''},{name:'generado/generated-preview.html',content:r.previewHtml||''}];const url=URL.createObjectURL(makeZip(files)),a=document.createElement('a');a.href=url;a.download=`${baseName()}.original-y-divi.zip`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)}
  document.addEventListener('click',e=>{const zip=e.target.closest('#download-zip');if(zip){e.preventDefault();e.stopImmediatePropagation();downloadZip();return}const json=e.target.closest('#download-json');if(json&&state.result?.diviJson){e.preventDefault();e.stopImmediatePropagation();downloadText(`${baseName()}.divi.json`,JSON.stringify(state.result.diviJson,null,2),'application/json')}},true);
})();
