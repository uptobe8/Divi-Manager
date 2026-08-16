(() => {
  'use strict';
  const DM=window.DM,sc=DM.shortcode,V='4.27.4';
  const base={_builder_version:V,_module_preset:'default',global_colors_info:'{}'};
  const text=(a,h)=>sc('et_pb_text',{...base,...a},h);
  const btn=a=>sc('et_pb_button',{...base,custom_button:'on',button_border_radius:'0px',button_use_icon:'off',...a},'');
  const col=(type,a,h)=>sc('et_pb_column',{type,...base,...a},h);
  const row=(a,h)=>sc('et_pb_row',{...base,...a},h);
  const sec=(a,h)=>sc('et_pb_section',{fb_built:'1',...base,...a},h);

  function callbackCta(){
    const left=col('1_2',{admin_label:'Título',custom_padding:'0px|42px|0px|0px|true|true'},
      text({admin_label:'Kicker',text_font:'Arial|700||on|||||',text_text_color:'#B89B5E',text_font_size:'10px',text_letter_spacing:'2px',text_line_height:'1.2em',custom_margin:'0px||12px||false|false'},'<p>TE LLAMAMOS NOSOTROS</p>')+
      text({admin_label:'Título',header_2_font:'Arial|700||on|||||',header_2_text_color:'#FFFFFF',header_2_font_size:'48px',header_2_letter_spacing:'-2px',header_2_line_height:'0.94em',header_2_font_size_tablet:'42px',header_2_font_size_phone:'34px'},'<h2>NO PIERDAS EL TIEMPO.<br>NOSOTROS TE LLAMAMOS.</h2>'));
    const right=col('1_2',{admin_label:'Texto',custom_padding:'28px|0px|0px|22px|true|true'},
      text({admin_label:'Texto',text_font:'Arial|400|||||||',text_text_color:'rgba(255,255,255,0.70)',text_font_size:'16px',text_line_height:'1.55em',custom_margin:'0px||8px||false|false'},'<p>Déjanos tus datos y dinos cuándo te viene bien. Nosotros nos ocupamos de acordarnos y de llamarte.</p>')+
      text({admin_label:'Microcopy',text_font:'Arial|700||on|||||',text_text_color:'#B89B5E',text_font_size:'10px',text_letter_spacing:'1px',text_line_height:'1.4em'},'<p>TÚ ELIGES CUÁNDO · NOSOTROS HACEMOS EL RESTO</p>'));
    const head=row({column_structure:'1_2,1_2',use_custom_gutter:'on',gutter_width:'2',make_equal:'on',admin_label:'Encabezado',width:'calc(100% - 40px)',max_width:'1320px',custom_padding:'0px||26px||false|false'},left+right);
    const form=col('4_4',{admin_label:'Formulario',background_color:'#0B0B0B',custom_padding:'24px|24px|18px|24px|true|true',border_width_all:'1px',border_color_all:'rgba(184,155,94,0.34)',border_style_all:'solid'},
      text({admin_label:'Contact Form 7 · horizontal real',text_font:'Arial|400|||||||',text_text_color:'#FFFFFF',text_line_height:'1.4em'},'[contact-form-7 id="997512" title="INKLAB · Te llamamos · Horizontal REAL FINAL"]'));
    return sec({admin_label:'CTA 01 · Horizontal real final',module_class:'dm-cta-injected dm-cta-callback',background_color:'#050505',custom_padding:'54px|0px|54px|0px|true|true'},head+row({admin_label:'Formulario horizontal',width:'calc(100% - 40px)',max_width:'1320px'},form));
  }

  function card(n,channel,title,copy,action,variant){
    const light=variant==='light',main=light?'#000000':'#FFFFFF',muted=light?'rgba(0,0,0,0.62)':'rgba(255,255,255,0.62)',num=light?'rgba(0,0,0,0.10)':'rgba(255,255,255,0.10)';
    const b={button_alignment:'left',button_text_size:'11px',button_border_width:'1px',button_border_color:'#B89B5E',button_letter_spacing:'1px',button_font:'Arial|700||on|||||',custom_padding:'14px|18px|14px|18px|true|true',button_text_color:action.primary?'#050505':main,button_bg_color:action.primary?'#B89B5E':'rgba(0,0,0,0)',button_url:action.url,button_text:action.label};
    if(action.newWindow)b.url_new_window='on';
    return col('1_4',{admin_label:title,background_color:light?'#FFFFFF':'#070707',custom_padding:'42px|34px|42px|34px|true|true'},
      text({admin_label:'Número',text_font:'Arial|700|||||||',text_text_color:num,text_font_size:'64px',text_line_height:'1em',custom_margin:'0px||48px||false|false'},`<p>${n}</p>`)+
      text({admin_label:'Canal',text_font:'Arial|700||on|||||',text_text_color:'#B89B5E',text_font_size:'10px',text_letter_spacing:'2px',custom_margin:'0px||10px||false|false'},`<p>${channel}</p>`)+
      text({admin_label:'Título canal',header_3_font:'Arial|700||on|||||',header_3_text_color:main,header_3_font_size:'24px',header_3_letter_spacing:'-1px',header_3_line_height:'1.0em',custom_margin:'0px||14px||false|false'},`<h3>${title}</h3>`)+
      text({admin_label:'Texto canal',text_font:'Arial|400|||||||',text_text_color:muted,text_line_height:'1.5em',custom_margin:'0px||28px||false|false'},`<p>${copy}</p>`)+btn(b));
  }

  function contactsCta(variant='dark'){
    const intro=col('1_4',{admin_label:'Introducción',background_color:'#B89B5E',custom_padding:'50px|42px|50px|42px|true|true'},
      text({admin_label:'Kicker',text_font:'Arial|700||on|||||',text_text_color:'#050505',text_font_size:'10px',text_letter_spacing:'2px',custom_margin:'0px||18px||false|false'},'<p>ELIGE CÓMO CONTACTAR</p>')+
      text({admin_label:'Título',header_2_font:'Arial|700||on|||||',header_2_text_color:'#050505',header_2_font_size:'46px',header_2_letter_spacing:'-2px',header_2_line_height:'0.92em',header_2_font_size_tablet:'38px',header_2_font_size_phone:'34px',custom_margin:'0px||24px||false|false'},'<h2>¿LO<br>HABLAMOS?</h2>')+
      text({admin_label:'Texto',text_font:'Arial|400|||||||',text_text_color:'rgba(5,5,5,0.72)',text_font_size:'15px',text_line_height:'1.55em'},'<p>Tres formas directas de hablar con el estudio. Elige el canal que te resulte más cómodo.</p>'));
    const cards=
      card('01','TELÉFONO','LLÁMANOS.','Si prefieres resolverlo hablando, llama directamente al estudio.',{url:'tel:+34662030466',label:'LLAMAR AHORA'},variant)+
      card('02','WHATSAPP','ESCRÍBENOS.','Cuéntanos qué necesitas y te respondemos por mensaje.',{url:'https://wa.me/34662030466?text=Hola%20INKLAB%2C%20quiero%20informaci%C3%B3n',label:'ABRIR WHATSAPP',newWindow:true,primary:true},variant)+
      card('03','INSTAGRAM','ENVÍANOS UN DM.','También puedes escribirnos por Instagram y enseñarnos referencias.',{url:'https://www.instagram.com/inklabmadrid/',label:'ABRIR INSTAGRAM',newWindow:true},variant);
    return sec({admin_label:`CTA 02 · Tres formas de contacto · ${variant==='light'?'blanco':'horizontal'}`,module_class:`dm-cta-injected dm-cta-contacts dm-cta-contacts-${variant}`,background_color:'#050505',custom_padding:'0px|0px|0px|0px|true|true'},row({column_structure:'1_4,1_4,1_4,1_4',use_custom_gutter:'on',gutter_width:'1',make_equal:'on',admin_label:'CTA 02 · 4 paneles',width:'100%',max_width:'100%',custom_padding:'0px||0px||false|false'},intro+cards));
  }

  function parseAttrs(raw=''){const o={},re=/([a-zA-Z0-9_:-]+)="([^"]*)"/g;let m;while((m=re.exec(raw)))o[m[1]]=m[2];return o;}
  function listSections(input){const out=[],re=/\[et_pb_section\b([^\]]*)\][\s\S]*?\[\/et_pb_section\]/gi;let m;while((m=re.exec(input)))out.push({start:m.index,end:re.lastIndex,full:m[0],attrs:parseAttrs(m[1])});return out;}
  function hint(s){return `${s?.attrs?.admin_label||''} ${s?.attrs?.module_id||''} ${s?.attrs?.module_class||''}`.toLowerCase();}
  function technical(s){return /\bcss\b|-css\b/.test(hint(s));}
  function suppliedCallback(s){return /te llamamos nosotros|cta 01|dm-cta-callback/i.test(s.full);}
  function suppliedContacts(s){return /elige c[oó]mo contactar|dm-cta-contacts/i.test(s.full)&&/whatsapp/i.test(s.full);}
  function finalCta(s){return /\bcta\b/.test(hint(s))&&!/cta 01|cta 02|dm-cta/.test(hint(s));}
  function bgType(s){
    const bg=String(s?.attrs?.background_color||'').toLowerCase(),h=hint(s);
    if(/#fff|#ffffff|#f2efe8/.test(bg))return 'light';
    if(/#b89b5e/.test(bg))return 'gold';
    if(/#050505|#000000|#070707|rgba\(0\s*,\s*0\s*,\s*0/.test(bg))return 'dark';
    if(/parallax|reviews|video|black|hero|works/.test(h))return 'dark';
    return 'unknown';
  }
  function prevSignificant(ss,index){for(let i=index-1;i>=0;i--)if(!technical(ss[i])&&!suppliedCallback(ss[i])&&!suppliedContacts(ss[i]))return ss[i];return null;}
  function insert(input,index,html){return input.slice(0,index)+html+input.slice(index);}

  DM.injectCtas=(input,stats={ctas:0,ctaVariants:0})=>{
    let out=String(input||''),ss=listSections(out);
    if(ss.length<6||!/<h1\b/i.test(out))return{shortcodes:out,stats};

    const current=ss.find(suppliedContacts);
    if(current){
      const i=ss.indexOf(current),wanted=bgType(prevSignificant(ss,i))==='dark'?'light':'dark';
      if(!current.full.includes(`dm-cta-contacts-${wanted}`)){
        out=out.slice(0,current.start)+contactsCta(wanted)+out.slice(current.end);stats.ctaVariants++;
      }
    }

    ss=listSections(out);
    if(!ss.some(suppliedCallback)){
      const finalIndex=ss.findIndex(finalCta);
      const usable=ss.map((s,i)=>({s,i})).filter(x=>!technical(x.s)&&!suppliedContacts(x.s)&&!finalCta(x.s)&&(finalIndex<0||x.i<finalIndex));
      const target=Math.max(0,Math.round((usable.length-1)*.4));
      let best=usable[target]||usable[0];
      for(let d=0;d<usable.length;d++){
        const candidates=[target-d,target+d].filter(i=>i>=0&&i<usable.length);
        const found=candidates.map(i=>usable[i]).find(x=>bgType(x.s)==='light');
        if(found){best=found;break;}
      }
      if(best){out=insert(out,best.s.end,callbackCta());stats.ctas++;}
    }

    ss=listSections(out);
    if(!ss.some(suppliedContacts)){
      const faq=ss.find(s=>/faq/.test(hint(s))),index=faq?ss.indexOf(faq):Math.min(ss.length-1,Math.max(1,Math.round(ss.length*.72)));
      const prev=prevSignificant(ss,index),variant=bgType(prev)==='dark'?'light':'dark';
      out=insert(out,faq?faq.start:ss[index].start,contactsCta(variant));stats.ctas++;
    }
    return{shortcodes:out,stats};
  };
})();