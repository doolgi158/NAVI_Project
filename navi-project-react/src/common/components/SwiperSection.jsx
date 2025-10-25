import { useRef, useEffect } from "react";
import { Card, Tag } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/**
 * SwiperSection (공통 슬라이드 컴포넌트)
 * 
 * props:
 *  - title: 섹션 제목
 *  - data: 표시할 데이터 배열
 *  - keyField: 고유 키 (ex: "id" or "travelId")
 *  - imageField: 이미지 경로 필드명
 *  - titleField: 제목 필드명
 *  - stats: [{ key: "views", label: "조회" }, ...] 통계 정보 표시용
 *  - onCardClick: 카드 클릭 시 실행할 함수
 *  - loading: 로딩 여부
 *  - slidesPerView: 한 번에 표시할 카드 수 (기본 3)
 *  - loop: 루프 여부 (기본 true)
 *  - paginationType: "dots" | "none" (기본 dots)
 */

const SwiperSection = ({
    title,
    data = [],
    keyField = "id",
    imageField = "image",
    titleField = "title",
    stats = [],
    onCardClick,
    loading = false,
    slidesPerView = 3,
    loop = true,
    paginationType = "dots",
}) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    // Swiper 네비게이션 초기화 (렌더 후 연결)
    useEffect(() => {
        const navButtons = [prevRef.current, nextRef.current];
        navButtons.forEach((btn) => {
            if (btn) btn.style.zIndex = 10;
        });
    }, []);

    return (
        <section className="mb-20 relative">
            {title && (
                <div className="flex items-end justify-between mb-4">
                    <h2 className="text-2xl font-bold">{title}</h2>
                </div>
            )}

            {/* Navigation 버튼 */}
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
                            pagination={
                                paginationType === "dots"
                                    ? { el: `.custom-pagination-${title}`, clickable: true }
                                    : false
                            }
                            slidesPerView={slidesPerView}
                            slidesPerGroup={1}
                            loop={loop}
                            spaceBetween={20}
                            className="!px-2"
                        >
                            {data.map((item, idx) => (
                                <SwiperSlide key={item[keyField] ?? idx}>
                                    <div
                                        onClick={() => onCardClick?.(item)}
                                        className="cursor-pointer border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition bg-white"
                                    >
                                        <div
                                            className="h-40 w-full bg-gray-100"
                                            style={{
                                                backgroundImage: `url('${item[imageField] || "/img/placeholder.jpg"
                                                    }')`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                            }}
                                        />
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-lg font-semibold truncate">
                                                    {item[titleField]}
                                                </h3>
                                                {item.rank && (
                                                    <Tag color="gold" className="font-bold">
                                                        #{item.rank}
                                                    </Tag>
                                                )}
                                            </div>
                                            {/* 통계 태그 */}
                                            {stats.length > 0 && (
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    {stats.map((s) => (
                                                        <Tag key={s.key}>
                                                            {s.label}{" "}
                                                            {(item[s.key] ?? 0).toLocaleString()}
                                                        </Tag>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        {paginationType === "dots" && (
                            <div
                                className={`custom-pagination-${title} mt-6 flex justify-center`}
                            />
                        )}
                    </>
                )}
            </Card>
        </section>
    );
};

export default SwiperSection;