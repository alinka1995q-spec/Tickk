import { useCallback, useEffect, useMemo, useState } from 'react';

const NAV = [
  ['home', 'Главная', '⌂'], ['stats', 'Статистика', '▥'], ['history', 'История', '◷'],
  ['referrals', 'Рефералы', '♧'], ['profile', 'Профиль', '◉'],
];
const REF_LINK = 'https://t.me/TickBitEarn_bot?start=ref_demo';
const money = (v, d = 2) => Number(v || 0).toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d });

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Запрос завершился ошибкой (${response.status})`);
  return data;
}

function App() {
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [cashback, setCashback] = useState('15');
  const [modal, setModal] = useState('');
  const [depositAmount, setDepositAmount] = useState('3');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [wallet, setWallet] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [adminData, setAdminData] = useState(null);
  const [rates, setRates] = useState([]);

  const notify = useCallback((message) => setToast(message), []);
  const refresh = useCallback(async () => {
    const [u, dashboard, rows] = await Promise.all([
      request('/user'), request('/dashboard'), request('/history'),
    ]);
    setUser(u);
    setCashback(String(u.cashbackPercent));
    setStats(dashboard);
    setRates(dashboard.rates);
    setHistory(rows);
    setError('');
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [u, dashboard, rows] = await Promise.all([request('/user'), request('/dashboard'), request('/history')]);
        if (!mounted) return;
        setUser(u); setCashback(String(u.cashbackPercent)); setStats(dashboard); setRates(dashboard.rates); setHistory(rows); setError('');
      } catch (e) { if (mounted) setError(e.message); }
    };
    load();
    const timer = window.setInterval(load, 5000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const levelCounts = user?.referrals?.levels || {};
  const referralTotal = useMemo(() => Object.values(levelCounts).reduce((sum, n) => sum + Number(n || 0), 0), [levelCounts]);
  const share = () => window.open(`https://t.me/share/url?url=${encodeURIComponent(REF_LINK)}&text=${encodeURIComponent('Присоединяйся к TICKBITAI demo')}`, '_blank', 'noopener,noreferrer');
  const copy = async () => {
    try { await navigator.clipboard.writeText(REF_LINK); notify('Ссылка скопирована'); }
    catch { notify('Копирование недоступно в этом браузере'); }
  };

  async function submitAction(path, body, success) {
    setBusy(true);
    try { const result = await request(path, { method: 'POST', body: JSON.stringify(body) }); await refresh(); setModal(''); notify(result.message || success); }
    catch (e) { notify(e.message); }
    finally { setBusy(false); }
  }
  const openGift = () => submitAction('/gift/open', {}, 'Награда получена');
  const saveCashback = (e) => { e.preventDefault(); submitAction('/referrals/settings', { percent: Number(cashback) }, 'Настройки сохранены'); };
  const deposit = (e) => { e.preventDefault(); submitAction('/demo/deposit', { amount: Number(depositAmount) }, 'Демо-пополнение выполнено'); };
  const withdraw = (e) => { e.preventDefault(); submitAction('/withdraw', { amount: Number(withdrawAmount), wallet }, 'Заявка создана'); setWithdrawAmount(''); setWallet(''); };

  async function openAdmin(e) {
    e.preventDefault();
    try {
      const [data, dashboard] = await Promise.all([
        request('/admin/withdrawals', { headers: { Authorization: `Bearer ${adminToken}` } }),
        request('/admin/dashboard', { headers: { Authorization: `Bearer ${adminToken}` } }),
      ]);
      setAdminData({ ...data, dashboard });
      setRates(dashboard.rates || []);
      notify('Админ-данные загружены');
    } catch (e2) { notify(e2.message); }
  }

  if (!user && !error) return <div className="loading">Загрузка TICKBITAI…</div>;

  const home = <div className="screen-stack">
    <header className="topbar"><button className="close-btn" onClick={() => window.Telegram?.WebApp?.close?.()} aria-label="Закрыть">×</button><div className="brand-mark">TICKBITAI</div><span className="live-dot">DEMO</span></header>
    <section className="card warning"><strong>Демонстрационный режим</strong><span>Нет реальных активов, торговли, доходности или переводов. Все значения тестовые.</span></section>
    <section className="card profile-card"><div className="profile-row"><div className="avatar">{(user?.name || 'D')[0].toUpperCase()}</div><div><h2>{user?.name || 'Демо-пользователь'}</h2><span className="status-badge">{user?.level || 'Без уровня'}</span></div></div><div className="balance-grid"><div className="balance-tile"><span>Демо-баланс</span><strong>{money(user?.balance, 4)} USDT</strong></div><div className="balance-tile"><span>Звезды</span><strong>{user?.stars ?? 0} ✦</strong></div></div><div className="quick-actions"><button className="primary-btn" onClick={() => setModal('deposit')}>＋ Пополнить демо</button><button className="ghost-btn" onClick={() => setModal('withdraw')}>Вывести</button></div></section>
    <div className="ticker card"><span>✦ Только демонстрационные данные · реальные выплаты не подключены · </span><span>✦ Только демонстрационные данные · реальные выплаты не подключены · </span></div>
    <section className="card profit-card"><span className="eyebrow">ДЕМО-ПРИБЫЛЬ</span><h2>${money(user?.profit, 8)}</h2><div className="profit-footer"><span>Демо-темп: {money(user?.speed, 4)} / час</span><button className="primary-btn" onClick={() => setModal('withdraw')}>Создать демо-заявку</button></div><p>Показатель не рассчитывается на основе реальной торговли и не является прогнозом.</p></section>
    <section className="card promo"><span className="eyebrow">УРОВЕНЬ</span><h3>{user?.level || 'Без уровня'}</h3><p>В демо можно пополнить тестовый баланс для проверки интерфейса.</p></section>
    <section className="card gift"><div className="row-between"><div><span className="eyebrow">БОНУСЫ</span><h3>Gift Box</h3></div><span className="count-pill">{user?.giftBoxes ?? 0} сундуков</span></div><button className="gift-btn" onClick={openGift} disabled={busy || !user?.giftBoxes}>Открыть сундук →</button></section>
    <section className="card"><span className="eyebrow">РЕФЕРАЛЬНАЯ ПРОГРАММА</span><h3>Пригласите друзей</h3><p>Ссылка и статистика сети в этом демо не привязаны к реальным Telegram-пользователям.</p><div className="quick-actions"><button className="primary-btn" onClick={share}>Поделиться</button><button className="ghost-btn" onClick={copy}>Копировать</button></div><div className="bonus-grid"><span>Бонусы отображаются только как макет</span></div></section>
    <section className="card promo"><span className="eyebrow">ЗАДАНИЯ</span><h3>Stories Bonus</h3><p>Проверка Telegram Stories и начисление бонуса не подключены.</p></section>
  </div>;

  const statsView = <div className="screen-stack"><div className="section-title-block"><span className="eyebrow">ОБЗОР</span><h2>Статистика</h2></div><div className="stats-grid">{[['Пользователи (макет)', stats?.totalUsers], ['Активные депозиты (макет)', stats?.activeDeposits], ['Выплаты (макет)', `$${stats?.payoutVolume ?? 0}`], ['DAU (макет)', stats?.dau]].map(([label, value]) => <div className="card metric" key={label}><span>{label}</span><strong>{value ?? '—'}</strong></div>)}</div><section className="card"><h3>Уровни из ТЗ · демонстрационные</h3>{rates.map((level) => <div className="level-row" key={level.name}><strong>{level.name}</strong><span>от {level.min} USDT</span><b>до {level.rate}% / день</b></div>)}</section><p className="disclaimer">Ставки не обещают доход и не работают как реальный финансовый продукт.</p></div>;
  const historyView = <div className="screen-stack"><div className="section-title-block"><span className="eyebrow">ОПЕРАЦИИ</span><h2>История</h2></div><section className="card">{history.length ? history.map((row) => <div className="history-row" key={row.id}><div><strong>{row.title}</strong><small>{row.time}</small></div><div className="history-side"><strong>{row.amount}</strong><small>{row.status}</small></div></div>) : <p>Операций пока нет.</p>}</section></div>;
  const referralsView = <div className="screen-stack"><div className="section-title-block"><span className="eyebrow">ВАША КОМАНДА · ДЕМО</span><h2>Рефералы</h2></div><section className="card"><div className="row-between"><span>Всего в тестовых данных</span><strong className="big-number">{referralTotal}</strong></div>{Object.entries(levelCounts).map(([key, value], i) => <div className="level-row" key={key}><span>{i + 1} уровень</span><strong>{value}</strong></div>)}</section><section className="card"><span className="eyebrow">ССЫЛКА ДЛЯ ПОДЕЛИТЬСЯ</span><div className="link-box">{REF_LINK}</div><div className="quick-actions"><button className="primary-btn" onClick={share}>Telegram</button><button className="ghost-btn" onClick={copy}>Скопировать</button></div></section><form className="card" onSubmit={saveCashback}><h3>Настройка рефбека (демо)</h3><label htmlFor="cashback">Процент 0–100%</label><div className="quick-actions"><input id="cashback" type="number" min="0" max="100" step="1" required value={cashback} onChange={(e) => setCashback(e.target.value)} /><button className="primary-btn" disabled={busy}>Сохранить</button></div></form><section className="card"><h3>Достижения · макет</h3>{[['Первый реферал', 100, '+30 звезд'], ['Второй реферал', 72, '+50 звезд'], ['Команда 10', 41, '+$75']].map(([label, progress, reward]) => <div className="achievement" key={label}><div className="row-between"><strong>{label}</strong><span>{reward}</span></div><div className="progress"><span style={{ width: `${progress}%` }} /></div></div>)}</section></div>;
  const profileView = <div className="screen-stack"><div className="section-title-block"><span className="eyebrow">АККАУНТ</span><h2>Профиль</h2></div><section className="card"><div className="profile-row"><div className="avatar">{(user?.name || 'D')[0].toUpperCase()}</div><div><h3>{user?.name}</h3><span className="status-badge">{user?.level || 'Демо'}</span></div></div><div className="level-row"><span>Демо-баланс</span><strong>{money(user?.balance, 4)} USDT</strong></div><div className="level-row"><span>Демо-прибыль</span><strong>{money(user?.profit, 8)} USDT</strong></div><div className="level-row"><span>Рефбек</span><strong>{user?.cashbackPercent}%</strong></div><div className="level-row"><span>Сундуки</span><strong>{user?.giftBoxes}</strong></div><div className="level-row"><span>Осталось микро-заявок</span><strong>{user?.microWithdrawalsRemaining ?? 5}</strong></div></section><section className="card"><h3>Условия демо-заявок</h3><ul className="rules"><li>Минимум: 0.1 USDT; заявки меньше 10 USDT считаются микро-заявками.</li><li>Для микро-заявок установлен лимит 5 на демо-пользователя.</li><li>Создание заявки только записывает тестовую операцию, не выполняет перевод.</li></ul></section><section className="card admin-card"><h3>Административные данные</h3><p>Панель доступна только при настроенном ADMIN_TOKEN на сервере.</p><form onSubmit={openAdmin}><label htmlFor="admin-token">Токен администратора</label><input id="admin-token" type="password" autoComplete="off" value={adminToken} onChange={(e) => setAdminToken(e.target.value)} required /><button className="primary-btn" disabled={!adminToken}>Открыть панель</button></form>{adminData && <div className="admin-results"><h4>Метрики (демо)</h4><p>Пользователи: {adminData.dashboard.totalUsers} · DAU: {adminData.dashboard.dau}</p><h4>Заявки на вывод</h4>{adminData.length ? adminData.map((item) => <p key={item.id}>{item.amount} USDT · {item.status} · {item.wallet}</p>) : <p>Заявок нет</p>}<h4>Уровни</h4>{rates.map((r) => <p key={r.name}>{r.name}: {r.min} USDT · {r.rate}%</p>)}</div>}</section><section className="card warning"><strong>Ограничения</strong><span>Нет Telegram-авторизации, базы данных, платёжных интеграций или реальных выплат. Не используйте для денежных операций.</span></section></div>;
  const views = { home, stats: statsView, history: historyView, referrals: referralsView, profile: profileView };

  return <div className="app-shell">{error && <div className="api-error">API: {error} <button onClick={() => refresh().catch((e) => setError(e.message))}>Повторить</button></div>}<div className="phone-frame"><main className="content">{views[tab]}</main><nav className="bottom-nav" aria-label="Навигация">{NAV.map(([id, label, icon]) => <button key={id} className={tab === id ? 'nav-item active' : 'nav-item'} onClick={() => setTab(id)}><span>{icon}</span><small>{label}</small></button>)}</nav></div>{modal && <div className="modal-backdrop" onClick={() => setModal('')}><form className="modal" onSubmit={modal === 'deposit' ? deposit : withdraw} onClick={(e) => e.stopPropagation()}><div className="row-between"><h3>{modal === 'deposit' ? 'Демо-пополнение' : 'Демо-заявка на вывод'}</h3><button type="button" className="close-btn" onClick={() => setModal('')}>×</button></div>{modal === 'deposit' ? <><label htmlFor="deposit-amount">Сумма тестовых USDT (от 3)</label><input id="deposit-amount" type="number" min="3" max="100000" step="0.01" required value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} /><p>Будут зачислены только тестовые единицы, не деньги.</p></> : <><label htmlFor="withdraw-amount">Сумма (от 0.1 USDT)</label><input id="withdraw-amount" type="number" min="0.1" step="0.01" required value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} /><label htmlFor="wallet">Тестовый адрес (не используется для перевода)</label><input id="wallet" required minLength="8" maxLength="128" value={wallet} onChange={(e) => setWallet(e.target.value)} /><p>Запрос будет только записан в демо-историю; блокчейн-перевода не будет.</p></>}<button className="primary-btn" disabled={busy}>{busy ? 'Обработка…' : 'Подтвердить'}</button></form></div>}{toast && <div className="toast" role="status">{toast}</div>}</div>;
}
export default App;
