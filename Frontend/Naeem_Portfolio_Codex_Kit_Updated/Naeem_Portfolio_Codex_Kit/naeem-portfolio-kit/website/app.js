/* Frontend interactions. No API calls, tracking, authentication, or runtime dependencies. */
(() => {
  'use strict';
  const data = window.PORTFOLIO;
  if (!data) return;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const dialog = $('#detail-dialog');
  const dialogContent = $('#dialog-content');
  let previousFocus = null;
  let toastTimer;
  let galleryImages = [];
  let galleryIndex = 0;

  function notify(message) {
    const element = $('#toast');
    clearTimeout(toastTimer);
    element.textContent = message;
    element.hidden = false;
    toastTimer = setTimeout(() => { element.hidden = true; }, 3500);
  }

  async function copy(value) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (_) { /* Use local fallback. */ }
    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('aria-label', 'Text to copy');
    field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    (dialog.open ? dialog : document.body).append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (_) { /* Manual copy remains available. */ }
    field.remove();
    return copied;
  }

  function links(items = []) {
    return items.filter(item => item.url && (/^https:\/\//.test(item.url) || /^assets\//.test(item.url))).map(item => `<a class="inline-link" href="${escape(item.url)}" ${/^https:/.test(item.url) ? 'target="_blank" rel="noopener noreferrer"' : ''}>${escape(item.label)} ↗</a>`).join('');
  }

  function gallery(images = []) {
    galleryImages = images;
    galleryIndex = 0;
    if (!images.length) return '';
    return `<div class="detail-gallery" id="active-gallery">${galleryFrame()}</div>`;
  }

  function galleryFrame() {
    const item = galleryImages[galleryIndex];
    // The souvenir photograph is a gallery image, not proof of authorship.
    const caption = item.caption?.includes('visible certificate') ? item.alt : item.caption || item.alt;
    const controls = galleryImages.length > 1 ? `<div class="gallery-controls"><button data-gallery-step="-1" ${galleryIndex === 0 ? 'disabled' : ''} aria-label="Previous image">← Previous</button><span aria-live="polite">${galleryIndex + 1} / ${galleryImages.length}</span><button data-gallery-step="1" ${galleryIndex === galleryImages.length - 1 ? 'disabled' : ''} aria-label="Next image">Next →</button></div>` : '';
    return `<figure><img src="${escape(item.src)}" alt="${escape(item.alt)}"><figcaption>${escape(caption)}</figcaption></figure>${controls}`;
  }

  function moveGallery(step) {
    const holder = $('#active-gallery');
    if (!holder || !galleryImages.length) return;
    const index = Math.max(0, Math.min(galleryImages.length - 1, galleryIndex + step));
    if (index === galleryIndex) return;
    const focusedStep = document.activeElement?.dataset.galleryStep;
    galleryIndex = index;
    holder.innerHTML = galleryFrame();
    if (focusedStep) {
      const control = $(`[data-gallery-step="${focusedStep}"]`, holder);
      (control && !control.disabled ? control : $('button:not(:disabled)', holder))?.focus();
    }
  }

  function open(content) {
    if (!dialog.open) previousFocus = document.activeElement;
    dialogContent.innerHTML = content;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    $('.dialog-close').focus();
  }

  function showProject(id) {
    const project = data.projects.find(item => item.id === id);
    if (!project) return;
    const parts = [['The question', project.problem], ['The approach', project.approach], ['Technical scope', project.scope]];
    open(`<p class="detail-category">${escape(project.category)} / ${escape(project.status)}</p><h2 id="dialog-title">${escape(project.title)}</h2><p>${escape(project.summary)}</p><div class="chips">${project.technologies.map(value => `<span>${escape(value)}</span>`).join('')}</div><div class="paper-links">${links(project.links)}</div>${parts.filter(([, value]) => value).map(([title, value]) => `<h3>${escape(title)}</h3><p>${escape(value)}</p>`).join('')}${project.limitations ? `<div class="detail-limitation"><h3>Current scope & limitations</h3><p>${escape(project.limitations)}</p></div>` : ''}${gallery(project.images)}`);
  }

  function showGallery(kind, id) {
    const item = data[kind]?.find(entry => entry.id === id);
    if (!item) return;
    const title = item.title || item.name || `${item.organization} · ${item.role}`;
    const category = ({awards:'Award & recognition', certifications:'Learning & credentials', conferences:'Conference & presentation', sports:'Sport & team leadership', experience:'Experience & community'})[kind] || 'Portfolio';
    const images = item.images || (item.image ? [item.image] : []);
    const itemLinks = [...(item.links || [])];
    if (item.certificate || item.document) itemLinks.push({label:'Original certificate',url:item.certificate || item.document});
    if (item.sourceUrl) itemLinks.push({label:'Original post',url:item.sourceUrl});
    if (item.verificationUrl) itemLinks.push({label:'Verify credential',url:item.verificationUrl});
    open(`<p class="detail-category">${escape(category)}${item.date || item.period || item.year ? ' / '+escape(item.date || item.period || item.year) : ''}</p><h2 id="dialog-title">${escape(title)}</h2>${item.event || item.issuer || item.location ? `<p>${escape(item.event || item.issuer || item.location)}</p>` : ''}<p>${escape(item.displaySummary || item.summary || '')}</p>${item.work ? `<h3>Presented work</h3><p>${escape(item.work)}</p>` : ''}<div class="paper-links">${links(itemLinks)}</div>${gallery(images)}`);
  }

  function showCitation(id) {
    const item = data.publications.find(entry => entry.id === id);
    if (!item) return;
    open(`<p class="detail-category">Research / Citation</p><h2 id="dialog-title">BibTeX citation</h2><p>${escape(item.title)}</p><p>Publication status: ${escape(item.status)}. Entries for work awaiting publication use <code>@unpublished</code>.</p><label for="citation-text" class="sr-only">BibTeX citation text</label><textarea id="citation-text" class="citation-field" readonly spellcheck="false">${escape(item.bibtex)}</textarea><div class="citation-actions"><button class="button button-blue" data-copy-citation>Copy BibTeX</button><button class="button button-light" data-download-citation="${escape(item.id)}">Download .bib</button></div>`);
  }

  function downloadCitation(id) {
    const item = data.publications.find(entry => entry.id === id);
    if (!item) return;
    const url = URL.createObjectURL(new Blob([item.bibtex], {type:'application/x-bibtex;charset=utf-8'}));
    const a = document.createElement('a');
    a.href = url; a.download = `${item.citationKey}.bib`; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  let researchFilter = 'conference';
  function filterResearch() {
    const search = $('#research-search').value.trim().toLowerCase();
    let count = 0;
    $$('.research-item').forEach(item => {
      const categoryMatch = researchFilter === 'preprint' ? item.dataset.preprint === 'true' : item.dataset.researchType === researchFilter;
      const matches = categoryMatch && item.dataset.search.includes(search);
      item.hidden = !matches;
      if (matches) count++;
    });
    const label = ({conference:'conference paper',journal:'journal manuscript',preprint:'preprint',abstract:'abstract / presentation'})[researchFilter];
    $('#research-count').textContent = `${count} ${label}${count === 1 ? '' : 's'}${search ? ' matching your search' : ''}`;
    $('#research-empty').hidden = count !== 0;
    $('.research-list').hidden = count === 0;
  }

  function filterProjects(category) {
    let count = 0;
    $$('.project-card').forEach(card => {
      card.hidden = category !== 'all' && card.dataset.projectCategory !== category;
      if (!card.hidden) count++;
    });
    $$('[data-project-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.projectFilter === category)));
    $('#project-count').textContent = `${count} project${count === 1 ? '' : 's'}`;
  }

  document.addEventListener('click', async event => {
    const target = event.target.closest('button,a');
    if (!target) return;
    if (target.matches('[data-project]')) showProject(target.dataset.project);
    if (target.matches('[data-gallery]')) showGallery(target.dataset.gallery, target.dataset.id);
    if (target.matches('[data-gallery-step]')) moveGallery(Number(target.dataset.galleryStep));
    if (target.matches('[data-cite]')) showCitation(target.dataset.cite);
    if (target.matches('[data-download-citation]')) downloadCitation(target.dataset.downloadCitation);
    if (target.matches('[data-close-dialog]')) dialog.close();
    if (target.matches('[data-copy-citation]')) {
      const field = $('#citation-text');
      const copied = await copy(field.value);
      if (copied) notify('BibTeX copied.');
      else { field.focus(); field.select(); notify('Citation selected. Press Ctrl+C or Command+C to copy.'); }
    }
    if (target.matches('[data-copy-email]')) {
      if (await copy(data.profile.email)) notify('Email address copied.');
      else open(`<p class="detail-category">Contact</p><h2 id="dialog-title">Email address</h2><p><a href="mailto:${escape(data.profile.email)}">${escape(data.profile.email)}</a></p><label for="manual-email">Select and copy the address</label><textarea id="manual-email" class="citation-field" readonly>${escape(data.profile.email)}</textarea>`);
    }
    if (target.matches('[data-research-filter]')) {
      researchFilter = target.dataset.researchFilter;
      $$('[data-research-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === target)));
      filterResearch();
    }
    if (target.matches('[data-project-filter]')) filterProjects(target.dataset.projectFilter);
    if (target.matches('.menu-toggle')) {
      const expanded = target.getAttribute('aria-expanded') !== 'true';
      target.setAttribute('aria-expanded', String(expanded));
      target.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
      $('#site-nav').classList.toggle('nav-open', expanded);
    }
    if (target.matches('#site-nav a')) closeMenu();
  });

  function closeMenu() {
    $('.menu-toggle').setAttribute('aria-expanded','false');
    $('.menu-toggle').setAttribute('aria-label','Open navigation');
    $('#site-nav').classList.remove('nav-open');
  }
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('keydown', event => {
    if (!dialog.open || !$('#active-gallery') || event.target.matches('input,textarea')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveGallery(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  $('#research-search').addEventListener('input',filterResearch);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { previousFocus?.focus({preventScroll:true}); });
  $('#footer-year').textContent = new Date().getFullYear();
  filterResearch();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$('.jump-nav a').forEach(a => {
          if (a.getAttribute('href') === '#'+entry.target.id) a.setAttribute('aria-current','location');
          else a.removeAttribute('aria-current');
        });
      });
    }, {rootMargin:'-23% 0px -62% 0px',threshold:0});
    $$('.section[id]').forEach(section => observer.observe(section));
  }
})();
