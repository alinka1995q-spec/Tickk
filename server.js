import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const app = express();
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4000);
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

// Deliberately isolated, in-memory sandbox fixture. It is not a ledger or wallet.
const levels = [
  { name: 'Start', min: 10, rate: 2.7 }, { name: 'Bronze', min: 30, rate: 2.8 },
  { name: 'Silver', min: 100, rate: 3.0 }, { name: 'Gold', min: 300, rate: 3.2 },
  { name: 'Platinum', min: 1000, rate: 3.5 },
];
const dashboard = { totalUsers: 18420, activeDeposits: 2481, payoutVolume: 41200, dau: 2613, rates: levels };
const user = {
  id: 'demo-user', name: 'Alim', balance: 25, profit: 0, speed: 0.0001, stars: 30,
  cashbackPercent: 15, giftBoxes: 10, referrals: { levels: { level1: 48, level2: 14, level3: 6 } },
  history: [], microWithdrawals: 0,
};
const withdrawals = [];
const rewards = [
  { label: '10 звезд', type: 'stars', value: 10 }, { label: '25 звезд', type: 'stars', value: 25 },
  { label: '15 звезд', type: 'stars', value: 15 }, { label: '$3 USDT', type: 'usdt', value: 3 },
  { label: '$5 USDT', type: 'usdt', value: 5 }, { label: '$8 USDT', type: 'usdt', value: 8 },
];
function record(title, amount, status = 'Выполнено') {
  user.history.unshift({ id: crypto.randomUUID(), title, amount, status, time: new Date().toLocaleString('ru-RU') });
  user.history = user.history.slice(0, 100);
}
function levelFor(balance) { return [...levels].reverse().find((item) => balance >= item.min)?.name || 'Без уровня'; }
function safeUser() {
  const { microWithdrawals, ...data } = user;
  return { ...data, level: levelFor(user.balance), microWithdrawalsRemaining: Math.max(0, 5 - microWithdrawals) };
}
function adminOnly(req, res, next) {
  const token = process.env.ADMIN_TOKEN;
  if (!token || !crypto.timingSafeEqual(Buffer.from(req.get('authorization') || ''), Buffer.from(`Bearer ${token}`))) {
    return res.status(401).json({ message: 'Админ-доступ не настроен или токен неверен' });
  }
  next();
}
app.get('/api/health', (_req, res) => res.json({ ok: true, mode: 'demo', timestamp: new Date().toISOString() }));
app.get('/api/user', (_req, res) => res.json(safeUser()));
app.get('/api/dashboard', (_req, res) => res.json(dashboard));
app.get('/api/history', (_req, res) => res.json(user.history));
app.post('/api/demo/deposit', (req, res) => {
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount) || amount < 3 || amount > 100000) return res.status(400).json({ message: 'Демо-сумма должна быть от 3 до 100000' });
  user.balance = Number((user.balance + amount).toFixed(2));
  record('Демо-пополнение', `+${amount.toFixed(2)} USDT`, 'Тест');
  res.status(201).json({ ok: true, message: 'Демо-пополнение выполнено; реальные средства не задействованы' });
});
app.post('/api/referrals/settings', (req, res) => {
  const percent = Number(req.body?.percent);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) return res.status(400).json({ message: 'Процент должен быть от 0 до 100' });
  user.cashbackPercent = percent;
  res.json({ ok: true, message: 'Настройка сохранена (демо)', cashbackPercent: percent });
});
app.post('/api/gift/open', (_req, res) => {
  if (user.giftBoxes < 1) return res.status(409).json({ message: 'Нет доступных сундуков' });
  const reward = rewards[crypto.randomInt(rewards.length)];
  user.giftBoxes -= 1;
  if (reward.type === 'stars') user.stars += reward.value;
  else user.balance = Number((user.balance + reward.value).toFixed(2));
  record('Подарочный сундук', reward.label, 'Тест');
  res.json({ ok: true, message: `Получено: ${reward.label} (демо)`, reward: reward.label, giftBoxesLeft: user.giftBoxes });
});
app.post('/api/withdraw', (req, res) => {
  const amount = Number(req.body?.amount);
  const wallet = typeof req.body?.wallet === 'string' ? req.body.wallet.trim() : '';
  if (!Number.isFinite(amount) || amount < 0.1 || amount > 100000) return res.status(400).json({ message: 'Сумма должна быть от 0.1 до 100000 USDT' });
  if (wallet.length < 8 || wallet.length > 128) return res.status(400).json({ message: 'Введите тестовую строку адреса длиной от 8 до 128 символов' });
  if (amount > user.balance) return res.status(400).json({ message: 'Недостаточно демо-баланса' });
  const micro = amount < 10;
  if (micro && user.microWithdrawals >= 5) return res.status(429).json({ message: 'Лимит 5 микро-заявок исчерпан; накопите от 10 USDT' });
  user.balance = Number((user.balance - amount).toFixed(2));
  if (micro) user.microWithdrawals += 1;
  const item = { id: crypto.randomUUID(), amount, wallet, status: 'pending-demo', fee: 0, createdAt: new Date().toISOString() };
  withdrawals.unshift(item);
  record('Демо-заявка на вывод', `-${amount.toFixed(2)} USDT`, 'Ожидает проверки (демо)');
  res.status(201).json({ ok: true, message: 'Демо-заявка записана; перевод средств не выполняется', withdrawal: item });
});
app.get('/api/admin/withdrawals', adminOnly, (_req, res) => res.json(withdrawals));
app.get('/api/admin/dashboard', adminOnly, (_req, res) => res.json({ ...dashboard, pendingWithdrawals: withdrawals.filter((x) => x.status === 'pending-demo').length }));
app.use((err, _req, res, _next) => { console.error(err); res.status(400).json({ message: 'Некорректный запрос' }); });
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(root, 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')));
}
app.listen(port, () => console.log(`TICKBITAI demo API listening on http://localhost:${port}`));
