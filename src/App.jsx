import { useEffect, useMemo, useState } from 'react';

const API = '/api';
const referralLink = 'https://t.me/TickBitEarn_bot?start=ref_8864161';
const navItems = [
  { id: 'home', label: 'Главная', icon: '⌂' },
  { id: 'stats', label: 'Статистика', icon: '▥' },
  { id: 'history', label: 'История', icon: '◷' },
  { id: 'referrals', label: 'Рефералы', icon: '♧' },
  { id: 'profile', label: 'Профиль', icon: '◉' },
];
const levels = [
  { name: 'Start', min: 10, rate: 2.7 },
  { name: 'Bronze', min: 30, rate: 2.8 },
  { name: 'Silver', min: 100, rate: 3.0 },
  { name: 'Gold', min: 300, rate: 3.2 },
  { name: 'Platinum', min: 1000, rate: 3.5 },
];
const fmt = (value, digits = 4) => Number(value || 0).toFixed(digits);

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Ошибка запроса');
  return body;
}

function App() {
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState('');
  const [cashback, setCashback] = useState('15');
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(true);

  const notify = (message) => setToast(message);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [u, d] = await Promise.all([api('/user'), api('/dashboard')]);
        if (mounted) {
          setUser(u);
          setCashback(String(u.cashbackPercent));
          setDashboard(d);
          setHistory(u.history || []);
        }
      } catch (error) {
        if (mounted) notify(`API недоступно: ${error.message}`);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const timer = setInterval(load, 5000);
    return () => { mounted = false; clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const referralTotal = useMemo(() => Object.values(user?.referrals?.levels || {}).reduce((a, b) => a + b, 0), [user]);

  async function copyReferral() {
    try {
      await navigator.clipboard.writeText(referralLink);
      notify('Реферальная ссылка скопирована');
    } catch {
      notify('Не удалось скопировать ссылку');
    }
  }

  async function openGift() {
    try {
      const result = await api('/gift/open', { method: 'POST', body: '{}' });
      const [u] = await Promise.all([api('/user').then((value) => { setUser(value); return value; })]);
      setHistory(u.history || []);
      notify(`Награда: ${result.reward}`);
    } catch (error) { notify(error.message); }
  }

  async function saveCashback(event) {
    event.preventDefault();
    try {
      const result = await api('/referrals/settings', {
        method: 'POST', body: JSON.stringify({ percent: Number(cashback) }),
      });
      setCashback(String(result.cashbackPercent));
      setUser((previous) => ({ ...previous, cashbackPercent: result.cashbackPercent }));
      notify('Настройки рефбека сохранены');
    } catch (error) { notify(error.message); }
  }

  async function requestWithdraw(event) {
    event.preventDefault();
    try {
      const result = await api('/withdraw', {
        method: 'POST', body: JSON.stringify({ amount: Number(amount), wallet }),
      });
      setWithdrawOpen(false);
      setAmount('');
      setWallet('');
      const u = await api('/user');
      setUser(u);
      setHistory(u.history || []);
      notify(result.message);
    } catch (error) { notify(error.message); }
  }

  function shareTelegram() {
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Присоединяйся!')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  if (loading && !user) return <div className="loading">Загрузка TICKBITAI…</div>;

  const home = (
    <div className="screen-stack">
      <header className="topbar"><button className="close-btn" onClick={() => window.Telegram?.WebApp?.close?.()} aria-label="Закрыть">×</button><div className="brand-mark">TICKBITAI</div><span className="live-dot">● LIVE</span></header>
      <section className="card profile-card">
        <div className="profile-row"><div className="avatar">{(user?.name || 'A')[0].toUpperCase()}</div><div><h2>{user?.name || 'Гость'}</h2><span className="status-badge">AI-демо: начисления симулируются</span></div></div>
        <div className="balance-grid"><div className="balance-tile"><span>Баланс демо</span><strong>{fmt(user?.balance)} USDT</strong></div><div className="balance-tile"><span>Звезды</span><strong>{user?.stars ?? 0} ✦</strong></div></div>
        <div className="quick-actions"><button className="primary-btn" onClick={() => notify('Пополнение не подключено: настройте платежный шлюз')}>＋ Пополнить</button><button className="ghost-btn" onClick={() => setWithdrawOpen(true)}>Вывести</button></div>
      </section>
      <div className="ticker card"><span>✦ Демо-режим · баланс и доходность не являются реальными средствами · </span><span>✦ Демо-режим · баланс и доходность не являются реальными средствами · </span></div>
      <section className="card profit-card"><span className="eyebrow">НАКОПЛЕННАЯ ДЕМО-ПРИБЫЛЬ</span><h2>${fmt(user?.profit, 8)}</h2><div className="profit-footer"><span>Темп: {fmt(user?.speed, 4)} / час</span><button className="primary-btn" onClick={() => setWithdrawOpen(true)}>Заявка на вывод</button></div><p>Данные тестовые. Реальные начисления и выплаты не подключены.</p></section>
      <section className="card promo"><span className="eyebrow">УРОВЕНЬ ДОХОДНОСТИ</span><h3>{user?.level || 'Без уровня'}</h3><p>Пополнение и инвестиционные операции отключены в демо-версии.</p></section>
      <section className="card gift"><div className="row-between"><div><span className="eyebrow">БОНУСЫ</span><h3>Gift Box</h3></div><span className="count-pill">{user?.giftBoxes ?? 0} сундуков</span></div><button className="gift-btn" onClick={openGift} disabled={!user?.giftBoxes}>Открыть сундук →</button></section>
      <section className="card"><span className="eyebrow">AI РЕКОМЕНДАЦИЯ</span><h3>Пригласите друзей</h3><p>Реферальная ссылка и демонстрационная статистика вашей сети.</p><div className="quick-actions"><button className="primary-btn" onClick={shareTelegram}>Пригласить в Telegram</button><button className="ghost-btn" onClick={copyReferral}>Копировать</button></div><div className="bonus-grid"><span>+$7 бонус — демо</span><span>+10% от пополнений — не подключено</span></div></section>
      <section className="card promo"><span className="eyebrow">ЗАДАНИЯ</span><h3>Stories Bonus</h3><p>Проверка репоста Stories не подключена. Не публикуйте личные данные для получения бонуса.</p></section>
    </div>
  );

  const stats = <div className="screen-stack"><div className="section-title-block"><span className="eyebrow">ОБЗОР</span><h2>Статистика</h2></div><div className="stats-grid">{[['Пользователи', dashboard?.totalUsers], ['Активные депозиты', dashboard?.activeDeposits], ['Выплаты (демо)', `$${dashboard?.payoutVolume ?? 0}`], ['DAU', dashboard?.dau]].map(([label, value]) => <div className="card metric" key={label}><span>{label}</span><strong>{value ?? '—'}</strong></div>)}</div><section className="card"><h3>Демо-уровни (ставки не гарантированы)</h3>{(dashboard?.rates || levels).map((level) => <div className="level-row" key={level.name}><strong>{level.name}</strong><span>от {level.min} USDT</span><b>до {level.rate}% / день</b></div>)}</section><p className="disclaimer">Это демонстрационные значения, не оферта и не прогноз доходности.</p></div>;

  const historyView = <div className="screen-stack"><div className="section-title-block"><span className="eyebrow">ОПЕРАЦИИ</span><h2>История</h2></div><section className="card">{history.length ? history.map((row, i) => <div className="history-row" key={`${row.id || i}-${row.title}`}><div><strong>{row.title}</strong><small>{row.time}</small></div><div className="history-side"><strong>{row.amount}</strong><small>{row.status}</small></div></div>) : <p>Операций пока нет.</p>}</section></div>;

  const referrals = <div className="screen-stack"><div className="section-title-block"><span className="eyebrow">ВАША КОМАНДА</span><h2>Рефералы</h2></div><section className="card"><div className="row-between"><span>Всего рефералов</span><strong className="big-number">{referralTotal}</strong></div>{Object.entries(user?.referrals?.levels || {}).map(([key, value], i) => <div className="level-row" key={key}><span>{i + 1} уровень</span><strong>{value}</strong></div>)}</section><section className="card"><span className="eyebrow">РЕФЕРАЛЬНАЯ ССЫЛКА</span><div className="link-box">{referralLink}</div><div className="quick-actions"><button className="primary-btn" onClick={shareTelegram}>Telegram</button><button className="ghost-btn" onClick={copyReferral}>Скопировать</button></div></section><form className="card" onSubmit={saveCashback}><h3>Авто-рефбек</h3><label htmlFor="cashback">Процент (0–100%)</label><div className="quick-actions"><input id="cashback" type="number" min="0" max="100" step="1" required value={cashback} onChange={(e) => setCashback(e.target.value)} /><button className="primary-btn">Сохранить</button></div></form><section className="card"><h3>Достижения</h3>{[['Первый реферал', 100, '+30 звезд'], ['Второй реферал', 72, '+50 звезд'], ['Команда 10', 41, '+$75']].map(([label, progress, reward]) => <div className="achievement" key={label}><div className="row-between"><strong>{label}</strong><span>{reward}</span></div><div className="progress"><span style={{ width: `${progress}%` }} /></div></div>)}</section></div>;

  const profile = <div className="screen-stack"><div className="section-title-block"><span className="eyebrow">АККАУНТ</span><h2>Профиль</h2></div><section className="card"><div className="profile-row"><div className="avatar">{(user?.name || 'A')[0].toUpperCase()}</div><div><h3>{user?.name}</h3><span className="status-badge">{user?.level || 'Демо-пользователь'}</span></div></div><div className="level-row"><span>Баланс</span><strong>{fmt(user?.balance)} USDT</strong></div><div className="level-row"><span>Демо-прибыль</span><strong>{fmt(user?.profit, 8)} USDT</strong></div><div className="level-row"><span>Рефбек</span><strong>{user?.cashbackPercent}%</strong></div><div className="level-row"><span>Сундуки</span><strong>{user?.giftBoxes}</strong></div></section><section className="card"><h3>Правила вывода (демо)</h3><ul className="rules"><li>Минимум заявки: 0.1 USDT.</li><li>Для сумм меньше 10 USDT разрешено до 5 заявок.</li><li>Заявки только создаются и не отправляются в блокчейн.</li><li>Реальный вывод требует KYC/AML, кошелька и ручной/провайдерской проверки.</li></ul></section><section className="card disclaimer"><strong>Важно</strong><p>В приложении нет реальных активов, AI-торговли, платежей или гарантированной доходности. Все цифры — демонстрационные.</p></section></div>;

  const views = { home, stats, history: historyView, referrals, profile };
  return <div className="app-shell"><div className="phone-frame"><main className="content">{views[tab]}</main><nav className="bottom-nav" aria-label="Навигация">{navItems.map((item) => <button key={item.id} className={tab === item.id ? 'nav-item active' : 'nav-item'} onClick={() => setTab(item.id)}><span>{item.icon}</span><small>{item.label}</small></button>)}</nav></div>{withdrawOpen && <div className="modal-backdrop" onClick={() => setWithdrawOpen(false)}><form className="modal" onSubmit={requestWithdraw} onClick={(e) => e.stopPropagation()}><div className="row-between"><h3>Заявка на вывод · демо</h3><button type="button" className="close-btn" onClick={() => setWithdrawOpen(false)}>×</button></div><label htmlFor="amount">Сумма USDT</label><input id="amount" type="number" min="0.1" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} /><label htmlFor="wallet">Адрес кошелька (тестовый)</label><input id="wallet" required minLength="8" maxLength="128" value={wallet} onChange={(e) => setWallet(e.target.value)} /><p>Заявка будет записана как ожидающая. Перевод средств не выполняется.</p><button className="primary-btn">Создать заявку</button></form></div>}{toast && <div className="toast" role="status">{toast}</div>}</div>;
}

export default App;
