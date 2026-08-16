(() => {
  'use strict';
  const DM=window.DM;
  const baseHtml=DM.convertHtmlFile,baseJson=DM.repairJsonFile;
  function options(){return DM.state.typography||{enabled:false,rules:{}};}
  function processValue(value,stats){
    if(typeof value==='string'&&value.includes('[et_pb_')){
      let out=value;
      if(DM.injectCtas){const r=DM.injectCtas(out,stats);out=r.shortcodes;}
      return DM.applyHeadingAndTypography(out,{...options(),stats}).shortcodes;
    }
    if(Array.isArray(value))return value.map(v=>processValue(v,stats));
    if(value&&typeof value==='object'){const out={};for(const[k,v]of Object.entries(value))out[k]=processValue(v,stats);return out;}
    return value;
  }
  DM.convertHtmlFile=async file=>{
    const result=await baseHtml(file),stats={headings:0,typography:0,designProtected:0,ctas:0,ctaVariants:0};
    const json=processValue(result.json,stats);
    return{...result,json,headingChanges:stats.headings,typographyApplied:!!options().enabled,designProtected:stats.designProtected,ctasAdded:stats.ctas,ctaVariants:stats.ctaVariants};
  };
  DM.repairJsonFile=async file=>{
    const result=await baseJson(file),added={headings:0,typography:0,designProtected:0,ctas:0,ctaVariants:0};
    const json=processValue(result.json,added);
    return{...result,json,stats:{...result.stats,headings:added.headings,typography:(result.stats.typography||0)+added.typography,designProtected:added.designProtected,ctas:added.ctas,ctaVariants:added.ctaVariants}};
  };
})();