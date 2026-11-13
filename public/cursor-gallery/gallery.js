/* Offline cursor gallery. Assets and native timing come from catalog.js. */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const catalog=window.CURSOR_CATALOG;
  const core=window.GalleryCore;
  const i18n=window.CursorGalleryI18n;
  if(!i18n)return;
  const key='cursor-gallery-v1';
  function readPreferences(){try{return JSON.parse(localStorage.getItem(key)||'{}');}catch{return{};}}
  const stored=readPreferences();
  const languages=i18n.locales.map(option=>option.id);
  function languageChoice(settings){
    const saved=settings?.languagePreference??settings?.locale;
    return languages.includes(saved)?saved:'system';
  }
  const browserLanguages=()=>navigator.languages?.length?navigator.languages:[navigator.language];
  function entryLanguage(settings){const requested=new URLSearchParams(location.search).get('lang');return requested==='system'||languages.includes(requested)?requested:languageChoice(settings);}
  let languagePreference=entryLanguage(stored);
  let locale=effectiveLanguage();
  const msg=(key,params)=>i18n.t(locale,key,params);
  const themeCopy=theme=>i18n.theme(locale,theme);
  const roleLabel=role=>i18n.role(locale,role);
  const tagLabel=id=>i18n.tag(locale,id);
  function showEnglishName(element, copy){
    const subtitle=copy.englishName!==copy.name?copy.englishName:'';
    element.textContent=subtitle;
    element.hidden=!subtitle;
  }
  const appearanceModes=['auto','light','dark','theme'];
  const pickers=new Map();
  let activePicker=null;
  function effectiveLanguage(){
    return i18n.resolveLocale(languagePreference==='system'?browserLanguages():[languagePreference]);
  }
  function persistPreferences(settings){
    try{localStorage.setItem(key,JSON.stringify({...settings,languagePreference,appearance:$('appearance').value}));}catch{}
  }
  function translatePage(){
    document.documentElement.lang=locale;
    document.title=msg('brand');
    for(const e of document.querySelectorAll('[data-i18n]'))e.textContent=msg(e.dataset.i18n);
    for(const attr of ['aria-label','placeholder','title']){
      for(const e of document.querySelectorAll('[data-i18n-'+attr+']'))e.setAttribute(attr,msg(e.getAttribute('data-i18n-'+attr)));
    }
    for(const e of document.querySelectorAll('[data-role-label]'))e.textContent=roleLabel(e.dataset.roleLabel);
    const system=$('language').querySelector('option[value="system"]');
    if(system)system.textContent=msg('languageSystem');
    refreshPickers();
  }
  function closePicker(restoreFocus=false){
    if(!activePicker)return;
    const {toggle,menu}=activePicker;
    activePicker=null;
    menu.hidden=true;toggle.setAttribute('aria-expanded','false');
    if(restoreFocus)toggle.focus({preventScroll:true});
  }
  function openPicker(picker){
    closePicker();
    const {select,toggle,menu}=picker;
    const options=[...select.options].filter(option=>!option.disabled);
    const items=options.map(option=>{
      const item=el('button','setting-option',option.label);item.type='button';item.tabIndex=-1;
      item.dataset.optionValue=option.value;item.setAttribute('role','option');
      item.setAttribute('aria-selected',String(option.selected));
      item.onclick=()=>{
        closePicker(true);
        if(select.value===option.value)return;
        select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));
      };
      return item;
    });
    if(!items.length)return;
    menu.replaceChildren(...items);menu.hidden=false;toggle.setAttribute('aria-expanded','true');
    menu.style.maxHeight='';menu.style.transform='';
    const anchor=toggle.getBoundingClientRect(),bounds=menu.getBoundingClientRect();
    const below=innerHeight-anchor.bottom-15,above=anchor.top-15;
    const opensUp=bounds.height>below&&above>below;
    menu.classList.toggle('opens-up',opensUp);
    menu.style.maxHeight=Math.min(bounds.height,Math.max(44,opensUp?above:below))+'px';
    const offset=bounds.right>innerWidth-8?innerWidth-8-bounds.right:Math.max(0,8-bounds.left);
    if(offset)menu.style.transform='translateX('+offset+'px)';
    activePicker=picker;
    (items.find(item=>item.dataset.optionValue===select.value)||items[0]).focus();
  }
  function refreshPickers(){
    for(const {select,toggle,menu,label,value} of pickers.values()){
      const name=label?.textContent.trim()||toggle.getAttribute('aria-label')||'';
      const selected=select.selectedOptions[0]?.label||'';
      if(value){
        value.textContent=selected;
        toggle.setAttribute('aria-label',[name,value.textContent].filter(Boolean).join(' · '));
        menu.setAttribute('aria-label',name);
      }else toggle.title=[name,selected].filter(Boolean).join(' · ');
      toggle.disabled=select.disabled;
    }
  }
  function installPickers(){
    for(const select of document.querySelectorAll('select[id]')){
      let toggle=$(select.id+'Toggle'),menu=$(select.id+'Menu'),value=null,label=select.labels?.[0];
      if(!toggle||!menu){
        const wrapper=el('div','select-picker');
        toggle=el('button','picker-toggle');toggle.type='button';toggle.id=select.id+'Toggle';
        menu=el('div','picker-menu');menu.id=select.id+'Menu';menu.hidden=true;menu.setAttribute('role','listbox');
        value=el('span','picker-value');
        const arrow=el('span','picker-chevron');arrow.setAttribute('aria-hidden','true');
        toggle.append(value,arrow);wrapper.append(toggle,menu);select.after(wrapper);
        if(label)label.htmlFor=toggle.id;
      }
      toggle.setAttribute('aria-haspopup','listbox');toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-controls',menu.id);
      select.hidden=true;toggle.hidden=false;
      const picker={select,toggle,menu,label,value};pickers.set(select.id,picker);
      toggle.onclick=e=>{e.preventDefault();if(activePicker===picker)closePicker();else openPicker(picker);};
      toggle.onkeydown=e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();openPicker(picker);}};
      menu.onkeydown=e=>{
        const items=[...menu.children],index=items.indexOf(document.activeElement);
      if(e.key==='Escape'){e.preventDefault();closePicker(true);return;}
        if(e.key==='Tab'){closePicker(true);return;}
        const next={ArrowDown:(index+1)%items.length,ArrowUp:(index+items.length-1)%items.length,Home:0,End:items.length-1}[e.key];
        if(next!==undefined){e.preventDefault();items[next].focus();return;}
        if(e.key.length===1&&e.key!==' '&&!e.ctrlKey&&!e.altKey&&!e.metaKey){
          const ordered=[...items.slice(index+1),...items.slice(0,index+1)];
          const match=ordered.find(item=>item.textContent.toLocaleLowerCase(locale).startsWith(e.key.toLocaleLowerCase(locale)));
          if(match){e.preventDefault();match.focus();}
        }
      };
      select.addEventListener('change',refreshPickers);
    }
    for(const event of ['pointerdown','focusin'])document.addEventListener(event,e=>{
      if(activePicker&&!activePicker.toggle.contains(e.target)&&!activePicker.menu.contains(e.target))closePicker();
    });
    refreshPickers();
  }
  $('language').replaceChildren(new Option('', 'system'),...i18n.locales.map(({id,label})=>new Option(label,id)));
  $('language').value=languagePreference;
  document.documentElement.dataset.appearance=$('appearance').value=appearanceModes.includes(stored?.appearance)?stored.appearance:'auto';
  translatePage();
  installPickers();
  const themes=catalog?.themes||[],roles=catalog?.roles||[];
  const legacyRoute={'#collection':'collection','#studio':'theme','#install':'guide'}[location.hash];
  if(core&&!location.search&&legacyRoute&&(legacyRoute!=='theme'||themes.length)){
    const themeId=core.safeSettings(stored,themes).themeId;
    history.replaceState(null,'',core.galleryHref(legacyRoute,{themeId}));
  }
  const route=core?.galleryRoute(location.search,themes)||{view:'home'};
  const view=route.view;
  if(view==='guide'){
    const guideCursor=$('guideCursor');
    const featured=themes.find(theme=>theme.id==='neon-flux'&&theme.thumbnail)||themes.find(theme=>theme.thumbnail);
    if(featured){
      guideCursor.src=featured.thumbnail;
      guideCursor.hidden=false;
    }
    const blogReturn=$('blogReturn');
    const address=blogReturn.dataset.blogUrl.trim();
    if(address){
      try{
        const url=new URL(address);
        if(url.protocol==='https:'||url.protocol==='http:'){
          blogReturn.href=url.href;
          blogReturn.hidden=false;
        }
      }catch{}
    }
  }
  document.documentElement.dataset.view=view;
  document.body.dataset.view=view;
  for(const panel of document.querySelectorAll('[data-view-panel]'))panel.hidden=panel.dataset.viewPanel!==view;
  for(const link of document.querySelectorAll('.site-nav [data-route]')){
    if(link.dataset.route===view)link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  }
  if(!catalog?.themes?.length||!core){
    $('studio').hidden=true;
    $('heroLab').hidden=true;
    const renderEmpty=()=>{
      translatePage();
      $('themeList').replaceChildren(Object.assign(document.createElement('p'),{className:'empty-state',textContent:msg('emptyCatalog')}));
      $('loadStatus').textContent=msg('emptyCatalog');
      $('loadStatus').hidden=false;
      $('homeFeatured').hidden=true;
    };
    const updateLanguage=()=>{locale=effectiveLanguage();renderEmpty();};
    $('language').onchange=e=>{languagePreference=e.target.value;updateLanguage();persistPreferences(stored);};
    window.addEventListener('languagechange',()=>{if(languagePreference==='system')updateLanguage();});
    $('appearance').onchange=e=>{document.documentElement.dataset.appearance=e.target.value;persistPreferences(stored);};
    for(const id of ['search','category','favoriteFilter'])$(id).disabled=true;
    refreshPickers();renderEmpty();
    return;
  }
  const byId=new Map(themes.map(t=>[t.id,t]));
  const trialKey='cursor-gallery-site-trial';
  function readSiteTrial(){
    try{
      const trial=JSON.parse(sessionStorage.getItem(trialKey));
      if(trial&&Object.hasOwn(byId.get(trial.themeId)?.roles||{},trial.role)&&typeof trial.auto==='boolean')return trial;
    }catch{}
    return null;
  }
  let siteTrial=readSiteTrial(),trialStart=performance.now(),standaloneFrame=0;
  const rolesById=new Map(roles.map(role=>[role.id,role]));
  const facetNames=['style','subject'];
  const hero={role:'Arrow'};
  const state={...core.safeSettings(stored,themes),liveCursor:!!siteTrial,role:'Arrow',tab:'library',playing:!matchMedia('(prefers-reduced-motion: reduce)').matches,
    elapsedMs:0,query:route.query||'',category:route.category||'all',favoritesOnly:route.favoritesOnly||false,
    style:route.style||'',subject:route.subject||'',roleGroup:'',roleTag:'',compareA:null,compareB:null};
  if(siteTrial)state.autoRole=siteTrial.auto;
  if(route.themeId){
    state.themeId=route.themeId;
    if(new URLSearchParams(location.search).get('theme')!==route.themeId)
      history.replaceState(history.state,'',core.galleryHref('theme',route));
    if(siteTrial?.themeId===route.themeId)state.role=siteTrial.role;
  }
  const homeThemes=[byId.get('neon-flux'),...themes.filter(theme=>theme.id!=='neon-flux')].filter(Boolean);
  const homeRoles=['Arrow','Hand','IBeam','Crosshair','Wait'];
  const home={index:Math.max(0,homeThemes.findIndex(theme=>theme.id===siteTrial?.themeId)),
    role:homeRoles.includes(siteTrial?.role)?siteTrial.role:'Arrow',playing:state.playing,elapsed:0,lastFrame:'',fullscreen:false};
  state.compareA=state.themeId;state.compareB=themes.find(t=>t.id!==state.themeId)?.id||state.themeId;
  const pointer={x:0,y:0,inside:false,visible:false,role:'Arrow',scope:null,themeId:state.themeId,left:0,top:0};
  const cache=new Map();let targets=[],detailTarget=null,last=performance.now(),lastPaint='',returnFocus=null,toastTimer;
  let spotlightVisible=true,spotlightFrame='',status='',collectionPage=route.page||1;
  let trialReturn=null,trialSampleRole='Arrow';
  const pointerCanvas=$('livePointer');
  const finePointer=()=>!matchMedia('(pointer: coarse)').matches;
  let resolveReady;const ready=new Promise(resolve=>resolveReady=resolve);

  function save(){persistPreferences(state);}
  function toast(message){const e=$('toast');if(!e)return;e.textContent=message;e.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.hidden=true,2400);}
  function current(){return byId.get(state.themeId);}
  function paintStandalonePointer(){
    standaloneFrame=0;
    if(!siteTrial||!finePointer())return;
    drawPointer();
    standaloneFrame=requestAnimationFrame(paintStandalonePointer);
  }
  function syncSiteTrial(){
    state.liveCursor=!!siteTrial;
    $('liveCursor').checked=state.liveCursor;
    const bar=$('siteTrialBar');
    bar.hidden=!siteTrial;
    $('siteTrialTitle').textContent=msg(finePointer()?'siteTrialTitle':'siteTrialPreview');
    if(siteTrial){
      const mode=siteTrial.auto?msg('siteTrialAuto'):roleLabel(siteTrial.role);
      $('siteTrialStatus').textContent=themeCopy(byId.get(siteTrial.themeId)).name+' · '+mode;
      if(finePointer()&&(view==='collection'||view==='guide')){
        if(!standaloneFrame)standaloneFrame=requestAnimationFrame(paintStandalonePointer);
      }
    }else if(standaloneFrame){
      cancelAnimationFrame(standaloneFrame);standaloneFrame=0;
    }
    if(view==='home')syncHome();
    if(view==='theme'){updateSpotlight();updateTrials();}
    drawPointer();
  }
  function setSiteTrial(trial){
    siteTrial=trial;
    trialStart=performance.now();
    if(trial)$('toast').hidden=true;
    try{
      if(trial)sessionStorage.setItem(trialKey,JSON.stringify(trial));
      else sessionStorage.removeItem(trialKey);
    }catch{}
    syncSiteTrial();
  }
  function stopSiteTrial(){
    hidePointer(false);
    setSiteTrial(null);
    toast(msg('escapeRestored'));
  }
  $('stopSiteTrial').onclick=()=>{
    stopSiteTrial();
    const control=$('roleDialog').open?$('closeDialog')
      :view==='home'?(finePointer()?$('homeTry'):$('homeOpenTrial'))
      :view==='theme'?(state.tab==='playground'?$('playgroundTitle'):$('tryTheme')):$('mainContent');
    control.focus({preventScroll:true});
  };
  matchMedia('(pointer: coarse)').addEventListener('change',syncSiteTrial);
  function themeHref(themeId){return core.galleryHref('theme',{themeId});}
  function collectionHref(page){
    const {query,category,favoritesOnly,style,subject}=state;
    return core.galleryHref('collection',{page,query,category,favoritesOnly,style,subject});
  }
  function updatePageTitle(){
    const name=view==='theme'?themeCopy(current()).name:msg(view==='collection'?'navCollection':'navAbout');
    document.title=view==='home'?msg('brand'):name+' · '+msg('brand');
  }
  function el(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
  function roleInfo(theme,role){return theme.roles[role]||theme.roles.Arrow;}
  function setDownload(id,theme){
    const a=$(id),url=theme.download?.zip;
    a.hidden=!url;
    if(url){a.href=url;a.download=theme.download.filename||'';}
    else a.removeAttribute('href');
  }
  function fileKinds(info){
    return [['ANI','kindAnimated',info.animated],['CUR','kindStatic',info.static]].filter(([, ,file])=>file).map(([ext,label])=>{
      const badge=el('span','file-kind',ext);badge.title=msg(label);badge.setAttribute('aria-label',msg(label)+' '+ext);return badge;
    });
  }
  function makeTag(id,action){
    const chip=el(typeof action==='function'?'button':action?'a':'span','tag-chip',tagLabel(id));
    chip.dataset.tag=id;
    if(typeof action==='function'){
      chip.type='button';chip.onclick=action;
      chip.setAttribute('aria-label',msg('filterRoleTag',{tag:chip.textContent}));
      chip.setAttribute('aria-pressed',String(state.roleTag===id));
    }else if(action){
      chip.href=action;
      chip.setAttribute('aria-label',msg('browseTag',{tag:chip.textContent}));
    }
    return chip;
  }
  function themeTags(theme,linked=false){
    return facetNames.flatMap(name=>(theme.facets?.[name]||[]).map(id=>{
      const chip=makeTag(id,linked?core.galleryHref('collection',{[name]:id}):null);
      chip.dataset.facet=name;
      return chip;
    }));
  }
  function setTags(container,tags){
    container.replaceChildren(...tags);
    container.hidden=!tags.length;
  }
  function setTagOptions(select,ids,selected){
    const options=[...new Set(ids)].map(id=>new Option(tagLabel(id),id));
    options.sort((a,b)=>a.text.localeCompare(b.text,locale));
    select.replaceChildren(select.options[0],...options);
    select.value=selected;
  }
  function renderTagFilters(){
    let available=false;
    for(const name of facetNames){
      const select=$(name+'Filter');
      const ids=themes.flatMap(theme=>theme.facets?.[name]||[]);
      setTagOptions(select,ids,state[name]);
      select.disabled=!ids.length;
      available=available||ids.length>0;
    }
    $('tagFilters').hidden=!available;
    syncTagFilters();
  }
  function syncTagFilters(){
    for(const name of facetNames)$(name+'Filter').value=state[name];
    $('clearTagFilters').hidden=!state.style&&!state.subject;
    refreshPickers();
  }

  function imageFor(url){
    if(cache.has(url)){const entry=cache.get(url);cache.delete(url);cache.set(url,entry);return entry;}
    const image=new Image();const record={image,loaded:false,error:false,promise:null};
    record.promise=new Promise(resolve=>{
      image.onload=()=>{record.loaded=true;lastPaint='';resolve(record);};
      image.onerror=()=>{record.error=true;resolve(record);status='error';updateStatus();};
    });
    image.src=url;cache.set(url,record);
    while(cache.size>48)cache.delete(cache.keys().next().value);
    return record;
  }
  function prepareTheme(theme){return Promise.all(roles.map(r=>imageFor(roleInfo(theme,r.id).atlas).promise));}

  function draw(canvas,theme,role,size,frame,hotspot=state.showHotspot){
    const record=imageFor(roleInfo(theme,role).atlas);if(!record.loaded||record.error)return false;
    const dpr=Math.min(devicePixelRatio||1,2),n=Math.round(size*dpr);
    if(canvas.width!==n||canvas.height!==n){canvas.width=n;canvas.height=n;canvas.style.width=size+'px';canvas.style.height=size+'px';}
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,size);ctx.imageSmoothingEnabled=!theme.pixelArt;
    const a=core.roleLayout(theme,role),fs=a.frameSize||128,columns=a.columns||10;
    ctx.drawImage(record.image,frame%columns*fs,Math.floor(frame/columns)*fs,fs,fs,0,0,size,size);
    if(hotspot){const p=roleInfo(theme,role).hotspot;const x=p[0]*size/128,y=p[1]*size/128;ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.strokeStyle='#d64939';ctx.lineWidth=1.5;ctx.stroke();ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.moveTo(x,y-6);ctx.lineTo(x,y+6);ctx.stroke();}
    return true;
  }

  function themeCard(theme){
    const local=themeCopy(theme),saved=state.favorites.includes(theme.id);
    const link=el('a','theme-item');link.href=themeHref(theme.id);link.dataset.themeId=theme.id;
    const sample=el('span','theme-sample');
    sample.setAttribute('aria-hidden','true');
    sample.style.setProperty('--item-color',theme.accent||'#7855ff');
    if(theme.thumbnail){
      const img=el('img','theme-thumb');img.src=theme.thumbnail;img.alt='';img.width=92;img.height=92;
      img.decoding='async';sample.append(img);
    }
    if(saved)sample.append(el('span','theme-star','★'));
    const copy=el('span','theme-copy'),english=el('small','theme-english');
    english.lang='en';
    showEnglishName(english,local);
    copy.append(el('strong',null,local.name),english,el('span','theme-tags',local.group));
    const tags=el('span','tag-list');
    setTags(tags,themeTags(theme));
    const action=el('span','theme-open-label',msg('openTheme'));
    const arrow=el('span',null,'→');arrow.setAttribute('aria-hidden','true');action.append(arrow);
    copy.append(tags,action);
    link.append(sample,copy);
    link.setAttribute('aria-label',msg('openTheme')+' · '+(saved?msg('favoriteName',{name:local.name}):local.name));
    return link;
  }
  function homeTheme(){return homeThemes[home.index];}
  function syncHome(announce=false,reveal=false){
    const featured=homeTheme(),copy=themeCopy(featured),link=$('homeFeatured');
    const accent=featured.accent||'#7855ff';
    link.href=themeHref(featured.id);link.dataset.themeId=featured.id;
    const trialLink=$('homeOpenTrial');
    trialLink.href=core.galleryHref('theme',{themeId:featured.id,tryRole:home.role});
    trialLink.hidden=false;
    $('homeStage').style.setProperty('--stage-accent',accent);
    document.documentElement.style.setProperty('--theme-accent',accent);
    $('homeFeaturedName').textContent=copy.name;
    showEnglishName($('homeFeaturedEnglish'),copy);
    $('homeFeaturedGroup').textContent=copy.group;
    $('homeRoleName').textContent=roleLabel(home.role);
    const index=$('homeIndex');
    if(index)index.textContent=[home.index+1,homeThemes.length].map(n=>String(n).padStart(2,'0')).join(' / ');
    for(const thumbnail of $('homeCards').children){
      const selected=thumbnail.dataset.themeId===featured.id;
      thumbnail.setAttribute('aria-pressed',String(selected));
      if(selected&&reveal){
        const rail=$('homeCards'),viewport=rail.getBoundingClientRect(),item=thumbnail.getBoundingClientRect();
        if(item.left<viewport.left)rail.scrollLeft-=viewport.left-item.left;
        if(item.right>viewport.right)rail.scrollLeft+=item.right-viewport.right;
      }
    }
    for(const option of $('homeRoleOptions').children)
      option.setAttribute('aria-pressed',String(option.dataset.cursor===home.role));
    for(const [id,pressed,key] of [
      ['homePause',!home.playing,home.playing?'homePause':'homePlay'],
      ['homeFullscreen',home.fullscreen,home.fullscreen?'homeExitFullscreen':'homeFullscreen'],
      ['homeTry',!!siteTrial,siteTrial?'homeStopTrial':'homeTry'],
    ]){
      const button=$(id);
      button.setAttribute('aria-pressed',String(pressed));button.setAttribute('aria-label',msg(key));button.title=msg(key);
    }
    $('homeTry').hidden=!finePointer();
    const trialText=$('homeTry').querySelector('[data-i18n]');
    if(trialText)trialText.textContent=msg(siteTrial?'homeStopTrial':'homeTry');
    const bounds=roleInfo(featured,home.role).previewBounds;
    const size=core.roleLayout(featured,home.role).frameSize;
    $('homeCanvas').style.transform=bounds
      ? 'translate('+(50-50*(bounds[0]+bounds[2])/size)+'%, '+(50-50*(bounds[1]+bounds[3])/size)+'%)'
      : '';
    if(announce)$('homeStatus').textContent=msg('homeSelection',{theme:copy.name,role:roleLabel(home.role)});
  }
  function renderHome(){
    $('homeCards').replaceChildren(...homeThemes.map((theme,index)=>{
      const name=themeCopy(theme).name,button=el('button','stage-thumbnail');button.type='button';
      button.dataset.themeId=theme.id;button.title=name;button.setAttribute('aria-label',name);
      button.style.setProperty('--item-color',theme.accent||'#7855ff');
      const thumb=el('img');thumb.src=theme.thumbnail;thumb.alt='';thumb.width=48;thumb.height=48;
      const tile=el('span','stage-dock-item');tile.append(thumb);
      button.append(tile);button.onclick=()=>chooseHome(index,home.role);
      return button;
    }));
    $('homeRoleOptions').replaceChildren(...homeRoles.map(role=>{
      const button=el('button','stage-role',roleLabel(role));button.type='button';
      button.dataset.cursor=role;button.onclick=()=>chooseHome(home.index,role);
      return button;
    }));
    syncHome(false,true);
  }
  function chooseHome(index,role){
    const next=(index+homeThemes.length)%homeThemes.length;
    if(next===home.index&&role===home.role)return;
    home.index=next;home.role=role;home.elapsed=0;home.lastFrame='';
    const canvas=$('homeCanvas');
    canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
    syncHome(true,true);
    if(siteTrial)setSiteTrial({themeId:homeTheme().id,role:home.role,auto:false});
    paintHome();
  }
  function paintHome(){
    const theme=homeTheme(),role=home.role;
    const frame=core.frameAt(core.roleTiming(theme,role),home.elapsed);
    const signature=theme.id+'|'+role+'|'+frame;
    if(signature!==home.lastFrame&&draw($('homeCanvas'),theme,role,360,frame,false))home.lastFrame=signature;
    drawPointer();
  }
  function animateHome(){
    let previous=performance.now();
    function tick(now){
      if(home.playing&&!document.hidden)home.elapsed+=Math.min(100,now-previous);
      previous=now;paintHome();requestAnimationFrame(tick);
    }
    imageFor(roleInfo(homeTheme(),home.role).atlas).promise.then(()=>{paintHome();resolveReady();});
    requestAnimationFrame(tick);
  }
  function setupHomeAtmosphere(){
    const layer=$('homeAtmosphere');
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    let pending=0,lastX=0,lastY=0;
    function paint(){
      pending=0;
      const stage=$('homeStage').getBoundingClientRect();
      if(lastX<stage.left||lastX>stage.right||lastY<stage.top||lastY>stage.bottom){
        reset();return;
      }
      const x=(lastX-stage.left)/stage.width-.5;
      const y=(lastY-stage.top)/stage.height-.5;
      layer.style.setProperty('--atmosphere-x',(x*380).toFixed(1)+'px');
      layer.style.setProperty('--atmosphere-y',(y*280).toFixed(1)+'px');
    }
    function reset(){
      cancelAnimationFrame(pending);pending=0;
      layer.style.removeProperty('--atmosphere-x');
      layer.style.removeProperty('--atmosphere-y');
    }
    document.addEventListener('pointermove',e=>{
      if(e.pointerType!=='mouse'||motion.matches)return;
      lastX=e.clientX;lastY=e.clientY;
      if(!pending)pending=requestAnimationFrame(paint);
    },{passive:true});
    document.addEventListener('pointerleave',reset);
    window.addEventListener('blur',reset);
    motion.addEventListener('change',reset);
    document.addEventListener('visibilitychange',()=>{
      layer.toggleAttribute('data-paused',document.hidden);
      if(document.hidden)reset();
    });
  }
  function setupCursorBursts(){
    const stage=$('homeStage'),surface=$('homeGesture');
    const bursts=$('cursorBursts');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const sprites=[];
    const burstDuration=1450,burstSize=64;
    let raf=0,press=null,lastChoice=-1;

    function schedule(){
      if(!raf)raf=requestAnimationFrame(paint);
    }
    function reset(){
      cancelAnimationFrame(raf);raf=0;
      sprites.length=0;press=null;
      bursts.replaceChildren();
    }
    function point(e){
      return {x:e.clientX,y:e.clientY,time:performance.now()};
    }
    function paint(now){
      raf=0;
      for(let index=sprites.length-1;index>=0;index--){
        const sprite=sprites[index],elapsed=Math.max(0,now-sprite.start);
        if(elapsed>=burstDuration){
          sprite.element.remove();sprites.splice(index,1);continue;
        }
        const frame=core.frameAt(core.roleTiming(sprite.theme,sprite.role),elapsed);
        if(sprite.frame!==frame&&draw(sprite.canvas,sprite.theme,sprite.role,burstSize,frame,false)){
          sprite.frame=frame;sprite.element.dataset.ready='';
        }
      }
      if(sprites.length)schedule();
    }
    function scatter(p){
      const width=bursts.clientWidth,height=bursts.clientHeight;
      const margin=burstSize/2+8;
      const distance=Math.min(width,height)*(.12+Math.random()*.12);
      const angle=Math.random()*Math.PI*2;
      let x=Math.cos(angle)*distance,y=Math.sin(angle)*distance;
      if(p.x+x<margin||p.x+x>width-margin)x=-x;
      if(p.y+y<margin||p.y+y>height-margin)y=-y;
      return {
        x:Math.max(margin,Math.min(width-margin,p.x+x))-p.x,
        y:Math.max(margin,Math.min(height-margin,p.y+y))-p.y,
        rotation:(Math.random()-.5)*57
      };
    }
    function popCursor(p){
      const roleCount=roles.length,total=themes.length*roleCount;
      if(!total)return;
      let choice=Math.floor(Math.random()*(total-(lastChoice>=0&&total>1?1:0)));
      if(total>1&&lastChoice>=0&&choice>=lastChoice)choice++;
      lastChoice=choice;
      const theme=themes[Math.floor(choice/roleCount)],role=roles[choice%roleCount].id;
      const element=el('div','cursor-burst'),image=el('canvas');
      const direction=scatter(p);
      element.dataset.themeId=theme.id;element.dataset.role=role;
      element.style.left=p.x+'px';element.style.top=p.y+'px';
      element.style.setProperty('--burst-x',direction.x+'px');
      element.style.setProperty('--burst-y',direction.y+'px');
      element.style.setProperty('--burst-turn',direction.rotation+'deg');
      element.style.setProperty('--burst-color',theme.accent||'#7855ff');
      if(sprites.length===4)sprites.shift().element.remove();
      element.append(image);bursts.append(element);
      sprites.push({element,canvas:image,theme,role,frame:-1,start:p.time});
      schedule();
    }
    const isBlank=target=>target===surface||target===stage;
    stage.addEventListener('pointerdown',e=>{
      if(reduced.matches||!e.isPrimary||e.button!==0||!isBlank(e.target))return;
      if(e.pointerType==='mouse')popCursor(point(e));
      else press={id:e.pointerId,x:e.clientX,y:e.clientY};
    });
    stage.addEventListener('pointercancel',()=>{press=null;});
    stage.addEventListener('pointerup',e=>{
      const start=press;press=null;
      if(reduced.matches||!start||start.id!==e.pointerId||!isBlank(e.target)||Math.hypot(e.clientX-start.x,e.clientY-start.y)>8)return;
      popCursor(point(e));
    });
    reduced.addEventListener('change',reset);
    window.addEventListener('blur',reset);
    window.addEventListener('pagehide',reset);
    window.addEventListener('resize',reset);
  }
  function setupHomeDock(){
    const rail=$('homeCards');
    const motion=matchMedia('(prefers-reduced-motion: no-preference) and (any-hover: hover)');
    let magnified=new Set();
    function clearDock(){
      for(const button of magnified)button.style.removeProperty('--dock-scale');
      magnified.clear();
    }
    rail.addEventListener('pointermove',e=>{
      if(!motion.matches||e.pointerType!=='mouse')return;
      const [first,second]=rail.children;
      if(!first)return;
      const step=second?second.offsetLeft-first.offsetLeft:first.offsetWidth;
      const x=e.clientX-rail.getBoundingClientRect().left+rail.scrollLeft;
      const center=(x-first.offsetLeft-first.offsetWidth/2)/step;
      const next=new Set();
      for(let index=Math.max(0,Math.floor(center)-1);index<=Math.ceil(center)+1;index++){
        const button=rail.children[index];
        const proximity=1-Math.abs(center-index)/1.8;
        if(!button||proximity<=0)continue;
        button.style.setProperty('--dock-scale',(1+.64*proximity**2).toFixed(3));
        next.add(button);
      }
      for(const button of magnified)if(!next.has(button))button.style.removeProperty('--dock-scale');
      magnified=next;
    },{passive:true});
    for(const event of ['pointerleave','pointercancel','scroll'])rail.addEventListener(event,clearDock,{passive:true});
    window.addEventListener('blur',clearDock);
    motion.addEventListener('change',clearDock);
  }
  function setupHome(){
    const stage=$('homeStage'),gesture=$('homeGesture');
    const step=direction=>chooseHome(home.index+direction,home.role);
    $('homePrevious').onclick=()=>step(-1);$('homeNext').onclick=()=>step(1);
    setupHomeDock();
    $('homePause').onclick=()=>{home.playing=!home.playing;syncHome();};
    $('homeTry').onclick=()=>siteTrial?stopSiteTrial():setSiteTrial({themeId:homeTheme().id,role:home.role,auto:false});
    $('homeFullscreen').onclick=async()=>{
      try{
        if(document.fullscreenElement)await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      }catch{toast(msg('homeFullscreenUnavailable'));}
    };
    document.addEventListener('fullscreenchange',()=>{
      const previous=home.fullscreen;
      home.fullscreen=Boolean(document.fullscreenElement);
      if(previous&&!home.fullscreen&&siteTrial)stopSiteTrial();
      else syncHome();
    });
    stage.addEventListener('keydown',e=>{
      if(e.altKey||e.ctrlKey||e.metaKey)return;
      const direction={ArrowLeft:-1,ArrowRight:1}[e.key];
      if(direction){e.preventDefault();step(direction);}
    });
    let swipe;
    gesture.addEventListener('pointerdown',e=>{
      if(e.pointerType==='touch'&&e.isPrimary)swipe={id:e.pointerId,x:e.clientX,y:e.clientY};
    });
    gesture.addEventListener('pointerup',e=>{
      if(swipe?.id!==e.pointerId)return;
      const x=e.clientX-swipe.x,y=e.clientY-swipe.y;
      swipe=null;
      if(Math.abs(x)>=45&&Math.abs(x)>Math.abs(y)*1.4)step(x<0?1:-1);
    });
    gesture.addEventListener('pointercancel',()=>{swipe=null;});
  }
  function renderThemeList(){
    const focusedTheme=document.activeElement?.closest?.('.theme-item')?.dataset.themeId;
    const query=state.query.trim().toLocaleLowerCase(locale);
    const result=core.filterThemes(themes,'',state.category,state.favoritesOnly,state.favorites,state).filter(theme=>{
      const local=themeCopy(theme);
      const ids=facetNames.flatMap(name=>theme.facets?.[name]||[]);
      return !query||[theme.id,theme.name,theme.description,...(theme.tags||[]),local.name,local.englishName,local.description,local.group,...(local.tags||[]),...ids,...ids.map(tagLabel)]
        .join(' ').toLocaleLowerCase(locale).includes(query);
    });
    const list=$('themeList');list.replaceChildren();
    $('themeCount').textContent=msg('themeTotal',{count:result.length});
    const page=core.themePage(result,collectionPage);
    collectionPage=page.page;
    renderPagination(page,result.length);
    const canonical=new URL(collectionHref(collectionPage),location.href);
    if(canonical.search!==location.search)history.replaceState(null,'',canonical);
    if(!result.length){
      const empty=el('div','empty-state');
      const clear=el('button','clear-search',msg('clearFilters'));clear.type='button';
      clear.onclick=()=>{
        Object.assign(state,{query:'',category:'all',favoritesOnly:false,style:'',subject:''});
        $('search').value='';$('category').value='all';
        updateFavoriteFilter();syncTagFilters();resetCollectionPage();$('search').focus();
      };
      empty.append(el('p',null,msg('emptyResults')),clear);list.append(empty);return;
    }
    list.replaceChildren(...page.items.map(themeCard));
    if(focusedTheme){const replacement=[...list.children].find(b=>b.dataset.themeId===focusedTheme);replacement?.focus({preventScroll:true});}
  }
  function resetCollectionPage(){collectionPage=1;renderThemeList();}
  function renderPagination(page,total){
    $('pagination').hidden=page.pages<=1;
    $('pageLabel').textContent=msg('pageRange',{start:page.start,end:page.end,total});
    for(const [id,number] of [['pagePrev',page.page-1],['pageNext',page.page+1]]){
      const link=$(id),enabled=number>=1&&number<=page.pages;
      link.setAttribute('aria-disabled',String(!enabled));
      if(enabled)link.href=collectionHref(number);
      else link.removeAttribute('href');
    }
    $('pageNumbers').replaceChildren(...Array.from({length:page.pages},(_,index)=>{
      const number=index+1,b=el('a','page-number',number.toLocaleString(locale));b.href=collectionHref(number);
      b.setAttribute('aria-label',msg('pageNumber',{page:number}));
      if(number===page.page)b.setAttribute('aria-current','page');
      return b;
    }));
  }
  function updateFavoriteFilter(){const b=$('favoriteFilter');b.setAttribute('aria-pressed',String(state.favoritesOnly));b.classList.toggle('selected',state.favoritesOnly);}
  function updateFavorite(){
    const button=$('favoriteTheme'),on=state.favorites.includes(state.themeId);
    button.setAttribute('aria-pressed',String(on));
    button.title=msg(on?'favorited':'favorite');
  }
  function header(){
    const t=current(),copy=themeCopy(t),timing=core.roleTiming(t,state.role);
    $('themeName').textContent=copy.name;
    showEnglishName($('themeEnglish'),copy);
    $('themeDescription').textContent=copy.description||copy.group;
    $('themeMeta').textContent=msg('timing',{count:roles.length,role:roleLabel(state.role),seconds:(timing.cycleMs/1000).toLocaleString(locale,{maximumFractionDigits:2}),frames:timing.frames});
    $('themeVersion').hidden=!t.version;
    if(t.version)$('themeVersion').textContent=msg('version',{version:t.version});
    document.documentElement.style.setProperty('--theme-accent',t.accent||'#7855ff');
    setDownload('downloadTheme',t);
    updateFavorite();$('timeline').max=timing.frames-1;
  }
  function renderThemeTags(){setTags($('themeTags'),themeTags(current(),true));}
  function renderDetailTags(theme,role){
    setTags($('detailTags'),[...(rolesById.get(role)?.tags||[]).map(id=>makeTag(id)),...themeTags(theme,true)]);
  }
  function makeRoleCard(theme,r){
    const article=el('article','role-card');article.dataset.role=r.id;article.classList.toggle('selected',state.role===r.id);
    const label=roleLabel(r.id),english=i18n.role('en',r.id);
    const open=el('button','role-open');open.type='button';open.setAttribute('aria-label',msg('viewDetails',{role:label}));
    const stage=el('span','stage');const c=el('canvas');c.setAttribute('aria-hidden','true');stage.append(c);
    const title=el('span','role-title',label),englishTitle=el('small',null,english);englishTitle.lang='en';englishTitle.hidden=english===label;
    open.append(stage,title,englishTitle);open.onclick=()=>openDetail(r.id,open);
    const actions=el('div','role-actions');const info=roleInfo(theme,r.id);actions.append(...fileKinds(info));
    const tryButton=el('button','try-role',msg('tryShort')+' ↓');tryButton.type='button';tryButton.dataset.cursor=r.id;tryButton.title=msg('tryRole',{role:label});tryButton.setAttribute('aria-label',tryButton.title);tryButton.setAttribute('aria-controls','playgroundPanel');
    tryButton.onclick=()=>enterTrial(r.id,roleReturn(r.id,'.try-role'));actions.append(tryButton);article.append(open,actions);
    const tags=el('div','tag-list role-tags');
    setTags(tags,(r.tags||[]).map(id=>makeTag(id,()=>{
      state.roleTag=state.roleTag===id?'':id;
      renderLibrary();
      $('roleTagFilterToggle').focus();
    })));
    article.insertBefore(tags,actions);
    targets.push({canvas:c,theme,role:r.id,size:()=>state.size});return article;
  }
  function renderLibrary(){
    const group=roles.filter(role=>!state.roleGroup||role.groupId===state.roleGroup);
    const ids=group.flatMap(role=>role.tags||[]);
    if(!ids.includes(state.roleTag))state.roleTag='';
    setTagOptions($('roleTagFilter'),ids,state.roleTag);
    refreshPickers();
    const matching=group.filter(role=>!state.roleTag||role.tags.includes(state.roleTag));
    targets=[];
    $('roleGrid').replaceChildren(...matching.map(role=>makeRoleCard(current(),role)));
    $('roleGridCount').textContent=msg('roleGridTotal',{count:matching.length});
    prepareTheme(current());lastPaint='';
  }
  function compareOptions(){for(const id of ['compareA','compareB']){const s=$(id);s.replaceChildren(...themes.map(t=>new Option(themeCopy(t).name,t.id)));} $('compareA').value=state.compareA;$('compareB').value=state.compareB;refreshPickers();}
  function renderCompare(){
    targets=[];const grid=$('compareGrid'),a=byId.get(state.compareA),b=byId.get(state.compareB);grid.replaceChildren();
    for(const r of roles){const row=el('div','compare-row');row.append(el('div','compare-role',roleLabel(r.id)));for(const t of [a,b]){const cell=el('div','compare-cell');const stage=el('div','stage');const c=el('canvas');c.setAttribute('aria-label',msg('comparisonPreview',{theme:themeCopy(t).name,role:roleLabel(r.id)}));stage.append(c);const links=el('div','compare-links');links.append(...fileKinds(roleInfo(t,r.id)));cell.append(stage,links);row.append(cell);targets.push({canvas:c,theme:t,role:r.id,size:()=>state.size});}grid.append(row);}
    prepareTheme(a);prepareTheme(b);lastPaint='';
  }
  function setTab(tab){
    if(tab!=='playground')trialReturn=null;
    else if(state.tab!==tab)trialReturn={tab:state.tab,selector:state.tab==='compare'?'#tabCompare':'#tabLibrary'};
    state.tab=tab;for(const t of ['library','compare','playground']){$(t+'Panel').hidden=tab!==t;const button=$('tab'+t[0].toUpperCase()+t.slice(1));button.classList.toggle('selected',tab===t);button.setAttribute('aria-selected',String(tab===t));button.tabIndex=tab===t?0:-1;}
    $('compareToggle').setAttribute('aria-pressed',String(tab==='compare'));
    if(tab==='library')renderLibrary();else if(tab==='compare')renderCompare();else targets=[];lastPaint='';
  }
  function selectTheme(id){
    if(view!=='theme'||!byId.has(id))return;hidePointer(false);state.themeId=id;state.role='Arrow';state.elapsedMs=0;pointer.role='Arrow';pointer.themeId=id;state.compareA=id;$('compareA').value=id;
    if(state.compareB===id){state.compareB=themes.find(t=>t.id!==id)?.id||id;$('compareB').value=state.compareB;}
    trialSampleRole='Arrow';
    if(siteTrial)setSiteTrial({themeId:id,role:state.role,auto:state.autoRole});
    header();renderThemeTags();updatePageTitle();updateSpotlight();refreshPickers();if(state.tab==='compare')renderCompare();else if(state.tab==='library')renderLibrary();prepareTheme(current());save();
  }
  function setRole(role){if(!current().roles[role])return;state.role=role;pointer.role=role;document.querySelectorAll('.role-card').forEach(c=>c.classList.toggle('selected',c.dataset.role===role));header();updateTrials();lastPaint='';}
  function updateTrials(){
    for(const button of $('roleTrials').children)button.setAttribute('aria-pressed',String(!!siteTrial&&!siteTrial.auto&&siteTrial.role===button.dataset.cursor));
    $('trialAuto').setAttribute('aria-pressed',String(!!siteTrial?.auto));
    const status=state.liveCursor?msg('activeRole',{role:roleLabel(trialRole())}):msg('trialOff');
    if($('trialRoleStatus').textContent!==status)$('trialRoleStatus').textContent=status;
  }
  function lockRole(role){
    state.autoRole=$('autoRole').checked=false;
    setRole(role);
    setSiteTrial({themeId:state.themeId,role,auto:false});
    save();
  }

  function trialRole(){return siteTrial?(siteTrial.auto?trialSampleRole:siteTrial.role):state.role;}
  function enableAutomaticTrial(){
    state.autoRole=$('autoRole').checked=true;
    setSiteTrial({themeId:state.themeId,role:state.role,auto:true});
    save();
  }
  function roleReturn(role,action){return '#roleGrid [data-role="'+CSS.escape(role)+'"] '+action;}
  function enterTrial(role,selector){
    const previousTab=state.tab==='playground'?'library':state.tab;
    trialSampleRole=role||state.role;
    if(role)lockRole(role);else enableAutomaticTrial();
    revealPlayground(previousTab,selector);
  }
  function revealPlayground(previousTab,selector){
    setTab('playground');
    trialReturn={tab:previousTab,selector};
    hidePointer();
    $('playgroundTitle').focus({preventScroll:true});
    $('playgroundPanel').scrollIntoView({block:'start',behavior:'instant'});
  }

  function openDetail(role,focus){
    returnFocus=focus;const t=current(),info=t.roles[role];setRole(role);$('detailName').textContent=themeCopy(t).name+' · '+roleLabel(role);
    const [x,y]=info.hotspot;$('detailInfo').textContent=msg('detailHotspot',{x,y});
    updateDetailTrialLabel(role);
    renderDetailTags(t,role);
    for(const [id,file] of [['Animated',info.animated],['Static',info.static]]){$('detail'+id).hidden=!file;$('detail'+id).querySelector('dd').textContent=file?.split('/').at(-1)||'';}
    setDownload('downloadDetail',t);
    detailTarget={canvas:$('detailCanvas'),theme:t,role,size:()=>Math.min(state.size*2,256)};
    const dialog=$('roleDialog');
    if(siteTrial)dialog.append($('siteTrialBar'),pointerCanvas);
    dialog.showModal();$('closeDialog').focus();lastPaint='';
  }
  function updateDetailTrialLabel(role){$('tryDetailLabel').textContent=msg('tryRole',{role:roleLabel(role)});}
  function restoreTrialOverlay(){
    if(pointerCanvas.parentElement!==document.body)document.body.append($('siteTrialBar'),pointerCanvas);
  }
  function closeDetail(){
    const dialog=$('roleDialog');
    if(!dialog.open)return;
    dialog.close();
    restoreTrialOverlay();
  }
  $('closeDialog').onclick=closeDetail;
  $('tryDetail').onclick=()=>{
    if(!detailTarget)return;
    const role=detailTarget.role;
    returnFocus=null;
    closeDetail();
    enterTrial(role,roleReturn(role,'.role-open'));
  };
  $('roleDialog').addEventListener('close',()=>{
    restoreTrialOverlay();
    detailTarget=null;returnFocus?.focus();returnFocus=null;
  });
  $('roleDialog').addEventListener('click',e=>{if(e.target===$('roleDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDetail();}});

  function hidePointer(clearInside=true){
    if(pointer.visible){
      pointer.visible=false;pointerCanvas.hidden=true;
      document.documentElement.classList.remove('site-cursor-active','custom-cursor-active','hero-cursor-active','home-cursor-active');
    }
    if(clearInside){pointer.inside=false;pointer.scope=null;}
  }
  function resolveRole(target){
    if(!(target instanceof Element))return'Arrow';
    const explicit=target.closest('[data-cursor]');if(explicit&&rolesById.has(explicit.dataset.cursor))return explicit.dataset.cursor;
    if(target.closest(':disabled,[aria-disabled="true"]'))return'No';
    if(target.closest('textarea,input:not([type=button]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=submit]),[contenteditable="true"]'))return'IBeam';
    if(target.closest('a,button,select,label,input[type=checkbox],input[type=range]'))return'Hand';
    return'Arrow';
  }
  function liveRole(){
    return siteTrial?(siteTrial.auto?pointer.role:siteTrial.role):state.role;
  }
  function drawPointer(){
    if(!siteTrial||!pointer.inside||!finePointer()||document.visibilityState!=='visible'||!document.hasFocus()){hidePointer(false);return;}
    const t=byId.get(siteTrial.themeId),role=liveRole(),info=roleInfo(t,role),record=imageFor(info.atlas);
    if(!record.loaded||record.error){hidePointer(false);return;}
    const size=state.cursorSize,p=core.cursorPosition(pointer.x,pointer.y,info.hotspot,size);
    const elapsed=view==='theme'&&t===current()?state.elapsedMs
      :view==='home'&&t===homeTheme()?home.elapsed
      :state.playing?(performance.now()-trialStart)*state.speed:0;
    const frame=core.frameAt(core.roleTiming(t,role),elapsed);
    try{if(!draw(pointerCanvas,t,role,size,frame,false)){hidePointer(false);return;}}catch{hidePointer(false);return;}
    pointerCanvas.style.left=p.left+'px';pointerCanvas.style.top=p.top+'px';pointerCanvas.hidden=false;pointer.visible=true;pointer.themeId=t.id;pointer.left=p.left;pointer.top=p.top;
    document.documentElement.classList.add('site-cursor-active');
    document.documentElement.classList.toggle('custom-cursor-active',pointer.scope==='studio');
    document.documentElement.classList.toggle('hero-cursor-active',pointer.scope==='hero');
    document.documentElement.classList.toggle('home-cursor-active',pointer.scope==='home');
  }
  function updatePointerTarget(target){
    if(!target||!document.body.contains(target)&&target!==document.documentElement){hidePointer();return;}
    const scope=view==='home'?($('homeGesture').contains(target)?'home':null)
      :$('heroLab').contains(target)?'hero':$('studio').contains(target)?'studio':null;
    pointer.inside=true;pointer.scope=scope||'site';pointer.role=resolveRole(target);
    if(scope==='hero'&&siteTrial?.auto)setHeroRole(pointer.role);
    drawPointer();
  }
  document.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse'){hidePointer();return;}
    pointer.x=e.clientX;pointer.y=e.clientY;
    updatePointerTarget(e.target);
  },{passive:true});
  document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.pointerType==='pen')hidePointer();},{passive:true});
  document.addEventListener('pointerout',e=>{if(e.relatedTarget===null)hidePointer();});
  document.addEventListener('mouseleave',()=>hidePointer());
  document.addEventListener('pointerleave',()=>hidePointer());
  window.addEventListener('blur',()=>hidePointer());
  document.addEventListener('scroll',()=>{
    if(pointer.inside)updatePointerTarget(document.elementFromPoint(pointer.x,pointer.y));
  },{capture:true,passive:true});
  document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden)hidePointer();});
  window.addEventListener('pagehide',()=>hidePointer());
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if($('roleDialog').open){e.preventDefault();closeDetail();}
      if(siteTrial)stopSiteTrial();
      if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
      return;
    }
    if(view!=='theme')return;
    if(e.code==='Space'&&(e.target===document.body||e.target===document.documentElement)){e.preventDefault();togglePlay();}
  });

  function updatePlayback(){
    const button=$('playPause'),action=msg(state.playing?'pauseAnimation':'playAnimation');
    button.setAttribute('aria-label',action);
    button.title=action;
    button.setAttribute('aria-pressed',String(!state.playing));
  }
  function togglePlay(){state.playing=!state.playing;last=performance.now();updatePlayback();}
  function seek(index){const t=core.roleTiming(current(),state.role),i=Math.max(0,Math.min(t.frames-1,Math.round(index)));state.elapsedMs=t.durationsMs.slice(0,i).reduce((a,b)=>a+b,0)+1e-6;state.playing=false;updatePlayback();lastPaint='';}
  function applyAppearance(){document.body.dataset.background=state.background;document.documentElement.style.setProperty('--custom-background',state.customColor);$('customColor').hidden=state.background!=='custom';lastPaint='';}
  function restoreControls(){for(const id of ['size','background','speed','cursorSize'])$(id).value=String(state[id]);for(const id of ['showHotspot','liveCursor','autoRole'])$(id).checked=state[id];$('customColor').value=state.customColor;refreshPickers();applyAppearance();updatePlayback();}
  $('search').addEventListener('input',e=>{state.query=e.target.value;resetCollectionPage();});
  $('appearance').onchange=e=>{document.documentElement.dataset.appearance=e.target.value;save();};
  function updateLanguage(){
    locale=effectiveLanguage();translatePage();updatePageTitle();updateStatus();
    if(view==='home')renderHome();
    if(view==='collection'){renderTagFilters();renderThemeList();}
    if(view==='theme'){
      header();renderThemeTags();compareOptions();setTab(state.tab);renderTrials();
      if(detailTarget){
        renderDetailTags(detailTarget.theme,detailTarget.role);
        updateDetailTrialLabel(detailTarget.role);
      }
      updatePlayback();updateSpotlight();$('toast').hidden=true;
    }
    syncSiteTrial();
  }
  $('language').onchange=e=>{languagePreference=e.target.value;updateLanguage();save();};
  window.addEventListener('languagechange',()=>{if(languagePreference==='system')updateLanguage();});
  window.addEventListener('pageshow',e=>{
    if(!e.persisted)return;
    siteTrial=readSiteTrial();
    if(view==='theme'&&siteTrial){
      state.autoRole=$('autoRole').checked=siteTrial.auto;
      if(siteTrial.themeId===state.themeId)setRole(siteTrial.role);
    }
    const shared=readPreferences();
    state.favorites=core.safeSettings(shared,themes).favorites;
    languagePreference=$('language').value=entryLanguage(shared);
    const appearance=appearanceModes.includes(shared?.appearance)?shared.appearance:'auto';
    document.documentElement.dataset.appearance=$('appearance').value=appearance;
    if(effectiveLanguage()!==locale)updateLanguage();
    else {
      refreshPickers();
      if(view==='home')renderHome();
      if(view==='collection')renderThemeList();
      if(view==='theme')updateFavorite();
    }
    syncSiteTrial();
  });
  $('category').onchange=e=>{state.category=e.target.value;resetCollectionPage();};
  for(const name of facetNames)$(name+'Filter').onchange=e=>{
    state[name]=e.target.value;syncTagFilters();resetCollectionPage();
  };
  $('clearTagFilters').onclick=()=>{
    state.style='';state.subject='';
    syncTagFilters();resetCollectionPage();$('styleFilterToggle').focus();
  };
  $('roleGroupFilter').onchange=e=>{state.roleGroup=e.target.value;renderLibrary();};
  $('roleTagFilter').onchange=e=>{state.roleTag=e.target.value;renderLibrary();};
  $('favoriteFilter').onclick=()=>{state.favoritesOnly=!state.favoritesOnly;updateFavoriteFilter();resetCollectionPage();};
  $('favoriteTheme').onclick=()=>{const i=state.favorites.indexOf(state.themeId);if(i===-1)state.favorites.push(state.themeId);else state.favorites.splice(i,1);save();updateFavorite();};
  for(const id of ['size','speed','cursorSize'])$(id).onchange=e=>{state[id]=+e.target.value;save();lastPaint='';};
  $('background').onchange=e=>{state.background=e.target.value;applyAppearance();save();};
  $('customColor').oninput=e=>{state.customColor=e.target.value;applyAppearance();save();};
  $('showHotspot').onchange=e=>{state.showHotspot=e.target.checked;save();lastPaint='';};
  $('liveCursor').onchange=e=>{
    if(e.target.checked)setSiteTrial({themeId:state.themeId,role:state.role,auto:state.autoRole});
    else stopSiteTrial();
  };
  $('autoRole').onchange=e=>{
    state.autoRole=e.target.checked;
    if(siteTrial)setSiteTrial({themeId:state.themeId,role:state.role,auto:state.autoRole});
    else updateTrials();
    save();lastPaint='';
  };
  $('playPause').onclick=togglePlay;$('timeline').oninput=e=>seek(+e.target.value);
  $('stepBack').onclick=()=>{const t=core.roleTiming(current(),state.role);seek((core.frameAt(t,state.elapsedMs)-1+t.frames)%t.frames);};
  $('stepNext').onclick=()=>{const t=core.roleTiming(current(),state.role);seek((core.frameAt(t,state.elapsedMs)+1)%t.frames);};
  const tabs=['library','compare','playground'];
  for(const tab of tabs){
    const b=$('tab'+tab[0].toUpperCase()+tab.slice(1));
    b.onclick=()=>setTab(tab);
    b.onkeydown=e=>{
      const i=tabs.indexOf(tab);
      const next={ArrowLeft:(i+tabs.length-1)%tabs.length,ArrowRight:(i+1)%tabs.length,Home:0,End:tabs.length-1}[e.key];
      if(next===undefined)return;
      e.preventDefault();setTab(tabs[next]);document.querySelector('[role=tab][aria-selected=true]').focus();
    };
  }
  $('compareToggle').onclick=()=>setTab(state.tab==='compare'?'library':'compare');
  for(const id of ['compareA','compareB'])$(id).onchange=e=>{state[id]=e.target.value;renderCompare();};
  $('swapCompare').onclick=()=>{[state.compareA,state.compareB]=[state.compareB,state.compareA];$('compareA').value=state.compareA;$('compareB').value=state.compareB;refreshPickers();renderCompare();};
  $('resetPreferences').onclick=()=>{
    trialSampleRole='Arrow';
    Object.assign(state,core.safeSettings({themeId:state.themeId,favorites:state.favorites},themes));setRole('Arrow');state.elapsedMs=0;
    state.playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;hidePointer(false);
    document.documentElement.dataset.appearance=$('appearance').value='auto';
    setSiteTrial(null);restoreControls();save();toast(msg('resetDone'));
  };

  function renderTrials(){
    $('roleTrials').replaceChildren(...roles.map(r=>{
      const b=el('button','role-trial',roleLabel(r.id));b.type='button';b.dataset.cursor=r.id;
      b.onclick=()=>{lockRole(r.id);toast(msg('activeRole',{role:roleLabel(r.id)}));};return b;
    }));
    updateTrials();
  }
  function updateStatus(){
    const notice=$('loadStatus');
    notice.hidden=status!=='error';
    notice.textContent=notice.hidden?'':msg('loadingError');
  }
  function setHeroRole(role){
    if(hero.role===role)return;
    hero.role=role;
    $('heroRole').textContent=roleLabel(role);
    $('heroLab').dataset.role=role;
  }
  function updateSpotlight(){
    $('heroTheme').textContent=themeCopy(current()).name;
    $('heroLab').style.setProperty('--lab-accent',current().accent||'#7855ff');
    $('heroRole').textContent=roleLabel(hero.role);
    const toggle=$('heroTryToggle');
    toggle.setAttribute('aria-pressed',String(!!siteTrial));
    toggle.querySelector('[data-i18n]').textContent=msg(siteTrial?'heroStop':'heroTry');
    $('heroStatus').textContent=msg(finePointer()?(siteTrial?'heroActive':'heroIdle'):'heroTouch');
  }
  function setupHero(){
    $('heroTryToggle').onclick=()=>{
      if(siteTrial){stopSiteTrial();return;}
      if(pointer.scope==='hero')setHeroRole(pointer.role);
      enableAutomaticTrial();
    };
    for(const id of ['heroInput','heroLink','heroPrecision']){
      const sample=$(id);
      sample.dataset.heroRole=sample.dataset.cursor;
      const showSample=()=>setHeroRole(sample.dataset.heroRole);
      sample.addEventListener('focus',showSample);
      sample.addEventListener('click',showSample);
    }
  }

  function setupPlayground(){
    $('tryTheme').onclick=()=>enterTrial(null,'#tryTheme');
    $('returnFromTrial').onclick=()=>{
      const {tab,selector}=trialReturn||{tab:'library',selector:'#tabLibrary'};
      setTab(tab);
      const target=document.querySelector(selector)||$('tabLibrary');
      target.focus({preventScroll:true});
      target.scrollIntoView({block:'nearest',behavior:'instant'});
    };
    $('trialAuto').onclick=()=>{
      if(siteTrial?.auto)lockRole(trialSampleRole);
      else enableAutomaticTrial();
    };
    const samples=$('playgroundSamples');
    const sampleRole=e=>{
      const role=resolveRole(e.target);
      if(role===trialSampleRole)return;
      trialSampleRole=role;
      if(siteTrial?.auto)updateTrials();
    };
    for(const event of ['pointermove','pointerdown','focusin'])samples.addEventListener(event,sampleRole,{passive:true});
    $('demoLink').onclick=()=>toast(msg('linkResponded'));
    const board=$('precisionBoard');board.addEventListener('click',e=>{const r=board.getBoundingClientRect(),m=$('precisionMarker');m.style.left=(e.detail?e.clientX-r.left:r.width/2)+'px';m.style.top=(e.detail?e.clientY-r.top:r.height/2)+'px';m.hidden=false;});
    const drag=$('dragTarget');if(drag){let start=null,offset={x:0,y:0};drag.addEventListener('pointerdown',e=>{if(e.button!==0)return;const maxX=Math.max(0,drag.parentElement.clientWidth-drag.offsetWidth-20);start={x:e.clientX-offset.x,y:e.clientY-offset.y,maxX};drag.setPointerCapture(e.pointerId);drag.classList.add('dragging');e.preventDefault();});drag.addEventListener('pointermove',e=>{if(!start)return;offset={x:Math.max(0,Math.min(start.maxX,e.clientX-start.x)),y:Math.max(-15,Math.min(60,e.clientY-start.y))};drag.style.transform=`translate(${offset.x}px,${offset.y}px)`;});const end=()=>{start=null;drag.classList.remove('dragging');};drag.addEventListener('pointerup',end);drag.addEventListener('pointercancel',end);drag.addEventListener('lostpointercapture',end);window.addEventListener('blur',end);document.addEventListener('keydown',e=>{if(e.key==='Escape')end();});}
    renderTrials();
  }

  function animate(now){
    const dt=Math.min(120,Math.max(0,now-last));last=now;if(state.playing&&!document.hidden)state.elapsedMs+=dt*state.speed;
    const t=current(),timing=core.roleTiming(t,state.role),frame=core.frameAt(timing,state.elapsedMs);
    const targetFrames=targets.map(target=>core.frameAt(core.roleTiming(target.theme,target.role),state.elapsedMs));
    const detailFrame=detailTarget?core.frameAt(core.roleTiming(detailTarget.theme,detailTarget.role),state.elapsedMs):null;
    const sampleRole=state.tab==='playground'?trialRole():null;
    const trialTheme=siteTrial?byId.get(siteTrial.themeId):t;
    const trialFrame=sampleRole?core.frameAt(core.roleTiming(trialTheme,sampleRole),state.elapsedMs):null;
    const signature=[state.tab,state.themeId,state.role,frame,state.size,state.showHotspot,state.background,state.compareA,state.compareB,detailTarget?.role,detailFrame,trialTheme.id,sampleRole,trialFrame,...targetFrames].join('|');
    if(signature!==lastPaint){
      targets.forEach((target,i)=>draw(target.canvas,target.theme,target.role,target.size(),targetFrames[i]));
      if(detailTarget)draw(detailTarget.canvas,detailTarget.theme,detailTarget.role,detailTarget.size(),detailFrame);
      if(sampleRole)draw($('trialCanvas'),trialTheme,sampleRole,64,trialFrame);
      $('timeline').value=frame;$('frameLabel').textContent=`${String(frame+1).padStart(2,'0')} / ${timing.frames}`;lastPaint=signature;
    }
    if(spotlightVisible){
      const frame=core.frameAt(core.roleTiming(t,hero.role),state.elapsedMs);
      const heroSignature=t.id+'|'+hero.role+'|'+frame;
      if(heroSignature!==spotlightFrame&&draw($('spotlightCanvas'),t,hero.role,236,frame,false))spotlightFrame=heroSignature;
    }
    drawPointer();
    const studioRole=liveRole();
    const pointerText=state.liveCursor?(finePointer()?msg('pointerActive',{role:roleLabel(studioRole)}):msg('pointerTouch')):msg('pointerNative');
    if($('pointerStatusText').textContent!==pointerText)$('pointerStatusText').textContent=pointerText;
    requestAnimationFrame(animate);
  }
  window.cursorGallery={get state(){return state;},ready,selectTheme,setRole,snapshot(){return{view,themeId:state.themeId,role:pointer.visible&&pointer.scope==='studio'&&siteTrial?.auto?pointer.role:state.role,frame:core.frameAt(core.roleTiming(current(),state.role),state.elapsedMs),playing:state.playing,size:state.size,speed:state.speed,liveCursor:state.liveCursor,cursorSize:state.cursorSize,autoRole:state.autoRole,tab:state.tab,siteTrial:siteTrial&&{...siteTrial},pointer:{...pointer,hoverRole:pointer.role,role:liveRole()},exhibit:{themeId:homeTheme().id,role:home.role,playing:home.playing,trial:!!siteTrial,fullscreen:home.fullscreen}};}};
  updatePageTitle();updateStatus();
  document.documentElement.style.setProperty('--theme-accent',current().accent||'#7855ff');
  if(view==='home'){
    renderHome();setupHome();setupHomeAtmosphere();setupCursorBursts();animateHome();
  }else if(view==='collection'){
    $('search').value=state.query;$('category').value=state.category;
    updateFavoriteFilter();renderTagFilters();renderThemeList();resolveReady();
  }else if(view==='theme'){
    $('roleFilters').hidden=!roles.some(role=>role.groupId);
    compareOptions();restoreControls();header();renderThemeTags();setTab('library');setupPlayground();setupHero();
    updateSpotlight();save();
    const spotlight=$('spotlight');
    spotlight.disabled=false;spotlight.onclick=()=>{
      const controls=$('previewControls');controls.focus({preventScroll:true});controls.scrollIntoView({block:'start'});
    };
    const observer=new IntersectionObserver(([entry])=>{spotlightVisible=entry.isIntersecting;});
    observer.observe(spotlight);
    if(route.tryRole&&!history.state?.enteredTrial){
      history.replaceState({...history.state,enteredTrial:true},'');
      enterTrial(route.tryRole,'#tryTheme');
    }else if(route.tryRole&&siteTrial?.themeId===state.themeId){
      trialSampleRole=siteTrial.role;
      revealPlayground('library','#tryTheme');
    }
    prepareTheme(current()).then(()=>resolveReady());requestAnimationFrame(animate);
  }else resolveReady();
  syncSiteTrial();
})();
