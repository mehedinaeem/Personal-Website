import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const data = JSON.parse(await readFile(new URL('../src/portfolio/content.json', import.meta.url)));

assert.equal(data.publications.length, 7);
assert.equal(data.publications.filter(p => p.firstAuthor).length, 6);
for (const [status, count] of Object.entries({published:1,presented:2,accepted:4}))
  assert.equal(data.publications.filter(p => p.statusKey === status).length, count);
assert.equal(data.publications.filter(p => p.arxiv).length, 2);
assert.equal(data.projects.length, 12);
assert.equal(data.journalManuscripts.length, 1);
assert.equal(data.journalManuscripts[0].citationEligible, false);
assert.equal(data.abstractPresentations.length, 4);
assert.equal(data.experience.length, 11);
const assets = new Set();
function collect(value) {
  if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  else if (typeof value === 'string' && value.startsWith('/assets/')) assets.add(value);
}
collect(data);
for (const asset of assets) await access(new URL('../public' + asset, import.meta.url));
const correctedPeriods = {
  'department-admin': '2023–2024', cr: '2023–2025',
  'aspire-domain': 'Apr 2026–Sep 2026', 'munc-svp': '2024–2025',
  'programming-hero': 'Mar 2025–Aug 2025', intel: 'Jun 2025–Sep 2025',
};
for (const [id, period] of Object.entries(correctedPeriods)) {
  assert.equal(data.experience.find(entry => entry.id === id).period, period);
}
assert.equal(new Set(data.experience.map(entry => entry.id)).size, data.experience.length);
assert.ok(!/5 months|five months/.test(JSON.stringify(data.experience)));
assert.equal(data.certifications.find(entry => entry.id === 'intel').date, '22 September 2025');
for (const id of ['innovatex', 'research-week']) {
  const award = data.awards.find(entry => entry.id === id);
  assert.ok(award.cover.src.includes('/awards/cards/'));
  assert.ok(award.images.length > 0);
}
assert.equal(data.conferences.find(e => e.id === 'compas').paperId, '239');
assert.equal(data.conferences.find(e => e.id === 'compas').images.length, 5);
assert.ok(data.sports.find(e => e.id === 'cricket').title.includes('Captain'));
assert.equal(data.sports.find(e => e.id === 'run').distanceKm, 7.5);
assert.equal(data.sports.find(e => e.id === 'run').timeMinutes, 35);
console.log(`Portfolio integrity passed: ${assets.size} local asset references, research counts, selected projects, roles, and corrections.`);

assert.ok(!/cgpa|programming trainer|private tutor|techmind/i.test(JSON.stringify(data)));
for (const p of data.projects) assert.ok(p.cover?.src.includes('/covers/'));
for (const p of data.publications.filter(p => p.arxiv)) { assert.ok(p.abstract?.length > 500); assert.ok(p.fullPaper.startsWith('https://arxiv.org/pdf/')); }
