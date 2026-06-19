# 여기어때 × Statsig 강의 데모 앱

## 🚀 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. Statsig Client SDK Key 설정
# pages/_app.js 파일 열고 아래 줄 수정:
# const STATSIG_CLIENT_KEY = 'client-YOUR_CLIENT_SDK_KEY_HERE';
# → console.statsig.com > Settings > Keys & Environments > Client API Key 복사

# 3. 개발 서버 시작
npm run dev

# 4. 브라우저에서 열기
# http://localhost:3000
```

## 📋 Statsig Console에서 만들어야 할 것들

### ① Feature Gate: `special_badge_enabled`
- Rules: 처음엔 Everyone → 0% 로 시작
- 강의 중 ON으로 변경하면 숙소 카드에 "오늘의 특가" 배지 등장

### ② Experiment: `cta_button_test`
| 그룹 | button_text 값 |
|------|----------------|
| Control (33%) | 예약하기 |
| Treatment A (33%) | 지금 바로 예약 |
| Treatment B (33%) | 오늘만 이 가격 |

- Metric: `accommodation_booked` (숙소 예약 클릭)

### ③ Dynamic Config: `search_config`
| 키 | 타입 | 기본값 | 선택지 |
|----|------|--------|--------|
| price_display | string | per_night | per_night / total / cheapest |
| sort_by | string | popular | popular / price_asc / review |
| promo_banner | boolean | false | true / false |

## 🎓 강의 시연 순서

1. **Gate 시연**: Console에서 `special_badge_enabled` ON → 새로고침 → 배지 등장
2. **Config 시연**: `search_config`의 `price_display`를 total로 변경 → 새로고침 → 가격 형식 변경
3. **Experiment 시연**: `cta_button_test` 생성 → 버튼 텍스트 그룹별 다름 보여주기
4. **이벤트 시연**: 예약 버튼 클릭 → 하단 패널에 logEvent 실시간 표시

## 📁 파일 구조

```
yeogieoddae-demo/
├── pages/
│   ├── _app.js        ← Statsig Provider 설정
│   └── index.js       ← 메인 숙소 리스트 페이지
├── styles/
│   └── globals.css
└── package.json
```
