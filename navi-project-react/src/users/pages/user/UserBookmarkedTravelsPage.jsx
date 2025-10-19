import { useEffect, useState } from "react";
import { Card, List, Avatar, Spin, message } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { API_SERVER_HOST } from "@/common/api/naviApi";
import MainLayout from "../../layout/MainLayout";

const UserBookmarkedTravelsPage = () => {
    const [travels, setTravels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const userNo = localStorage.getItem("userNo");

        if (!token || !userNo) {
            message.warning("로그인이 필요합니다.");
            return;
        }

        fetch(`${API_SERVER_HOST}/api/activity/bookmarks?userNo=${userNo}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setTravels(data.data || []);
                } else {
                    message.error("데이터를 불러오지 못했습니다.");
                }
            })
            .catch(() => message.error("북마크한 여행지를 불러오지 못했습니다."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 py-10 px-6">
                <Card
                    title="🔖 북마크한 여행지"
                    bordered={false}
                    className="shadow-md rounded-2xl"
                >
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Spin tip="로딩 중..." />
                        </div>
                    ) : travels.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={travels}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                src={
                                                    item.thumbnailPath
                                                        ? `${API_SERVER_HOST}${item.thumbnailPath}`
                                                        : undefined
                                                }
                                                icon={<BookOutlined style={{ color: "#52c41a" }} />}
                                            />
                                        }
                                        title={
                                            <a href={`/travel/${item.travelId}`}>{item.title}</a>
                                        }
                                        description={`${item.region1Name || ""} ${item.region2Name || ""
                                            } | 🔖 ${item.bookmarkCount || 0}개`}
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <p className="text-gray-500 text-center py-10">
                            북마크한 여행지가 없습니다.
                        </p>
                    )}
                </Card>
            </div>
        </MainLayout>
    );
};

export default UserBookmarkedTravelsPage;
