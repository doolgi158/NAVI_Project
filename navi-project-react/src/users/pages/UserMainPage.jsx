import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import { Button, Card, Tag } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const UserMainPage = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 데이터 로드 (엔드포인트는 실제 API에 맞춰 수정)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/travel/featured"); // 서버 준비 전이면 임시 데이터로 대체 가능
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setDestinations(Array.isArray(data) ? data : data?.items ?? []);
      } catch {
        // 임시 샘플 (name, image, views, likes, bookmarks 필드 가정)
        setDestinations([
          { id: 1, name: "가평 호명호수", image: "/img/1.jpg", views: 3200, likes: 210, bookmarks: 90 },
          { id: 2, name: "부산 해운대", image: "/img/2.jpg", views: 8700, likes: 540, bookmarks: 300 },
          { id: 3, name: "제주 성산일출봉", image: "/img/3.jpg", views: 9100, likes: 600, bookmarks: 410 },
          { id: 4, name: "강릉 안목해변", image: "/img/4.jpg", views: 4000, likes: 250, bookmarks: 120 },
          { id: 5, name: "여수 돌산공원", image: "/img/5.jpg", views: 5200, likes: 310, bookmarks: 140 },
          { id: 6, name: "전주 한옥마을", image: "/img/6.jpg", views: 7600, likes: 480, bookmarks: 260 },
          { id: 7, name: "경주 불국사", image: "/img/7.jpg", views: 6900, likes: 420, bookmarks: 230 },
          { id: 8, name: "속초 설악산", image: "/img/8.jpg", views: 9900, likes: 650, bookmarks: 500 },
          { id: 9, name: "통영 동피랑", image: "/img/9.jpg", views: 3000, likes: 190, bookmarks: 80 },
          { id: 10, name: "서울 남산타워", image: "/img/10.jpg", views: 8800, likes: 560, bookmarks: 350 },
          { id: 11, name: "수원 화성", image: "/img/11.jpg", views: 2800, likes: 170, bookmarks: 70 },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 1) 점수 계산 2) 점수 내림차순 + 이름(가나다) 보조정렬 3) 상위 10개 4) 순위(조밀랭크) 부여 5) 3개씩 묶기
  const slides = useMemo(() => {
    if (!destinations.length) return [];

    // 합산 점수 부여
    const withScore = destinations.map(d => ({
      ...d,
      views: d.views ?? 0,
      likes: d.likes ?? 0,
      bookmarks: d.bookmarks ?? 0,
      score: (d.views ?? 0) + (d.likes ?? 0) + (d.bookmarks ?? 0),
    }));

    // 정렬: 점수 desc, 동점이면 이름 가나다순
    withScore.sort((a, b) => {
      const byScore = b.score - a.score;
      if (byScore !== 0) return byScore;
      return (a.name ?? "").localeCompare(b.name ?? "", "ko");
    });

    // 상위 10
    const top10 = withScore.slice(0, 10);

    // 조밀랭크(dense rank)
    let currentRank = 0;
    let prevScore = null;
    const ranked = top10.map((item) => {
      if (prevScore === null || item.score < prevScore) {
        currentRank += 1;
        prevScore = item.score;
      }
      return { ...item, rank: currentRank };
    });

    // 3개씩 묶어서 가로→세로(그리드 3열)로 렌더
    const chunks = [];
    for (let i = 0; i < ranked.length; i += 3) {
      chunks.push(ranked.slice(i, i + 3));
    }
    return chunks;
  }, [destinations]);

  return (
    <MainLayout>
      {/* Hero 배너 */}
      <div
        className="w-full h-[360px] rounded-2xl mb-10 relative overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: `url('/img/hero-travel.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center text-white">
          <div className="text-4xl md:text-5xl font-extrabold drop-shadow">여행의 시작, NAVI ✈️</div>
          <p className="mt-2 text-lg opacity-90">당신의 다음 여정을 지금 찾아보세요</p>
          <div className="mt-6">
            <Button onClick={() => navigate("/payments", { state: { keyword: "ACC" } })}>
              결제창
            </Button>
          </div>
        </div>
      </div>

      {/* 대표 여행지 섹션 */}
      <section className="mb-14">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl font-bold">🏝️ 대표 여행지 TOP 10</h2>
          <span className="text-sm text-gray-500">
            * 점수 = 조회수 + 좋아요 + 북마크 (동점 시 가나다순)
          </span>
        </div>

        <Card className="rounded-2xl shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-gray-500">불러오는 중…</div>
          ) : slides.length === 0 ? (
            <div className="py-16 text-center text-gray-500">여행지 데이터가 없습니다.</div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              slidesPerView={1}
              spaceBetween={16}
              className="!px-2"
            >
              {slides.map((group, idx) => (
                <SwiperSlide key={idx}>
                  <div className="grid md:grid-cols-3 gap-4">
                    {group.map((d) => (
                      <div
                        key={d.id}
                        className="border rounded-xl overflow-hidden hover:shadow-md transition bg-white"
                      >
                        <div
                          className="h-40 w-full bg-gray-100"
                          style={{
                            backgroundImage: `url('${d.image ?? "/img/placeholder.jpg"}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-semibold truncate">{d.name}</h3>
                            <Tag color="gold" className="font-bold">#{d.rank}</Tag>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            종합점수 <span className="font-semibold text-gray-700">{d.score.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Tag>조회 {d.views.toLocaleString()}</Tag>
                            <Tag>좋아요 {d.likes.toLocaleString()}</Tag>
                            <Tag>북마크 {d.bookmarks.toLocaleString()}</Tag>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </Card>
      </section>
    </MainLayout>
  );
};

export default UserMainPage;
