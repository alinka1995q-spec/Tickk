import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 4000);
const root = path.dirname(fileURLToPath(import.meta.url));
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

// In-memory fixture data for local UI testing only. This is not a wallet or ledger.
const dashboard = {
  totalUsers: 18420, activeDeposits: 2481, payoutVolume: 41200, dau: 2613,
  rates: [
    { name: 'Start', min: 10, rate: 2.7 }, { name: 'Bronze', min: 30, rate: 2.8 },
    { name: 'Silver', min: 100, rate: 3.0 }, { name: 'Gold', min: 300, rate: 3.2 },
    { name: 'Platinum', min: 1000, rate: 3.5 },
  ],
};
const user = {
  id: 'demo_8864161', name: 'Alim', balance: 0.0014, profit: 0.000096, speed: 0.0001,
  stars: 30, cashbackPercent: 15, giftBoxes: 10, level: 'Без уровня',
  referrals: { levels: { level1: 48, level2: 14, level3: 6 } }, history: [],
  microWithdrawals: 0,
};
const withdrawals = [];
const rewards = [
  { label: '10 звезд', type: 'stars', value: 10 }, { label: '$3 USDT', type: 'usdt', value: 3 },
  { label: '25 звезд', type: 'stars', value: 25 }, { label: '$5 USDT', type: 'usdt', value: 5 },
  { label: '15 звезд', type: 'stars', value: 15 }, { label: '$8 USDT', type: 'usdt', value: 8 },
];
function record(title, amount, status = 'Выполнено') {
  user.history.unshift({ id: `${Date.now()}-${Math.random()}`, title, amount, status, time: new Date().toLocaleString('ru-RU') });
  user.history = user.history.slice(0, 100);
}
function publicUser() {
  const { microWithdrawals, ...safeUser } = user;
  return { ...safeUser, microWithdrawalsRemaining: Math.max(0, 5 - microWithdrawals) };
}

app.get('/api/health', (_req, res) => res.json({ ok: true, mode: 'demo', timestamp: new Date().toISOString() }));
app.get('/api/user', (_req, res) => res.json(publicUser()));
app.get('/api/dashboard', (_req, res) => res.json(dashboard));
app.get('/api/history', (_req, res) => res.json(user.history));
app.post('/api/referrals/settings', (req, res) => {
  const percent = Number(req.body?.percent);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) return res.status(400).json({ message: 'Процент должен быть от 0 до 100' });
  user.cashbackPercent = percent;
  res.json({ ok: true, cashbackPercent: user.cashbackPercent });
});
app.post('/api/gift/open', (_req, res) => {
  if (user.giftBoxes < 1) return res.status(409).json({ message: 'Нет доступных сундуков' });
  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  user.giftBoxes -= 1;
  if (reward.type === 'stars') user.stars += reward.value;
  else user.balance = Number((user.balance + reward.value).toFixed(6));
  record('Подарочный сундук', reward.label);
  res.json({ ok: true, reward: reward.label, giftBoxesLeft: user.giftBoxes });
});
app.post('/api/withdraw', (req, res) => {
  const amount = Number(req.body?.amount);
  const wallet = typeof req.body?.wallet === 'string' ? req.body.wallet.trim() : '';
  if (!Number.isFinite(amount) || amount < 0.1) return res.status(400).json({ message: 'Минимальная сумма заявки — 0.1 USDT' });
  if (!wallet || wallet.length < 8 || wallet.length > 128) return res.status(400).json({ message: 'Укажите корректный тестовый адрес кошелька' });
  if (amount > user.balance) return res.status(400).json({ message: 'Недостаточно средств на демо-балансе' });
  const micro = amount < 10;
  if (micro && user.microWithdrawals >= 5) return res.status(429).json({ message: 'Лимит из 5 микро-заявок исчерпан; накопите от 10 USDT' });
  user.balance = Number((user.balance - amount).toFixed(6));
  if (micro) user.microWithdrawals += 1;
  const withdrawal = { id: `demo-${Date.now()}`, amount, wallet, status: 'pending', createdAt: new Date().toISOString(), fee: 0 };
  withdrawals.unshift(withdrawal);
  record('Заявка на вывод (демо)', `-${amount.toFixed(2)} USDT`, 'Ожидает проверки');
  res.status(201).json({ ok: true, message: 'Демо-заявка создана; реальный перевод не выполняется', withdrawal });
});
app.get('/api/admin/withdrawals', (req, res) => {
  const token = process.env.ADMIN_TOKEN;
  if (!token || req.get('authorization') !== `Bearer ${token}`) return res.status(401).json({ message: 'Не авторизовано' });
  res.json(withdrawals);
});
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ message: 'Некорректный запрос' });
});
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(root, 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')));
}
app.listen(port, () => console.log(`TICKBITAI demo API listening on http://localhost:${port}`));
