import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const app = express();
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4000);
const statePath = path.resolve(process.env.DEMO_STATE_FILE || path.join(root, '.data', 'demo-state.json'));
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

const defaultRates = [
  { name: 'Start', min: 10, rate: 2.7 }, { name: 'Bronze', min: 30, rate: 2.8 },
  { name: 'Silver', min: 100, rate: 3.0 }, { name: 'Gold', min: 300, rate: 3.2 },
  { name: 'Platinum', min: 1000, rate: 3.5 },
];
const initialState = () => ({
  rates: defaultRates,
  dashboard: { totalUsers: 18420, activeDeposits: 2481, payoutVolume: 41200, dau: 2613 },
  user: {
    id: 'demo-user', name: 'Alim', balance: 25, profit: 0, speed: 0.0001, stars: 30,
    cashbackPercent: 15, giftBoxes: 10, referrals: { levels: { level1: 48, level2: 14, level3: 6 } },
    history: [], microWithdrawals: 0, lastAccrualAt: Date.now(),
  },
  withdrawals: [],
});
let state;
try {
  state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
} catch {
  state = initialState();
}
function persist() {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const tmp = `${statePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, statePath);
}
function accrueDemoProfit() {
  const now = Date.now();
  const elapsed = Math.max(0, Math.min(now - Number(state.user.lastAccrualAt || now), 60_000));
  state.user.lastAccrualAt = now;
  const rate = [...state.rates].reverse().find((item) => state.user.balance >= item.min)?.rate || 0;
  // Only a UI simulation, not an investment return or real balance credit.
  state.user.profit = Number((state.user.profit + state.user.balance * (rate / 100) * elapsed / 86_400_000).toFixed(8));
  if (elapsed) persist();
}
function record(title, amount, status = 'Выполнено') {
  state.user.history.unshift({ id: crypto.randomUUID(), title, amount, status, time: new Date().toLocaleString('ru-RU') });
  state.user.history = state.user.history.slice(0, 100);
  persist();
}
function currentLevel(balance) { return [...state.rates].reverse().find((item) => balance >= item.min)?.name || 'Без уровня'; }
function safeUser() {
  accrueDemoProfit();
  const { microWithdrawals, lastAccrualAt, ...data } = state.user;
  return { ...data, level: currentLevel(state.user.balance), microWithdrawalsRemaining: Math.max(0, 5 - microWithdrawals) };
}
function adminOnly(req, res, next) {
  const token = process.env.ADMIN_TOKEN;
  const provided = req.get('authorization') || '';
  const expected = `Bearer ${token || ''}`;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (!token || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ message: 'Админ-доступ не настроен или токен неверен' });
  }
  next();
}
function dashboard() {
  accrueDemoProfit();
  return { ...state.dashboard, rates: state.rates, pendingWithdrawals: state.withdrawals.filter((x) => x.status === 'pending-demo').length };
}

const rewards = [
  { label: '10 звезд', type: 'stars', value: 10 }, { label: '25 звезд', type: 'stars', value: 25 },
  { label: '15 звезд', type: 'stars', value: 15 }, { label: '$3 USDT', type: 'usdt', value: 3 },
  { label: '$5 USDT', type: 'usdt', value: 5 }, { label: '$8 USDT', type: 'usdt', value: 8 },
];

app.get('/api/health', (_req, res) => res.json({ ok: true, mode: 'demo', timestamp: new Date().toISOString() }));
app.get('/api/user', (_req, res) => res.json(safeUser()));
app.get('/api/dashboard', (_req, res) => res.json(dashboard()));
app.get('/api/history', (_req, res) => { accrueDemoProfit(); res.json(state.user.history); });
app.post('/api/demo/deposit', (req, res) => {
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount) || amount < 3 || amount > 100000) return res.status(400).json({ message: 'Демо-сумма должна быть от 3 до 100000' });
  state.user.balance = Number((state.user.balance + amount).toFixed(2));
  record('Демо-пополнение', `+${amount.toFixed(2)} USDT`, 'Тест');
  res.status(201).json({ ok: true, message: 'Демо-пополнение зачислено; реальные средства не задействованы' });
});
app.post('/api/referrals/settings', (req, res) => {
  const percent = Number(req.body?.percent);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) return res.status(400).json({ message: 'Процент должен быть от 0 до 100' });
  state.user.cashbackPercent = percent;
  persist();
  res.json({ ok: true, message: 'Настройка сохранена (демо)', cashbackPercent: percent });
});
app.post('/api/gift/open', (_req, res) => {
  if (state.user.giftBoxes < 1) return res.status(409).json({ message: 'Нет доступных сундуков' });
  const reward = rewards[crypto.randomInt(rewards.length)];
  state.user.giftBoxes -= 1;
  if (reward.type === 'stars') state.user.stars += reward.value;
  else state.user.balance = Number((state.user.balance + reward.value).toFixed(2));
  record('Подарочный сундук', reward.label, 'Тест');
  res.json({ ok: true, message: `Получено: ${reward.label} (демо)`, reward: reward.label, giftBoxesLeft: state.user.giftBoxes });
});
app.post('/api/profit/claim', (_req, res) => {
  accrueDemoProfit();
  const amount = state.user.profit;
  if (amount <= 0) return res.status(409).json({ message: 'Пока нет доступной демо-прибыли' });
  state.user.balance = Number((state.user.balance + amount).toFixed(8));
  state.user.profit = 0;
  record('Перевод демо-прибыли', `+${amount.toFixed(8)} USDT`, 'Тест');
  res.json({ ok: true, message: `Переведено ${amount.toFixed(8)} демо USDT; реальные средства не задействованы` });
});
app.post('/api/withdraw', (req, res) => {
  accrueDemoProfit();
  const amount = Number(req.body?.amount);
  const wallet = typeof req.body?.wallet === 'string' ? req.body.wallet.trim() : '';
  if (!Number.isFinite(amount) || amount < 0.1 || amount > 100000) return res.status(400).json({ message: 'Сумма должна быть от 0.1 до 100000 USDT' });
  if (wallet.length < 8 || wallet.length > 128) return res.status(400).json({ message: 'Введите тестовую строку адреса длиной от 8 до 128 символов' });
  if (amount > state.user.balance) return res.status(400).json({ message: 'Недостаточно демо-баланса' });
  const micro = amount < 10;
  if (micro && state.user.microWithdrawals >= 5) return res.status(429).json({ message: 'Лимит 5 микро-заявок исчерпан; накопите от 10 USDT' });
  state.user.balance = Number((state.user.balance - amount).toFixed(8));
  if (micro) state.user.microWithdrawals += 1;
  const item = { id: crypto.randomUUID(), amount, wallet, status: 'pending-demo', fee: 0, createdAt: new Date().toISOString() };
  state.withdrawals.unshift(item);
  record('Демо-заявка на вывод', `-${amount.toFixed(2)} USDT`, 'Ожидает проверки (демо)');
  res.status(201).json({ ok: true, message: 'Демо-заявка создана; реальный перевод не выполняется', withdrawal: item });
});
app.get('/api/admin/withdrawals', adminOnly, (_req, res) => res.json(state.withdrawals));
app.get('/api/admin/dashboard', adminOnly, (_req, res) => res.json(dashboard()));
app.patch('/api/admin/withdrawals/:id', adminOnly, (req, res) => {
  const item = state.withdrawals.find((entry) => entry.id === req.params.id);
  const status = req.body?.status;
  if (!item) return res.status(404).json({ message: 'Заявка не найдена' });
  if (!['approved-demo', 'rejected-demo'].includes(status)) return res.status(400).json({ message: 'Допустим статус approved-demo или rejected-demo' });
  if (item.status !== 'pending-demo') return res.status(409).json({ message: 'Заявка уже обработана' });
  item.status = status;
  if (status === 'rejected-demo') state.user.balance = Number((state.user.balance + item.amount).toFixed(8));
  record(`Админ: ${status === 'approved-demo' ? 'одобрена' : 'отклонена'} демо-заявка`, `${item.amount.toFixed(2)} USDT`, 'Тест');
  persist();
  res.json({ ok: true, message: `Заявка ${status === 'approved-demo' ? 'одобрена' : 'отклонена'} (демо)`, withdrawal: item });
});
app.put('/api/admin/rates', adminOnly, (req, res) => {
  const input = req.body?.rates;
  if (!Array.isArray(input) || input.length !== 5) return res.status(400).json({ message: 'Нужно передать 5 уровней' });
  const valid = input.every((item, index) => item.name === defaultRates[index].name && Number.isFinite(Number(item.min)) && Number(item.min) >= 0 && Number.isFinite(Number(item.rate)) && Number(item.rate) >= 0 && Number(item.rate) <= 100);
  if (!valid) return res.status(400).json({ message: 'Проверьте пороги и демонстрационные ставки уровней' });
  state.rates = input.map((item) => ({ name: item.name, min: Number(item.min), rate: Number(item.rate) }));
  persist();
  res.json({ ok: true, message: 'Демо-уровни сохранены', rates: state.rates });
});
app.get('/api/admin/users', adminOnly, (_req, res) => res.json([safeUser()]));
app.use((err, _req, res, _next) => { console.error(err); res.status(400).json({ message: 'Некорректный запрос' }); });
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(root, 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')));
}
app.listen(port, () => console.log(`TICKBITAI demo API listening on http://localhost:${port}`));
