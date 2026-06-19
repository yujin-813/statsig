import { useGate, useExperiment, useConfig, Statsig } from 'statsig-react';
import { useState } from 'react';

// ─────────────────────────────────────────────────────────────
// Statsig Console에서 생성할 항목
//  [Feature Gate]   special_badge_enabled
//  [Experiment]     cta_button_test  →  button_text (string)
//  [Dynamic Config] search_config    →  price_display / sort_by / promo_banner
// ─────────────────────────────────────────────────────────────

const ACCOMMODATIONS = [
  {
    id: 1, name: '그랜드 서울 호텔', area: '서울 강남구', type: '호텔',
    pricePerNight: 128000, totalFor2Nights: 256000,
    rating: 4.8, reviews: 1203, distance: '강남역 도보 3분',
    tags: ['조식포함', '무료주차', '수영장'], image: '/images/hotel.jpg',
  },
  {
    id: 2, name: '제주 오션뷰 풀빌라', area: '제주 서귀포시', type: '펜션',
    pricePerNight: 320000, totalFor2Nights: 640000,
    rating: 4.9, reviews: 856, distance: '중문관광단지 차로 10분',
    tags: ['전용수영장', '오션뷰', '바베큐'], image: '/images/villa.jpg',
  },
  {
    id: 3, name: '부산 해운대 비치 모텔', area: '부산 해운대구', type: '모텔',
    pricePerNight: 89000, totalFor2Nights: 178000,
    rating: 4.5, reviews: 2341, distance: '해운대해수욕장 도보 1분',
    tags: ['바다전망', '조기체크인', '무료와이파이'], image: '/images/beach.jpg',
  },
  {
    id: 4, name: '경주 한옥 스테이', area: '경주시 황남동', type: '한옥',
    pricePerNight: 145000, totalFor2Nights: 290000,
    rating: 4.7, reviews: 432, distance: '첨성대 도보 5분',
    tags: ['한옥체험', '전통조식', '문화유적'], image: '/images/hanok.jpg',
  },
  {
    id: 5, name: '강릉 소나무 게스트하우스', area: '강릉시 강문동', type: '게스트하우스',
    pricePerNight: 45000, totalFor2Nights: 90000,
    rating: 4.6, reviews: 678, distance: '경포해수욕장 도보 5분',
    tags: ['공용주방', '바베큐', '자전거대여'], image: '/images/guesthouse.jpg',
  },
  {
    id: 6, name: '여수 돌산 오션테라스', area: '여수시 돌산읍', type: '풀빌라',
    pricePerNight: 280000, totalFor2Nights: 560000,
    rating: 4.8, reviews: 291, distance: '오동도 차로 15분',
    tags: ['오션뷰', '테라스', '커플추천'], image: '/images/terrace.jpg',
  },
];

const CATEGORIES = ['전체', '호텔', '모텔', '펜션', '풀빌라', '한옥', '게스트하우스'];

const SORT_OPTIONS = [
  ['popular',   '인기순'],
  ['price_asc', '낮은 가격순'],
  ['review',    '리뷰 많은순'],
];

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

export default function HomePage() {
  const { value: showBadge }    = useGate('special_badge_enabled');
  const { config: ctaExp }      = useExperiment('cta_button_test');
  const buttonText              = ctaExp.get('button_text', '예약하기');
  const { config: searchConf }  = useConfig('search_config');
  const priceDisplay            = searchConf.get('price_display', 'per_night');
  const sortBy                  = searchConf.get('sort_by', 'popular');
  const showPromoBanner         = searchConf.get('promo_banner', false);

  const [searchQuery,   setSearchQuery]   = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [clickedId,     setClickedId]     = useState(null);
  const [savedIds,      setSavedIds]      = useState(new Set());
  const [eventLog,      setEventLog]      = useState([]);
  const [panelOpen,     setPanelOpen]     = useState(true);

  const filtered = ACCOMMODATIONS.filter(a =>
    (activeCategory === '전체' || a.type === activeCategory) &&
    (!searchQuery || a.name.includes(searchQuery) || a.area.includes(searchQuery))
  );
  const sorted = sortAccommodations(filtered, sortBy);

  function logEvent(name, value, meta = {}) {
    Statsig.logEvent(name, value, meta);
    const ts = new Date().toLocaleTimeString('ko-KR');
    setEventLog(prev => [`[${ts}] ${name}${value ? ` · ${value}` : ''}`, ...prev].slice(0, 8));
  }

  function handleBook(acc, e) {
    e.stopPropagation();
    setClickedId(acc.id);
    logEvent('accommodation_booked', acc.pricePerNight, {
      accommodation_id: String(acc.id),
      accommodation_name: acc.name,
      type: acc.type,
      button_text: buttonText,
      price_display: priceDisplay,
      badge_shown: String(showBadge),
    });
    setTimeout(() => setClickedId(null), 2000);
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
      return next;
    });
  }

  function handleSearch() {
    logEvent('search_performed', null, { query: searchQuery || '전체', category: activeCategory });
  }

  return (
    <div style={{ fontFamily: "'Apple SD Gothic Neo', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif", background: '#F4F5F7', minHeight: '100vh', color: '#1A1A1A' }}>

      {/* ── 헤더 ─────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 300,
        background: '#fff', borderBottom: '1px solid #EBEBEB',
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', gap: 20 }}>
          <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#FF5C35', letterSpacing: '-1px' }}>여기어때</span>
          </a>

          <div style={{
            flex: 1, maxWidth: 400, display: 'flex', alignItems: 'center', gap: 8,
            background: '#F4F5F7', borderRadius: 24, padding: '9px 16px',
            border: '1.5px solid #EBEBEB',
          }}>
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

          <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {['숙소', '항공', '레저·투어', '교통'].map(item => (
              <span key={item} style={{ fontSize: 14, color: '#555', cursor: 'pointer', fontWeight: 500, letterSpacing: '-0.2px' }}>{item}</span>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{ background: 'none', border: '1.5px solid #EBEBEB', borderRadius: 20, padding: '7px 16px', fontSize: 13, fontWeight: 600, color: '#333', cursor: 'pointer' }}>
              로그인
            </button>
            <button style={{ background: '#FF5C35', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
              회원가입
            </button>
          </div>
        </div>
      </header>

      {/* ── 프로모 배너 (Dynamic Config: promo_banner) ──────── */}
      {showPromoBanner && (
        <div
          onClick={() => logEvent('promo_banner_clicked')}
          style={{
            background: 'linear-gradient(90deg, #FF4500 0%, #FF8C42 100%)',
            color: '#fff', textAlign: 'center',
            padding: '11px 24px', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <span>🎉</span>
          <span>지금 예약하면 최대 30% 할인 — 오늘 자정까지만!</span>
          <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 400 }}>자세히 보기 →</span>
        </div>
      )}

      {/* ── 히어로 ────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, #FFF3F0 0%, #F4F5F7 100%)',
        padding: '48px 24px 40px',
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#FF5C35', letterSpacing: 0.5, marginBottom: 10 }}>
            전국 최저가 숙소 · 즉시 예약 · 무료 취소
          </p>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: '#1A1A1A', marginBottom: 28, letterSpacing: '-1px', lineHeight: 1.25 }}>
            특별한 여행,<br />여기어때에서 시작하세요
          </h1>

          {/* 검색 박스 */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: '8px 8px 8px 0',
            boxShadow: '0 4px 28px rgba(0,0,0,0.10)',
            display: 'flex', alignItems: 'stretch',
            maxWidth: 780, border: '1.5px solid #F0F0F0',
          }}>
            {[
              { icon: '📍', label: '여행지', hint: '서울, 제주, 부산...' },
              { icon: '📅', label: '체크인', hint: '날짜 선택' },
              { icon: '📅', label: '체크아웃', hint: '날짜 선택' },
              { icon: '👥', label: '인원', hint: '인원 선택' },
            ].map((item, i) => (
              <div key={i} style={{
                flex: i === 0 ? 2 : 1, padding: '12px 20px',
                borderRight: i < 3 ? '1px solid #F0F0F0' : 'none', cursor: 'pointer',
              }}>
                <div style={{ fontSize: 11, color: '#999', fontWeight: 700, marginBottom: 3, letterSpacing: 0.3 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: '#CCC', fontWeight: 400 }}>{item.hint}</div>
              </div>
            ))}
            <div style={{ padding: '8px 8px 8px 12px', display: 'flex', alignItems: 'center' }}>
              <button
                onClick={handleSearch}
                style={{
                  background: '#FF5C35', color: '#fff', border: 'none',
                  borderRadius: 14, padding: '14px 28px',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                  letterSpacing: '-0.3px',
                }}
              >
                검색
              </button>
            </div>
          </div>

          {/* 빠른 검색 키워드 */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {['제주 풀빌라', '서울 호텔', '부산 바다뷰', '강릉 오션뷰', '경주 한옥'].map(kw => (
              <span
                key={kw}
                onClick={() => { setSearchQuery(kw.split(' ')[0]); handleSearch(); }}
                style={{
                  fontSize: 12, padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.8)', color: '#555', fontWeight: 500,
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
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', display: 'flex', overflowX: 'auto' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); logEvent('category_selected', null, { category: cat }); }}
              style={{
                background: 'none', border: 'none', padding: '15px 18px',
                fontSize: 14, fontWeight: activeCategory === cat ? 700 : 400,
                color: activeCategory === cat ? '#FF5C35' : '#888',
                borderBottom: activeCategory === cat ? '2.5px solid #FF5C35' : '2.5px solid transparent',
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                letterSpacing: '-0.2px',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── 메인 컨텐츠 ──────────────────────────────────────── */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* 결과 수 + 정렬 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.3px' }}>
            숙소 <span style={{ color: '#FF5C35' }}>{sorted.length}</span>개
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {SORT_OPTIONS.map(([key, label]) => (
              <span
                key={key}
                style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                  background: sortBy === key ? '#FFF0ED' : '#fff',
                  color:      sortBy === key ? '#FF5C35'  : '#888',
                  border:     `1.5px solid ${sortBy === key ? '#FF5C35' : '#E8E8E8'}`,
                  cursor: 'default', letterSpacing: '-0.2px',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {label}
                {sortBy === key && <span style={{ fontSize: 10, opacity: 0.65, fontWeight: 400 }}>·Config</span>}
              </span>
            ))}
          </div>
        </div>

        {/* 카드 그리드 */}
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#BBB' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#888', marginBottom: 6 }}>검색 결과가 없어요</div>
            <div style={{ fontSize: 14, color: '#BBB' }}>다른 지역이나 카테고리를 선택해보세요</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {sorted.map(acc => (
              <article
                key={acc.id}
                onClick={() => handleCardClick(acc)}
                style={{
                  background: '#fff', borderRadius: 20, overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                }}
              >
                {/* 이미지 영역 */}
                <div style={{
                  height: 210, position: 'relative', overflow: 'hidden', background: '#E8E8E8',
                }}>
                  <img
                    src={acc.image}
                    alt={acc.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />

                  {/* 저장 버튼 */}
                  <button
                    onClick={e => toggleSave(acc.id, e)}
                    style={{
                      position: 'absolute', top: 14, right: 14,
                      background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%',
                      width: 38, height: 38, cursor: 'pointer', fontSize: 18,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.12)', transition: 'transform 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    {savedIds.has(acc.id) ? '❤️' : '🤍'}
                  </button>

                  {/* Feature Gate: 특가 배지 */}
                  {showBadge && (
                    <div style={{
                      position: 'absolute', top: 14, left: 14,
                      background: '#FF5C35', color: '#fff',
                      fontSize: 11, fontWeight: 800, padding: '5px 11px', borderRadius: 20,
                      letterSpacing: '-0.2px', animation: 'pulse 2s ease-in-out infinite',
                    }}>
                      🏷️ 오늘의 특가
                    </div>
                  )}

                  {/* 숙소 유형 배지 */}
                  <div style={{
                    position: 'absolute', bottom: 14, left: 14,
                    background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
                    color: '#fff', fontSize: 11, fontWeight: 600,
                    padding: '4px 10px', borderRadius: 20,
                  }}>
                    {acc.type}
                  </div>
                </div>

                {/* 카드 본문 */}
                <div style={{ padding: '16px 18px 20px' }}>
                  {/* 평점 + 거리 */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#FF5C35', fontWeight: 700 }}>★ {acc.rating}</span>
                    <span style={{ fontSize: 12, color: '#BBB', marginLeft: 4 }}>({acc.reviews.toLocaleString()})</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 12, color: '#AAA' }}>📍 {acc.distance}</span>
                  </div>

                  <h3 style={{ fontWeight: 700, fontSize: 17, color: '#1A1A1A', marginBottom: 3, letterSpacing: '-0.4px', lineHeight: 1.3 }}>
                    {acc.name}
                  </h3>
                  <p style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>{acc.area}</p>

                  {/* 편의 태그 */}
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 16 }}>
                    {acc.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: 11, padding: '4px 10px', borderRadius: 20,
                        background: '#F4F5F7', color: '#666', fontWeight: 500,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 가격 + 예약 버튼 */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#BBB', marginBottom: 2, fontWeight: 500 }}>
                        {priceLabel(priceDisplay)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                        <span style={{ fontSize: 21, fontWeight: 900, color: '#1A1A1A', letterSpacing: '-0.5px' }}>
                          {formatPrice(acc, priceDisplay)}
                        </span>
                        {priceDisplay !== 'total' && (
                          <span style={{ fontSize: 13, color: '#BBB', fontWeight: 400 }}>/박</span>
                        )}
                      </div>
                    </div>

                    {/* A/B Experiment: button_text */}
                    <button
                      onClick={e => handleBook(acc, e)}
                      style={{
                        background: clickedId === acc.id
                          ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                          : 'linear-gradient(135deg, #FF5C35 0%, #FF7A5A 100%)',
                        color: '#fff', border: 'none', borderRadius: 12,
                        padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        whiteSpace: 'nowrap', transition: 'all 0.2s', minWidth: 108,
                        letterSpacing: '-0.3px',
                        transform: clickedId === acc.id ? 'scale(0.97)' : 'scale(1)',
                        boxShadow: clickedId === acc.id
                          ? '0 4px 14px rgba(5,150,105,0.35)'
                          : '0 4px 14px rgba(255,92,53,0.35)',
                      }}
                    >
                      {clickedId === acc.id ? '✓ 예약완료!' : buttonText}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ── 푸터 ─────────────────────────────────────────────── */}
      <footer style={{ background: '#fff', borderTop: '1px solid #EBEBEB', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#FF5C35', letterSpacing: '-1px', marginBottom: 12 }}>여기어때</div>
              <div style={{ fontSize: 13, color: '#AAA', lineHeight: 2 }}>
                여기어때컴퍼니 주식회사&nbsp;&nbsp;|&nbsp;&nbsp;대표이사 정명훈<br />
                서울특별시 구로구 디지털로 300, 지밸리비즈플라자<br />
                사업자등록번호 : 000-00-00000&nbsp;&nbsp;|&nbsp;&nbsp;통신판매업신고 : 제2024-서울구로-0000호
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
                {['App Store', 'Google Play'].map(s => (
                  <div key={s} style={{
                    padding: '8px 16px', borderRadius: 10, border: '1.5px solid #E8E8E8',
                    fontSize: 12, fontWeight: 600, color: '#555', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {s === 'App Store' ? '🍎' : '▶'} {s}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 56 }}>
              {[
                { title: '서비스', links: ['숙소', '항공', '레저·투어', '공항버스', '렌터카'] },
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
          <div style={{ paddingTop: 24, borderTop: '1px solid #F4F5F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#CCC' }}>© 2024 여기어때컴퍼니. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Instagram', 'YouTube', 'Blog'].map(s => (
                <span key={s} style={{ fontSize: 12, color: '#CCC', cursor: 'pointer' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── Statsig 플로팅 패널 (강의 데모용) ──────────────── */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {panelOpen && (
          <div style={{
            background: '#0F172A', borderRadius: 18, padding: '18px 20px',
            width: 360, marginBottom: 10,
            boxShadow: '0 12px 48px rgba(0,0,0,0.35)',
            border: '1px solid #1E293B',
            animation: 'slideUp 0.2s ease-out',
          }}>
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, letterSpacing: 1, marginBottom: 14, textTransform: 'uppercase' }}>
              🎓 Statsig 데모 패널 — 현재 적용 값
            </div>

            {/* Feature Gate */}
            <div style={{ background: '#1E293B', borderRadius: 12, padding: '11px 14px', marginBottom: 8, borderLeft: `3px solid ${showBadge ? '#10B981' : '#334155'}` }}>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>🚪 FEATURE GATE · special_badge_enabled</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: showBadge ? '#34D399' : '#64748B' }}>
                {showBadge ? '✅ ON — 특가 배지 노출 중' : '❌ OFF — 배지 숨김'}
              </div>
            </div>

            {/* A/B Experiment */}
            <div style={{ background: '#1E293B', borderRadius: 12, padding: '11px 14px', marginBottom: 8, borderLeft: '3px solid #6366F1' }}>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>🧪 EXPERIMENT · cta_button_test</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#A5B4FC' }}>
                button_text: &quot;{buttonText}&quot;
              </div>
            </div>

            {/* Dynamic Config */}
            <div style={{ background: '#1E293B', borderRadius: 12, padding: '11px 14px', marginBottom: eventLog.length > 0 ? 8 : 0, borderLeft: '3px solid #F59E0B' }}>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>⚙️ DYNAMIC CONFIG · search_config</div>
              <div style={{ fontSize: 12, color: '#FDE68A', lineHeight: 1.7 }}>
                price_display: <b>{priceDisplay}</b>&nbsp;&nbsp;|&nbsp;&nbsp;sort_by: <b>{sortBy}</b><br />
                promo_banner: <b>{showPromoBanner ? 'true' : 'false'}</b>
              </div>
            </div>

            {/* logEvent 로그 */}
            {eventLog.length > 0 && (
              <div style={{ background: '#1E293B', borderRadius: 12, padding: '11px 14px' }}>
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>📡 logEvent 실시간</div>
                {eventLog.map((log, i) => (
                  <div key={i} style={{ fontSize: 11, color: i === 0 ? '#34D399' : '#334155', fontFamily: 'monospace', lineHeight: 1.7 }}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setPanelOpen(p => !p)}
          style={{
            background: '#0F172A', color: '#fff',
            border: '1px solid #334155', borderRadius: 40,
            padding: '10px 20px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            letterSpacing: '-0.2px',
          }}
        >
          🎓 Statsig {panelOpen ? '패널 닫기 ↓' : '패널 열기 ↑'}
        </button>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.82; transform: scale(1.03); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        button { font-family: inherit; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
