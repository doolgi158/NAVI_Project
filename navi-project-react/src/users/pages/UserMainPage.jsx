import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Tag } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { API_SERVER_HOST } from "../../common/api/naviApi";
import MainLayout from "../layout/MainLayout";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import HeroSection from "@/common/components/HeroSection";

const UserMainPage = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [loadingTravel, setLoadingTravel] = useState(true);
  const [loadingAcc, setLoadingAcc] = useState(true);

  // 인기 여행지, 숙소
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
        setLoadingTravel(false);
      }
    };

    const fetchAccommodations = async () => {
      try {
        const res = await fetch(`${API_SERVER_HOST}/api/accommodation/rank`);
        if (!res.ok) throw new Error("데이터 로드 실패");
        const data = await res.json();
        // ✅ ApiResponse 구조 대응
        const list = data?.data || [];
        setAccommodations(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("🚨 숙소 목록 불러오기 실패:", err);
        setAccommodations([]);
      } finally {
        setLoadingAcc(false);
      }
    };

    fetchDestinations();
    fetchAccommodations();
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
      <HeroSection />

      {/* 여행지 섹션 */}
      <SectionSwiper
        title="🏝️ 대표 여행지"
        data={travelSlides}
        type="travel"
        navigate={navigate}
        loading={loadingTravel}
      />

      {/* 숙소 섹션 */}
      <SectionSwiper
        title="🏨 인기 숙소"
        data={hotelSlides}
        type="accommodation"
        navigate={navigate}
        loading={loadingAcc}
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
                    onClick={() => {
                      if (type === "travel") {
                        navigate(`/travel/detail/${d.travelId}`);
                      } else if (type === "accommodation") {
                        navigate(`/accommodations/detail?accId=${d.id}`);
                      }
                    }}
                    className="cursor-pointer border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition bg-white"
                  >
                    <div
                      className="h-40 w-full bg-gray-100"
                      style={{
                        backgroundImage: `url('${d.thumbnailPath
                          ? d.thumbnailPath.startsWith("/images")
                            ? `${API_SERVER_HOST}${d.thumbnailPath}`
                            : d.thumbnailPath
                          : d.imagePath || d.image || d.mainImage || "/img/placeholder.jpg"
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
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div
              className={`custom-pagination-${type} mt-6 flex justify-center`}
            />
          </>
        )}
      </Card>
    </section>
  );
};

export default UserMainPage;