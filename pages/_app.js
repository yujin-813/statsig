import { StatsigProvider } from '@statsig/react-bindings';
import '../styles/globals.css';

const DEMO_USER = {
  userID: 'demo-user-001',
  email: 'yujin@weirdsector.co.kr',
  custom: {
    plan: 'premium',
    country: 'KR',
    platform: 'web',
  },
};

export default function App({ Component, pageProps }) {
  return (
    <StatsigProvider
      sdkKey={process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY}
      user={DEMO_USER}
      options={{ loggingEnabled: 'always' }}
    >
      <Component {...pageProps} />
    </StatsigProvider>
  );
}
