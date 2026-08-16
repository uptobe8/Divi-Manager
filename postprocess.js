(() => {
  'use strict';
  const DM=window.DM;
  const baseHtml=DM.convertHtmlFile;
  const baseJson=DM.repairJsonFile;

  function options(){
    return DM.state.typography||{enabled:false,rules:{}};
  }

  function processValue(value,stats){
    if(typeof value==='string'&&value.includes('[et_pb_')){
      return DM.applyHeadingAndTypography(value,{...options(),stats}).shortcodes;
    }
    if(Array.isArray(value)) return value.map(v=>processValue(v,stats));
    if(value&&typeof value==='object'){
      const out={};
      for(const[k,v]of Object.entries(value)) out[k]=processValue(v,stats);
      return out;
    }
    return value;
  }

  DM.convertHtmlFile=async file=>{
    const result=await baseHtml(file);
    const stats={headings:0,typography:0};
    const json=processValue(result.json,stats);
    return{
      ...result,
      json,
      headingChanges:stats.headings,
      typographyApplied:!!options().enabled
    };
  };

  DM.repairJsonFile=async file=>{
    const result=await baseJson(file);
    const added={headings:0,typography:0};
    const json=processValue(result.json,added);
    return{
      ...result,
      json,
      stats:{
        ...result.stats,
        headings:added.headings,
        typography:(result.stats.typography||0)+added.typography
      }
    };
  };
})();
