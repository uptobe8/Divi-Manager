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

  function typographyOptions(){
    const value=id=>$(id)?.value?.trim()||'';
    return{
      enabled:$('#type-enabled').checked,
      rules:{
        family:value('#type-family'),
        h1Weight:value('#type-h1-weight'),h1Size:value('#type-h1-size'),h1Mobile:value('#type-h1-mobile'),h1Line:value('#type-h1-line'),h1Letter:value('#type-h1-letter'),
        h2Weight:value('#type-h2-weight'),h2Size:value('#type-h2-size'),h2Mobile:value('#type-h2-mobile'),h2Line:value('#type-h2-line'),h2Letter:value('#type-h2-letter'),
        leadSize:value('#type-lead-size'),leadLine:value('#type-lead-line'),leadWeight:value('#type-lead-weight'),
        bodySize:value('#type-body-size'),bodyWeight:value('#type-body-weight'),
        h3Size:value('#type-h3-size'),h3Weight:value('#type-h3-weight'),
        kickerSize:value('#type-kicker-size'),kickerWeight:value('#type-kicker-weight'),kickerLetter:value('#type-kicker-letter')
      }
    };
  }

  function plural(n,one,many){return n===1?one:many;}

  function explainJsonResult(s,customTypography){
    const parts=[];
    if(s.headings>0) parts.push(`${s.headings} ${plural(s.headings,'título reorganizado','títulos reorganizados')} para respetar 1 H1 y el orden H2/H3`);
    if(s.responsive>0) parts.push(`${s.responsive} ${plural(s.responsive,'ajuste responsive corregido','ajustes responsive corregidos')}`);
    if(s.widths>0) parts.push(`${s.widths} ${plural(s.widths,'ancho problemático corregido','anchos problemáticos corregidos')}`);
    if(s.images>0) parts.push(`${s.images} ${plural(s.images,'ajuste de imagen corregido','ajustes de imagen corregidos')}`);
    if(s.css>0) parts.push(`${s.css} ${plural(s.css,'problema CSS corregido','problemas CSS corregidos')}`);
    if(customTypography) parts.push('tipografía personalizada aplicada');
    else if(s.typography>0) parts.push(`${s.typography} ${plural(s.typography,'tamaño de texto problemático corregido','tamaños de texto problemáticos corregidos')}`);
    else parts.push('tipografía original conservada');
    return parts.join(' · ');
  }

  async function html(file){
    const box=$('#html-result');
    box.hidden=false;
    $('#html-status').textContent='Convirtiendo…';
    $('#html-meta').textContent='Analizando estructura, responsive, jerarquía H1/H2/H3 y tipografía.';
    $('#html-download').disabled=true;
    try{
      DM.state.typography=typographyOptions();
      const r=await DM.convertHtmlFile(file);
      DM.state.html={...r,name:`${DM.cleanName(file.name)}.divi4.json`};
      $('#html-status').textContent='JSON Divi 4 preparado';
      const h=r.headingChanges>0?`${r.headingChanges} ${plural(r.headingChanges,'título reorganizado','títulos reorganizados')} para respetar 1 H1 → H2 → H3`:'jerarquía H1 → H2 → H3 correcta';
      const t=r.typographyApplied?'tipografía personalizada aplicada':'tipografía del HTML conservada';
      $('#html-meta').textContent=`${r.sections} secciones · ${r.modules} módulos editables · ${h} · ${t}`;
      $('#html-download').disabled=false;
    }catch(e){
      error('html',e.message);
    }
  }

  async function json(file){
    const box=$('#json-result');
    box.hidden=false;
    $('#json-status').textContent='Revisando…';
    $('#json-meta').textContent='Comprobando el archivo sin modificar lo que ya está bien.';
    $('#json-download').disabled=true;

    try{
      DM.state.typography=typographyOptions();
      const customTypography=DM.state.typography.enabled;
      const r=await DM.repairJsonFile(file);
      DM.state.json={...r,name:`${DM.cleanName(file.name)}.responsive-fixed.json`};
      const s=r.stats;
      const total=s.responsive+s.typography+s.widths+s.images+s.css+s.headings;

      if(total===0){
        $('#json-status').textContent='El archivo ya estaba correcto';
        $('#json-meta').textContent=customTypography?'No había errores que reparar. Se ha aplicado la tipografía personalizada que elegiste.':'No había errores que reparar. He conservado la tipografía y el diseño originales.';
      }else{
        $('#json-status').textContent='Archivo preparado';
        $('#json-meta').textContent=explainJsonResult(s,customTypography);
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

  $('#type-enabled').addEventListener('change',()=>{
    $('#type-fields').hidden=!$('#type-enabled').checked;
  });

  bindDrop($('#html-file'),html);
  bindDrop($('#json-file'),json);

  $('#html-download').addEventListener('click',()=>DM.state.html&&DM.downloadJson(DM.state.html.name,DM.state.html.json));
  $('#json-download').addEventListener('click',()=>DM.state.json&&DM.downloadJson(DM.state.json.name,DM.state.json.json));
})();
