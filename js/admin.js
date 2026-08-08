

let adminView = 'pending';

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAdmin();
  if(!user) return;

  bindAdminTabs();
  bindPublishModal();
  bindEditModal();
  renderAdminList();
});

function bindAdminTabs(){
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      adminView = tab.dataset.view;
      renderAdminList();
    });
  });
}

function renderAdminList(){
  const opps = getOpportunities();
  const pending = opps.filter(o => o.status === 'pending');
  const live = opps.filter(o => o.status === 'approved');

  document.getElementById('countPending').textContent = pending.length;
  document.getElementById('countLive').textContent = live.length;

  const list = adminView === 'pending' ? pending : live;
  const listEl = document.getElementById('adminList');
  const emptyEl = document.getElementById('adminEmpty');

  if(list.length === 0){
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    document.getElementById('adminEmptyText').textContent =
      adminView === 'pending' ? 'No pending submissions at the moment.' : 'No live opportunities yet.';
    return;
  }
  emptyEl.classList.add('hidden');

  listEl.innerHTML = list.map(o => `
    <div class="admin-row">
      <div class="admin-row-img">${o.image ? `<img src="${escapeHtml(o.image)}" alt="${escapeHtml(o.title)}" style="width:100%; height:100%; object-fit:cover; display:block;" />` : phBlock(o.type)}</div>
      <div>
        <div class="admin-row-title">${escapeHtml(o.title)}</div>
        <div class="admin-row-meta">${escapeHtml(o.type)} · ${escapeHtml(o.price)} · ${escapeHtml(o.format)} · Due ${formatDate(o.deadline)}</div>
      </div>
      <div class="admin-row-actions">
        ${adminView === 'pending' ? `
          <button class="btn btn-ghost btn-sm" data-action="edit" data-id="${o.id}">Edit</button>
          <button class="btn btn-primary btn-sm" data-action="approve" data-id="${o.id}">Approve</button>
          <button class="btn btn-danger btn-sm" data-action="reject" data-id="${o.id}">Reject</button>
        ` : `
          <button class="btn btn-ghost btn-sm" data-action="edit" data-id="${o.id}">Edit</button>
          <a href="opportunity.html?id=${encodeURIComponent(o.id)}" class="btn btn-ghost btn-sm">View</a>
          <button class="btn btn-danger btn-sm" data-action="unpublish" data-id="${o.id}">Unpublish</button>
        `}
      </div>
    </div>`).join('');

  listEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => handleAction(btn.dataset.action, btn.dataset.id));
  });
}

function handleAction(action, id){
  const opps = getOpportunities();
  const idx = opps.findIndex(o => o.id === id);
  if(idx === -1) return;

  if(action === 'approve'){
    opps[idx].status = 'approved';
    toast('Approved — now live on the student dashboard.');
  } else if(action === 'reject'){
    opps.splice(idx, 1);
    toast('Submission rejected.');
  } else if(action === 'unpublish'){
    opps.splice(idx, 1);
    toast('Opportunity removed from the live dashboard.');
  } else if(action === 'edit'){
    openEditModal(opps[idx]);
    return;
  }
  saveOpportunities(opps);
  renderAdminList();
}

function bindPublishModal(){
  const overlay = document.getElementById('publishModal');
  const open = () => overlay.classList.add('open');
  const close = () => overlay.classList.remove('open');

  document.getElementById('publishBtn').addEventListener('click', open);
  document.getElementById('closePublishModal').addEventListener('click', close);
  document.getElementById('cancelPublish').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) close(); });

  document.getElementById('confirmPublish').addEventListener('click', () => {
    const title = document.getElementById('p-title').value.trim();
    const summary = document.getElementById('p-summary').value.trim();
    if(!title || !summary){
      toast('Please add at least a title and summary.');
      return;
    }
    const opps = getOpportunities();
    opps.push({
      id: 'opp-' + Date.now(),
      title,
      type: document.getElementById('p-type').value,
      subject: '',
      price: document.getElementById('p-price').value,
      audience: document.getElementById('p-audience').value,
      format: document.getElementById('p-format').value,
      emirate: document.getElementById('p-emirate').value.trim(),
      deadline: document.getElementById('p-deadline').value,
      summary,
      description: document.getElementById('p-description').value.trim() || summary,
      image: document.getElementById('p-image').value.trim(),
      link: document.getElementById('p-link').value.trim(),
      status: 'approved'
    });
    saveOpportunities(opps);
    document.getElementById('publishForm').reset();
    close();
    adminView = 'live';
    document.querySelectorAll('.view-tab').forEach(t => t.classList.toggle('active', t.dataset.view === 'live'));
    renderAdminList();
    toast('Published live.');
  });
}

function bindEditModal(){
  const overlay = document.getElementById('editModal');
  const close = () => overlay.classList.remove('open');

  document.getElementById('closeEditModal').addEventListener('click', close);
  document.getElementById('cancelEdit').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) close(); });

  document.getElementById('confirmEdit').addEventListener('click', () => {
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('e-title').value.trim();
    const summary = document.getElementById('e-summary').value.trim();
    if(!title || !summary){
      toast('Please add at least a title and summary.');
      return;
    }

    const opps = getOpportunities();
    const idx = opps.findIndex(o => o.id === id);
    if(idx === -1) return;

    opps[idx] = {
      ...opps[idx],
      title,
      type: document.getElementById('e-type').value,
      subject: opps[idx].subject || '',
      price: document.getElementById('e-price').value,
      audience: document.getElementById('e-audience').value,
      format: document.getElementById('e-format').value,
      emirate: document.getElementById('e-emirate').value.trim(),
      deadline: document.getElementById('e-deadline').value,
      summary,
      description: document.getElementById('e-description').value.trim() || summary,
      image: document.getElementById('e-image').value.trim(),
      link: document.getElementById('e-link').value.trim()
    };

    saveOpportunities(opps);
    document.getElementById('editForm').reset();
    close();
    renderAdminList();
    toast('Changes saved.');
  });
}

function openEditModal(opp){
  const overlay = document.getElementById('editModal');
  document.getElementById('edit-id').value = opp.id;
  document.getElementById('e-title').value = opp.title;
  document.getElementById('e-type').value = opp.type;
  document.getElementById('e-emirate').value = opp.emirate || '';
  document.getElementById('e-price').value = opp.price;
  document.getElementById('e-audience').value = opp.audience;
  document.getElementById('e-format').value = opp.format;
  document.getElementById('e-deadline').value = opp.deadline;
  document.getElementById('e-summary').value = opp.summary;
  document.getElementById('e-description').value = opp.description || '';
  document.getElementById('e-image').value = opp.image || '';
  document.getElementById('e-link').value = opp.link || '';
  overlay.classList.add('open');
}

