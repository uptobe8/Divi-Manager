(() => {
  'use strict';
  const DM=window.DM,$=DM.$,$$=DM.$$;
  function bindDrop(input,handler){
    const label=input.closest('.dropzone');input.addEventListener('change',()=>input.files?.[0]&&handler(input.files[0]));
    ['dragenter','dragover'].forEach(ev=>label.addEventListener(ev,e=>{e.preventDefault();label.classList.add('is-dragover');}));
    ['dragleave','drop'].forEach(ev=>label.addEventListener(ev,e=>{e.preventDefault();label.classList.remove('is-dragover');}));
    label.addEventListener('drop',e=>{const f=e.dataTransfer.files?.[0];if(f)handler(f);});
  }
  function error(kind,msg){const box=$(`#${kind}-result`);box.hidden=false;$(`#${kind}-status`).textContent='No se ha podido procesar';$(`#${kind}-meta`).textContent=msg;$(`#${kind}-download`).disabled=true;}
  function fixedTypography(){return{enabled:true,rules:{...DM.DEFAULT_TYPOGRAPHY}};}
  function plural(n,one,many){return n===1?one:many;}
  function explain(s){
    const p=[];
    if(s.headings>0)p.push(`${s.headings} ${plural(s.headings,'título reorganizado','títulos reorganizados')} para respetar 1 H1 y el orden H2/H3`);
    if(s.designProtected>0)p.push(`${s.designProtected} ${plural(s.designProtected,'efecto editorial grande protegido','efectos editoriales grandes protegidos')}`);
    if(s.ctas>0)p.push(`${s.ctas} ${plural(s.ctas,'CTA añadido','CTA añadidos')} en el scroll`);
    if(s.ctaVariants>0)p.push(`${s.ctaVariants} ${plural(s.ctaVariants,'CTA adaptado','CTA adaptados')} al color del bloque anterior`);
    if(s.responsive>0)p.push(`${s.responsive} ${plural(s.responsive,'ajuste responsive corregido','ajustes responsive corregidos')}`);
    if(s.widths>0)p.push(`${s.widths} ${plural(s.widths,'ancho problemático corregido','anchos problemáticos corregidos')}`);
    if(s.images>0)p.push(`${s.images} ${plural(s.images,'ajuste de imagen corregido','ajustes de imagen corregidos')}`);
    if(s.css>0)p.push(`${s.css} ${plural(s.css,'problema CSS corregido','problemas CSS corregidos')}`);
    p.push('escala tipográfica fija aplicada');return p.join(' · ');
  }
  async function html(file){
    const box=$('#html-result');box.hidden=false;$('#html-status').textContent='Convirtiendo…';$('#html-meta').textContent='Analizando estructura, responsive, jerarquía, efectos editoriales y CTA.';$('#html-download').disabled=true;
    try{DM.state.typography=fixedTypography();const r=await DM.convertHtmlFile(file);DM.state.html={...r,name:`${DM.cleanName(file.name)}.divi4.json`};$('#html-status').textContent='JSON Divi 4 preparado';
      const bits=[`${r.sections} secciones`,`${r.modules} módulos editables`,r.headingChanges?`${r.headingChanges} títulos reorganizados`:'jerarquía H1 → H2 → H3 correcta'];if(r.designProtected)bits.push(`${r.designProtected} efectos editoriales protegidos`);if(r.ctasAdded)bits.push(`${r.ctasAdded} CTA añadidos`);$('#html-meta').textContent=bits.join(' · ')+' · escala tipográfica fija aplicada';$('#html-download').disabled=false;
    }catch(e){error('html',e.message);}
  }
  async function json(file){
    const box=$('#json-result');box.hidden=false;$('#json-status').textContent='Revisando…';$('#json-meta').textContent='Comprobando el archivo, protegiendo recursos editoriales y distribuyendo CTA.';$('#json-download').disabled=true;
    try{DM.state.typography=fixedTypography();const r=await DM.repairJsonFile(file);DM.state.json={...r,name:`${DM.cleanName(file.name)}.responsive-fixed.json`};$('#json-status').textContent='Archivo preparado';$('#json-meta').textContent=explain(r.stats);$('#json-download').disabled=false;}catch(e){error('json',e.message);}
  }
  $$('.tab').forEach(btn=>btn.addEventListener('click',()=>{$$('.tab').forEach(b=>b.classList.toggle('is-active',b===btn));$$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==btn.dataset.mode);}));
  bindDrop($('#html-file'),html);bindDrop($('#json-file'),json);
  $('#html-download').addEventListener('click',()=>DM.state.html&&DM.downloadJson(DM.state.html.name,DM.state.html.json));
  $('#json-download').addEventListener('click',()=>DM.state.json&&DM.downloadJson(DM.state.json.name,DM.state.json.json));
})();