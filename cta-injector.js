(() => {
  'use strict';
  const DM=window.DM,K=DM.K;
  const sc=DM.shortcode;

  function text(attrs,html){return sc('et_pb_text',{_builder_version:'4.27.4',_module_preset:'default',global_colors_info:'{}',...attrs},html);}
  function button(attrs){return sc('et_pb_button',{_builder_version:'4.27.4',_module_preset:'default',custom_button:'on',button_border_radius:'0px',button_use_icon:'off',global_colors_info:'{}',...attrs},'');}
  function column(type,attrs,content){return sc('et_pb_column',{type,_builder_version:'4.27.4',_module_preset:'default',global_colors_info:'{}',...attrs},content);}
  function row(attrs,content){return sc('et_pb_row',{_builder_version:'4.27.4',_module_preset:'default',global_colors_info:'{}',...attrs},content);}
  function section(attrs,content){return sc('et_pb_section',{fb_built:'1',_builder_version:'4.27.4',_module_preset:'default',global_colors_info:'{}',...attrs},content);}

  function callbackCta(){
    const left=column('1_2',{admin_label:'Título',custom_padding:'0px|42px|0px|0px|true|true'},
      text({admin_label:'Kicker',text_font:'Arial|700||on|||||',text_text_color:'#B89B5E',text_font_size:'10px',text_letter_spacing:'2px',text_line_height:'1.2em',custom_margin:'0px||12px||false|false'},'<p>TE LLAMAMOS NOSOTROS</p>')+
      text({admin_label:'Título',header_2_font:'Arial|700||on|||||',header_2_text_color:'#FFFFFF',header_2_font_size:'48px',header_2_letter_spacing:'-2px',header_2_line_height:'0.94em',header_2_font_size_tablet:'42px',header_2_font_size_phone:'34px',custom_margin:'0px||0px||false|false'},'<h2>NO PIERDAS EL TIEMPO.<br>NOSOTROS TE LLAMAMOS.</h2>'));
    const right=column('1_2',{admin_label:'Texto',custom_padding:'28px|0px|0px|22px|true|true'},
      text({admin_label:'Texto',text_font:'Arial|400|||||||',text_text_color:'rgba(255,255,255,0.70)',text_font_size:'16px',text_line_height:'1.55em',custom_margin:'0px||8px||false|false'},'<p>Déjanos tus datos y dinos cuándo te viene bien. Nosotros nos ocupamos de acordarnos y de llamarte.</p>')+
      text({admin_label:'Microcopy',text_font:'Arial|700||on|||||',text_text_color:'#B89B5E',text_font_size:'10px',text_letter_spacing:'1px',text_line_height:'1.4em'},'<p>TÚ ELIGES CUÁNDO · NOSOTROS HACEMOS EL RESTO</p>'));
    const head=row({column_structure:'1_2,1_2',use_custom_gutter:'on',gutter_width:'2',make_equal:'on',admin_label:'Encabezado',width:'calc(100% - 40px)',max_width:'1320px',custom_padding:'0px||26px||false|false'},left+right);
    const form=column('4_4',{admin_label:'Formulario',background_color:'#0B0B0B',custom_padding:'24px|24px|18px|24px|true|true',border_width_all:'1px',border_color_all:'rgba(184,155,94,0.34)',border_style_all:'solid'},
      text({admin_label:'Contact Form 7 · horizontal real',text_font:'Arial|400|||||||',text_text_color:'#FFFFFF',text_line_height:'1.4em',custom_margin:'0px||0px||false|false',custom_padding:'0px||0px||false|false'},'[contact-form-7 id="997512" title="INKLAB · Te llamamos · Horizontal REAL FINAL"]'));
    const formRow=row({admin_label:'Formulario horizontal',width:'calc(100% - 40px)',max_width:'1320px',custom_padding:'0px||0px||false|false'},form);
    return section({admin_label:'CTA 01 · Horizontal real final',module_class:'dm-cta-injected dm-cta-callback',background_color:'#050505',custom_padding:'54px|0px|54px|0px|true|true'},head+formRow);
  }

  function contactCard(number,channel,title,copy,btn,variant){
    const light=variant==='light';
    const bg=light?'#FFFFFF':'#070707';
    const main=light?'#000000':'#FFFFFF';
    const muted=light?'rgba(0,0,0,0.62)':'rgba(255,255,255,0.62)';
    const num=light?'rgba(0,0,0,0.10)':'rgba(255,255,255,0.10)';
    let buttonAttrs={button_alignment:'left',button_text_size:'11px',button_border_width:'1px',button_border_color:'#B89B5E',button_letter_spacing:'1px',button_font:'Arial|700||on|||||',custom_padding:'14px|18px|14px|18px|true|true',...btn};
    if(btn.primary){buttonAttrs={...buttonAttrs,button_text_color:'#050505',button_bg_color:'#B89B5E'};delete buttonAttrs.primary;}
    else {buttonAttrs={...buttonAttrs,button_text_color:main,button_bg_color:'rgba(0,0,0,0)'};}
    return column('1_4',{admin_label:title,background_color:bg,custom_padding:'42px|34px|42px|34px|true|true'},
      text({admin_label:'Número',text_font:'Arial|700|||||||',text_text_color:num,text_font_size:'64px',text_line_height:'1em',custom_margin:'0px||48px||false|false'},`<p>${number}</p>`)+
      text({admin_label:'Canal',text_font:'Arial|700||on|||||',text_text_color:'#B89B5E',text_font_size:'10px',text_letter_spacing:'2px',custom_margin:'0px||10px||false|false'},`<p>${channel}</p>`)+
      text({admin_label:'Título canal',header_3_font:'Arial|700||on|||||',header_3_text_color:main,header_3_font_size:'24px',header_3_letter_spacing:'-1px',header_3_line_height:'1.0em',custom_margin:'0px||14px||false|false'},`<h3>${title}</h3>`)+
      text({admin_label:'Texto canal',text_font:'Arial|400|||||||',text_text_color:muted,text_line_height:'1.5em',custom_margin:'0px||28px||false|false'},`<p>${copy}</p>`)+button(buttonAttrs));
  }

  function contactsCta(variant='dark'){
    const intro=column('1_4',{admin_label:'Introducción',background_color:'#B89B5E',custom_padding:'50px|42px|50px|42px|true|true'},
      text({admin_label:'Kicker',text_font:'Arial|700||on|||||',text_text_color:'#050505',text_font_size:'10px',text_letter_spacing:'2px',custom_margin:'0px||18px||false|false'},'<p>ELIGE CÓMO CONTACTAR</p>')+
      text({admin_label:'Título',header_2_font:'Arial|700||on|||||',header_2_text_color:'#050505',header_2_font_size:'46px',header_2_letter_spacing:'-2px',header_2_line_height:'0.92em',header_2_font_size_tablet:'38px',header_2_font_size_phone:'34px',custom_margin:'0px||24px||false|false'},'<h2>¿LO<br>HABLAMOS?</h2>')+
      text({admin_label:'Texto',text_font:'Arial|400|||||||',text_text_color:'rgba(5,5,5,0.72)',text_font_size:'15px',text_line_height:'1.55em'},'<p>Tres formas directas de hablar con el estudio. Elige el canal que te resulte más cómodo.</p>'));
    const c1=contactCard('01','TELÉFONO','LLÁMANOS.','Si prefieres resolverlo hablando, llama directamente al estudio.',{button_url:'tel:+34662030466',button_text:'LLAMAR AHORA'},variant);
    const c2=contactCard('02','WHATSAPP','ESCRÍBENOS.','Cuéntanos qué necesitas y te respondemos por mensaje.',{button_url:'https://wa.me/34662030466?text=Hola%20INKLAB%2C%20quiero%20informaci%C3%B3n',url_new_window:'on',button_text:'ABRIR WHATSAPP',primary:true},variant);
    const c3=contactCard('03','INSTAGRAM','ENVÍANOS UN DM.','También puedes escribirnos por Instagram y enseñarnos referencias.',{button_url:'https://www.instagram.com/inklabmadrid/',url_new_window:'on',button_text:'ABRIR INSTAGRAM'},variant);
    return section({admin_label:`CTA 02 · Tres formas de contacto · ${variant==='light'?'blanco':'horizontal'}`,module_class:`dm-cta-injected dm-cta-contacts dm-cta-contacts-${variant}`,background_color:'#050505',custom_padding:'0px|0px|0px|0px|true|true'},
      row({column_structure:'1_4,1_4,1_4,1_4',use_custom_gutter:'on',gutter_width:'1',make_equal:'on',admin_label:'CTA 02 · 4 paneles',width:'100%',max_width:'100%',custom_padding:'0px||0px||false|false'},intro+c1+c2+c3));
  }

  function attrs(raw=''){
    const out={},re=/([a-zA-Z0-9_:-]+)="([^"]*)"/g;let m;
    while((m=re.exec(raw))) out[m[1]]=m[2];
    return out;
  }
  function sections(input){
    const re=/\[et_pb_section\b([^\]]*)\][\s\S]*?\[\/et_pb_section\]/gi,out=[];let m;
    while((m=re.exec(input))){const a=attrs(m[1]);out.push({start:m.index,end:re.lastIndex,full:m[0],attrs:a});}
    return out;
  }
  function bgType(sec){
    const bg=String(sec?.attrs?.background_color||'').toLowerCase();
    const cls=`${sec?.attrs?.module_class||''} ${sec?.attrs?.admin_label||''}`.toLowerCase();
    if(/parallax|reviews|video|black|hero|works|gallery/.test(cls) && !/#fff|#ffffff|#f2efe8/.test(bg)) return 'dark';
    if(/#050505|#000000|#070707|rgba\(0\s*,\s*0\s*,\s*0/.test(bg)) return 'dark';
    if(/#fff|#ffffff|#f2efe8/.test(bg)) return 'light';
    if(/#b89b5e/.test(bg)) return 'gold';
    return 'unknown';
  }
  function technical(sec){
    const h=`${sec.attrs.admin_label||''} ${sec.attrs.module_id||''}`.toLowerCase();
    return /\bcss\b/.test(h)||/-css\b/.test(h);
  }
  function isFinalCta(sec){
    const h=`${sec.attrs.admin_label||''} ${sec.attrs.module_id||''} ${sec.attrs.module_class||''}`.toLowerCase();
    return /\bcta\b/.test(h) && !/cta 01|cta 02|dm-cta/.test(h);
  }
  function isCallback(sec){return /te llamamos nosotros|cta 01|dm-cta-callback/i.test(sec.full);}
  function isContacts(sec){return /elige cómo contactar|elige c[oó]mo contactar|dm-cta-contacts/i.test(sec.full) && /whatsapp/i.test(sec.full);}

  function insertAt(input,index,html){return input.slice(0,index)+html+input.slice(index);}

  DM.injectCtas=(input,stats={ctas:0,ctaVariants:0})=>{
    let out=String(input||'');
    let ss=sections(out);
    if(ss.length<6||!/<h1\b/i.test(out)) return {shortcodes:out,stats};

    const existingContact=ss.find(isContacts);
    if(existingContact){
      const idx=ss.indexOf(existingContact);
      let prev=idx>0?ss[idx-1]:null;
      while(prev&&technical(prev)){prev=ss[--idx-1];}
      const wanted=bgType(prev)==='dark'?'light':'dark';
      const replacement=contactsCta(wanted);
      if(!existingContact.full.includes(`dm-cta-contacts-${wanted}`)){
        out=out.slice(0,existingContact.start)+replacement+out.slice(existingContact.end);
        stats.ctaVariants++;
      }
    }

    ss=sections(out);
    if(!ss.some(isCallback)){
      const finalIndex=Math.max(0,ss.findIndex(isFinalCta));
      const usable=ss.map((s,i)=>({s,i})).filter(x=>!technical(x.s)&&!isContacts(x.s)&&!isFinalCta(x.s)&&(finalIndex<0||x.i<finalIndex));
      const target=Math.max(1,Math.round(usable.length*.40)-1);
      let best=usable[target]||usable[Math.min(2,usable.length-1)];
      for(let d=0;d<usable.length;d++){
        for(const j of [target-d,target+d]){
          if(usable[j]&&bgType(usable[j].s)==='light'){best=usable[j];d=usable.length;break;}
        }
      }
      if(best){out=insertAt(out,best.s.end,callbackCta());stats.ctas++;}
    }

    ss=sections(out);
    if(!ss.some(isContacts)){
      let faq=ss.find(s=>/faq/i.test(`${s.attrs.admin_label||''} ${s.attrs.module_id||''} ${s.attrs.module_class||''}`));
      let index=faq?ss.indexOf(faq):Math.max(2,Math.round(ss.length*.72));
      index=Math.min(index,ss.length-1);
      const prev=ss[Math.max(0,index-1)];
      const variant=bgType(prev)==='dark'?'light':'dark';
      const at=faq?faq.start:ss[index].start;
      out=insertAt(out,at,contactsCta(variant));stats.ctas++;
    }
    return {shortcodes:out,stats};
  };
})();