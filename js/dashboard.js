
let currentView = 'all';
let allOpportunities = [];
const activeFilters = { search: '', type: '', emirate: '', price: '', audience: '', format: '' };

document.addEventListener('DOMContentLoaded', async () => {
  initParallax();
  bindFilterEvents();
  bindTabEvents();
  bindModal();

  allOpportunities = await getOpportunities();
  buildTypeFilters();
  buildEmirateFilter();
  renderGrid();
});

function initParallax(){
  const bg = document.getElementById('dashHeroBg');
  const hero = document.getElementById('dashHero');
  if(!bg || !hero) return;
  function update(){
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top, 0), hero.offsetHeight);
    bg.style.transform = `translateY(${progress * 0.35}px)`;
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

function buildTypeFilters(){
  const types = [...new Set(allOpportunities.map(o => o.type))].sort();
  const select = document.getElementById('typeFilter');
  types.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    select.appendChild(opt);
  });
}
function buildEmirateFilter(){
  const emirates = [...new Set(allOpportunities.map(o => o.emirate).filter(Boolean))].sort();
  const select = document.getElementById('emirateFilter');
  emirates.forEach(em => {
    const opt = document.createElement('option');
    opt.value = em; opt.textContent = em;
    select.appendChild(opt);
  });
}

function bindFilterEvents(){
  document.getElementById('searchInput').addEventListener('input', (e) => {
    activeFilters.search = e.target.value.trim().toLowerCase();
    renderGrid();
  });
  document.getElementById('typeFilter').addEventListener('change', (e) => {
    activeFilters.type = e.target.value;
    renderGrid();
  });
  document.getElementById('emirateFilter').addEventListener('change', (e) => {
    activeFilters.emirate = e.target.value;
    renderGrid();
  });
  document.getElementById('priceFilter').addEventListener('change', (e) => {
    activeFilters.price = e.target.value;
    renderGrid();
  });
  document.getElementById('audienceFilter').addEventListener('change', (e) => {
    activeFilters.audience = e.target.value;
    renderGrid();
  });
  document.getElementById('formatFilter').addEventListener('change', (e) => {
    activeFilters.format = e.target.value;
    renderGrid();
  });

  document.getElementById('resetFiltersBtn').addEventListener('click', () => {
    activeFilters.search = ''; activeFilters.type = ''; activeFilters.emirate = '';
    activeFilters.price = ''; activeFilters.audience = ''; activeFilters.format = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('emirateFilter').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('audienceFilter').value = '';
    document.getElementById('formatFilter').value = '';
    renderGrid();
    toast('Filters reset.');
  });
}

function bindTabEvents(){
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentView = tab.dataset.view;
      renderGrid();
    });
  });
}

function getFilteredOpportunities(){
  return allOpportunities.filter(o => {
    if(o.status !== 'approved') return false;
    if(activeFilters.search && !o.title.toLowerCase().includes(activeFilters.search)) return false;
    if(activeFilters.type && o.type !== activeFilters.type) return false;
    if(activeFilters.emirate && o.emirate !== activeFilters.emirate) return false;
    if(activeFilters.price && o.price !== activeFilters.price) return false;
    if(activeFilters.audience && o.audience !== activeFilters.audience) return false;
    if(activeFilters.format && o.format !== activeFilters.format) return false;
    return true;
  });
}

function renderGrid(){
  const all = allOpportunities.filter(o => o.status === 'approved');
  const filtered = getFilteredOpportunities();

  document.getElementById('countAll').textContent = all.length;
  document.getElementById('resultsCount').textContent = `${filtered.length} opportunit${filtered.length === 1 ? 'y' : 'ies'}`;

  const grid = document.getElementById('oppGrid');
  const empty = document.getElementById('emptyState');

  if(filtered.length === 0){
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    if(all.length === 0){
      empty.querySelector('h4').textContent = 'No Opportunities Have Been Added Yet';
      empty.querySelector('p').textContent = 'Check back soon, or submit one yourself.';
    } else {
      empty.querySelector('h4').textContent = 'No Opportunities Found';
      empty.querySelector('p').textContent = 'Try adjusting your filters, or be the first to submit one.';
    }
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = filtered.map(o => {
    const imgUrl = o.image ? `<img src="${escapeHtml(o.image)}" alt="${escapeHtml(o.title)}" style="width:100%; height:100%; object-fit:cover;">` : phBlock(o.type + ' image');
    return `
    <article class="opp-card">
      <div class="opp-card-img">${imgUrl}</div>
      <div class="opp-card-body">
        <div class="opp-card-top">
          <span class="tag">${escapeHtml(o.type)}</span>
          <span class="tag" style="background:var(--panel-soft);">${escapeHtml(o.audience)}</span>
        </div>
        <h3 class="opp-card-title">${escapeHtml(o.title)}</h3>
        <p class="opp-card-summary">${escapeHtml(o.summary)}</p>
        <div class="opp-card-meta">
          <span class="opp-deadline">Deadline · ${formatDate(o.deadline)}</span>
        </div>
        <div class="opp-card-actions">
          ${o.link ? `<a href="${escapeHtml(o.link)}" class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">Apply Now</a>` : ''}
          <a href="opportunity.html?id=${encodeURIComponent(o.id)}" class="opp-card-link">See More →</a>
        </div>
      </div>
    </article>`;
  }).join('');
}

function bindModal(){
  const overlay = document.getElementById('submitModal');
  const open = () => overlay.classList.add('open');
  const close = () => overlay.classList.remove('open');

  document.getElementById('submitOppBtn').addEventListener('click', open);
  document.getElementById('closeSubmitModal').addEventListener('click', close);
  document.getElementById('cancelSubmitModal').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) close(); });

  document.getElementById('confirmSubmitOpp').addEventListener('click', async () => {
    const title = document.getElementById('f-title').value.trim();
    const summary = document.getElementById('f-summary').value.trim();
    if(!title || !summary){
      toast('Please add at least a title and summary.');
      return;
    }
    const deadline = document.getElementById('f-deadline').value;
    const created = await addOpportunity({
      title,
      type: document.getElementById('f-type').value,
      subject: document.getElementById('f-subject').value.trim(),
      price: document.getElementById('f-price').value,
      audience: document.getElementById('f-audience').value,
      format: document.getElementById('f-format').value,
      emirate: '',
      deadline: deadline || null,
      summary,
      description: document.getElementById('f-description').value.trim() || summary,
      image: document.getElementById('f-image').value.trim(),
      link: document.getElementById('f-link').value.trim(),
      status: 'pending'
    });
    if(!created) return;

    document.getElementById('submitOppForm').reset();
    close();
    toast('Submitted for review. An admin will approve it soon.');
  });
}
