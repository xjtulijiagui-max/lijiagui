const cards = Array.from(document.querySelectorAll('.agent-card'));
const searchInput = document.querySelector('#searchInput');
const chips = Array.from(document.querySelectorAll('.chip'));
const visibleCount = document.querySelector('#visibleCount');
let activeFilter = 'all';

function applyFilters() {
  const term = searchInput.value.trim().toLowerCase();
  let count = 0;
  for (const card of cards) {
    const moduleMatch = activeFilter === 'all' || card.dataset.module === activeFilter;
    const text = `${card.dataset.keywords} ${card.textContent}`.toLowerCase();
    const searchMatch = !term || text.includes(term);
    const show = moduleMatch && searchMatch;
    card.hidden = !show;
    if (show) count += 1;
  }
  visibleCount.textContent = String(count);
}

searchInput.addEventListener('input', applyFilters);

for (const chip of chips) {
  chip.addEventListener('click', () => {
    activeFilter = chip.dataset.filter;
    for (const item of chips) item.classList.toggle('active', item === chip);
    applyFilters();
  });
}

document.querySelector('#expandAll').addEventListener('click', () => {
  document.querySelectorAll('details').forEach((detail) => { detail.open = true; });
});

document.querySelector('#collapseAll').addEventListener('click', () => {
  document.querySelectorAll('details').forEach((detail) => { detail.open = false; });
});
