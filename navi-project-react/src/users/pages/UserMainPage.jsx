import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { API_SERVER_HOST } from "../../common/api/naviApi";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import FooterLayout from "@/layout/users/FooterLayout";
import HeaderLayout from "@/layout/users/HeaderLayout";

export default function UserMainPage() {
  const navigate = useNavigate();
  const [travels, setTravels] = useState([]);
  const [events, setEvents] = useState([]);
  const [accommodations, setAccommodations] = useState([]);

  useEffect(() => {
    // 여행지
    fetch(`${API_SERVER_HOST}/api/travel/rank`)
      .then((r) => r.json())
      .then((data) => setTravels(Array.isArray(data) ? data.slice(0, 10) : []))
      .catch(() => setTravels([]));



    // 숙소
    fetch(`${API_SERVER_HOST}/api/accommodation/rank`)
      .then((r) => r.json())
      .then((data) => {
        const list = data?.data || data;
        setAccommodations(Array.isArray(list) ? list.slice(0, 10) : []);
      })
      .catch(() => setAccommodations([]));
  }, []);

  return (
    <>

      <HeaderLayout />

      <HeroBanner />


      {/* 🏝️ 인기 여행지 */}
      <CarouselSection
        title="🏝️ 인기 여행지"
        description="많은 여행자들이 찾는 대표 명소"
        data={travels}
        type="travel"
        navigate={navigate}
      />


      {/* 🏨 인기 숙소 */}
      <CarouselSection
        title="🏨 인기 숙소"
        description="여행자들이 선호하는 편안한 숙소"
        data={accommodations}
        type="accommodation"
        navigate={navigate}
      />

      <FooterLayout />
    </>
  );
}

/* -------------------------------------------
 * Hero 배너
 * ------------------------------------------- */
function HeroBanner() {
  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1633838972793-b70c1d47f1a8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1176",
      title: "제주의 감성을 담은 여행",
      subtitle: "자연이 선물한 풍경 속으로 떠나보세요",
    },
    {
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
      title: "바다와 함께하는 하루",
      subtitle: "파도 소리와 함께하는 감성 휴식",
    },
    {
      image:
        "https://cdn.pixabay.com/photo/2016/02/11/08/48/jeju-island-1193281_1280.jpg",
      title: "여행의 시작, NAVI",
      subtitle: "지금 당신의 다음 여정을 계획하세요",
    },
  ];

  return (
    <section className="relative h-[550px] overflow-hidden ">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        loop
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="w-full h-full"
      >
        {slides.map((s, i) => (
          <SwiperSlide key={i}>
            <div
              className="relative w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${s.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
              <motion.h2
                className="text-5xl md:text-6xl font-extrabold drop-shadow-lg mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {s.title}
              </motion.h2>
              <motion.p
                className="text-lg md:text-xl mb-6 text-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                {s.subtitle}
              </motion.p>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

/* -------------------------------------------
 * Carousel Section (좋아요/조회수/북마크 포함)
 * ------------------------------------------- */
function CarouselSection({ title, description, data, type, navigate }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // ✅ 이미지 URL 처리 함수
  const getImageUrl = (item) => {
    const candidates = [
      item.thumbnailPath,
      item.imagePath,
      item.image,
      item.mainImage,
      item.photoUrl,
    ].filter(Boolean);

    if (candidates.length === 0) return "/img/placeholder.jpg";

    const path = candidates[0];

    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return `${API_SERVER_HOST}${path}`;
    return `${API_SERVER_HOST}/${path}`;
  };

  // ✅ 숫자 포맷 함수
  const formatNum = (num) => {
    if (num == null) return 0;
    return Number(num).toLocaleString();
  };

  return (
    <motion.section
      className="py-20 px-4 md:px-8 bg-[#F8FAFC] relative"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* 제목 */}
      <div className="flex flex-col items-center text-center mb-10">
        <h2 className="text-3xl font-extrabold text-[#0A3D91] mb-2">{title}</h2>
        <p className="text-gray-600 text-base">{description}</p>
      </div>

      {data?.length > 0 ? (
        <div className="max-w-7xl mx-auto relative">
          <Swiper
            modules={[Autoplay, Navigation]}
            slidesPerView={3}
            spaceBetween={24}
            loop
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="!px-2"
          >
            {data.map((item, i) => {
              const imgUrl = getImageUrl(item);

              // ✅ 카운트 필드 처리 (백엔드 필드명 다양성 대응)
              const views =
                item.views ?? item.viewsCount ?? item.viewCount ?? 0;
              const likes =
                item.likes ?? item.likesCount ?? item.likeCount ?? 0;
              const bookmarks =
                item.bookmarks ?? item.bookmarkCount ?? item.bookmarksCount ?? 0;

              return (
                <SwiperSlide key={i}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    onClick={() => {
                      if (type === "travel")
                        navigate(`/travel/detail/${item.travelId}`);
                      if (type === "festival")
                        navigate(`/festival/detail/${item.id}`);
                      if (type === "accommodation")
                        localStorage.setItem("selectedAccId", item.id);
                        navigate(`/accommodations/detail`);
                    }}
                    className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
                  >
                    {/* 이미지 */}
                    <div
                      className="h-56 bg-cover bg-center"
                      style={{ backgroundImage: `url('${imgUrl}')` }}
                    />

                    {/* 본문 */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        {item.title || item.name}
                      </h3>

                      {/* 좋아요/조회수/북마크 */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                        <span>👁️ {formatNum(views)}</span>
                        <span>❤️ {formatNum(likes)}</span>
                        <span>🔖 {formatNum(bookmarks)}</span>
                      </div>

                      {item.period && (
                        <p className="text-sm text-gray-500 mt-2">
                          {item.period}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* 화살표 */}
          <button
            ref={prevRef}
            className="absolute -left-10 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md rounded-full p-2"
          >
            ◀
          </button>
          <button
            ref={nextRef}
            className="absolute -right-10 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md rounded-full p-2"
          >
            ▶
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-12">데이터가 없습니다.</div>
      )}
    </motion.section>
  );
}