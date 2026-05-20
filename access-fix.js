/* Access gate: default key + user-changeable local key + load skeleton fix + exact preview + CSS embedded exports. */
(function(){
  const STORAGE_KEY='divi-manager-custom-access-key';
  const DEFAULT_KEY='divi-manager';
  function cfg(){return window.DIVI_MANAGER_CONFIG||{};}
  function currentKey(){try{return localStorage.getItem(STORAGE_KEY)||cfg().accessKey||DEFAULT_KEY}catch(e){return cfg().accessKey||DEFAULT_KEY}}
  function setKey(value){const key=String(value||'').trim();if(!key)return false;try{localStorage.setItem(STORAGE_KEY,key)}catch(e){}return true;}
  function resetKey(){try{localStorage.removeItem(STORAGE_KEY)}catch(e){}}
  function unlock(){
    const a=document.getElementById('access-screen'),b=document.getElementById('app-screen'),er=document.getElementById('access-error');
    if(er)er.hidden=true;if(a)a.hidden=true;if(b)b.hidden=false;try{sessionStorage.setItem('divi-manager-unlocked','1')}catch(e){}injectKeyPanel();
  }
  function isAllowed(value){const v=String(value||'').trim(),c=cfg();return [currentKey(),c.accessKey,DEFAULT_KEY].filter(Boolean).includes(v);}
  document.addEventListener('submit',function(e){
    const form=e.target;if(!form||form.id!=='access-form')return;const input=document.getElementById('access-key');
    if(isAllowed(input&&input.value)){e.preventDefault();e.stopImmediatePropagation();unlock();}
  },true);
  function injectKeyPanel(){
    if(document.getElementById('key-change-panel'))return;const host=document.querySelector('.header-actions')||document.querySelector('.app-header');if(!host)return;
    const panel=document.createElement('div');panel.id='key-change-panel';panel.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-left:8px';
    panel.innerHTML='<input id="new-access-key" type="text" placeholder="Nueva clave" style="height:42px;border:1px solid #e2e8f0;border-radius:999px;padding:0 14px;max-width:170px"><button id="save-access-key" type="button" class="ghost">Cambiar clave</button><button id="reset-access-key" type="button" class="ghost">Restaurar</button><span id="key-change-status" class="mini" style="min-width:80px"></span>';
    host.appendChild(panel);const input=panel.querySelector('#new-access-key'),status=panel.querySelector('#key-change-status');
    panel.querySelector('#save-access-key').addEventListener('click',function(){if(setKey(input.value)){status.textContent='Clave guardada';input.value='';}else status.textContent='Introduce clave';});
    panel.querySelector('#reset-access-key').addEventListener('click',function(){resetKey();status.textContent='Restaurada';});
  }
  function loadSkeletonFix(){
    if(document.querySelector('script[data-skeleton-preview-fix]'))return;
    const s=document.createElement('script');s.src='skeleton-preview-fix.js?v=2';s.dataset.skeletonPreviewFix='1';document.body.appendChild(s);
  }
  function applyExactPreviewFix(){
    if(window.__exactPreviewFixed)return;
    if(typeof window.convertHtml!=='function')return;
    window.__exactPreviewFixed=true;
    const previous=window.convertHtml;
    window.convertHtml=function(html,mode){
      const result=previous(html,mode);
      result.previewHtml=html;
      result.original=result.original||{};
      result.original.html=html;
      result.original.previewHtml=html;
      return result;
    };
  }
  function esc(v){return String(v||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function safeName(){try{return baseName()}catch(e){return 'divi-layout'}}
  function save(name,content,type){const blob=new Blob([content||''],{type:type||'text/plain'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)}
  function cssSection(){
    let css='';try{css=state.result&&state.result.css||''}catch(e){}
    if(!css)return'';
    return '[et_pb_section fb_built="1" _builder_version="4.27.0" global_colors_info="{}"]\n[et_pb_row _builder_version="4.27.0" global_colors_info="{}"]\n[et_pb_column type="4_4" _builder_version="4.27.0" global_colors_info="{}"]\n[et_pb_code _builder_version="4.27.0" global_colors_info="{}"]<style id="divi-manager-inline-css">\n'+css+'\n</style>[/et_pb_code]\n[/et_pb_column]\n[/et_pb_row]\n[/et_pb_section]\n\n';
  }
  function shortcodesWithCss(){
    let s='';try{s=state.result&&state.result.shortcodes||''}catch(e){}
    if(!s)return'';
    if(s.indexOf('divi-manager-inline-css')!==-1)return s;
    return cssSection()+s;
  }
  function jsonWithCss(){return{context:'et_builder',data:{'100001':shortcodesWithCss()},presets:{},images:{}}}
  function patchOutputTabs(){
    if(window.__cssExportTabsFixed||typeof window.setOutputTab!=='function')return;
    window.__cssExportTabsFixed=true;
    const prev=window.setOutputTab;
    window.setOutputTab=function(tab){prev(tab);try{if(!state.result)return;if(tab==='shortcodes')outputCode.value=shortcodesWithCss();if(tab==='json')outputCode.value=JSON.stringify(jsonWithCss(),null,2)}catch(e){}};
  }
  const enc=new TextEncoder();
  const table=(()=>{let c,t=[];for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
  const crc=d=>{let c=0xffffffff;for(let i=0;i<d.length;i++)c=table[(c^d[i])&255]^(c>>>8);return(c^0xffffffff)>>>0};
  const u16=n=>[n&255,(n>>>8)&255],u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
  function makeZip(files){let local=[],central=[],offset=0;for(const f of files){const name=enc.encode(f.name),data=enc.encode(f.content||''),cr=crc(data),head=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(cr),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...name]);local.push(new Uint8Array([...head,...data]));central.push(new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(cr),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset),...name]));offset+=head.length+data.length}const csize=central.reduce((a,b)=>a+b.length,0),end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(csize),...u32(offset),...u16(0)]);return new Blob([...local,...central,end],{type:'application/zip'})}
  function downloadZipWithCss(){
    let r;try{r=state.result}catch(e){} if(!r)return;
    const originalHtml=state.originalHtml||r.original?.html||'';
    const files=[
      {name:'original/original.html',content:originalHtml},
      {name:'original/original.css',content:r.original?.css||r.css||''},
      {name:'original/original.txt',content:r.original?.text||''},
      {name:'original/original-preview.html',content:originalHtml},
      {name:'generado/divi-shortcodes.txt',content:shortcodesWithCss()},
      {name:'generado/divi.json',content:JSON.stringify(jsonWithCss(),null,2)},
      {name:'generado/generated.css',content:r.css||''},
      {name:'generado/generated-preview.html',content:originalHtml}
    ];
    const url=URL.createObjectURL(makeZip(files)),a=document.createElement('a');a.href=url;a.download=safeName()+'.original-y-divi.zip';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  }
  window.addEventListener('click',function(e){
    const j=e.target&&e.target.closest&&e.target.closest('#download-json');
    const s=e.target&&e.target.closest&&e.target.closest('#download-shortcodes');
    const z=e.target&&e.target.closest&&e.target.closest('#download-zip');
    if(!j&&!s&&!z)return;
    try{if(!state.result)return;}catch(err){return;}
    e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
    if(j)save(safeName()+'.divi.json',JSON.stringify(jsonWithCss(),null,2),'application/json');
    if(s)save(safeName()+'.divi-shortcodes.txt',shortcodesWithCss(),'text/plain');
    if(z)downloadZipWithCss();
  },true);
  window.DIVI_MANAGER_ACCESS={currentKey,setKey,resetKey,unlock};
  function boot(){if(sessionStorage.getItem('divi-manager-unlocked')==='1')injectKeyPanel();loadSkeletonFix();setTimeout(applyExactPreviewFix,150);setTimeout(applyExactPreviewFix,700);setTimeout(patchOutputTabs,250);setTimeout(patchOutputTabs,900);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();