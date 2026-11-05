'use strict';
/* =====================================================================
 * SLOT GAME STARTER v2 - 6x4 Ways, Cascade, Wild naik, Pengali, Free Spin
 * Bagian: CONFIG | ASSETS | STATE | WALLET | ENGINE | SOUND | REELS | UI | GAME
 * Engine & Wallet tidak menyentuh DOM (logika terpisah dari tampilan).
 * ===================================================================== */

/* ---------- CONFIG (angka bertanda [?] masih tebakan, ubah sesuai game acuanmu) ---------- */
const CONFIG = {
  title: 'Central Java',
  reels: 6, rows: 4, cellSize: 110,
  startBalance: 100000,
  baseBet: 20,                          // total bet = 20 x ukuran bet x level bet (aturan game acuan)
  betSizes: [0.03, 0.1, 0.3, 0.9],      // [?] 0.03 - 0.90
  betLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  autoOptions: [10, 30, 50, 80, 1000],
  quitUrl: '',                          // tombol Quit: kosong = tutup tab / kembali ke halaman sebelumnya; isi URL untuk pindah ke halaman lain (mis. lobby)
  minWayCount: 3,
  messageTips: [                        // teks yang berganti-ganti di bar tengah saat idle / spin
    'Win up to 4096 ways!', '3 or more Scatters trigger Free Spins',
    'Collect 3 Wilds to raise the multiplier', 'Wilds only appear on reels 2, 3, 4 and 5'
  ],
  tipIntervalMs: 3500,
  glow: { WILD: [255, 176, 0], SCATTER: [255, 60, 60] },   // warna cahaya simbol yang "menyala" (RGB)                       // minimal reel berurutan dari kiri
  payScale: 0.87,                          // pengali global pays (penyetel RTP)
  maxWinX: 3136,                        // batas kemenangan 1 ronde (spin utama + seluruh Free Spin) = x total bet, mengikuti Garuda Gems
  speed: { spinCellsPerSec: 30, minSpinMs: 600, stopStaggerMs: 220, stopDurationMs: 450,
           turboFactor: 2.5, autoDelayMs: 500,
           anticipationMs: 1000, highlightMs: 450, explodeMs: 300, dropMs: 420,
           susDropMs: 560, susGapMs: 170, susCellMs: 55,   // suspense: lama 1 reel turun, jeda antar reel, jeda antar simbol dalam 1 reel
           susSettleMs: 450,   // suspense fase 1: simbol yang masih ada turun mengisi ruang kosong (semua reel bersamaan)
           susPreMs: 260,      // suspense fase 2: reel menyala dulu, baru simbol baru jatuh (waktu "mencari")
           susRamp: 1.12,      // tiap reel berikutnya jatuh sedikit lebih lambat (1 = sama; makin besar makin menegangkan)
           sweepStepMs: 110, sweepRampMs: 280, sweepHoldMs: 220, explodeStepMs: 80 },   // sapuan nyala kiri->kanan: jeda antar reel, lama menyala, tahan; jeda pecah antar reel
  // pays: kelipatan (ukuran bet x level) per 1 way, untuk 3/4/5/6 reel berurutan
  symbols: [
    { id: 'L1', weight: 22, pays: { 3: 0.3, 4: 0.75, 5: 1.8, 6: 4.5 } },
    { id: 'L2', weight: 22, pays: { 3: 0.3, 4: 0.75, 5: 1.8, 6: 4.5 } },
    { id: 'L3', weight: 20, pays: { 3: 0.45, 4: 1.2, 5: 3, 6: 7.5 } },
    { id: 'L4', weight: 20, pays: { 3: 0.45, 4: 1.2, 5: 3, 6: 7.5 } },
    { id: 'H1', weight: 14, pays: { 3: 0.75, 4: 2.25, 5: 6, 6: 15 } },
    { id: 'H2', weight: 12, pays: { 3: 1.2, 4: 3.75, 5: 9, 6: 22.5 } },
    { id: 'H3', weight: 10, pays: { 3: 1.8, 4: 6, 5: 15, 6: 45 } },
    { id: 'H4', weight: 8,  pays: { 3: 3, 4: 9, 5: 22.5, 6: 75 } },
    { id: 'WILD', weight: 4, wild: true, reels: [1, 2, 3, 4] },  // wild hanya di reel 2-5
    { id: 'SCATTER', weight: 2.2, scatter: true }
  ],
  // Pengali = 1 di awal; tiap 3 wild terkumpul -> x3, x6, x9, ... (tanpa batas)
  wild: { perStep: 3, stepValue: 3 },
  freeSpin: { triggerCount: 3, baseSpins: 10, extraPerScatter: 2 },  // 3 Scatter = 10 FS, tiap Scatter tambahan +2; bisa retrigger
  // Notifikasi menang besar: ambang = total win / bet. Hitungan naik terus dari 0; judul berganti saat melewati tiap ambang
  // (Big -> Mega -> Super Mega). Tambah/ubah tier di sini (key = tema warna: big | mega | super)
  winTiers: [
    { min: 20, key: 'big',    lines: ['Big Win'],   img: 'bigwin/title_big.webp',   sound: 'bigwin' },
    { min: 35, key: 'mega',   lines: ['Mega Win'],  img: 'bigwin/title_mega.webp',  sound: 'megawin' },
    { min: 50, key: 'super',  lines: ['Super', 'Mega Win'], img: 'bigwin/title_super.webp', sound: 'supermegawin' }
  ],
  winCount: { firstMs: 1100, stepMs: 2000, holdMs: 1800 },        // lama hitungan ke ambang pertama, per tier berikutnya, dan jeda sebelum tutup otomatis
  popupAutoCloseMs: 1800,
  // Popup Free Spin (dapat Free Spin / total menang). Main manual: TIDAK pernah tutup sendiri, menunggu ketukan pemain.
  // Angka di bawah hanya berlaku kalau Auto spin / Turbo aktif atau Free Spin ulang (retrigger), supaya game tetap jalan.
  fsPopupMs: { start: 5000, retrigger: 3500, end: 6000 },
  // Animasi dekor. Satuan: derajat/detik (ikon spin) dan detik/siklus (wayang)
  spinIcon: { idleDps: 22, fastDps: 1000, turboBoost: 1.35 },          // putar pelan saat diam, kencang saat spin
  fire: { edgeRate: 260, rate: 340, life: [0.7, 1.3], reach: [0.06, 0.14], size: [8, 19] },   // api tepi grid saat free spin: jumlah/detik, umur (dtk), jangkauan (x lebar grid), ukuran (px)
  suspense: {   // suspense Scatter ke-3 (sudah ada 2 Scatter): simbol turun dulu, lalu simbol baru jatuh per reel dari kiri ke kanan
    dim: 0.62,          // gelapnya reel lain (0-1)
    column: 0.8,        // terang cahaya di reel yang sedang "mencari" (1 = sama seperti saat spin)
    // Api di tepi atas digambar DI BELAKANG simbol, jadi tidak pernah menutupi simbol yang turun
    edgeDepth: 1.5,     // api tepi atas menjangkau sejauh ini ke dalam grid (x). 1 = sedang
    focusDepth: 2.0,    // api ekstra tepat di atas reel yang sedang "mencari" (x)
    edgeDensity: 0.9,   // banyaknya partikel api (0 = tanpa partikel, 1 = seperti api Free Spin)
    bandK: 0.4,         // tebal pita oranye di tepi atas (0 = setipis pita biasa)
    bandAlpha: 0.7      // terang pita oranye di tepi atas (0 = tanpa pita)
  },

  music: {                   // backsound (loop). Tetap pelan di bawah efek suara; turun otomatis saat layar Big Win
    volume: 0.4,             // 0-1 (catatan: iOS Safari mengabaikan volume, jadi atur kerasnya langsung di file audio)
    fadeSec: 1.4,            // lama crossfade biasa <-> Free Spin
    duck: 0.2                // musik turun jadi segini (x volume) saat layar Big Win tampil
  },
  storm: {   // petir di belakang pengali & wayang (hanya Free Spin). Satuan: detik; height = x tinggi pita atas
    gap: [0.8, 2.2],          // jeda antar sambaran
    life: [0.45, 0.8],        // lama 1 sambaran (kilat + kedipan)
    double: 0.3,              // peluang sambaran ganda
    height: [1.15, 1.6],      // tinggi petir
    flash: 0.45,              // kuat cahaya biru yang menyapu pita atas & menyinari tepi wayang saat menyambar
    ambient: 0.16,            // cahaya biru samar yang berdenyut di dalam awan
    cloudBoost: 1.2           // awan bergerak (1 + nilai ini)x lebih cepat saat Free Spin; 0 = sama
  },
  wayang: {
    freeScale: 1.22,                                                    // wayang membesar saat free spin
    idle: { period: 9,   rot: 1.0, bob: 0.30 },                        // bukan free spin: pelan sekali
    free: { period: 2.8, rot: 2.6, bob: 0.95 }                         // free spin: lebih cepat & lebih besar
  }
};

/* ---------- ASSETS ---------- */
const ASSETS = {
  base: 'assets/',
  symbols: {   // id simbol game -> file. Ganti file di sini untuk menukar simbol
    L1: 'symbols/gem_ruby.webp', L2: 'symbols/gem_emerald.webp', L3: 'symbols/gem_sapphire.webp', L4: 'symbols/gem_amethyst.webp',
    H1: 'symbols/wayang_1.webp', H2: 'symbols/wayang_2.webp', H3: 'symbols/wayang_3.webp', H4: 'symbols/wayang_4.webp',
    WILD: 'symbols/WILD.webp', SCATTER: 'symbols/SCATTER.webp'
  },
  ui: {},   // kosong = pakai panel CSS (style.css). Isi dengan 'selector': 'file.png' jika ingin skin gambar
  // OPSIONAL - kalau file ada, dipakai menggantikan efek bawaan dari kode
  fx: { WILD: 'effects/glow_wild.png', SCATTER: 'effects/glow_scatter.png', column: 'effects/reel_glow.png' },
  shatter: { file: 'effects/fx_pecah_gold.webp', cols: 4, rows: 3, fps: 18, size: 30 },   // sprite sheet grid pecahan (sementara). size = lebar efek dalam cqw
  anim: {   // sprite sheet horizontal (frame berjajar ke kanan), menggantikan gambar statis simbol
    WILD: { file: 'symbols/WILD_anim.png', frames: 8, fps: 12 },
    SCATTER: { file: 'symbols/SCATTER_anim.png', frames: 8, fps: 12 }
  },
  music: { base: 'sounds/music_base.mp3', free: 'sounds/music_free.mp3' },   // backsound biasa & Free Spin (loop mulus)
  storm: [1, 2, 3, 4, 5, 6].map(n => `effects/petir_${n}.webp`),   // 6 bentuk petir (PNG/WebP transparan)
  // Dua font: Poppins untuk label & angka (--font-main), Cinzel untuk judul (--font-title).
  // File ditaruh di assets/fonts/ (nama file harus sama persis, huruf besar-kecil ikut dihitung).
  fonts: [
    { family: 'Poppins', file: 'fonts/Poppins-SemiBold.woff2', cssVar: '--font-main',  fallback: "system-ui, 'Segoe UI', Roboto, Arial, sans-serif" },
    { family: 'Cinzel',  file: 'fonts/Cinzel-Bold.woff2',      cssVar: '--font-title', fallback: "Georgia, 'Palatino Linotype', serif" }
  ],
  // Penyeimbang tinggi baris font. Teks terlalu turun -> kecilkan ascentOverride, naikkan descentOverride (jumlah tetap 100%).
  fontMetrics: { ascentOverride: '80%', descentOverride: '20%', lineGapOverride: '0%' },
  sounds: {
    spin: 'sounds/spin_start.ogg', stop: 'sounds/reel_stop.ogg', win: 'sounds/symbol_win.ogg', explode: 'sounds/symbol_break.ogg',
    bigwin: 'sounds/big_win.ogg', megawin: 'sounds/mega_win.ogg', supermegawin: 'sounds/super_mega_win.ogg',
    bonus: 'sounds/free_spin.ogg', anticipate: 'sounds/scatter_appear.ogg', click: 'sounds/button_click.ogg',
    betUp: 'sounds/bet_plus.ogg', betDown: 'sounds/bet_minus.ogg', turbo: 'sounds/turbo_toggle.ogg', auto: 'sounds/auto_spin.ogg',
    multUp: 'sounds/multiplier_up.ogg', wild: 'sounds/wild_appear.ogg'
  }
};

const Assets = {
  images: {}, sounds: {}, fx: {}, anim: {}, storm: [], shatter: null,
  loadImage(path) {
    return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = ASSETS.base + path; });
  },
  async loadAll() {
    const jobs = [];
    for (const [id, f] of Object.entries(ASSETS.symbols)) jobs.push(this.loadImage(f).then(i => { this.images[id] = i; }));
    for (const [sel, f] of Object.entries(ASSETS.ui)) jobs.push(this.loadImage(f).then(i => {
      if (i) document.querySelectorAll(sel).forEach(el => { el.style.backgroundImage = `url(${i.src})`; el.classList.add('has-skin'); });
    }));
    for (const [k, f] of Object.entries(ASSETS.fx)) jobs.push(this.loadImage(f).then(i => { this.fx[k] = i; }));
    ASSETS.storm.forEach((f, i) => jobs.push(this.loadImage(f).then(img => { this.storm[i] = img; })));
    jobs.push(this.loadImage(ASSETS.shatter.file).then(i => { this.shatter = i; }));
    for (const [k, a] of Object.entries(ASSETS.anim)) jobs.push(this.loadImage(a.file).then(i => { this.anim[k] = i; }));
    for (const f of ASSETS.fonts) jobs.push(new FontFace(f.family, `url(${ASSETS.base + f.file})`, { weight: '100 900', ...ASSETS.fontMetrics }).load().then(ff => {
      document.fonts.add(ff); document.documentElement.style.setProperty(f.cssVar, `'${f.family}', ${f.fallback}`);
    }).catch(() => {}));
    for (const [n, f] of Object.entries(ASSETS.sounds)) { const a = new Audio(); a.preload = 'auto'; a.src = ASSETS.base + f; this.sounds[n] = a; }
    await Promise.all(jobs);
  },
  symbol(id) { return this.images[id] || null; }
};

/* ---------- STATE ---------- */
const round2 = n => Math.round(n * 100) / 100;
const multOf = n => n < CONFIG.wild.perStep ? 1 : CONFIG.wild.stepValue * Math.floor(n / CONFIG.wild.perStep);
const State = {
  balance: CONFIG.startBalance, sizeIdx: 1, level: 1, lastWin: 0,
  busy: false, spinning: false, turbo: false, auto: 0, stopAuto: false, sound: true, music: true,
  freeSpins: 0, inFree: false, freeTotal: 0, roundWin: 0, mult: { n: 0 },   // n = jumlah wild terkumpul
  get bet() { return round2(CONFIG.baseBet * CONFIG.betSizes[this.sizeIdx] * this.level); }
};

/* ---------- WALLET ---------- */
const Wallet = {
  combos: (() => { const m = new Map();
    CONFIG.betSizes.forEach((s, si) => CONFIG.betLevels.forEach(l => { const t = round2(CONFIG.baseBet * s * l); if (!m.has(t)) m.set(t, { si, l, t }); }));
    return [...m.values()].sort((a, b) => a.t - b.t); })(),
  canBet() { return State.balance >= State.bet; },
  deductBet() { State.balance = round2(State.balance - State.bet); },
  add(n) { State.balance = round2(State.balance + n); },
  changeBet(d) {   // tombol +/- melangkah di semua kombinasi ukuran x level, urut dari kecil
    const i = Math.max(0, Math.min(this.combos.length - 1, this.combos.findIndex(c => c.t === State.bet) + d));
    State.sizeIdx = this.combos[i].si; State.level = this.combos[i].l;
  },
  reset() { State.balance = CONFIG.startBalance; State.freeSpins = 0; State.inFree = false; }
};

/* ---------- RNG ---------- */
// Sumber acak berbasis crypto (bukan Math.random). Menghasilkan float [0,1) dengan 53 bit. Dipakai oleh Engine.
// CATATAN: game yang dioperasikan sungguhan harus menghitung hasil di SERVER; kode klien ini hanya untuk demo/prototipe.
const RNG = (() => {
  const c = globalThis.crypto, buf = new Uint32Array(4096); let i = buf.length;
  const u32 = () => { if (i >= buf.length) { c.getRandomValues(buf); i = 0; } return buf[i++]; };
  return { next() { return ((u32() >>> 5) * 67108864 + (u32() >>> 6)) / 9007199254740992; } };
})();

/* ---------- ENGINE ---------- */
const Engine = {
  map: Object.fromEntries(CONFIG.symbols.map(s => [s.id, s])),
  pools: Array.from({ length: CONFIG.reels }, (_, r) => {
    const list = CONFIG.symbols.filter(s => !s.reels || s.reels.includes(r));   // wild hanya di reel yang diizinkan
    return { list, total: list.reduce((t, s) => t + s.weight, 0) };
  }),
  randomSymbol(reel) {
    const p = this.pools[reel]; let x = RNG.next() * p.total;
    for (const s of p.list) if ((x -= s.weight) < 0) return s.id;
    return p.list[0].id;
  },
  generateBoard() { return Array.from({ length: CONFIG.reels }, (_, r) => Array.from({ length: CONFIG.rows }, () => this.randomSymbol(r))); },
  // Ways: simbol berurutan dari reel kiri; wild menggantikan semua kecuali Scatter; ways = hasil kali jumlah simbol tiap reel
  evaluate(board, bet) {
    const unit = bet / CONFIG.baseBet, wins = [], cells = new Map(); let total = 0;
    for (const s of CONFIG.symbols) {
      if (s.wild || s.scatter) continue;
      let count = 0, ways = 1; const found = [];
      for (let r = 0; r < CONFIG.reels; r++) {
        const rows = []; board[r].forEach((id, row) => { if (id === s.id || id === 'WILD') rows.push(row); });
        if (!rows.length) break; count++; ways *= rows.length; found.push(rows);
      }
      const pay = count >= CONFIG.minWayCount && s.pays[count]; if (!pay) continue;
      const amount = round2(pay * CONFIG.payScale * ways * unit);
      found.forEach((rows, r) => rows.forEach(row => cells.set(r + ',' + row, [r, row])));
      wins.push({ symbol: s.id, count, ways, amount }); total += amount;
    }
    return { wins, total: round2(total), cells: [...cells.values()] };
  },
  // Satu spin penuh. Wild yang ikut menang pecah lalu TERKUMPUL ke meter pengali.
  play(bet, mult, capLeft) {   // capLeft = sisa kemenangan yang masih boleh dibayar di ronde ini (batas maxWinX)
    let board = this.generateBoard();
    const initial = board.map(c => c.slice());
    const countS = b => b.flat().filter(id => id === 'SCATTER').length;
    const m = { n: mult.n }, steps = []; let base = 0;
    for (let guard = 0; guard < 60; guard++) {
      const ev = this.evaluate(board, bet); if (!ev.total) break;
      const scatterBefore = countS(board);
      base = round2(base + ev.total);
      const removed = new Set(ev.cells.map(c => c.join(','))); const wilds = [];
      const next = board.map((col, r) => {
        const keep = [];
        col.forEach((id, row) => { if (removed.has(r + ',' + row)) { if (id === 'WILD') wilds.push([r, row]); } else keep.push({ id, from: row }); });
        const add = col.length - keep.length;
        return Array.from({ length: add }, (_, k) => ({ id: this.randomSymbol(r), from: k - add })).concat(keep);
      });
      m.n += wilds.length;
      const newScatter = []; next.forEach((col, r) => col.forEach((c, row) => { if (c.id === 'SCATTER' && c.from < 0) newScatter.push([r, row]); }));   // Scatter yang baru turun dari atas
      board = next.map(col => col.map(c => c.id));
      steps.push({ ev, wilds, next, mult: { n: m.n }, scatterBefore, scatterAfter: countS(board), newScatter });
    }
    const endWilds = []; board.forEach((col, r) => col.forEach((id, row) => { if (id === 'WILD') endWilds.push([r, row]); }));   // Wild yang muncul tapi tidak pecah
    m.n += endWilds.length;
    const scatter = countS(board), multiplier = multOf(m.n), F = CONFIG.freeSpin;   // jumlah Scatter di papan AKHIR (yang turun saat cascade ikut dihitung)
    const freeSpins = scatter >= F.triggerCount ? F.baseSpins + (scatter - F.triggerCount) * F.extraPerScatter : 0;
    let total = round2(base * multiplier), capped = false;
    if (capLeft != null && total >= capLeft) { total = Math.max(0, round2(capLeft)); capped = true; }   // kena batas menang: ronde berakhir, sisa Free Spin hangus
    return { initial, steps, base, endWilds, mult: m, multiplier, total, capped, scatter, initialScatter: countS(initial), freeSpins: capped ? 0 : freeSpins };
  }
};

/* ---------- SOUND ---------- */
const Sound = { play(n) { if (!State.sound) return; const a = Assets.sounds[n]; if (!a) return;
  try { a.currentTime = 0; const p = a.play(); if (p) p.catch(() => {}); } catch (e) {} },
  stop(n) { const a = Assets.sounds[n]; if (a) try { a.pause(); a.currentTime = 0; } catch (e) {} } };

/* ---------- REELS (Canvas 2D) ---------- */
const Reels = {
  L: 40, mode: 'board',
  init() {
    this.canvas = document.getElementById('reel-canvas'); this.ctx = this.canvas.getContext('2d');
    this.C = CONFIG.cellSize; this.w = CONFIG.reels * this.C; this.h = CONFIG.rows * this.C;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.w * dpr; this.canvas.height = this.h * dpr; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.strips = Array.from({ length: CONFIG.reels }, (_, i) => ({ pos: 0, state: 'idle', strip: Array.from({ length: this.L }, () => Engine.randomSymbol(i)) }));
    this.setBoard(Engine.generateBoard());
    // Ticker efek: menggambar ulang hanya saat ada simbol menyala/animasi di papan dan tidak ada tween berjalan
    const loop = () => { if (this.mode === 'board' && !this.tweening && this.cells.some(c => c.some(x => x.id && (CONFIG.glow[x.id] || Assets.anim[x.id])))) this.draw(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  },
  mod(i) { return ((i % this.L) + this.L) % this.L; },
  setBoard(b) { this.mode = 'board'; this.dimOn = false; this.cells = b.map(col => col.map(id => ({ id, dy: 0, a: 1, s: 1, g: 0 }))); this.draw(); },
  tween(ms, fn) {
    this.tweening = (this.tweening || 0) + 1;
    return new Promise(res => { const t0 = performance.now();
      const f = now => { const k = Math.min((now - t0) / ms, 1); fn(k); this.draw(); if (k < 1) requestAnimationFrame(f); else { this.tweening--; res(); } };
      requestAnimationFrame(f); });
  },
  skip() { this.strips.forEach(r => { if (r.state === 'spin') { r.stopAt = 0; r.quick = true; r.antic = false; } }); },  // tap/Space saat berputar = percepat berhenti
  spin(board, turbo, onStop, onAntic) {
    const S = CONFIG.speed, f = turbo ? S.turboFactor : 1, t0 = performance.now(); this.mode = 'spin'; this.dimOn = false;
    return new Promise(resolve => {
      // Antisipasi: jika 2 Scatter sudah mendarat di reel sebelumnya dan belum cukup 3, reel berikutnya berhenti lebih lama + kolom menyala
      let cum = 0, extra = 0;
      this.strips.forEach((r, i) => {
        r.antic = cum >= CONFIG.freeSpin.triggerCount - 1 && cum < CONFIG.freeSpin.triggerCount; r.anticFired = false;
        if (r.antic) extra += S.anticipationMs;
        r.state = 'spin'; r.quick = false; r.stopAt = t0 + (S.minSpinMs + i * S.stopStaggerMs + extra) / f; r.final = board[i]; r.pos = Math.round(r.pos);
        cum += board[i].filter(id => id === 'SCATTER').length;
      });
      let last = t0;
      const tick = now => {
        const dt = Math.min((now - last) / 1000, 0.05); last = now; let running = 0;
        this.strips.forEach((r, i) => {
          if (r.state === 'spin') {
            r.pos -= S.spinCellsPerSec * f * dt;
            if (now >= r.stopAt) {
              const dur = (r.quick ? 120 : S.stopDurationMs) / f, dist = Math.round(S.spinCellsPerSec * f * dur / 3000) + CONFIG.rows + 2;
              r.from = r.pos; r.to = Math.floor(r.pos) - dist; r.t = now; r.dur = dur; r.state = 'stopping';
              r.final.forEach((id, row) => { r.strip[this.mod(r.to + row)] = id; });
            }
          }
          if (r.state === 'stopping') {
            const k = Math.min((now - r.t) / r.dur, 1), x = k - 1, c = 0.6;
            r.pos = r.from + (r.to - r.from) * (1 + (c + 1) * x * x * x + c * x * x);
            if (k >= 1) { r.pos = r.to; r.state = 'idle'; onStop && onStop(i);
              const nx = this.strips[i + 1]; if (nx && nx.antic && !nx.anticFired) { nx.anticFired = true; if (!this.dimOn) { this.dimOn = true; this.dimT = now; } onAntic && onAntic(i + 1); } }
          }
          if (r.state !== 'idle') running++;
        });
        this.draw();
        if (running) requestAnimationFrame(tick); else { this.setBoard(board); resolve(); }
      };
      requestAnimationFrame(tick);
    });
  },
  // Sapuan nyala: kartu pemenang menyala (sampai ke latar kartunya) dan membesar sedikit, reel kiri dulu lalu ke kanan
  async highlight(list, f) {
    const S = CONFIG.speed, cols = [...new Set(list.map(c => c[0]))].sort((a, b) => a - b);
    const step = S.sweepStepMs / f, ramp = S.sweepRampMs / f, total = (cols.length - 1) * step + ramp;
    await this.tween(total, k => { const t = k * total;
      cols.forEach((col, i) => { const x = Math.max(0, Math.min(1, (t - i * step) / ramp)), g = x * x * (3 - 2 * x);
        list.forEach(([r, row]) => { if (r === col) this.cells[r][row].g = g; }); }); });
    await sleep(S.sweepHoldMs / f);
  },
  // Simbol menang pecah kiri -> kanan: pecahan emas muncul di tiap kartu; WILD membesar & memudar lalu cahayanya terbang ke pengali
  async explode(list, f) {
    const S = CONFIG.speed, cols = [...new Set(list.map(c => c[0]))].sort((a, b) => a - b), step = S.explodeStepMs / f, dur = S.explodeMs / f;
    const total = (cols.length - 1) * step + dur, fired = new Set();
    await this.tween(total, kk => { const t = kk * total;
      list.forEach(([r, row]) => { const c = this.cells[r][row], k = Math.max(0, Math.min(1, (t - cols.indexOf(r) * step) / dur));
        if (k > 0 && !fired.has(r + ',' + row)) { fired.add(r + ',' + row); Fx.shatter(r, row); }
        if (c.id === 'WILD') { c.s = 1 + 0.45 * k; c.a = Math.pow(1 - k, 1.5); }
        else { c.s = 1 + 0.4 * k; c.a = 1 - k; } }); });
    list.forEach(([r, row]) => { this.cells[r][row].id = null; });
  },
  // Isi ulang dari atas. suspense = reel turun SATU PER SATU kiri -> kanan (simbol paling bawah mendarat dulu), reel tanpa perubahan dilewati.
  // onStart(i) = reel i mulai turun, onLand(i) = reel i mendarat
  async refill(nextCols, f, opt = {}) {
    const S = CONFIG.speed, sus = opt.suspense, rows = CONFIG.rows;
    this.cells = nextCols.map(col => col.map((c, row) => ({ id: c.id, dy: c.from - row, a: 1, s: 1, g: 0, d0: c.from - row, nw: c.from < 0 })));
    if (sus) return this.refillSuspense(f, opt);
    const dur = S.dropMs / f, cellSt = 0, gap = S.susGapMs / f, start = [], act = [], landed = [], started = [];
    let t = 0;
    this.cells.forEach((col, i) => { act[i] = col.some(c => c.d0 !== 0); start[i] = 0; if (sus && act[i]) { start[i] = t; t += dur + cellSt * (rows - 1) + gap; } });
    const total = sus ? Math.max(t - gap, 1) : dur;
    await this.tween(total, kk => { const tt = kk * total;
      this.cells.forEach((col, i) => {
        if (sus && !act[i]) return;
        if (tt >= start[i] && !started[i]) { started[i] = true; opt.onStart && opt.onStart(i); }
        col.forEach((c, row) => { const delay = sus ? (rows - 1 - row) * cellSt : 0, k = Math.max(0, Math.min(1, (tt - start[i] - delay) / dur)), e = 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
          c.dy = c.d0 * (1 - e); });
        if (tt >= start[i] + (rows - 1) * cellSt + dur - 1 && !landed[i]) { landed[i] = true; opt.onLand && opt.onLand(i); } }); });
    this.cells.forEach(col => col.forEach(c => { c.dy = 0; })); this.draw();
    this.cells.forEach((col, i) => { if (!landed[i]) { landed[i] = true; opt.onLand && opt.onLand(i); } });
  },
  // Suspense Scatter ke-3. Fase 1: semua simbol yang masih ada turun mengisi ruang kosong (bersamaan, terang biasa).
  // Lalu opt.afterSettle() (layar menggelap). Fase 2: simbol baru jatuh dari atas SATU REEL demi SATU REEL, kiri -> kanan; reel menyala dulu lalu simbol jatuh.
  async refillSuspense(f, opt) {
    const S = CONFIG.speed, rows = CONFIG.rows, ease = k => 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2), cl = v => Math.max(0, Math.min(1, v));
    if (this.cells.some(col => col.some(c => !c.nw && c.d0 !== 0))) {
      const gd = S.susSettleMs / f;
      await this.tween(gd, kk => this.cells.forEach(col => col.forEach(c => { if (!c.nw) c.dy = c.d0 * (1 - ease(kk)); })));
    }
    this.cells.forEach(col => col.forEach(c => { if (!c.nw) c.dy = 0; }));
    this.draw();
    if (opt.afterSettle) await opt.afterSettle();
    const cellSt = S.susCellMs / f, gap = S.susGapMs / f, pre = S.susPreMs / f, start = [], dur = [], act = [], landed = [], started = [];
    let t = 0, ramp = 1;
    this.cells.forEach((col, i) => { act[i] = col.some(c => c.nw); if (!act[i]) return;
      start[i] = t; dur[i] = S.susDropMs / f * ramp; t += pre + dur[i] + cellSt * (rows - 1) + gap; ramp *= S.susRamp; });
    const total = Math.max(t - gap, 1);
    await this.tween(total, kk => { const tt = kk * total;
      this.cells.forEach((col, i) => { if (!act[i]) return;
        if (tt >= start[i] && !started[i]) { started[i] = true; opt.onStart && opt.onStart(i); }
        col.forEach((c, row) => { if (!c.nw) return; c.dy = c.d0 * (1 - ease(cl((tt - start[i] - pre - (rows - 1 - row) * cellSt) / dur[i]))); });
        if (tt >= start[i] + pre + (rows - 1) * cellSt + dur[i] - 1 && !landed[i]) { landed[i] = true; opt.onLand && opt.onLand(i); } }); });
    this.cells.forEach(col => col.forEach(c => { c.dy = 0; })); this.draw();
    this.cells.forEach((col, i) => { if (act[i] && !landed[i]) { landed[i] = true; opt.onLand && opt.onLand(i); } });
  },
  pop(r, row) {   // simbol membesar + kartu menyala sesaat (Scatter baru mendarat)
    const c = this.cells[r] && this.cells[r][row]; if (!c) return Promise.resolve();
    return this.tween(520, k => { c.s = 1 + 0.45 * Math.sin(Math.PI * k); c.g = Math.sin(Math.PI * k); }).then(() => { c.s = 1; c.g = 0; this.draw(); });
  },
  draw() {
    const { ctx, w, h, C } = this; ctx.clearRect(0, 0, w, h);
    if (this.mode === 'spin') {
      this.strips.forEach((r, i) => { ctx.save(); ctx.beginPath(); ctx.rect(i * C, 0, C, h); ctx.clip();
        const base = Math.floor(r.pos);
        for (let k = 0; k <= CONFIG.rows; k++) this.drawSymbol(r.strip[this.mod(base + k)], i * C, (base + k - r.pos) * C, 1, 1);
        ctx.restore();
        const lit = r.antic && r.anticFired && r.state !== 'idle';
        if (this.dimOn && !lit) {   // reel lain gelap; hanya reel yang sedang "mencari" Scatter dan Scatter yang sudah mendarat tetap terang
          const dk = Math.min((performance.now() - this.dimT) / 250, 1);
          ctx.fillStyle = `rgba(8,6,20,${0.7 * dk})`; ctx.fillRect(i * C, 0, C, h);
          if (r.state === 'idle') r.final.forEach((id, row) => { if (id === 'SCATTER') this.drawSymbol(id, i * C, row * C, 1, 1.08); });
        }
        if (lit) this.drawColumn(i); });
      return;
    }
    const sp = CONFIG.suspense, dk = this.dimOn ? Math.min((performance.now() - this.dimT) / 250, 1) * (this.dimFade == null ? 1 : this.dimFade) : 0;
    const cell = (i, row, c) => { if (!c.id) return;
      if (c.g > 0) this.drawTileGlow(i * C, (row + c.dy) * C, c.g, c.a);
      this.drawSymbol(c.id, i * C, (row + c.dy) * C, c.a, c.s * (1 + 0.14 * c.g)); };
    this.cells.forEach((col, i) => {
      col.forEach((c, row) => cell(i, row, c));
      if (dk <= 0) return;
      if (i === this.susFocus) this.drawColumn(i, sp.column * dk);   // reel yang sedang turun = mencari Scatter ke-3
      else { ctx.fillStyle = `rgba(8,6,20,${sp.dim * dk})`; ctx.fillRect(i * C, 0, C, h);   // reel lain gelap, Scatter yang sudah ada tetap terang
        col.forEach((c, row) => { if (c.id === 'SCATTER') cell(i, row, c); }); }
    });
  },
  // Latar kartu menyala emas (menjangkau sampai tepi sel) + bingkai bercahaya
  drawTileGlow(x, y, g, alpha) {
    const ctx = this.ctx, C = this.C, sc = 1 + 0.1 * g, w = (C - 6) * sc, cx = x + C / 2, cy = y + C / 2, pu = 0.85 + 0.15 * this.pulse(160);
    ctx.save(); ctx.globalAlpha = Math.max(0, alpha) * g;
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.75);
    gr.addColorStop(0, `rgba(255,196,80,${0.55 * pu})`); gr.addColorStop(0.7, `rgba(255,150,40,${0.3 * pu})`); gr.addColorStop(1, 'rgba(255,120,20,0.12)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - w / 2, w, w, 16); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#ffe3a0'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(255,170,40,.95)'; ctx.shadowBlur = 22 * g;
    ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - w / 2, w, w, 16); ctx.stroke(); ctx.stroke();
    ctx.restore();
  },
  pulse(speed) { return 0.5 + 0.5 * Math.sin(performance.now() / (speed || 220)); },
  // Kolom cahaya emas di reel yang sedang berputar saat antisipasi Free Spin
  drawColumn(i, k = 1) {
    const ctx = this.ctx, C = this.C, p = this.pulse(120), fx = Assets.fx.column;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (0.5 + 0.4 * p) * k;
    if (fx) ctx.drawImage(fx, i * C, 0, C, this.h);
    else { const g = ctx.createLinearGradient(i * C, 0, (i + 1) * C, 0);
      g.addColorStop(0, 'rgba(255,190,40,0)'); g.addColorStop(0.5, 'rgba(255,200,60,0.75)'); g.addColorStop(1, 'rgba(255,190,40,0)');
      ctx.fillStyle = g; ctx.fillRect(i * C, 0, C, this.h); }
    ctx.restore();
  },
  drawSymbol(id, x, y, alpha, scale) {
    const ctx = this.ctx, C = this.C, p = 4, sz = (C - p * 2) * scale, cx = x + C / 2, cy = y + C / 2;
    const glow = CONFIG.glow[id], an = Assets.anim[id], cfg = ASSETS.anim[id];
    let img = Assets.symbol(id), sx = 0, sw = img ? img.width : 0;
    if (an) { img = an; sw = an.width / cfg.frames; sx = Math.floor(performance.now() / 1000 * cfg.fps) % cfg.frames * sw; }
    ctx.save(); ctx.globalAlpha = Math.max(0, alpha);
    if (glow) {   // cahaya berdenyut di belakang simbol (Wild / Scatter)
      const pl = this.pulse(), col = `${glow[0]},${glow[1]},${glow[2]}`, fx = Assets.fx[id];
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (fx) { const g = C * 1.4 * scale * (0.9 + 0.1 * pl); ctx.globalAlpha *= 0.6 + 0.4 * pl; ctx.drawImage(fx, cx - g / 2, cy - g / 2, g, g); }
      else { const R = C * 0.65 * scale * (0.9 + 0.15 * pl), gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        gr.addColorStop(0, `rgba(${col},${0.55 * (0.6 + 0.4 * pl)})`); gr.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill(); }
      ctx.restore();
      if (img) { ctx.shadowColor = `rgb(${col})`; ctx.shadowBlur = 16 * pl * scale; }
    }
    if (img) { const h0 = img.height, k = Math.min(sz / sw, sz / h0), w = sw * k, h = h0 * k; ctx.drawImage(img, sx, 0, sw, h0, cx - w / 2, cy - h / 2, w, h); }
    else { const n = CONFIG.symbols.findIndex(s => s.id === id);   // PLACEHOLDER (bukan aset final)
      ctx.fillStyle = `hsl(${n * 36},55%,40%)`; ctx.fillRect(cx - sz / 2, cy - sz / 2, sz, sz);
      ctx.fillStyle = '#fff'; ctx.font = `bold ${22 * scale}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(id, cx, cy); }
    ctx.restore();
  }
};

/* ---------- RIWAYAT GAME (disimpan di browser, ditampilkan per hari) ---------- */
const GameLog = {
  key: 'centraljava_history_v1', list: [],
  sy() { return CONFIG.symbols.map(s => s.id); },
  pack(b) { const S = this.sy(); return b.map(col => col.map(id => S.indexOf(id).toString(36)).join('')).join(''); },   // papan 6x4 -> 24 karakter
  unpack(s) { const S = this.sy(), R = CONFIG.rows; return Array.from({ length: CONFIG.reels }, (_, r) => Array.from({ length: R }, (_, w) => S[parseInt(s[r * R + w], 36)])); },
  load() { try { this.list = JSON.parse(localStorage.getItem(this.key) || '[]'); } catch (e) { this.list = []; } },
  add(r) { this.list.unshift(r); if (this.list.length > 200) this.list.length = 200; try { localStorage.setItem(this.key, JSON.stringify(this.list)); } catch (e) {} },
  today() { const d = new Date(); d.setHours(0, 0, 0, 0); return this.list.filter(r => r.t >= d.getTime()); }
};

/* ---------- UI ---------- */
const $ = id => document.getElementById(id);
const UI = {
  fmt: n => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  update() {
    $('val-balance').textContent = this.fmt(State.balance); $('val-bet').textContent = this.fmt(State.bet);
    $('val-win').textContent = this.fmt(State.lastWin); $('bl-amount').textContent = this.fmt(State.balance); $('mb-sound').classList.toggle('off', !State.sound);
    $('btn-turbo').classList.toggle('on', State.turbo);
    $('btn-settings-sound').textContent = 'Sound: ' + (State.sound ? 'ON' : 'OFF'); $('btn-settings-music').textContent = 'Music: ' + (State.music ? 'ON' : 'OFF');
    this.setMultiplier(State.mult); this.setBusy(State.busy); this.setSpinMode();
    $('game').classList.toggle('freemode', State.inFree);
  },
  // Tombol spin: saat Auto aktif -> berubah jadi bingkai kotak berisi sisa auto spin (tekan = matikan Auto);
  // saat Free Spin -> tetap bulat, ikon spin diganti sisa Free Spin. Angka memakai gambar assets/bigwin/num.
  setSpinMode() {
    const fs = State.inFree || State.freeSpins > 0, sq = !fs && State.auto > 0, b = $('btn-spin');
    b.classList.toggle('sq', sq); b.classList.toggle('fsn', fs);
    this.setSpinNum(fs ? State.freeSpins : sq ? State.auto : null, sq);
  },
  setSpinNum(n, sq) {
    const key = n === null ? '' : n + (sq ? 's' : 'c'); if (this._sn === key) return; this._sn = key;
    if (n === null) return;   // isi dibiarkan supaya ikut memudar saat tombol kembali bulat
    const el = $('spin-num'), s = String(n), N = BigWin.NUM, mw = sq ? 13 : 14, mh = sq ? 9 : 11;
    if (!BigWin.numOk) { el.textContent = s; el.style.fontSize = Math.min(mh, mw / (s.length * 0.6)).toFixed(2) + 'cqw'; el.classList.add('txt'); return; }
    el.classList.remove('txt'); el.style.fontSize = '';
    let tw = 0; for (const c of s) tw += N.w[c] || 0;
    el.style.setProperty('--nh', Math.min(mh, mw * N.h / tw).toFixed(2) + 'cqw');   // tinggi angka menyesuaikan jumlah digit
    el.textContent = '';
    for (const c of s) { const im = new Image(); im.alt = ''; im.draggable = false; im.src = 'assets/' + N.file(c); el.appendChild(im); }
  },
  setMultiplier(m) {
    const st = CONFIG.wild.perStep;
    $('val-mult').textContent = 'x' + multOf(m.n);
    $('mult-next').textContent = 'x' + CONFIG.wild.stepValue * (Math.floor(m.n / st) + 1);
    $('mult-ring').style.setProperty('--p', (m.n % st) / st);
  },
  setBusy(b) {
    const lock = b || State.auto > 0 || State.freeSpins > 0 || State.inFree;   // Bet terkunci terus selama Auto / Free Spin (tidak terbuka di sela antar-spin)
    ['btn-bet-up', 'btn-bet-down'].forEach(id => { const el = $(id); if (el) el.disabled = lock; });
    ['btn-info', 'btn-settings'].forEach(id => { const el = $(id); if (el) el.disabled = b; });
    $('btn-spin').disabled = (State.auto > 0 || State.spinning) ? false : (b || State.freeSpins > 0);  // saat Auto: tombol = matikan Auto; saat reel berputar: berhenti
    $('btn-auto').disabled = State.auto > 0 || State.inFree || State.freeSpins > 0;
    $('btn-menu').disabled = b || State.auto > 0 || State.inFree || State.freeSpins > 0;   // menu (hamburger) tidak boleh dibuka saat spin / auto / Free Spin   // saat Auto jalan, tombol Auto pudar; mematikan Auto lewat tombol spin (kotak)
  },
  // Bar tengah: startTips() = teks bergantian; message(t) = teks tetap (Win / Total Win / pesan lain)
  tipIdx: 0,
  // Teks panel pesan: berjalan kanan -> kiri satu kali sampai keluar di kiri, lalu langsung diganti tip berikutnya
  // (scroll=false: teks diam & dikecilkan supaya muat, untuk teks menang)
  setText(el, t, scroll = true) {
    el.style.fontSize = ''; el.textContent = ''; el.classList.remove('scrolling');
    const sp = document.createElement('span'); sp.className = 'mq'; sp.textContent = t;
    el.appendChild(sp);
    const cw = el.clientWidth, tw = sp.getBoundingClientRect().width;
    if (scroll && cw > 0 && tw > 0) {
      const sec = (cw + tw) / (cw * 0.3);            // 0.3 = kecepatan (kecilkan = lebih lambat)
      sp.style.setProperty('--from', cw + 'px');
      sp.style.setProperty('--to', -tw + 'px');
      sp.style.animationDuration = sec.toFixed(2) + 's';
      el.classList.add('scrolling');
      return sp;
    }
    if (!scroll && tw > cw) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * cw / tw * 0.96).toFixed(2) + 'px';
    return null;
  },
  stopTips() { this.tipsOn = false; this.tipRun = (this.tipRun || 0) + 1; clearTimeout(this.tipTimer); const el = $('message-text'); el.style.opacity = 1; },
  startTips() {
    this.stopTips(); this.tipsOn = true; const el = $('message-text'), tips = CONFIG.messageTips, id = this.tipRun;
    const next = () => {
      if (id !== this.tipRun) return;                // dibatalkan (ada teks menang / pesan lain)
      const sp = this.setText(el, tips[this.tipIdx++ % tips.length]);
      if (sp) sp.addEventListener('animationend', next, { once: true });   // teks sudah keluar di kiri -> tip berikutnya masuk dari kanan
      else this.tipTimer = setTimeout(next, 1000);
    };
    next();
  },
  countWin(from, to, ms, off = 0) {   // from/to = menang spin ini (teks tengah); off = total Free Spin sebelumnya (hanya ditambahkan ke kotak Win)   // nilai Total menang naik dari 'from' ke 'to' (dipanggil saat pengali tiba)
    this.stopTips(); const el = $('message-text'), vw = $('val-win'), t0 = performance.now();
    el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)', offset: .25 }, { transform: 'scale(1)' }], { duration: ms, easing: 'ease-out' });
    return new Promise(res => { const step = now => { const k = Math.min((now - t0) / ms, 1), v = round2(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      this.setText(el, `Total win ${this.fmt(v)}`, false); vw.textContent = this.fmt(round2(off + v));
      if (k < 1) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
  },
  resumeTips() { if (!this.tipsOn) this.startTips(); },   // kembali ke tip hanya jika sedang menampilkan teks menang/pesan; kalau tip sudah jalan, jangan diulang
  message(t, scroll = true) { this.stopTips(); this.setText($('message-text'), t, scroll); },
  buildPaytable() {
    const body = $('paytable-body'); body.innerHTML = '';
    CONFIG.symbols.forEach(s => {
      const row = document.createElement('div'); row.className = 'pt-row';
      const ic = document.createElement('div'); ic.className = 'pt-symbol'; ic.dataset.symbol = s.id;
      const img = Assets.symbol(s.id); if (img) ic.style.backgroundImage = `url(${img.src})`; else ic.textContent = s.id;
      const tx = document.createElement('div'), F = CONFIG.freeSpin;
      if (s.scatter) tx.innerHTML = `${F.triggerCount}+ anywhere:<br>${F.baseSpins} Free Spins<br>+${F.extraPerScatter} per extra Scatter`;
      else if (s.wild) tx.innerHTML = 'Wild (reels 2-5): substitutes for all symbols except Scatter. Collected = multiplier rises';
      else tx.innerHTML = Object.entries(s.pays).map(([n, v]) => `${n}x: ${v}`).join('<br>');
      row.append(ic, tx); body.appendChild(row);
    });
    $('paylines-info').textContent = `${Math.pow(CONFIG.rows, CONFIG.reels)} ways. Wins pay from the leftmost reel, min. ${CONFIG.minWayCount} consecutive reels. Payout = paytable x bet size x level x ways. Multiplier starts at x1; every ${CONFIG.wild.perStep} Wilds collected adds +${CONFIG.wild.stepValue}.`;
  },
  buildOptions() {
    const mk = (id, arr, label, active, set) => { const box = $(id); box.innerHTML = '';
      arr.forEach((v, i) => { const b = document.createElement('button'); b.className = 'btn opt' + (active(i, v) ? ' active' : '');
        b.textContent = label(v); b.onclick = () => { set(i, v); }; box.appendChild(b); }); };
    mk('auto-options', CONFIG.autoOptions, v => v, (i, v) => v === UI.autoSel, (i, v) => { UI.autoSel = v; UI.buildOptions(); });
    $('btn-start-auto').disabled = UI.autoSel == null;
  },
  // Panel Auto Spin: pilih jumlah dulu, lalu tekan Start. Panel menutupi area tombol saja (di bawah panel Balance/Bet/Win).
  autoSel: null,
  openAuto() {
    this.autoSel = null; this.buildOptions();
    const s = $('auto-sheet'), p = $('auto-panel'), inn = $('auto-inner'); s.classList.remove('hidden');
    const g = $('game').getBoundingClientRect(), r = $('info-panels').getBoundingClientRect();
    p.style.top = Math.max(0, r.bottom - g.top + g.height * 0.006) + 'px'; inn.style.transform = ''; inn.style.width = '';
    const k = Math.min(1, p.clientHeight / inn.offsetHeight); if (k < 1) { inn.style.transformOrigin = 'top center'; inn.style.transform = `scale(${k.toFixed(3)})`; inn.style.width = (100 / k).toFixed(2) + '%'; }   // kecilkan bila area terlalu pendek
  },
  // Panel Bet Options: dua roda (Bet Size, Bet Level) yang digeser / diketuk; Bet Amount = Base Bet x Size x Level. Baru berlaku setelah Confirm.
  bsel: { si: 0, li: 0 },
  buildBet() {
    const mkEl = (cls, html) => { const d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; return d; };
    const bw = this.bw = { si: { box: $('bt-size'), items: [] }, li: { box: $('bt-level'), items: [] }, h: 1 };
    $('bt-base').textContent = CONFIG.baseBet;
    const fill = (key, arr, make) => { const w = bw[key]; w.box.innerHTML = '';
      for (let k = -2; k < arr.length + 2; k++) { const real = k >= 0 && k < arr.length, el = make(real, real ? arr[k] : null);
        if (real) { el.onclick = () => this.betGo(key, k); w.items.push(el); } w.box.appendChild(el); }
      w.box.addEventListener('scroll', () => { if (this._bq) return; this._bq = requestAnimationFrame(() => { this._bq = 0; this.betSync(); }); }); };
    fill('si', CONFIG.betSizes, (real, v) => mkEl('bt-item' + (real ? '' : ' pad'), real ? v.toFixed(2) : '-'));
    fill('li', CONFIG.betLevels, (real, v) => mkEl('bt-row' + (real ? '' : ' pad'), real ? `<span class="lv">${v}</span><span class="am"></span>` : ''));
  },
  betGo(key, i, smooth = true) { const w = this.bw[key]; w.box.scrollTo({ top: i * this.bw.h, behavior: smooth ? 'smooth' : 'auto' }); },
  betSync() {
    const bw = this.bw, pick = w => Math.max(0, Math.min(w.items.length - 1, Math.round(w.box.scrollTop / bw.h)));
    for (const key of ['si', 'li']) { const w = bw[key], idx = pick(w); this.bsel[key] = idx; w.items.forEach((el, i) => { el.dataset.d = Math.min(3, Math.abs(i - idx)); }); }
    const size = CONFIG.betSizes[this.bsel.si];
    bw.li.items.forEach((el, i) => { el.querySelector('.am').textContent = this.fmt(CONFIG.baseBet * size * CONFIG.betLevels[i]); });
    $('bt-bet').textContent = this.fmt(CONFIG.baseBet * size * CONFIG.betLevels[this.bsel.li]);
  },
  openBet() {
    if (!this.bw) this.buildBet();
    $('bet-sheet').classList.remove('hidden');
    this.bw.h = this.bw.si.items[0].offsetHeight || 1;
    $('bt-bal').textContent = this.fmt(State.balance); $('bt-win').textContent = this.fmt(State.lastWin);
    this.bw.si.box.scrollTop = State.sizeIdx * this.bw.h; this.bw.li.box.scrollTop = Math.max(0, CONFIG.betLevels.indexOf(State.level)) * this.bw.h;
    this.betSync();
  },
  closeBet() { $('bet-sheet').classList.add('hidden'); },
  openHistory() {
    const rows = GameLog.today(), list = $('hs-list'), o = -new Date().getTimezoneOffset(), a = Math.abs(o);
    this.tz = `(GMT${o < 0 ? '-' : '+'}${Math.floor(a / 60)}:${String(a % 60).padStart(2, '0')})`; $('hs-tz').textContent = this.tz;
    const p2 = n => String(n).padStart(2, '0'); let sb = 0, sp = 0;
    list.innerHTML = rows.length ? '' : '<div class="hs-empty">No Game History</div>';
    rows.slice(0, 200).forEach(r => { const d = new Date(r.t), row = document.createElement('div'), id = String(r.id); row.className = 'hs-grid hs-row' + (r.r ? ' can' : '');
      row.innerHTML = `<span>${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}<br>${p2(d.getMonth() + 1)}/${p2(d.getDate())}</span><span>${id.slice(0, 9)}<br>${id.slice(9)}${r.free ? '<em>Free Spin</em>' : ''}</span><span>${this.fmt(r.bet)}</span><span class="${r.profit > 0 ? 'pos' : ''}">${this.fmt(r.profit)}</span><i>${r.r ? '&#8250;' : ''}</i>`;
      if (r.r) row.onclick = () => this.openDetail(r);
      list.appendChild(row); });
    rows.forEach(r => { sb += r.bet; sp += r.profit; });
    $('hs-count').textContent = rows.length + ' Records'; $('hs-bet').textContent = this.fmt(round2(sb)); $('hs-profit').textContent = this.fmt(round2(sp));
    $('hd').classList.add('hidden'); list.scrollTop = 0; $('history-sheet').classList.remove('hidden');
  },
  // Detail 1 spin (seperti PG Soft): header info, papan tiap ronde dengan sel menang menyala, daftar payout, panah ronde sebelumnya / berikutnya
  openDetail(r) {
    const d = new Date(r.t), p2 = n => String(n).padStart(2, '0'), id = String(r.id);
    $('hd-title').textContent = r.free ? 'Free Spin' : 'Normal Spin';
    $('hd-date').textContent = `${d.getFullYear()}/${p2(d.getMonth() + 1)}/${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())} ${this.tz}`;
    $('hd-id').innerHTML = `${id.slice(0, 9)}<br>${id.slice(9)}`; $('hd-bet').textContent = this.fmt(r.bet); $('hd-profit').textContent = this.fmt(r.profit); $('hd-bal').textContent = this.fmt(r.bal);
    const cv = $('hd-canvas'); cv.width = CONFIG.reels * 110; cv.height = CONFIG.rows * 110;
    this.hd = { r, k: 0 }; this.renderDetail(); $('hd').classList.remove('hidden');
  },
  renderDetail() {
    const { r, k } = this.hd, rd = r.r[k], n = r.r.length, board = GameLog.unpack(rd.b), hit = new Set(rd.c), C = 110, R = CONFIG.rows;
    $('hd-meta').innerHTML = `<span>Round ${k + 1}/${n}</span><span>Bet Size ${r.sz != null ? Number(r.sz).toFixed(2) : '-'}</span><span>Bet Level ${r.lv ?? '-'}</span>`;
    $('hd-mult').textContent = 'x' + rd.m; $('hd-prev').style.visibility = k > 0 ? 'visible' : 'hidden'; $('hd-next').style.visibility = k < n - 1 ? 'visible' : 'hidden';
    const cv = $('hd-canvas'), ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#2a1519'; ctx.fillRect(0, 0, cv.width, cv.height);
    board.forEach((col, r0) => col.forEach((id, w) => { const x = r0 * C, y = w * C;
      ctx.fillStyle = (r0 + w) % 2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.12)'; ctx.fillRect(x, y, C, C);
      if (hit.has(r0 * R + w)) { ctx.fillStyle = 'rgba(255,170,40,.22)'; ctx.fillRect(x + 3, y + 3, C - 6, C - 6); ctx.strokeStyle = '#f0a53c'; ctx.lineWidth = 4; ctx.strokeRect(x + 4, y + 4, C - 8, C - 8); }
      const im = Assets.images[id]; if (im) { const s = C * 0.8; ctx.drawImage(im, x + (C - s) / 2, y + (C - s) / 2, s, s); } }));
    const pay = $('hd-pay'); pay.innerHTML = '';
    const row = (ico, t1, t2, amt, cls = '') => { const el = document.createElement('div'); el.className = 'hd-row ' + cls;
      el.innerHTML = `<span class="ic">${ico}</span><span class="tx"><b>${t1}</b>${t2 ? `<small>${t2}</small>` : ''}</span><span class="am">${amt}</span>`; pay.appendChild(el); };
    rd.w.forEach(w => row(`<img src="${ASSETS.base}${ASSETS.symbols[w.symbol]}" alt="">`, `${w.count} of a Kind`, `${w.ways} way(s)`, this.fmt(w.amount)));
    if (!rd.w.length) row('', 'No payout', '', '', 'dim');
    if (k === n - 1 && rd.w.length) { if (r.x > 1) row('', 'Multiplier', '', 'x' + r.x, 'sum'); row('', 'Total Win', '', this.fmt(r.tot), 'sum'); }
  },
  detailGo(d) { const hd = this.hd; if (!hd) return; const k = hd.k + d; if (k < 0 || k >= hd.r.r.length) return; hd.k = k; this.renderDetail(); },
  closeHistory() { $('history-sheet').classList.add('hidden'); },
  // Menu bar (hamburger): tombol kontrol diganti Quit / Sound / Paytable / Rules / History / Close
  setMenu(on) { $('controls').classList.toggle('menu', on); $('menu-bar').classList.toggle('hidden', !on); },
  openInfo(kind) {
    $('ip-title').textContent = kind === 'rules' ? 'Game Rules' : 'Paytable';
    const b = $('ip-body'); b.innerHTML = kind === 'rules' ? this.rulesHTML() : this.paytableHTML(); b.scrollTop = 0; $('info-sheet').classList.remove('hidden');
  },
  paytableHTML() {
    const S = CONFIG.symbols, unit = State.bet / CONFIG.baseBet, F = CONFIG.freeSpin, W = CONFIG.wild, wild = S.find(s => s.wild), ways = Math.pow(CONFIG.rows, CONFIG.reels);
    const img = id => `<img src="${ASSETS.base}${ASSETS.symbols[id]}" alt="">`, num = x => String(+x.toFixed(2));
    const pays = s => `<div class="ip-pays">${[6, 5, 4, 3].map(n => `<b>${n}</b><span>${num(s.pays[n] * CONFIG.payScale * unit)}</span>`).join('')}</div>`;
    const rl = (wild.reels || []).map(r => r + 1), reelTxt = rl.length > 1 ? rl.slice(0, -1).join(', ') + ' and ' + rl[rl.length - 1] : rl.join('');
    const syms = S.filter(s => !s.wild && !s.scatter).sort((a, b) => b.pays[6] - a.pays[6]);
    const mg = cols => { let c = ''; for (let w = 0; w < CONFIG.rows; w++) for (let r = 0; r < CONFIG.reels; r++) c += `<i class="${cols.some(([cr, cw]) => cr === r && cw === w) ? 'on' : ''}"></i>`; return `<div class="mg">${c}</div>`; };
    const ok = '<svg viewBox="0 0 24 24" fill="none" stroke="#e0a85a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>', no = '<svg viewBox="0 0 24 24" fill="none" stroke="#8c91a7" stroke-width="3" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>';
    const ex = syms[syms.length - 1], exPay = ex.pays[3] * CONFIG.payScale * unit;
    const wildBul = `Once ${W.perStep} Wild symbols have been collected, the win multiplier will be increased to x${W.stepValue}, with every additional ${W.perStep} Wild symbols collected increasing the win multiplier by ${W.stepValue} as well.`;
    return `
    <h3 class="ip-h">Symbol Payout Values</h3>
    <div class="ip-grid">
      <div class="ip-cell">${img('SCATTER')}<span class="ip-name">Free Spin<br>symbol</span></div>
      <div class="ip-cell">${img('WILD')}<span class="ip-name">Wild<br>symbol</span></div>
      ${syms.map(s => `<div class="ip-cell">${img(s.id)}${pays(s)}</div>`).join('')}
    </div>
    <p class="ip-note">Values shown for the current bet (${this.fmt(State.bet)}).</p>
    <ul class="ip-ul"><li>Wild symbol substitutes for all symbols except Free Spin symbol.</li><li>Wild symbol appears on reels ${reelTxt} only.</li></ul>
    <hr class="ip-hr"><h3 class="ip-h">Multiplier</h3>
    <div class="ip-pic"><img src="assets/ui/paytable_multiplier.webp" alt="" onerror="this.remove()"></div>
    <ul class="ip-ul"><li>At the start of any main game spin, the win multiplier is x1.</li><li>During any spin, every Wild symbol on the reels will be collected.</li><li>${wildBul}</li></ul>
    <hr class="ip-hr"><h3 class="ip-h">Free Spins Feature</h3>
    <div class="ip-trio">${img('SCATTER')}${img('SCATTER')}${img('SCATTER')}</div>
    <ul class="ip-ul"><li>${F.triggerCount} Free Spin symbols appearing anywhere will trigger the Free Spins Feature with ${F.baseSpins} free spins. Each additional Free Spin symbol will trigger ${F.extraPerScatter} more free spins.</li><li>The win multiplier collected in the spin that triggers the Free Spins Feature is carried over to the Free Spins and keeps growing during the feature.</li><li>During any spin, every Wild symbol on the reels will be collected.</li><li>${wildBul}</li><li>Free spins can be retriggered.</li></ul>
    <hr class="ip-hr"><h3 class="ip-h">${ways.toLocaleString('en-US')} Ways</h3>
    <ul class="ip-ul"><li>Bet ways win if the winning symbols are in succession from the leftmost reel to the right.</li></ul>
    <div class="ip-ex"><div>${mg([[0, 2], [1, 1], [1, 3], [2, 0], [2, 2], [2, 3]])}${ok}</div><div>${mg([[0, 2], [1, 1], [1, 3], [3, 0], [3, 2], [3, 3]])}${no}</div></div>
    <ul class="ip-ul"><li>Total number of winning bet ways for each symbol are calculated by multiplying the number of adjacent winning symbols on each symbols from the leftmost reel to the right.</li></ul>
    <p class="ip-c">From Above Example:</p><p class="ip-g">1 x 2 x 3 = 6</p>
    <ul class="ip-ul"><li>The winning symbol payout is multiplied by the number of winning bet ways.</li></ul>
    <div class="ip-sample"><div class="ip-cell">${img(ex.id)}${pays(ex).replace('<b>3</b><span>', '<b class="g">3</b><span>')}</div><div class="ip-c">Total Winnings in this Example:<p class="ip-g">${num(exPay)} x 6 = ${num(exPay * 6)}</p></div></div>
    <ul class="ip-ul"><li>After the payout of every round is made, all winning symbols will explode allowing the symbols above them to cascade down for a new round.</li><li>Additional winning combination will be tallied in every round until no more winning combination can be tallied.</li><li>All wins shown in cash.</li></ul>`;
  },
  rulesHTML() {
    const sz = CONFIG.betSizes, lv = CONFIG.betLevels, F = CONFIG.freeSpin, W = CONFIG.wild, ways = Math.pow(CONFIG.rows, CONFIG.reels).toLocaleString('en-US'), f2 = n => n.toFixed(2);
    const li = a => `<ul class="ip-ul">${a.map(t => `<li>${t}</li>`).join('')}</ul>`;
    const ic = id => $(id).querySelector('svg').outerHTML, im = f => `<img src="assets/${f}" alt="" onerror="this.remove()">`;
    const row = (icon, name, lines) => `<div class="rr"><span class="rr-ic">${icon}</span><div class="rr-tx"><b>${name}</b>${li(lines)}</div></div>`;
    const bars = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>';
    const coins = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><ellipse cx="12" cy="6.5" rx="6.5" ry="2.8"/><path d="M5.5 6.5v4c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8v-4M5.5 10.5v4c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8v-4M5.5 14.5v3.5c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8v-3.5"/></svg>';
    const stop = `<span class="rr-stop">${im('ui/auto_frame.webp')}<b>98</b></span>`;
    const wildBul = `Once ${W.perStep} Wild symbols have been collected, the win multiplier will be increased to x${W.stepValue}, with every additional ${W.perStep} Wild symbols collected increasing the win multiplier by ${W.stepValue} as well.`;
    return `
    <h3 class="ip-h">${CONFIG.title}</h3>
    ${li([
      `${CONFIG.title} is a ${CONFIG.reels}-reel, ${CONFIG.rows}-row video slot featuring the collection of Wild Symbols to increase the win multiplier.`,
      `The game is played with ${CONFIG.baseBet} base bet for ${ways} ways (fixed), bet level of ${lv[0]} to ${lv[lv.length - 1]} and bet size of ${f2(sz[0])} to ${f2(sz[sz.length - 1])}.`,
      'The Bet Size is set using the "Bet Size" selector.',
      'The Bet Level is set using the "Bet Level" selector.',
      'The Bet Amount is the Base Bet multiplied by the bet size and bet level, and is shown in the "Bet" box.',
      '"Balance" displays the cash available for wager.',
      'Winning combinations and payouts are made according to the "Paytable".',
      'A bet way win in cash is equal to the value shown in the "Paytable" multiplied by the bet size and bet level.',
      'Bet ways win if the winning symbols are in succession from the leftmost reel to the right.',
      'Total number of winning bet ways for each symbol are calculated by multiplying the number of adjacent winning symbols on each symbols from the leftmost reel to the right.',
      'The winning symbol payout is multiplied by the number of winning bet ways.',
      'Simultaneous wins on different bet ways are added.',
      'After the payout of every round is made, all winning symbols will explode allowing the symbols above them to cascade down for a new round.',
      'Additional winning combination will be tallied in every round until no more winning combination can be tallied.',
      'All wins shown in cash.',
      'Wild symbol substitutes for all symbols except Free Spin symbol.',
      'Wild symbol appears on reels 2, 3, 4 and 5 only.',
      `The maximum win of one round (a main game spin and all of its free spins) is ${CONFIG.maxWinX.toLocaleString('en-US')} times the total bet. When it is reached the round ends and any remaining free spins are forfeited.`,
      'Free Spins Feature is played at the same bet size and bet level as the spin that triggered the Free Spins Feature.'])}
    <hr class="ip-hr"><h3 class="ip-h">Multiplier</h3>
    ${li(['At the start of any main game spin, the win multiplier is x1.', 'During any spin, every Wild symbol on the reels will be collected.', wildBul])}
    <hr class="ip-hr"><h3 class="ip-h">Free Spins Feature</h3>
    ${li([`${F.triggerCount} Free Spin symbols appearing anywhere will trigger the Free Spins Feature with ${F.baseSpins} free spins. Each additional Free Spin symbol will trigger ${F.extraPerScatter} more free spins.`, 'The win multiplier collected in the spin that triggers the Free Spins Feature is carried over to the Free Spins and keeps growing during the feature.', 'During any spin, every Wild symbol on the reels will be collected.', wildBul, 'Free spins can be retriggered.', 'During the Free Spins Feature no balance is deducted, the multiplier and collected Wild symbols are carried over from spin to spin, and the Win box shows the total win of the Free Spins Feature.', 'Auto Spin is turned off when the Free Spins Feature is triggered. The free spins are then played automatically.'])}
    <hr class="ip-hr"><h3 class="ip-h">Main Game</h3>
    ${row(im('deco/spin_icon.webp'), 'Spin', ['Tap to start spin at the current Bet Amount.', 'Tap the button during a spin to stop the reels quickly.', 'PC Version only: press the &lt;Space&gt; key to start spin, or to stop the reels while they are spinning.'])}
    ${row(stop, 'Stop', ['Tap to stop Auto Spin. The number on the button indicates the remaining spins for Auto Spin.'])}
    ${row(im('ui/minus.webp'), 'Minus', ['Tap to reduce the Bet Amount.'])}
    ${row(im('ui/plus.webp'), 'Plus', ['Tap to increase the Bet Amount.'])}
    ${row($('panel-balance') ? $('bal-sheet').querySelector('.bl-ico').outerHTML : '', 'Balance', ['Tap to display the balance of available wallets.'])}
    ${row(coins, 'Bet Amount', ['Tap the Bet box to display the Bet Options.', 'Bet Size: Scroll to select the Bet Size.', 'Bet Level: Scroll to select the Bet Level.', 'Bet Amount: Shows the total bet of the selected Bet Size and Bet Level.', 'Max Bet: Tap to set Bet Size and Bet Level to maximum value.', 'Confirm: Tap to apply the selection.', 'The Bet Amount cannot be changed during Auto Spin or the Free Spins Feature.'])}
    ${row(ic('mb-history'), 'Win Amount', ['Tap to display the Game History.'])}
    ${row(im('ui/auto.webp'), 'Auto Spin', ['Auto Spin automatically plays the game for a selected number of spins.', 'Tap on the values to select number of Auto Spins, then tap Start Auto Spin.', 'Tap the Stop button to turn Auto Spin off.'])}
    ${row(im('ui/turbo_off.webp'), 'Turbo Spin', ['Tap to enable or disable the Turbo Spin to reduce the duration of reel spins in the main game.'])}
    ${row(bars, 'More Settings', ['Tap to access additional settings.'])}
    ${row(ic('mb-quit'), 'Quit', ['Tap to exit the game.'])}
    ${row(ic('mb-sound'), 'Sound', ['Tap to turn sound ON or OFF.'])}
    ${row(ic('mb-paytable'), 'Paytable', ['Shows winning combinations and paytable.'])}
    ${row(ic('mb-rules'), 'Rules', ['Shows the game rules and button functions.'])}
    ${row(ic('mb-history'), 'History', ['Shows details of the previous games played.', 'Tap a record to review the rounds and payouts of that spin.'])}
    ${row(ic('mb-close'), 'Close', ['Tap to return to the Main Game.'])}
    <hr class="ip-hr"><h3 class="ip-h">Additional Information</h3>
    <p class="ip-p">Malfunction voids all pays and plays.</p>
    <p class="ip-p">In the event of disputes over game results, all game results that are shown in the game history page are absolute and final.</p>`;
  },
  closeAuto() { $('auto-sheet').classList.add('hidden'); },
  open(id) { $('popup-layer').classList.remove('hidden'); $(id).classList.remove('hidden'); },
  close(id) { $(id).classList.add('hidden'); $('popup-layer').classList.add('hidden'); },
  showAndWait(id) {
    return new Promise(res => { const el = $(id); let t;
      const done = () => { clearTimeout(t); el.removeEventListener('click', done); this.close(id); res(); };
      el.addEventListener('click', done); this.open(id);
      if (State.auto > 0 || State.freeSpins > 0 || State.turbo) t = setTimeout(done, CONFIG.popupAutoCloseMs); });
  },
  async showWin(title, amount) { $('popup-win-title').textContent = title; $('popup-win-amount').textContent = this.fmt(amount); await this.showAndWait('popup-win'); },
  async showBonus(text) { $('popup-bonus-text').textContent = text; await this.showAndWait('popup-bonus'); }
};


/* ---------- FX (efek DOM di atas game: pecahan Wild + cahaya menuju pengali) ---------- */
const Fx = {
  layer() { return $('fx-layer'); },
  pos(el) { const g = $('game').getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - g.left + r.width / 2, y: r.top - g.top + r.height / 2 }; },
  cell(r, row) {
    const g = $('game').getBoundingClientRect(), c = Reels.canvas.getBoundingClientRect();
    return { x: c.left - g.left + (r + 0.5) / CONFIG.reels * c.width, y: c.top - g.top + (row + 0.5) / CONFIG.rows * c.height };
  },
  unit() { return $('game').getBoundingClientRect().width / 100; },   // 1 unit = 1cqw
  el(cls, x, y, size) {
    const d = document.createElement('div'); d.className = cls; d.style.width = d.style.height = size + 'px';
    d.style.left = (x - size / 2) + 'px'; d.style.top = (y - size / 2) + 'px'; this.layer().appendChild(d); return d;
  },
  shatter(r, row) {   // sprite pecahan (grid) diputar sekali di atas kartu
    const sh = Assets.shatter, p = this.cell(r, row); if (!sh) return;
    const cfg = ASSETS.shatter, size = cfg.size * this.unit(), d = this.el('fx-shatter', p.x, p.y, size), n = cfg.cols * cfg.rows;
    d.style.backgroundImage = `url(${sh.src})`; d.style.backgroundSize = `${cfg.cols * 100}% ${cfg.rows * 100}%`;
    const t0 = performance.now(), dur = n / cfg.fps * 1000 / (State.turbo ? CONFIG.speed.turboFactor : 1);
    const step = now => { const k = Math.min((now - t0) / dur, 1), fr = Math.min(n - 1, Math.floor(k * n));
      d.style.backgroundPosition = `${(fr % cfg.cols) / (cfg.cols - 1) * 100}% ${Math.floor(fr / cfg.cols) / (cfg.rows - 1) * 100}%`;
      if (k < 1) requestAnimationFrame(step); else d.remove(); };
    requestAnimationFrame(step);
  },
  burst(x, y) {   // kilatan di kotak Wild saat pecah
    const u = this.unit(), flash = this.el('fx-flash', x, y, 16 * u);
    flash.animate([{ transform: 'scale(.3)', opacity: .95 }, { transform: 'scale(1.3)', opacity: 0 }], { duration: 420, easing: 'ease-out' }).onfinish = () => flash.remove();
  },
  orb(from, to, dur) {   // bola cahaya melengkung dari kotak Wild ke ring pengali, meninggalkan jejak
    const u = this.unit(), OS = 9.5, orb = this.el('fx-orb', from.x, from.y, OS * u), dx = to.x - from.x, dy = to.y - from.y;
    const cx = from.x + dx / 2 + (dy > 0 ? -1 : 1) * Math.abs(dy) * 0.25 * (from.x < to.x ? -1 : 1) - dy * 0.15, cy = from.y + dy / 2 + dx * 0.15 - 6 * u;
    return new Promise(res => { const t0 = performance.now(); let lastTrail = 0;
      const step = now => { const k = Math.min((now - t0) / dur, 1), e = k * k * (3 - 2 * k), m = 1 - e;
        const x = m * m * from.x + 2 * m * e * cx + e * e * to.x, y = m * m * from.y + 2 * m * e * cy + e * e * to.y;
        orb.style.left = (x - OS / 2 * u) + 'px'; orb.style.top = (y - OS / 2 * u) + 'px'; orb.style.transform = `scale(${1 - 0.15 * k})`;
        if (now - lastTrail > 22) { lastTrail = now; const t = this.el('fx-trail', x, y, 6 * u);
          t.animate([{ opacity: .8, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.2)' }], { duration: 320 }).onfinish = () => t.remove(); }
        if (k < 1) requestAnimationFrame(step); else { orb.remove(); res(); } };
      requestAnimationFrame(step); });
  },
  multToWin(mult, f) {   // badge "xN" lepas dari ring pengali, terbang ke bar Total menang, lalu menghantam: nilai di sana naik
    const u = this.unit(), from = this.pos($('mult-ring')), to = this.pos($('message-bar')), dur = 850 / f, size = 15 * u;
    const b = this.el('fx-multfly', from.x, from.y, size); b.textContent = 'x' + mult; b.style.fontSize = (size * 0.8) + 'px';
    this.hitMeter(); Sound.play('multUp');
    const dx = to.x - from.x, dy = to.y - from.y, cx = from.x + dx * 0.5 - 14 * u, cy = from.y + dy * 0.5 - 4 * u;
    return new Promise(res => { const t0 = performance.now(); let lastTrail = 0;
      const step = now => { const k = Math.min((now - t0) / dur, 1), e = k * k * (3 - 2 * k), m = 1 - e;
        const x = m * m * from.x + 2 * m * e * cx + e * e * to.x, y = m * m * from.y + 2 * m * e * cy + e * e * to.y;
        b.style.left = (x - size / 2) + 'px'; b.style.top = (y - size / 2) + 'px';
        b.style.transform = `scale(${0.7 + 0.9 * Math.sin(Math.PI * Math.min(1, k * 0.9 + 0.05)) + 0.2 * k})`;
        if (k < 1) requestAnimationFrame(step);
        else { b.remove(); const fl = this.el('fx-flash', to.x, to.y, 40 * u);
          fl.animate([{ transform: 'scale(.4)', opacity: .95 }, { transform: 'scale(1.3)', opacity: 0 }], { duration: 520, easing: 'ease-out' }).onfinish = () => fl.remove();
          this.winGlow(1); res(); } };
      requestAnimationFrame(step); });
  },
  hitMeter() {   // ring pengali berdenyut saat cahaya masuk
    const ring = $('mult-ring'), val = $('val-mult');
    ring.animate([{ transform: 'scale(1)', filter: 'brightness(1)' }, { transform: 'scale(1.14)', filter: 'brightness(1.6)' }, { transform: 'scale(1)', filter: 'brightness(1)' }], { duration: 360, easing: 'ease-out' });
    val.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'ease-out' });
    const p = this.pos(ring), u = this.unit(), r = this.el('fx-ripple', p.x, p.y, 24 * u);
    r.animate([{ transform: 'scale(.9)', opacity: .8 }, { transform: 'scale(1.5)', opacity: 0 }], { duration: 500, easing: 'ease-out' }).onfinish = () => r.remove();
  },
  // Gelombang cahaya bulat di belakang tombol spin (hover / tekan / saat reel berputar) + percikan
  spinWave(power = 1) {
    const b = $('btn-spin'); if (!b) return; const w = b.getBoundingClientRect().width, n = Math.round(8 + 10 * power);
    const ring = document.createElement('i'); ring.className = 'spin-wave'; b.appendChild(ring);
    ring.animate([{ transform: 'translate(-50%,-50%) scale(.8)', opacity: 0.95 }, { transform: `translate(-50%,-50%) scale(${1.45 + 0.65 * power})`, opacity: 0 }], { duration: 850, easing: 'ease-out' }).onfinish = () => ring.remove();
    if (power > 1) { const r2 = document.createElement('i'); r2.className = 'spin-wave'; b.appendChild(r2);
      r2.animate([{ transform: 'translate(-50%,-50%) scale(.8)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 0.8, offset: 0.2 }, { transform: `translate(-50%,-50%) scale(${1.9 + 0.5 * power})`, opacity: 0 }], { duration: 1150, delay: 140, easing: 'ease-out', fill: 'backwards' }).onfinish = () => r2.remove(); }
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i'); s.className = 'spin-spark'; const a = Math.random() * 6.283, d0 = w * (0.4 + Math.random() * 0.06), d1 = w * (0.62 + Math.random() * 0.4 * power), sz = 0.5 + Math.random() * 0.9;
      s.style.width = s.style.height = sz + 'cqw'; s.style.background = ['#fff1b0', '#ffc94a', '#ff9a2e'][i % 3]; b.appendChild(s);
      s.animate([{ transform: `translate(-50%,-50%) translate(${Math.cos(a) * d0}px,${Math.sin(a) * d0}px) scale(1)`, opacity: 1 },
                 { transform: `translate(-50%,-50%) translate(${Math.cos(a) * d1}px,${Math.sin(a) * d1}px) scale(.1)`, opacity: 0 }], { duration: 600 + Math.random() * 500, easing: 'cubic-bezier(.15,.7,.3,1)' }).onfinish = () => s.remove();
    }
  },
  // Kemenangan: panel pesan + kotak Menang menyala emas; api dari bar bawah menuju grid
  winGlow(strength = 1) {
    ['message-bar', 'panel-win'].forEach(id => { const el = $(id); if (!el) return; el.classList.remove('winflash'); void el.offsetWidth; el.classList.add('winflash'); });
    Fire.pulse('bottom', Math.min(1, 0.55 + 0.45 * strength), 1100);
  },
  // Suspense Scatter ke-3: atas grid menyala, berkas cahaya turun ke tiap reel, denyut jantung merah
  async suspenseStart(f) {
    $('game').classList.add('suspense'); Sound.play('anticipate'); Fire.hold[0] = 1; $('fire-canvas').style.zIndex = '0'; $('reel-canvas').style.zIndex = '1';   // api tepi atas menyala, digambar di belakang simbol
    Reels.dimOn = true; Reels.dimT = performance.now(); Reels.dimFade = 1; Reels.susFocus = null;   // reel menggelap, hanya Scatter yang terang
    await Reels.tween(1000 / f, () => {});
  },
  async suspenseEnd(st, f) {
    Fire.hold[0] = 0; Fire.focus = null; await sleep(300 / f);
    if (st.scatterAfter >= CONFIG.freeSpin.triggerCount) {   // Scatter ke-3 (atau lebih) mendarat -> Free Spin
      Sound.play('bonus'); this.flashGrid(); Fire.pulse('top', 1, 1400); Fire.pulse('bottom', 1, 1400);
      await sleep(1100 / f);
    } else { await sleep(350 / f); }
    Reels.susFocus = null; await Reels.tween(250, k => { Reels.dimFade = 1 - k; }); Reels.dimOn = false; Reels.dimFade = 1; Reels.draw();   // terang kembali
    $('fire-canvas').style.zIndex = ''; $('reel-canvas').style.zIndex = '';   // api kembali di depan (Free Spin / menang)
    $('game').classList.remove('suspense');
  },
  flashGrid() { const el = $('reel-area'); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
    const p = this.pos(el), u = this.unit(), fl = this.el('fx-flash', p.x, p.y, 70 * u);
    fl.animate([{ transform: 'scale(.4)', opacity: 0.9 }, { transform: 'scale(1.25)', opacity: 0 }], { duration: 700, easing: 'ease-out' }).onfinish = () => fl.remove(); },
  scatterLand(i, st) {   // tiap Scatter baru yang mendarat di reel i
    (st.newScatter || []).filter(([r]) => r === i).forEach(([r, row]) => { const p = this.cell(r, row); this.burst(p.x, p.y); Reels.pop(r, row); Sound.play('bonus');
      const el = $('reel-area'); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); });
  },
  // Semua Wild yang pecah: serpihan di tempat, lalu cahaya terbang ke pengali satu per satu; meter naik saat tiap cahaya tiba
  async wildToMeter(list, f, n0, cells) {
    if (!list.length) return;
    const to = this.pos($('mult-ring')), S = CONFIG.speed, cols = [...new Set((cells || list).map(c => c[0]))].sort((a, b) => a - b); let got = 0;
    await Promise.all(list.map(([r, row], i) => { const from = this.cell(r, row);
      return sleep((cols.indexOf(r) * S.explodeStepMs + i * 60) / f).then(() => { this.burst(from.x, from.y); return sleep(120 / f); })
        .then(() => this.orb(from, to, 650 / f))
        .then(() => { got++; this.hitMeter(); Sound.play('multUp'); UI.setMultiplier({ n: n0 + got }); }); }));
  }
};

/* ---------- FIRE: partikel api di tepi grid. Free Spin = semua tepi; pulse(edge) = dorongan sesaat; hold = menyala terus (suspense) ---------- */
const Fire = {
  p: [], k: 0, acc: 0, t: 0, boost: [0, 0, 0, 0], bdec: [0, 0, 0, 0], hold: [0, 0, 0, 0], acc2: [0, 0, 0, 0], beamK: 0, beamTarget: 0, focus: null, acc3: 0,
  EDGE: { top: 0, right: 1, bottom: 2, left: 3 },
  init() {
    this.cv = $('fire-canvas'); this.ctx = this.cv.getContext('2d');
    const mk = (r, g, b) => { const s = document.createElement('canvas'); s.width = s.height = 64; const c = s.getContext('2d'), gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, `rgba(${r},${g},${b},.95)`); gr.addColorStop(0.3, `rgba(${r},${g},${b},.55)`); gr.addColorStop(0.7, `rgba(${r},${g},${b},.12)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      c.fillStyle = gr; c.fillRect(0, 0, 64, 64); return s; };
    this.sprites = [mk(255, 205, 80), mk(255, 135, 25), mk(215, 45, 15)];   // kuning keemasan -> oranye -> merah
    this.resize(); window.addEventListener('resize', () => this.resize());
  },
  resize() {
    const r = this.cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.cv.width = Math.round(this.w * d); this.cv.height = Math.round(this.h * d); this.ctx.setTransform(d, 0, 0, d, 0, 0);
  },
  // Dorongan api sesaat di satu tepi ('top' | 'right' | 'bottom' | 'left'); strength 0-1; ms = lama memudar
  pulse(edge, strength, ms) { const e = this.EDGE[edge]; this.boost[e] = Math.max(this.boost[e], strength); this.bdec[e] = this.boost[e] / (ms / 1000); },
  spawn(edge, deep, x0, x1) {
    const F = CONFIG.fire, W = this.w, H = this.h, R = (a, b) => a + Math.random() * (b - a);
    if (edge == null) { let t = Math.random() * 2 * (W + H); edge = t < W ? 0 : (t -= W) < H ? 1 : (t -= H) < W ? 2 : 3; }
    let x, y, dx = 0, dy = 0;
    if (edge === 0) { x = x0 != null ? x0 + Math.random() * (x1 - x0) : Math.random() * W; y = -2; dy = 1; }            // atas -> turun
    else if (edge === 1) { x = W + 2; y = Math.random() * H; dx = -1; }   // kanan -> ke kiri
    else if (edge === 2) { x = Math.random() * W; y = H + 2; dy = -1; }   // bawah -> naik
    else { x = -2; y = Math.random() * H; dx = 1; }                       // kiri -> ke kanan
    const m = deep || 1, life = R(F.life[0], F.life[1]) * (deep ? 1.15 : 1), dist = R(F.reach[0], F.reach[1]) * W * m, sp = dist / life;
    this.p.push({ x, y, vx: dx * sp, vy: dy * sp, age: 0, life, size: R(F.size[0], F.size[1]) * (deep ? 1.25 : 1), ph: Math.random() * 6.28 });
  },
  step(dt) {
    const target = State.inFree ? 1 : 0; this.k = lerp(this.k, target, dt * (target ? 2.5 : 2.2));
    this.beamK = lerp(this.beamK, this.beamTarget, dt * 4);
    const ctx = this.ctx, W = this.w, H = this.h, edgeS = [0, 1, 2, 3].map(e => Math.max(this.boost[e], this.hold[e]));
    if (this.k < 0.01 && !this.p.length && edgeS.every(v => v < 0.002) && this.beamK < 0.01) { if (!this.clean) { ctx.clearRect(0, 0, W, H); this.clean = true; } return; }
    this.clean = false; this.t += dt;
    this.acc += CONFIG.fire.rate * this.k * (State.turbo ? 1.3 : 1) * dt;
    while (this.acc >= 1) { this.acc--; this.spawn(); }
    for (let e = 0; e < 4; e++) {   // api tambahan per tepi (pecah = bawah, suspense = atas, lebih dalam menuju grid)
      if (edgeS[e] > 0.002) { this.acc2[e] += CONFIG.fire.edgeRate * edgeS[e] * (this.hold[e] > 0.5 ? CONFIG.suspense.edgeDensity : 1) * dt; while (this.acc2[e] >= 1) { this.acc2[e]--; this.spawn(e, this.hold[e] > 0.5 ? CONFIG.suspense.edgeDepth : 1.5); } }
      this.boost[e] = Math.max(0, this.boost[e] - this.bdec[e] * dt);
    }
    if (this.focus != null && this.hold[0] > 0.5) {   // api ekstra dari atas tepat di reel yang sedang turun (hanya saat suspense)
      const cw = W / CONFIG.reels; this.acc3 += CONFIG.fire.edgeRate * 1.1 * CONFIG.suspense.edgeDensity * dt;
      while (this.acc3 >= 1) { this.acc3--; this.spawn(0, CONFIG.suspense.focusDepth, this.focus * cw + cw * 0.1, (this.focus + 1) * cw - cw * 0.1); } }
    ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
    // pita cahaya hangat di sepanjang tepi (dasar api), berkedip halus
    const fl = 0.8 + 0.2 * Math.sin(this.t * 11) * Math.sin(this.t * 7.3 + 1), b = Math.min(W, H) * 0.07;
    const band = (a, x0, y0, x1, y1, rx, ry, rw, rh) => { const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, `rgba(255,150,30,${a})`); g.addColorStop(1, 'rgba(255,90,20,0)'); ctx.fillStyle = g; ctx.fillRect(rx, ry, rw, rh); };
    const sus = e => this.hold[e] > 0.5 && this.hold[e] >= this.boost[e];   // tepi ini sedang suspense -> pita lebih tipis & redup
    const a = e => Math.min(0.9, (0.3 * this.k + 0.7 * edgeS[e]) * fl * (sus(e) ? CONFIG.suspense.bandAlpha : 1)), bb = e => b * (1 + 1.6 * edgeS[e] * (sus(e) ? CONFIG.suspense.bandK : 1));
    band(a(0), 0, 0, 0, bb(0), 0, 0, W, bb(0)); band(a(2), 0, H, 0, H - bb(2), 0, H - bb(2), W, bb(2));
    band(a(3), 0, 0, bb(3), 0, 0, 0, bb(3), H); band(a(1), W, 0, W - bb(1), 0, W - bb(1), 0, bb(1), H);
    if (this.beamK > 0.01) {   // berkas cahaya dari atas ke tiap reel (suspense: mencari Scatter ke-3)
      for (let i = 0; i < CONFIG.reels; i++) { const cw = W / CONFIG.reels, al = 0.46 * this.beamK * (0.65 + 0.35 * Math.sin(this.t * 8 + i * 0.9)) * (this.focus == null ? 1 : i === this.focus ? 1.7 : 0.2), g = ctx.createLinearGradient(0, 0, 0, H * 0.85);
        g.addColorStop(0, `rgba(255,110,30,${al})`); g.addColorStop(0.35, `rgba(255,170,60,${al * 0.45})`); g.addColorStop(1, 'rgba(255,120,30,0)');
        ctx.fillStyle = g; ctx.fillRect(i * cw + cw * 0.06, 0, cw * 0.88, H * 0.85); }
    }
    for (let i = this.p.length - 1; i >= 0; i--) {
      const q = this.p[i]; q.age += dt;
      if (q.age >= q.life) { this.p.splice(i, 1); continue; }
      const u = q.age / q.life, wob = Math.sin(q.ph + q.age * 9) * 16 * dt;
      q.x += q.vx * dt + (q.vy ? wob : 0); q.y += q.vy * dt + (q.vx ? wob : 0);
      const s = q.size * (1.1 - 0.7 * u), spr = this.sprites[u < 0.25 ? 0 : u < 0.6 ? 1 : 2];
      ctx.globalAlpha = Math.pow(1 - u, 1.2) * 0.9 * Math.min(1, Math.max(this.k, 0.6) * 1.5);
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(Math.atan2(q.vy, q.vx));
      ctx.drawImage(spr, -s * 1.7, -s * 0.5, s * 3.4, s); ctx.restore();   // lonjong searah gerak = lidah api
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
};

/* ---------- STORM: petir + cahaya di belakang pengali & wayang. Awan = CSS (selalu ada); modul ini hanya aktif saat Free Spin ---------- */
const Storm = {
  k: 0, t: 0, next: 0, last: -1, was: false, clean: true, strikes: [], rate: 1, anims: [],
  init() { this.cv = $('storm-canvas'); this.ctx = this.cv.getContext('2d'); this.resize();
    this.anims = [...document.querySelectorAll('.cloud-layer')].map(el => el.getAnimations ? el.getAnimations()[0] : null).filter(Boolean);
    window.addEventListener('resize', () => this.resize()); },   // this.anims = animasi geser awan (CSS)
  resize() {
    const r = this.cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.cv.width = Math.round(this.w * d); this.cv.height = Math.round(this.h * d); this.ctx.setTransform(d, 0, 0, d, 0, 0); this.clean = false;
  },
  rnd(a, b) { return a + Math.random() * (b - a); },
  // Satu sambaran: pilih bentuk petir acak (tidak sama dengan sebelumnya), posisi acak, kadang dicerminkan
  strike(delay = 0) {
    const imgs = Assets.storm.filter(Boolean), C = CONFIG.storm; if (!imgs.length) return;
    let i; do { i = Math.floor(Math.random() * imgs.length); } while (imgs.length > 1 && i === this.last); this.last = i;
    const img = imgs[i], h = this.h * this.rnd(C.height[0], C.height[1]), z = Math.random();
    const fx = z < 0.45 ? this.rnd(0.14, 0.34) : z < 0.9 ? this.rnd(0.66, 0.86) : this.rnd(0.04, 0.96);   // utamakan sisi kiri/kanan; tengah tertutup bingkai pengali
    this.strikes.push({ img, h, w: img.width * h / img.height * 1.3, x: fx * this.w, y: -this.h * this.rnd(0.12, 0.02), rot: this.rnd(-0.16, 0.16),
      flip: Math.random() < 0.5, age: -delay, life: this.rnd(C.life[0], C.life[1]), seed: Math.random() * 10 });
  },
  // Terang tajam di awal, 2-3 kedipan, lalu padam
  env(u, seed) {
    const P = [[0, 0], [0.05, 1], [0.13, 0.2], [0.2, 0.95], [0.3, 0.35], [0.42, 0.8], [0.6, 0.25], [1, 0]];
    for (let i = 1; i < P.length; i++) if (u <= P[i][0]) { const [t0, v0] = P[i - 1], [t1, v1] = P[i]; return (v0 + (v1 - v0) * (u - t0) / (t1 - t0)) * (0.88 + 0.12 * Math.sin(u * 70 + seed)); }
    return 0;
  },
  step(dt) {
    const C = CONFIG.storm, on = State.inFree;
    this.k = lerp(this.k, on ? 1 : 0, dt * (on ? 2.2 : 2.8));
    const rate = 1 + C.cloudBoost * this.k;   // awan bergerak lebih cepat saat Free Spin (playbackRate: posisi tetap kontinu)
    if (Math.abs(rate - this.rate) > 0.004) { this.rate = rate; this.anims.forEach(a => { a.playbackRate = rate; }); }
    if (on && !this.was) { this.strike(0); this.strike(0.14); this.next = 1.3; }   // masuk Free Spin: langsung menyambar
    this.was = on;
    if (this.k < 0.01 && !this.strikes.length) { if (!this.clean) { this.ctx.clearRect(0, 0, this.w, this.h); this.clean = true; } return; }
    this.clean = false; this.t += dt;
    if (on) { this.next -= dt; if (this.next <= 0) { this.strike(); if (Math.random() < C.double) this.strike(this.rnd(0.08, 0.22)); this.next = this.rnd(C.gap[0], C.gap[1]); } }
    const ctx = this.ctx, W = this.w, H = this.h, k = this.k; ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
    // cahaya biru samar yang berdenyut di dalam awan
    const amb = C.ambient * k * (0.7 + 0.3 * Math.sin(this.t * 1.7) * Math.sin(this.t * 0.9 + 1));
    if (amb > 0.002) [0.2, 0.5, 0.8].forEach((fx, i) => { const x = fx * W, y = H * 0.35, R = W * 0.42, g = ctx.createRadialGradient(x, y, 0, x, y, R), a = amb * (0.75 + 0.25 * Math.sin(this.t * 2.3 + i * 2));
      g.addColorStop(0, `rgba(120,160,255,${a})`); g.addColorStop(1, 'rgba(90,110,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - R, 0, R * 2, H); });
    let flash = 0;
    for (let i = this.strikes.length - 1; i >= 0; i--) {
      const s = this.strikes[i]; s.age += dt; if (s.age < 0) continue;
      const u = s.age / s.life; if (u >= 1) { this.strikes.splice(i, 1); continue; }
      const e = this.env(u, s.seed) * Math.min(1, k * 1.5); flash += e;
      const cx = s.x, cy = H * 0.38, R = W * 0.36, g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);   // cahaya di belakang wayang: menyinari tepi siluet & awan
      g.addColorStop(0, `rgba(185,220,255,${0.75 * e})`); g.addColorStop(0.4, `rgba(90,150,255,${0.4 * e})`); g.addColorStop(1, 'rgba(60,90,255,0)');
      ctx.fillStyle = g; ctx.fillRect(cx - R, 0, R * 2, H);
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot); if (s.flip) ctx.scale(-1, 1);
      ctx.globalAlpha = Math.min(1, e); ctx.drawImage(s.img, -s.w / 2, 0, s.w, s.h);
      ctx.globalAlpha = Math.min(1, e * 0.7); ctx.drawImage(s.img, -s.w / 2, 0, s.w, s.h);   // lapis kedua (additif): inti petir memutih
      ctx.restore();
    }
    if (flash > 0) { const g = ctx.createLinearGradient(0, 0, 0, H), a = Math.min(0.6, C.flash * flash);   // kilatan menyapu pita atas, memudar ke bawah
      g.addColorStop(0, `rgba(110,160,255,${a})`); g.addColorStop(1, 'rgba(110,160,255,0)'); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
};

/* ---------- DECO: ikon spin berputar + wayang bergerak (dihaluskan, tanpa lompatan saat kecepatan berubah) ---------- */
const lerp = (a, b, k) => a + (b - a) * Math.min(1, k);
const Deco = {
  sc: 1, aura: 0, a: 0, v: CONFIG.spinIcon.idleDps, wy: { period: CONFIG.wayang.idle.period, rot: CONFIG.wayang.idle.rot, bob: CONFIG.wayang.idle.bob }, ph: 0, last: 0,
  init() {
    this.icon = $('spin-icon'); this.btn = $('btn-spin'); this.t = 0; this.hov = 0; this.hovS = 0; this.wt = 0.3;
    this.btn.addEventListener('pointerenter', () => { this.hov = 1; if (!this.btn.disabled && !State.spinning) Fx.spinWave(0.5); });
    this.btn.addEventListener('pointerleave', () => { this.hov = 0; });
    this.btn.addEventListener('pointerdown', () => { if (!this.btn.disabled && !State.spinning) Fx.spinWave(0.9); }); this.wl = $('wayang-l'); this.wr = $('wayang-r');
    const loop = now => { const dt = Math.min((now - (this.last || now)) / 1000, 0.05); this.last = now; this.step(dt); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  },
  step(dt) {
    // Ikon spin: pelan saat diam, kencang saat reel berputar (percepatan halus)
    const S = CONFIG.spinIcon, target = State.spinning ? S.fastDps * (State.turbo ? S.turboBoost : 1) : S.idleDps;
    this.v = lerp(this.v, target, dt * (target > this.v ? 5 : 1.8));
    this.a = (this.a + this.v * dt) % 360;
    this.icon.style.transform = `translate(-50%,-50%) rotate(${this.a.toFixed(2)}deg)`;
    // Cahaya tombol spin: berdenyut pelan saat diam, makin terang & cepat saat reel berputar
    this.t += dt * (2.2 + 5 * Math.min(1, this.v / S.fastDps));
    this.hovS = lerp(this.hovS, this.hov, dt * 8);
    this.btn.style.setProperty('--glow', Math.min(1.4, 0.45 + 0.4 * Math.min(1, this.v / S.fastDps) + 0.15 * Math.sin(this.t) + 0.35 * this.hovS).toFixed(3));
    if (State.spinning) { this.wt += dt; if (this.wt > 0.45) { this.wt = 0; Fx.spinWave(0.7); } } else this.wt = 0.3;   // gelombang terus-menerus selama reel berputar
    // Wayang: parameter bergeser halus antara mode biasa dan free spin
    const W = CONFIG.wayang[State.inFree ? 'free' : 'idle'], y = this.wy, k = dt * 1.6;
    y.period = lerp(y.period, W.period, k); y.rot = lerp(y.rot, W.rot, k); y.bob = lerp(y.bob, W.bob, k);
    this.ph += dt * 2 * Math.PI / y.period;
    const sway = (p, lean) => lean + y.rot * (Math.sin(p) + 0.35 * Math.sin(2.3 * p + 1)) / 1.35;
    const bob = p => -y.bob * (0.5 + 0.5 * Math.sin(p * 2 + 0.6));
    // kiri condong ke kanan (+), kanan condong ke kiri (-), supaya seolah saling menghadap & menyapa pengali
    // Free spin: wayang membesar (dari kaki) dan berpendar api; keluar dari free spin kembali halus
    const fr = State.inFree; this.sc = lerp(this.sc, fr ? CONFIG.wayang.freeScale : 1, dt * 2.2); this.aura = lerp(this.aura, fr ? 1 : 0, dt * 2.2);
    const pu = 0.8 + 0.2 * Math.sin(this.ph * 3.1), au = this.aura * pu, sc = this.sc.toFixed(4);
    const filt = this.aura > 0.02 ? `drop-shadow(0 0 ${(1.2 * au).toFixed(2)}cqw rgba(255,190,70,${(0.95 * au).toFixed(2)})) drop-shadow(0 0 ${(3.4 * au).toFixed(2)}cqw rgba(255,100,25,${(0.8 * au).toFixed(2)})) brightness(${(1 + 0.12 * au).toFixed(3)})` : '';
    this.wl.style.filter = this.wr.style.filter = filt;
    this.wl.style.transform = `translateY(${bob(this.ph).toFixed(3)}cqw) rotate(${sway(this.ph, 0.6).toFixed(3)}deg) scale(${sc})`;
    this.wr.style.transform = `translateY(${bob(this.ph + 1.7).toFixed(3)}cqw) rotate(${sway(-this.ph * 0.97 + 2.1, -0.6).toFixed(3)}deg) scale(${sc})`;
    Fire.step(dt); Storm.step(dt); Music.step(dt);
  }
};

/* ---------- BIG WIN: Big / Mega / Super Mega. Angka naik terus; judul & tema berganti saat melewati ambang ---------- */
const GEM = {   // hiasan Big Win memakai gambar simbol milikmu (assets/symbols/). [file, miring (deg), c = tengah | s = samping | w = tengah tinggi (wayang)]
  sets: {
    big:   [['gem_sapphire.webp', -14, 's'], ['gem_emerald.webp', 0, 'c'],  ['gem_sapphire.webp', 14, 's']],
    mega:  [['gem_emerald.webp', -10, 's'],  ['gem_ruby.webp', 0, 'c'],     ['gem_emerald.webp', 10, 's']],
    super: [['gem_ruby.webp', -10, 's'],     ['wayang_2.webp', 0, 'w'],     ['gem_ruby.webp', 10, 's']]
  }
};
const BW_PAL = { big: ['#ffd24a', '#ff6a2b', '#fff1b8'], mega: ['#7fd8ff', '#2f8bff', '#e6f7ff'], super: ['#ff7be8', '#ffd24a', '#b35cff'] };   // warna confetti per tier
const BigWin = {
  open: false, parts: [],
  init() {
    this.el = $('bigwin'); this.cv = $('bw-canvas'); this.ctx = this.cv.getContext('2d');
    CONFIG.winTiers.forEach(t => { if (t.img) new Image().src = 'assets/' + t.img; });   // muat dulu agar tidak berkedip
    '0123456789.,'.split('').forEach(c => { const im = new Image(); im.onerror = () => { this.numOk = false; }; im.src = 'assets/' + this.NUM.file(c); });   // muat angka ornamental
    this.spk = new Image(); this.spk.src = 'assets/effects/fs_sparkle.webp';   // kilau untuk partikel canvas
    this.el.addEventListener('click', () => this.tap());
    window.addEventListener('keydown', e => { if (this.open && (e.code === 'Space' || e.code === 'Enter')) { e.preventDefault(); this.tap(); } });
  },
  resize() { const r = this.el.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2); this.W = r.width; this.H = r.height;
    this.cv.width = Math.round(r.width * d); this.cv.height = Math.round(r.height * d); this.ctx.setTransform(d, 0, 0, d, 0, 0); },
  tap() { if (!this.open) return; if (!this.finished) this.skip = true; else this.close(); },
  // Titik waktu: 0 -> ambang tier 1 -> ... -> ambang tier tercapai -> total. Nilai dihitung linear per segmen (segmen terakhir melambat)
  timeline(total, bet, tiers) {
    const W = CONFIG.winCount, pts = [[0, 0]]; let t = W.firstMs; pts.push([t, bet * tiers[0].min]);
    for (let i = 1; i < tiers.length; i++) { t += W.stepMs; pts.push([t, bet * tiers[i].min]); }
    t += W.stepMs; pts.push([t, total]); return pts;
  },
  valueAt(pts, ms) {
    if (ms >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
    for (let i = 1; i < pts.length; i++) if (ms <= pts[i][0]) { const [t0, v0] = pts[i - 1], [t1, v1] = pts[i]; let k = (ms - t0) / (t1 - t0); if (i === pts.length - 1) k = 1 - (1 - k) * (1 - k); return v0 + (v1 - v0) * k; }
  },
  // Judul tier: gambar logo kalau tier punya `img` (jatuh ke teks bila file tidak ada)
  fillTitle(ti, t) {
    const txt = () => { ti.className = t.lines.length > 1 ? 'two' : 'one'; ti.innerHTML = t.lines.map(s => `<span class="bw-line" data-text="${s}">${s}</span>`).join(''); };
    if (!t.img) return txt();
    ti.className = 'img'; ti.innerHTML = `<img class="bw-img" alt="" src="assets/${t.img}">`; const im = ti.firstChild; im.onerror = () => { txt(); this.placeAmount(); }; im.onload = () => this.placeAmount();
    $('bw-amountbox').style.top = '';   // sementara pakai posisi bawaan sampai gambar judul selesai dimuat
    if (im.complete && im.naturalWidth) this.placeAmount();
  },
  // Taruh angka kemenangan tepat di bawah judul: tinggi judul diukur dari piksel terakhir yang terlihat (bukan tepi gambar yang transparan)
  titleBottom(im) {
    if (im._vb != null) return im._vb;
    try { const w = 64, h = Math.max(1, Math.round(w * im.naturalHeight / im.naturalWidth)), c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d'); x.drawImage(im, 0, 0, w, h); const d = x.getImageData(0, 0, w, h).data; let last = h - 1;
      for (; last > 0; last--) { let hit = false; for (let i = 0; i < w; i++) if (d[(last * w + i) * 4 + 3] > 128) { hit = true; break; } if (hit) break; }
      im._vb = (last + 1) / h; } catch (e) { im._vb = 1; }
    return im._vb;
  },
  placeAmount() {
    const ti = $('bw-title'), im = ti.firstChild, box = $('bw-amountbox'), u = this.el.clientWidth / 100;
    if (ti.className !== 'img' || !im || !im.naturalWidth || !u) { box.style.top = ''; return; }
    const GAP = 1.5;   // jarak angka ke judul (cqw); kecilkan supaya makin dekat
    box.style.top = (62 + im.offsetHeight / u * this.titleBottom(im) + GAP).toFixed(2) + 'cqw';   // 62 = top judul gambar di CSS
  },
  setTier(i, first) {
    const t = this.tiers[i], prev = this.tiers[this.idx]; if (prev && prev.sound) Sound.stop(prev.sound);   // suara tier sebelumnya berhenti
    this.idx = i; this.el.dataset.theme = t.key; if (t.sound) Sound.play(t.sound);   // tiap tier punya suara sendiri
    document.querySelectorAll('#bigwin .bw-bg').forEach(b => b.classList.toggle('on', b.dataset.t === t.key));
    const ti = $('bw-title'); this.fillTitle(ti, t);
    const gm = $('bw-gems'); gm.className = 'n' + GEM.sets[t.key].length; gm.innerHTML = '';
    GEM.sets[t.key].forEach(([file, rot, role], k) => { const d = document.createElement('div'); d.className = 'g ' + role; d.style.setProperty('--rot', rot + 'deg'); d.innerHTML = `<img src="assets/symbols/${file}" alt="">`; gm.appendChild(d);
      d.animate([{ transform: 'scale(.15) rotate(-50deg)', opacity: 0 }, { transform: 'scale(1.25) rotate(8deg)', opacity: 1, offset: 0.65 }, { transform: 'scale(1) rotate(0)', opacity: 1 }], { duration: 650, delay: first ? 150 + k * 90 : k * 70, easing: 'ease-out', fill: 'backwards' }); });
    if (!first) { ti.animate([{ transform: 'scale(.5)', opacity: 0 }, { transform: 'scale(1.22)', opacity: 1, offset: 0.55 }, { transform: 'scale(1)' }], { duration: 600, easing: 'cubic-bezier(.2,1.3,.4,1)' });
      const fl = $('bw-flash'); fl.animate([{ opacity: 0.95 }, { opacity: 0 }], { duration: 700, easing: 'ease-out' });
      this.el.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-1.2cqw,.8cqw)' }, { transform: 'translate(1cqw,-.8cqw)' }, { transform: 'translate(-.6cqw,.4cqw)' }, { transform: 'translate(0,0)' }], { duration: 420 });
      this.burst(70 + 30 * i); }
    else { $('bw-title').animate([{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.18)', opacity: 1, offset: 0.6 }, { transform: 'scale(1)' }], { duration: 700, delay: 250, easing: 'ease-out', fill: 'backwards' }); this.burst(50); }
  },
  // Angka kemenangan pakai gambar ornamental (assets/bigwin/num/num_*.png). Kalau gambar gagal dimuat, jatuh ke teks biasa.
  NUM: { h: 231, w: {"0": 158, "1": 105, "2": 142, "3": 140, "4": 146, "5": 140, "6": 144, "7": 133, "8": 148, "9": 134, "dot": 68, "comma": 56}, file: c => 'bigwin/num/num_' + (c === '.' ? 'dot' : c === ',' ? 'comma' : c) + '.webp' },
  numOk: true,
  setAmount(v) {
    const s = UI.fmt(v), a = $('bw-amount'), N = this.NUM;
    if (!this.numOk) { a.className = 'txt'; a.dataset.text = s; a.textContent = s; a.style.fontSize = Math.min(21, 92 / (s.length * 0.6)).toFixed(2) + 'cqw'; return; }
    if (a.className !== 'num') { a.className = 'num'; a.textContent = ''; a.style.fontSize = ''; a.dataset.text = ''; }
    let tw = 0; for (const c of s) tw += N.w[c === '.' ? 'dot' : c === ',' ? 'comma' : c] || 0;
    a.style.setProperty('--nh', Math.min(19, 92 * N.h / tw).toFixed(2) + 'cqw');   // tinggi angka menyesuaikan agar muat lebar layar
    while (a.children.length > s.length) a.lastChild.remove();
    for (let i = 0; i < s.length; i++) {
      let im = a.children[i]; if (!im) { im = new Image(); im.alt = ''; im.draggable = false; a.appendChild(im); }
      if (im.dataset.c !== s[i]) { im.dataset.c = s[i]; im.src = 'assets/' + N.file(s[i]); }   // hanya ganti gambar kalau karakternya berubah
    }
  },
  burst(n) { for (let i = 0; i < n; i++) this.coin(Math.random() * this.W, -20 - Math.random() * this.H * 0.25, true); },
  coin(x, y, burst) { const r = 6 + Math.random() * 9; this.parts.push({ x, y, r, vx: (Math.random() - 0.5) * 60, vy: (burst ? 120 : 60) + Math.random() * 200, rot: Math.random() * 6.28, vr: 3 + Math.random() * 6, spark: Math.random() < 0.28, conf: Math.random() < 0.4, col: (BW_PAL[this.tiers[this.idx].key] || BW_PAL.big)[Math.floor(Math.random() * 3)], life: 0 }); },
  drawParts(dt) {
    const ctx = this.ctx, W = this.W, H = this.H; ctx.clearRect(0, 0, W, H);
    this.acc = (this.acc || 0) + (14 + 20 * (this.idx + 1)) * dt; while (this.acc >= 1) { this.acc--; this.coin(Math.random() * W, -14, false); }
    for (let i = this.parts.length - 1; i >= 0; i--) { const p = this.parts[i]; p.life += dt; p.vy += 260 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.y > H + 30) { this.parts.splice(i, 1); continue; }
      ctx.save(); ctx.translate(p.x, p.y);
      if (p.conf) { const w = Math.max(0.15, Math.abs(Math.cos(p.rot * 1.7))); ctx.rotate(p.rot * 0.4); ctx.scale(w, 1); ctx.fillStyle = p.col; ctx.fillRect(-p.r * 0.45, -p.r * 0.8, p.r * 0.9, p.r * 1.6); }
      else if (p.spark && this.spk && this.spk.complete && this.spk.naturalWidth) { const s = p.r * (1.6 + 0.9 * Math.sin(p.life * 12)); ctx.globalCompositeOperation = 'lighter'; ctx.rotate(p.rot * 0.3); ctx.drawImage(this.spk, -s * 1.6, -s * 1.6, s * 3.2, s * 3.2); }
      else if (p.spark) { const s = p.r * (0.8 + 0.5 * Math.sin(p.life * 12)); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,240,170,.9)';
        ctx.beginPath(); ctx.moveTo(0, -s * 1.6); ctx.lineTo(s * 0.3, -s * 0.3); ctx.lineTo(s * 1.6, 0); ctx.lineTo(s * 0.3, s * 0.3); ctx.lineTo(0, s * 1.6); ctx.lineTo(-s * 0.3, s * 0.3); ctx.lineTo(-s * 1.6, 0); ctx.lineTo(-s * 0.3, -s * 0.3); ctx.closePath(); ctx.fill(); }
      else { const w = Math.max(0.12, Math.abs(Math.cos(p.rot))), g = ctx.createLinearGradient(-p.r, -p.r, p.r, p.r); g.addColorStop(0, '#fff3b0'); g.addColorStop(0.5, '#f5b021'); g.addColorStop(1, '#a8680a');
        ctx.scale(w, 1); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 6.283); ctx.fill(); ctx.strokeStyle = '#7a4a08'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,240,170,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, p.r * 0.62, 0, 6.283); ctx.stroke(); }
      ctx.restore(); }
  },
  show(total, bet) {
    return new Promise(resolve => {
      this.tiers = CONFIG.winTiers.filter(t => total >= bet * t.min); if (!this.tiers.length) return resolve();
      this.resolve = resolve; this.open = true; this.finished = false; this.skip = false; this.parts = []; this.acc = 0;
      const f = State.turbo ? 1.6 : 1, pts = this.timeline(total, bet, this.tiers), end = pts[pts.length - 1][0] / f, auto = State.auto > 0 || State.freeSpins > 0 || State.turbo;
      this.el.classList.remove('hidden', 'out'); void this.el.offsetWidth; this.el.classList.add('in'); this.resize(); $('bw-tap').style.opacity = 0;
      this.idx = 0; this.setTier(0, true); this.setAmount(0);
      const t0 = performance.now() + 250; let last = performance.now();   // jeda singkat sebelum angka berjalan
      const frame = now => { if (!this.open) return; const dt = Math.min((now - last) / 1000, 0.05); last = now;
        let ms = Math.max(0, now - t0) * f; if (this.skip) ms = end * f + 1;
        const v = this.valueAt(pts, ms), reached = this.tiers.reduce((a, t, i) => v >= bet * t.min - 0.005 ? i : a, 0);
        if (reached > this.idx) this.setTier(reached, false);
        this.setAmount(ms >= end * f ? total : v);
        if (!this.finished && ms >= end * f) { this.finished = true; $('bw-tap').style.opacity = 1; this.burst(40);
          if (auto) this.timer = setTimeout(() => this.close(), CONFIG.winCount.holdMs); }
        this.drawParts(dt); requestAnimationFrame(frame); };
      requestAnimationFrame(frame);
    });
  },
  close() {
    if (!this.open) return; this.open = false; clearTimeout(this.timer); this.el.classList.add('out'); CONFIG.winTiers.forEach(t => t.sound && Sound.stop(t.sound));
    setTimeout(() => { this.el.classList.add('hidden'); this.el.classList.remove('in', 'out'); this.ctx.clearRect(0, 0, this.W, this.H); const r = this.resolve; this.resolve = null; r && r(); }, 320);
  }
};

/* ---------- FREE SPIN POPUP: emblem Free Spin + cahaya di belakangnya. mode 'start' = jumlah Free Spin didapat, 'end' = total menang Free Spin ---------- */
const FSPopup = {
  open: false, fail: false,
  init() {
    this.el = $('freespin'); this.el.addEventListener('click', () => this.finish());
    window.addEventListener('keydown', e => { if (this.open && (e.code === 'Space' || e.code === 'Enter')) { e.preventDefault(); this.finish(); } });
    const im = new Image(); im.onerror = () => { this.fail = true; }; im.src = 'assets/ui/freespin_emblem.webp';   // muat dulu; kalau gagal jatuh ke popup teks biasa
  },
  setNumber(s, maxW, maxH) {   // angka ornamental (num_*.png); lebar total dibatasi maxW (cqw)
    const box = $('fs-num'), N = BigWin.NUM; let tw = 0; for (const c of s) tw += N.w[c === '.' ? 'dot' : c === ',' ? 'comma' : c] || 0;
    const h = Math.min(maxH, maxW * N.h / tw);
    if (!BigWin.numOk) { box.className = 'txt'; box.style.setProperty('--nh', Math.min(maxH * 0.6, maxW / (s.length * 0.6)).toFixed(2) + 'cqw'); box.textContent = s; return; }
    box.className = ''; box.style.setProperty('--nh', h.toFixed(2) + 'cqw'); box.style.setProperty('--fsd', (h * 0.2).toFixed(2) + 'cqw');   // ruang bawah gambar angka untuk ekor koma
    box.innerHTML = [...s].map(c => `<img src="assets/${N.file(c)}" alt="">`).join('');
  },
  show(mode, value, retrigger) {
    const end = mode === 'end';
    if (this.fail) return UI.showBonus(end ? `Free Spins complete. Total: ${UI.fmt(value)}` : `${value} Free Spins!`);
    return new Promise(resolve => {
      this.resolve = resolve; this.open = true; this.t0 = performance.now();
      $('fs-cap-top').textContent = end ? 'Total win' : 'You won'; $('fs-cap-bottom').textContent = end ? '' : (value === 1 ? 'Spin' : 'Spins');
      this.setNumber(end ? UI.fmt(value) : String(value), 40, end ? 13 : 17.5);
      const el = this.el; el.classList.remove('hidden', 'out', 'in'); void el.offsetWidth; el.classList.add('in');
      if (State.auto > 0 || State.turbo || (!end && retrigger)) this.timer = setTimeout(() => this.finish(true), end ? CONFIG.fsPopupMs.end : retrigger ? CONFIG.fsPopupMs.retrigger : CONFIG.fsPopupMs.start);   // auto / turbo / Free Spin ulang: tutup sendiri
    });
  },
  finish(force) {
    if (!this.open || (!force && performance.now() - this.t0 < 500)) return;   // abaikan ketukan beruntun di 0,5 detik pertama
    this.open = false; clearTimeout(this.timer); this.el.classList.add('out');
    setTimeout(() => { this.el.classList.add('hidden'); this.el.classList.remove('in', 'out'); const r = this.resolve; this.resolve = null; r && r(); }, 320);
  }
};

/* ---------- MUSIC: backsound loop. base = biasa, free = Free Spin. Crossfade halus; musik turun saat layar Big Win; ikut tombol Suara/Musik ---------- */
const Music = {
  tracks: {}, vol: { base: 0, free: 0 }, unlocked: false,
  init() {
    for (const [k, f] of Object.entries(ASSETS.music)) { const a = new Audio(); a.loop = true; a.preload = 'auto'; a.volume = 0; a.src = ASSETS.base + f; this.tracks[k] = a; }
    document.addEventListener('visibilitychange', () => { if (document.hidden) Object.values(this.tracks).forEach(a => a.pause()); });   // tab disembunyikan: jeda
  },
  // Browser melarang audio sebelum ada sentuhan pemain. Dipanggil dari sentuhan/klik pertama; "membuka kunci" tiap track (khusus iOS) lalu musik boleh jalan
  unlock() {
    if (this.unlocked || this.unlocking) return; this.unlocking = true;
    Promise.all(Object.values(this.tracks).map(a => { a.muted = true; return a.play().then(() => { a.pause(); }).catch(() => {}).then(() => { a.muted = false; }); }))
      .then(() => { this.unlocked = true; });
  },
  step(dt) {
    if (!this.unlocked) return;
    const M = CONFIG.music, want = State.sound && State.music && !document.hidden ? 1 : 0, duck = BigWin.open ? M.duck : 1, rate = M.volume / M.fadeSec;
    for (const k of ['base', 'free']) {
      const a = this.tracks[k]; if (!a) continue;
      const target = (k === 'free') === State.inFree ? M.volume * want * duck : 0, prev = this.vol[k];
      const v = prev < target ? Math.min(target, prev + rate * dt) : Math.max(target, prev - rate * dt); this.vol[k] = v;
      a.volume = Math.max(0, Math.min(1, v));
      if (v > 0.002 && a.paused) { if (k === 'free' && prev <= 0.002) a.currentTime = 0; const p = a.play(); if (p) p.catch(() => {}); }   // Free Spin selalu mulai dari awal
      else if (v <= 0.002 && !a.paused) a.pause();
    }
  }
};

/* ---------- GAME ---------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));

const API = {
  base: 'http://localhost:3000/api',
  token: localStorage.getItem('centralJavaToken') || '',

  async request(path, options = {}) {
    const response = await fetch(this.base + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...(options.headers || {})
      }
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Koneksi backend gagal.');
    }

    return data;
  },

  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    this.token = data.session.sessionToken;
    localStorage.setItem('centralJavaToken', this.token);
    return data;
  },

  async getWallet() {
    return await this.request('/wallet');
  },

  async spin(bet) {
    return await this.request('/spin', {
      method: 'POST',
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        bet: String(bet)
      })
    });
  }
};

const Game = {
  async init() {
    UI.message('Loading assets...'); document.title = CONFIG.title;
    await Assets.loadAll(); GameLog.load(); Reels.init(); UI.buildPaytable(); UI.buildOptions(); this.bind(); UI.update(); UI.startTips(); Fire.init(); Storm.init(); Music.init(); BigWin.init(); FSPopup.init(); Deco.init();
  },
  stopAuto() { State.auto = 0; UI.update(); },   // loop runSession berhenti sendiri setelah spin yang sedang jalan (Free Spin yang tersisa tetap dilanjutkan)
  inFreeMode() { return State.inFree || State.freeSpins > 0; },
  // Free Spin: tombol tengah hanya "skip" saat reel berputar (Auto tidak berlaku di Free Spin). Di luar itu: Auto aktif -> matikan Auto; reel berputar -> skip; diam -> spin.
  quit() {
    if (CONFIG.quitUrl) { location.href = CONFIG.quitUrl; return; }
    try { window.close(); } catch (e) {}
    setTimeout(() => { if (history.length > 1) history.back(); else location.replace('about:blank'); }, 200);   // tab tidak bisa ditutup skrip -> kembali / halaman kosong
  },
  pressSpin() {
    if (this.inFreeMode()) { if (State.spinning) Reels.skip(); }
    else if (State.auto > 0) this.stopAuto(); else if (State.spinning) Reels.skip(); else this.runSession();
  },
  startAuto(n) { if (State.busy) return; State.auto = n; State.stopAuto = false; this.runSession(); },
  bind() {
    const click = (id, fn, sfx = 'click') => { const el = $(id); if (el) el.addEventListener('click', () => { Sound.play(sfx); fn(); }); };
    click('btn-spin', () => this.pressSpin());
    click('btn-bet-up', () => { Wallet.changeBet(1); UI.update(); UI.buildOptions(); }, 'betUp');
    click('btn-bet-down', () => { Wallet.changeBet(-1); UI.update(); UI.buildOptions(); }, 'betDown');
    click('panel-bet', () => { if (!State.busy && !State.auto && !State.freeSpins) UI.openBet(); });   // seluruh kotak Bet bisa ditekan
    click('btn-hd-back', () => $('hd').classList.add('hidden')); click('hd-prev', () => UI.detailGo(-1)); click('hd-next', () => UI.detailGo(1));
    click('panel-balance', () => $('bal-sheet').classList.remove('hidden')); click('btn-close-bal', () => $('bal-sheet').classList.add('hidden')); click('bal-backdrop', () => $('bal-sheet').classList.add('hidden'));
    click('btn-menu', () => UI.setMenu(true)); click('mb-close', () => UI.setMenu(false)); click('mb-quit', () => this.quit());
    click('mb-sound', () => { State.sound = !State.sound; UI.update(); }); click('mb-paytable', () => UI.openInfo('paytable')); click('mb-rules', () => UI.openInfo('rules')); click('mb-history', () => UI.openHistory());
    click('btn-close-info', () => $('info-sheet').classList.add('hidden'));
    click('panel-win', () => UI.openHistory()); click('btn-close-history', () => UI.closeHistory());
    click('btn-close-bet', () => UI.closeBet()); click('bet-backdrop', () => UI.closeBet());
    click('btn-max-bet', () => { UI.betGo('si', CONFIG.betSizes.length - 1); UI.betGo('li', CONFIG.betLevels.length - 1); });
    click('btn-confirm-bet', () => { State.sizeIdx = UI.bsel.si; State.level = CONFIG.betLevels[UI.bsel.li]; UI.closeBet(); UI.update(); });
    click('btn-turbo', () => { State.turbo = !State.turbo; UI.update(); }, 'turbo');
    click('btn-auto', () => {
      if (State.auto > 0) this.stopAuto();
      else if (!State.busy && !this.inFreeMode()) UI.openAuto();
    }, 'auto');
    click('btn-close-auto', () => UI.closeAuto());
    click('btn-start-auto', () => { const n = UI.autoSel; if (n == null) return; UI.closeAuto(); this.startAuto(n); }, 'auto');
    click('auto-backdrop', () => UI.closeAuto());
    const snd = () => { State.sound = !State.sound; UI.update(); };
    click('btn-settings-sound', snd); click('btn-settings-music', () => { State.music = !State.music; UI.update(); });
    ['pointerdown', 'keydown', 'touchstart'].forEach(e => document.addEventListener(e, () => Music.unlock(), { once: true, passive: true }));   // musik baru boleh jalan setelah sentuhan pertama
    click('btn-info', () => { UI.close('popup-settings'); UI.open('popup-paytable'); }); click('btn-close-paytable', () => UI.close('popup-paytable'));
    click('btn-settings', () => UI.open('popup-settings')); click('btn-close-settings', () => UI.close('popup-settings'));
    click('btn-reset', () => { Wallet.reset(); State.lastWin = 0; UI.update(); UI.buildOptions(); UI.message('Balance reset'); });
    document.addEventListener('keydown', e => {
      if (e.code !== 'Space' || e.repeat || BigWin.open || FSPopup.open || !$('popup-layer').classList.contains('hidden') || !$('auto-sheet').classList.contains('hidden') || !$('bet-sheet').classList.contains('hidden') || !$('history-sheet').classList.contains('hidden') || !$('bal-sheet').classList.contains('hidden') || !$('info-sheet').classList.contains('hidden') || $('controls').classList.contains('menu')) return;
      e.preventDefault();
      this.pressSpin();
    });
  },
  async runSession() {
    if (State.busy) return;
    do {
      if (!(await this.spinOnce())) break;
      if (State.auto > 0) State.auto--;
      UI.update();
      if (State.auto > 0 || State.freeSpins > 0) await sleep(CONFIG.speed.autoDelayMs / (State.turbo ? CONFIG.speed.turboFactor : 1));
    } while (!State.stopAuto && (State.auto > 0 || State.freeSpins > 0));
    State.auto = 0; State.stopAuto = false; UI.update();
  },
  async spinOnce() {
    const free = State.freeSpins > 0, f = State.turbo ? CONFIG.speed.turboFactor : 1;
    if (!free && !Wallet.canBet()) { UI.message('Insufficient balance. Lower your bet or reset your balance.'); return false; }
    State.busy = true; State.lastWin = State.inFree ? State.freeTotal : 0;   // Free Spin: kotak Menang terus bertambah dari awal sampai akhir Free Spin
    if (free) State.freeSpins--;            // free spin: bet sama, tanpa potong saldo, pengali & wild terbawa
    else { Wallet.deductBet(); State.mult = { n: 0 }; State.roundWin = 0; }   // spin utama: pengali mulai x1
    State.spinning = true; UI.update(); UI.resumeTips(); Sound.play('spin'); Fx.spinWave(1.5);   // teks menang lama langsung diganti tip begitu spin mulai (supaya tidak membocorkan hasil)

    const m0 = State.mult.n;   // meter pengali di awal spin (untuk riwayat)
    const res = Engine.play(State.bet, State.mult, round2(CONFIG.maxWinX * State.bet - State.roundWin));
    await Reels.spin(res.initial, State.turbo, () => Sound.play('stop'), () => { Sound.play('anticipate'); });
    State.spinning = false; UI.setBusy(true);
    if (res.initial.some(col => col.includes('WILD'))) Sound.play('wild');   // Wild muncul di spin awal

    let running = 0; const off = State.inFree ? State.freeTotal : 0;   // off = total menang Free Spin sebelumnya (0 di spin biasa)
    for (const st of res.steps) {
      running = round2(running + st.ev.total);
      Sound.play('win'); await Reels.highlight(st.ev.cells, f);   // kartu pemenang menyala kiri -> kanan
      UI.message(`Win ${UI.fmt(running)}`, false);   // teks tengah = menang spin ini saja
      State.lastWin = round2(off + running); $('val-win').textContent = UI.fmt(off + running);   // "Win" baru muncul saat pecah
      Fx.winGlow(Math.min(1, st.ev.total / State.bet / 6));   // panel pesan & kotak Menang menyala, api dari bar bawah ke grid
      Sound.play('explode'); const n0 = State.mult.n;
      await Promise.all([Reels.explode(st.ev.cells, f), Fx.wildToMeter(st.wilds, f, n0, st.ev.cells)]);   // Wild pecah, cahayanya masuk ke ring pengali
      State.mult = st.mult; UI.setMultiplier(State.mult);
      const sus = st.scatterBefore >= CONFIG.freeSpin.triggerCount - 1 && st.scatterBefore < CONFIG.freeSpin.triggerCount;   // sudah ada 2 Scatter: cari yang ke-3 dari atas
      await Reels.refill(st.next, f, { suspense: sus, afterSettle: () => Fx.suspenseStart(f), onStart: i => { if (sus) { Reels.susFocus = i; Fire.focus = i; } }, onLand: i => { if (sus) Sound.play('stop'); if (st.next[i].some(c => c.id === 'WILD' && c.from < 0)) Sound.play('wild'); Fx.scatterLand(i, st); } });
      if (sus) await Fx.suspenseEnd(st, f);
    }
    if (res.endWilds.length) {   // Wild yang muncul lagi tapi tidak ikut pecah: tetap terkumpul ke pengali
      Sound.play('explode');
      await Promise.all([Reels.explode(res.endWilds, f), Fx.wildToMeter(res.endWilds, f, State.mult.n, res.endWilds)]);
    }
    State.mult = res.mult; UI.setMultiplier(State.mult);
    if (res.total > 0) {
      if (res.multiplier > 1) { await sleep(250 / f); await Fx.multToWin(res.multiplier, f); await UI.countWin(res.base, res.total, 900 / f, off); }   // pengali tiba -> total naik
      else UI.message(`Total win ${UI.fmt(res.total)}`, false);
      Wallet.add(res.total); State.roundWin = round2(State.roundWin + res.total); if (State.inFree) State.freeTotal = round2(State.freeTotal + res.total); State.lastWin = State.inFree ? State.freeTotal : res.total;
    }
    UI.update();
    const rounds = res.steps.length   // tiap ronde cascade: papan sebelum pecah, sel menang, payout, pengali saat itu
      ? res.steps.map((st, k) => ({ b: GameLog.pack(k ? res.steps[k - 1].next.map(c => c.map(x => x.id)) : res.initial), c: st.ev.cells.map(([r, w]) => r * CONFIG.rows + w), w: st.ev.wins, m: multOf(k ? res.steps[k - 1].mult.n : m0) }))
      : [{ b: GameLog.pack(res.initial), c: [], w: [], m: multOf(m0) }];
    GameLog.add({ t: Date.now(), id: '2' + String(Date.now()).slice(-8) + String(Math.floor(Math.random() * 1e10)).padStart(10, '0'), bet: free ? 0 : State.bet, profit: round2(res.total - (free ? 0 : State.bet)), free,
      bal: State.balance, sz: CONFIG.betSizes[State.sizeIdx], lv: State.level, x: res.multiplier, tot: res.total, r: rounds });   // catat tiap spin ke riwayat

    const tier = [...CONFIG.winTiers].reverse().find(t => res.total >= State.bet * t.min);
    if (tier) await BigWin.show(res.total, State.bet);
    if (res.freeSpins > 0) {
      const retrigger = State.inFree;
      State.auto = 0;   // Auto tidak berlaku di Free Spin: begitu Free Spin didapat, Auto dimatikan (Free Spin tetap jalan otomatis)
      if (!State.inFree) { State.inFree = true; State.freeTotal = 0; }   // awal Free Spin: pengali yang sudah terkumpul ikut dibawa (State.mult tidak di-reset)
      State.freeSpins += res.freeSpins; Sound.play('bonus'); UI.update();
      await FSPopup.show('start', res.freeSpins, retrigger);
    }
    if (res.capped) State.freeSpins = 0;   // batas menang tercapai
    if (State.inFree && State.freeSpins === 0) {
      State.inFree = false; UI.update();
      await FSPopup.show('end', State.freeTotal); State.freeTotal = 0;
    }
    State.busy = false; UI.update();
    return true;
  }
};
window.addEventListener('DOMContentLoaded', () => Game.init());
