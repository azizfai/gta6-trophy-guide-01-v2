// Leonida Trophy Guide — tracker logic.
// Loads app/data/trophies.json, renders the checklist, and keeps progress in
// localStorage. No network use beyond loading the app's own files.
(function () {
  'use strict';

  var STORE_KEY = 'leonida-trophy-guide-v3';
  var DATA_URL = 'data/trophies.json';
  var KIND_LABELS = {
    story: 'Story',
    side: 'Side quest',
    collectible: 'Collectible',
    activity: 'Activity',
    secret: 'Secret'
  };
  var STAGE_LABELS = {
    1: 'Stage 1 — Story',
    2: 'Stage 2 — Heists & duo work',
    3: 'Stage 3 — Open-world grind',
    4: 'Stage 4 — Cleanup & 100%'
  };

  var trophies = [];
  var state = loadState();

  var listEl = document.getElementById('trophy-list');
  var missableEl = document.getElementById('missable-list');
  var countEl = document.getElementById('count-line');
  var emptyEl = document.getElementById('empty-line');
  var progressFill = document.getElementById('progress-fill');
  var progressText = document.getElementById('progress-text');
  var searchEl = document.getElementById('search');
  var kindEl = document.getElementById('filter-kind');
  var gradeEl = document.getElementById('filter-grade');
  var earnedOnlyEl = document.getElementById('filter-earned');
  var unearnedOnlyEl = document.getElementById('filter-unearned');
  var spoilerEl = document.getElementById('spoiler-toggle');

  function loadState() {
    var fallback = { earned: {}, spoiler: false };
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return fallback;
      return {
        earned: parsed.earned && typeof parsed.earned === 'object' ? parsed.earned : {},
        spoiler: !!parsed.spoiler
      };
    } catch (err) {
      return fallback;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (err) {
      // Storage full or unavailable: progress just does not persist.
    }
  }

  function isEarned(trophy) {
    return !!state.earned[trophy.id];
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function spoilerHidden(trophy) {
    return state.spoiler && trophy.kind === 'story' && !isEarned(trophy);
  }

  function trophyCard(trophy) {
    var li = document.createElement('li');
    li.className = 'trophy' + (isEarned(trophy) ? ' earned' : '');
    li.dataset.id = trophy.id;

    var head = document.createElement('div');
    head.className = 'trophy-head';

    var box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned(trophy);
    box.setAttribute('aria-label', 'Mark ' + trophy.name + ' as earned');
    box.addEventListener('change', function () {
      state.earned[trophy.id] = box.checked;
      if (!box.checked) delete state.earned[trophy.id];
      saveState();
      render();
    });
    head.appendChild(box);

    var title = document.createElement('div');
    title.className = 'trophy-title';
    var name = document.createElement('p');
    name.className = 'trophy-name';
    name.textContent = spoilerHidden(trophy) ? 'Hidden story trophy' : trophy.name;
    var desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = spoilerHidden(trophy)
      ? 'Earn this trophy to reveal its name and description.'
      : trophy.description;
    title.appendChild(name);
    title.appendChild(desc);
    head.appendChild(title);

    var grade = document.createElement('span');
    grade.className = 'grade grade-' + trophy.grade;
    grade.textContent = trophy.grade;
    head.appendChild(grade);
    li.appendChild(head);

    var badges = document.createElement('div');
    badges.className = 'badges';
    badges.appendChild(badge(KIND_LABELS[trophy.kind] || trophy.kind, ''));
    if (trophy.missable) badges.appendChild(badge('Possibly missable', 'missable'));
    if (trophy.confirmed === false) badges.appendChild(badge('Method unconfirmed', 'unconfirmed'));
    li.appendChild(badges);

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'guide-toggle';
    toggle.textContent = 'Show guide';
    var body = document.createElement('div');
    body.className = 'guide-body';
    body.hidden = true;
    var stage = document.createElement('p');
    stage.className = 'stage-note';
    stage.textContent = STAGE_LABELS[trophy.stage] || '';
    var guide = document.createElement('p');
    guide.textContent = trophy.guide;
    var sources = document.createElement('p');
    sources.className = 'sources';
    sources.innerHTML = '<b>Sources:</b> ' + trophy.sources.map(escapeHtml).join(' &middot; ');
    body.appendChild(stage);
    body.appendChild(guide);
    body.appendChild(sources);
    toggle.addEventListener('click', function () {
      body.hidden = !body.hidden;
      toggle.textContent = body.hidden ? 'Show guide' : 'Hide guide';
    });
    li.appendChild(toggle);
    li.appendChild(body);
    return li;
  }

  function badge(text, extra) {
    var span = document.createElement('span');
    span.className = 'badge' + (extra ? ' ' + extra : '');
    span.textContent = text;
    return span;
  }

  function currentFilters() {
    return {
      query: (searchEl.value || '').trim().toLowerCase(),
      kind: kindEl.value,
      grade: gradeEl.value,
      earnedOnly: earnedOnlyEl.checked,
      unearnedOnly: unearnedOnlyEl.checked
    };
  }

  function matchesFilters(trophy, f) {
    if (f.kind === 'missable') {
      if (!trophy.missable) return false;
    } else if (f.kind !== 'all' && trophy.kind !== f.kind) {
      return false;
    }
    if (f.grade !== 'all' && trophy.grade !== f.grade) return false;
    if (f.earnedOnly && !isEarned(trophy)) return false;
    if (f.unearnedOnly && isEarned(trophy)) return false;
    if (f.query) {
      var hay = (trophy.name + ' ' + trophy.description).toLowerCase();
      if (hay.indexOf(f.query) === -1) return false;
    }
    return true;
  }

  function renderProgress() {
    var earned = trophies.filter(isEarned).length;
    var total = trophies.length;
    var pct = total ? Math.round((earned / total) * 100) : 0;
    progressFill.style.width = pct + '%';
    progressText.textContent = earned + ' / ' + total + ' earned (' + pct + '%)';
  }

  function render() {
    var f = currentFilters();
    var shown = trophies.filter(function (t) { return matchesFilters(t, f); });
    listEl.innerHTML = '';
    shown.forEach(function (t) { listEl.appendChild(trophyCard(t)); });
    emptyEl.hidden = shown.length !== 0;
    countEl.textContent = shown.length + ' of ' + trophies.length + ' trophies shown' +
      ' — ' + shown.filter(isEarned).length + ' earned among them';
    renderProgress();

    missableEl.innerHTML = '';
    trophies
      .filter(function (t) { return t.missable || t.confirmed === false; })
      .forEach(function (t) { missableEl.appendChild(trophyCard(t)); });
  }

  function switchView(view) {
    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.classList.toggle('active', tab.dataset.view === view);
    });
    document.getElementById('view-guide').hidden = view !== 'guide';
    document.getElementById('view-roadmap').hidden = view !== 'roadmap';
    document.getElementById('view-missable').hidden = view !== 'missable';
  }

  function exportProgress() {
    var payload = {
      app: 'leonida-trophy-guide',
      exportedAt: new Date().toISOString(),
      earned: Object.keys(state.earned).filter(function (id) { return state.earned[id]; }).map(Number).sort(function (a, b) { return a - b; }),
      spoiler: state.spoiler
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'leonida-trophy-progress.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        var ids = Array.isArray(data.earned) ? data.earned : (Array.isArray(data) ? data : []);
        var next = {};
        ids.forEach(function (id) {
          var n = Number(id);
          if (trophies.some(function (t) { return t.id === n; })) next[n] = true;
        });
        state.earned = next;
        if (typeof data.spoiler === 'boolean') state.spoiler = data.spoiler;
        spoilerEl.checked = state.spoiler;
        saveState();
        render();
      } catch (err) {
        alert('That file is not a valid progress export.');
      }
    };
    reader.readAsText(file);
  }

  document.querySelectorAll('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () { switchView(tab.dataset.view); });
  });
  [searchEl, kindEl, gradeEl, earnedOnlyEl, unearnedOnlyEl].forEach(function (el) {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });
  spoilerEl.checked = state.spoiler;
  spoilerEl.addEventListener('change', function () {
    state.spoiler = spoilerEl.checked;
    saveState();
    render();
  });
  document.getElementById('export-btn').addEventListener('click', exportProgress);
  var importFile = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', function () { importFile.click(); });
  importFile.addEventListener('change', function () {
    if (importFile.files && importFile.files[0]) importProgress(importFile.files[0]);
    importFile.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', function () {
    if (confirm('Clear all earned trophies?')) {
      state.earned = {};
      saveState();
      render();
    }
  });

  fetch(DATA_URL)
    .then(function (res) {
      if (!res.ok) throw new Error('Could not load trophy data');
      return res.json();
    })
    .then(function (data) {
      trophies = data.trophies || data;
      render();
      applyHash();
    })
    .catch(function (err) {
      listEl.innerHTML = '';
      countEl.textContent = 'Could not load the trophy list. ' + err.message;
    });

  function applyHash() {
    var hash = window.location.hash || '';
    if (hash === '#roadmap') {
      switchView('roadmap');
      return;
    }
    if (hash === '#missable') {
      switchView('missable');
      return;
    }
    var match = hash.match(/^#guide-(\d+)$/);
    if (match) {
      var id = Number(match[1]);
      var card = listEl.querySelector('[data-id="' + id + '"]');
      if (card) {
        var toggle = card.querySelector('.guide-toggle');
        if (toggle) toggle.click();
        card.scrollIntoView();
      }
    }
  }
})();
