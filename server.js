// QR Runner — servidor sem dependências externas (Node >= 22.13, usa node:sqlite).
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import { mkdirSync } from 'node:fs';
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC = join(ROOT, 'public');
const DATA_DIR = process.env.DATA_DIR || join(ROOT, 'data');
const PORT = Number(process.env.PORT) || 3000;
mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(join(DATA_DIR, 'qrrunner.db'));
db.exec(`CREATE TABLE IF NOT EXISTS profiles(
  code TEXT PRIMARY KEY, key_hash TEXT NOT NULL, data TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1, scans INTEGER NOT NULL DEFAULT 0,
  last_scan TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`);

const sha = (s) => createHash('sha256').update(String(s)).digest('hex');
const ALPHA = '23456789abcdefghjkmnpqrstuvwxyz';
const newCode = () => {
  for (;;) {
    const c = Array.from({ length: 7 }, () => ALPHA[randomInt(ALPHA.length)]).join('');
    if (!db.prepare('SELECT 1 FROM profiles WHERE code=?').get(c)) return c;
  }
};

// Campos aceitos e limites de tamanho
const LIMITS = { name: 60, nickname: 20, city: 40, group: 40, initials: 3, c1Name: 50, c1Phone: 20, c2Name: 50, c2Phone: 20, msg: 200, allergies: 100, conditions: 120, meds: 100, plan: 60 };
const BLOOD = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const MEDICAL = ['allergies', 'blood', 'conditions', 'meds', 'plan'];
function clean(b) {
  const o = {};
  for (const [k, max] of Object.entries(LIMITS)) o[k] = String(b[k] ?? '').trim().slice(0, max);
  o.blood = BLOOD.includes(b.blood) ? b.blood : '';
  o.showMed = b.showMed === true;
  if (!o.name) return { error: 'Informe seu nome.' };
  if (o.c1Phone.replace(/\D/g, '').length < 8 || !o.c1Name) return { error: 'Informe nome e telefone do contato principal.' };
  if (b.consent !== true) return { error: 'É preciso aceitar o termo de consentimento.' };
  return { data: o };
}

// Limite simples de requisições por IP (em memória)
const hits = new Map();
function limited(ip, bucket, max, ms) {
  const k = bucket + ip, now = Date.now();
  const arr = (hits.get(k) || []).filter((t) => now - t < ms);
  arr.push(now); hits.set(k, arr);
  return arr.length > max;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (!v.some((t) => now - t < 3600e3)) hits.delete(k); }, 600e3).unref();

const SEC = { 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'x-frame-options': 'DENY', 'permissions-policy': 'geolocation=(self)' };
const send = (res, status, obj) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...SEC }); res.end(JSON.stringify(obj)); };
const readBody = (req) => new Promise((ok, no) => {
  let b = '';
  req.on('data', (c) => { b += c; if (b.length > 20000) { no(new Error('grande')); req.destroy(); } });
  req.on('end', () => { try { ok(JSON.parse(b || '{}')); } catch (e) { no(e); } });
  req.on('error', no);
});
const authed = (row, req) => {
  if (!row) return false;
  const a = Buffer.from(sha(req.headers['x-edit-key'] || '')), b = Buffer.from(row.key_hash);
  return a.length === b.length && timingSafeEqual(a, b);
};
const ownerView = (r) => ({ code: r.code, active: !!r.active, scans: r.scans, lastScan: r.last_scan, updatedAt: r.updated_at, ...JSON.parse(r.data) });

async function api(req, res, url) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const get = (c) => db.prepare('SELECT * FROM profiles WHERE code=?').get(c);
  let m;
  try {
    if (req.method === 'POST' && url.pathname === '/api/profiles') {
      if (limited(ip, 'c', 10, 3600e3)) return send(res, 429, { error: 'Muitas tentativas. Tente mais tarde.' });
      const v = clean(await readBody(req));
      if (v.error) return send(res, 400, { error: v.error });
      const code = newCode(), key = randomBytes(18).toString('base64url'), now = new Date().toISOString();
      db.prepare('INSERT INTO profiles(code,key_hash,data,created_at,updated_at) VALUES(?,?,?,?,?)').run(code, sha(key), JSON.stringify(v.data), now, now);
      return send(res, 201, { code, key });
    }
    if ((m = url.pathname.match(/^\/api\/p\/([a-z0-9]{4,12})$/)) && req.method === 'GET') {
      if (limited(ip, 's', 90, 60e3)) return send(res, 429, { error: 'Muitas consultas.' });
      const row = get(m[1]);
      if (!row) return send(res, 404, { error: 'Perfil não encontrado.' });
      if (!row.active) return send(res, 200, { active: false });
      if (!url.searchParams.has('noscan')) db.prepare('UPDATE profiles SET scans=scans+1,last_scan=? WHERE code=?').run(new Date().toISOString(), row.code);
      const d = JSON.parse(row.data);
      if (!d.showMed) for (const f of MEDICAL) delete d[f];
      delete d.showMed;
      return send(res, 200, { active: true, hasMedical: MEDICAL.some((f) => d[f]), ...d });
    }
    if ((m = url.pathname.match(/^\/api\/profiles\/([a-z0-9]{4,12})(\/(active|rotate))?$/))) {
      const row = get(m[1]);
      if (!authed(row, req)) return send(res, 401, { error: 'Acesso negado.' });
      const now = new Date().toISOString();
      if (req.method === 'GET' && !m[3]) return send(res, 200, ownerView(row));
      if (req.method === 'PUT' && !m[3]) {
        const v = clean(await readBody(req));
        if (v.error) return send(res, 400, { error: v.error });
        db.prepare('UPDATE profiles SET data=?,updated_at=? WHERE code=?').run(JSON.stringify(v.data), now, row.code);
        return send(res, 200, ownerView(get(row.code)));
      }
      if (req.method === 'POST' && m[3] === 'active') {
        const b = await readBody(req);
        db.prepare('UPDATE profiles SET active=?,updated_at=? WHERE code=?').run(b.active ? 1 : 0, now, row.code);
        return send(res, 200, ownerView(get(row.code)));
      }
      if (req.method === 'POST' && m[3] === 'rotate') {
        const code = newCode();
        db.prepare('UPDATE profiles SET code=?,updated_at=? WHERE code=?').run(code, now, row.code);
        return send(res, 200, { code });
      }
      if (req.method === 'DELETE' && !m[3]) { db.prepare('DELETE FROM profiles WHERE code=?').run(row.code); return send(res, 200, { ok: true }); }
    }
    return send(res, 404, { error: 'Rota não encontrada.' });
  } catch (e) {
    return send(res, e.message === 'grande' ? 413 : 400, { error: 'Requisição inválida.' });
  }
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json' };
async function serve(res, pathname) {
  let file = pathname.startsWith('/p/') || pathname === '/' ? '/index.html' : pathname;
  const full = normalize(join(PUBLIC, file));
  if (!full.startsWith(PUBLIC)) return send(res, 403, { error: 'Proibido.' });
  try {
    const buf = await readFile(full);
    const ext = extname(full);
    res.writeHead(200, { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=3600', ...SEC });
    res.end(buf);
  } catch {
    const nf = await readFile(join(PUBLIC, 'index.html'));
    res.writeHead(404, { 'content-type': TYPES['.html'], ...SEC }); res.end(nf);
  }
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/health') return send(res, 200, { ok: true });
  if (url.pathname.startsWith('/api/')) return api(req, res, url);
  serve(res, decodeURIComponent(url.pathname));
}).listen(PORT, () => console.log(`QR Runner rodando na porta ${PORT}`));
