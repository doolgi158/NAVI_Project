import { useEffect, useState } from "react";
import { Card, Button, Spin, message } from "antd";
import { HeartFilled } from "@ant-design/icons";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import MainLayout from "../../layout/MainLayout";
import { useNavigate } from "react-router-dom";

const { Meta } = Card;

const UserLikedTravelsPage = () => {
    const [travels, setTravels] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            message.warning("로그인이 필요합니다.");
            return;
        }

        fetch(`${API_SERVER_HOST}/api/activity/likes`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("✅ 좋아요 목록 응답:", data);
                if (data.status === 200 && Array.isArray(data.data)) {
                    setTravels(data.data);
                } else {
                    message.error("좋아요한 여행지 데이터를 불러오지 못했습니다.");
                }
            })
            .catch(() => message.error("좋아요한 여행지를 불러오지 못했습니다."))
            .finally(() => setLoading(false));
    }, []);

    const handleUnlike = async (travelId) => {
        const token = localStorage.getItem("accessToken");
        const userNo = localStorage.getItem("userNo");
        try {
            const res = await fetch(`${API_SERVER_HOST}/api/activity/like/${travelId}?userNo=${userNo}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (data.status === 200) {
                message.success("좋아요가 취소되었습니다 💔");
                setTravels((prev) => prev.filter((t) => t.travelId !== travelId));
            } else {
                message.error("좋아요 취소 중 오류가 발생했습니다.");
            }
        } catch (err) {
            console.error(err);
            message.error("서버와의 통신 중 문제가 발생했습니다.");
        }
    };

    // 여행지 클릭 시 상세 페이지로 이동
    const handleCardClick = (travelId) => {
        navigate(`/travel/detail/${travelId}`);
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 py-10 px-6">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    ❤️ 좋아요한 여행지
                </h2>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Spin tip="로딩 중..." />
                    </div>
                ) : travels.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {travels.map((raw) => {
                            const toAbs = (p) =>
                                p
                                    ? (/^https?:\/\//i.test(p) ? p : `${API_SERVER_HOST}${p}`)
                                    : null;
                            const imageUrl =
                                toAbs(raw.thumbnailPath) ||
                                toAbs(raw.mainImage) ||
                                toAbs(raw.imagePath) ||
                                (Array.isArray(raw.images) && toAbs(raw.images[0])) ||
                                "/default-thumbnail.jpg";

                            const title = raw.travelName || raw.title || "여행지";
                            const address =
                                raw.address ||
                                [raw.region1Name, raw.region2Name].filter(Boolean).join(" ") ||
                                "";

                            const item = { ...raw, imageUrl, title, address };
                            return (
                                <Card
                                    key={item.travelId}
                                    hoverable
                                    className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
                                    cover={
                                        <img
                                            alt={item.title}
                                            src={item.imageUrl}
                                            className="h-48 w-full object-cover rounded-t-2xl cursor-pointer"
                                            onClick={() => handleCardClick(item.travelId)} // ✅ 이미지 클릭 이동
                                        />
                                    }
                                    onClick={() => handleCardClick(item.travelId)} // ✅ 카드 클릭 이동
                                    actions={[
                                        <Button
                                            danger
                                            type="text"
                                            icon={<HeartFilled style={{ color: "#eb2f96" }} />}
                                            onClick={(e) => {
                                                e.stopPropagation(); // ✅ 카드 클릭 이벤트 방지
                                                handleUnlike(item.travelId);
                                            }}
                                        >
                                            취소
                                        </Button>,
                                    ]}
                                >
                                    <Meta
                                        title={
                                            <span className="text-lg font-semibold text-gray-800">
                                                {item.title}
                                            </span>
                                        }
                                        description={
                                            <p className="text-sm text-gray-500 mt-1">
                                                {item.address}
                                            </p>
                                        }
                                    />
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-10">
                        좋아요한 여행지가 없습니다.
                    </p>
                )}
            </div>
        </MainLayout>
    );
};

export default UserLikedTravelsPage;