/* Sezgin Usta – Türkçe sesli komut çözücü
   İnternet ya da yapay zeka servisi gerektirmez; tamamen telefonda çalışır. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NLU = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- yardımcılar ---------- */
  const trLower = (s) => (s || '').toLocaleLowerCase('tr-TR');
  const upFirst = (w) => (w ? w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1) : w);
  const titleCase = (s) => (s || '').split(/\s+/).filter(Boolean).map((w) => upFirst(trLower(w))).join(' ');
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const hm = (h, m) => `${pad(h)}:${pad(m)}`;
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

  const NUM_STEMS = [
    ['yirmi', 20], ['otuz', 30], ['kırk', 40], ['elli', 50],
    ['sekiz', 8], ['dokuz', 9], ['dört', 4], ['dörd', 4], ['altı', 6], ['yedi', 7],
    ['sıfır', 0], ['iki', 2], ['bir', 1], ['beş', 5], ['üç', 3], ['on', 10],
  ];
  const NUM_SUFFIX = new Set(['', 'de', 'da', 'te', 'ta', 'e', 'a', 'ye', 'ya', 'i', 'ı', 'u', 'ü',
    'yi', 'yı', 'yu', 'yü', 'den', 'dan', 'ten', 'tan', 'in', 'ın', 'un', 'ün', 'le', 'la', 'yle', 'yla']);
  const NOT_NUMBERS = new Set(['onu', 'onun', 'ondan', 'onla', 'onlar', 'biri', 'birin', 'birini', 'bire bir']);
  const DATE_SUFFIX = /^(inci|ıncı|uncu|üncü|nci|ncı|ncu|ncü|inde|ında|unda|ünde|nde|nda|si|sı|su|sü|sinde|sında|sunda|sünde|ine|ına|une|üne)$/;
  const TIME_SUFFIX = new Set(['de', 'da', 'te', 'ta', 'e', 'a', 'ye', 'ya']);
  const CASE_SUFFIX = new Set(['e', 'a', 'ye', 'ya', 'i', 'ı', 'u', 'ü', 'yi', 'yı', 'yu', 'yü', 'in', 'ın', 'un', 'ün',
    'nin', 'nın', 'nun', 'nün', 'de', 'da', 'te', 'ta', 'le', 'la', 'yle', 'yla', 'den', 'dan', 'ten', 'tan',
    'inin', 'ının', 'unun', 'ünün', 'ini', 'ını', 'unu', 'ünü', 'ine', 'ına', 'une', 'üne']);

  const DAY_NAMES = [ // en uzundan kısaya: "cumartesi" "cuma"dan önce denenmeli
    ['cumartesi', 6], ['pazartesi', 1], ['çarşamba', 3], ['perşembe', 4], ['salı', 2], ['cuma', 5], ['pazar', 0],
  ];
  const MONTHS = ['ocak', 'şubat', 'mart', 'nisan', 'mayıs', 'haziran', 'temmuz', 'ağustos', 'eylül', 'ekim', 'kasım', 'aralık'];

  const STOP = new Set(('saat randevu randevusu randevusunu randevuyu randevum randevumu randevuları randevular randevusuna ' +
    'için icin ver verelim yaz yazar yazın yazalım ekle kaydet koy koyalım ayarla oluştur olsun olacak gelecek geliyor gelsin ' +
    've ile de da abi abiye abiyi abinin abim abimi abime bey beye beyi beyin hocam hoca usta ustam kardeş kardeşim lütfen ' +
    'bir bi tane gün günü tamam şey ee eee hmm bu şu o ona müşteri yeni kişi adam adlı isimli diye lazım al alalım aldım ' +
    'et edelim bana benim bize sonra önce olarak kesim kesimi geçe kala var yok mı mi mu mü dakika dk lira tl neler kimler ' +
    'kim kaç ne zaman hangi iptal sil ertele not notu notuna kaydır taşı değiştir randevulu sıra sırası sıraya yer yeri ' +
    'en son geldi gelmiş gelir boş boşum boşluk boşta muyum müyüm miyim mıyım misin musun program programım randevularım kimse hiç')
    .split(/\s+/));

  /* ---------- sözcüklere ayırma ---------- */
  function tokenize(text) {
    let s = String(text || '')
      .replace(/[’‘`´]/g, "'")
      .replace(/[,;!?"“”()\[\]]/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\.(?!\d)/g, ' ')
      .replace(/:(?!\d)/g, ' ');
    const raw = s.split(/\s+/).filter(Boolean);
    const toks = raw.map((o) => {
      const w = trLower(o);
      const t = { o, w, n: null, mm: null, s: '' };
      let m = w.match(/^(\d{1,2})[:.](\d{2})'?([a-zçğıöşü]*)$/);
      if (m) { t.n = +m[1]; t.mm = +m[2]; t.s = m[3]; return t; }
      m = w.match(/^(\d{1,4})'?([a-zçğıöşü]*)$/);
      if (m && (NUM_SUFFIX.has(m[2]) || DATE_SUFFIX.test(m[2]))) { t.n = +m[1]; t.s = m[2]; return t; }
      if (!NOT_NUMBERS.has(w)) {
        const plain = w.replace(/'/g, '');
        for (const [stem, val] of NUM_STEMS) {
          if (plain.startsWith(stem) && NUM_SUFFIX.has(plain.slice(stem.length))) {
            t.n = val; t.s = plain.slice(stem.length); t.word = true; break;
          }
        }
      }
      return t;
    });
    // "on bir", "kırk beş" gibi birleşik sayılar
    const out = [];
    for (let i = 0; i < toks.length; i++) {
      const a = toks[i], b = toks[i + 1];
      if (a.word && [10, 20, 30, 40, 50].includes(a.n) && a.s === '' && b && b.word && b.n >= 1 && b.n <= 9) {
        out.push({ o: a.o + ' ' + b.o, w: a.w + ' ' + b.w, n: a.n + b.n, mm: null, s: b.s, word: true });
        i++;
      } else out.push(a);
    }
    return out;
  }

  /* ---------- gün ---------- */
  function extractDay(toks, used, now) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let date = null, nextWeek = false;
    for (let i = 0; i < toks.length; i++) {
      if (used[i]) continue;
      const w = toks[i].w, nx = toks[i + 1] ? toks[i + 1].w : '';
      if (w === 'haftaya' || w === 'gelecek' && nx.startsWith('hafta') || w === 'önümüzdeki' && nx.startsWith('hafta')) {
        nextWeek = true; used[i] = true; if (w !== 'haftaya') used[i + 1] = true; continue;
      }
      if (date) continue;
      if (w.startsWith('bugün')) { date = today; used[i] = true; continue; }
      if (w === 'bu' && nx.startsWith('gün')) { date = today; used[i] = used[i + 1] = true; continue; }
      if (w.startsWith('yarından') && nx === 'sonra') { date = addDays(today, 2); used[i] = used[i + 1] = true; continue; }
      if (w.startsWith('öbürgün') || w.startsWith('öbür gün')) { date = addDays(today, 2); used[i] = true; continue; }
      if ((w === 'öbür' || w === 'ertesi') && nx.startsWith('gün')) { date = addDays(today, 2); used[i] = used[i + 1] = true; continue; }
      if (w.startsWith('yarın')) { date = addDays(today, 1); used[i] = true; continue; }
      for (const [name, idx] of DAY_NAMES) {
        if (w.startsWith(name) && w.length - name.length <= 4) {
          let diff = (idx - today.getDay() + 7) % 7;
          if (diff === 0) diff = 7;
          date = addDays(today, diff);
          date._weekday = idx;
          used[i] = true;
          if (nx.startsWith('gün')) used[i + 1] = true;
          break;
        }
      }
      if (date) continue;
      // "kasımın 25'i", "aralık 3'te"
      const mFirst = MONTHS.findIndex((m) => w.startsWith(m) && w.length - m.length <= 4);
      const nt = toks[i + 1];
      if (mFirst >= 0 && nt && nt.n != null && nt.mm == null && nt.n >= 1 && nt.n <= 31) {
        let d = new Date(today.getFullYear(), mFirst, nt.n);
        if (d < today) d = new Date(today.getFullYear() + 1, mFirst, nt.n);
        date = d; used[i] = used[i + 1] = true; continue;
      }
      // "25 kasım", "3 aralıkta"
      const t = toks[i];
      if (t.n != null && t.mm == null && t.n >= 1 && t.n <= 31 && nx) {
        const mi = MONTHS.findIndex((m) => nx.startsWith(m));
        if (mi >= 0) {
          let d = new Date(today.getFullYear(), mi, t.n);
          if (d < today) d = new Date(today.getFullYear() + 1, mi, t.n);
          date = d; used[i] = used[i + 1] = true; continue;
        }
        // "3 gün sonra"
        if (nx.startsWith('gün') && toks[i + 2] && toks[i + 2].w === 'sonra') {
          date = addDays(today, t.n); used[i] = used[i + 1] = used[i + 2] = true; continue;
        }
      }
      // "ayın 25'i"
      if (w === 'ayın' && toks[i + 1] && toks[i + 1].n != null) {
        const n = toks[i + 1].n;
        let d = new Date(today.getFullYear(), today.getMonth(), n);
        if (d < today) d = new Date(today.getFullYear(), today.getMonth() + 1, n);
        date = d; used[i] = used[i + 1] = true; continue;
      }
    }
    if (nextWeek) {
      if (date && date._weekday != null) {
        const mondayNext = addDays(today, ((8 - today.getDay()) % 7) || 7);
        date = addDays(mondayNext, (date._weekday + 6) % 7);
      } else if (!date) date = addDays(today, 7);
    }
    return date;
  }

  /* ---------- saat ---------- */
  function extractTime(toks, used) {
    let am = false, pm = false, noon = false;
    for (let i = 0; i < toks.length; i++) {
      if (used[i]) continue;
      const w = toks[i].w, nx = toks[i + 1] ? toks[i + 1].w : '';
      if (w === 'sabah' || w === 'sabahleyin') { am = true; used[i] = true; }
      else if ((w === 'öğleden' || w === 'öğlenden') && nx === 'sonra') { pm = true; used[i] = used[i + 1] = true; }
      else if (w.startsWith('akşam') || w === 'ikindi' || w === 'gece' || w === 'öğleden sonra') { pm = true; used[i] = true; }
      else if (w === 'öğlen' || w === 'öğle' || w === 'öğleyin' || w === 'öğlende' || w === 'öğleye') { noon = true; used[i] = true; }
    }
    let h = null, m = 0;
    for (let i = 0; i < toks.length && h == null; i++) {
      if (used[i]) continue;
      const t = toks[i], n1 = toks[i + 1], n2 = toks[i + 2];
      const prevSaat = i > 0 && toks[i - 1].w === 'saat';
      if (t.w.startsWith('yarım') && (prevSaat || /da$|a$/.test(t.w))) {
        h = 12; m = 30; used[i] = true; if (prevSaat) used[i - 1] = true; break;
      }
      if (t.n == null || t.n > 23) continue;
      if (t.mm != null) { h = t.n; m = t.mm; used[i] = true; }
      else if (n1 && n1.w.startsWith('buçu')) { h = t.n; m = 30; used[i] = used[i + 1] = true; }
      else if (n1 && n1.w === 'çeyrek' && n2 && n2.w.startsWith('geçe')) { h = t.n; m = 15; used[i] = used[i + 1] = used[i + 2] = true; }
      else if (n1 && n1.w === 'çeyrek' && n2 && (n2.w === 'var' || n2.w.startsWith('kala'))) { h = t.n - 1; m = 45; used[i] = used[i + 1] = used[i + 2] = true; }
      else if (n1 && n1.n != null && n1.n < 60 && n2 && n2.w.startsWith('geçe')) { h = t.n; m = n1.n; used[i] = used[i + 1] = used[i + 2] = true; }
      else if (n1 && n1.n != null && n1.n < 60 && n2 && (n2.w === 'var' || n2.w.startsWith('kala'))) { h = t.n - 1; m = 60 - n1.n; used[i] = used[i + 1] = used[i + 2] = true; }
      else if (TIME_SUFFIX.has(t.s)) { h = t.n; m = 0; used[i] = true; }
      else if (prevSaat) {
        h = t.n; m = 0; used[i] = true;
        if (n1 && n1.n != null && n1.n < 60 && n1.mm == null && [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].includes(n1.n)) { m = n1.n; used[i + 1] = true; }
      }
      if (h != null && prevSaat) used[i - 1] = true;
    }
    for (let i = 0; i < toks.length; i++) if (toks[i].w === 'saat') used[i] = true;
    if (h == null) { if (noon) return '12:00'; return null; }
    if (h < 0) h = 23;
    if (h <= 12) {
      if (pm && h < 12) h += 12;
      else if (!am && h >= 1 && h <= 8) h += 12; // dükkan 9'da açılıyor: "3'te" = 15:00
    }
    return hm(h, m);
  }

  /* ---------- hizmet ---------- */
  function extractService(toks, used) {
    let sac = false, sakal = false, both = false, generic = false;
    for (let i = 0; i < toks.length; i++) {
      if (used[i]) continue;
      const w = toks[i].w.replace(/'/g, '');
      if (w.startsWith('saç') && !w.startsWith('saçma')) { sac = true; if (w.includes('sakal')) sakal = true; used[i] = true; }
      else if (w.startsWith('sakal')) { sakal = true; used[i] = true; }
      else if (['komple', 'full', 'ikisi', 'hepsi', 'ikisini', 'ikisinden', 'tam'].includes(w)) { both = true; used[i] = true; }
      else if (/^(tıraş|traş|tras|tıras)/.test(w)) { generic = true; used[i] = true; }
      else if (/^(kesim|düzelt|bakım)/.test(w)) used[i] = true;
    }
    if (both || (sac && sakal)) return 'sacsakal';
    if (sakal) return 'sakal';
    if (sac) return 'sac';
    if (generic) return 'default';
    return null;
  }

  /* ---------- müşteri eşleştirme ---------- */
  function baseOf(w) { return w.split("'")[0]; }
  function nameTokenMatch(tw, word) {
    if (!word || word.length < 2) return false;
    const b = baseOf(tw);
    if (b === word) return true;
    if (tw.includes("'")) return false;
    if (tw.startsWith(word) && CASE_SUFFIX.has(tw.slice(word.length))) return true;
    const last = word.slice(-1), soft = { t: 'd', k: 'ğ', p: 'b', ç: 'c' }[last];
    if (soft) {
      const alt = word.slice(0, -1) + soft;
      if (tw.startsWith(alt) && /^[aeıioöuü]/.test(tw.slice(alt.length)) && CASE_SUFFIX.has(tw.slice(alt.length))) return true;
    }
    return false;
  }

  function matchCustomers(toks, used, customers) {
    const idxs = [];
    toks.forEach((t, i) => { if (!used[i] && t.n == null && !STOP.has(baseOf(t.w))) idxs.push(i); });
    const scored = [];
    for (const c of customers || []) {
      const words = trLower(c.name).split(/\s+/).filter(Boolean);
      let score = 0; const hit = [];
      words.forEach((word, wi) => {
        const j = idxs.find((i) => !hit.includes(i) && nameTokenMatch(toks[i].w, word));
        if (j != null) { score += wi === 0 ? 2 : 1.5; hit.push(j); }
      });
      if (score > 0) scored.push({ c, score, hit, full: hit.length === words.length });
    }
    scored.sort((a, b) => b.score - a.score);
    const top = scored.length ? scored[0].score : 0;
    const best = scored.filter((s) => s.score === top);
    return { best, all: scored, idxs };
  }

  function leftoverName(toks, used, skip) {
    const parts = [];
    for (let i = 0; i < toks.length; i++) {
      if (used[i] || skip.includes(i)) continue;
      const t = toks[i];
      if (t.n != null) continue;
      const b = baseOf(t.w);
      if (STOP.has(b) || STOP.has(t.w) || b.length < 2) continue;
      if (MONTHS.some((m) => b.startsWith(m) && b.length - m.length <= 4)) continue;
      if (DAY_NAMES.some(([d]) => b.startsWith(d) && b.length - d.length <= 4)) continue;
      parts.push(baseOf(t.o));
      if (parts.length >= 3) break;
    }
    return parts.length ? titleCase(parts.join(' ')) : null;
  }

  function resolveCustomer(toks, used, customers) {
    const { best } = matchCustomers(toks, used, customers);
    if (!best.length) {
      return { customerId: null, name: leftoverName(toks, used, []), candidates: [] };
    }
    if (best.length > 1) {
      const fulls = best.filter((b) => b.full);
      if (fulls.length === 1) return finish(fulls[0]);
      best.forEach((b) => b.hit.forEach((i) => (used[i] = true)));
      const extra = leftoverName(toks, used, []);
      const firstHit = best[0].hit.map((i) => baseOf(toks[i].o)).join(' ');
      return { customerId: null, name: titleCase(extra ? firstHit + ' ' + extra : firstHit), candidates: best.map((b) => b.c.id), ambiguous: true };
    }
    return finish(best[0]);

    function finish(b) {
      b.hit.forEach((i) => (used[i] = true));
      const words = trLower(b.c.name).split(/\s+/);
      const extra = leftoverName(toks, used, []);
      // Kayıtlı "Ahmet Yılmaz" var ama "Ahmet Kaya" denmişse: yeni kişi olabilir
      if (extra && !b.full && words.length > 1) {
        const first = b.hit.map((i) => baseOf(toks[i].o)).join(' ');
        return { customerId: null, name: titleCase(first + ' ' + extra), candidates: [b.c.id], maybeNew: true };
      }
      return { customerId: b.c.id, name: b.c.name, candidates: [] };
    }
  }

  /* ---------- randevu bulma ---------- */
  function upcomingFor(customerId, appts, now, onDate) {
    const today = ymd(now), nowMin = now.getHours() * 60 + now.getMinutes();
    return (appts || [])
      .filter((a) => a.customerId === customerId && a.status !== 'cancelled')
      .filter((a) => (onDate ? a.date === onDate : (a.date > today || (a.date === today && toMin(a.time) >= nowMin - 90))))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }

  /* ---------- ana çözücü ---------- */
  function parse(text, ctx) {
    ctx = ctx || {};
    const now = ctx.now || new Date();
    const customers = ctx.customers || [];
    const appts = ctx.appts || [];
    const original = String(text || '').trim();
    const toks = tokenize(original);
    const used = toks.map(() => false);
    const lw = ' ' + toks.map((t) => t.w).join(' ') + ' ';
    const has = (re) => re.test(lw);
    if (!toks.length) return { intent: 'unknown', text: original };

    const isNote = toks.some((t) => /^(not|notu|notuna|notunu|notlara|notlarına)$/.test(t.w.replace(/:$/, '')));
    const isCancel = has(/ (iptal|sil|silin|sildim|kaldır|gelmeyecek|gelemeyecek|gelemiyor|gelemez|vazgeçti)/);
    const isNoShow = has(/ (gelmedi|gelmemiş|gelmedi mi)/);
    const isQuestion = /\?\s*$/.test(original) ||
      toks.some((t) => ['kim', 'kimler', 'kaç', 'ne', 'neler', 'nedir', 'hangi', 'mı', 'mi', 'mu', 'mü', 'miyim', 'mıyım', 'muyum', 'müyüm', 'misin', 'musun', 'kimlervar'].includes(t.w));
    const isMove = has(/ (ertele|kaydır|değiştir|taşı|al|alalım|aldır|çek|çekelim|yerine|alınsın|kaydıralım|erteleyelim) /) ||
      has(/ (ertele|kaydır|taşı)\w*/);

    /* NOT */
    if (isNote) {
      const ni = toks.findIndex((t) => /^(not|notu|notuna|notunu|notlara|notlarına)/.test(t.w));
      const before = toks.slice(0, ni), after = toks.slice(ni + 1);
      let k = 0;
      while (after[k] && /^(al|et|düş|yaz|ekle|olarak|şöyle|şu|:)$/.test(after[k].w.replace(/:$/, ''))) k++;
      let content = after.slice(k);
      let who = before;
      const usedB = before.map(() => false);
      let r = resolveCustomer(before, usedB, customers);
      if (!r.customerId && !r.candidates.length && !r.name) {
        // "not al Ahmet kenarlar 2 numara" → ismi notun başından çek
        const usedA = content.map(() => false);
        const m = matchCustomers(content, usedA, customers);
        if (m.best.length === 1) {
          r = { customerId: m.best[0].c.id, name: m.best[0].c.name, candidates: [] };
          content = content.filter((_, i) => !m.best[0].hit.includes(i));
        } else if (content.length > 1) {
          r = { customerId: null, name: titleCase(baseOf(content[0].o)), candidates: m.best.map((b) => b.c.id) };
          content = content.slice(1);
        }
      }
      const note = content.map((t) => t.o).join(' ').trim();
      return { intent: 'note', customerId: r.customerId, name: r.name, candidates: r.candidates, note: note ? upFirst(note) : '', text: original };
    }

    const date = extractDay(toks, used, now);
    const time = extractTime(toks, used);
    const service = extractService(toks, used);

    /* İPTAL / GELMEDİ */
    if (isCancel || isNoShow) {
      for (let i = 0; i < toks.length; i++) if (/^(iptal|sil|silin|sildim|kaldır|gelmeyecek|gelemeyecek|gelemiyor|gelemez|vazgeçti|gelmedi|gelmemiş|et|edildi|oldu)/.test(toks[i].w)) used[i] = true;
      const r = resolveCustomer(toks, used, customers);
      let appt = null;
      if (r.customerId) {
        if (isNoShow) {
          const todays = upcomingFor(r.customerId, appts, now, ymd(date || now));
          const past = todays.filter((a) => toMin(a.time) <= now.getHours() * 60 + now.getMinutes() + 30);
          appt = past.length ? past[past.length - 1] : todays[0] || null;
        } else {
          const list = upcomingFor(r.customerId, appts, now, date ? ymd(date) : null);
          appt = (time && list.find((a) => a.time === time)) || list[0] || null;
        }
      }
      return { intent: isNoShow ? 'noshow' : 'cancel', customerId: r.customerId, name: r.name, candidates: r.candidates, apptId: appt ? appt.id : null, date: date ? ymd(date) : null, text: original };
    }

    /* SORU */
    if (isQuestion) {
      const r = resolveCustomer(toks, used, customers);
      const free = has(/ boş/);
      const last = has(/ (en son|son |geldi|gelmiş)/);
      let kind = 'day';
      if (free) kind = 'free';
      else if (r.customerId || (r.candidates && r.candidates.length)) kind = last ? 'last' : 'customer';
      else if (has(/ (kaç|toplam)/) && has(/ (bu hafta|haftada|hafta)/)) kind = 'week';
      return { intent: 'query', kind, date: ymd(date || now), customerId: r.customerId, name: r.name, candidates: r.candidates, text: original };
    }

    /* MÜŞTERİ */
    for (let i = 0; i < toks.length; i++) if (/^(ertele|kaydır|değiştir|taşı|al|alalım|aldır|çek|çekelim|yerine|alınsın|kaydıralım|erteleyelim|randevusunu|randevusu)/.test(toks[i].w) && !toks[i].n) {
      if (STOP.has(toks[i].w) || /^(ertele|kaydır|değiştir|taşı|aldır|çek|yerine|alınsın)/.test(toks[i].w)) used[i] = true;
    }
    const r = resolveCustomer(toks, used, customers);

    /* TAŞI */
    if (isMove && r.customerId && (time || date)) {
      const list = upcomingFor(r.customerId, appts, now, null);
      if (list.length) {
        const a = list[0];
        return {
          intent: 'move', customerId: r.customerId, name: r.name, apptId: a.id,
          from: { date: a.date, time: a.time },
          date: date ? ymd(date) : a.date, time: time || a.time, text: original,
        };
      }
    }

    /* YENİ RANDEVU */
    if (time || date || r.name || r.customerId) {
      const warnings = [];
      let d = date || now;
      if (!date && time) {
        const nowMin = now.getHours() * 60 + now.getMinutes();
        if (toMin(time) < nowMin - 15) warnings.push('past');
      }
      return {
        intent: 'create', date: ymd(d), time: time || null, service, customerId: r.customerId,
        name: r.name, candidates: r.candidates, maybeNew: !!r.maybeNew, ambiguous: !!r.ambiguous, warnings, text: original,
      };
    }
    return { intent: 'unknown', text: original };
  }

  return { parse, tokenize, titleCase, trLower, ymd, addDays, toMin, hm, nameTokenMatch, upcomingFor };
});
