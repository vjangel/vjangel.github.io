(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GalleryCore=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  'use strict';
  function frameAt(theme,time){
    const durations=theme.durationsMs||[];
    const total=durations.reduce((a,b)=>a+b,0)||theme.cycleMs||1;
    let t=((Number(time)||0)%total+total)%total;
    if(!durations.length)return Math.min((theme.frames||1)-1,Math.floor(t/total*(theme.frames||1)));
    for(let i=0;i<durations.length;i++){if(t<durations[i]-1e-8)return i;t-=durations[i];}
    return 0;
  }
  function cursorPosition(x,y,hotspot,size){return{left:x-hotspot[0]*size/128,top:y-hotspot[1]*size/128};}
  function roleTiming(theme,role){return theme.roles?.[role]?.durationsMs?.length?theme.roles[role]:theme;}
  function roleLayout(theme,role){return theme.roles?.[role]?.atlasLayout||theme.atlas;}
  const facetNames=['style','subject'];
  function filterThemes(themes,query,category,favoritesOnly,favorites,facets={}){
    const group={new:'新风格',objects:'物件主题',classic:'经典方案'}[category];
    const q=String(query||'').trim().toLocaleLowerCase();const set=new Set(favorites||[]);
    return themes.filter(t=>
      (!group||t.group===group)&&
      (!favoritesOnly||set.has(t.id))&&
      facetNames.every(name=>!facets[name]||t.facets?.[name]?.includes(facets[name]))&&
      (!q||[t.name,t.description,t.id,...(t.tags||[])].join(' ').toLocaleLowerCase().includes(q))
    );
  }
  function themePage(themes,requested){
    const size=6,pages=Math.max(1,Math.ceil(themes.length/size));
    const page=Math.max(1,Math.min(pages,requested)),offset=(page-1)*size;
    const items=themes.slice(offset,offset+size);
    return{items,page,pages,start:items.length?offset+1:0,end:offset+items.length};
  }
  const legacyThemeIds=new Map([['koi_v2','koi'],['moon_v2','moon'],['forest_v2','forest'],['pixel_v2','pixel']]);
  function canonicalThemeId(id){return legacyThemeIds.get(id)||id;}
  function galleryRoute(search,themes){
    const params=new URLSearchParams(search),view=params.get('view');
    if(params.has('theme')){
      const themeId=canonicalThemeId(params.get('theme'));
      const theme=themes.find(theme=>theme.id===themeId);
      if(theme){
        const tryRole=params.get('try');
        return tryRole&&Object.hasOwn(theme.roles||{},tryRole)?{view:'theme',themeId,tryRole}:{view:'theme',themeId};
      }
    }else if(view==='guide')return{view:'guide'};
    else if(view!=='collection')return{view:'home'};
    const page=Number(params.get('page'));
    const category=params.get('category');
    const route={view:'collection',page:Number.isSafeInteger(page)&&page>0?page:1,
      query:params.get('q')||'',category:['new','objects','classic'].includes(category)?category:'all',
      favoritesOnly:params.get('favorites')==='1'};
    for(const name of facetNames){
      const value=params.get(name);
      if(value&&themes.some(theme=>theme.facets?.[name]?.includes(value)))route[name]=value;
    }
    return route;
  }
  function galleryHref(view,options={}){
    const params=new URLSearchParams();
    if(view==='theme'){
      params.set('theme',options.themeId);
      if(options.tryRole)params.set('try',options.tryRole);
    }
    else if(view==='guide')params.set('view',view);
    else if(view==='collection'){
      params.set('view',view);
      if(options.page>1)params.set('page',options.page);
      if(options.query)params.set('q',options.query);
      if(options.category&&options.category!=='all')params.set('category',options.category);
      if(options.favoritesOnly)params.set('favorites','1');
      for(const name of facetNames)if(options[name])params.set(name,options[name]);
    }
    const query=params.toString();
    return './index.html'+(query?'?'+query:'');
  }
  function safeSettings(raw,themes){
    const r=raw&&typeof raw==='object'?raw:{};
    const ids=new Set(themes.map(t=>t.id));
    const themeId=canonicalThemeId(r.themeId);
    return{themeId:ids.has(themeId)?themeId:themes[0]?.id,size:[32,48,64,96,128].includes(+r.size)?+r.size:96,
      speed:[.5,1,1.5,2].includes(+r.speed)?+r.speed:1,cursorSize:[24,32,48,64].includes(+r.cursorSize)?+r.cursorSize:32,
      background:['light','dark','checker','custom'].includes(r.background)?r.background:'light',
      customColor:/^#[0-9a-f]{6}$/i.test(r.customColor)?r.customColor:'#b7c9bb',
      liveCursor:r.liveCursor!==false,autoRole:r.autoRole!==false,showHotspot:r.showHotspot===true,
      favorites:[...new Set(Array.isArray(r.favorites)?r.favorites.map(canonicalThemeId):[])].filter(id=>ids.has(id))};
  }
  return{frameAt,cursorPosition,filterThemes,themePage,safeSettings,roleTiming,roleLayout,galleryRoute,galleryHref};
});
