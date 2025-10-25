import { useEffect, useState } from "react";
import { getList } from "../../common/api/naviApi";

export const useMainPageData = () => {
    const [destinations, setDestinations] = useState([]);
    const [accommodations, setAccommodations] = useState([]);
    const [loading, setLoading] = useState(true);

    // 여행지 fetch
    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                // apiClient가 토큰/기본 경로 자동 처리
                const data = await getList("travel/rank");
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

    return { destinations, accommodations, loading };
};