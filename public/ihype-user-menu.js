(function(){
'use strict';

/* ── Role helpers ──────────────────────────────────────────── */
function roleClass(role){
  if(!role) return 'fan';
  const r=String(role).toUpperCase();
  if(r==='ARTIST') return 'artist';
  if(r==='VENUE')  return 'venue';
  if(r==='DJ'||r==='PROMOTER') return 'promoter';
  return 'fan';
}
function roleLabel(role){
  if(!role) return 'Fan';
  const r=String(role).toUpperCase();
  if(r==='ARTIST') return 'Artist';
  if(r==='VENUE')  return 'Venue';
  if(r==='DJ')     return 'Promoter';
  if(r==='ADMIN')  return 'Admin';
  return 'Fan';
}
function initial(name,email){
  const src=(name&&name.trim())||(email&&email.trim())||'?';
  return src.charAt(0).toUpperCase();
}
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ── Session fetch ─────────────────────────────────────────── */
async function fetchSession(){
  try{
    const res=await fetch('/api/auth/session',{credentials:'same-origin'});
    if(!res.ok) return null;
    const data=await res.json();
    if(!data||!data.user) return null;
    return data.user;
  }catch(e){ return null; }
}

/* ── Admin perspective ─────────────────────────────────────── */
const PERSP_KEY='ihype-admin-perspective';
const PERSPECTIVES=[
  {value:'ADMIN',  label:'Admin view', icon:'⚙️'},
  {value:'FAN',    label:'Fan',        icon:'🎧'},
  {value:'ARTIST', label:'Artist',     icon:'🎤'},
  {value:'DJ',     label:'Promoter',   icon:'🎛️'},
  {value:'VENUE',  label:'Venue',      icon:'🏟️'},
];

function getPersp(){
  try{ return localStorage.getItem(PERSP_KEY)||'ADMIN'; }catch(e){ return 'ADMIN'; }
}
function setPersp(v){
  try{ localStorage.setItem(PERSP_KEY,v); }catch(e){}
}

/* ── Engine links ──────────────────────────────────────────── */
const ALL_ENGINES=[
  {label:'Stats Engine',          href:'/home',         icon:'📊'},
  {label:'Recommendation Engine', href:'/discover',     icon:'📡'},
  {label:'Ticketing Engine',      href:'/tickets',      icon:'🎟️'},
];
const CREATOR_ENGINES=[
  {label:'Show Creation Engine',  href:'/show-creator', icon:'🎙️'},
  {label:'Customization Engine',  href:'/customizer',   icon:'🎨'},
];
const ARTIST_ENGINES=[
  {label:'Media Engine',          href:'/media',        icon:'🎵'},
];
const ADMIN_ENGINES=[
  {label:'Admin Dashboard',       href:'/dashboard',    icon:'⚙️'},
];

function enginesFor(role){
  const r=(role||'').toUpperCase();
  const isCreator=['ARTIST','DJ','VENUE'].includes(r);
  const isArtist=r==='ARTIST';
  const isAdmin=r==='ADMIN';
  const list=[...ALL_ENGINES];
  if(isCreator||isAdmin) list.push(...CREATOR_ENGINES);
  if(isArtist)           list.push(...ARTIST_ENGINES);
  if(isAdmin)            list.push(...ADMIN_ENGINES);
  return list;
}

/* ── Admin indicator bar ───────────────────────────────────── */
function injectAdminBar(persp){
  const existing=document.getElementById('ihype-admin-bar');
  if(existing) existing.remove();
  if(persp==='ADMIN') return;

  const info=PERSPECTIVES.find(p=>p.value===persp)||PERSPECTIVES[0];
  const bar=document.createElement('div');
  bar.id='ihype-admin-bar';
  bar.setAttribute('aria-label','Admin preview mode');
  Object.assign(bar.style,{
    position:'fixed', top:'0', left:'0', right:'0', zIndex:'9999',
    background:'color-mix(in srgb,#d83a16 14%,#111)',
    borderBottom:'1px solid rgba(216,58,22,.4)',
    display:'flex', alignItems:'center', justifyContent:'space-between',
    gap:'1rem', padding:'.3rem 1.2rem',
    fontFamily:'var(--f-m,monospace)', fontSize:'.72rem', color:'rgba(255,255,255,.75)',
    lineHeight:'1.4',
  });

  const left=document.createElement('span');
  left.innerHTML=
    '<strong style="color:#d83a16;font-weight:700">Admin mode</strong>'
    +'&nbsp;·&nbsp;Viewing as '+esc(info.icon)
    +' <strong style="color:#fff">'+esc(info.label)+'</strong>';

  const btns=document.createElement('div');
  btns.style.cssText='display:flex;gap:.45rem;align-items:center;flex-shrink:0';

  const exitBtn=document.createElement('button');
  exitBtn.textContent='Exit preview';
  exitBtn.title='Return to Admin view';
  exitBtn.style.cssText=[
    'padding:.2rem .65rem','border-radius:99px',
    'background:rgba(255,255,255,.1)','border:1px solid rgba(255,255,255,.2)',
    'color:rgba(255,255,255,.85)','font:inherit','cursor:pointer','font-size:.72rem',
  ].join(';');
  exitBtn.addEventListener('click',()=>{ setPersp('ADMIN'); location.reload(); });

  const dashLink=document.createElement('a');
  dashLink.href='/dashboard';
  dashLink.textContent='Dashboard →';
  dashLink.style.cssText=[
    'padding:.2rem .65rem','border-radius:99px',
    'background:rgba(216,58,22,.3)','border:1px solid rgba(216,58,22,.5)',
    'color:#fff','font:inherit','font-size:.72rem','text-decoration:none',
  ].join(';');

  btns.appendChild(exitBtn);
  btns.appendChild(dashLink);
  bar.appendChild(left);
  bar.appendChild(btns);
  document.body.prepend(bar);

  // Push the nav down so it clears the bar
  const BAR_H='32px';
  document.documentElement.style.setProperty('--admin-bar-h', BAR_H);
  const shell=document.querySelector('.site-shell');
  if(shell) shell.style.paddingTop='calc(var(--nav-h,64px) + '+BAR_H+')';
  const nav=document.querySelector('.nav');
  if(nav) nav.style.top=BAR_H;
}

/* ── Mobile drawer ─────────────────────────────────────────── */
function buildMobileDrawer(user, engines, signoutFn){
  const nav=document.querySelector('.nav');
  if(!nav) return;
  const navRight=nav.querySelector('.nav-right')||nav;

  // Hamburger button
  const ham=document.createElement('button');
  ham.className='nav-hamburger';
  ham.setAttribute('aria-label','Open navigation menu');
  ham.setAttribute('aria-expanded','false');
  ham.innerHTML='<span></span><span></span><span></span>';
  navRight.insertBefore(ham,navRight.firstChild);

  // Overlay
  const overlay=document.createElement('div');
  overlay.className='mobile-drawer-overlay';
  document.body.appendChild(overlay);

  // Drawer
  const drawer=document.createElement('div');
  drawer.className='mobile-drawer';
  drawer.setAttribute('role','dialog');
  drawer.setAttribute('aria-label','Navigation menu');

  const display=user?user.name||(user.email?user.email.split('@')[0]:'You'):'';
  const roleStr=user?(user.role&&user.role.toUpperCase()==='ADMIN'?'Admin':roleLabel(user.role)):'';

  const engineLinksHTML=engines.map(e=>
    '<a href="'+esc(e.href)+'" class="mobile-drawer-item">'+
      '<span class="di-icon">'+e.icon+'</span>'+
      '<span>'+esc(e.label)+'</span>'+
    '</a>'
  ).join('');

  const userSection=user?
    '<div class="mobile-drawer-user">'+
      '<div class="mdu-name"></div>'+
      '<div class="mdu-role"></div>'+
    '</div>'
    :'';

  const footHTML=user
    ?'<div class="mobile-drawer-foot"><button class="mobile-drawer-signout">Sign out</button></div>'
    :'<div class="mobile-drawer-foot"><a href="/login" class="mobile-drawer-signin">Sign in →</a></div>';

  drawer.innerHTML=
    '<div class="mobile-drawer-head">'+
      '<div class="brand">i<em>HYPE</em></div>'+
      '<button class="mobile-drawer-close" aria-label="Close menu">✕</button>'+
    '</div>'+
    userSection+
    '<div class="mobile-drawer-body">'+
      '<div class="mobile-drawer-section">Engines</div>'+
      engineLinksHTML+
    '</div>'+
    footHTML;

  if(user){
    drawer.querySelector('.mdu-name').textContent=display;
    drawer.querySelector('.mdu-role').textContent=roleStr;
  }

  document.body.appendChild(drawer);

  function open(){
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow='hidden';
    ham.setAttribute('aria-expanded','true');
    ham.classList.add('open');
  }
  function close(){
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow='';
    ham.setAttribute('aria-expanded','false');
    ham.classList.remove('open');
  }

  ham.addEventListener('click',e=>{ e.stopPropagation(); open(); });
  overlay.addEventListener('click',close);
  drawer.querySelector('.mobile-drawer-close').addEventListener('click',close);
  drawer.querySelectorAll('.mobile-drawer-item').forEach(a=>{
    a.addEventListener('click',close);
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') close(); });

  const signoutBtn=drawer.querySelector('.mobile-drawer-signout');
  if(signoutBtn&&signoutFn) signoutBtn.addEventListener('click',signoutFn);
}

/* ── Build signed-in dropdown ──────────────────────────────── */
function buildMenu(pill,user){
  const isAdmin=(user.role||'').toUpperCase()==='ADMIN';
  const persp=isAdmin?getPersp():'ADMIN';
  // For engine links: use the previewed role, or the real role for non-admins
  const effRole=isAdmin?(persp==='ADMIN'?'ADMIN':persp):user.role;

  const wrap=document.createElement('div');
  wrap.className='user-menu';
  pill.parentNode.replaceChild(wrap,pill);

  // Pill
  const display=user.name||(user.email?user.email.split('@')[0]:'You');
  const pillRole=isAdmin?'Admin':roleLabel(user.role);
  pill.className='role-pill '+(isAdmin?'artist':roleClass(user.role));
  pill.innerHTML=
    '<span class="av">'+initial(user.name,user.email)+'</span>'+
    '<span class="name"></span>'+
    '<span class="ctx"></span>';
  pill.querySelector('.name').textContent=display;
  pill.querySelector('.ctx').textContent=pillRole+' ▾';
  wrap.appendChild(pill);

  // Engine links for effective role
  const engines=enginesFor(effRole);
  const engineLinks=engines.map(e=>
    '<a href="'+esc(e.href)+'" class="user-menu-item engine-item">'+
      '<span class="engine-item-icon">'+e.icon+'</span>'+
      '<span>'+esc(e.label)+'</span>'+
    '</a>'
  ).join('');

  // Perspective switcher (admin only)
  let perspHTML='';
  if(isAdmin){
    const btns=PERSPECTIVES.map(p=>{
      const active=p.value===persp;
      return '<button type="button" class="persp-btn'+(active?' active':'')+'" data-persp="'+p.value+'">'+
        p.icon+' '+esc(p.label)+
        (active?'<span class="persp-check">✓</span>':'')+
      '</button>';
    }).join('');
    perspHTML=
      '<div class="user-menu-divider"></div>'+
      '<div class="user-menu-section-label">View as</div>'+
      '<div class="persp-grid">'+btns+'</div>';
  }

  // Header role line
  const roleInfo=isAdmin&&persp!=='ADMIN'
    ?'Admin · '+esc(PERSPECTIVES.find(p=>p.value===persp)?.label||persp)+' preview'
    :(isAdmin?'Admin':roleLabel(user.role));

  const dd=document.createElement('div');
  dd.className='user-menu-dropdown';
  dd.innerHTML=
    '<div class="user-menu-header">'+
      '<div class="um-name"></div>'+
      '<div class="um-role"></div>'+
      '<div class="um-email"></div>'+
    '</div>'+
    engineLinks+
    perspHTML+
    '<div class="user-menu-divider"></div>'+
    '<button type="button" class="user-menu-item danger" data-action="signout">Sign out</button>';

  dd.querySelector('.um-name').textContent=display;
  dd.querySelector('.um-role').textContent=roleInfo;
  dd.querySelector('.um-email').textContent=user.email||'';
  wrap.appendChild(dd);

  // Perspective button handlers
  dd.querySelectorAll('.persp-btn').forEach(btn=>{
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      setPersp(this.dataset.persp);
      location.reload();
    });
  });

  // Open/close dropdown
  pill.addEventListener('click',function(e){
    e.stopPropagation();
    wrap.classList.toggle('open');
  });
  document.addEventListener('click',function(e){
    if(!wrap.contains(e.target)) wrap.classList.remove('open');
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape') wrap.classList.remove('open');
  });

  // Sign out handler (shared with mobile drawer)
  async function doSignout(){
    try{ await fetch('/api/auth/otp/signout',{method:'POST',credentials:'same-origin'}); }catch(e){}
    try{ localStorage.removeItem(PERSP_KEY); }catch(e){}
    window.location.href='/';
  }

  dd.querySelector('[data-action="signout"]').addEventListener('click',doSignout);

  // Inject admin bar if previewing as a non-admin role
  if(isAdmin) injectAdminBar(persp);

  // Mobile drawer
  buildMobileDrawer(user, engines, doSignout);
}

/* ── Signed-out state ──────────────────────────────────────── */
function setSignedOut(pill){
  pill.className='role-pill fan';
  pill.innerHTML='<span class="name" style="padding:0 .35rem">Sign in</span>';
  pill.addEventListener('click',function(){ window.location.href='/login'; });

  // Mobile drawer for signed-out: show basic public engines
  const publicEngines=[
    {label:'Discover',       href:'/discover', icon:'📡'},
    {label:'Tickets',        href:'/tickets',  icon:'🎟️'},
  ];
  buildMobileDrawer(null, publicEngines, null);
}

/* ── Init ──────────────────────────────────────────────────── */
async function init(){
  const pill=document.querySelector('.role-pill');
  if(!pill) return;
  const user=await fetchSession();
  if(user) buildMenu(pill,user);
  else setSignedOut(pill);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
} else {
  init();
}
})();
