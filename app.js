/* Sezgin Usta – randevu defteri
   Osman'dan Sezgin abiye. Tüm kayıtlar sadece bu telefonda saklanır. */
(() => {
  'use strict';
  const N = window.NLU;
  const KEY = 'sezgin-usta-v1';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = N.ymd, toMin = N.toMin, trl = N.trLower;
  const fromMin = (m) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
  const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
  const todayStr = () => ymd(new Date());
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const DAY = 86400000;
  const DAY_S = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const DAY_L = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const MON = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  const svgI = (p) => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  const I = {
    mic: svgI('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8"/>'),
    gear: svgI('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
    left: svgI('<path d="M15 18l-6-6 6-6"/>'),
    right: svgI('<path d="M9 18l6-6-6-6"/>'),
    back: svgI('<path d="M19 12H5M12 19l-7-7 7-7"/>'),
    plus: svgI('<path d="M12 5v14M5 12h14"/>'),
    check: svgI('<path d="M5 12l5 5L20 7"/>'),
    x: svgI('<path d="M18 6L6 18M6 6l12 12"/>'),
    wa: svgI('<path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>'),
    phone: svgI('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
    scissors: svgI('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/>'),
    edit: svgI('<path d="M4 20h4L18.5 9.5a2.83 2.83 0 0 0-4-4L4 16v4M13.5 6.5l4 4"/>'),
    trash: svgI('<path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>'),
    share: svgI('<path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>'),
    search: svgI('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
    download: svgI('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'),
    upload: svgI('<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>'),
    clock: svgI('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    user: svgI('<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>'),
    cal: svgI('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>'),
    heart: svgI('<path d="M19.5 12.57L12 20l-7.5-7.43A5 5 0 1 1 12 6.01a5 5 0 1 1 7.5 6.57"/>'),
    help: svgI('<circle cx="12" cy="12" r="9"/><path d="M12 17v.01M12 13.5a1.5 1.5 0 0 1 1-1.5 2.6 2.6 0 1 0-3-4"/>'),
  };

  /* ================= VERİ ================= */
  function defaults() {
    const now = Date.now();
    return {
      v: 1,
      settings: {
        start: '09:00', end: '19:00', workDays: [1, 2, 3, 4, 5, 6], defaultService: 'sacsakal',
        services: { sac: { name: 'Saç', dur: 40 }, sakal: { name: 'Sakal', dur: 20 }, sacsakal: { name: 'Saç + sakal', dur: 60 } },
        msgRemind: 'Merhaba {ad}, randevunu hatırlatayım: {gün}, saat {saat}. Görüşmek üzere! Sezgin',
        msgConfirm: 'Merhaba {ad}, randevunu yazdım: {gün}, saat {saat}. Görüşürüz! Sezgin',
        msgMiss: 'Merhaba {ad}, epeydir görüşemedik. Bu hafta uygun olursan yerini ayırayım. Sezgin',
        welcomed: false, lastBackup: null, createdAt: now,
      },
      customers: [{
        id: 'osman', name: 'Osman', phone: '', createdAt: now,
        note: 'Bu defteri sana hazırlayan Osman. Nasıl kestirdiğini zaten biliyorsun abi :)',
      }],
      appts: [],
    };
  }
  function migrate(d) {
    const def = defaults();
    const s = Object.assign({}, def.settings, d.settings || {});
    s.services = Object.assign({}, def.settings.services, (d.settings && d.settings.services) || {});
    return { v: 1, settings: s, customers: Array.isArray(d.customers) ? d.customers : [], appts: Array.isArray(d.appts) ? d.appts : [] };
  }
  function load() {
    try { const s = localStorage.getItem(KEY); if (s) return migrate(JSON.parse(s)); } catch (e) { /* bozuksa sıfırdan */ }
    return defaults();
  }
  let db = load();
  let statsCache = null;
  function save() {
    statsCache = null;
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { toast('Kaydedilemedi. Telefonda yer kalmamış olabilir.'); }
  }
  let undoSnap = null;
  const snapshot = () => { undoSnap = JSON.stringify(db); };
  function undo() {
    if (!undoSnap) return;
    db = JSON.parse(undoSnap); undoSnap = null; save(); render(); toast('Geri alındı');
  }

  /* ================= YARDIMCILAR ================= */
  const svc = (id) => db.settings.services[id] || db.settings.services[db.settings.defaultService] || { name: 'Tıraş', dur: 60 };
  const durOf = (a) => a.dur || svc(a.service).dur;
  const endOf = (a) => toMin(a.time) + durOf(a);
  const cust = (id) => db.customers.find((c) => c.id === id);
  const custName = (id) => (cust(id) || {}).name || 'Silinmiş müşteri';
  const getA = (id) => db.appts.find((a) => a.id === id);
  const firstName = (n) => (n || '').trim().split(/\s+/)[0] || '';
  const initials = (n) => (n || '?').trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toLocaleUpperCase('tr-TR')).join('');
  const avatar = (c, cls = '') => `<span class="av ${cls}">${esc(initials(c.name))}</span>`;

  function apptsOn(date) { return db.appts.filter((a) => a.date === date && a.status !== 'cancelled').sort((a, b) => a.time.localeCompare(b.time)); }
  const started = (a) => { const t = todayStr(); return a.date < t || (a.date === t && toMin(a.time) <= nowMin()); };
  const isPast = (a) => { const t = todayStr(); return a.date < t || (a.date === t && endOf(a) <= nowMin()); };
  const isNow = (a) => a.date === todayStr() && toMin(a.time) <= nowMin() && nowMin() < endOf(a);

  function dateLong(s) { const d = parseYmd(s); return `${d.getDate()} ${MON[d.getMonth()]} ${DAY_L[d.getDay()]}`; }
  function dateShort(s) { const d = parseYmd(s); const y = d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : ''; return `${d.getDate()} ${MON[d.getMonth()]}${y}`; }
  function dayLabel(s) {
    const t = todayStr();
    if (s === t) return 'Bugün';
    if (s === addDays(t, 1)) return 'Yarın';
    if (s === addDays(t, -1)) return 'Dün';
    return dateLong(s);
  }
  function msgDay(s) { const l = dayLabel(s); return l === 'Bugün' ? 'bugün' : l === 'Yarın' ? 'yarın' : dateLong(s); }
  function daysBetween(a, b) { return Math.round((parseYmd(b) - parseYmd(a)) / DAY); }
  function relDays(s) {
    const d = daysBetween(s, todayStr());
    if (d <= 0) return 'bugün';
    if (d === 1) return 'dün';
    if (d < 14) return d + ' gün önce';
    if (d < 60) return Math.round(d / 7) + ' hafta önce';
    if (d < 365) return Math.round(d / 30) + ' ay önce';
    return Math.round(d / 365) + ' yıl önce';
  }
  function durText(m) { const h = Math.floor(m / 60), r = m % 60; return h ? (r ? `${h} saat ${r} dk` : `${h} saat`) : `${r} dk`; }
  function intervalText(d) { return d < 10 ? `~${Math.round(d)} günde bir` : `~${Math.round(d / 7)} haftada bir`; }
  function fmtPhone(p) {
    const d = (p || '').replace(/\D/g, '');
    if (d.length === 11 && d[0] === '0') return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`;
    if (d.length === 10 && d[0] === '5') return `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
    return p;
  }

  function conflicts(date, time, dur, exceptId) {
    const s = toMin(time), e = s + dur;
    return apptsOn(date).filter((a) => a.id !== exceptId && a.status !== 'noshow' && toMin(a.time) < e && s < endOf(a));
  }
  function freeGaps(date) {
    const t = todayStr();
    if (date < t) return [];
    const st = toMin(db.settings.start), en = toMin(db.settings.end);
    const floor = date === t ? Math.ceil(nowMin() / 15) * 15 : 0;
    const gaps = [];
    let cur = st;
    const push = (a, b) => { a = Math.max(a, floor); if (b - a >= 20) gaps.push([a, b]); };
    for (const a of apptsOn(date).filter((x) => x.status !== 'noshow')) {
      const s = toMin(a.time);
      if (s > cur) push(cur, Math.min(s, en));
      cur = Math.max(cur, endOf(a));
    }
    if (en > cur) push(cur, en);
    return gaps;
  }
  function slotTimes(date, dur, exceptId) {
    const st = toMin(db.settings.start);
    const en = Math.max(toMin(db.settings.end), ...apptsOn(date).map(endOf));
    const floor = date === todayStr() ? nowMin() - 5 : -1;
    const cand = new Set();
    for (let m = st; m + dur <= en; m += 30) cand.add(m);
    apptsOn(date).forEach((a) => { const e = endOf(a); if (e + dur <= en) cand.add(e); });
    return [...cand].sort((a, b) => a - b)
      .filter((m) => m >= floor && !conflicts(date, fromMin(m), dur, exceptId).length)
      .map(fromMin);
  }

  function statsMap() {
    if (statsCache) return statsCache;
    const by = {};
    db.appts.forEach((a) => { (by[a.customerId] = by[a.customerId] || []).push(a); });
    const map = {};
    const t = todayStr();
    for (const c of db.customers) {
      const list = (by[c.id] || []).slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      const visits = list.filter((a) => a.status !== 'noshow' && a.status !== 'cancelled' && started(a));
      const dates = [...new Set(visits.map((v) => v.date))];
      const last = dates.length ? dates[dates.length - 1] : null;
      let interval = null;
      if (dates.length >= 3) {
        const diffs = [];
        for (let i = 1; i < dates.length; i++) diffs.push(daysBetween(dates[i - 1], dates[i]));
        diffs.sort((a, b) => a - b);
        interval = diffs[Math.floor(diffs.length / 2)];
      }
      const next = list.find((a) => a.status === 'planned' && !started(a)) || null;
      map[c.id] = { count: visits.length, last, interval, next, since: last ? daysBetween(last, t) : null };
    }
    statsCache = map;
    return map;
  }
  function overdueList() {
    const st = statsMap();
    return db.customers.map((c) => ({ c, s: st[c.id] }))
      .filter(({ s }) => s && s.last && !s.next && s.since >= Math.max(28, s.interval ? Math.round(s.interval * 1.5) : 42))
      .sort((a, b) => b.s.since - a.s.since).slice(0, 8);
  }

  /* WhatsApp */
  function waNumber(p) {
    let d = (p || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.startsWith('00')) d = d.slice(2);
    if (d.startsWith('0')) d = '90' + d.slice(1);
    else if (d.length === 10 && d[0] === '5') d = '90' + d;
    return d;
  }
  function fill(tpl, a, c) {
    return (tpl || '').replace(/\{ad\}/g, firstName(c ? c.name : '')).replace(/\{gün\}/g, a ? msgDay(a.date) : '').replace(/\{saat\}/g, a ? a.time : '');
  }
  function openWA(phone, text) {
    const a = document.createElement('a');
    a.href = `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;
    a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ================= BİLDİRİM & SAYFA ================= */
  let toastTimer;
  function toast(msg, action) {
    const t = $('#toast');
    t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button" id="toast-act">${esc(action.label)}</button>` : ''}`;
    t.classList.add('show');
    if (action) $('#toast-act').onclick = () => { t.classList.remove('show'); action.fn(); };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), action ? 6000 : 2600);
  }

  let sheetClose = null;
  function openSheet(html, opts = {}) {
    closeSheet(true);
    $('#toast').classList.remove('show');
    const root = $('#sheet-root');
    root.innerHTML = `<div class="backdrop" data-close></div><div class="sheet ${opts.cls || ''}" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
    root.classList.add('open');
    void root.offsetWidth;
    root.classList.add('show');
    sheetClose = opts.onClose || null;
    if (opts.onMount) opts.onMount($('.sheet', root));
  }
  function closeSheet(immediate) {
    const root = $('#sheet-root');
    if (!root.classList.contains('open')) return;
    const fn = sheetClose; sheetClose = null;
    if (fn) fn();
    root.classList.remove('show');
    const done = () => { if (!root.classList.contains('show')) { root.innerHTML = ''; root.classList.remove('open'); } };
    if (immediate) done(); else setTimeout(done, 260);
  }
  const sheetOpen = () => $('#sheet-root').classList.contains('open');
  const scrollTop = () => window.scrollTo(0, 0);

  /* ================= GÖRÜNÜMLER ================= */
  const ui = { view: 'day', day: todayStr(), cid: null, q: '' };

  function render() {
    const v = $('#view');
    if (ui.view === 'customer' && !cust(ui.cid)) ui.view = 'customers';
    if (ui.view === 'day') v.innerHTML = dayView();
    else if (ui.view === 'customers') v.innerHTML = customersView();
    else v.innerHTML = customerView(ui.cid);
    $('#nav-day').classList.toggle('on', ui.view === 'day');
    $('#nav-cust').classList.toggle('on', ui.view !== 'day');
    const q = $('#q');
    if (q) q.oninput = () => { ui.q = q.value; $('#cust-list').innerHTML = custList(); const ov = $('#ov-sec'); if (ov) ov.hidden = !!ui.q.trim(); };
    renderInstallBar();
  }

  function backupBanner() {
    const s = db.settings;
    if (db.appts.length < 3) return '';
    const days = Math.floor((Date.now() - (s.lastBackup || s.createdAt)) / DAY);
    if (days < 7) return '';
    return `<button class="banner" data-action="backup">${I.download}<span>${s.lastBackup ? `Son yedek ${days} gün önce alındı.` : 'Henüz hiç yedek almadın.'} <b>Şimdi yedek al</b></span></button>`;
  }

  function dayView() {
    const d = ui.day, t = todayStr();
    const list = apptsOn(d), gaps = freeGaps(d);
    const wd = parseYmd(d).getDay();
    const closed = !db.settings.workDays.includes(wd);
    const mon = addDays(d, -((wd + 6) % 7));
    const days = [...Array(7)].map((_, i) => addDays(mon, i));
    const counts = {};
    db.appts.forEach((a) => { if (a.date >= days[0] && a.date <= days[6] && a.status !== 'cancelled') counts[a.date] = (counts[a.date] || 0) + 1; });
    let sub;
    if (list.length) sub = `${list.length} randevu` + (gaps.length ? ` · ${gaps.length} boş aralık` : '');
    else sub = closed ? 'Kapalı gün' : (d < t ? 'Kayıt yok' : 'Randevu yok');

    return `
    <header class="top">
      <div class="brand"><span class="pole" aria-hidden="true"></span><div><h1>Sezgin Usta</h1><p class="sub">${esc(dateLong(t))}</p></div></div>
      <div class="day-actions">${d !== t ? `<button class="pill" data-action="pick-day" data-date="${t}">Bugüne dön</button>` : ''}<button class="icon-btn" data-action="settings" aria-label="Ayarlar">${I.gear}</button></div>
    </header>
    <div class="week">
      <button class="wk-arrow" data-action="week" data-n="-7" aria-label="Önceki hafta">${I.left}</button>
      ${days.map((x) => {
        const xd = parseYmd(x), off = !db.settings.workDays.includes(xd.getDay()), c = counts[x] || 0;
        return `<button class="wd ${x === d ? 'sel' : ''} ${x === t ? 'today' : ''} ${off ? 'off' : ''}" data-action="pick-day" data-date="${x}" aria-label="${esc(dateLong(x))}, ${c} randevu"><span>${DAY_S[xd.getDay()]}</span><b>${xd.getDate()}</b><i>${'•'.repeat(Math.min(c, 5))}</i></button>`;
      }).join('')}
      <button class="wk-arrow" data-action="week" data-n="7" aria-label="Sonraki hafta">${I.right}</button>
    </div>
    ${backupBanner()}
    <div class="day-head">
      <div><h2>${esc(dayLabel(d))}</h2><p class="sub">${d !== t && dayLabel(d) !== dateLong(d) ? esc(dateLong(d)) + '<br>' : ''}${sub}</p></div>
      <div class="day-actions"><button class="btn-red sm" data-action="add" data-date="${d}">${I.plus} Randevu</button></div>
    </div>
    <div class="timeline">${timeline(d, list, gaps, closed)}</div>
    <div class="spacer"></div>`;
  }

  function timeline(d, list, gaps, closed) {
    let html = '';
    if (!list.length) {
      const t = todayStr();
      if (d < t) return `<div class="empty">Bu gün için kayıt yok.</div>`;
      html += `<div class="empty-card"><span class="ic">${I.mic}</span>
        <p><b>${closed ? 'Kapalı gün. Yine de randevu yazabilirsin.' : 'Henüz randevu yok'}</b></p>
        <p class="muted">Aşağıdaki kırmızı mikrofona bas ve söyle:</p>
        <p class="say">“${d === t ? 'Saat 3’te' : dayLabel(d) === 'Yarın' ? 'Yarın 3’te' : DAY_L[parseYmd(d).getDay()] + ' 3’te'} Ahmet saç sakal”</p></div>`;
    }
    const items = list.map((a) => ({ m: toMin(a.time), html: apptRow(a) }))
      .concat(gaps.map((g) => ({ m: g[0] - 0.5, html: gapRow(d, g) })));
    items.sort((a, b) => a.m - b.m);
    return html + items.map((x) => x.html).join('');
  }

  function apptRow(a) {
    const c = cust(a.customerId);
    const past = isPast(a), now = isNow(a), ns = a.status === 'noshow';
    const note = c && c.note ? `<span class="note">${esc(c.note.split('\n')[0])}</span>` : '';
    const right = past || ns
      ? `<span class="done" aria-label="${ns ? 'gelmedi' : 'tamamlandı'}">${ns ? I.x : I.check}</span>`
      : `<button class="wa-btn" data-action="wa-remind" data-id="${a.id}" aria-label="WhatsApp ile hatırlat">${I.wa}</button>`;
    return `<div class="appt ${past ? 'past' : ''} ${now ? 'now' : ''} ${ns ? 'ns' : ''}" data-action="open-appt" data-id="${a.id}" role="button" tabindex="0">
      <div class="tm">${a.time}<small>${fromMin(endOf(a))}</small></div>
      <div class="who"><div class="nm">${esc(c ? c.name : 'Silinmiş müşteri')}${now ? '<em>şimdi</em>' : ''}${ns ? '<em>gelmedi</em>' : ''}</div>
      <div class="meta"><span class="tag">${esc(svc(a.service).name)}</span>${note}</div></div>${right}</div>`;
  }
  function gapRow(d, g) {
    return `<button class="gap" data-action="add" data-date="${d}" data-time="${fromMin(g[0])}">
      <span class="tm">${fromMin(g[0])}</span><span><b>Boş</b> · ${durText(g[1] - g[0])} <span class="muted">· ${fromMin(g[0])}–${fromMin(g[1])}</span></span><span class="plus">${I.plus}</span></button>`;
  }

  function customersView() {
    const ov = overdueList();
    return `
    <header class="top">
      <div class="brand"><span class="pole" aria-hidden="true"></span><div><h1>Müşteriler</h1><p class="sub">${db.customers.length} kişi</p></div></div>
      <button class="icon-btn" data-action="new-customer" aria-label="Yeni müşteri">${I.plus}</button>
    </header>
    <label class="search">${I.search}<input id="q" type="search" placeholder="İsim ya da telefon ara" value="${esc(ui.q)}" autocomplete="off" enterkeyhint="search"></label>
    ${ov.length ? `<div id="ov-sec" ${ui.q.trim() ? 'hidden' : ''}><h3 class="sec">Epeydir gelmeyenler</h3><div class="list">${ov.map(({ c, s }) => `
      <div class="crow" data-action="open-customer" data-id="${c.id}">${avatar(c)}<div class="who"><div class="nm">${esc(c.name)}</div><div class="meta">Son geliş ${relDays(s.last)}${s.interval ? ' · genelde ' + intervalText(s.interval).replace('~', '') : ''}</div></div>
      <button class="wa-btn" data-action="wa-miss" data-id="${c.id}" aria-label="WhatsApp mesajı at">${I.wa}</button></div>`).join('')}</div></div>` : ''}
    <h3 class="sec">Tüm müşteriler</h3>
    <div class="list" id="cust-list">${custList()}</div>
    <div class="spacer"></div>`;
  }
  function custList() {
    const q = trl(ui.q.trim());
    const qd = q.replace(/\D/g, '');
    const st = statsMap();
    const arr = db.customers
      .filter((c) => !q || trl(c.name).includes(q) || (qd.length >= 3 && (c.phone || '').replace(/\D/g, '').includes(qd)))
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    if (!arr.length) return `<div class="empty">${q ? 'Bu isimde müşteri yok.' : 'Henüz müşteri yok. Randevu yazdıkça burası dolacak.'}</div>`;
    return arr.map((c) => {
      const s = st[c.id] || {};
      const meta = s.next ? `Sıradaki: ${dayLabel(s.next.date)} ${s.next.time}` : s.last ? `Son geliş ${relDays(s.last)} · ${s.count} kez` : 'Henüz gelmedi';
      return `<div class="crow" data-action="open-customer" data-id="${c.id}">${avatar(c)}<div class="who"><div class="nm">${esc(c.name)}</div><div class="meta">${esc(meta)}</div></div>${I.right}</div>`;
    }).join('');
  }

  function noteInner(c) {
    return `<div class="note-head">${I.scissors} Nasıl kestirir <button class="link" data-action="edit-note" data-id="${c.id}">${c.note ? 'Düzenle' : 'Not ekle'}</button></div>
      <div class="note-body">${c.note ? esc(c.note).replace(/\n/g, '<br>') : '<span class="muted">Saçını, sakalını nasıl kestirdiğini buraya yaz. Bir dahaki sefere aklında tutmana gerek kalmaz.</span>'}</div>`;
  }
  function customerView(id) {
    const c = cust(id);
    const s = statsMap()[id] || {};
    const hist = db.appts.filter((a) => a.customerId === id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    const tel = (c.phone || '').replace(/[^\d+]/g, '');
    return `
    <header class="top"><button class="back" data-action="go-customers">${I.back} Müşteriler</button>
      <button class="icon-btn" data-action="edit-customer" data-id="${id}" aria-label="Müşteriyi düzenle">${I.edit}</button></header>
    <div class="profile">${avatar(c, 'lg')}<div><h1>${esc(c.name)}</h1><p class="sub">${c.phone ? esc(fmtPhone(c.phone)) + ' · ' : ''}${s.count || 0} kez geldi</p></div></div>
    <div class="actions3">
      ${tel ? `<a class="act" href="tel:${esc(tel)}">${I.phone} Ara</a>` : `<button class="act" data-action="edit-customer" data-id="${id}">${I.phone} Tel ekle</button>`}
      <button class="act wa" data-action="wa-hello" data-id="${id}">${I.wa} Mesaj</button>
      <button class="act primary" data-action="add" data-cid="${id}">${I.plus} Randevu</button>
    </div>
    <div class="note-card" id="note-card">${noteInner(c)}</div>
    <div class="card stats">
      <div class="kv"><span>Son geliş</span><b>${s.last ? relDays(s.last) + ' · ' + dateShort(s.last) : '—'}</b></div>
      <div class="kv"><span>Genelde</span><b>${s.interval ? intervalText(s.interval) : '—'}</b></div>
      <div class="kv"><span>Sıradaki</span><b class="${s.next ? 'navy' : ''}">${s.next ? dayLabel(s.next.date) + ' ' + s.next.time : 'Yok'}</b></div>
    </div>
    <h3 class="sec">Geçmiş</h3>
    <div class="list">${hist.length ? hist.map((a) => `<div class="hrow" data-action="open-appt" data-id="${a.id}"><span>${esc(dateShort(a.date))} · ${a.time}</span>${a.status === 'noshow' ? '<span class="tag red">gelmedi</span>' : ''}<span class="tag">${esc(svc(a.service).name)}</span></div>`).join('') : '<div class="empty small">Henüz kayıt yok.</div>'}</div>
    <div class="spacer"></div>`;
  }

  function editNote(id) {
    const c = cust(id), el = $('#note-card');
    if (!c || !el) return;
    el.innerHTML = `<div class="note-head">${I.scissors} Nasıl kestirir</div>
      <textarea id="note-ta" rows="4" placeholder="Örnek: Kenarlar 2 numara, üst makasla kısa. Sakal 3 mm, ense düz.">${esc(c.note || '')}</textarea>
      <div class="row-btns"><button class="btn-ghost sm" id="note-cancel">Vazgeç</button><button class="btn-navy sm" id="note-save">${I.check} Kaydet</button></div>`;
    const ta = $('#note-ta');
    ta.focus();
    $('#note-cancel').onclick = () => { el.innerHTML = noteInner(c); };
    $('#note-save').onclick = () => { snapshot(); c.note = ta.value.trim(); save(); el.innerHTML = noteInner(c); toast('Not kaydedildi'); };
  }

  /* ================= RANDEVU FORMU ================= */
  function apptFormHTML(fs) {
    const voice = fs.mode === 'voice';
    const btn = voice ? 'Tamam, kaydet' : fs.id ? 'Kaydet' : 'Randevuyu yaz';
    return `
    ${fs.heard ? `<div class="heard">“${esc(fs.heard)}”</div>` : ''}
    ${voice ? '<div class="rcard" id="f-sum"></div>' : ''}
    <div id="f-form" ${voice && fs.compact ? 'hidden' : ''}><div class="form">
      <label class="lbl" for="f-name">Kim?</label>
      <div id="f-cands"></div>
      <input id="f-name" type="text" placeholder="Müşterinin adı" value="${esc(fs.name)}" autocomplete="off" autocapitalize="words" enterkeyhint="done">
      <div id="f-sugg"></div>
      <div id="f-phone-row" hidden><label class="lbl" for="f-phone">Telefon <span style="font-weight:500">(isteğe bağlı, WhatsApp için)</span></label>
        <input id="f-phone" type="tel" inputmode="tel" placeholder="05xx xxx xx xx" value="${esc(fs.phone || '')}" autocomplete="off"></div>
      <div class="lbl">Gün</div><div id="f-days" class="chips"></div>
      <div class="lbl">Saat</div><div id="f-times" class="chips times"></div>
      <div class="lbl">İşlem</div><div id="f-svcs" class="chips"></div>
    </div></div>
    <div id="f-warn"></div><div id="f-err" class="err" hidden></div>
    <div class="sheet-btns">
      <button class="btn-red big" id="f-save">${I.check} ${btn}</button>
      ${voice ? `<button class="btn-ghost" id="f-edit" ${fs.compact ? '' : 'hidden'}>${I.edit} Değiştir</button>
                 <button class="btn-ghost" data-action="re-say">${I.mic} Yeniden söyle</button>` : ''}
    </div>`;
  }

  function mountForm(fs, root) {
    const nameI = $('#f-name', root), phoneI = $('#f-phone', root);
    const err = (m) => { const e = $('#f-err', root); e.textContent = m; e.hidden = !m; };
    const exact = (name) => db.customers.filter((c) => trl(c.name) === trl(name.trim()));

    function drawCands() {
      const el = $('#f-cands', root);
      if (!fs.candidates || !fs.candidates.length || fs.picked) { el.innerHTML = ''; return; }
      const cs = fs.candidates.map(cust).filter(Boolean);
      const newName = fs.name && !cs.some((c) => trl(c.name) === trl(fs.name)) ? fs.name : null;
      el.innerHTML = `<div class="cands"><p>${fs.ambiguous ? 'Hangisi?' : 'Kayıtlı müşteri mi, yeni mi?'}</p><div class="chips">
        ${cs.map((c) => `<button class="chip" data-pick="${c.id}">${esc(c.name)}</button>`).join('')}
        ${newName ? `<button class="chip ghost" data-pick="new">${I.plus} Yeni: ${esc(newName)}</button>` : ''}</div></div>`;
      $$('[data-pick]', el).forEach((b) => b.onclick = () => {
        fs.picked = true;
        if (b.dataset.pick === 'new') { fs.customerId = null; }
        else { fs.customerId = b.dataset.pick; fs.name = custName(fs.customerId); nameI.value = fs.name; }
        drawCands(); drawSugg(); drawWarn();
      });
    }
    function drawSugg() {
      const el = $('#f-sugg', root);
      const pr = $('#f-phone-row', root);
      if (fs.customerId) {
        const c = cust(fs.customerId), s = statsMap()[fs.customerId] || {};
        el.innerHTML = `<div class="picked">${I.check}<span>Kayıtlı müşteri${s.count ? ` · ${s.count} kez geldi` : ''}${c.note ? ` · <span class="n">${esc(c.note.split('\n')[0])}</span>` : ''}</span></div>`;
        pr.hidden = true;
        return;
      }
      const q = trl(fs.name.trim());
      pr.hidden = !q;
      if (!q) { el.innerHTML = ''; return; }
      const m = db.customers.filter((c) => { const n = trl(c.name); return n.startsWith(q) || n.split(/\s+/).some((w) => w.startsWith(q)); }).slice(0, 4);
      el.innerHTML = m.length ? `<div class="sugg">${m.map((c) => `<button class="chip" data-sg="${c.id}">${esc(c.name)}</button>`).join('')}</div>` :
        `<div class="picked"><span class="n">${I.plus}</span><span class="n">Yeni müşteri olarak eklenecek</span></div>`;
      $$('[data-sg]', el).forEach((b) => b.onclick = () => { fs.customerId = b.dataset.sg; fs.name = custName(fs.customerId); nameI.value = fs.name; fs.picked = true; drawCands(); drawSugg(); drawWarn(); });
    }
    function drawDays() {
      const el = $('#f-days', root), t = todayStr();
      const list = [...Array(7)].map((_, i) => addDays(t, i));
      if (fs.date && !list.includes(fs.date)) list.push(fs.date);
      el.innerHTML = list.map((x, i) => {
        const d = parseYmd(x);
        const lab = x === t ? 'Bugün' : x === addDays(t, 1) ? 'Yarın' : i < 7 ? `${DAY_S[d.getDay()]} ${d.getDate()}` : `${d.getDate()} ${MON[d.getMonth()].slice(0, 3)}`;
        return `<button class="chip ${x === fs.date ? 'sel' : ''}" data-day="${x}">${lab}</button>`;
      }).join('') + `<label class="chip ghost">${I.cal} Başka gün<input type="date" id="f-date" value="${fs.date}" aria-label="Başka gün seç"></label>`;
      $$('[data-day]', el).forEach((b) => b.onclick = () => { fs.date = b.dataset.day; drawDays(); drawTimes(); drawWarn(); });
      const di = $('#f-date', el);
      di.onclick = () => { try { di.showPicker && di.showPicker(); } catch (e) { /* */ } };
      di.onchange = (e) => { if (e.target.value) { fs.date = e.target.value; drawDays(); drawTimes(); drawWarn(); } };
    }
    function drawTimes() {
      const el = $('#f-times', root);
      const dur = svc(fs.service).dur;
      let times = slotTimes(fs.date, dur, fs.id);
      if (fs.time && !times.includes(fs.time)) times = times.concat(fs.time).sort();
      el.innerHTML = times.map((x) => {
        const bad = conflicts(fs.date, x, dur, fs.id).length;
        return `<button class="chip ${x === fs.time ? 'sel' : ''} ${bad ? 'warn-c' : ''}" data-tm="${x}">${x}</button>`;
      }).join('') + `<label class="chip ghost">${I.clock} Başka<input type="time" id="f-time" value="${fs.time || ''}" step="300" aria-label="Başka saat seç"></label>`;
      $$('[data-tm]', el).forEach((b) => b.onclick = () => { fs.time = b.dataset.tm; err(''); drawTimes(); drawWarn(); });
      const ti = $('#f-time', el);
      ti.onclick = () => { try { ti.showPicker && ti.showPicker(); } catch (e) { /* */ } };
      ti.onchange = () => { if (ti.value) { fs.time = ti.value.slice(0, 5); err(''); drawTimes(); drawWarn(); } };
    }
    function drawSvcs() {
      const el = $('#f-svcs', root);
      el.innerHTML = Object.entries(db.settings.services).map(([id, v]) =>
        `<button class="chip ${id === fs.service ? 'sel' : ''}" data-sv="${id}">${esc(v.name)} <small>${v.dur} dk</small></button>`).join('');
      $$('[data-sv]', el).forEach((b) => b.onclick = () => { fs.service = b.dataset.sv; drawSvcs(); drawTimes(); drawWarn(); });
    }
    function drawSum() {
      const el = $('#f-sum', root);
      if (!el) return;
      const c = fs.customerId ? cust(fs.customerId) : null, v = svc(fs.service);
      el.innerHTML = `<div class="r-title">${I.cal} Randevu</div>
        <div class="r-name">${esc(dayLabel(fs.date))}${fs.time ? ' · ' + fs.time : ''}</div>
        <p class="r-text"><b>${esc(fs.name || 'İsim yok')}</b>${!c && fs.name ? ' <span class="muted">(yeni müşteri)</span>' : ''} · ${esc(v.name)} · ${v.dur} dk</p>
        ${c && c.note ? `<div class="quote"><small>NASIL KESTİRİR</small>${esc(c.note.split('\n')[0])}</div>` : ''}`;
    }
    function drawWarn() {
      drawSum();
      const el = $('#f-warn', root), w = [];
      const dur = svc(fs.service).dur;
      if (fs.time) {
        conflicts(fs.date, fs.time, dur, fs.id).forEach((a) => w.push(`Bu saatte <b>${esc(custName(a.customerId))}</b> var (${a.time}–${fromMin(endOf(a))}). Yine de yazabilirsin.`));
        if (fs.date === todayStr() && toMin(fs.time) < nowMin() - 10) w.push('Bu saat bugün için geçti.');
        if (fs.date < todayStr()) w.push('Geçmiş bir gün seçili.');
      }
      if (!db.settings.workDays.includes(parseYmd(fs.date).getDay())) w.push(`${DAY_L[parseYmd(fs.date).getDay()]} normalde kapalı gün.`);
      if (fs.customerId) {
        const same = apptsOn(fs.date).filter((a) => a.customerId === fs.customerId && a.id !== fs.id);
        if (same.length) w.push(`Bu gün zaten ${same.map((a) => a.time).join(', ')} randevusu var.`);
      }
      el.innerHTML = w.length ? `<div class="warn">${w.join('<br>')}</div>` : '';
    }

    nameI.oninput = () => {
      fs.name = nameI.value; err('');
      const ex = exact(fs.name);
      fs.customerId = ex.length === 1 ? ex[0].id : null;
      drawSugg(); drawWarn();
    };
    if (!fs.customerId && fs.name) { const ex = exact(fs.name); if (ex.length === 1 && !(fs.candidates && fs.candidates.length)) fs.customerId = ex[0].id; }
    drawCands(); drawSugg(); drawDays(); drawTimes(); drawSvcs(); drawWarn();
    const ed = $('#f-edit', root);
    if (ed) ed.onclick = () => { $('#f-form', root).hidden = false; ed.hidden = true; };

    $('#f-save', root).onclick = () => {
      fs.name = nameI.value.trim();
      const phone = phoneI ? phoneI.value.trim() : '';
      const showForm = () => { const f = $('#f-form', root); if (f) f.hidden = false; if (ed) ed.hidden = true; };
      if (!fs.name) { showForm(); err('Müşterinin adını yaz.'); nameI.focus(); return; }
      if (!/^\d{2}:\d{2}$/.test(fs.time || '')) { showForm(); err('Bir saat seç.'); return; }
      if (fs.candidates && fs.candidates.length && !fs.picked && !fs.customerId) {
        const ex = exact(fs.name);
        if (!ex.length && fs.ambiguous) { err('Önce yukarıdan hangi kişi olduğunu seç.'); return; }
      }
      snapshot();
      let cid = fs.customerId;
      if (!cid) {
        const ex = exact(fs.name);
        if (ex.length && !fs.picked) cid = ex[0].id;
        else {
          const c = { id: uid(), name: N.titleCase(fs.name), phone, note: '', createdAt: Date.now() };
          db.customers.push(c); cid = c.id;
        }
      } else if (phone && cust(cid) && !cust(cid).phone) cust(cid).phone = phone;
      const dur = svc(fs.service).dur;
      if (fs.id) {
        const a = getA(fs.id);
        Object.assign(a, { customerId: cid, date: fs.date, time: fs.time, service: fs.service, dur });
      } else {
        db.appts.push({ id: uid(), customerId: cid, date: fs.date, time: fs.time, service: fs.service, dur, status: 'planned', createdAt: Date.now() });
      }
      save(); closeSheet();
      if (ui.view === 'day') ui.day = fs.date;
      render();
      toast(`${fs.id ? 'Güncellendi' : 'Randevu yazıldı'}: ${dayLabel(fs.date)} ${fs.time}`, { label: 'Geri al', fn: undo });
    };
  }

  function openAdd(o) {
    const a = o.id ? getA(o.id) : null;
    const fs = {
      mode: a ? 'edit' : 'add', id: a ? a.id : null,
      customerId: a ? a.customerId : (o.customerId || null),
      name: a ? custName(a.customerId) : (o.customerId ? custName(o.customerId) : ''),
      phone: '', date: a ? a.date : (o.date || todayStr()), time: a ? a.time : (o.time || ''),
      service: a ? a.service : db.settings.defaultService, candidates: [], picked: !!(a || o.customerId),
    };
    if (fs.date < todayStr() && !a) fs.date = todayStr();
    openSheet(`<div class="sheet-head"><h2>${a ? 'Randevuyu değiştir' : 'Yeni randevu'}</h2><button class="x" data-close aria-label="Kapat">${I.x}</button></div>${apptFormHTML(fs)}`,
      { onMount: (sh) => mountForm(fs, sh) });
  }

  function openAppt(id) {
    const a = getA(id);
    if (!a) return;
    const c = cust(a.customerId) || { id: '', name: 'Silinmiş müşteri', phone: '' };
    const st = started(a), ns = a.status === 'noshow';
    const tel = (c.phone || '').replace(/[^\d+]/g, '');
    openSheet(`<div class="sheet-head"><h2>${esc(c.name)}</h2><button class="x" data-close aria-label="Kapat">${I.x}</button></div>
      <p class="sub big">${esc(dayLabel(a.date))}${dayLabel(a.date) !== dateLong(a.date) ? ' (' + esc(dateShort(a.date)) + ')' : ''} · ${a.time}–${fromMin(endOf(a))} · ${esc(svc(a.service).name)}</p>
      ${ns ? '<span class="tag red lg">Gelmedi olarak işaretli</span>' : ''}
      ${c.note ? `<div class="note-card mini"><div class="note-head">${I.scissors} Nasıl kestirir</div><div class="note-body">${esc(c.note).replace(/\n/g, '<br>')}</div></div>` : ''}
      <div class="grid2">
        ${!st ? `<button class="act wa" data-action="wa-remind" data-id="${a.id}">${I.wa} Hatırlat</button>
                 <button class="act wa" data-action="wa-confirm" data-id="${a.id}">${I.wa} Randevuyu bildir</button>` : ''}
        ${tel ? `<a class="act" href="tel:${esc(tel)}">${I.phone} Ara</a>` : ''}
        ${c.id ? `<button class="act" data-action="open-customer" data-id="${c.id}">${I.user} Müşteri kartı</button>` : ''}
        <button class="act" data-action="edit-appt" data-id="${a.id}">${I.edit} Değiştir</button>
        ${st ? `<button class="act" data-action="toggle-noshow" data-id="${a.id}">${ns ? I.check + ' Geldi' : I.x + ' Gelmedi'}</button>` : ''}
      </div>
      <button class="btn-danger-text" data-action="delete-appt" data-id="${a.id}">${I.trash} ${st ? 'Kaydı sil' : 'Randevuyu iptal et'}</button>`);
  }

  function openCustomerEdit(id) {
    const c = id ? cust(id) : null;
    openSheet(`<div class="sheet-head"><h2>${c ? 'Müşteriyi düzenle' : 'Yeni müşteri'}</h2><button class="x" data-close aria-label="Kapat">${I.x}</button></div>
      <div class="form">
        <label class="lbl" for="c-name">Ad soyad</label><input id="c-name" type="text" value="${esc(c ? c.name : '')}" placeholder="Örnek: Ahmet Yılmaz" autocapitalize="words" autocomplete="off">
        <label class="lbl" for="c-phone">Telefon</label><input id="c-phone" type="tel" inputmode="tel" value="${esc(c ? c.phone : '')}" placeholder="05xx xxx xx xx" autocomplete="off">
        ${c ? '' : `<label class="lbl" for="c-note">Nasıl kestirir</label><textarea id="c-note" rows="3" placeholder="Örnek: Kenarlar 2 numara, üst makasla kısa."></textarea>`}
        <div id="c-err" class="err" hidden></div>
      </div>
      <div class="sheet-btns"><button class="btn-navy big" id="c-save">${I.check} Kaydet</button></div>
      ${c ? `<button class="btn-danger-text" id="c-del">${I.trash} Müşteriyi sil</button>` : ''}`, {
      onMount: (sh) => {
        $('#c-save', sh).onclick = () => {
          const name = $('#c-name', sh).value.trim(), phone = $('#c-phone', sh).value.trim();
          const e = $('#c-err', sh);
          if (!name) { e.textContent = 'Bir isim yaz.'; e.hidden = false; return; }
          const dup = db.customers.find((x) => x.id !== id && trl(x.name) === trl(name));
          if (dup && !c) { e.textContent = 'Bu isimde bir müşteri zaten var. Ayırt etmek için soyadını ekle.'; e.hidden = false; return; }
          snapshot();
          let target = c;
          if (c) { c.name = name; c.phone = phone; }
          else { target = { id: uid(), name: N.titleCase(name), phone, note: ($('#c-note', sh).value || '').trim(), createdAt: Date.now() }; db.customers.push(target); }
          save(); closeSheet(); ui.view = 'customer'; ui.cid = target.id; render(); scrollTop();
          toast(c ? 'Kaydedildi' : 'Müşteri eklendi');
        };
        const del = $('#c-del', sh);
        if (del) del.onclick = () => {
          const n = db.appts.filter((a) => a.customerId === id).length;
          if (!confirm(`${c.name} ve ${n} randevu kaydı silinsin mi?`)) return;
          snapshot();
          db.customers = db.customers.filter((x) => x.id !== id);
          db.appts = db.appts.filter((a) => a.customerId !== id);
          save(); closeSheet(); ui.view = 'customers'; render();
          toast('Müşteri silindi', { label: 'Geri al', fn: undo });
        };
      },
    });
  }

  /* ================= MİKROFON ================= */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, listening = false, micDenied = false, recTimer = null;
  const EXAMPLES = [
    'Yarın 3’te Ahmet saç sakal',
    'Cuma 10 buçukta Mehmet saç',
    'Ahmet’i 5’e al',
    'Kaan’ın randevusunu iptal et',
    'Ahmet’e not al: kenarlar 2 numara',
    'Yarın kimler var?',
    'Bugün boş saatim var mı?',
    'Emre gelmedi',
  ];
  const canListen = () => !!SR && !micDenied;
  const idleText = () => canListen() ? 'Dokun ve konuş' : 'Aşağıdaki kutuya dokun, klavyedeki 🎤 tuşuyla söyle';

  function micBodyHTML() {
    return `<div class="mic-wrap"><button class="big-mic" id="big-mic" aria-label="Konuşmaya başla">${I.mic}</button>
      <div class="mic-status" id="mic-status">${idleText()}</div><div class="mic-live" id="mic-live"></div></div>
      <form class="mic-form" id="mic-form"><input id="mic-input" type="text" placeholder="ya da buraya yaz…" autocomplete="off" enterkeyhint="send" aria-label="Komut yaz"><button type="submit" class="btn-navy">Gönder</button></form>
      <div class="ex-title">Şöyle diyebilirsin</div>
      <div class="examples">${EXAMPLES.map((e) => `<button class="ex" type="button" data-ex="${esc(e)}">“${esc(e)}”</button>`).join('')}</div>`;
  }
  function openMic(auto) {
    openSheet(`<div class="sheet-head"><h2>Sesle söyle</h2><button class="x" data-close aria-label="Kapat">${I.x}</button></div><div id="mic-area">${micBodyHTML()}</div>`,
      { cls: 'mic-sheet', onMount: () => { wireMic(); if (auto) startListen(); }, onClose: () => stopListen(false) });
  }
  function wireMic() {
    const area = $('#mic-area');
    $('#big-mic', area).onclick = () => { if (listening) stopListen(true); else startListen(); };
    $('#mic-form', area).onsubmit = (e) => { e.preventDefault(); const v = $('#mic-input', area).value.trim(); if (v) { $('#mic-input', area).blur(); handleText(v); } };
    $$('.ex', area).forEach((b) => b.onclick = () => { const i = $('#mic-input', area); i.value = b.dataset.ex; i.focus(); });
  }
  function setStatus(t) { const s = $('#mic-status'); if (s) s.textContent = t; }
  function startListen() {
    if (!canListen()) {
      const i = $('#mic-input'); if (i) i.focus();
      setStatus('Klavyedeki 🎤 tuşuna basıp söyle, sonra Gönder’e bas');
      return;
    }
    let text = '';
    try {
      rec = new SR();
      rec.lang = 'tr-TR'; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
      const me = rec;
      rec.onresult = (e) => {
        text = Array.from(e.results).map((r) => r[0].transcript).join(' ').replace(/\s+/g, ' ').trim();
        const l = $('#mic-live'); if (l) l.textContent = text ? `“${text}”` : '';
      };
      rec.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { micDenied = true; setStatus('Mikrofon izni yok. Aşağıdaki kutuya dokun, klavyedeki 🎤 ile söyle.'); }
        else if (e.error === 'no-speech') setStatus('Ses duyamadım. Tekrar dokun.');
        else if (e.error !== 'aborted') setStatus('Olmadı. Tekrar dokun ya da yaz.');
      };
      rec.onend = () => {
        clearTimeout(recTimer);
        listening = false;
        const b = $('#big-mic'); if (b) b.classList.remove('on');
        if (rec === me) rec = null;
        if (me._aborted) return;
        if (text) handleText(text);
        else if ($('#mic-status') && $('#mic-status').textContent === 'Dinliyorum…') setStatus(idleText());
      };
      rec.start();
      listening = true;
      $('#big-mic').classList.add('on');
      setStatus('Dinliyorum…');
      $('#mic-live').textContent = '';
      recTimer = setTimeout(() => { try { me.stop(); } catch (e) { /* */ } }, 15000);
    } catch (e) {
      micDenied = true; listening = false;
      setStatus('Aşağıdaki kutuya dokun, klavyedeki 🎤 ile söyle.');
    }
  }
  function stopListen(byUser) {
    if (rec) {
      try { if (byUser) rec.stop(); else { rec._aborted = true; rec.abort(); } } catch (e) { /* */ }
    }
    if (!byUser) { listening = false; rec = null; }
  }

  function reSay() {
    const area = $('#mic-area');
    if (!area) return openMic(true);
    area.innerHTML = micBodyHTML();
    wireMic();
    startListen();
  }

  function handleText(text) {
    const r = N.parse(text, { now: new Date(), customers: db.customers, appts: db.appts });
    showResult(r);
  }

  const resBtns = (okLabel, okId = 'r-ok') => `<div class="sheet-btns">${okLabel ? `<button class="btn-red big" id="${okId}">${I.check} ${okLabel}</button>` : ''}<button class="btn-ghost" data-action="re-say">${I.mic} Yeniden söyle</button></div>`;
  const heardHTML = (t) => `<div class="heard">“${esc(t)}”</div>`;
  function chooser(area, r, title, ids, onPick, allowNew) {
    area.innerHTML = heardHTML(r.text) + `<div class="rcard"><div class="r-title">${I.help} ${esc(title)}</div><div class="chips" style="margin-top:10px">
      ${ids.map((id) => `<button class="chip" data-pick="${id}">${esc(custName(id))}</button>`).join('')}
      ${allowNew ? `<button class="chip ghost" data-pick="new">${I.plus} Yeni: ${esc(allowNew)}</button>` : ''}</div></div>` + resBtns(null);
    $$('[data-pick]', area).forEach((b) => b.onclick = () => onPick(b.dataset.pick));
  }
  function message(area, r, title, body, okLabel, okFn) {
    area.innerHTML = heardHTML(r.text) + `<div class="rcard"><div class="r-title">${I.help} ${esc(title)}</div><p class="r-text">${body}</p></div>` +
      `<div class="sheet-btns">${okLabel ? `<button class="btn-navy big" id="r-ok">${esc(okLabel)}</button>` : ''}<button class="btn-ghost" data-action="re-say">${I.mic} Yeniden söyle</button></div>`;
    if (okLabel) $('#r-ok', area).onclick = okFn || (() => closeSheet());
  }

  function showResult(r) {
    const area = $('#mic-area');
    if (!area) return;
    const sheet = area.closest('.sheet'); if (sheet) sheet.scrollTop = 0;
    if (r.intent === 'create') return showCreate(area, r);
    if (r.intent === 'move') return showMove(area, r);
    if (r.intent === 'cancel' || r.intent === 'noshow') return showCancel(area, r);
    if (r.intent === 'note') return showNote(area, r);
    if (r.intent === 'query') return showQuery(area, r);
    message(area, r, 'Tam anlayamadım', 'Şöyle söyleyebilirsin: <i>“Yarın 3’te Ahmet saç sakal”</i>, <i>“Ahmet’i 5’e al”</i> ya da <i>“Yarın kimler var?”</i>', 'Elle yaz', () => openAdd({ date: ui.day }));
  }

  function showCreate(area, r) {
    const fs = {
      mode: 'voice', id: null, customerId: r.customerId, name: r.customerId ? custName(r.customerId) : (r.name || ''),
      phone: '', date: r.date, time: r.time || '', service: r.service && r.service !== 'default' ? r.service : db.settings.defaultService,
      candidates: r.candidates || [], ambiguous: !!r.ambiguous, picked: false, heard: r.text,
    };
    fs.compact = !!(fs.time && fs.name && !fs.candidates.length);
    area.innerHTML = apptFormHTML(fs);
    mountForm(fs, area);
    if (!fs.time) { const e = $('#f-err', area); e.textContent = 'Saati duyamadım, aşağıdan seç.'; e.hidden = false; }
  }

  function showMove(area, r) {
    const a = getA(r.apptId);
    if (!a) return message(area, r, 'Randevu bulunamadı', 'Taşınacak randevuyu bulamadım.');
    const c = cust(a.customerId);
    const conf = conflicts(r.date, r.time, durOf(a), a.id);
    area.innerHTML = heardHTML(r.text) + `<div class="rcard"><div class="r-title">${I.clock} Randevuyu taşı</div>
      <div class="r-name">${esc(c.name)}</div>
      <div class="move"><span class="from">${esc(dayLabel(a.date))} ${a.time}</span>${I.right}<span class="to">${esc(dayLabel(r.date))} ${r.time}</span></div>
      ${conf.length ? `<div class="warn">Bu saatte <b>${esc(custName(conf[0].customerId))}</b> var (${conf[0].time}). Yine de taşıyabilirsin.</div>` : ''}</div>` + resBtns('Tamam, taşı');
    $('#r-ok', area).onclick = () => {
      snapshot(); a.date = r.date; a.time = r.time; save(); closeSheet();
      if (ui.view === 'day') ui.day = r.date;
      render(); toast(`Taşındı: ${dayLabel(r.date)} ${r.time}`, { label: 'Geri al', fn: undo });
    };
  }

  function showCancel(area, r) {
    const ns = r.intent === 'noshow';
    if (!r.customerId) {
      if (r.candidates && r.candidates.length) {
        return chooser(area, r, 'Hangisi?', r.candidates, (id) => {
          const list = N.upcomingFor(id, db.appts, new Date(), ns ? todayStr() : r.date);
          showCancel(area, Object.assign({}, r, { customerId: id, candidates: [], apptId: list.length ? (ns ? list[list.length - 1].id : list[0].id) : null }));
        });
      }
      return message(area, r, 'Müşteri bulunamadı', r.name ? `“${esc(r.name)}” adında kayıtlı bir müşteri bulamadım.` : 'Kimin randevusu olduğunu anlayamadım.');
    }
    const a = r.apptId ? getA(r.apptId) : null;
    const c = cust(r.customerId);
    if (!a) return message(area, r, 'Randevu bulunamadı', `${esc(c.name)} için ${ns ? 'bugün' : 'yaklaşan'} bir randevu yok.`, 'Müşteri kartını aç', () => { closeSheet(); ui.view = 'customer'; ui.cid = c.id; render(); scrollTop(); });
    area.innerHTML = heardHTML(r.text) + `<div class="rcard"><div class="r-title">${ns ? I.x + ' Gelmedi olarak işaretle' : I.trash + ' Randevuyu iptal et'}</div>
      <div class="r-name">${esc(c.name)}</div><p class="r-text">${esc(dayLabel(a.date))} · ${a.time} · ${esc(svc(a.service).name)}</p></div>` + resBtns(ns ? 'Evet, gelmedi' : 'Evet, iptal et');
    $('#r-ok', area).onclick = () => {
      snapshot();
      if (ns) a.status = 'noshow'; else db.appts = db.appts.filter((x) => x.id !== a.id);
      save(); closeSheet(); render();
      toast(ns ? 'Gelmedi olarak işaretlendi' : 'Randevu iptal edildi', { label: 'Geri al', fn: undo });
    };
  }

  function showNote(area, r) {
    if (!r.note) return message(area, r, 'Notu duyamadım', 'Şöyle söyle: <i>“Ahmet’e not al: kenarlar 2 numara”</i>');
    if (!r.customerId) {
      if (r.candidates && r.candidates.length) {
        return chooser(area, r, 'Kimin notu?', r.candidates, (id) => {
          if (id === 'new') return showNote(area, Object.assign({}, r, { candidates: [], newOk: true }));
          showNote(area, Object.assign({}, r, { customerId: id, candidates: [] }));
        }, r.name);
      }
      if (!r.name) return message(area, r, 'Kimin notu?', 'Müşterinin adını anlayamadım. Şöyle söyle: <i>“Ahmet’e not al: kenarlar 2 numara”</i>');
      area.innerHTML = heardHTML(r.text) + `<div class="rcard"><div class="r-title">${I.user} Yeni müşteri</div><div class="r-name">${esc(r.name)}</div>
        <p class="r-text">Kayıtlı değil. Yeni müşteri olarak ekleyip notu kaydedeyim mi?</p><div class="quote"><small>NASIL KESTİRİR</small>${esc(r.note)}</div></div>` + resBtns('Ekle ve kaydet');
      $('#r-ok', area).onclick = () => {
        snapshot();
        const c = { id: uid(), name: N.titleCase(r.name), phone: '', note: r.note, createdAt: Date.now() };
        db.customers.push(c); save(); closeSheet(); toast('Müşteri eklendi, not kaydedildi', { label: 'Geri al', fn: undo });
        ui.view = 'customer'; ui.cid = c.id; render(); scrollTop();
      };
      return;
    }
    const c = cust(r.customerId);
    area.innerHTML = heardHTML(r.text) + `<div class="rcard"><div class="r-title">${I.scissors} Not · nasıl kestirir</div><div class="r-name">${esc(c.name)}</div>
      ${c.note ? `<div class="quote" style="background:#fff;border-color:var(--line)"><small style="color:var(--muted)">ŞU ANKİ NOT</small>${esc(c.note).replace(/\n/g, '<br>')}</div>` : ''}
      <div class="quote"><small>${c.note ? 'EKLENECEK' : 'NOT'}</small>${esc(r.note)}</div></div>
      <div class="sheet-btns"><button class="btn-red big" id="r-ok">${I.check} ${c.note ? 'Notun sonuna ekle' : 'Notu kaydet'}</button>
      ${c.note ? `<button class="btn-ghost" id="r-rep">Eski notu sil, bunu yaz</button>` : ''}
      <button class="btn-ghost" data-action="re-say">${I.mic} Yeniden söyle</button></div>`;
    const done = (txt) => { snapshot(); c.note = txt; save(); closeSheet(); render(); toast('Not kaydedildi', { label: 'Geri al', fn: undo }); };
    $('#r-ok', area).onclick = () => done(c.note ? c.note + '\n' + r.note : r.note);
    const rep = $('#r-rep', area); if (rep) rep.onclick = () => done(r.note);
  }

  function showQuery(area, r) {
    if ((r.kind === 'customer' || r.kind === 'last') && !r.customerId && r.candidates && r.candidates.length) {
      return chooser(area, r, 'Hangisi?', r.candidates, (id) => showQuery(area, Object.assign({}, r, { customerId: id, candidates: [] })));
    }
    if (r.kind === 'customer' || r.kind === 'last') {
      if (!r.customerId) return message(area, r, 'Müşteri bulunamadı', r.name ? `“${esc(r.name)}” adında kayıtlı bir müşteri yok.` : 'Kimi sorduğunu anlayamadım.');
      const c = cust(r.customerId), s = statsMap()[c.id] || {};
      const lines = [];
      lines.push(s.next ? `Sıradaki randevusu: <b>${esc(dayLabel(s.next.date))} ${s.next.time}</b> (${esc(svc(s.next.service).name)}).` : 'Yaklaşan randevusu yok.');
      lines.push(s.last ? `En son <b>${relDays(s.last)}</b> geldi (${esc(dateShort(s.last))}).` : 'Henüz hiç gelmedi.');
      if (s.interval) lines.push(`Genelde ${intervalText(s.interval)} geliyor.`);
      if (r.kind === 'last') lines.push(lines.shift());
      return message(area, r, 'Cevap', `<b>${esc(c.name)}</b><br>${lines.join('<br>')}`, 'Müşteri kartını aç', () => { closeSheet(); ui.view = 'customer'; ui.cid = c.id; render(); scrollTop(); });
    }
    const d = r.date, label = dayLabel(d);
    const goDay = () => { closeSheet(); ui.view = 'day'; ui.day = d; render(); scrollTop(); };
    if (r.kind === 'free') {
      const gaps = freeGaps(d);
      const body = gaps.length
        ? `${esc(label)} boş aralıklar:<div class="ans-list">${gaps.map((g) => `<div class="ans-row"><b>${fromMin(g[0])}</b><span>– ${fromMin(g[1])}</span><span class="muted">${durText(g[1] - g[0])}</span></div>`).join('')}</div>`
        : `${esc(label)} boş yer görünmüyor.`;
      return message(area, r, 'Boş saatler', body, 'Güne git', goDay);
    }
    if (r.kind === 'week') {
      const t = todayStr(), wd = parseYmd(t).getDay(), mon = addDays(t, -((wd + 6) % 7)), sun = addDays(mon, 6);
      const n = db.appts.filter((a) => a.date >= mon && a.date <= sun && a.status !== 'cancelled').length;
      return message(area, r, 'Bu hafta', `Bu hafta toplam <b>${n}</b> randevu var.`, 'Tamam');
    }
    const list = apptsOn(d);
    const body = list.length
      ? `${esc(label)} <b>${list.length}</b> randevu var:<div class="ans-list">${list.map((a) => `<div class="ans-row"><b>${a.time}</b><span>${esc(custName(a.customerId))}</span><span class="tag">${esc(svc(a.service).name)}</span></div>`).join('')}</div>`
      : `${esc(label)} randevu yok.`;
    message(area, r, 'Program', body, 'Güne git', goDay);
  }

  /* ================= AYARLAR & YEDEK ================= */
  function openSettings() {
    const s = db.settings;
    openSheet(`<div class="sheet-head"><h2>Ayarlar</h2><button class="x" data-close aria-label="Kapat">${I.x}</button></div>
      <h3 class="sec" style="margin-left:2px">Çalışma saatleri</h3>
      <div class="card form-card">
        <div class="kv"><span>Başlangıç</span><input type="time" id="s-start" value="${s.start}" class="field"></div>
        <div class="kv"><span>Bitiş (yaklaşık)</span><input type="time" id="s-end" value="${s.end}" class="field"></div>
        <div class="lbl">Çalıştığı günler</div>
        <div class="chips" id="s-days">${[1, 2, 3, 4, 5, 6, 0].map((d) => `<button class="chip ${s.workDays.includes(d) ? 'sel' : ''}" data-d="${d}">${DAY_S[d]}</button>`).join('')}</div>
      </div>
      <h3 class="sec" style="margin-left:2px">İşlem süreleri</h3>
      <div class="card form-card">
        ${Object.entries(s.services).map(([id, v]) => `<div class="kv"><span>${esc(v.name)}</span><div class="stepper" data-id="${id}"><button data-step="-5" aria-label="Azalt">−</button><b>${v.dur} dk</b><button data-step="5" aria-label="Artır">+</button></div></div>`).join('')}
        <div class="lbl">Sesle söylerken işlem belirtilmezse</div>
        <div class="chips" id="s-def">${Object.entries(s.services).map(([id, v]) => `<button class="chip ${s.defaultService === id ? 'sel' : ''}" data-id="${id}">${esc(v.name)}</button>`).join('')}</div>
      </div>
      <h3 class="sec" style="margin-left:2px">WhatsApp mesajları</h3>
      <div class="card form-card"><p class="hint" style="margin-top:10px">{ad}, {gün} ve {saat} kendiliğinden doldurulur.</p>
        <label class="lbl" for="s-m1">Hatırlatma</label><textarea id="s-m1" rows="3">${esc(s.msgRemind)}</textarea>
        <label class="lbl" for="s-m2">Randevu bildirimi</label><textarea id="s-m2" rows="3">${esc(s.msgConfirm)}</textarea>
        <label class="lbl" for="s-m3">Epeydir gelmeyene</label><textarea id="s-m3" rows="3">${esc(s.msgMiss)}</textarea>
      </div>
      <h3 class="sec" style="margin-left:2px">Yedek</h3>
      <div class="card form-card"><p class="hint" style="margin-top:10px">Kayıtlar sadece bu telefonda durur. Haftada bir yedek al, WhatsApp’tan kendine ya da iCloud’a (Dosyalar) gönder. ${s.lastBackup ? 'Son yedek: ' + relDays(ymd(new Date(s.lastBackup))) + '.' : 'Henüz yedek alınmadı.'}</p>
        <button class="btn-navy full" data-action="backup">${I.download} Yedek al</button>
        <label class="btn-ghost full file-btn">${I.upload} Yedeği geri yükle<input type="file" id="s-restore" accept=".json,application/json"></label>
      </div>
      <h3 class="sec" style="margin-left:2px">Diğer</h3>
      <div class="card form-card">
        <button class="btn-ghost full" data-action="install-help">${I.share} Ana ekrana nasıl eklenir?</button>
        <button class="btn-ghost full" data-action="show-welcome">${I.heart} Karşılama ekranını göster</button>
        <button class="btn-danger-text" data-action="wipe">${I.trash} Tüm kayıtları sil</button>
      </div>
      <p class="footer-note">Osman’dan Sezgin abiye ♥</p>`, {
      onMount: (sh) => {
        $('#s-start', sh).onchange = (e) => { if (e.target.value) { s.start = e.target.value.slice(0, 5); save(); render(); } };
        $('#s-end', sh).onchange = (e) => { if (e.target.value) { s.end = e.target.value.slice(0, 5); save(); render(); } };
        $$('#s-days [data-d]', sh).forEach((b) => b.onclick = () => {
          const d = +b.dataset.d;
          s.workDays = s.workDays.includes(d) ? s.workDays.filter((x) => x !== d) : s.workDays.concat(d);
          b.classList.toggle('sel'); save(); render();
        });
        $$('.stepper', sh).forEach((st) => $$('button', st).forEach((b) => b.onclick = () => {
          const v = s.services[st.dataset.id];
          v.dur = Math.min(180, Math.max(5, v.dur + (+b.dataset.step)));
          $('b', st).textContent = v.dur + ' dk'; save(); render();
        }));
        $$('#s-def [data-id]', sh).forEach((b) => b.onclick = () => {
          s.defaultService = b.dataset.id;
          $$('#s-def .chip', sh).forEach((x) => x.classList.toggle('sel', x === b)); save();
        });
        const bindTA = (id, key) => { $(id, sh).oninput = (e) => { s[key] = e.target.value; save(); }; };
        bindTA('#s-m1', 'msgRemind'); bindTA('#s-m2', 'msgConfirm'); bindTA('#s-m3', 'msgMiss');
        $('#s-restore', sh).onchange = (e) => { const f = e.target.files && e.target.files[0]; if (f) restore(f); e.target.value = ''; };
      },
    });
  }

  async function backup() {
    const data = JSON.stringify(Object.assign({ app: 'sezgin-usta', exportedAt: new Date().toISOString() }, db));
    const name = `sezgin-usta-yedek-${todayStr()}.json`;
    try {
      const file = new File([data], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Sezgin Usta yedeği' });
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a'); a.href = url; a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
      db.settings.lastBackup = Date.now(); save(); render();
      toast('Yedek hazır');
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      toast('Yedek alınamadı, tekrar dene');
    }
  }
  function restore(file) {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const d = JSON.parse(rd.result);
        if (!d || !Array.isArray(d.customers) || !Array.isArray(d.appts)) throw new Error('bad');
        if (!confirm(`Yedekte ${d.customers.length} müşteri ve ${d.appts.length} randevu var. Şu anki kayıtların yerine geçsin mi?`)) return;
        snapshot();
        db = migrate(d); db.settings.welcomed = true; save(); closeSheet(); render();
        toast('Yedek geri yüklendi', { label: 'Geri al', fn: undo });
      } catch (e) { toast('Bu dosya bir yedek gibi görünmüyor'); }
    };
    rd.readAsText(file);
  }
  function wipe() {
    if (!confirm('Tüm müşteriler ve randevular silinecek. Emin misin?')) return;
    if (!confirm('Son kez soruyorum: her şey silinsin mi? (Yedeğin varsa sonra geri yükleyebilirsin.)')) return;
    const keep = db.settings;
    db = defaults(); db.settings = Object.assign(db.settings, keep, { lastBackup: null }); db.customers = [];
    undoSnap = null; save(); closeSheet(); ui.view = 'day'; ui.day = todayStr(); render(); toast('Tüm kayıtlar silindi');
  }

  /* ================= KARŞILAMA & KURULUM ================= */
  const isStandalone = () => window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  const isMobile = () => window.matchMedia('(pointer: coarse)').matches || /iPhone|iPad|Android/i.test(navigator.userAgent);
  let installDismissed = false;
  try { installDismissed = sessionStorage.getItem('ib-x') === '1'; } catch (e) { /* */ }

  function renderInstallBar() {
    const el = $('#install-bar');
    const show = isMobile() && !isStandalone() && db.settings.welcomed && !installDismissed && !sheetOpen();
    document.body.classList.toggle('has-ibar', show);
    el.innerHTML = show ? `<div class="ibar"><button class="go" data-action="install-help">${I.share}<span><b>Ana ekrana ekle</b> · uygulama gibi açılsın</span></button><button class="xx" data-action="dismiss-install" aria-label="Kapat">${I.x}</button></div>` : '';
  }
  function openInstallHelp() {
    openSheet(`<div class="sheet-head"><h2>Ana ekrana ekle</h2><button class="x" data-close aria-label="Kapat">${I.x}</button></div>
      <p class="sub big">Böylece normal bir uygulama gibi ikonundan açılır, internet olmasa da çalışır.</p>
      <ol class="steps">
        <li><span class="num">1</span><div>Safari’de alttaki <b>Paylaş</b> düğmesine dokun <span class="ico">${I.share}</span></div></li>
        <li><span class="num">2</span><div>Listeyi kaydırıp <b>Ana Ekrana Ekle</b>’yi seç</div></li>
        <li><span class="num">3</span><div>Sağ üstteki <b>Ekle</b>’ye dokun. Ana ekranda <b>Sezgin Usta</b> belirir.</div></li>
      </ol>
      <p class="hint">Paylaş düğmesini göremiyorsan önce linki <b>Safari’de</b> aç. Bundan sonra hep ana ekrandaki ikondan aç: Safari’deki sayfa ile ikondaki uygulamanın kayıtları ayrı tutulur.</p>
      <button class="btn-navy big" data-close>Anladım</button>`);
  }
  function showWelcome() {
    const w = $('#welcome');
    w.innerHTML = `<div class="wl-inner">
      <div class="wl-pole" aria-hidden="true"><span></span></div>
      <p class="wl-hi">Sezgin abi,</p>
      <p class="wl-msg">yıllardır emeğin için teşekkürler.<br>Hayırlı olsun!</p>
      <p class="wl-sign">– Osman</p>
      <div class="wl-feats">
        <div>${I.mic}<span>Mikrofona bas, söyle: randevu kendiliğinden yazılsın</span></div>
        <div>${I.scissors}<span>Her müşterinin nasıl kestirdiği not olarak dursun</span></div>
        <div>${I.wa}<span>Tek dokunuşla WhatsApp’tan hatırlat</span></div>
      </div>
      <button class="btn-red big" id="wl-go">Başlayalım</button></div>`;
    w.classList.add('show');
    $('#wl-go').onclick = () => {
      db.settings.welcomed = true; save();
      w.classList.remove('show'); w.innerHTML = '';
      render();
      if (isMobile() && !isStandalone()) openInstallHelp();
    };
  }

  /* ================= OLAYLAR ================= */
  const ACTIONS = {
    'go-day': () => { closeSheet(); ui.view = 'day'; render(); scrollTop(); },
    'go-customers': () => { closeSheet(); ui.view = 'customers'; render(); scrollTop(); },
    'mic': () => openMic(true),
    'settings': () => openSettings(),
    'week': (el) => { ui.day = addDays(ui.day, +el.dataset.n); render(); },
    'pick-day': (el) => { ui.day = el.dataset.date; render(); },
    'add': (el) => openAdd({ date: el.dataset.date || (ui.view === 'day' ? ui.day : todayStr()), time: el.dataset.time || '', customerId: el.dataset.cid || null }),
    'open-appt': (el) => openAppt(el.dataset.id),
    'open-customer': (el) => { closeSheet(); ui.view = 'customer'; ui.cid = el.dataset.id; render(); scrollTop(); },
    'wa-remind': (el) => { const a = getA(el.dataset.id); if (!a) return; const c = cust(a.customerId); openWA(c && c.phone, fill(db.settings.msgRemind, a, c)); },
    'wa-confirm': (el) => { const a = getA(el.dataset.id); if (!a) return; const c = cust(a.customerId); openWA(c && c.phone, fill(db.settings.msgConfirm, a, c)); },
    'wa-miss': (el) => { const c = cust(el.dataset.id); if (c) openWA(c.phone, fill(db.settings.msgMiss, null, c)); },
    'wa-hello': (el) => {
      const c = cust(el.dataset.id); if (!c) return;
      const s = statsMap()[c.id] || {};
      const late = overdueList().some((x) => x.c.id === c.id);
      openWA(c.phone, s.next ? fill(db.settings.msgRemind, s.next, c) : late ? fill(db.settings.msgMiss, null, c) : `Merhaba ${firstName(c.name)}, `);
    },
    'edit-appt': (el) => openAdd({ id: el.dataset.id }),
    'toggle-noshow': (el) => {
      const a = getA(el.dataset.id); if (!a) return;
      snapshot(); a.status = a.status === 'noshow' ? 'planned' : 'noshow'; save(); closeSheet(); render();
      toast(a.status === 'noshow' ? 'Gelmedi olarak işaretlendi' : 'Geldi olarak işaretlendi', { label: 'Geri al', fn: undo });
    },
    'delete-appt': (el) => {
      snapshot(); db.appts = db.appts.filter((x) => x.id !== el.dataset.id); save(); closeSheet(); render();
      toast('Randevu silindi', { label: 'Geri al', fn: undo });
    },
    'new-customer': () => openCustomerEdit(null),
    'edit-customer': (el) => openCustomerEdit(el.dataset.id),
    'edit-note': (el) => editNote(el.dataset.id),
    're-say': () => reSay(),
    'backup': () => backup(),
    'install-help': () => openInstallHelp(),
    'dismiss-install': () => { installDismissed = true; try { sessionStorage.setItem('ib-x', '1'); } catch (e) { /* */ } renderInstallBar(); },
    'show-welcome': () => { closeSheet(true); showWelcome(); },
    'wipe': () => wipe(),
  };

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { closeSheet(); setTimeout(renderInstallBar, 300); return; }
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = ACTIONS[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheetOpen()) closeSheet();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.appt[data-action]')) { e.preventDefault(); openAppt(e.target.dataset.id); }
  });

  // klavye açılınca alttaki sayfayı yukarı it
  if (window.visualViewport) {
    const vv = window.visualViewport;
    const upd = () => { const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); document.documentElement.style.setProperty('--kb', (kb > 60 ? kb : 0) + 'px'); };
    vv.addEventListener('resize', upd); vv.addEventListener('scroll', upd);
  }
  // dakikada bir "şimdi" ve geçen randevuları güncelle
  let lastDay = todayStr();
  setInterval(() => {
    if (document.hidden || sheetOpen()) return;
    if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    statsCache = null;
    if (todayStr() !== lastDay) { if (ui.day === lastDay) ui.day = todayStr(); lastDay = todayStr(); }
    render();
  }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !sheetOpen()) { statsCache = null; if (todayStr() !== lastDay) { ui.day = todayStr(); lastDay = todayStr(); } render(); } });

  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('./sw.js').catch(() => {});
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  save();
  render();
  if (!db.settings.welcomed) showWelcome();

  window.__sezgin = { get db() { return db; }, render, handleText, openMic };
})();
