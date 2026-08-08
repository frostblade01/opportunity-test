
const STORAGE_KEYS = {
  USER: 'uoh_current_user',
  USERS: 'uoh_users',
  OPPS: 'uoh_opportunities',
  BOOKMARKS: 'uoh_bookmarks'
};

const ADMIN_EMAIL = 'admin@youthuae.ae';

const SEED_OPPORTUNITIES = [
  {
    id: 'opp-1',
    title: 'Dubai Youth Model United Nations',
    type: 'MUN',
    subject: 'Diplomacy & Policy',
    price: 'Paid',
    audience: 'High School',
    format: 'Offline',
    emirate: 'Dubai',
    deadline: '2026-09-12',
    summary: 'A three-day conference for high schoolers to debate global issues as delegates from UN member states.',
    description: 'Delegates represent assigned countries across committees covering climate policy, trade, and human rights. Includes delegate training, a keynote from a former diplomat, and a closing gala. Open to first-time and experienced MUN delegates alike — position papers are workshopped in advance.',
    link: 'https://example.com/dubai-mun',
    status: 'approved'
  },
  {
    id: 'opp-2',
    title: 'ADNOC Summer Engineering Internship',
    type: 'Internship',
    subject: 'Engineering',
    price: 'Free',
    audience: 'University',
    format: 'Offline',
    emirate: 'Abu Dhabi',
    deadline: '2026-08-30',
    summary: 'Four-week paid-style placement shadowing engineers across upstream and downstream operations.',
    description: 'Selected students rotate through process, mechanical, and digital engineering teams, working on real efficiency projects with a mentor. The internship closes with a presentation to a panel of senior engineers and a certificate of completion.',
    link: 'https://example.com/adnoc-internship',
    status: 'approved'
  },
  {
    id: 'opp-3',
    title: 'Sharjah Beach Cleanup Corps',
    type: 'Volunteering',
    subject: 'Environment',
    price: 'Free',
    audience: 'All Levels',
    format: 'Offline',
    emirate: 'Sharjah',
    deadline: '2026-08-15',
    summary: 'Weekly coastal cleanup drives with a marine conservation NGO — logged volunteering hours provided.',
    description: 'Volunteers join guided cleanups along the Sharjah coastline, learn basic marine ecology from resident biologists, and help catalogue waste data used in regional reports. Certificates and verified volunteering hours are issued each term.',
    link: 'https://example.com/sharjah-cleanup',
    status: 'approved'
  },
  {
    id: 'opp-4',
    title: 'RAK Hackathon: Build for the Desert',
    type: 'Hackathon',
    subject: 'Technology',
    price: 'Free',
    audience: 'High School',
    format: 'Hybrid',
    emirate: 'Ras Al Khaimah',
    deadline: '2026-10-02',
    summary: '48-hour student hackathon building tech solutions for water scarcity and desert agriculture.',
    description: 'Teams of up to four prototype hardware or software solutions with mentorship from local startups. Remote participation is supported for the ideation phase, with the final build weekend held in person. Prizes include incubation slots with a Ras Al Khaimah accelerator.',
    link: 'https://example.com/rak-hackathon',
    status: 'approved'
  },
  {
    id: 'opp-5',
    title: 'Abu Dhabi Coding Bootcamp — AI Track',
    type: 'Bootcamp',
    subject: 'Technology',
    price: 'Paid',
    audience: 'University',
    format: 'Online',
    emirate: 'Abu Dhabi',
    deadline: '2026-09-28',
    summary: 'Two-week intensive covering Python, machine learning basics, and a capstone AI project.',
    description: 'Daily live sessions taught by industry practitioners, paired with asynchronous labs. Students finish with a working ML model and a portfolio-ready writeup. A limited number of need-based scholarships are available on request.',
    link: 'https://example.com/ad-bootcamp',
    status: 'approved'
  }
];

function initStorage(){
  if(!localStorage.getItem(STORAGE_KEYS.OPPS)){
    localStorage.setItem(STORAGE_KEYS.OPPS, JSON.stringify(SEED_OPPORTUNITIES));
  }
  if(!localStorage.getItem(STORAGE_KEYS.USERS)){
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if(!localStorage.getItem(STORAGE_KEYS.BOOKMARKS)){
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify([]));
  }
}
function getOpportunities(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.OPPS) || '[]'); }
function saveOpportunities(list){ localStorage.setItem(STORAGE_KEYS.OPPS, JSON.stringify(list)); }
function getCurrentUser(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null'); }
function setCurrentUser(u){ localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u)); }
function clearCurrentUser(){ localStorage.removeItem(STORAGE_KEYS.USER); }
function getBookmarks(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS) || '[]'); }
function saveBookmarks(list){ localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list)); }
function toggleBookmark(id){
  let marks = getBookmarks();
  marks = marks.includes(id) ? marks.filter(m => m !== id) : [...marks, id];
  saveBookmarks(marks);
  return marks.includes(id);
}

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
function renderNav(){
  const mount = document.getElementById('site-nav');
  if(!mount) return;
  const user = getCurrentUser();
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
    logoutBtn.addEventListener('click', () => {
      clearCurrentUser();
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

function requireAuth(){
  const user = getCurrentUser();
  if(!user){
    sessionStorage.setItem('uoh_toast_next', 'Please log in to view opportunities.');
    window.location.href = 'login.html';
    return null;
  }
  return user;
}
function requireAdmin(){
  const user = getCurrentUser();
  if(!user || user.role !== 'admin'){
    sessionStorage.setItem('uoh_toast_next', 'That area is restricted to admin accounts.');
    window.location.href = user ? 'dashboard.html' : 'login/admin.html';
    return null;
  }
  return user;
}
function flushQueuedToast(){
  const msg = sessionStorage.getItem('uoh_toast_next');
  if(msg){
    sessionStorage.removeItem('uoh_toast_next');
    setTimeout(() => toast(msg), 250);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  const g = document.createElement('div');
  g.className = 'grain';
  document.body.appendChild(g);
  renderNav();
  renderFooter();
  flushQueuedToast();
});

