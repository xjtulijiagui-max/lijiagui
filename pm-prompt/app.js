(() => {
  const search = document.querySelector('#search');
  const cards = [...document.querySelectorAll('.prompt-card')];
  const groups = [...document.querySelectorAll('.group')];
  const stages = [...document.querySelectorAll('[data-filter]')];
  const expand = document.querySelector('#expand');
  const panel = document.querySelector('.stage-panel');
  const toast = document.querySelector('#toast');
  const index = cards.map(card => ({ card, text: card.textContent.toLocaleLowerCase() + card.dataset.stage }));
  let selected = 'all';
  let timer;

  function announce(message) {
    clearTimeout(timer);
    toast.textContent = message;
    toast.classList.add('visible');
    timer = setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  function syncExpand() {
    const visible = cards.filter(card => !card.hidden);
    expand.hidden = !visible.length;
    expand.textContent = visible.every(card => card.querySelector('details').open) ? '收起全部' : '展开全部';
  }

  function render() {
    const words = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    for (const {card, text} of index) card.hidden = !(selected === 'all' || card.dataset.stage === selected) || !words.every(word => text.includes(word));
    for (const group of groups) group.hidden = ![...group.querySelectorAll('.prompt-card')].some(card => !card.hidden);
    const count = cards.filter(card => !card.hidden).length;
    document.querySelector('#result-count').textContent = `${count} / 22组提示词${selected === 'all' ? '' : ' · ' + selected}`;
    document.querySelector('#empty').hidden = count !== 0;
    for (const button of stages) button.setAttribute('aria-pressed', String(button.dataset.filter === selected));
    syncExpand();
  }

  function reset() { selected = 'all'; search.value = ''; render(); }

  async function copy(card, button) {
    const code = card.querySelector('code');
    button.disabled = true;
    button.textContent = '复制中…';
    let copied = false;
    try { await navigator.clipboard.writeText(code.textContent); copied = true; }
    catch {
      const area = document.createElement('textarea');
      area.value = code.textContent;
      area.style.cssText = 'position:fixed;opacity:0;left:0;top:0;';
      document.body.append(area);
      area.select();
      try { copied = document.execCommand('copy'); } catch { copied = false; }
      area.remove();
    }
    button.disabled = false;
    if (copied) { button.textContent = '已复制'; announce(`${card.id} 提示词已复制`); }
    else {
      card.querySelector('details').open = true;
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges(); selection.addRange(range);
      button.textContent = '重新复制';
      announce('自动复制未成功，已选中文本，请手动复制');
    }
    button.focus({preventScroll:true});
    setTimeout(() => { if (copied) button.textContent = '复制提示词'; }, 3000);
  }

  function revealHash() {
    const id = location.hash.slice(1);
    const card = cards.find(item => item.id === id);
    if (!card) return;
    reset(); card.querySelector('details').open = true; syncExpand();
    requestAnimationFrame(() => card.scrollIntoView({block:'start'}));
  }

  search.addEventListener('input', render);
  document.querySelector('#clear').addEventListener('click', () => { reset(); search.focus(); });
  document.querySelector('#reset').addEventListener('click', () => { reset(); search.focus(); });
  stages.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.filter; render();
    if (matchMedia('(max-width:959px)').matches) panel.open = false;
  }));
  expand.addEventListener('click', () => {
    const visible = cards.filter(card => !card.hidden);
    const open = !visible.every(card => card.querySelector('details').open);
    visible.forEach(card => { card.querySelector('details').open = open; }); syncExpand();
  });
  cards.forEach(card => {
    card.querySelector('.copy').addEventListener('click', event => copy(card, event.currentTarget));
    card.querySelector('details').addEventListener('toggle', syncExpand);
  });
  document.addEventListener('keydown', event => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (event.key === '/' && !typing) { event.preventDefault(); search.focus(); }
    if (event.key === 'Escape' && document.activeElement === search) reset();
  });
  const narrow = matchMedia('(max-width:959px)');
  panel.open = !narrow.matches;
  narrow.addEventListener('change', event => { panel.open = !event.matches; });
  panel.querySelector('summary').addEventListener('click', event => { if (!narrow.matches) event.preventDefault(); });
  window.addEventListener('hashchange', revealHash);
  render(); revealHash();
})();
