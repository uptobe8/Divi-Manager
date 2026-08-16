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

  function fixedTypography(){
    return{
      enabled:true,
      rules:{...DM.DEFAULT_TYPOGRAPHY}
    };
  }

  function plural(n,one,many){return n===1?one:many;}

  function explainJsonResult(s){
    const parts=[];
    if(s.headings>0) parts.push(`${s.headings} ${plural(s.headings,'título reorganizado','títulos reorganizados')} para respetar 1 H1 y el orden H2/H3`);
    if(s.responsive>0) parts.push(`${s.responsive} ${plural(s.responsive,'ajuste responsive corregido','ajustes responsive corregidos')}`);
    if(s.widths>0) parts.push(`${s.widths} ${plural(s.widths,'ancho problemático corregido','anchos problemáticos corregidos')}`);
    if(s.images>0) parts.push(`${s.images} ${plural(s.images,'ajuste de imagen corregido','ajustes de imagen corregidos')}`);
    if(s.css>0) parts.push(`${s.css} ${plural(s.css,'problema CSS corregido','problemas CSS corregidos')}`);
    parts.push('tamaños de texto de Oreja aplicados');
    return parts.join(' · ');
  }

  async function html(file){
    const box=$('#html-result');
    box.hidden=false;
    $('#html-status').textContent='Convirtiendo…';
    $('#html-meta').textContent='Analizando estructura, responsive, jerarquía y aplicando los tamaños fijos de Oreja.';
    $('#html-download').disabled=true;
    try{
      DM.state.typography=fixedTypography();
      const r=await DM.convertHtmlFile(file);
      DM.state.html={...r,name:`${DM.cleanName(file.name)}.divi4.json`};
      $('#html-status').textContent='JSON Divi 4 preparado';
      const h=r.headingChanges>0?`${r.headingChanges} ${plural(r.headingChanges,'título reorganizado','títulos reorganizados')} para respetar 1 H1 → H2 → H3`:'jerarquía H1 → H2 → H3 correcta';
      $('#html-meta').textContent=`${r.sections} secciones · ${r.modules} módulos editables · ${h} · tamaños de texto de Oreja aplicados`;
      $('#html-download').disabled=false;
    }catch(e){
      error('html',e.message);
    }
  }

  async function json(file){
    const box=$('#json-result');
    box.hidden=false;
    $('#json-status').textContent='Revisando…';
    $('#json-meta').textContent='Comprobando el archivo y aplicando siempre los tamaños de texto de Oreja.';
    $('#json-download').disabled=true;

    try{
      DM.state.typography=fixedTypography();
      const r=await DM.repairJsonFile(file);
      DM.state.json={...r,name:`${DM.cleanName(file.name)}.responsive-fixed.json`};
      const s=r.stats;
      $('#json-status').textContent='Archivo preparado';
      $('#json-meta').textContent=explainJsonResult(s);
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
