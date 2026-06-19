import { StatsigProvider } from 'statsig-react';
import '../styles/globals.css';

// ────────────────────────────────────────────────────────────────
// ⚠️  여기에 Statsig Client SDK Key를 넣으세요
//     console.statsig.com → 프로젝트 → Settings → Keys & Environments
//     "Client API Key" 복사 후 아래 붙여넣기
// ────────────────────────────────────────────────────────────────
const STATSIG_CLIENT_KEY = 'client-YOUR_CLIENT_SDK_KEY_HERE';

// 데모용 유저 정보 (실제 서비스에서는 로그인한 유저 정보 사용)
const DEMO_USER = {
  userID: 'demo-user-001',
  email: 'lecturer@yeogieoddae.com',
  custom: {
    plan: 'premium',
    country: 'KR',
    platform: 'web',
  },
};

export default function App({ Component, pageProps }) {
  return (
    <StatsigProvider
      sdkKey={STATSIG_CLIENT_KEY}
      user={DEMO_USER}
      waitForInitialization={true}
      options={{
        environment: { tier: 'development' },
      }}
    >
      <Component {...pageProps} />
    </StatsigProvider>
  );
}
