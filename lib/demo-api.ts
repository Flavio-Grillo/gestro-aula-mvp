type Row = Record<string, any>;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const plus = (date: string, n: number) => { const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const weekday = (date: string) => new Date(date + 'T12:00:00Z').getUTCDay();
const key = 'aulaemdia-demo-v1';
let memory: Row | null = null;
function seed() {
  const date = today();
  const students = [['Ana Martins', 'Violão', 28000], ['Bruno Costa', 'Piano', 36000], ['Clara Oliveira', 'Canto', 30000]].map(([name, instrument, price], i) => ({ id: 'demo-student-' + i, name, instrument, phone: '', package_name: 'Pacote mensal', lessons_per_month: 4, price_cents: price, due_day: 10, start_date: plus(date, -28), created_at: new Date().toISOString() }));
  const schedules = students.map((s, i) => ({ id: 'demo-schedule-' + i, student_id: s.id, start_date: plus(date, -28 + i), end_date: null, time: ['10:00', '14:00', '16:00'][i], duration: 60 }));
  const lessons = [{ id: 'demo-pending', student_id: students[2].id, schedule_id: null, original_lesson_id: null, date: plus(date, -3), time: '16:00', duration: 60, status: 'makeup_due', notes: 'Exemplo fictício: aula pendente de reposição.' }];
  return { students, schedules, lessons, payments: [] };
}
function state(): Row {
  if (memory) return memory;
  try { const raw = sessionStorage.getItem(key); if (raw) { const parsed = JSON.parse(raw); if (['students', 'schedules', 'lessons', 'payments'].every(k => Array.isArray(parsed[k]))) return memory = parsed; } } catch { /* Storage may be disabled; the demo still works in memory. */ }
  return memory = seed();
}
function save() { try { sessionStorage.setItem(key, JSON.stringify(memory)); } catch { /* In-memory fallback. */ } }
function materialize(d: Row, from: string, to: string, month: string) {
  for (const s of d.schedules) {
    let date = from > s.start_date ? from : s.start_date;
    date = plus(date, (weekday(s.start_date) - weekday(date) + 7) % 7);
    for (; date <= to && (!s.end_date || date <= s.end_date); date = plus(date, 7)) {
      const id = s.id + '_' + date;
      if (!d.lessons.some((l: Row) => l.id === id)) d.lessons.push({ id, student_id: s.student_id, schedule_id: s.id, original_lesson_id: null, date, time: s.time, duration: s.duration, status: 'scheduled', notes: '' });
    }
  }
  for (const s of d.students) {
    const id = s.id + '_' + month;
    if (s.start_date.slice(0, 7) <= month && !d.payments.some((p: Row) => p.id === id)) d.payments.push({ id, student_id: s.id, month, amount_cents: s.price_cents, due_date: month + '-' + String(s.due_day).padStart(2, '0'), paid_at: s.id === 'demo-student-0' ? new Date().toISOString() : null });
  }
}
export async function demoApi(path: string, method = 'GET', body: Row = {}): Promise<any> {
  const d = state();
  const url = new URL(path, 'https://demo.invalid/');
  const parts = url.pathname.slice(1).split('/');
  const find = (table: string, id: string) => { const r = d[table].find((r: Row) => r.id === id); if (!r) throw new Error('Registro de demonstração não encontrado.'); return r; };
  const decorate = (l: Row) => { const s = find('students', l.student_id); const m = d.lessons.find((r: Row) => r.original_lesson_id === l.id); return { ...l, name: s.name, instrument: s.instrument, makeup_id: m?.id, makeup_status: m?.status, makeup_date: m?.date }; };
  if (method === 'GET' && parts[0] === 'state') {
    const from = url.searchParams.get('from')!, to = url.searchParams.get('to')!, month = url.searchParams.get('month')!;
    materialize(d, from, to, month); save();
    return { students: d.students, schedules: d.schedules, lessons: d.lessons.filter((l: Row) => l.date >= from && l.date <= to).map(decorate).sort((a: Row, b: Row) => (a.date + a.time).localeCompare(b.date + b.time)), payments: d.payments.filter((p: Row) => p.month === month).map((p: Row) => ({ ...p, name: find('students', p.student_id).name, instrument: find('students', p.student_id).instrument })), makeups: d.lessons.filter((l: Row) => l.status === 'makeup_due' && !d.lessons.some((m: Row) => m.original_lesson_id === l.id && m.status !== 'cancelled')).map(decorate), today: today() };
  }
  if (method === 'GET' && parts[2] === 'history') return { student: find('students', parts[1]), lessons: d.lessons.filter((l: Row) => l.student_id === parts[1]).map(decorate).sort((a: Row, b: Row) => b.date.localeCompare(a.date)), payments: d.payments.filter((p: Row) => p.student_id === parts[1]) };
  let result: Row = { ok: true };
  if (method === 'POST' && parts[0] === 'students') { const id = crypto.randomUUID(); d.students.push({ ...body, id, created_at: new Date().toISOString() }); result = { id }; }
  else if (method === 'PATCH' && parts[0] === 'students') Object.assign(find('students', parts[1]), body);
  else if (method === 'POST' && parts[0] === 'schedules') { const id = crypto.randomUUID(); d.schedules.push({ ...body, id, end_date: body.end_date || null }); result = { id }; }
  else if (method === 'PATCH' && parts[0] === 'schedules') { Object.assign(find('schedules', parts[1]), body); d.lessons.filter((l: Row) => l.schedule_id === parts[1] && l.date > body.end_date && l.status === 'scheduled').forEach((l: Row) => l.status = 'cancelled'); }
  else if (method === 'POST' && parts[2] === 'makeup') {
    const original = find('lessons', parts[1]);
    if (original.status !== 'makeup_due') throw new Error('Esta aula não possui reposição pendente.');
    const existing = d.lessons.find((l: Row) => l.original_lesson_id === original.id);
    if (existing && existing.status !== 'cancelled') throw new Error('A reposição já está agendada.');
    const l = { ...body, id: existing?.id || crypto.randomUUID(), student_id: original.student_id, original_lesson_id: original.id, schedule_id: null, status: 'scheduled', notes: '' };
    if (existing) Object.assign(existing, l); else d.lessons.push(l); result = { id: l.id };
  }
  else if (method === 'PATCH' && parts[0] === 'lessons') { const l = find('lessons', parts[1]); if (['present', 'absent', 'makeup_due'].includes(body.status) && l.date > today()) throw new Error('Registre a presença ou falta a partir do dia da aula.'); Object.assign(l, body); }
  else if (method === 'PATCH' && parts[0] === 'payments') find('payments', parts[1]).paid_at = body.paid ? new Date().toISOString() : null;
  else throw new Error('Ação indisponível na demonstração.');
  save(); return result;
}
