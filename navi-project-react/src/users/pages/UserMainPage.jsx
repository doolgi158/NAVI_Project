import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import { Button, Card, Tag } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { API_SERVER_HOST } from "@/common/api/naviApi";

const UserMainPage = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 여행지 fetch
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch(`${API_SERVER_HOST}/api/travel/rank`);
        if (!res.ok) throw new Error("데이터 로드 실패");
        const data = await res.json();
        setDestinations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("🚨 여행지 목록 불러오기 실패:", err);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();

    // 숙소 목데이터
    setAccommodations([
      { id: 1, name: "서울 한남호텔", image: "/img/hotel1.jpg", views: 8200, likes: 540, bookmarks: 300 },
      { id: 2, name: "제주 블루힐 리조트", image: "/img/hotel2.jpg", views: 9500, likes: 670, bookmarks: 410 },
      { id: 3, name: "부산 해운대 호텔", image: "/img/hotel3.jpg", views: 8700, likes: 530, bookmarks: 320 },
      { id: 4, name: "강릉 씨사이드 펜션", image: "/img/hotel4.jpg", views: 6000, likes: 430, bookmarks: 260 },
      { id: 5, name: "여수 오션뷰 리조트", image: "/img/hotel5.jpg", views: 7800, likes: 490, bookmarks: 310 },
      { id: 6, name: "전주 한옥 스테이", image: "/img/hotel6.jpg", views: 5500, likes: 370, bookmarks: 190 },
      { id: 7, name: "경주 클래식 호텔", image: "/img/hotel7.jpg", views: 7100, likes: 460, bookmarks: 250 },
      { id: 8, name: "속초 설악 리조트", image: "/img/hotel8.jpg", views: 9900, likes: 690, bookmarks: 500 },
      { id: 9, name: "통영 힐링하우스", image: "/img/hotel9.jpg", views: 5200, likes: 330, bookmarks: 160 },
      { id: 10, name: "가평 별빛펜션", image: "/img/hotel10.jpg", views: 4800, likes: 310, bookmarks: 150 },
    ]);
  }, []);

  // 랭킹 계산 함수
  const getRankedSlides = (data, titleKey = "title") => {
    if (!data.length) return [];

    return [...data]
      .map((d) => ({
        ...d,
        views: d.views ?? 0,
        likes: d.likes ?? 0,
        bookmarks: d.bookmarks ?? 0,
        score: (d.views ?? 0) + (d.likes ?? 0) + (d.bookmarks ?? 0),
      }))
      .sort((a, b) => {
        const byScore = b.score - a.score;
        if (byScore !== 0) return byScore;
        return (a[titleKey] ?? "").localeCompare(b[titleKey] ?? "", "ko");
      })
      .slice(0, 10)
      .map((item, idx, arr) => ({
        ...item,
        rank:
          idx > 0 && item.score === arr[idx - 1].score
            ? arr[idx - 1].rank
            : idx + 1,
      }));
  };

  const travelSlides = getRankedSlides(destinations, "title");
  const hotelSlides = getRankedSlides(accommodations, "name");

  return (
    <MainLayout>
      {/* Hero */}
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

      {/* 여행지 섹션 */}
      <SectionSwiper
        title="🏝️ 대표 여행지"
        data={travelSlides}
        type="travel"
        navigate={navigate}
        loading={loading}
      />

      {/* 숙소 섹션 */}
      <SectionSwiper
        title="🏨 인기 숙소"
        data={hotelSlides}
        type="accommodation"
        navigate={navigate}
        loading={false}
      />
    </MainLayout>
  );
};

// ✅ 공통 Swiper 섹션
const SectionSwiper = ({ title, data, type, navigate, loading }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className="mb-20 relative">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      {/* 개별 화살표 */}
      <button
        ref={prevRef}
        className="absolute -left-8 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full shadow-md px-3 py-2 hover:bg-white"
      >
        ◀
      </button>
      <button
        ref={nextRef}
        className="absolute -right-8 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full shadow-md px-3 py-2 hover:bg-white"
      >
        ▶
      </button>

      <Card className="rounded-2xl shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-gray-500">불러오는 중…</div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center text-gray-500">데이터가 없습니다.</div>
        ) : (
          <>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              pagination={{
                el: `.custom-pagination-${type}`,
                clickable: true,
              }}
              slidesPerView={3}
              slidesPerGroup={1}
              loop={true}
              spaceBetween={20}
              className="!px-2"
            >
              {data.map((d) => (
                <SwiperSlide key={d.id || d.travelId}>
                  <div
                    onClick={() =>
                      navigate(
                        type === "travel"
                          ? `/travel/detail/${d.travelId}`
                          : `/accommodation/detail/${d.id}`
                      )
                    }
                    className="cursor-pointer border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition bg-white"
                  >
                    <div
                      className="h-40 w-full bg-gray-100"
                      style={{
                        backgroundImage: `url('${
                          d.thumbnailPath || d.imagePath || d.image || "/img/placeholder.jpg"
                        }')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold truncate">
                          {d.title || d.name}
                        </h3>
                        <Tag color="gold" className="font-bold">
                          #{d.rank}
                        </Tag>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Tag>조회 {(d.views ?? d.viewsCount ?? 0).toLocaleString()}</Tag>
                        <Tag>좋아요 {(d.likes ?? d.likesCount ?? 0).toLocaleString()}</Tag>
                        <Tag>북마크 {(d.bookmarks ?? d.bookmarkCount ?? 0).toLocaleString()}</Tag>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* 하단 점 페이지네이션 */}
            <div className={`custom-pagination-${type} mt-6 flex justify-center`} />
          </>
        )}
      </Card>
    </section>
  );
};

export default UserMainPage;