

let adminView = 'pending';

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAdmin();
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

async function renderAdminList(){
  const opps = await getOpportunities();
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
    btn.addEventListener('click', () => handleAction(btn.dataset.action, btn.dataset.id, opps));
  });
}

async function handleAction(action, id, opps){
  const opp = opps.find(o => o.id === id);
  if(!opp) return;

  if(action === 'approve'){
    const updated = await updateOpportunity(id, { status: 'approved' });
    if(!updated) return;
    toast('Approved — now live on the student dashboard.');
  } else if(action === 'reject'){
    const ok = await deleteOpportunity(id);
    if(!ok) return;
    toast('Submission rejected.');
  } else if(action === 'unpublish'){
    const ok = await deleteOpportunity(id);
    if(!ok) return;
    toast('Opportunity removed from the live dashboard.');
  } else if(action === 'edit'){
    openEditModal(opp);
    return;
  }
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

  document.getElementById('confirmPublish').addEventListener('click', async () => {
    const title = document.getElementById('p-title').value.trim();
    const summary = document.getElementById('p-summary').value.trim();
    if(!title || !summary){
      toast('Please add at least a title and summary.');
      return;
    }
    const deadline = document.getElementById('p-deadline').value;
    const created = await addOpportunity({
      title,
      type: document.getElementById('p-type').value,
      subject: '',
      price: document.getElementById('p-price').value,
      audience: document.getElementById('p-audience').value,
      format: document.getElementById('p-format').value,
      emirate: document.getElementById('p-emirate').value.trim(),
      deadline: deadline || null,
      summary,
      description: document.getElementById('p-description').value.trim() || summary,
      image: document.getElementById('p-image').value.trim(),
      link: document.getElementById('p-link').value.trim(),
      status: 'approved'
    });
    if(!created) return;

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

  document.getElementById('confirmEdit').addEventListener('click', async () => {
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('e-title').value.trim();
    const summary = document.getElementById('e-summary').value.trim();
    if(!title || !summary){
      toast('Please add at least a title and summary.');
      return;
    }

    const deadline = document.getElementById('e-deadline').value;
    const updated = await updateOpportunity(id, {
      title,
      type: document.getElementById('e-type').value,
      price: document.getElementById('e-price').value,
      audience: document.getElementById('e-audience').value,
      format: document.getElementById('e-format').value,
      emirate: document.getElementById('e-emirate').value.trim(),
      deadline: deadline || null,
      summary,
      description: document.getElementById('e-description').value.trim() || summary,
      image: document.getElementById('e-image').value.trim(),
      link: document.getElementById('e-link').value.trim()
    });
    if(!updated) return;

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
  document.getElementById('e-deadline').value = opp.deadline || '';
  document.getElementById('e-summary').value = opp.summary;
  document.getElementById('e-description').value = opp.description || '';
  document.getElementById('e-image').value = opp.image || '';
  document.getElementById('e-link').value = opp.link || '';
  overlay.classList.add('open');
}
