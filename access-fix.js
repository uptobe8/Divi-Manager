/* Access + key change + skeleton + honest preview + CSS in JSON. */
(function(){
  const STORE='divi-manager-custom-access-key', DEF='divi-manager';
  const $=id=>document.getElementById(id);
  const cfg=()=>window.DIVI_MANAGER_CONFIG||{};
  const key=()=>{try{return localStorage.getItem(STORE)||cfg().accessKey||DEF}catch(e){return cfg().accessKey||DEF}};
  const saveKey=v=>{v=String(v||'').trim(); if(!v)return false; try{localStorage.setItem(STORE,v)}catch(e){} return true};
  const resetKey=()=>{try{localStorage.removeItem(STORE)}catch(e){}};
  function unlock(){const a=$('access-screen'),b=$('app-screen'),er=$('access-error'); if(er)er.hidden=true; if(a)a.hidden=true; if(b)b.hidden=false; try{sessionStorage.setItem('divi-manager-unlocked','1')}catch(e){} panel();}
  document.addEventListener('submit',e=>{if(e.target?.id!=='access-form')return; const v=String($('access-key')?.value||'').trim(); const ok=[key(),cfg().accessKey,DEF].filter(Boolean).includes(v); if(ok){e.preventDefault();e.stopImmediatePropagation();unlock();}},true);
  function panel(){if($('key-change-panel'))return; const host=document.querySelector('.header-actions')||document.querySelector('.app-header'); if(!host)return; const p=document.createElement('div'); p.id='key-change-panel'; p.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-left:8px'; p.innerHTML='<input id="new-access-key" type="text" placeholder="Nueva clave" style="height:42px;border:1px solid #e2e8f0;border-radius:999px;padding:0 14px;max-width:170px"><button id="save-access-key" type="button" class="ghost">Cambiar clave</button><button id="reset-access-key" type="button" class="ghost">Restaurar</button><span id="key-change-status" class="mini"></span>'; host.appendChild(p); const st=p.querySelector('#key-change-status'),inp=p.querySelector('#new-access-key'); p.querySelector('#save-access-key').onclick=()=>{st.textContent=saveKey(inp.value)?'Clave guardada':'Introduce clave'; inp.value=''}; p.querySelector('#reset-access-key').onclick=()=>{resetKey();st.textContent='Restaurada'};}
  function loadSkeleton(){if(document.querySelector('script[data-skeleton-preview-fix]'))return; const s=document.createElement('script'); s.src='skeleton-preview-fix.js?v=2'; s.dataset.skeletonPreviewFix='1'; document.body.appendChild(s);}
  function cssBlock(){let css=''; try{css=state.result?.css||''}catch(e){} if(!css)return ''; return '[et_pb_section fb_built="1" _builder_version="4.27.0" global_colors_info="{}"]\n[et_pb_row _builder_version="4.27.0" global_colors_info="{}"]\n[et_pb_column type="4_4" _builder_version="4.27.0" global_colors_info="{}"]\n[et_pb_code _builder_version="4.27.0" global_colors_info="{}"]<style id="divi-manager-inline-css">\n'+css+'\n</style>[/et_pb_code]\n[/et_pb_column]\n[/et_pb_row]\n[/et_pb_section]\n\n';}
  function scCss(){let s=''; try{s=state.result?.shortcodes||''}catch(e){} return s.includes('divi-manager-inline-css')?s:cssBlock()+s;}
  function jsonCss(){return {context:'et_builder',data:{'100001':scCss()},presets:{},images:{}}}
  function fname(){try{return baseName()}catch(e){return 'divi-layout'}}
  function dl(n,c,t){const b=new Blob([c||''],{type:t||'text/plain'}),u=URL.createObjectURL(b),a=document.createElement('a'); a.href=u; a.download=n; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(u);}
  function honest(){try{if(state.result?.previewHtml&&createdPreview)createdPreview.srcdoc=state.result.previewHtml}catch(e){}}
  function patch(){
    panel(); loadSkeleton();
    const btn=$('convert-btn'); if(btn&&!btn.dataset.honest){btn.dataset.honest='1'; btn.addEventListener('click',()=>{setTimeout(honest,0);setTimeout(honest,150);setTimeout(honest,600)},false);}
    if(!window.__cssTabs&&typeof window.setOutputTab==='function'){window.__cssTabs=1; const prev=window.setOutputTab; window.setOutputTab=function(tab){prev(tab); try{if(!state.result)return; if(tab==='shortcodes')outputCode.value=scCss(); if(tab==='json')outputCode.value=JSON.stringify(jsonCss(),null,2)}catch(e){}};}
  }
  window.addEventListener('click',e=>{const j=e.target?.closest?.('#download-json'),s=e.target?.closest?.('#download-shortcodes'); if(!j&&!s)return; try{if(!state.result)return}catch(x){return} e.preventDefault(); e.stopImmediatePropagation(); if(j)dl(fname()+'.divi.json',JSON.stringify(jsonCss(),null,2),'application/json'); if(s)dl(fname()+'.divi-shortcodes.txt',scCss(),'text/plain');},true);
  window.DIVI_MANAGER_ACCESS={currentKey:key,setKey:saveKey,resetKey,unlock};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{patch();setTimeout(patch,500);}); else {patch();setTimeout(patch,500);}
})();