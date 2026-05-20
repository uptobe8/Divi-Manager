/* Third view only: Divi skeleton / sections / rows / columns / modules. */
(function(){
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function getState(){try{if(typeof state!=='undefined')return state}catch(e){}return window.state||null}
  function name(t){return {text:'Text Module',button:'Button Module',image:'Image Module',blurb:'Blurb Module',toggle:'Toggle Module',divider:'Divider Module',contact_form:'Contact Form',code:'Code Module'}[t]||'Module'}
  function label(m){return m.label||m.text||m.alt||m.title||String(m.html||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,90)||m.type||'Module'}
  function cols(row){return row&&row.columnsData&&row.columnsData.length?row.columnsData:[{type:'4_4',modules:(row&&row.modules)||[]}]}
  function modules(row){return cols(row).reduce(function(a,c){return a.concat(c.modules||[])},[])}
  function render(layout){
    if(!layout||!layout.sections||!layout.sections.length)return '<div class="dm-sk-empty">Convierte un HTML para ver la estructura Divi.</div>';
    return layout.sections.map(function(s,si){
      return '<section class="dm-sk-section"><div class="dm-sk-section-head"><span>SECCIÓN '+(si+1)+'</span><strong>'+esc(s.id||('section-'+(si+1)))+'</strong><small>'+esc((s.classes||[]).join(' '))+'</small></div>'+((s.rows||[]).map(function(r,ri){
        const c=cols(r), total=modules(r).length;
        return '<div class="dm-sk-row"><div class="dm-sk-row-head"><strong>Fila '+(ri+1)+'</strong><span>'+c.length+' columnas · '+total+' módulos</span></div>'+c.map(function(col,ci){
          return '<div class="dm-sk-col"><div class="dm-sk-col-head">Columna '+(ci+1)+' · '+esc(col.type||'4_4')+'</div>'+((col.modules||[]).map(function(m,mi){
            return '<div class="dm-sk-module dm-sk-'+esc(m.type)+'"><b>'+(mi+1)+'</b><div><strong>'+esc(name(m.type))+'</strong><p>'+esc(label(m))+'</p></div><em>'+esc(m.type||'module')+'</em></div>';
          }).join('')||'<div class="dm-sk-empty">Sin módulos</div>')+'</div>';
        }).join('')+'</div>';
      }).join(''))+'</section>';
    }).join('');
  }
  function panel(){
    const grid=document.querySelector('.preview-grid'); if(!grid)return null;
    let card=document.getElementById('divi-structure-card');
    if(!card){
      card=document.createElement('article'); card.id='divi-structure-card'; card.className='preview-card';
      card.innerHTML='<div class="preview-title"><strong>Estructura Divi</strong><span id="structure-stats"></span></div><div id="divi-structure-view" class="dm-skeleton-view"><div class="dm-sk-empty">Convierte un HTML para ver la estructura Divi.</div></div>';
      grid.appendChild(card);
    }
    grid.style.gridTemplateColumns='repeat(3,minmax(0,1fr))';
    return document.getElementById('divi-structure-view');
  }
  function update(){
    const target=panel(), st=getState(); if(!target||!st||!st.result||!st.result.layout)return;
    target.innerHTML=render(st.result.layout);
    const stats=document.getElementById('structure-stats');
    if(stats){
      const secs=st.result.layout.sections||[];
      const rows=secs.reduce(function(a,s){return a+((s.rows||[]).length)},0);
      const mods=secs.reduce(function(a,s){return a+(s.rows||[]).reduce(function(b,r){return b+modules(r).length},0)},0);
      stats.textContent=secs.length+' secciones · '+rows+' filas · '+mods+' módulos';
    }
  }
  const style=document.createElement('style');
  style.textContent='.dm-skeleton-view{height:520px;overflow:auto;background:#f8fafc;border-top:1px solid #e5e7eb;padding:14px}.dm-sk-empty{padding:18px;color:#64748b;font-weight:700}.dm-sk-section{border:2px solid #6d28d9;border-radius:18px;margin:0 0 14px;background:#fff;overflow:hidden}.dm-sk-section-head{background:#6d28d9;color:#fff;padding:12px 14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}.dm-sk-section-head span{font-size:11px;font-weight:900;letter-spacing:.08em}.dm-sk-section-head strong{font-size:14px}.dm-sk-section-head small{opacity:.85}.dm-sk-row{border:2px solid #16a34a;border-radius:14px;margin:12px;background:#f0fdf4;padding:10px}.dm-sk-row-head{display:flex;justify-content:space-between;gap:10px;color:#166534;font-size:13px;font-weight:800;margin-bottom:10px}.dm-sk-col{background:#fff;border:1px solid #bbf7d0;border-radius:12px;padding:10px;margin-bottom:10px}.dm-sk-col-head{font-size:12px;font-weight:900;color:#166534;margin-bottom:8px}.dm-sk-module{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;border:1px solid #e5e7eb;border-left:4px solid #2563eb;background:#fff;border-radius:10px;padding:9px;margin:8px 0}.dm-sk-module b{width:24px;height:24px;border-radius:999px;background:#111827;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px}.dm-sk-module strong{display:block;font-size:13px;color:#111827}.dm-sk-module p{margin:2px 0 0;color:#64748b;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}.dm-sk-module em{font-style:normal;font-size:10px;font-weight:900;text-transform:uppercase;background:#f1f5f9;border-radius:999px;padding:4px 7px;color:#475569}.dm-sk-button{border-left-color:#f97316}.dm-sk-image{border-left-color:#0ea5e9}.dm-sk-blurb{border-left-color:#db2777}.dm-sk-toggle{border-left-color:#14b8a6}.dm-sk-divider{border-left-color:#94a3b8}@media(max-width:980px){.preview-grid{grid-template-columns:1fr!important}.dm-skeleton-view{height:460px}}';
  document.head.appendChild(style);
  const oldConvert=window.convertHtml;
  if(typeof oldConvert==='function')window.convertHtml=function(html,mode){const r=oldConvert(html,mode);setTimeout(update,0);return r};
  document.addEventListener('click',function(e){if(e.target&&e.target.id==='convert-btn')setTimeout(update,150)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){panel();setTimeout(update,0)});else{panel();setTimeout(update,0)}
  window.DIVI_MANAGER_RENDER_SKELETON=update;
})();
