/* Access gate: default key + user-changeable local key. */
(function(){
  const STORAGE_KEY='divi-manager-custom-access-key';
  const DEFAULT_KEY='divi-manager';

  function cfg(){return window.DIVI_MANAGER_CONFIG||{};}
  function currentKey(){
    try{return localStorage.getItem(STORAGE_KEY)||cfg().accessKey||DEFAULT_KEY}catch(e){return cfg().accessKey||DEFAULT_KEY}
  }
  function setKey(value){
    const key=String(value||'').trim();
    if(!key) return false;
    try{localStorage.setItem(STORAGE_KEY,key)}catch(e){}
    return true;
  }
  function resetKey(){try{localStorage.removeItem(STORAGE_KEY)}catch(e){}}
  function unlock(){
    const accessScreen=document.getElementById('access-screen');
    const appScreen=document.getElementById('app-screen');
    const accessError=document.getElementById('access-error');
    if(accessError) accessError.hidden=true;
    if(accessScreen) accessScreen.hidden=true;
    if(appScreen) appScreen.hidden=false;
    try{sessionStorage.setItem('divi-manager-unlocked','1')}catch(e){}
    injectKeyPanel();
  }
  function isAllowed(value){
    const v=String(value||'').trim();
    const c=cfg();
    return [currentKey(),c.accessKey,DEFAULT_KEY].filter(Boolean).includes(v);
  }

  document.addEventListener('submit',function(e){
    const form=e.target;
    if(!form || form.id!=='access-form') return;
    const input=document.getElementById('access-key');
    if(isAllowed(input&&input.value)){
      e.preventDefault();
      e.stopImmediatePropagation();
      unlock();
    }
  },true);

  function injectKeyPanel(){
    if(document.getElementById('key-change-panel')) return;
    const host=document.querySelector('.header-actions')||document.querySelector('.app-header');
    if(!host) return;
    const panel=document.createElement('div');
    panel.id='key-change-panel';
    panel.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-left:8px';
    panel.innerHTML='<input id="new-access-key" type="text" placeholder="Nueva clave" style="height:42px;border:1px solid #e2e8f0;border-radius:999px;padding:0 14px;max-width:170px"><button id="save-access-key" type="button" class="ghost">Cambiar clave</button><button id="reset-access-key" type="button" class="ghost">Restaurar</button><span id="key-change-status" class="mini" style="min-width:80px"></span>';
    host.appendChild(panel);
    const input=panel.querySelector('#new-access-key');
    const status=panel.querySelector('#key-change-status');
    panel.querySelector('#save-access-key').addEventListener('click',function(){
      if(setKey(input.value)){
        status.textContent='Clave guardada';
        input.value='';
      }else{
        status.textContent='Introduce clave';
      }
    });
    panel.querySelector('#reset-access-key').addEventListener('click',function(){
      resetKey();
      status.textContent='Restaurada';
    });
  }

  window.DIVI_MANAGER_ACCESS={currentKey,setKey,resetKey,unlock};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{if(sessionStorage.getItem('divi-manager-unlocked')==='1') injectKeyPanel();});
  else if(sessionStorage.getItem('divi-manager-unlocked')==='1') injectKeyPanel();
})();
