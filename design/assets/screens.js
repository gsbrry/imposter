/* Impostr design v2: every screen as an HTML template.
   Used by index.html (board) and screens/*.html (one full-size responsive screen each).
   All text is ASCII or HTML entities so it renders the same everywhere. */
(function(){
const SPRITE=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="back" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></symbol>
<symbol id="chev" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></symbol>
<symbol id="play" viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z"/></symbol>
<symbol id="chart" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></symbol>
<symbol id="sliders" viewBox="0 0 24 24"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></symbol>
<symbol id="lock" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/></symbol>
<symbol id="check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></symbol>
<symbol id="plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
<symbol id="minus" viewBox="0 0 24 24"><path d="M5 12h14"/></symbol>
<symbol id="x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
<symbol id="users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5M16 4.6a3.5 3.5 0 010 6.8M18 14.8c2 .7 3.2 2.4 3.5 5.2"/></symbol>
<symbol id="phone1" viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></symbol>
<symbol id="clock" viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></symbol>
<symbol id="crown" viewBox="0 0 24 24"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/></symbol>
<symbol id="eye" viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></symbol>
<symbol id="eyeoff" viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 5.1A10 10 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.5 4.5-1.2M9.9 9.9a3 3 0 004.2 4.2"/></symbol>
<symbol id="finger" viewBox="0 0 24 24"><path d="M12 11v3.5c0 2.5-.7 4.5-2 6M8.5 9.5A3.5 3.5 0 0115.5 10v4c0 2.6-.4 4.6-1.2 6.2M5.5 15.5c.3-1.4.5-3 .5-5a6 6 0 0111.5-2.4M18 11v2.5c0 1.6-.1 3-.4 4.3M7.5 4.2A9 9 0 0120.5 8"/></symbol>
<symbol id="globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.8 3.8 5.8 3.8 9s-1.2 6.2-3.8 9c-2.6-2.8-3.8-5.8-3.8-9S9.4 5.8 12 3z"/></symbol>
<symbol id="car" viewBox="0 0 24 24"><path d="M5 16V11l2-5h10l2 5v5M3 11h18v5H3z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></symbol>
<symbol id="home" viewBox="0 0 24 24"><path d="M4 10.5L12 4l8 6.5V20H4z"/><path d="M10 20v-5h4v5"/></symbol>
<symbol id="bowl" viewBox="0 0 24 24"><path d="M3 11h18a9 9 0 01-18 0zM8 7c0-1.5 1-2 1-3.5M12 7c0-1.5 1-2 1-3.5M16 7c0-1.5 1-2 1-3.5"/></symbol>
<symbol id="film" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></symbol>
<symbol id="ball" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3c-2 3-2 15 0 18M3.5 9c4 1.5 13 1.5 17 0M3.5 15c4-1.5 13-1.5 17 0"/></symbol>
<symbol id="paw" viewBox="0 0 24 24"><circle cx="7" cy="9" r="1.8"/><circle cx="11" cy="5.5" r="1.8"/><circle cx="15.5" cy="6.5" r="1.8"/><circle cx="18.5" cy="10.5" r="1.8"/><path d="M8 17c0-3 2-5.5 4.5-5.5S17 14 17 17c0 2-1.5 3-3 3-1 0-1.5-.6-2-.6s-1 .6-2 .6c-1.3 0-2-1.2-2-3z"/></symbol>
<symbol id="brief" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5h6v2M3 13h18"/></symbol>
<symbol id="lamp" viewBox="0 0 24 24"><path d="M12 3c3 3 3 6 0 8-3-2-3-5 0-8z"/><path d="M5 14h14l-2 6H7z"/></symbol>
<symbol id="vol" viewBox="0 0 24 24"><path d="M4 10v4h3.5L12 18V6L7.5 10z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11"/></symbol>
<symbol id="vib" viewBox="0 0 24 24"><rect x="8" y="4" width="8" height="16" rx="2"/><path d="M4 9v6M20 9v6"/></symbol>
<symbol id="bell" viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15zM10 20.5h4"/></symbol>
<symbol id="msg" viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></symbol>
<symbol id="trophy" viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 01-10 0zM7 6H4v1.5A3 3 0 007 10.5M17 6h3v1.5a3 3 0 01-3 3M12 14v3M9.5 17h5v3h-5z"/></symbol>
<symbol id="dice" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/></symbol>
<symbol id="refresh" viewBox="0 0 24 24"><path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7"/></symbol>
<symbol id="arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
<symbol id="help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .6-1.5 1.2-1.5 2.3M12 17h0"/></symbol>
<symbol id="wifi" viewBox="0 0 24 24"><path d="M2 9a15 15 0 0120 0M5.5 12.5a10 10 0 0113 0M9 16a5 5 0 016 0"/><circle cx="12" cy="19" r=".8"/></symbol>
<symbol id="batt" viewBox="0 0 24 24"><rect x="2" y="7" width="18" height="10" rx="3"/><rect x="4" y="9" width="12" height="6" rx="1.5" fill="currentColor" stroke="none"/><path d="M22 10.5v3"/></symbol>
<symbol id="offline" viewBox="0 0 24 24"><path d="M3 3l18 18M8.5 16a5 5 0 016.2-.6M5 12.5a10 10 0 014-2.2M2 9a15 15 0 014.2-2.8M12 4.9A15 15 0 0122 9M15.5 10.7a10 10 0 013 1.8"/></symbol>
<symbol id="link" viewBox="0 0 24 24"><path d="M10 14a4.5 4.5 0 006.4 0l3-3a4.5 4.5 0 00-6.4-6.4L11.5 6M14 10a4.5 4.5 0 00-6.4 0l-3 3a4.5 4.5 0 006.4 6.4l1.5-1.4"/></symbol>
<symbol id="share" viewBox="0 0 24 24"><circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4M8.2 13.2l7.6 4"/></symbol>
<symbol id="copy" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0013.5 4h-7A2.5 2.5 0 004 6.5v7A2.5 2.5 0 006.5 16H8"/></symbol>
<symbol id="send" viewBox="0 0 24 24"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/></symbol>
<symbol id="download" viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></symbol>
<symbol id="gift" viewBox="0 0 24 24"><rect x="3.5" y="9" width="17" height="11.5" rx="2"/><path d="M2.5 9h19v-1a1 1 0 00-1-1h-17a1 1 0 00-1 1zM12 7v13.5M12 7c-1.5-3.5-6-4-6-1.2C6 7 8 7 12 7zM12 7c1.5-3.5 6-4 6-1.2C18 7 16 7 12 7z"/></symbol>
<symbol id="flame" viewBox="0 0 24 24"><path d="M12 21c-4 0-7-2.8-7-6.6 0-3.3 2.3-5.4 3.7-7.4.5 1.6 1.5 2.6 2.6 3C11 7 12.5 4.5 14.5 3c-.3 2.6.8 4.4 2.3 6.1 1.3 1.5 2.2 3.1 2.2 5.3C19 18.2 16 21 12 21z"/><path d="M12 21c-1.7 0-3-1.2-3-2.9 0-1.6 1.3-2.7 2.2-3.6.3.9.9 1.4 1.6 1.6.3-1.2.9-2.1 1.7-2.6 0 1.4 1.5 2.4 1.5 4.6 0 1.7-1.3 2.9-4 2.9z"/></symbol>
<symbol id="spark" viewBox="0 0 24 24"><path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"/></symbol>
<symbol id="pause" viewBox="0 0 24 24"><rect x="6.5" y="5" width="3.5" height="14" rx="1"/><rect x="14" y="5" width="3.5" height="14" rx="1"/></symbol>
<symbol id="buoy" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/></symbol>
<symbol id="flag" viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></symbol>
<symbol id="textsize" viewBox="0 0 24 24"><path d="M3 19L8 6l5 13M4.8 14.5h6.4M15 19l3-7.5 3 7.5M15.9 17h4.2"/></symbol>
<symbol id="motion" viewBox="0 0 24 24"><circle cx="15" cy="12" r="5"/><path d="M3 9h5M2 12h5M3 15h5"/></symbol>
<symbol id="cloud" viewBox="0 0 24 24"><path d="M7 18a4.5 4.5 0 01-.6-9A6 6 0 0118 9.5 4 4 0 0117.5 18z"/><path d="M12 11v5M9.8 13.8L12 16l2.2-2.2"/></symbol>
<symbol id="doc" viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></symbol>
<symbol id="home2" viewBox="0 0 24 24"><path d="M4 10.5L12 4l8 6.5V20H4z"/></symbol>
</defs></svg>`;

const I=(n,st='')=>`<svg class="i" ${st?`style="${st}"`:''}><use href="#${n}"/></svg>`;
const MARK=(s=40)=>`<svg width="${s}" height="${s}" viewBox="0 0 1024 1024" aria-hidden="true"><defs><linearGradient id="mbg${s}" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#FFD95A"/><stop offset=".55" stop-color="#F2B705"/><stop offset="1" stop-color="#DE9E00"/></linearGradient></defs><rect width="1024" height="1024" rx="230" fill="url(#mbg${s})"/><path d="M362 252h300a150 150 0 0 1 150 150v140a150 150 0 0 1-150 150H420l-118 92c-12 9-28 0-26-15l14-87A150 150 0 0 1 212 542V402a150 150 0 0 1 150-150z" fill="#1B1813"/><circle cx="352" cy="472" r="56" fill="#F4EFE4"/><circle cx="672" cy="472" r="56" fill="#F4EFE4"/><circle cx="512" cy="472" r="62" fill="#F2B705"/><ellipse cx="512" cy="472" rx="15" ry="42" fill="#1B1813"/></svg>`;
const STATUS=`<div class="island"></div><div class="status"><span>9:41</span><span class="sicons">${I('wifi')}${I('batt')}</span></div>`;
const ORBS=`<span class="orb o1"></span><span class="orb o2"></span><span class="orb o3"></span>`;
const TABBAR=on=>`<nav class="tabbar glass">${[['play','Play'],['chart','Stats'],['sliders','Settings']].map(([i,l])=>`<div class="tab ${l===on?'on':''}">${I(i)}<span>${l}</span></div>`).join('')}</nav>`;
const NAV=(step,title,icon='back')=>`<div class="navrow"><button class="iconbtn glass" aria-label="Back">${I(icon)}</button><div class="col center" style="gap:6px"><span class="lab">${title}</span>${step?`<div class="steps">${[1,2,3].map(n=>`<i class="${n<=step?'on':''}"></i>`).join('')}</div>`:''}</div><span style="width:40px"></span></div>`;
const CATS=[['globe','General',0],['car','Vehicles',0],['home','Home',0],['bowl','Food',1],['film','Bollywood',1],['ball','Sports',1],['paw','Animals',1],['brief','Jobs',1],['lamp','Festivals',1]];
const NAMES=['Aarav','Meera','Kabir','Diya','Rohan'];
const AD=(where)=>`<div class="ad"><div class="ad-img"></div><div class="grow"><div class="t"><span class="ad-tag">AD</span>Sponsor headline</div><div class="d">One short line from the advertiser</div></div><button class="ad-cta">Open</button></div>`;
const tg=(t,d,i,on)=>`<div class="list-row"><span class="tile-ic" style="width:34px;height:34px;border-radius:10px">${I(i)}</span><div class="grow"><div class="t">${t}</div><div class="d">${d}</div></div><button class="tog" aria-pressed="${on}" aria-label="${t}"></button></div>`;

/* ---------- shared fragments ---------- */
const homeTop=()=>`
 <div class="navrow"><div class="row" style="gap:10px">${MARK(36)}<div class="col" style="gap:1px"><span class="lab">Party word game</span><span class="h h-m">Impostr</span></div></div><button class="iconbtn glass" aria-label="How to play">${I('help')}</button></div>
 <div class="glass pad" style="padding:20px;border-radius:24px;display:flex;flex-direction:column;gap:16px">
  <div class="row" style="gap:6px;flex-wrap:wrap"><span class="pill g">${I('users')}3 to 12 players</span><span class="pill">${I('offline')}Works offline</span></div>
  <h2 class="h hero">Someone here<br>is <span class="gold">lying.</span></h2>
  <p class="sub">Everyone gets the secret word except one. Give clues, stay sneaky, then vote.</p>
  <button class="btn btn-gold">${I('play')}Play now</button></div>
 <div class="glass list-row" style="border-radius:18px"><div class="tile-ic ink">${I('refresh')}</div><div class="grow"><div class="t">Play again</div><div class="d">Bollywood &middot; Medium &middot; 5 players</div></div>${I('chev')}</div>`;
const homeCats=()=>`
 <div class="navrow"><span class="lab">Categories</span><span class="lab gold">9 packs</span></div>
 <div class="catgrid">${CATS.slice(0,6).map(c=>`<div class="glass" style="padding:10px;border-radius:14px;display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-width:0"><span style="color:var(--gold-deep)">${I(c[0],'width:17px;height:17px')}</span><span style="font-weight:600;font-size:12px;overflow:hidden;text-overflow:ellipsis">${c[1]}</span></div>`).join('')}</div>`;

const revealCard=(imp)=>`
 <div class="navrow"><span style="width:40px"></span><span class="lab">${imp?'Kabir &middot; Player 3':'Meera &middot; Player 2'}</span><span style="width:40px"></span></div>
 <div class="reveal-card glass">
  <span class="pill g">${I('bowl')}Food &middot; Medium</span>
  <span class="lab" style="margin-top:14px">${imp?'Your role':'Your secret word'}</span>
  <span class="word">${imp?'Imposter':'Mango'}</span>
  <p class="sub" style="max-width:24ch">${imp?'You do not know the word. Listen closely and blend in.':'Give clues that prove you know it, without giving it away.'}</p>
  <div class="col center" style="width:150px;gap:6px;margin-top:16px"><div class="bar" style="width:100%"><i style="width:62%"></i></div><span style="font-size:11px;color:var(--muted)">Hides in 2s</span></div>
 </div>
 <button class="btn btn-ink">${I('eyeoff')}Hide and pass</button>`;

const resultTop=()=>`
 <div class="col center" style="gap:6px;margin-top:8px"><span class="pill g">${I('trophy')}Crew wins</span><h2 class="h h-xl" style="margin-top:6px">Caught them.</h2></div>
 <div class="glass col center" style="border-radius:26px;padding:22px 18px;gap:10px">
  <span class="lab">The imposter was</span>
  <div style="position:relative"><span class="av a3" style="width:82px;height:82px;border-radius:26px;font-size:34px">K</span><span class="tile-ic ink" style="position:absolute;right:-8px;bottom:-8px;width:32px;height:32px;border-radius:10px;border:3px solid var(--bg)">${I('eye','width:15px;height:15px')}</span></div>
  <span class="h h-l">Kabir</span><span class="sub">3 of 5 votes</span></div>
 <div class="glass list-row" style="border-radius:18px"><div class="grow"><div class="lab">The word was</div><div class="h h-m">Mango</div></div><span class="pill">Food &middot; Medium</span></div>`;

const statsTop=()=>`
 <div class="col" style="gap:2px"><span class="lab">Your stats</span><span class="h h-l">Performance</span></div>
 <div class="glass" style="border-radius:22px;padding:16px;display:flex;align-items:center;gap:16px"><div style="position:relative;width:92px;height:92px;flex:none"><svg viewBox="0 0 92 92" style="transform:rotate(-90deg);width:92px;height:92px"><circle cx="46" cy="46" r="38" fill="none" stroke="var(--line)" stroke-width="9"/><circle cx="46" cy="46" r="38" fill="none" stroke="var(--gold)" stroke-width="9" stroke-linecap="round" stroke-dasharray="238.8" stroke-dashoffset="86"/></svg><span class="num" style="position:absolute;inset:0;display:grid;place-items:center;font-weight:700;font-size:22px">64%</span></div><div class="col" style="gap:4px;min-width:0"><span class="lab">Win rate</span><span class="h h-m">Sharp detective</span><span class="sub" style="font-size:12.5px">Up 8% over your last 10 games</span></div></div>
 <div class="statgrid">${[['Games played','42','users'],['Crew wins','27','check'],['As imposter','9','eye'],['Imposter wins','5','trophy']].map(s=>`<div class="stat glass"><span style="color:var(--gold-deep)">${I(s[2])}</span><span class="v">${s[1]}</span><span class="lab">${s[0]}</span></div>`).join('')}</div>
 <div class="glass list-row" style="border-radius:18px"><span class="tile-ic">${I('film')}</span><div class="grow"><div class="lab">Best category</div><div class="t">Bollywood &middot; 71% wins</div></div></div>`;

const C=2*Math.PI*84;

/* ---------- SCREENS ---------- */
const S=[];
const add=(o)=>S.push(o);

/* CORE */
add({id:'splash',group:'core',name:'Splash',note:'Launch',route:'app/_layout.tsx',html:()=>`<div class="body center" style="justify-content:center;gap:22px">
 <div style="position:relative;width:116px;height:116px"><span style="position:absolute;inset:-14px;border-radius:40px;background:var(--gold);opacity:.4;filter:blur(18px);animation:pulse 2.6s ease-in-out infinite"></span><div style="position:relative;filter:drop-shadow(0 16px 24px rgba(90,60,0,.3))">${MARK(116)}</div></div>
 <div class="col center" style="gap:8px"><h2 class="h h-xl">Impostr</h2><p class="sub">One word. One liar. Find them.</p></div>
 <div style="width:120px" class="bar"><i style="animation:load 2.4s ease-out infinite alternate"></i></div>
 <span class="lab" style="position:absolute;bottom:36px">Gooseberry Media</span></div>`});

add({id:'home',group:'core',name:'Home',note:'Tab: Play',route:'app/(tabs)/index.tsx',tab:'Play',html:()=>`<div class="body tabbed">${homeTop()}${homeCats()}</div>`});

add({id:'how-to-play',group:'core',name:'How to play',note:'Sheet over Home',route:'app/(tabs)/index.tsx (modal)',html:()=>`<div class="body">${homeTop()}</div><div class="dim"></div><div class="sheet glass">
 <div style="width:40px;height:4px;border-radius:2px;background:var(--line);align-self:center"></div>
 <div class="navrow"><h2 class="h h-l">How to play</h2><button class="iconbtn" aria-label="Close">${I('x')}</button></div>
 ${[['One word, one imposter','Everyone sees the same secret word except the imposter, who has to blend in.'],['Give one-word clues','Take turns. Say a clue about the word without saying the word itself.'],['Vote and reveal','Vote for the imposter. Crew wins by catching them. The imposter wins by surviving.']].map((s,i)=>`<div class="howstep"><span class="n">${i+1}</span><div class="col" style="gap:3px"><span class="h h-s">${s[0]}</span><p class="sub">${s[1]}</p></div></div>`).join('')}
 <button class="btn btn-ink" style="margin-top:4px">Got it</button></div>`});

add({id:'category',group:'core',name:'Choose category',note:'Setup step 1',route:'app/setup.tsx',html:()=>`<div class="body">${NAV(1,'Step 1 of 3')}
 <div class="col" style="gap:4px"><h2 class="h h-l">Pick a category</h2><p class="sub">Words come from this pack.</p></div>
 <div class="catgrid">${CATS.map((c,i)=>`<div class="cat glass ${i===0?'sel':''}">${c[2]?`<svg class="i lock"><use href="#lock"/></svg>`:''}<span class="tile-ic">${I(c[0])}</span><span class="n">${c[1]}</span><span class="c">150 words</span></div>`).join('')}</div>
 <div class="col" style="gap:8px"><span class="lab">Difficulty</span><div class="seg glass"><button>Easy</button><button class="on">Medium</button><button>Hard</button><button>Chaos</button></div><p class="sub" style="font-size:12px">Standard words.</p></div>
 <div class="spacer"></div><button class="btn btn-gold">Continue${I('arrow')}</button></div>`});

add({id:'game-settings',group:'core',name:'Game settings',note:'Setup step 2',route:'app/game-settings.tsx',html:()=>`<div class="body">${NAV(2,'Step 2 of 3')}
 <h2 class="h h-l">Game settings</h2>
 <div class="glass pad col" style="gap:10px"><span class="lab">Players</span><div class="stepper"><button class="iconbtn" aria-label="Fewer">${I('minus')}</button><span class="big-num">5</span><button class="iconbtn" aria-label="More">${I('plus')}</button></div><div class="row" style="justify-content:center;gap:5px">${[1,2,3,4,5].map(n=>`<span class="av a${n}" style="width:22px;height:22px;border-radius:7px"></span>`).join('')}<span style="width:22px;height:22px;border-radius:7px;border:1.5px dashed var(--muted)"></span></div></div>
 <div class="glass pad col" style="gap:10px"><div class="navrow"><span class="lab">Timer per clue</span><span class="gold" style="font-size:12.5px;font-weight:700">Off</span></div><div class="chips"><span class="chip on">Off</span><span class="chip">30s</span><span class="chip">60s</span><span class="chip">90s</span><span class="chip">Custom</span></div></div>
 <div class="glass" style="border-radius:20px"><div class="list-row"><div class="grow"><div class="t">Clue rounds</div><div class="d">Turns before voting</div></div><div class="row" style="gap:6px"><button class="iconbtn glass" style="width:32px;height:32px" aria-label="Fewer">${I('minus')}</button><span class="num" style="font-weight:700;font-size:17px;width:16px;text-align:center">2</span><button class="iconbtn glass" style="width:32px;height:32px" aria-label="More">${I('plus')}</button></div></div>
 <div class="list-row"><div class="grow"><div class="t">Team votes together</div><div class="d">One shared vote on this phone</div></div><button class="tog" aria-pressed="true" aria-label="Team votes together"></button></div></div>
 <div class="spacer"></div><button class="btn btn-gold">Add player names${I('arrow')}</button></div>`});

add({id:'player-names',group:'core',name:'Player names',note:'Setup step 3',route:'app/player-names.tsx',html:()=>`<div class="body">${NAV(3,'Step 3 of 3')}
 <div class="col" style="gap:4px"><h2 class="h h-l">Who is playing?</h2><p class="sub">Names are saved for next time.</p></div>
 <div class="glass" style="border-radius:20px">${NAMES.map((n,i)=>`<div class="list-row" style="padding:9px 12px"><span class="av a${i+1}">${n[0]}</span><div class="grow" style="font-weight:600;display:flex;align-items:center;gap:2px">${n}${i===4?'<span class="caret"></span>':''}</div><span style="font-size:11px;color:var(--muted)">P${i+1}</span></div>`).join('')}</div>
 <div class="col" style="gap:8px"><span class="lab">Recent players</span><div class="chips"><span class="chip">${I('plus')}Ishaan</span><span class="chip">${I('plus')}Tara</span><span class="chip">${I('plus')}Vikram</span></div></div>
 <div class="spacer"></div><button class="btn btn-gold">${I('play')}Start game</button></div>`});

add({id:'pass-phone',group:'core',name:'Pass the phone',note:'Before each reveal',route:'app/reveal.tsx',html:()=>`<div class="body center">
 <div class="navrow" style="width:100%"><button class="iconbtn glass" aria-label="Exit game">${I('x')}</button><span class="lab">Player 2 of 5</span><span style="width:40px"></span></div>
 <div class="row" style="justify-content:center;gap:6px">${NAMES.map((n,i)=>`<span style="width:${i===1?22:8}px;height:8px;border-radius:4px;background:${i<1?'var(--ink)':i===1?'var(--gold)':'var(--line)'}"></span>`).join('')}</div>
 <div class="col center" style="gap:6px;margin-top:14px"><span class="lab">Pass the phone to</span><h2 class="h hero" style="font-size:clamp(40px,15cqi,56px)">Meera</h2><p class="sub">Make sure nobody else can see the screen.</p></div>
 <div class="reveal-card glass" style="width:100%"><div style="position:relative;width:96px;height:96px;display:grid;place-items:center"><span style="position:absolute;inset:0;border-radius:30px;background:var(--gold);opacity:.35;animation:pulse 2.2s ease-in-out infinite"></span><span class="tile-ic ink" style="width:76px;height:76px;border-radius:24px">${I('finger','width:38px;height:38px')}</span></div><span class="h h-s">Press and hold to see your word</span><span class="sub" style="font-size:12px">Let go to hide it again</span></div></div>`});

add({id:'word-reveal',group:'core',name:'Word reveal',note:'Crew player',route:'app/reveal.tsx',html:()=>`<div class="body center">${revealCard(false)}</div>`});
add({id:'imposter-reveal',group:'core',name:'Imposter reveal',note:'Same look as crew',route:'app/reveal.tsx',html:()=>`<div class="body center">${revealCard(true)}</div>`});

add({id:'clue-round',group:'core',name:'Clue round',note:'Timer running',route:'app/clue-round.tsx',html:()=>`<div class="body">
 <div class="navrow"><button class="iconbtn glass" aria-label="Pause game">${I('pause')}</button><span class="lab">Clue round 1 of 2</span><span class="pill g">${I('bowl')}Food</span></div>
 <div class="ring"><svg viewBox="0 0 190 190"><circle cx="95" cy="95" r="84" fill="none" stroke="var(--line)" stroke-width="10"/><circle cx="95" cy="95" r="84" fill="none" stroke="var(--gold)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*.6}"/></svg><div class="ctr"><span class="num" style="font-size:clamp(34px,12cqi,44px);font-weight:700;letter-spacing:-.03em">0:24</span><span class="lab">of 60s</span></div></div>
 <div class="glass list-row" style="border-radius:18px;padding:14px"><span class="av a2" style="width:44px;height:44px;border-radius:14px;font-size:18px">M</span><div class="grow"><div class="lab">Now giving a clue</div><div class="h h-m">Meera</div></div><span style="font-size:12px;color:var(--muted)">2 of 5</span></div>
 <div class="row" style="gap:6px;justify-content:center">${NAMES.map((n,i)=>`<span class="av a${i+1}" style="width:30px;height:30px;font-size:11px;${i>1?'opacity:.35;':''}${i===1?'outline:2px solid var(--gold);outline-offset:2px':''}">${i===0?I('check','width:14px;height:14px'):n[0]}</span>`).join('')}</div>
 <div class="glass pad col" style="gap:6px;padding:12px 14px"><span class="lab">Rules</span><span class="sub" style="font-size:12.5px">One word only. Do not say the word itself.</span></div>
 <div class="spacer"></div><div class="row" style="gap:8px"><button class="btn btn-glass" style="flex:1">Skip to vote</button><button class="btn btn-gold" style="flex:1.4">Next player${I('arrow')}</button></div></div>`});

const votes=[1,0,3,0,1];
add({id:'vote',group:'core',name:'Vote',note:'Who is it?',route:'app/vote.tsx',html:()=>`<div class="body">
 <div class="navrow"><span style="width:40px"></span><span class="lab">Voting &middot; 5 of 5 in</span><span style="width:40px"></span></div>
 <div class="col" style="gap:4px"><h2 class="h h-l">Who is the imposter?</h2><p class="sub">Tap a player. You can change your vote until the reveal.</p></div>
 <div class="vote-grid">${NAMES.map((n,i)=>`<div class="vcard glass ${i===2?'sel':''}"><span class="av a${i+1}">${n[0]}</span><span style="font-weight:600">${n}</span><span class="cnt">${votes[i]}</span></div>`).join('')}<div class="vcard" style="border:1.5px dashed var(--line);justify-content:center;color:var(--muted);font-weight:600;font-size:12.5px">Skip vote</div></div>
 <div class="glass pad col" style="gap:10px"><div class="navrow"><span class="lab">Vote tally</span><span class="gold" style="font-size:12.5px;font-weight:700">Kabir leads</span></div>
 ${[['Kabir',60],['Aarav',20],['Rohan',20]].map(v=>`<div class="col" style="gap:5px"><div class="navrow" style="font-size:12.5px;font-weight:600"><span>${v[0]}</span><span class="num" style="color:var(--muted)">${v[1]}%</span></div><div class="bar"><i style="width:${v[1]}%"></i></div></div>`).join('')}</div>
 <div class="spacer"></div><button class="btn btn-gold">${I('eye')}Reveal imposter</button></div>`});

add({id:'result',group:'core',name:'Result',note:'Crew wins',route:'app/result.tsx',html:()=>`<div class="body center">${resultTop()}<div class="spacer"></div><button class="btn btn-gold">${I('refresh')}Play again</button><button class="btn btn-text">Change category</button></div>`});

add({id:'stats',group:'core',name:'Stats',note:'Tab: Stats',route:'app/(tabs)/stats.tsx',tab:'Stats',html:()=>`<div class="body tabbed">${statsTop()}</div>`});

const linkRow=(t,d,i)=>`<div class="list-row"><span class="tile-ic" style="width:34px;height:34px;border-radius:10px">${I(i)}</span><div class="grow"><div class="t">${t}</div>${d?`<div class="d">${d}</div>`:''}</div>${I('chev')}</div>`;
add({id:'settings',group:'core',name:'Settings',note:'Tab: Settings (scrolls)',route:'app/(tabs)/settings.tsx',tab:'Settings',html:()=>`<div class="body tabbed" style="gap:12px">
 <span class="h h-l">Settings</span>
 <div style="border-radius:20px;padding:16px;display:flex;align-items:center;gap:12px;background:var(--ink);color:var(--bg);box-shadow:0 16px 30px -18px rgba(var(--shadow),.7);flex:none"><span class="tile-ic" style="background:var(--gold);color:var(--on-gold)">${I('crown')}</span><div class="grow"><div style="font-weight:700">Go Premium</div><div style="font-size:12px;opacity:.65">All 9 categories, no ads</div></div><span style="color:var(--gold)">${I('chev')}</span></div>
 <span class="lab">Gameplay</span><div class="glass" style="border-radius:18px;flex:none">${tg('Round timer','Show countdown in clue round','clock',true)}</div>
 <span class="lab">Sound and feel</span><div class="glass" style="border-radius:18px;flex:none">${tg('Sound effects','Blip on reveal, fanfare at the end','vol',true)}${tg('Timer sounds','Tick in the last 10 seconds','bell',false)}${tg('Haptics','Buzz on every reveal, the same for everyone','vib',true)}</div>
 <span class="lab">Accessibility</span><div class="glass" style="border-radius:18px;flex:none">${tg('Larger text','Bigger words and buttons','textsize',false)}${tg('Reduce motion','Turn off pulses and glows','motion',false)}</div>
 <span class="lab">Word packs</span><div class="glass" style="border-radius:18px;flex:none"><div class="list-row"><span class="tile-ic" style="width:34px;height:34px;border-radius:10px">${I('cloud')}</span><div class="grow"><div class="t">Words up to date</div><div class="d">1,350 words &middot; updated 2 days ago</div></div><button class="ad-cta">Check</button></div></div>
 <span class="lab">Help</span><div class="glass" style="border-radius:18px;flex:none">${linkRow('Help and support','Report a problem or a word','buoy')}${linkRow('Suggest a category','','msg')}${linkRow('Privacy policy','','doc')}</div>
 <span style="text-align:center;font-size:11.5px;color:var(--muted)">Impostr 1.1.0 &middot; Gooseberry Media</span></div>`});

add({id:'premium',group:'core',name:'Premium',note:'Paywall',route:'app/premium.tsx',html:()=>`<div class="body" style="gap:12px">
 <div class="navrow"><button class="iconbtn glass" aria-label="Close">${I('x')}</button><button class="btn-text" style="background:none;border:0;font:600 13px var(--f-body);color:var(--ink2)">Restore</button></div>
 <div class="col" style="gap:8px"><span class="tile-ic ink" style="width:52px;height:52px;border-radius:16px">${I('crown')}</span><h2 class="h h-l">Impostr <span class="gold">Pro</span></h2><p class="sub">Every pack, every mode, no ads.</p></div>
 <div class="glass" style="border-radius:18px;padding:6px 0">${[['All 9 categories','Food, Bollywood, Sports and more'],['Custom word packs','Add your own inside jokes'],['No ads','A clean screen every game']].map(b=>`<div class="list-row" style="padding:9px 14px"><span style="color:var(--gold-deep)">${I('check')}</span><div class="grow"><div class="t" style="font-size:13.5px">${b[0]}</div><div class="d">${b[1]}</div></div></div>`).join('')}</div>
 <div class="col" style="gap:10px;margin-top:4px">
  <div class="plan glass"><span class="radio"></span><div class="grow"><div style="font-weight:700">Monthly</div><div style="font-size:12px;color:var(--muted)">Billed every month</div></div><span class="num" style="font-weight:700;font-size:16px">&#8377;49</span></div>
  <div class="plan glass sel"><span class="tag">SAVE 66%</span><span class="radio"></span><div class="grow"><div style="font-weight:700">Yearly</div><div style="font-size:12px;color:var(--ink2)">&#8377;16.6 a month</div></div><span class="num" style="font-weight:700;font-size:16px">&#8377;199</span></div>
  <div class="plan glass"><span class="radio"></span><div class="grow"><div style="font-weight:700">Lifetime</div><div style="font-size:12px;color:var(--muted)">Pay once, play forever</div></div><span class="num" style="font-weight:700;font-size:16px">&#8377;599</span></div>
 </div><div class="spacer"></div><button class="btn btn-gold">Continue with Yearly</button><span style="text-align:center;font-size:11px;color:var(--muted)">Cancel any time in Play Store</span></div>`});

add({id:'suggest',group:'core',name:'Suggest a category',note:'From Settings',route:'app/suggest.tsx',html:()=>`<div class="body">
 <div class="navrow"><button class="iconbtn glass" aria-label="Back">${I('back')}</button><span class="lab">Feedback</span><span style="width:40px"></span></div>
 <div class="col" style="gap:4px"><h2 class="h h-l">Suggest a category</h2><p class="sub">The best ideas become new packs.</p></div>
 <div class="field"><span class="lab">Category name</span><div class="input glass"><span>Cricket legends</span><span class="caret"></span></div></div>
 <div class="field"><span class="lab">Why would it be fun? (optional)</span><div class="input glass ta">Everyone in our group argues about who the greatest is...</div></div>
 <div class="col" style="gap:8px"><span class="lab">Popular ideas</span><div class="chips"><span class="chip">Street food</span><span class="chip">90s cartoons</span><span class="chip">Indian cities</span><span class="chip">Board games</span></div></div>
 <div class="spacer"></div><button class="btn btn-ink">${I('send')}Send suggestion</button></div>`});

/* ONLINE (Phase 2) */
add({id:'choose-mode',group:'online',name:'Choose how to play',note:'After Play now',route:'new: app/mode.tsx',html:()=>`<div class="body">${NAV(0,'New game')}
 <div class="col" style="gap:4px"><h2 class="h h-l">How are you playing?</h2><p class="sub">Pick one. You can switch next game.</p></div>
 <div class="glass" style="border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:12px;outline:2px solid var(--gold);background:var(--gold-soft)"><div class="row"><span class="tile-ic ink">${I('phone1')}</span><div class="grow"><div class="h h-s">Pass and play</div><div class="sub" style="font-size:12.5px">One phone, passed around the room</div></div><span class="radio" style="border-color:var(--gold-deep)"></span></div><div class="chips"><span class="chip">${I('offline')}No internet needed</span></div></div>
 <div class="glass" style="border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:12px"><div class="row"><span class="tile-ic">${I('users')}</span><div class="grow"><div class="h h-s">Everyone on their own phone</div><div class="sub" style="font-size:12.5px">Share a link. Friends join from their phones</div></div><span class="radio"></span></div><div class="chips"><span class="chip">${I('wifi')}Same Wi-Fi or internet</span><span class="chip">${I('link')}Invite link</span></div></div>
 <div class="spacer"></div><button class="btn btn-gold">Continue${I('arrow')}</button></div>`});

add({id:'host-room',group:'online',name:'Host room',note:'Share the invite',route:'new: app/online/host.tsx',html:()=>`<div class="body">${NAV(0,'Online room')}
 <div class="glass" style="border-radius:24px;padding:18px;display:flex;gap:14px;align-items:center"><div class="qr"><i></i></div><div class="col" style="gap:6px;min-width:0"><span class="lab">Room code</span><span class="h" style="font-size:clamp(28px,10cqi,36px);letter-spacing:.06em">HNY42</span><span class="sub" style="font-size:12px">Scan or enter the code in the app</span></div></div>
 <div class="row" style="gap:8px"><button class="btn btn-gold" style="flex:1.4">${I('share')}Share invite link</button><button class="btn btn-glass" style="flex:1">${I('copy')}Copy</button></div>
 <div class="navrow"><span class="lab">In the room &middot; 4</span><span class="lab gold">Waiting for more</span></div>
 <div class="glass" style="border-radius:20px">${['Aarav (you, host)','Meera','Kabir','Diya'].map((n,i)=>`<div class="list-row" style="padding:9px 12px"><span class="av a${i+1}">${n[0]}</span><div class="grow t">${n}</div><span style="color:var(--gold-deep)">${I('check','width:18px;height:18px')}</span></div>`).join('')}<div class="list-row" style="padding:9px 12px;color:var(--muted)"><span class="av" style="border:1.5px dashed var(--muted)"></span><div class="grow" style="font-size:13px">Rohan is joining...</div></div></div>
 <div class="spacer"></div><button class="btn btn-ink">${I('play')}Start game (4 players)</button></div>`});

add({id:'join-room',group:'online',name:'Join room',note:'Enter code',route:'new: app/online/join.tsx',html:()=>`<div class="body">${NAV(0,'Join a game')}
 <div class="col" style="gap:4px"><h2 class="h h-l">Enter room code</h2><p class="sub">Ask the host for the 5-letter code, or open their invite link.</p></div>
 <div class="codebox">${['H','N','Y','4',''].map((c,i)=>`<span class="glass ${i===4?'on':''}">${c||'<span class="caret"></span>'}</span>`).join('')}</div>
 <div class="field"><span class="lab">Your name</span><div class="input glass"><span class="av a5" style="width:28px;height:28px;border-radius:9px;font-size:11px">R</span><span>Rohan</span></div></div>
 <div class="glass list-row" style="border-radius:18px"><span class="tile-ic">${I('users')}</span><div class="grow"><div class="t">Aarav's room</div><div class="d">4 players waiting &middot; Bollywood</div></div></div>
 <div class="spacer"></div><button class="btn btn-gold">Join room${I('arrow')}</button></div>`});

add({id:'invite-landing',group:'online',name:'Invite link page',note:'Opens in browser',route:'web: /join/HNY42',html:()=>`<div class="body center" style="justify-content:center;gap:18px">
 <div style="filter:drop-shadow(0 16px 24px rgba(90,60,0,.3))">${MARK(84)}</div>
 <div class="col center" style="gap:6px"><span class="lab">You are invited</span><h2 class="h h-l">Aarav wants you<br>in a game of Impostr</h2><p class="sub">Room HNY42 &middot; 4 players waiting</p></div>
 <div class="row" style="justify-content:center;gap:4px">${['A','M','K','D'].map((c,i)=>`<span class="av a${i+1}" style="margin-left:${i?-8:0}px;border:2px solid var(--bg)">${c}</span>`).join('')}</div>
 <div class="col" style="width:100%;gap:8px;margin-top:6px"><button class="btn btn-gold">Open in the app</button><button class="btn btn-ink">${I('download')}Get the app from Play Store</button><button class="btn btn-text">Play in this browser</button></div>
 <span style="font-size:11px;color:var(--muted)">The link opens the room directly once the app is installed.</span></div>`});

add({id:'online-clue',group:'online',name:'Online clue round',note:'On your own phone',route:'new: app/online/round.tsx',html:()=>`<div class="body">
 <div class="navrow"><span class="pill ink">${I('wifi')}HNY42</span><span class="lab">Round 1 of 2</span><span class="num" style="font-weight:700">0:24</span></div>
 <div class="glass row" style="border-radius:18px;padding:12px 14px"><span class="tile-ic">${I('eye')}</span><div class="grow"><div class="lab">Your word</div><div class="h h-m">Mango</div></div><button class="iconbtn" aria-label="Hide word">${I('eyeoff')}</button></div>
 <span class="lab">Clues so far</span>
 <div class="feed">${[['Aarav','Yellow',1],['Meera','Summer',2],['Kabir','Sweet',3]].map(c=>`<div class="bubble glass"><span class="av a${c[2]}" style="width:30px;height:30px;font-size:11px">${c[0][0]}</span><span style="font-size:12.5px;color:var(--muted);flex:1">${c[0]}</span><b>${c[1]}</b></div>`).join('')}<div class="bubble" style="border:1.5px dashed var(--line)"><span class="av a4" style="width:30px;height:30px;font-size:11px">D</span><span style="font-size:12.5px;color:var(--muted);flex:1">Diya is typing...</span></div></div>
 <div class="spacer"></div>
 <div class="glass" style="border-radius:18px;padding:8px 8px 8px 14px;display:flex;align-items:center;gap:8px"><span style="flex:1;color:var(--muted)">Your clue is next</span><button class="iconbtn" style="background:var(--line)" aria-label="Send clue" disabled>${I('send')}</button></div></div>`});

add({id:'online-vote',group:'online',name:'Online vote',note:'Votes stay private',route:'new: app/online/vote.tsx',html:()=>`<div class="body">
 <div class="navrow"><span class="pill ink">${I('wifi')}HNY42</span><span class="lab">Voting</span><span style="width:60px"></span></div>
 <div class="col" style="gap:4px"><h2 class="h h-l">Who is the imposter?</h2><p class="sub">Your vote is hidden until everyone has voted.</p></div>
 <div class="vote-grid">${NAMES.map((n,i)=>`<div class="vcard glass ${i===2?'sel':''}"><span class="av a${i+1}">${n[0]}</span><span style="font-weight:600">${i===4?'You':n}</span></div>`).join('')}</div>
 <div class="glass pad col" style="gap:10px"><div class="navrow"><span class="lab">Votes in</span><span class="num" style="font-weight:700">3 of 5</span></div><div class="bar"><i style="width:60%"></i></div><div class="row" style="gap:6px">${NAMES.map((n,i)=>`<span class="av a${i+1}" style="width:26px;height:26px;font-size:10px;${i>2?'opacity:.3':''}">${i<3?I('check','width:13px;height:13px'):n[0]}</span>`).join('')}</div></div>
 <div class="spacer"></div><button class="btn btn-gold">${I('check')}Lock my vote</button></div>`});

/* ADS (planned) */
add({id:'ad-home',group:'ads',name:'Home, scrolled',note:'Ad below categories',route:'app/(tabs)/index.tsx',tab:'Play',scroll:true,html:()=>`<div class="body tabbed">${homeTop()}${homeCats()}<span class="lab">Sponsored</span>${AD()}</div><span class="annot" style="bottom:170px">AD SLOT</span>`});
add({id:'ad-result',group:'ads',name:'Result, scrolled',note:'Ad after the buttons',route:'app/result.tsx',scroll:true,html:()=>`<div class="body center">${resultTop()}<button class="btn btn-gold">${I('refresh')}Play again</button><button class="btn btn-text">Change category</button><div style="width:100%;text-align:left">${AD()}</div></div><span class="annot" style="bottom:110px">AD SLOT</span>`});
add({id:'ad-stats',group:'ads',name:'Stats, extra space',note:'Ad fills empty space',route:'app/(tabs)/stats.tsx',tab:'Stats',html:()=>`<div class="body tabbed">${statsTop()}<div class="spacer"></div>${AD()}</div><span class="annot" style="bottom:170px">AD SLOT</span>`});

/* GROWTH (Phase 1.5: play again and again, word of mouth) */
const ladder=[['check','Play 5 games','Chaos difficulty unlocked',1,5,5],['bowl','Play 10 games','Food pack free forever',0,7,10],['flame','3-day streak','24-hour Pro pass',0,2,3],['gift','Invite 2 friends','Bollywood pack free forever',0,1,2],['trophy','Win 5 as imposter','Master of Disguise badge',0,3,5]];
const progRow=(r)=>`<div class="list-row" style="padding:11px 14px;align-items:flex-start"><span class="tile-ic ${r[3]?'ink':''}" style="width:36px;height:36px;border-radius:11px">${I(r[3]?'check':r[0],'width:18px;height:18px')}</span><div class="grow col" style="gap:6px"><div class="navrow"><span class="t" style="font-size:13.5px">${r[1]}</span><span class="num" style="font-size:12px;color:var(--muted);font-weight:600">${r[3]?'Done':r[4]+' of '+r[5]}</span></div><span class="d" style="margin:0">${r[2]}</span>${r[3]?'':`<div class="bar"><i style="width:${Math.round(r[4]/r[5]*100)}%"></i></div>`}</div></div>`;
add({id:'home-rewards',group:'growth',name:'Home with rewards',note:'Progress card',route:'app/(tabs)/index.tsx',tab:'Play',html:()=>`<div class="body tabbed">${homeTop()}
 <div class="glass" style="border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:10px;flex:none"><div class="row"><span class="tile-ic">${I('gift')}</span><div class="grow"><div class="t" style="font-weight:700">3 games to unlock Food</div><div style="font-size:12px;color:var(--muted)">Free forever, no payment</div></div><span class="pill g">${I('flame')}2 days</span></div><div class="bar"><i style="width:70%"></i></div></div>
 ${homeCats()}</div>`});
add({id:'rewards',group:'growth',name:'Rewards',note:'Unlock by playing',route:'new: app/rewards.tsx',html:()=>`<div class="body">${NAV(0,'Rewards')}
 <div class="glass" style="border-radius:22px;padding:16px;display:flex;align-items:center;gap:14px;flex:none"><span class="tile-ic ink" style="width:52px;height:52px;border-radius:16px">${I('flame','width:26px;height:26px')}</span><div class="grow"><div class="lab">Play streak</div><div class="h h-l">2 days</div><div class="sub" style="font-size:12px">Play tomorrow for a 24-hour Pro pass</div></div></div>
 <div class="row" style="justify-content:space-between;gap:4px">${['M','T','W','T','F','S','S'].map((d,i)=>`<div class="col center" style="gap:4px"><span style="width:30px;height:30px;border-radius:10px;display:grid;place-items:center;${i<2?'background:var(--gold);color:var(--on-gold)':i===2?'border:1.5px dashed var(--gold-deep)':'background:var(--line)'}">${i<2?I('check','width:14px;height:14px'):''}</span><span style="font-size:10.5px;color:var(--muted);font-weight:600">${d}</span></div>`).join('')}</div>
 <span class="lab">Unlock by playing</span>
 <div class="glass" style="border-radius:20px">${ladder.map(progRow).join('')}</div></div>`});
add({id:'reward-unlocked',group:'growth',name:'Reward unlocked',note:'Celebration moment',route:'new: modal',html:()=>`<div class="body center" style="justify-content:center;gap:18px">
 <div style="position:relative;width:140px;height:140px;display:grid;place-items:center"><span style="position:absolute;inset:0;border-radius:44px;background:var(--gold);opacity:.35;filter:blur(14px);animation:pulse 2.4s ease-in-out infinite"></span>${[[-60,-50],[64,-40],[-54,58],[60,56],[0,-78]].map(([x,y])=>`<span style="position:absolute;left:calc(50% + ${x}px);top:calc(50% + ${y}px);color:var(--gold-deep)">${I('spark','width:16px;height:16px')}</span>`).join('')}<span class="tile-ic ink" style="position:relative;width:104px;height:104px;border-radius:32px">${I('bowl','width:50px;height:50px')}</span></div>
 <div class="col center" style="gap:6px"><span class="pill g">${I('gift')}Reward unlocked</span><h2 class="h h-xl">Food pack</h2><p class="sub" style="max-width:26ch">You played 10 games. 150 new words are now free, forever.</p></div>
 <div class="col" style="width:100%;gap:8px;margin-top:10px"><button class="btn btn-gold">${I('play')}Play with Food</button><button class="btn btn-glass">${I('share')}Tell the group</button></div>
 <span style="font-size:12px;color:var(--muted)">Next: 3-day streak for a 24-hour Pro pass</span></div>`});
add({id:'share-result',group:'growth',name:'Share result',note:'Sheet over Result',route:'app/result.tsx (sheet)',html:()=>`<div class="body center">${resultTop()}</div><div class="dim"></div><div class="sheet glass" style="gap:12px">
 <div style="width:40px;height:4px;border-radius:2px;background:var(--line);align-self:center"></div>
 <div class="navrow"><h2 class="h h-m">Share the moment</h2><button class="iconbtn" aria-label="Close">${I('x')}</button></div>
 <div style="border-radius:20px;padding:18px;background:linear-gradient(160deg,#FFD95A,#F2B705 60%,#E3A400);color:#1B1813;display:flex;flex-direction:column;gap:10px;box-shadow:0 18px 30px -18px rgba(120,80,0,.6)">
  <div class="row" style="gap:8px">${MARK(28)}<span style="font:700 14px var(--f-display)">Impostr</span><span style="margin-left:auto;font-size:11px;font-weight:600;opacity:.7">Game night</span></div>
  <div style="font:800 26px/1.05 var(--f-display);letter-spacing:-.02em">Kabir fooled no one.</div>
  <div style="font-size:12.5px;font-weight:600;opacity:.8">The word was Mango. Crew wins, 3 votes to 2.</div>
  <div class="row" style="gap:6px;margin-top:2px">${['A','M','K','D','R'].map((c,i)=>`<span class="av a${i+1}" style="width:26px;height:26px;font-size:10px;border:2px solid rgba(255,255,255,.7)">${c}</span>`).join('')}<span style="margin-left:auto;font-size:10.5px;font-weight:700;background:#1B1813;color:#F2B705;padding:4px 7px;border-radius:6px">Play free: impostr.app</span></div>
 </div>
 <div class="row" style="gap:8px"><button class="btn btn-gold" style="flex:1.4">${I('share')}Share to chat</button><button class="btn btn-glass" style="flex:1">${I('download')}Save</button></div></div>`});
add({id:'invite-friends',group:'growth',name:'Invite friends',note:'From Home, Settings, Result',route:'new: app/invite.tsx',html:()=>`<div class="body">${NAV(0,'Invite friends')}
 <div class="col" style="gap:6px"><h2 class="h h-l">Bring the group,<br>get <span class="gold">Bollywood</span> free</h2><p class="sub">When 2 friends install Impostr with your link, the Bollywood pack unlocks for you.</p></div>
 <div class="glass pad col" style="gap:12px"><div class="navrow"><span class="lab">Friends joined</span><span class="num" style="font-weight:700">1 of 2</span></div><div class="row" style="gap:8px"><span class="av a4">D</span><span class="av" style="border:1.5px dashed var(--muted)"></span><span class="grow" style="font-size:12.5px;color:var(--ink2)">Diya joined yesterday</span></div><div class="bar"><i style="width:50%"></i></div></div>
 <div class="field"><span class="lab">Your invite link</span><div class="input glass"><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">impostr.app/i/aarav7</span><button class="iconbtn" style="width:32px;height:32px" aria-label="Copy link">${I('copy','width:17px;height:17px')}</button></div></div>
 <div class="glass pad col" style="gap:6px;padding:12px 14px"><span class="lab">Message preview</span><span class="sub" style="font-size:12.5px">One of us is lying. Join me on Impostr, the party word game. It's free: impostr.app/i/aarav7</span></div>
 <div class="spacer"></div><button class="btn btn-gold">${I('share')}Share invite</button></div>`});

/* PHASE 1 ADDITIONS */
add({id:'pause',group:'extra',name:'Pause game',note:'Sheet over Clue round',route:'app/clue-round.tsx (sheet)',html:()=>`<div class="body">
 <div class="navrow"><button class="iconbtn glass" aria-label="Pause game">${I('pause')}</button><span class="lab">Clue round 1 of 2</span><span class="pill g">${I('bowl')}Food</span></div>
 <div class="ring"><svg viewBox="0 0 190 190"><circle cx="95" cy="95" r="84" fill="none" stroke="var(--line)" stroke-width="10"/><circle cx="95" cy="95" r="84" fill="none" stroke="var(--gold)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*.6}"/></svg><div class="ctr"><span class="num" style="font-size:44px;font-weight:700">0:24</span><span class="lab">Paused</span></div></div></div>
 <div class="dim"></div><div class="sheet glass">
 <div style="width:40px;height:4px;border-radius:2px;background:var(--line);align-self:center"></div>
 <div class="col" style="gap:4px"><h2 class="h h-l">Game paused</h2><p class="sub">The timer has stopped. Nobody can see the word.</p></div>
 <button class="btn btn-gold">${I('play')}Resume</button>
 <div class="glass" style="border-radius:18px">
  <div class="list-row"><span class="tile-ic" style="width:34px;height:34px;border-radius:10px">${I('refresh')}</span><div class="grow"><div class="t">Restart round</div><div class="d">Same word, clues start again</div></div>${I('chev')}</div>
  <div class="list-row"><span class="tile-ic" style="width:34px;height:34px;border-radius:10px">${I('eye')}</span><div class="grow"><div class="t">End and reveal</div><div class="d">Show the imposter and the word</div></div>${I('chev')}</div>
  <div class="list-row"><span class="tile-ic" style="width:34px;height:34px;border-radius:10px">${I('home2')}</span><div class="grow"><div class="t">Exit to home</div><div class="d">This game will not count in stats</div></div>${I('chev')}</div>
 </div></div>`});
add({id:'exit-confirm',group:'extra',name:'Exit confirm',note:'Before leaving a game',route:'app/clue-round.tsx (dialog)',html:()=>`<div class="body">
 <div class="navrow"><button class="iconbtn glass" aria-label="Pause game">${I('pause')}</button><span class="lab">Clue round 1 of 2</span><span style="width:40px"></span></div></div>
 <div class="dim"></div>
 <div class="glass" style="position:absolute;left:24px;right:24px;top:50%;transform:translateY(-50%);z-index:5;border-radius:24px;padding:22px;display:flex;flex-direction:column;gap:12px;background:var(--glass-hi)">
  <span class="tile-ic ink" style="width:46px;height:46px;border-radius:14px">${I('home2')}</span>
  <h2 class="h h-m">Leave this game?</h2><p class="sub">Players will lose this round. The word is not shown.</p>
  <div class="row" style="gap:8px;margin-top:4px"><button class="btn btn-glass" style="flex:1;min-height:48px">Keep playing</button><button class="btn btn-ink" style="flex:1;min-height:48px">Leave</button></div>
 </div>`});
add({id:'help',group:'extra',name:'Help and support',note:'From Settings',route:'new: app/help.tsx',html:()=>`<div class="body">${NAV(0,'Help')}
 <h2 class="h h-l">How can we help?</h2>
 <div class="glass" style="border-radius:20px;flex:none">
  <div class="list-row"><span class="tile-ic" style="width:34px;height:34px;border-radius:10px">${I('flag')}</span><div class="grow"><div class="t">Report a problem</div><div class="d">Something broke or looks wrong</div></div>${I('chev')}</div>
  <div class="list-row"><span class="tile-ic" style="width:34px;height:34px;border-radius:10px">${I('x')}</span><div class="grow"><div class="t">Report a word</div><div class="d">Wrong, unfair or not suitable</div></div>${I('chev')}</div>
  <div class="list-row"><span class="tile-ic" style="width:34px;height:34px;border-radius:10px">${I('crown')}</span><div class="grow"><div class="t">Purchase help</div><div class="d">Restore, refunds, manage plan</div></div>${I('chev')}</div>
 </div>
 <span class="lab">Quick answers</span>
 <div class="glass" style="border-radius:20px;flex:none">${['Does it need internet?','How many players can play?','How do I get my purchase back on a new phone?'].map(q=>`<div class="list-row"><div class="grow t" style="font-weight:500">${q}</div>${I('chev')}</div>`).join('')}</div>
 <div class="glass pad col" style="gap:6px;padding:14px"><span class="lab">Email us</span><div class="navrow"><span style="font-weight:600">support@gooseberry.media</span><button class="iconbtn" style="width:32px;height:32px" aria-label="Copy email">${I('copy','width:17px;height:17px')}</button></div><span class="d" style="font-size:12px;color:var(--muted)">Placeholder address. We reply within 2 working days.</span></div></div>`});
add({id:'report',group:'extra',name:'Report a problem',note:'Form',route:'new: app/report.tsx',html:()=>`<div class="body">${NAV(0,'Report')}
 <div class="col" style="gap:4px"><h2 class="h h-l">Report a problem</h2><p class="sub">Tell us what happened. Device details are added for you.</p></div>
 <div class="col" style="gap:8px"><span class="lab">What kind?</span><div class="chips"><span class="chip on">Bug</span><span class="chip">Bad word</span><span class="chip">Purchase</span><span class="chip">Other</span></div></div>
 <div class="field"><span class="lab">What happened?</span><div class="input glass ta" style="color:var(--ink);font-weight:500">The timer kept running after I paused<span class="caret" style="display:inline-block;vertical-align:middle;margin-left:2px"></span></div></div>
 <div class="glass list-row" style="border-radius:16px"><div class="grow"><div class="t">Include device details</div><div class="d">Phone model, Android version, app version</div></div><button class="tog" aria-pressed="true" aria-label="Include device details"></button></div>
 <div class="spacer"></div><button class="btn btn-ink">${I('send')}Send report</button><span style="text-align:center;font-size:11.5px;color:var(--muted)">No names or personal details are sent.</span></div>`});
add({id:'new-words',group:'extra',name:'New words added',note:'Sheet on Home after update',route:'app/(tabs)/index.tsx (sheet)',tab:'Play',html:()=>`<div class="body tabbed">${homeTop()}</div><div class="dim"></div><div class="sheet glass">
 <div style="width:40px;height:4px;border-radius:2px;background:var(--line);align-self:center"></div>
 <div class="row"><span class="tile-ic ink" style="width:48px;height:48px;border-radius:15px">${I('lamp','width:24px;height:24px')}</span><div class="grow"><span class="pill g">${I('cloud')}New words</span><h2 class="h h-m" style="margin-top:6px">Diwali pack is here</h2></div></div>
 <p class="sub">60 festival words added to Festivals, plus 40 new words across General and Home. Free for everyone until 15 Nov.</p>
 <button class="btn btn-gold">${I('play')}Play Diwali pack</button><button class="btn btn-text">Later</button></div>`});

add({id:'settings-scrolled',group:'extra',name:'Settings, scrolled',note:'Accessibility, words, help',route:'app/(tabs)/settings.tsx',tab:'Settings',scroll:true,html:()=>S.find(x=>x.id==='settings').html()});
add({id:'who-starts',group:'core',name:'Who starts',note:'Random each game',route:'app/clue-round.tsx (intro)',html:()=>`<div class="body center" style="justify-content:center;gap:18px">
 <span class="lab">Everyone has seen their word</span>
 <div style="position:relative;width:120px;height:120px;display:grid;place-items:center"><span style="position:absolute;inset:0;border-radius:38px;background:var(--gold);opacity:.35;filter:blur(12px);animation:pulse 2.4s ease-in-out infinite"></span><span class="av a4" style="position:relative;width:104px;height:104px;border-radius:32px;font-size:44px">D</span><span class="tile-ic ink" style="position:absolute;right:-6px;bottom:-6px;width:38px;height:38px;border-radius:12px;border:3px solid var(--bg)">${I('dice','width:18px;height:18px')}</span></div>
 <div class="col center" style="gap:6px"><h2 class="h hero" style="font-size:clamp(34px,12cqi,46px)">Diya starts</h2><p class="sub">Picked at random. Then go clockwise.</p></div>
 <div class="glass" style="border-radius:18px;padding:12px 14px;width:100%"><div class="lab" style="margin-bottom:10px">Clue order</div><div class="row" style="gap:6px;justify-content:center;flex-wrap:wrap">${['Diya','Rohan','Aarav','Meera','Kabir'].map((n,i)=>`<span class="chip ${i===0?'on':''}"><span style="font-weight:700">${i+1}</span>${n}</span>`).join('')}</div></div>
 <span class="pill">2 clue rounds &middot; timer off</span>
 <div class="col" style="width:100%;gap:8px;margin-top:6px"><button class="btn btn-gold">${I('play')}Start clues</button><button class="btn btn-text">${I('dice')}Pick again</button></div></div>`});
window.IMP={S,SPRITE,STATUS,ORBS,TABBAR,MARK,
  phone(s,{w=340,h=736,frame=true}={}){
    const inner=`<div class="scr">${ORBS}${frame?STATUS:''}${s.html()}${s.tab?TABBAR(s.tab):''}</div>`;
    return frame?`<div class="phone ${w<320?'sm':''}" style="--pw:${w}px;--pr:${w}/${h}">${inner}</div>`:inner;
  },
  injectSprite(){document.body.insertAdjacentHTML('afterbegin',SPRITE)},
  renderSingle(id){
    this.injectSprite();
    const s=S.find(x=>x.id===id)||S[0];
    document.title='Impostr - '+s.name.replace(/&[a-z]+;/g,'');
    document.body.classList.add('single');
    document.body.insertAdjacentHTML('beforeend',this.phone(s,{frame:false}));
    if(s.scroll){const b=document.querySelector('.body');b.scrollTop=b.scrollHeight}
  }
};
document.addEventListener('click',e=>{const t=e.target.closest('.tog');if(t)t.setAttribute('aria-pressed',t.getAttribute('aria-pressed')!=='true')});
})();
