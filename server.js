:root {
  color-scheme: dark;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background: #110b1f;
  color: #f5f3ff;
}

* {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  min-height: 100%;
  height: 100%;
  background:
    radial-gradient(circle at top, rgba(146, 84, 255, 0.35), transparent 30%),
    radial-gradient(circle at bottom, rgba(66, 177, 255, 0.12), transparent 25%),
    #110b1f;
}

body {
  display: flex;
  align-items: center;
  justify-content: center;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  position: relative;
}

.phone-frame {
  width: min(100%, 420px);
  min-height: 88vh;
  background: linear-gradient(180deg, rgba(15, 10, 26, 0.94), rgba(13, 7, 19, 0.98));
  border: 1px solid rgba(168, 123, 255, 0.35);
  border-radius: 24px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  position: relative;
}

.content {
  padding: 18px 18px 88px;
}

.screen-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: rgba(26, 19, 41, 0.9);
  border: 1px solid rgba(176, 121, 255, 0.15);
  border-radius: 18px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
  padding: 16px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px 10px;
}

.close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
  color: #fff;
  font-size: 18px;
}

.close-btn.small {
  width: 28px;
  height: 28px;
  font-size: 14px;
}

.brand-wrap {
  flex: 1;
  text-align: center;
}

.brand-mark {
  font-size: 1.55rem;
  letter-spacing: 0.06em;
  font-weight: 800;
  color: #e9d5ff;
  text-shadow: 0 0 16px rgba(176, 121, 255, 0.7);
}

.profile-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c084fc, #7c3aed);
  display: grid;
  place-items: center;
  font-weight: 800;
  color: white;
}

.avatar.large {
  width: 62px;
  height: 62px;
  font-size: 1.4rem;
}

.profile-meta h2 {
  margin: 0;
  font-size: 1.2rem;
}

.status-badge {
  display: inline-block;
  margin-top: 5px;
  padding: 6px 10px;
  font-size: 0.72rem;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.15);
  color: #8ae2ff;
  border: 1px solid rgba(56, 189, 248, 0.28);
}

.balance-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.lock-box {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255,255,255,0.04);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.label, .small-label, .muted-label {
  color: #c9b9e6;
  font-size: 0.72rem;
}

.lock-box strong {
  font-size: 0.94rem;
}

.quick-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.primary-btn,
.ghost-btn,
.gift-btn,
.withdraw-btn,
.copy-btn,
.tiny-btn,
.mini-icon {
  border: none;
  border-radius: 12px;
}

.primary-btn,
.withdraw-btn {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  box-shadow: 0 12px 24px rgba(124, 58, 237, 0.35);
  font-weight: 700;
}

.primary-btn {
  padding: 12px 16px;
  flex: 1;
}

.ghost-btn,
.tiny-btn,
.copy-btn,
.mini-icon {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: #f2ebff;
}

.ghost-btn,
.tiny-btn,
.copy-btn {
  padding: 11px 14px;
}

.wide {
  flex: 1;
}

.ticker-wrap {
  overflow: hidden;
  padding: 12px 16px;
}

.ticker-track {
  display: flex;
  width: max-content;
  gap: 28px;
  white-space: nowrap;
  animation: marquee 18s linear infinite;
  color: #d8cbff;
}

@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.profit-card h3 {
  margin: 6px 0 0;
  font-size: 2rem;
}

.profit-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.withdraw-btn {
  padding: 10px 12px;
  min-width: 128px;
}

.mini-stat-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
  padding: 10px 12px;
  border-radius: 12px;
}

.pill {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
  font-size: 0.72rem;
}

.helper-text {
  margin: 14px 0 0;
  color: #d4c4ff;
  line-height: 1.5;
}

.promo-box {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(168, 85, 247, 0.12));
}

.promo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.promo-row h4,
.gift-header-row h4,
.recommend-card h4,
.story-banner h4,
.levels-card h4,
.cashback-box h4,
.achievements-box h4,
.rules-box h4,
.admin-table-wrap h4 {
  margin: 8px 0 0;
  font-size: 1.08rem;
}

.tiny-btn {
  white-space: nowrap;
}

.gift-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.count-pill {
  display: inline-block;
  background: rgba(250, 204, 21, 0.12);
  border: 1px solid rgba(250, 204, 21, 0.24);
  color: #facc15;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
}

.gift-btn {
  margin-top: 16px;
  width: 100%;
  padding: 14px 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #1d1205;
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.mini-icon {
  width: 38px;
  height: 38px;
}

.recommend-card p,
.story-banner p,
.rules-box li {
  color: #ddd0ff;
  line-height: 1.6;
}

.cta-row {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.copy-btn {
  width: 52px;
  font-size: 1.1rem;
}

.bonus-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.bonus-tag {
  font-size: 0.8rem;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(134, 239, 172, 0.20);
  background: rgba(34,197,94,0.08);
  color: #bbf7d0;
}

.story-banner {
  background: linear-gradient(135deg, rgba(138, 92, 246, 0.18), rgba(14, 165, 233, 0.1));
}

.section-title-block {
  padding: 8px 4px;
}

.section-title-block h3 {
  margin: 0;
  font-size: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-card span {
  color: #d6c3ff;
  font-size: 0.8rem;
}

.metric-card strong {
  font-size: 1.35rem;
}

.metric-card small {
  color: #86efac;
}

.level-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.level-item {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 12px;
  padding: 12px 14px;
}

.level-name-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.82rem;
  color: #d7c9f5;
}

.level-item small {
  display: block;
  margin-top: 6px;
  color: #86efac;
}

.list-card {
  padding: 8px 0;
}

.history-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.history-row:last-child {
  border-bottom: none;
}

.history-row strong {
  display: block;
}

.history-row small {
  color: #d4c4ff;
}

.history-side {
  text-align: right;
}

.amount {
  display: block;
  font-weight: 700;
}

.history-side em {
  font-style: normal;
  color: #86efac;
  font-size: 0.78rem;
}

.ref-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.ref-total span {
  color: #d7c9f5;
}

.ref-total strong {
  font-size: 1.8rem;
}

.network-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
}

.network-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
}

.link-box {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  word-break: break-all;
  color: #dfe7ff;
}

.actions-row {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.input-row {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

input {
  width: 100%;
  padding: 12px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  color: white;
}

.achievement-item {
  margin-top: 16px;
}

.achievement-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.achievement-head strong {
  display: block;
}

.achievement-head small {
  color: #86efac;
}

.progress-bar {
  margin-top: 10px;
  height: 10px;
  background: rgba(255,255,255,0.06);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #8b5cf6, #34d399);
}

.big-row {
  align-items: center;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 18px;
}

.info-list div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
}

.rules-box ul {
  margin: 16px 0 0;
  padding-left: 18px;
}

.admin-button {
  margin-top: 18px;
}

.bottom-nav {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  background: rgba(23, 17, 30, 0.96);
  border: 1px solid rgba(166, 123, 255, 0.2);
  border-radius: 18px;
  padding: 10px 8px;
  box-shadow: 0 -12px 24px rgba(0,0,0,0.2);
}

.nav-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: #cab8ec;
  padding: 8px 6px;
  border-radius: 12px;
  min-height: 56px;
}

.nav-item span {
  font-size: 1.1rem;
}

.nav-item small {
  font-size: 0.62rem;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.18), rgba(167, 139, 250, 0.12));
  color: white;
  box-shadow: inset 0 0 0 1px rgba(192, 132, 252, 0.18);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(11, 8, 15, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 50;
}

.admin-modal {
  width: min(100%, 420px);
  background: rgba(18, 12, 28, 0.98);
  border: 1px solid rgba(168, 123, 255, 0.25);
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.35);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.admin-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 90px;
}

.admin-card span {
  color: #d6c3ff;
  font-size: 0.75rem;
}

.admin-card strong {
  font-size: 1.2rem;
}

.admin-table-wrap {
  margin-top: 18px;
}

.level-admin-list {
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.level-admin-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 104px;
  transform: translateX(-50%);
  background: rgba(29, 32, 55, 0.95);
  border: 1px solid rgba(167, 139, 250, 0.25);
  border-radius: 999px;
  padding: 10px 14px;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  z-index: 60;
}

@media (max-width: 420px) {
  .app-shell {
    padding: 0;
  }

  .phone-frame {
    width: 100%;
    min-height: 100vh;
    border-radius: 0;
  }
}
