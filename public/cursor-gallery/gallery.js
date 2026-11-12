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
        if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closePicker(true);return;}
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
  const hero={enabled:false,role:'Arrow'};
  const state={...core.safeSettings(stored,themes),role:'Arrow',tab:'library',playing:!matchMedia('(prefers-reduced-motion: reduce)').matches,
    elapsedMs:0,query:route.query||'',category:route.category||'all',favoritesOnly:route.favoritesOnly||false,compareA:null,compareB:null};
  if(route.themeId){
    state.themeId=route.themeId;
    if(new URLSearchParams(location.search).get('theme')!==route.themeId)
      history.replaceState(null,'',core.galleryHref('theme',route));
  }
  const homeThemes=[byId.get('neon-flux'),...themes.filter(theme=>theme.id!=='neon-flux')].filter(Boolean);
  const homeRoles=['Arrow','Hand','IBeam','Crosshair','Wait'];
  const home={index:0,role:'Arrow',playing:state.playing,trial:false,elapsed:0,lastFrame:'',fullscreen:false};
  state.compareA=state.themeId;state.compareB=themes.find(t=>t.id!==state.themeId)?.id||state.themeId;
  const pointer={x:0,y:0,inside:false,visible:false,role:'Arrow',scope:null,themeId:state.themeId,left:0,top:0};
  const cache=new Map();let targets=[],detailTarget=null,last=performance.now(),lastPaint='',returnFocus=null,toastTimer;
  let spotlightVisible=true,spotlightFrame='',status='',collectionPage=route.page||1;
  const pointerCanvas=$('livePointer');
  const finePointer=()=>!matchMedia('(pointer: coarse)').matches;
  let resolveReady;const ready=new Promise(resolve=>resolveReady=resolve);

  function save(){persistPreferences(state);}
  function toast(message){const e=$('toast');if(!e)return;e.textContent=message;e.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.hidden=true,2400);}
  function current(){return byId.get(state.themeId);}
  function themeHref(themeId){return core.galleryHref('theme',{themeId});}
  function collectionHref(page){
    return core.galleryHref('collection',{page,query:state.query,category:state.category,favoritesOnly:state.favoritesOnly});
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
    sample.append(el('span','sample-index',String(themes.indexOf(theme)+1).padStart(2,'0')),el('span','sample-link','↗'));
    if(saved)sample.append(el('span','theme-star','★'));
    const copy=el('span','theme-copy'),english=el('small','theme-english');
    english.lang='en';
    showEnglishName(english,local);
    copy.append(el('strong',null,local.name),english,el('span','theme-tags',local.group));
    link.append(sample,copy);
    link.setAttribute('aria-label',saved?msg('favoriteName',{name:local.name}):local.name);
    return link;
  }
  function homeTheme(){return homeThemes[home.index];}
  function syncHome(announce=false,reveal=false){
    const featured=homeTheme(),copy=themeCopy(featured),link=$('homeFeatured');
    const accent=featured.accent||'#7855ff';
    link.href=themeHref(featured.id);link.dataset.themeId=featured.id;
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
      ['homeTry',home.trial,home.trial?'homeStopTrial':'homeTry'],
    ]){
      const button=$(id);
      button.setAttribute('aria-pressed',String(pressed));button.setAttribute('aria-label',msg(key));button.title=msg(key);
    }
    $('homeTry').hidden=!finePointer();
    const trialText=$('homeTry').querySelector('[data-i18n]');
    if(trialText)trialText.textContent=msg(home.trial?'homeStopTrial':'homeTry');
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
      button.append(thumb);button.onclick=()=>chooseHome(index,home.role);
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
  function setHomeTrial(enabled){
    home.trial=enabled;
    if(!enabled&&pointer.scope==='home')hidePointer(false);
    syncHome();
  }
  function setupHome(){
    const stage=$('homeStage'),gesture=$('homeGesture');
    const step=direction=>chooseHome(home.index+direction,home.role);
    $('homePrevious').onclick=()=>step(-1);$('homeNext').onclick=()=>step(1);
    $('homePause').onclick=()=>{home.playing=!home.playing;syncHome();};
    $('homeTry').onclick=()=>setHomeTrial(!home.trial);
    $('homeFullscreen').onclick=async()=>{
      try{
        if(document.fullscreenElement)await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      }catch{toast(msg('homeFullscreenUnavailable'));}
    };
    document.addEventListener('fullscreenchange',()=>{
      const previous=home.fullscreen;
      home.fullscreen=Boolean(document.fullscreenElement);
      if(previous&&!home.fullscreen)setHomeTrial(false);
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
    const result=core.filterThemes(themes,'',state.category,state.favoritesOnly,state.favorites).filter(theme=>{
      const local=themeCopy(theme);
      return !query||[theme.id,theme.name,theme.description,...(theme.tags||[]),local.name,local.englishName,local.description,local.group,...(local.tags||[])]
        .join(' ').toLocaleLowerCase(locale).includes(query);
    });
    const list=$('themeList');list.replaceChildren();
    $('themeCount').textContent=msg('themeTotal',{count:result.length});
    const page=core.themePage(result,collectionPage);
    collectionPage=page.page;
    renderPagination(page,result.length);
    const canonical=new URL(collectionHref(collectionPage),location.href);
    if(canonical.search!==location.search)history.replaceState(null,'',canonical);
    if(!result.length){const empty=el('div','empty-state');empty.append(el('p',null,msg('emptyResults')));const clear=el('button','clear-search',msg('clearFilters'));clear.type='button';clear.onclick=()=>{state.query='';state.category='all';state.favoritesOnly=false;$('search').value='';$('category').value='all';updateFavoriteFilter();refreshPickers();resetCollectionPage();$('search').focus();};empty.append(clear);list.append(empty);return;}
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
  function updateFavorite(){const on=state.favorites.includes(state.themeId);$('favoriteTheme').textContent=(on?'★ ':'☆ ')+msg(on?'favorited':'favorite');$('favoriteTheme').setAttribute('aria-pressed',String(on));}
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
  function makeRoleCard(theme,r){
    const article=el('article','role-card');article.dataset.role=r.id;article.classList.toggle('selected',state.role===r.id);
    const label=roleLabel(r.id),english=i18n.role('en',r.id);
    const open=el('button','role-open');open.type='button';open.setAttribute('aria-label',msg('viewDetails',{role:label}));
    const stage=el('span','stage');const c=el('canvas');c.setAttribute('aria-hidden','true');stage.append(c);
    const title=el('span','role-title',label),englishTitle=el('small',null,english);englishTitle.lang='en';englishTitle.hidden=english===label;
    open.append(stage,title,englishTitle);open.onclick=()=>openDetail(r.id,open);
    const actions=el('div','role-actions');const info=roleInfo(theme,r.id);actions.append(...fileKinds(info));
    const tryButton=el('button','try-role',msg('tryShort')+' ↗');tryButton.type='button';tryButton.dataset.cursor=r.id;tryButton.title=msg('tryRole',{role:label});tryButton.setAttribute('aria-label',tryButton.title);
    tryButton.onclick=()=>{lockRole(r.id);toast(msg('lockRole',{role:label}));};actions.append(tryButton);article.append(open,actions);
    targets.push({canvas:c,theme,role:r.id,size:()=>state.size});return article;
  }
  function renderLibrary(){targets=[];$('roleGrid').replaceChildren(...roles.map(r=>makeRoleCard(current(),r)));prepareTheme(current());lastPaint='';}
  function compareOptions(){for(const id of ['compareA','compareB']){const s=$(id);s.replaceChildren(...themes.map(t=>new Option(themeCopy(t).name,t.id)));} $('compareA').value=state.compareA;$('compareB').value=state.compareB;refreshPickers();}
  function renderCompare(){
    targets=[];const grid=$('compareGrid'),a=byId.get(state.compareA),b=byId.get(state.compareB);grid.replaceChildren();
    for(const r of roles){const row=el('div','compare-row');row.append(el('div','compare-role',roleLabel(r.id)));for(const t of [a,b]){const cell=el('div','compare-cell');const stage=el('div','stage');const c=el('canvas');c.setAttribute('aria-label',msg('comparisonPreview',{theme:themeCopy(t).name,role:roleLabel(r.id)}));stage.append(c);const links=el('div','compare-links');links.append(...fileKinds(roleInfo(t,r.id)));cell.append(stage,links);row.append(cell);targets.push({canvas:c,theme:t,role:r.id,size:()=>state.size});}grid.append(row);}
    prepareTheme(a);prepareTheme(b);lastPaint='';
  }
  function setTab(tab){
    state.tab=tab;for(const t of ['library','compare','playground']){$(t+'Panel').hidden=tab!==t;const button=$('tab'+t[0].toUpperCase()+t.slice(1));button.classList.toggle('selected',tab===t);button.setAttribute('aria-selected',String(tab===t));button.tabIndex=tab===t?0:-1;}
    if(tab==='library')renderLibrary();else if(tab==='compare')renderCompare();else targets=[];lastPaint='';
  }
  function selectTheme(id){
    if(view!=='theme'||!byId.has(id))return;hidePointer(false);state.themeId=id;state.role='Arrow';state.elapsedMs=0;pointer.role='Arrow';pointer.themeId=id;state.compareA=id;$('compareA').value=id;
    if(state.compareB===id){state.compareB=themes.find(t=>t.id!==id)?.id||id;$('compareB').value=state.compareB;}
    header();updatePageTitle();updateSpotlight();refreshPickers();if(state.tab==='compare')renderCompare();else if(state.tab==='library')renderLibrary();prepareTheme(current());save();
  }
  function setRole(role){if(!current().roles[role])return;state.role=role;pointer.role=role;document.querySelectorAll('.role-card').forEach(c=>c.classList.toggle('selected',c.dataset.role===role));header();updateTrials();lastPaint='';}
  function updateTrials(){for(const button of $('roleTrials').children)button.setAttribute('aria-pressed',String(!state.autoRole&&state.role===button.dataset.cursor));}
  function lockRole(role){state.autoRole=false;$('autoRole').checked=false;state.liveCursor=true;$('liveCursor').checked=true;setRole(role);save();}

  function openDetail(role,focus){
    returnFocus=focus;const t=current(),info=t.roles[role];setRole(role);$('detailName').textContent=themeCopy(t).name+' · '+roleLabel(role);
    const [x,y]=info.hotspot;$('detailInfo').textContent=msg('detailHotspot',{x,y});
    for(const [id,file] of [['Animated',info.animated],['Static',info.static]]){$('detail'+id).hidden=!file;$('detail'+id).querySelector('dd').textContent=file?.split('/').at(-1)||'';}
    setDownload('downloadDetail',t);
    detailTarget={canvas:$('detailCanvas'),theme:t,role,size:()=>Math.min(state.size*2,256)};hidePointer(false);$('roleDialog').showModal();$('closeDialog').focus();lastPaint='';
  }
  function closeDetail(){if($('roleDialog').open)$('roleDialog').close();}
  $('closeDialog').onclick=closeDetail;
  $('roleDialog').addEventListener('close',()=>{detailTarget=null;returnFocus?.focus();returnFocus=null;});
  $('roleDialog').addEventListener('click',e=>{if(e.target===$('roleDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDetail();}});

  function hidePointer(clearInside=true){
    if(pointer.visible){
      pointer.visible=false;pointerCanvas.hidden=true;
      document.documentElement.classList.remove('custom-cursor-active','hero-cursor-active','home-cursor-active');
    }
    if(clearInside){pointer.inside=false;pointer.scope=null;}
  }
  function resolveRole(target){
    if(!(target instanceof Element))return'Arrow';
    const explicit=target.closest('[data-cursor]');if(explicit&&current().roles[explicit.dataset.cursor])return explicit.dataset.cursor;
    if(target.closest(':disabled,[aria-disabled="true"]'))return'No';
    if(target.closest('textarea,input:not([type=button]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=submit]),[contenteditable="true"]'))return'IBeam';
    if(target.closest('a,button,select,label,input[type=checkbox],input[type=range]'))return'Hand';
    return'Arrow';
  }
  function liveRole(){
    if(pointer.scope==='home')return home.role;
    return pointer.scope==='hero'||state.autoRole?pointer.role:state.role;
  }
  function drawPointer(){
    const onStage=pointer.scope==='home';
    const enabled=onStage?home.trial:pointer.scope==='hero'?hero.enabled:state.liveCursor;
    if(!enabled||!pointer.inside||activePicker||!finePointer()||document.visibilityState!=='visible'||!document.hasFocus()||$('roleDialog').open){hidePointer(false);return;}
    const t=onStage?homeTheme():current(),role=liveRole(),info=roleInfo(t,role),record=imageFor(info.atlas);
    if(!record.loaded||record.error){hidePointer(false);return;}
    const size=state.cursorSize,p=core.cursorPosition(pointer.x,pointer.y,info.hotspot,size);
    const frame=core.frameAt(core.roleTiming(t,role),onStage?home.elapsed:state.elapsedMs);
    try{if(!draw(pointerCanvas,t,role,size,frame,false)){hidePointer(false);return;}}catch{hidePointer(false);return;}
    pointerCanvas.style.left=p.left+'px';pointerCanvas.style.top=p.top+'px';pointerCanvas.hidden=false;pointer.visible=true;pointer.themeId=t.id;pointer.left=p.left;pointer.top=p.top;
    document.documentElement.classList.toggle('custom-cursor-active',pointer.scope==='studio');
    document.documentElement.classList.toggle('hero-cursor-active',pointer.scope==='hero');
    document.documentElement.classList.toggle('home-cursor-active',onStage);
  }
  function updatePointerTarget(target){
    const scope=view==='home'?($('homeGesture').contains(target)?'home':null)
      :$('heroLab').contains(target)?'hero':$('studio').contains(target)?'studio':null;
    if(!scope){hidePointer();return;}
    pointer.inside=true;pointer.scope=scope;pointer.role=resolveRole(target);
    if(scope==='hero'&&hero.enabled)setHeroRole(pointer.role);
    drawPointer();
  }
  document.addEventListener('pointermove',e=>{
    if(view!=='theme'&&view!=='home')return;
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
    if(view==='home'&&e.key==='Escape'){
      if(home.trial)setHomeTrial(false);
      if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
      return;
    }
    if(view!=='theme')return;
    if(e.key==='Escape'){
      if($('roleDialog').open){e.preventDefault();closeDetail();return;}
      const studioActive=pointer.scope==='studio'||$('studio').contains(e.target);
      if(hero.enabled&&(pointer.scope==='hero'||!studioActive||$('heroLab').contains(e.target))){setHeroEnabled(false);return;}
      if(state.liveCursor){state.liveCursor=false;$('liveCursor').checked=false;hidePointer();save();toast(msg('escapeRestored'));}
    }
    if(e.code==='Space'&&(e.target===document.body||e.target===document.documentElement)){e.preventDefault();togglePlay();}
  });

  function updatePlayback(){const b=$('playPause');b.textContent=msg(state.playing?'pause':'play');b.setAttribute('aria-label',msg(state.playing?'pauseAnimation':'playAnimation'));b.setAttribute('aria-pressed',String(!state.playing));}
  function togglePlay(){state.playing=!state.playing;last=performance.now();updatePlayback();}
  function seek(index){const t=core.roleTiming(current(),state.role),i=Math.max(0,Math.min(t.frames-1,Math.round(index)));state.elapsedMs=t.durationsMs.slice(0,i).reduce((a,b)=>a+b,0)+1e-6;state.playing=false;updatePlayback();lastPaint='';}
  function applyAppearance(){document.body.dataset.background=state.background;document.documentElement.style.setProperty('--custom-background',state.customColor);$('customColor').hidden=state.background!=='custom';lastPaint='';}
  function restoreControls(){for(const id of ['size','background','speed','cursorSize'])$(id).value=String(state[id]);for(const id of ['showHotspot','liveCursor','autoRole'])$(id).checked=state[id];$('customColor').value=state.customColor;refreshPickers();applyAppearance();updatePlayback();}
  $('search').addEventListener('input',e=>{state.query=e.target.value;resetCollectionPage();});
  $('appearance').onchange=e=>{document.documentElement.dataset.appearance=e.target.value;save();};
  function updateLanguage(){
    locale=effectiveLanguage();translatePage();updatePageTitle();updateStatus();
    if(view==='home')renderHome();
    if(view==='collection')renderThemeList();
    if(view==='theme'){
      header();compareOptions();setTab(state.tab);renderTrials();
      updatePlayback();updateSpotlight();$('toast').hidden=true;
    }
  }
  $('language').onchange=e=>{languagePreference=e.target.value;updateLanguage();save();};
  window.addEventListener('languagechange',()=>{if(languagePreference==='system')updateLanguage();});
  window.addEventListener('pageshow',e=>{
    if(!e.persisted)return;
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
  });
  $('category').onchange=e=>{state.category=e.target.value;resetCollectionPage();};
  $('favoriteFilter').onclick=()=>{state.favoritesOnly=!state.favoritesOnly;updateFavoriteFilter();resetCollectionPage();};
  $('favoriteTheme').onclick=()=>{const i=state.favorites.indexOf(state.themeId);if(i===-1)state.favorites.push(state.themeId);else state.favorites.splice(i,1);save();updateFavorite();};
  for(const id of ['size','speed','cursorSize'])$(id).onchange=e=>{state[id]=+e.target.value;save();lastPaint='';};
  $('background').onchange=e=>{state.background=e.target.value;applyAppearance();save();};
  $('customColor').oninput=e=>{state.customColor=e.target.value;applyAppearance();save();};
  $('showHotspot').onchange=e=>{state.showHotspot=e.target.checked;save();lastPaint='';};
  $('liveCursor').onchange=e=>{state.liveCursor=e.target.checked;if(!state.liveCursor&&pointer.scope==='studio')hidePointer(false);save();};
  $('autoRole').onchange=e=>{state.autoRole=e.target.checked;updateTrials();save();lastPaint='';};
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
    Object.assign(state,core.safeSettings({themeId:state.themeId,favorites:state.favorites},themes));setRole('Arrow');state.elapsedMs=0;
    state.playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;hidePointer(false);
    document.documentElement.dataset.appearance=$('appearance').value='auto';
    restoreControls();save();toast(msg('resetDone'));
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
  function setHeroEnabled(enabled){
    hero.enabled=enabled;
    if(pointer.scope==='hero'){
      if(enabled){setHeroRole(pointer.role);drawPointer();}
      else hidePointer(false);
    }
    updateSpotlight();
  }
  function updateSpotlight(){
    $('heroTheme').textContent=themeCopy(current()).name;
    $('heroLab').style.setProperty('--lab-accent',current().accent||'#7855ff');
    $('heroRole').textContent=roleLabel(hero.role);
    const toggle=$('heroTryToggle');
    toggle.setAttribute('aria-pressed',String(hero.enabled));
    toggle.querySelector('[data-i18n]').textContent=msg(hero.enabled?'heroStop':'heroTry');
    $('heroStatus').textContent=msg(finePointer()?(hero.enabled?'heroActive':'heroIdle'):'heroTouch');
  }
  function setupHero(){
    $('heroTryToggle').onclick=()=>setHeroEnabled(!hero.enabled);
    for(const id of ['heroInput','heroLink','heroPrecision']){
      const sample=$(id);
      sample.dataset.heroRole=sample.dataset.cursor;
      const showSample=()=>setHeroRole(sample.dataset.heroRole);
      sample.addEventListener('focus',showSample);
      sample.addEventListener('click',showSample);
    }
  }

  function setupPlayground(){
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
    const signature=[state.tab,state.themeId,state.role,frame,state.size,state.showHotspot,state.background,state.compareA,state.compareB,detailTarget?.role,detailFrame,...targetFrames].join('|');
    if(signature!==lastPaint){
      targets.forEach((target,i)=>draw(target.canvas,target.theme,target.role,target.size(),targetFrames[i]));
      if(detailTarget)draw(detailTarget.canvas,detailTarget.theme,detailTarget.role,detailTarget.size(),detailFrame);
      $('timeline').value=frame;$('frameLabel').textContent=`${String(frame+1).padStart(2,'0')} / ${timing.frames}`;lastPaint=signature;
    }
    if(spotlightVisible){
      const frame=core.frameAt(core.roleTiming(t,hero.role),state.elapsedMs);
      const heroSignature=t.id+'|'+hero.role+'|'+frame;
      if(heroSignature!==spotlightFrame&&draw($('spotlightCanvas'),t,hero.role,236,frame,false))spotlightFrame=heroSignature;
    }
    drawPointer();
    const studioRole=pointer.scope==='studio'&&state.autoRole?pointer.role:state.role;
    const pointerText=state.liveCursor?(finePointer()?msg('pointerActive',{role:roleLabel(studioRole)}):msg('pointerTouch')):msg('pointerNative');
    if($('pointerStatusText').textContent!==pointerText)$('pointerStatusText').textContent=pointerText;
    requestAnimationFrame(animate);
  }
  window.cursorGallery={get state(){return state;},ready,selectTheme,setRole,snapshot(){return{view,themeId:state.themeId,role:pointer.visible&&pointer.scope==='studio'&&state.autoRole?pointer.role:state.role,frame:core.frameAt(core.roleTiming(current(),state.role),state.elapsedMs),playing:state.playing,size:state.size,speed:state.speed,liveCursor:state.liveCursor,cursorSize:state.cursorSize,autoRole:state.autoRole,tab:state.tab,pointer:{...pointer,hoverRole:pointer.role,role:liveRole()},exhibit:{themeId:homeTheme().id,role:home.role,playing:home.playing,trial:home.trial,fullscreen:home.fullscreen}};}};
  updatePageTitle();updateStatus();
  document.documentElement.style.setProperty('--theme-accent',current().accent||'#7855ff');
  if(view==='home'){
    renderHome();setupHome();animateHome();
  }else if(view==='collection'){
    $('search').value=state.query;$('category').value=state.category;
    updateFavoriteFilter();refreshPickers();renderThemeList();resolveReady();
  }else if(view==='theme'){
    compareOptions();restoreControls();header();setTab('library');setupPlayground();setupHero();
    updateSpotlight();save();
    const spotlight=$('spotlight');
    spotlight.disabled=false;spotlight.onclick=()=>{
      const controls=$('previewControls');controls.focus({preventScroll:true});controls.scrollIntoView({block:'start'});
    };
    const observer=new IntersectionObserver(([entry])=>{spotlightVisible=entry.isIntersecting;});
    observer.observe(spotlight);
    prepareTheme(current()).then(()=>resolveReady());requestAnimationFrame(animate);
  }else resolveReady();
})();
