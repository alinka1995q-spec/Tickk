import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

const dashboard = {
  totalUsers: 18420,
  activeDeposits: 2481,
  payoutVolume: 41200,
  dau: 2613,
  rates: [
    { name: 'Start', min: 10, rate: 2.7 },
    { name: 'Bronze', min: 30, rate: 2.8 },
    { name: 'Silver', min: 100, rate: 3.0 },
    { name: 'Gold', min: 300, rate: 3.2 },
    { name: 'Platinum', min: 1000, rate: 3.5 },
  ],
};

const user = {
  id: 'user_8864161',
  name: 'Alim',
  balance: 0.0014,
  profit: 0.000096,
  stars: 30,
  cashbackPercent: 15,
  giftBoxes: 10,
  referrals: {
    total: 68,
    levels: { level1: 48, level2: 14, level3: 6 },
  },
  history: [
    { title: 'Пополнение USDT', amount: '+3.00 USDT', time: 'Сегодня • 08:42', status: 'Успешно' },
    { title: 'Снятие прибыли', amount: '+0.0000960 T', time: 'Сегодня • 07:18', status: 'Обработано' },
    { title: 'Подарочный сундук', amount: '+10 звезд', time: 'Вчера • 22:05', status: 'Выполнено' },
    { title: 'Реферальный бонус', amount: '+$7.00', time: 'Вчера • 18:10', status: 'Зачислено' },
  ],
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'tickbitai-api', timestamp: new Date().toISOString() });
});

app.get('/api/user', (_req, res) => {
  res.json(user);
});

app.get('/api/dashboard', (_req, res) => {
  res.json(dashboard);
});

app.post('/api/referrals/settings', (req, res) => {
  const percent = Number(req.body?.percent ?? user.cashbackPercent);
  user.cashbackPercent = Math.max(0, Math.min(100, percent));
  res.json({ ok: true, cashbackPercent: user.cashbackPercent });
});

app.post('/api/gift/open', (_req, res) => {
  if (user.giftBoxes <= 0) {
    return res.status(400).json({ ok: false, message: 'Нет доступных сундуков' });
  }

  user.giftBoxes -= 1;
  const rewards = ['10 звезд', '$3 USDT', '25 звезд', '$5 USDT', '15 звезд', '$8 USDT'];
  const reward = rewards[Math.floor(Math.random() * rewards.length)];

  if (reward.includes('USDT')) {
    user.balance = Number((user.balance + 3).toFixed(6));
  } else {
    user.stars += 10;
  }

  res.json({ ok: true, reward, giftBoxesLeft: user.giftBoxes });
});

app.post('/api/withdraw', (req, res) => {
  const amount = Number(req.body?.amount ?? 0.1);
  res.json({ ok: true, message: 'Заявка на вывод создана', amount, fee: 0 });
});

const distPath = path.join(__dirname, 'dist');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`TICKBITAI API running on http://localhost:${port}`);
});
