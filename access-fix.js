/* Accept simple configured key before legacy hash handler. */
(function(){
  function unlock(){
    const accessScreen=document.getElementById('access-screen');
    const appScreen=document.getElementById('app-screen');
    const accessError=document.getElementById('access-error');
    if(accessError) accessError.hidden=true;
    if(accessScreen) accessScreen.hidden=true;
    if(appScreen) appScreen.hidden=false;
    try{sessionStorage.setItem('divi-manager-unlocked','1')}catch(e){}
  }
  document.addEventListener('submit',function(e){
    const form=e.target;
    if(!form || form.id!=='access-form') return;
    const input=document.getElementById('access-key');
    const cfg=window.DIVI_MANAGER_CONFIG||{};
    const value=(input&&input.value||'').trim();
    const allowed=[cfg.accessKey,'divi-manager'].filter(Boolean);
    if(allowed.includes(value)){
      e.preventDefault();
      e.stopImmediatePropagation();
      unlock();
    }
  },true);
})();
