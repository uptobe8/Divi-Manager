/* Exact structural converter: preserves original DOM blocks inside Divi Code modules with CSS embedded. */
(function(){
  const V='4.27.0';
  const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const attrs=o=>Object.entries(o).filter(([,v])=>v!==undefined&&v!==null&&v!=='').map(([k,v])=>`${k}="${esc(v)}"`).join(' ');
  const sc=(t,a,c='')=>`[${t}${attrs(a)?' '+attrs(a):''}]${c}[/${t}]`;
  function parse(html){return new DOMParser().parseFromString(html,'text/html')}
  function css(doc){
    const inline=[...doc.querySelectorAll('style')].map(n=>n.textContent||'').filter(Boolean);
    const links=[...doc.querySelectorAll('link[rel="stylesheet"]')].map(n=>`@import url("${n.getAttribute('href')}");`);
    return [...links,...inline].join('\n\n');
  }
  function bodyBlocks(doc){
    return [...(doc.body?doc.body.children:[])].filter(n=>{
      const t=(n.tagName||'').toLowerCase();
      return !['script','style','link','meta','title','noscript'].includes(t);
    });
  }
  function cssReset(){return `.dm-exact-section.et_pb_section{padding:0!important;margin:0!important;background:transparent!important}.dm-exact-section .et_pb_row.dm-exact-row{padding:0!important;margin:0!important;width:100%!important;max-width:100%!important}.dm-exact-section .et_pb_column,.dm-exact-section .et_pb_module,.dm-exact-section .et_pb_code_inner{padding:0!important;margin:0!important}.dm-exact-section .et_pb_code{padding:0!important;margin:0!important}`}
  function codeModule(html){return sc('et_pb_code',{_builder_version:V,global_colors_info:'{}',module_class:'dm-exact-code'},html)}
  function row(inner){return sc('et_pb_row',{_builder_version:V,global_colors_info:'{}',module_class:'dm-exact-row',width:'100%',max_width:'100%',custom_padding:'0px||0px||false|false'},sc('et_pb_column',{type:'4_4',_builder_version:V,global_colors_info:'{}'},inner))}
  function section(inner){return sc('et_pb_section',{fb_built:'1',_builder_version:V,global_colors_info:'{}',module_class:'dm-exact-section',custom_padding:'0px||0px||false|false'},row(inner))}
  function previewHtml(blocks,style){
    const b=blocks.map(n=>n.outerHTML).join('\n');
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${style}\n${cssReset()}\nbody{margin:0}</style></head><body>${b}</body></html>`;
  }
  window.convertHtml=function(html,mode='balanced'){
    const doc=parse(html), style=css(doc), blocks=bodyBlocks(doc), title=clean(doc.querySelector('title')?.textContent||state.fileName||'Divi Layout');
    const styleTag=`<style id="divi-manager-inline-css">\n${style}\n${cssReset()}\n</style>`;
    const parts=[section(codeModule(styleTag)),...blocks.map(b=>section(codeModule(b.outerHTML)))];
    const shortcodes=parts.join('\n\n');
    const layout={version:'0.3.0-exact-structure',title,fileName:state.fileName,mode,generatedAt:new Date().toISOString(),sections:blocks.map((b,i)=>({id:b.id||`section-${i+1}`,tag:(b.tagName||'div').toLowerCase(),classes:[...b.classList],rows:[{columns:1,modules:[{type:'code',html:b.outerHTML,label:'Code Module',column:1}]}]}))};
    return {layout,css:style,shortcodes,diviJson:{context:'et_builder',data:{'100001':shortcodes},presets:{},images:{}},previewHtml:previewHtml(blocks,style),original:{html,css:style,text:clean(doc.body?.innerText||''),previewHtml:html}};
  };
})();
