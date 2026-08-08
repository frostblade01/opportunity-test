
//data
async function getOpportunities(){
  const { data, error } = await sb
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false });
  if(error){
    console.error(error);
    toast('Could not load opportunities from Supabase.');
    return [];
  }
  return data;
}

async function getOpportunity(id){
  const { data, error } = await sb
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if(error){
    console.error(error);
    return null;
  }
  return data;
}

async function addOpportunity(opp){
  const { data, error } = await sb
    .from('opportunities')
    .insert(opp)
    .select()
    .single();
  if(error){
    console.error(error);
    toast('Could not save that — please try again.');
    return null;
  }
  return data;
}

async function updateOpportunity(id, fields){
  const { data, error } = await sb
    .from('opportunities')
    .update(fields)
    .eq('id', id)
    .select()
    .single();
  if(error){
    console.error(error);
    toast('Could not save changes.');
    return null;
  }
  return data;
}

async function deleteOpportunity(id){
  const { error } = await sb
    .from('opportunities')
    .delete()
    .eq('id', id);
  if(error){
    console.error(error);
    toast('Could not complete that action.');
    return false;
  }
  return true;
}

//auth

async function getCurrentUser(){
  const { data: { session } } = await sb.auth.getSession();
  if(!session) return null;

  const { data: profile, error } = await sb
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle();
  if(error) console.error(error);

  return {
    id: session.user.id,
    email: session.user.email,
    role: profile ? profile.role : 'user'
  };
}

async function loginAdmin(email, password){
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if(error) return { error };
  return { data };
}

async function clearCurrentUser(){
  await sb.auth.signOut();
}

async function requireAuth(){
  const user = await getCurrentUser();
  if(!user){
    sessionStorage.setItem('uoh_toast_next', 'Please log in to view opportunities.');
    window.location.href = 'login/admin.html';
    return null;
  }
  return user;
}

async function requireAdmin(){
  const user = await getCurrentUser();
  if(!user || user.role !== 'admin'){
    sessionStorage.setItem('uoh_toast_next', 'That area is restricted to admin accounts.');
    window.location.href = user ? 'dashboard.html' : 'login/admin.html';
    return null;
  }
  return user;
}

//util

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function formatDate(iso){
  if(!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if(isNaN(d)) return iso;
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}
function qs(name){
  return new URLSearchParams(window.location.search).get(name);
}

function phBlock(label){
  return `<div class="ph ph-empty"></div>`;
}

function toast(message){
  let stack = document.querySelector('.toast-stack');
  if(!stack){
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 240);
  }, 3200);
}

function currentPage(){
  const p = window.location.pathname.split('/').pop() || 'index.html';
  return p;
}

async function renderNav(){
  const mount = document.getElementById('site-nav');
  if(!mount) return;
  const user = await getCurrentUser();
  const page = currentPage();
  const link = (href, label) => `<a href="${href}" class="${page === href ? 'active' : ''}">${label}</a>`;

  let rightHtml = '';

  if(user && user.role === 'admin'){
    rightHtml = `
      <a href="admin.html" class="btn btn-ghost btn-sm">Admin</a>
      <button class="btn btn-text" id="logoutBtn">Logout</button>`;
  }

  mount.innerHTML = `
    <div class="container">
      <a href="index.html" class="brand">
        <span class="brand-mark">UOH</span>
        <span class="brand-name">UAE Opportunities Hub</span>
      </a>
      <nav class="nav-links">
        ${link('index.html', 'Home')}
        ${link('dashboard.html', 'Opportunities')}
        ${link('about.html', 'About')}
      </nav>
      <div class="nav-right">${rightHtml}</div>
      <button class="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>`;

  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', async () => {
      await clearCurrentUser();
      toast('Logged out.');
      setTimeout(() => window.location.href = 'index.html', 500);
    });
  }
}

function renderFooter(){
  const mount = document.getElementById('site-footer');
  if(!mount) return;
  mount.innerHTML = `
    <div class="container">
      <a href="index.html" class="brand">
        <span class="brand-mark">UOH</span>
        <span class="brand-name">UAE Opportunities Hub</span>
      </a>
      <div class="footer-links">
        <a href="about.html">About</a>
        <a href="dashboard.html">Opportunities</a>
        <a href="index.html#contact">Contact</a>
      </div>
      <span class="footer-fine">© 2026 UAE Opportunities Hub. All rights reserved.</span>
    </div>`;
}

function flushQueuedToast(){
  const msg = sessionStorage.getItem('uoh_toast_next');
  if(msg){
    sessionStorage.removeItem('uoh_toast_next');
    setTimeout(() => toast(msg), 250);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const g = document.createElement('div');
  g.className = 'grain';
  document.body.appendChild(g);
  await renderNav();
  renderFooter();
  flushQueuedToast();
});
