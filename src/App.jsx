import { useEffect, useMemo, useState } from 'react';

const referralLink = 'https://t.me/TickBitEarn_bot?start=ref_8864161';

const navItems = [
  { id: 'home', label: 'Главная', icon: '🏠' },
  { id: 'stats', label: 'Статистика', icon: '📊' },
  { id: 'history', label: 'История', icon: '📄' },
  { id: 'referrals', label: 'Рефералы', icon: '👥' },
  { id: 'profile', label: 'Профиль', icon: '👤' },
];

const tickerItems = [
  'Nodir — снял прибыль 9.2822 T 1 мин. назад',
  'Abdugafur — получил +$14.20 за бонусы',
  'Amina — активировала Gold уровень',
  'Ruslan — открыл сундук и получил 25 звезд',
];

const statsBlocks = [
  { title: 'Активные депозиты', value: '$2,481', delta: '+8.3%' },
  { title: 'Доход в день', value: '$164.80', delta: '+2.6%' },
  { title: 'Рефералы', value: '112', delta: '+14' },
  { title: 'Сумма выплат', value: '$41.2K', delta: '+19.4%' },
];

const historyRows = [
  { title: 'Пополнение USDT', amount: '+3.00 USDT', time: 'Сегодня • 08:42', status: 'Успешно' },
  { title: 'Снятие прибыли', amount: '+0.0000960 T', time: 'Сегодня • 07:18', status: 'Обработано' },
  { title: 'Подарочный сундук', amount: '+10 звезд', time: 'Вчера • 22:05', status: 'Выполнено' },
  { title: 'Реферальный бонус', amount: '+$7.00', time: 'Вчера • 18:10', status: 'Зачислено' },
];

const achievementList = [
  { name: 'Первый реферал', progress: 100, reward: '+30 звезд', icon: '🎉' },
  { name: 'Второй реферал', progress: 72, reward: '+50 звезд', icon: '🚀' },
  { name: 'Команда 10', progress: 41, reward: '+$75', icon: '🏆' },
  { name: 'Gold участник', progress: 88, reward: '+$150', icon: '✨' },
];

const incomeLevels = [
  { name: 'Start', min: 10, rate: 'до 2.7%/день' },
  { name: 'Bronze', min: 30, rate: 'до 2.8%/день' },
  { name: 'Silver', min: 100, rate: 'до 3.0%/день' },
  { name: 'Gold', min: 300, rate: 'до 3.2%/день' },
  { name: 'Platinum', min: 1000, rate: 'до 3.5%/день' },
];

const rewards = [
  { label: '10 звезд', type: 'stars' },
  { label: '$3 USDT', type: 'usdt' },
  { label: '25 звезд', type: 'stars' },
  { label: '$5 USDT', type: 'usdt' },
  { label: '15 звезд', type: 'stars' },
  { label: '$8 USDT', type: 'usdt' },
];

const networkBreakdown = [
  { level: '1 Уровень', value: 48 },
  { level: '2 Уровень', value: 14 },
  { level: '3 Уровень', value: 6 },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [profitValue, setProfitValue] = useState(0.000096);
  const [profitSpeed, setProfitSpeed] = useState(0.0001);
  const [balance, setBalance] = useState(0.001);
  const [stars, setStars] = useState(30);
  const [giftBoxes, setGiftBoxes] = useState(10);
  const [refPercent, setRefPercent] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setProfitValue((prev) => Number((prev + 0.0000006).toFixed(8)));
      setBalance((prev) => Number((prev + 0.000001).toFixed(6)));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const referralSummary = useMemo(
    () => ({
      total: networkBreakdown.reduce((sum, item) => sum + item.value, 0),
      level1: 48,
      level2: 14,
      level3: 6,
    }),
    [],
  );

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      alert('Ссылка скопирована');
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  const openGiftBox = () => {
    if (giftBoxes <= 0) {
      return;
    }

    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    const rewardValue = reward.type === 'stars' ? 10 : 3;

    setGiftBoxes((prev) => prev - 1);
    setStars((prev) => prev + (reward.type === 'stars' ? rewardValue : 0));
    setBalance((prev) => Number((prev + (reward.type === 'usdt' ? rewardValue : 0)).toFixed(6)));
    alert(`Вы получили: ${reward.label}`);
  };

  const renderHome = () => (
    <div className="screen-stack">
      <header className="topbar">
        <button className="close-btn" aria-label="Закрыть мини-приложение">✕</button>
        <div className="brand-wrap">
          <span className="brand-mark">TICKBITAI</span>
        </div>
      </header>

      <section className="profile-card card">
        <div className="profile-row">
          <div className="avatar">A</div>
          <div className="profile-meta">
            <h2>Alim</h2>
            <span className="status-badge">Ваш AI уже анализирует рынок!</span>
          </div>
        </div>

        <div className="balance-grid">
          <div className="lock-box">
            <span className="label">Токен баланс</span>
            <strong>0.0010 T / USDT</strong>
          </div>
          <div className="lock-box">
            <span className="label">Звезды</span>
            <strong>{stars} звезд</strong>
          </div>
        </div>

        <div className="quick-actions">
          <button className="primary-btn">+ Добавить</button>
          <button className="ghost-btn">Вывести</button>
        </div>
      </section>

      <div className="ticker-wrap card">
        <div className="ticker-track">
          {tickerItems.concat(tickerItems).map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <section className="profit-card card">
        <div className="profit-header">
          <div>
            <span className="muted-label">Ваш доход / прибыль</span>
            <h3>${profitValue.toFixed(8)}</h3>
          </div>
          <button className="withdraw-btn">+ СНЯТЬ ПРИБЫЛЬ</button>
        </div>

        <div className="mini-stat-line">
          <span className="pill">Скорость майнинга</span>
          <strong>+{profitSpeed.toFixed(4)} в ч</strong>
        </div>

        <p className="helper-text">Прибыль будет переведен�� на ваш USDT баланс.</p>
      </section>

      <section className="promo-box card">
        <div className="promo-row">
          <div>
            <span className="small-label">Пополнение</span>
            <h4>Пополните счет от 3 USDT без комиссий</h4>
          </div>
          <button className="tiny-btn">Подробнее</button>
        </div>
      </section>

      <section className="gift-box card">
        <div className="gift-header-row">
          <div>
            <span className="small-label">Бесплатные бонусы</span>
            <h4>Gift Box</h4>
          </div>
          <span className="count-pill">{giftBoxes} сундуков</span>
        </div>

        <button className="gift-btn" onClick={openGiftBox}>Открыть сундук →</button>
      </section>

      <section className="recommend-card card">
        <div className="section-head">
          <div>
            <span className="small-label">AI Рекомендация</span>
            <h4>Удвойте скорость своего дохода</h4>
          </div>
          <button className="mini-icon">↗</button>
        </div>

        <p>Приглашение 1 пользователя удваивает скорость дохода.</p>

        <div className="cta-row">
          <button className="primary-btn wide">Пригласить</button>
          <button className="copy-btn" onClick={copyReferral}>⧉</button>
        </div>

        <div className="bonus-grid">
          <div className="bonus-tag">+$7 бонусов за приглашение</div>
          <div className="bonus-tag">+10% USDT от пополнений</div>
        </div>
      </section>

      <section className="story-banner card">
        <span className="small-label">Задания</span>
        <h4>Получите +$10 бонусов</h4>
        <p>Опубликуйте репост сторис с вашей ссылкой и получите дополнительный бонус.</p>
      </section>
    </div>
  );

  const renderStats = () => (
    <div className="screen-stack">
      <div className="section-title-block">
        <h3>Статистика</h3>
      </div>

      <div className="stats-grid">
        {statsBlocks.map((block) => (
          <div className="metric-card card" key={block.title}>
            <span>{block.title}</span>
            <strong>{block.value}</strong>
            <small>{block.delta}</small>
          </div>
        ))}
      </div>

      <section className="card levels-card">
        <h4>Уровни доходности</h4>
        <div className="level-list">
          {incomeLevels.map((level) => (
            <div className="level-item" key={level.name}>
              <div className="level-name-row">
                <strong>{level.name}</strong>
                <span>от {level.min} USDT</span>
              </div>
              <small>{level.rate}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderHistory = () => (
    <div className="screen-stack">
      <div className="section-title-block">
        <h3>История</h3>
      </div>

      <div className="list-card card">
        {historyRows.map((row) => (
          <div className="history-row" key={`${row.title}-${row.time}`}>
            <div>
              <strong>{row.title}</strong>
              <small>{row.time}</small>
            </div>
            <div className="history-side">
              <span className="amount">{row.amount}</span>
              <em>{row.status}</em>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReferrals = () => (
    <div className="screen-stack">
      <div className="section-title-block">
        <h3>Рефералы</h3>
      </div>

      <div className="card referral-summary">
        <div className="ref-total">
          <span>Всего рефералов</span>
          <strong>{referralSummary.total}</strong>
        </div>

        <div className="network-list">
          {networkBreakdown.map((item) => (
            <div className="network-item" key={item.level}>
              <span>{item.level}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="card referral-link-box">
        <label>Реферальная ссылка</label>
        <div className="link-box">{referralLink}</div>
        <div className="actions-row">
          <button className="primary-btn">Telegram</button>
          <button className="ghost-btn" onClick={copyReferral}>Скопировать</button>
        </div>
      </div>

      <div className="card cashback-box">
        <h4>Cashback / Рефбек</h4>
        <label htmlFor="ref-percent">Процент рефбека</label>
        <div className="input-row">
          <input
            id="ref-percent"
            type="number"
            min="0"
            max="100"
            value={refPercent}
            onChange={(event) => setRefPercent(Number(event.target.value))}
          />
          <button className="primary-btn">Сохранить</button>
        </div>
      </div>

      <div className="card achievements-box">
        <h4>Достижения</h4>
        {achievementList.map((item) => (
          <div className="achievement-item" key={item.name}>
            <div className="achievement-head">
              <span>{item.icon}</span>
              <div>
                <strong>{item.name}</strong>
                <small>{item.reward}</small>
              </div>
            </div>
            <div className="progress-bar">
              <span style={{ width: `${item.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="screen-stack">
      <div className="section-title-block">
        <h3>Профиль</h3>
      </div>

      <div className="card profile-page">
        <div className="profile-row big-row">
          <div className="avatar large">A</div>
          <div className="profile-meta">
            <h2>Alim</h2>
            <span className="status-badge">Gold level</span>
          </div>
        </div>

        <div className="info-list">
          <div><span>Баланс</span><strong>${balance.toFixed(6)}</strong></div>
          <div><span>Прибыль</span><strong>${profitValue.toFixed(8)}</strong></div>
          <div><span>Рефбек</span><strong>{refPercent}%</strong></div>
          <div><span>Сундуки</span><strong>{giftBoxes}</strong></div>
        </div>
      </div>

      <div className="card rules-box">
        <h4>Условия вывода</h4>
        <ul>
          <li>Вывод доступен всем пользователям.</li>
          <li>Комиссия платформы: 0%.</li>
          <li>Минимальный порог: от 0.1 USDT.</li>
          <li>Рекомендуемая сумма вывода: от 10 USDT.</li>
          <li>Лимит микро-выводов: 5 транзакций от 0.1 до 10 USDT.</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <div className="phone-frame">
        <main className="content">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'stats' && renderStats()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'referrals' && renderReferrals()}
          {activeTab === 'profile' && renderProfile()}
        </main>

        <nav className="bottom-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={activeTab === item.id ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveTab(item.id)}
            >
              <span>{item.icon}</span>
              <small>{item.label}</small>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default App;
