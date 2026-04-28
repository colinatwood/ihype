(function(){
  function roleClass(role){
    if(!role) return 'fan';
    const r = String(role).toUpperCase();
    if(r === 'ARTIST') return 'artist';
    if(r === 'VENUE') return 'venue';
    if(r === 'DJ' || r === 'PROMOTER') return 'promoter';
    return 'fan';
  }
  function roleLabel(role){
    if(!role) return 'Fan';
    const r = String(role).toUpperCase();
    if(r === 'ARTIST') return 'Artist';
    if(r === 'VENUE') return 'Venue';
    if(r === 'DJ') return 'Promoter';
    if(r === 'ADMIN') return 'Admin';
    return 'Fan';
  }
  function initial(name, email){
    const src = (name && name.trim()) || (email && email.trim()) || '?';
    return src.charAt(0).toUpperCase();
  }

  async function fetchSession(){
    try{
      const res = await fetch('/api/auth/session', {credentials:'same-origin'});
      if(!res.ok) return null;
      const data = await res.json();
      if(!data || !data.user) return null;
      return data.user;
    }catch(e){ return null; }
  }

  function buildMenu(pill, user){
    const wrap = document.createElement('div');
    wrap.className = 'user-menu';
    pill.parentNode.replaceChild(wrap, pill);

    const cls = roleClass(user.role);
    const labelRole = roleLabel(user.role);
    const display = user.name || (user.email ? user.email.split('@')[0] : 'You');
    const isCreator = ['ARTIST','DJ','VENUE'].includes((user.role||'').toUpperCase());
    const isAdmin = (user.role||'').toUpperCase() === 'ADMIN';

    pill.className = 'role-pill ' + cls;
    pill.innerHTML =
      '<span class="av">' + initial(user.name, user.email) + '</span>' +
      '<span class="name"></span>' +
      '<span class="ctx"></span>';
    pill.querySelector('.name').textContent = display;
    pill.querySelector('.ctx').textContent = labelRole + ' ▾';
    wrap.appendChild(pill);

    // Build dropdown items
    const allEngines = [
      { label: 'Stats Engine', href: '/home', icon: '📊', always: true },
      { label: 'Recommendation Engine', href: '/discover', icon: '📡', always: true },
      { label: 'Ticketing Engine', href: '/tickets', icon: '🎟️', always: true },
    ];
    const creatorEngines = [
      { label: 'Show Creation Engine', href: '/show-creator', icon: '🎙️' },
      { label: 'Customization Engine', href: '/customizer', icon: '🎨' },
    ];
    const adminEngines = [
      { label: 'Admin Dashboard', href: '/dashboard', icon: '⚙️' },
    ];

    const visibleEngines = [...allEngines];
    if(isCreator || isAdmin) visibleEngines.push(...creatorEngines);
    if(isAdmin) visibleEngines.push(...adminEngines);

    const engineLinks = visibleEngines.map(e =>
      '<a href="' + e.href + '" class="user-menu-item engine-item">' +
        '<span class="engine-item-icon">' + e.icon + '</span>' +
        '<span>' + e.label + '</span>' +
      '</a>'
    ).join('');

    const dd = document.createElement('div');
    dd.className = 'user-menu-dropdown';
    dd.innerHTML =
      '<div class="user-menu-header">' +
        '<div class="um-name"></div>' +
        '<div class="um-role"></div>' +
        '<div class="um-email"></div>' +
      '</div>' +
      engineLinks +
      '<div class="user-menu-divider"></div>' +
      '<button type="button" class="user-menu-item danger" data-action="signout">Sign out</button>';

    dd.querySelector('.um-name').textContent = display;
    dd.querySelector('.um-role').textContent = labelRole;
    dd.querySelector('.um-email').textContent = user.email || '';
    wrap.appendChild(dd);

    pill.addEventListener('click', function(e){
      e.stopPropagation();
      wrap.classList.toggle('open');
    });
    document.addEventListener('click', function(e){
      if(!wrap.contains(e.target)) wrap.classList.remove('open');
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') wrap.classList.remove('open');
    });

    dd.querySelector('[data-action="signout"]').addEventListener('click', async function(){
      try{
        await fetch('/api/auth/otp/signout', {method:'POST', credentials:'same-origin'});
      }catch(e){}
      window.location.href = '/';
    });
  }

  function setSignedOut(pill){
    pill.className = 'role-pill fan';
    pill.innerHTML = '<span class="name" style="padding:0 .35rem">Sign in</span>';
    pill.addEventListener('click', function(){ window.location.href = '/login'; });
  }

  async function init(){
    const pill = document.querySelector('.role-pill');
    if(!pill) return;
    const user = await fetchSession();
    if(user) buildMenu(pill, user);
    else setSignedOut(pill);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
