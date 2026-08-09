
document.addEventListener('DOMContentLoaded', async () => {
  const id = qs('id');
  const opp = id ? await getOpportunity(id) : null;

  const heroImg = opp && opp.image ? `<img src="${escapeHtml(opp.image)}" alt="${escapeHtml(opp.title)}" style="width:100%; height:100%; object-fit:cover;">` : phBlock((opp ? opp.type : 'Opportunity') + ' banner image');
  document.getElementById('detailHero').innerHTML = heroImg;

  if(!opp){
    document.getElementById('detailBody').innerHTML = `
      <p class="eyebrow">Not found</p>
      <h1 class="detail-title">This Opportunity Doesn't Exist</h1>
      <p class="detail-text">It may have been removed. Head back to the dashboard to keep browsing.</p>
      <div class="detail-cta"><a href="dashboard.html" class="btn btn-primary">Back to Opportunities</a></div>`;
    return;
  }

  document.getElementById('detailBody').innerHTML = `
    <p class="eyebrow"><a href="dashboard.html" style="color:inherit;">← Back to Opportunities</a></p>
    <div class="detail-badges" style="margin-top:20px;">
      <span class="tag tag-solid">${escapeHtml(opp.type)}</span>
      <span class="tag">${escapeHtml(opp.format)}</span>
      <span class="tag">${escapeHtml(opp.price)}</span>
      <span class="tag">${escapeHtml(opp.audience)}</span>
      ${opp.emirate ? `<span class="tag">${escapeHtml(opp.emirate)}</span>` : ''}
    </div>
    <h1 class="detail-title">${escapeHtml(opp.title)}</h1>
    <p class="detail-deadline">Deadline · ${formatDate(opp.deadline)}</p>
    <p class="detail-text">${escapeHtml(opp.description || opp.summary)}</p>
    <div class="detail-cta">
      <a href="${opp.link ? escapeHtml(opp.link) : '#'}" target="_blank" rel="noopener" class="btn btn-primary">Apply Now →</a>
    </div>`;
});
