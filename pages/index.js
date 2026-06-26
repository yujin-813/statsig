import {
  useGateValue, useFeatureGate, useExperiment,
  useDynamicConfig, useStatsigClient, useStatsigUser,
} from '@statsig/react-bindings';
import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Statsig Console 설정 목록
//
// [Feature Gate]   special_badge_enabled    — 오늘의 특가 배지
// [Feature Gate]   internal_staff_only      — 내부 직원 전용 배너
// [Feature Gate]   promo_banner_enabled     — 상단 프로모 배너
// [Feature Gate]   review_count_enabled     — 리뷰 수 노출
// [Feature Gate]   discount_badge_enabled   — 할인율 배지 표시
// [Feature Gate]   quick_book_enabled       — 즉시확정 배지 표시
//
// [Experiment]     cta_button_test          → button_text (string)
// [Experiment]     reserve_button_color_test→ button_color (string)
// [Experiment]     hero_title_test          → title (string), subtitle (string)
// [Experiment]     card_layout_test         → layout ('grid' | 'list')
//
// [Dynamic Config] banner_config            → banner_text (string)
// [Dynamic Config] listing_config           → sort_by (string)
// [Dynamic Config] search_config            → price_display (string)
// ─────────────────────────────────────────────────────────────────────────────

const ACCOMMODATIONS = [
  {
    id: 1, name: '그랜드 서울 호텔', area: '서울 강남구', type: '호텔',
    pricePerNight: 128000, totalFor2Nights: 256000, originalPrice: 160000,
    rating: 4.8, reviews: 1203, distance: '강남역 도보 3분',
    tags: ['조식포함', '무료주차', '수영장'],
    image: '/images/hotel.jpg',
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', emoji: '🏨',
    cancelFree: true, quickBook: true,
  },
  {
    id: 2, name: '제주 오션뷰 풀빌라', area: '제주 서귀포시', type: '풀빌라',
    pricePerNight: 320000, totalFor2Nights: 640000, originalPrice: 390000,
    rating: 4.9, reviews: 856, distance: '중문관광단지 차로 10분',
    tags: ['전용수영장', '오션뷰', '바베큐'],
    image: '/images/villa.jpg',
    bg: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)', emoji: '🌊',
    cancelFree: true, quickBook: false,
  },
  {
    id: 3, name: '부산 해운대 씨뷰 모텔', area: '부산 해운대구', type: '모텔',
    pricePerNight: 89000, totalFor2Nights: 178000, originalPrice: 115000,
    rating: 4.5, reviews: 2341, distance: '해운대해수욕장 도보 1분',
    tags: ['바다전망', '조기체크인', '무료와이파이'],
    image: '/images/beach.jpg',
    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', emoji: '🏖️',
    cancelFree: false, quickBook: true,
  },
  {
    id: 4, name: '경주 황남 한옥 스테이', area: '경주시 황남동', type: '한옥',
    pricePerNight: 145000, totalFor2Nights: 290000, originalPrice: 170000,
    rating: 4.7, reviews: 432, distance: '첨성대 도보 5분',
    tags: ['한옥체험', '전통조식', '문화유적'],
    image: '/images/hanok.jpg',
    bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', emoji: '🏯',
    cancelFree: true, quickBook: false,
  },
  {
    id: 5, name: '강릉 소나무 게스트하우스', area: '강릉시 강문동', type: '게스트하우스',
    pricePerNight: 45000, totalFor2Nights: 90000, originalPrice: 58000,
    rating: 4.6, reviews: 678, distance: '경포해수욕장 도보 5분',
    tags: ['공용주방', '바베큐', '자전거대여'],
    image: '/images/guesthouse.jpg',
    bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', emoji: '🌲',
    cancelFree: true, quickBook: true,
  },
  {
    id: 6, name: '여수 돌산 오션테라스', area: '여수시 돌산읍', type: '풀빌라',
    pricePerNight: 280000, totalFor2Nights: 560000, originalPrice: 340000,
    rating: 4.8, reviews: 291, distance: '오동도 차로 15분',
    tags: ['오션뷰', '테라스', '커플추천'],
    image: '/images/terrace.jpg',
    bg: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', emoji: '🌅',
    cancelFree: false, quickBook: false,
  },
  {
    id: 7, name: '속초 설악 마운틴 리조트', area: '속초시 설악동', type: '호텔',
    pricePerNight: 195000, totalFor2Nights: 390000, originalPrice: 245000,
    rating: 4.6, reviews: 987, distance: '설악산 국립공원 차로 5분',
    tags: ['산악뷰', '스파', '레스토랑'],
    image: '/images/resort.jpg',
    bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', emoji: '⛰️',
    cancelFree: true, quickBook: true,
  },
  {
    id: 8, name: '전주 한옥마을 고택', area: '전주시 완산구', type: '한옥',
    pricePerNight: 110000, totalFor2Nights: 220000, originalPrice: 135000,
    rating: 4.9, reviews: 563, distance: '전주 한옥마을 도보 2분',
    tags: ['전통체험', '한복대여', '비빔밥조식'],
    image: '/images/gotaek.jpg',
    bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', emoji: '🏮',
    cancelFree: true, quickBook: false,
  },
  {
    id: 9, name: '담양 대숲 힐링 펜션', area: '담양군 봉산면', type: '펜션',
    pricePerNight: 165000, totalFor2Nights: 330000, originalPrice: 200000,
    rating: 4.7, reviews: 341, distance: '죽녹원 차로 10분',
    tags: ['대나무숲', '바베큐', '족욕탕'],
    image: '/images/pension.jpg',
    bg: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)', emoji: '🎋',
    cancelFree: false, quickBook: true,
  },
];

const CATEGORIES   = ['전체', '호텔', '모텔', '펜션', '풀빌라', '한옥', '게스트하우스'];
const SORT_OPTIONS = [['popular', '인기순'], ['price_asc', '낮은 가격순'], ['review', '리뷰 많은순']];

function sortAccommodations(list, sortBy) {
  const s = [...list];
  if (sortBy === 'price_asc') return s.sort((a, b) => a.pricePerNight - b.pricePerNight);
  if (sortBy === 'review')    return s.sort((a, b) => b.reviews - a.reviews);
  return s;
}

function formatPrice(acc, mode) {
  if (mode === 'total')    return `${acc.totalFor2Nights.toLocaleString()}원`;
  if (mode === 'cheapest') return `${acc.pricePerNight.toLocaleString()}원~`;
  return `${acc.pricePerNight.toLocaleString()}원`;
}

function priceLabel(mode) {
  if (mode === 'total')    return '2박 총액';
  if (mode === 'cheapest') return '최저가';
  return '1박';
}

function discountPct(acc) {
  return Math.round((1 - acc.pricePerNight / acc.originalPrice) * 100);
}

export default function HomePage() {
  // ── Feature Gates ─────────────────────────────────────────────────────────
  const showBadge         = useGateValue('special_badge_enabled');
  const staffGate         = useFeatureGate('internal_staff_only');
  const showPromoBanner   = useGateValue('promo_banner_enabled');
  const showReviewCount   = useGateValue('review_count_enabled');
  const showDiscountBadge = useGateValue('discount_badge_enabled');
  const showQuickBook     = useGateValue('quick_book_enabled');

  // ── Experiments ───────────────────────────────────────────────────────────
  const ctaExp      = useExperiment('cta_button_test');
  const buttonText  = ctaExp.get('button_text', '예약하기');

  const colorExp    = useExperiment('reserve_button_color_test');
  const buttonColor = colorExp.get('button_color', '#FF385C');

  const heroExp      = useExperiment('hero_title_test');
  const heroTitle    = heroExp.get('title', '특별한 여행,\n여기어때에서 시작하세요');
  const heroSubtitle = heroExp.get('subtitle', '전국 최저가 숙소 · 즉시 예약 · 무료 취소');

  const layoutExp  = useExperiment('card_layout_test');
  const cardLayout = layoutExp.get('layout', 'grid');

  // ── Dynamic Configs ───────────────────────────────────────────────────────
  const searchConf   = useDynamicConfig('search_config');
  const priceDisplay = searchConf.get('price_display', 'per_night');

  const listingConf = useDynamicConfig('listing_config');
  const sortBy      = listingConf.get('sort_by', 'popular');

  const bannerConf = useDynamicConfig('banner_config');
  const bannerText = bannerConf.get('banner_text', '지금 예약하면 10% 할인');

  // ── State ─────────────────────────────────────────────────────────────────
  const [searchQuery,    setSearchQuery]    = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [clickedId,      setClickedId]      = useState(null);
  const [savedIds,       setSavedIds]       = useState(new Set());
  const [eventLog,       setEventLog]       = useState([]);
  const [panelOpen,      setPanelOpen]      = useState(true);
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [modalAcc,       setModalAcc]       = useState(null);

  const { client } = useStatsigClient();
  const { user, updateUserAsync } = useStatsigUser();

  const filtered = ACCOMMODATIONS.filter(a =>
    (activeCategory === '전체' || a.type === activeCategory) &&
    (!searchQuery || a.name.includes(searchQuery) || a.area.includes(searchQuery))
  );
  const sorted = sortAccommodations(filtered, sortBy);

  function logEvent(name, value, meta = {}) {
    client.logEvent(name, value, meta);
    const ts = new Date().toLocaleTimeString('ko-KR');
    setEventLog(prev => [`[${ts}] ${name}${value ? ` · ${value}` : ''}`, ...prev].slice(0, 10));
  }

  function handleBook(acc, e) {
    e.stopPropagation();
    setClickedId(acc.id);
    logEvent('reserve_button_click');
    logEvent('accommodation_booked', acc.pricePerNight, {
      accommodation_id: String(acc.id),
      accommodation_name: acc.name,
      type: acc.type,
      button_text: buttonText,
      button_color: buttonColor,
      card_layout: cardLayout,
      price_display: priceDisplay,
    });
    setTimeout(() => { setClickedId(null); setModalAcc(acc); }, 600);
  }

  function handleCardClick(acc) {
    logEvent('accommodation_viewed', acc.pricePerNight, {
      accommodation_id: String(acc.id),
      type: acc.type,
    });
  }

  function toggleSave(id, e) {
    e.stopPropagation();
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      logEvent('wishlist_toggled', null, { id: String(id), action: next.has(id) ? 'save' : 'remove' });
      return next;
    });
  }

  function handleSearch() {
    logEvent('search_performed', null, { query: searchQuery || '전체', category: activeCategory });
  }

  // ── Card renderers ────────────────────────────────────────────────────────
  function CardImage({ acc, height = 210 }) {
    return (
      <div style={{ height, position: 'relative', overflow: 'hidden', background: acc.bg }}>
        <img
          src={acc.image} alt={acc.name}
          onError={e => { e.target.style.display = 'none'; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
          className="card-img"
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, opacity: 0.35, pointerEvents: 'none' }}>
          {acc.emoji}
        </div>

        {/* 저장 버튼 */}
        <button onClick={e => toggleSave(acc.id, e)} style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%',
          width: 36, height: 36, cursor: 'pointer', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          {savedIds.has(acc.id) ? '❤️' : '🤍'}
        </button>

        {/* Feature Gate: 오늘의 특가 배지 */}
        {showBadge && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: '#FF5C35', color: '#fff',
            fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20,
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            🏷️ 오늘의 특가
          </div>
        )}

        {/* Feature Gate: 할인율 배지 */}
        {showDiscountBadge && !showBadge && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: '#EF4444', color: '#fff',
            fontSize: 12, fontWeight: 900, padding: '4px 10px', borderRadius: 20,
          }}>
            {discountPct(acc)}% 할인
          </div>
        )}

        {/* Feature Gate: 즉시확정 + 무료취소 배지 */}
        <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 5 }}>
          {showQuickBook && acc.quickBook && (
            <div style={{
              background: 'rgba(16,185,129,0.9)', backdropFilter: 'blur(4px)',
              color: '#fff', fontSize: 10, fontWeight: 700,
              padding: '4px 9px', borderRadius: 20,
            }}>
              ⚡ 즉시확정
            </div>
          )}
          {acc.cancelFree && (
            <div style={{
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
              color: '#fff', fontSize: 10, fontWeight: 600,
              padding: '4px 9px', borderRadius: 20,
            }}>
              무료취소
            </div>
          )}
        </div>

        {/* 숙소 유형 */}
        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
          color: '#fff', fontSize: 11, fontWeight: 600,
          padding: '4px 10px', borderRadius: 20,
        }}>
          {acc.type}
        </div>
      </div>
    );
  }

  function BookButton({ acc }) {
    const isClicked = clickedId === acc.id;
    return (
      <button
        onClick={e => handleBook(acc, e)}
        style={{
          background: isClicked ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' : buttonColor,
          color: '#fff', border: 'none', borderRadius: 12,
          padding: '11px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          whiteSpace: 'nowrap', transition: 'all 0.2s', minWidth: 96,
          boxShadow: isClicked ? '0 4px 14px rgba(5,150,105,0.35)' : '0 4px 14px rgba(0,0,0,0.15)',
        }}
      >
        {isClicked ? '✓ 예약완료!' : buttonText}
      </button>
    );
  }

  function PriceBlock({ acc }) {
    const pct = discountPct(acc);
    return (
      <div>
        {showDiscountBadge && (
          <div style={{ fontSize: 12, color: '#EF4444', fontWeight: 700, marginBottom: 2 }}>
            {acc.originalPrice.toLocaleString()}원 → {pct}% 할인
          </div>
        )}
        <div style={{ fontSize: 11, color: '#BBB', marginBottom: 2, fontWeight: 500 }}>
          {priceLabel(priceDisplay)}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={{ fontSize: 21, fontWeight: 900, color: '#1A1A1A', letterSpacing: '-0.5px' }}>
            {formatPrice(acc, priceDisplay)}
          </span>
          {priceDisplay !== 'total' && (
            <span style={{ fontSize: 13, color: '#BBB' }}>/박</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Apple SD Gothic Neo', 'Pretendard', -apple-system, sans-serif", background: '#F4F5F7', minHeight: '100vh', color: '#1A1A1A' }}>

      {/* ── 헤더 ─────────────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 300, background: '#fff', borderBottom: '1px solid #EBEBEB' }}>
        <div className="header-inner">
          <a href="#" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#FF5C35', letterSpacing: '-1px' }}>여기어때</span>
          </a>

          <div className="header-search-wrap">
            <span style={{ fontSize: 15, color: '#AAA' }}>🔍</span>
            <input
              type="text"
              placeholder="어디로 떠나고 싶으세요?"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#1A1A1A', width: '100%' }}
            />
          </div>

          <div style={{ flex: 1 }} />

          <nav className="header-nav">
            {['숙소', '항공', '레저·투어', '교통', '쿠폰'].map(item => (
              <span key={item} style={{ fontSize: 14, color: '#555', cursor: 'pointer', fontWeight: 500 }}>{item}</span>
            ))}
          </nav>

          <div className="header-auth">
            <button className="btn-outline">로그인</button>
            <button className="btn-primary">회원가입</button>
          </div>

          <button className="hamburger" onClick={() => setMenuOpen(p => !p)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            <div className="mobile-search-wrap">
              <span style={{ fontSize: 15, color: '#AAA' }}>🔍</span>
              <input
                type="text"
                placeholder="어디로 떠나고 싶으세요?"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { handleSearch(); setMenuOpen(false); } }}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#1A1A1A', width: '100%' }}
              />
            </div>
            {['숙소', '항공', '레저·투어', '교통', '쿠폰'].map(item => (
              <div key={item} onClick={() => setMenuOpen(false)} style={{ padding: '14px 0', fontSize: 16, fontWeight: 500, color: '#1A1A1A', borderBottom: '1px solid #F4F5F7', cursor: 'pointer' }}>
                {item}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, paddingTop: 16 }}>
              <button className="btn-outline" style={{ flex: 1, padding: '11px 0', fontSize: 14 }}>로그인</button>
              <button className="btn-primary" style={{ flex: 1, padding: '11px 0', fontSize: 14 }}>회원가입</button>
            </div>
          </div>
        )}
      </header>

      {/* ── 프로모 배너 (Gate: promo_banner_enabled) ─────────── */}
      {showPromoBanner && (
        <div
          onClick={() => logEvent('promo_banner_clicked')}
          style={{
            background: 'linear-gradient(90deg, #CC2900 0%, #FF4500 40%, #FF7A00 100%)',
            color: '#fff', cursor: 'pointer', position: 'relative', overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(255,60,0,0.4)',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: '-100%', width: '55%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            animation: 'shimmer 2.2s ease-in-out infinite', pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '16px 28px' }}>
            <span style={{ fontSize: 26, animation: 'bounce 1.2s ease-in-out infinite', lineHeight: 1 }}>🎉</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#fff', color: '#FF3A00', fontSize: 11, fontWeight: 900, padding: '2px 8px', borderRadius: 4, letterSpacing: 1 }}>SALE</span>
                <span style={{ fontSize: 11, opacity: 0.85 }}>한정 기간 특별 할인</span>
              </div>
              <span className="promo-text" style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>{bannerText}</span>
            </div>
            <span style={{
              fontSize: 13, fontWeight: 700,
              background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.5)',
              padding: '7px 16px', borderRadius: 24, backdropFilter: 'blur(4px)',
              whiteSpace: 'nowrap', marginLeft: 8,
            }}>지금 예약하기 →</span>
          </div>
        </div>
      )}

      {/* ── 내부 직원 배너 (Gate: internal_staff_only) ───────── */}
      {staffGate.value && (
        <div>
          <div style={{ background: 'repeating-linear-gradient(45deg, #000 0px, #000 14px, #FBBF24 14px, #FBBF24 28px)', height: 5 }} />
          <div style={{
            background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
            color: '#fff', padding: '12px 28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
          }}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>🔐</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 4, letterSpacing: 1.5 }}>INTERNAL ONLY</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', animation: 'blink 1.1s ease-in-out infinite' }} />
                <span style={{ fontSize: 11, color: '#94A3B8' }}>LIVE</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3 }}>내부 직원 전용 모드 활성화</span>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>{user?.email} — 내부 기능이 활성화되어 있습니다</span>
            </div>
          </div>
          <div style={{ background: 'repeating-linear-gradient(45deg, #000 0px, #000 14px, #FBBF24 14px, #FBBF24 28px)', height: 5 }} />
        </div>
      )}

      {/* ── 히어로 (Experiment: hero_title_test) ─────────────── */}
      <div className="hero">
        <div className="container">
          <p style={{ fontSize: 13, fontWeight: 600, color: '#FF5C35', letterSpacing: 0.5, marginBottom: 10 }}>
            {heroSubtitle}
          </p>
          <h1 className="hero-title">
            {heroTitle.split('\n').map((line, i) => <span key={i}>{line}{i < heroTitle.split('\n').length - 1 && <br />}</span>)}
          </h1>

          <div className="hero-search-box">
            <div className="hero-fields">
              {[
                { label: '여행지', hint: '서울, 제주, 부산...' },
                { label: '체크인', hint: '날짜 선택' },
                { label: '체크아웃', hint: '날짜 선택' },
                { label: '인원', hint: '인원 선택' },
              ].map((item, i) => (
                <div key={i} className="hero-field" style={{ flex: i === 0 ? 2 : 1 }}>
                  <div style={{ fontSize: 11, color: '#999', fontWeight: 700, marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: '#CCC' }}>{item.hint}</div>
                </div>
              ))}
            </div>
            <div className="hero-search-btn-wrap">
              <button onClick={handleSearch} className="hero-search-btn">검색</button>
            </div>
          </div>

          <div className="quick-tags">
            {['제주 풀빌라', '서울 호텔', '부산 바다뷰', '강릉 오션뷰', '경주 한옥', '여수 펜션'].map(kw => (
              <span
                key={kw}
                onClick={() => { setSearchQuery(kw.split(' ')[0]); handleSearch(); }}
                style={{
                  fontSize: 12, padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.85)', color: '#555', fontWeight: 500,
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                🔍 {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 카테고리 탭 ──────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', position: 'sticky', top: 62, zIndex: 200 }}>
        <div className="container" style={{ display: 'flex', overflowX: 'auto', padding: '0 24px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); logEvent('category_selected', null, { category: cat }); }}
              style={{
                background: 'none', border: 'none', padding: '14px 16px',
                fontSize: 14, fontWeight: activeCategory === cat ? 700 : 400,
                color: activeCategory === cat ? '#FF5C35' : '#888',
                borderBottom: activeCategory === cat ? '2.5px solid #FF5C35' : '2.5px solid transparent',
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── 메인 컨텐츠 ──────────────────────────────────────── */}
      <div className="container" style={{ padding: '24px 24px 80px' }}>

        {/* 결과 수 + 정렬 + 레이아웃 토글 */}
        <div className="sort-row">
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}>
            숙소 <span style={{ color: '#FF5C35' }}>{sorted.length}</span>개
            {cardLayout === 'list' && <span style={{ marginLeft: 8, fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>· 리스트 뷰 실험 중</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="sort-options">
              {SORT_OPTIONS.map(([key, label]) => (
                <span
                  key={key}
                  style={{
                    padding: '7px 13px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                    background: sortBy === key ? '#FFF0ED' : '#fff',
                    color:      sortBy === key ? '#FF5C35'  : '#888',
                    border:     `1.5px solid ${sortBy === key ? '#FF5C35' : '#E8E8E8'}`,
                    cursor: 'default', whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {label}
                  {sortBy === key && <span style={{ fontSize: 9, opacity: 0.55 }}>Config</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 카드 목록 */}
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#BBB' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#888', marginBottom: 6 }}>검색 결과가 없어요</div>
            <div style={{ fontSize: 14, color: '#BBB' }}>다른 지역이나 카테고리를 선택해보세요</div>
          </div>
        ) : cardLayout === 'list' ? (
          /* ── 리스트 뷰 (Experiment: card_layout_test = 'list') ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sorted.map(acc => (
              <article
                key={acc.id}
                onClick={() => handleCardClick(acc)}
                className="list-card"
              >
                <div style={{ width: 220, flexShrink: 0 }}>
                  <CardImage acc={acc} height={160} />
                </div>
                <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, background: '#F4F5F7', color: '#666', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>{acc.type}</span>
                      {acc.cancelFree && <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>무료취소</span>}
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: 16, color: '#1A1A1A', marginBottom: 3, letterSpacing: '-0.3px' }}>{acc.name}</h3>
                    <p style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>📍 {acc.area} · {acc.distance}</p>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                      {acc.tags.map(tag => (
                        <span key={tag} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: '#F4F5F7', color: '#666', fontWeight: 500 }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: 13, color: '#FF5C35', fontWeight: 700 }}>★ {acc.rating}</span>
                      {showReviewCount && <span style={{ fontSize: 12, color: '#BBB', marginLeft: 4 }}>({acc.reviews.toLocaleString()}개)</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
                      <PriceBlock acc={acc} />
                      <BookButton acc={acc} />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* ── 그리드 뷰 (Experiment: card_layout_test = 'grid') ── */
          <div className="card-grid">
            {sorted.map(acc => (
              <article
                key={acc.id}
                onClick={() => handleCardClick(acc)}
                className="card"
              >
                <CardImage acc={acc} height={210} />

                <div style={{ padding: '16px 18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#FF5C35', fontWeight: 700 }}>★ {acc.rating}</span>
                    {showReviewCount && (
                      <span style={{ fontSize: 12, color: '#BBB', marginLeft: 4 }}>({acc.reviews.toLocaleString()})</span>
                    )}
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 12, color: '#AAA' }}>📍 {acc.distance}</span>
                  </div>

                  <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1A1A1A', marginBottom: 3, letterSpacing: '-0.3px' }}>{acc.name}</h3>
                  <p style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>{acc.area}</p>

                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 16 }}>
                    {acc.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: '#F4F5F7', color: '#666', fontWeight: 500 }}>{tag}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <PriceBlock acc={acc} />
                    <BookButton acc={acc} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ── 푸터 ─────────────────────────────────────────────── */}
      <footer style={{ background: '#fff', borderTop: '1px solid #EBEBEB', padding: '48px 24px 32px' }}>
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <div style={{ fontSize: 24, fontWeight: 900, color: '#FF5C35', letterSpacing: '-1px', marginBottom: 12 }}>여기어때</div>
              <div style={{ fontSize: 13, color: '#AAA', lineHeight: 2 }}>
                여기어때컴퍼니 주식회사&nbsp;&nbsp;|&nbsp;&nbsp;대표이사 정명훈<br />
                서울특별시 구로구 디지털로 300, 지밸리비즈플라자<br />
                사업자등록번호 : 000-00-00000
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                {['App Store', 'Google Play'].map(s => (
                  <div key={s} style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #E8E8E8', fontSize: 12, fontWeight: 600, color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {s === 'App Store' ? '🍎' : '▶'} {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="footer-cols">
              {[
                { title: '서비스',   links: ['숙소', '항공', '레저·투어', '공항버스', '렌터카'] },
                { title: '고객지원', links: ['공지사항', '고객센터', '이용약관', '개인정보처리방침'] },
                { title: '파트너십', links: ['사업자 등록', '제휴 문의', '광고 문의', '채용'] },
              ].map(col => (
                <div key={col.title}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 14 }}>{col.title}</div>
                  {col.links.map(link => (
                    <div key={link} style={{ fontSize: 13, color: '#AAA', marginBottom: 10, cursor: 'pointer' }}>{link}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ paddingTop: 24, borderTop: '1px solid #F4F5F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#CCC' }}>© 2025 여기어때컴퍼니. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Instagram', 'YouTube', 'Blog'].map(s => (
                <span key={s} style={{ fontSize: 12, color: '#CCC', cursor: 'pointer' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── 예약 완료 모달 ────────────────────────────────────── */}
      {modalAcc && (
        <div
          onClick={() => setModalAcc(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', maxWidth: 380, width: '100%', animation: 'slideUp 0.25s ease-out' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 52, marginBottom: 10 }}>🎉</div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#1A1A1A', marginBottom: 6 }}>예약이 완료됐어요!</h2>
              <p style={{ fontSize: 14, color: '#999' }}>예약 확인 내역을 이메일로 보내드렸어요</p>
            </div>

            <div style={{ background: '#F8F9FA', borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
              {[
                ['숙소', modalAcc.name],
                ['위치', modalAcc.area],
                ['유형', modalAcc.type],
                ['결제금액', formatPrice(modalAcc, priceDisplay)],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ color: '#888', fontSize: 13 }}>{label}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: label === '결제금액' ? '#FF5C35' : '#1A1A1A' }}>{val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setModalAcc(null)}
              style={{ width: '100%', background: buttonColor, color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* ── Statsig 플로팅 패널 ──────────────────────────────── */}
      <div className="statsig-floating">
        {panelOpen && (
          <div className="statsig-panel">
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: 1, marginBottom: 14, textTransform: 'uppercase' }}>
              🎓 Statsig 데모 패널
            </div>

            {/* 유저 전환 */}
            <div style={{ background: '#1E293B', borderRadius: 12, padding: '11px 14px', marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, marginBottom: 8 }}>👤 유저 전환 (Gate 테스트)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: '내부 직원', email: 'yujin@weirdsector.co.kr', color: '#10B981', desc: 'internal_staff_only ON' },
                  { label: '일반 유저', email: 'user@gmail.com',           color: '#64748B', desc: '모든 게이트 기본값' },
                ].map(u => {
                  const isActive = user?.email === u.email;
                  return (
                    <button
                      key={u.email}
                      onClick={() => updateUserAsync({ userID: u.email, email: u.email })}
                      style={{
                        background: isActive ? '#0F2A1E' : '#0F172A',
                        border: `1.5px solid ${isActive ? u.color : '#334155'}`,
                        borderRadius: 8, padding: '7px 10px',
                        display: 'flex', alignItems: 'center', gap: 8,
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? u.color : '#334155', display: 'inline-block', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? u.color : '#64748B' }}>{u.label}</div>
                        <div style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace' }}>{u.desc}</div>
                      </div>
                      {isActive && <span style={{ fontSize: 10, color: u.color }}>현재</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feature Gates */}
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, marginBottom: 6 }}>🚪 FEATURE GATES</div>
            {[
              { label: 'special_badge_enabled',  value: showBadge,         desc: '오늘의 특가 배지' },
              { label: 'promo_banner_enabled',   value: showPromoBanner,   desc: '상단 프로모 배너' },
              { label: 'review_count_enabled',   value: showReviewCount,   desc: '리뷰 수 노출' },
              { label: 'discount_badge_enabled', value: showDiscountBadge, desc: '할인율 % 배지' },
              { label: 'quick_book_enabled',     value: showQuickBook,     desc: '즉시확정 배지' },
              { label: 'internal_staff_only',    value: staffGate.value,   desc: '내부 직원 전용 배너' },
            ].map(g => (
              <div key={g.label} style={{
                background: '#1E293B', borderRadius: 8, padding: '7px 11px', marginBottom: 5,
                borderLeft: `3px solid ${g.value ? '#10B981' : '#1E293B'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 10, color: '#64748B', marginBottom: 1 }}>{g.label}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{g.desc}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 6,
                  background: g.value ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                  color: g.value ? '#34D399' : '#475569',
                }}>{g.value ? 'ON' : 'OFF'}</span>
              </div>
            ))}

            {/* Experiments */}
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, marginBottom: 6, marginTop: 10 }}>🧪 EXPERIMENTS</div>
            {[
              { name: 'cta_button_test',            param: 'button_text',  value: `"${buttonText}"` },
              { name: 'reserve_button_color_test',  param: 'button_color', value: buttonColor, isColor: true },
              { name: 'hero_title_test',            param: 'title',        value: `"${heroTitle.replace('\n', ' ')}"` },
              { name: 'card_layout_test',           param: 'layout',       value: `"${cardLayout}"` },
            ].map(exp => (
              <div key={exp.name} style={{ background: '#1E293B', borderRadius: 8, padding: '8px 11px', marginBottom: 5, borderLeft: '3px solid #6366F1' }}>
                <div style={{ fontSize: 10, color: '#64748B', marginBottom: 3 }}>{exp.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {exp.isColor && (
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: exp.value, border: '1px solid #334155', flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: 11, color: '#A5B4FC' }}>
                    <span style={{ color: '#64748B' }}>{exp.param}:</span> {exp.value}
                  </span>
                </div>
              </div>
            ))}

            {/* Dynamic Configs */}
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, marginBottom: 6, marginTop: 10 }}>⚙️ DYNAMIC CONFIGS</div>
            {[
              { name: 'banner_config',  values: [['banner_text', `"${bannerText}"`]] },
              { name: 'listing_config', values: [['sort_by', sortBy]] },
              { name: 'search_config',  values: [['price_display', priceDisplay]] },
            ].map(cfg => (
              <div key={cfg.name} style={{ background: '#1E293B', borderRadius: 8, padding: '8px 11px', marginBottom: 5, borderLeft: '3px solid #F59E0B' }}>
                <div style={{ fontSize: 10, color: '#64748B', marginBottom: 3 }}>{cfg.name}</div>
                {cfg.values.map(([k, v]) => (
                  <div key={k} style={{ fontSize: 11, color: '#FDE68A' }}>
                    <span style={{ color: '#64748B' }}>{k}:</span> {v}
                  </div>
                ))}
              </div>
            ))}

            {/* 이벤트 로그 */}
            {eventLog.length > 0 && (
              <div style={{ background: '#1E293B', borderRadius: 10, padding: '10px 12px', marginTop: 10 }}>
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, marginBottom: 6 }}>📡 logEvent 실시간</div>
                {eventLog.map((log, i) => (
                  <div key={i} style={{ fontSize: 10, color: i === 0 ? '#34D399' : '#334155', fontFamily: 'monospace', lineHeight: 1.8 }}>{log}</div>
                ))}
              </div>
            )}
          </div>
        )}

        <button className="statsig-toggle" onClick={() => setPanelOpen(p => !p)}>
          🎓 Statsig {panelOpen ? '패널 닫기 ↓' : '패널 열기 ↑'}
        </button>
      </div>

      <style jsx global>{`
        .container { max-width: 1140px; margin: 0 auto; }

        .header-inner {
          max-width: 1140px; margin: 0 auto;
          padding: 0 24px; height: 62px;
          display: flex; align-items: center; gap: 20px;
        }
        .header-search-wrap {
          flex: 1; max-width: 380px;
          display: flex; align-items: center; gap: 8px;
          background: #F4F5F7; border-radius: 24px; padding: 9px 16px;
          border: 1.5px solid #EBEBEB;
        }
        .header-nav { display: flex; align-items: center; gap: 22px; }
        .header-auth { display: flex; align-items: center; gap: 10px; }
        .hamburger { display: none; background: none; border: none; font-size: 22px; cursor: pointer; color: #1A1A1A; padding: 4px 8px; }
        .mobile-menu { display: none; padding: 0 24px 20px; border-top: 1px solid #F4F5F7; background: #fff; }
        .mobile-search-wrap { display: flex; align-items: center; gap: 8px; background: #F4F5F7; border-radius: 12px; padding: 10px 14px; margin-bottom: 16px; margin-top: 14px; }
        .btn-outline { background: none; border: 1.5px solid #EBEBEB; border-radius: 20px; padding: 7px 16px; font-size: 13px; font-weight: 600; color: #333; cursor: pointer; }
        .btn-primary { background: #FF5C35; border: none; border-radius: 20px; padding: 8px 16px; font-size: 13px; font-weight: 600; color: #fff; cursor: pointer; }

        .hero { background: linear-gradient(180deg, #FFF3F0 0%, #F4F5F7 100%); padding: 48px 24px 40px; }
        .hero-title { font-size: 34px; font-weight: 900; color: #1A1A1A; margin-bottom: 28px; letter-spacing: -1px; line-height: 1.25; }
        .hero-search-box { background: #fff; border-radius: 20px; padding: 8px 8px 8px 0; box-shadow: 0 4px 28px rgba(0,0,0,0.10); display: flex; align-items: stretch; max-width: 780px; border: 1.5px solid #F0F0F0; }
        .hero-fields { display: flex; flex: 1; }
        .hero-field { padding: 12px 20px; cursor: pointer; border-right: 1px solid #F0F0F0; }
        .hero-field:last-child { border-right: none; }
        .hero-search-btn-wrap { padding: 8px 8px 8px 12px; display: flex; align-items: center; }
        .hero-search-btn { background: #FF5C35; color: #fff; border: none; border-radius: 14px; padding: 14px 28px; font-size: 15px; font-weight: 700; cursor: pointer; white-space: nowrap; font-family: inherit; }
        .quick-tags { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }

        .sort-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; gap: 12px; flex-wrap: wrap; }
        .sort-options { display: flex; gap: 6px; flex-wrap: wrap; }

        .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .card { background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid rgba(0,0,0,0.04); }
        .card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
        .card:hover .card-img { transform: scale(1.05); }

        .list-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); cursor: pointer; display: flex; border: 1px solid rgba(0,0,0,0.04); transition: transform 0.2s, box-shadow 0.2s; }
        .list-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.10); }
        .card-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }

        .footer-inner { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 40px; margin-bottom: 40px; }
        .footer-brand { flex: 1; min-width: 240px; }
        .footer-cols { display: flex; gap: 48px; flex-wrap: wrap; }

        .statsig-floating { position: fixed; bottom: 24px; right: 24px; z-index: 1000; display: flex; flex-direction: column; align-items: flex-end; }
        .statsig-panel { background: #0F172A; border-radius: 18px; padding: 16px 18px; width: 340px; margin-bottom: 10px; box-shadow: 0 12px 48px rgba(0,0,0,0.4); border: 1px solid #1E293B; animation: slideUp 0.2s ease-out; max-height: calc(100vh - 120px); overflow-y: auto; }
        .statsig-toggle { background: #0F172A; color: #fff; border: 1px solid #334155; border-radius: 40px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: inherit; }

        @media (max-width: 768px) {
          .header-inner { padding: 0 16px; gap: 12px; }
          .header-search-wrap { display: none; }
          .header-nav { display: none; }
          .header-auth { display: none; }
          .hamburger { display: flex; }
          .mobile-menu { display: block; }
          .hero { padding: 28px 16px 24px; }
          .hero-title { font-size: 24px; margin-bottom: 20px; }
          .hero-search-box { flex-direction: column; padding: 0; border-radius: 16px; max-width: 100%; }
          .hero-fields { flex-direction: column; }
          .hero-field { padding: 12px 16px; border-right: none; border-bottom: 1px solid #F0F0F0; flex: unset; }
          .hero-field:last-child { border-bottom: none; }
          .hero-search-btn-wrap { padding: 12px; }
          .hero-search-btn { width: 100%; padding: 14px; border-radius: 12px; }
          .quick-tags { display: none; }
          .container { padding: 0 16px; }
          .sort-row { flex-direction: column; align-items: flex-start; }
          .card-grid { grid-template-columns: 1fr; gap: 16px; }
          .list-card { flex-direction: column; }
          .list-card > div:first-child { width: 100% !important; }
          .footer-inner { flex-direction: column; gap: 28px; }
          .footer-cols { gap: 28px; }
          .statsig-panel { width: calc(100vw - 48px); }
          .promo-text { font-size: 13px; }
        }
        @media (min-width: 769px) and (max-width: 1023px) {
          .header-search-wrap { max-width: 260px; }
          .hero-title { font-size: 28px; }
          .hero-search-box { max-width: 100%; }
          .card-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-cols { gap: 28px; }
        }

        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.82; transform: scale(1.03); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { left: -100%; } 100% { left: 200%; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        button { font-family: inherit; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
