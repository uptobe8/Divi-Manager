(() => {
  'use strict';
  const DM=window.DM,$=DM.$,$$=DM.$$;

  function bindDrop(input,handler){
    const label=input.closest('.dropzone');
    input.addEventListener('change',()=>input.files?.[0]&&handler(input.files[0]));
    ['dragenter','dragover'].forEach(ev=>label.addEventListener(ev,e=>{
      e.preventDefault();
      label.classList.add('is-dragover');
    }));
    ['dragleave','drop'].forEach(ev=>label.addEventListener(ev,e=>{
      e.preventDefault();
      label.classList.remove('is-dragover');
    }));
    label.addEventListener('drop',e=>{
      const f=e.dataTransfer.files?.[0];
      if(f) handler(f);
    });
  }

  function error(kind,msg){
    const box=$(`#${kind}-result`);
    box.hidden=false;
    $(`#${kind}-status`).textContent='No se ha podido procesar';
    $(`#${kind}-meta`).textContent=msg;
    $(`#${kind}-download`).disabled=true;
  }

  async function html(file){
    const box=$('#html-result');
    box.hidden=false;
    $('#html-status').textContent='Convirtiendo…';
    $('#html-meta').textContent='Analizando estructura y estilos en desktop, tablet y móvil.';
    $('#html-download').disabled=true;
    try{
      const r=await DM.convertHtmlFile(file);
      DM.state.html={...r,name:`${DM.cleanName(file.name)}.divi4.json`};
      $('#html-status').textContent='JSON Divi 4 nativo preparado';
      $('#html-meta').textContent=`${r.sections} secciones · ${r.modules} módulos editables · 0 módulos Code`;
      $('#html-download').disabled=false;
    }catch(e){
      error('html',e.message);
    }
  }

  async function json(file){
    const box=$('#json-result');
    box.hidden=false;
    $('#json-status').textContent='Revisando…';
    $('#json-meta').textContent='Buscando únicamente problemas objetivos de responsive/CSS sin alterar el diseño correcto.';
    $('#json-download').disabled=true;

    try{
      const r=await DM.repairJsonFile(file);
      DM.state.json={...r,name:`${DM.cleanName(file.name)}.responsive-fixed.json`};
      const s=r.stats;
      const total=s.responsive+s.typography+s.widths+s.images+s.css;

      if(total===0){
        $('#json-status').textContent='No necesita cambios automáticos';
        $('#json-meta').textContent='El JSON ya contiene ajustes responsive/CSS suficientes según las comprobaciones seguras. Se conserva intacto.';
      }else{
        $('#json-status').textContent='JSON corregido sin alterar lo que ya estaba bien';
        $('#json-meta').textContent=`${total} ajustes puntuales · responsive ${s.responsive} · tipografía ${s.typography} · anchos ${s.widths} · imágenes ${s.images} · CSS ${s.css}`;
      }

      $('#json-download').disabled=false;
    }catch(e){
      error('json',e.message);
    }
  }

  $$('.tab').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.tab').forEach(b=>b.classList.toggle('is-active',b===btn));
    $$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==btn.dataset.mode);
  }));

  bindDrop($('#html-file'),html);
  bindDrop($('#json-file'),json);

  $('#html-download').addEventListener('click',()=>DM.state.html&&DM.downloadJson(DM.state.html.name,DM.state.html.json));
  $('#json-download').addEventListener('click',()=>DM.state.json&&DM.downloadJson(DM.state.json.name,DM.state.json.json));
})();
