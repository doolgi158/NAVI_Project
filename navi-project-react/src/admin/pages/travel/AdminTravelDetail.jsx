import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/common/api/naviApi";
import {
    Row, Col, Typography, Divider, Button, Space,
    Descriptions, Spin, Result, Tag, Carousel, Layout, message
} from "antd";
import {
    EnvironmentFilled, PhoneFilled, ClockCircleFilled,
    CarFilled, CreditCardFilled, HomeFilled, EditOutlined
} from "@ant-design/icons";
import AdminSiderLayout from "../../layout/AdminSiderLayout";
import { Content, Header } from "antd/es/layout/layout";
import { useKakaoMap } from "@/common/hooks/useKakaoMap";

const { Title, Text, Paragraph } = Typography;

export default function AdminTravelDetail() {
    const { travelId } = useParams();
    const navigate = useNavigate();

    const [travelDetail, setTravelDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 지도
    const MAP_CONTAINER_ID = "admin-travel-detail-map";
    const { isMapLoaded, updateMap, relayoutMap } = useKakaoMap(MAP_CONTAINER_ID);
    const didMapInit = useRef(false);

    const getTagsArray = (tagString) =>
        tagString ? tagString.split(",").map((t) => t.trim()).filter(Boolean) : [];

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date
            .toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            })
            .replace(/\./g, ". ")
            .trim();
    };

    /** ✅ 여행지 상세정보 조회 */
    useEffect(() => {
        const fetchAdminTravelDetail = async () => {
            if (!travelId) {
                setError("여행지 ID가 없습니다.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const res = await api.get(`/adm/travel/detail/${travelId}`);
                const data = res.data;
                setTravelDetail(data);
                setError(null);
            } catch (err) {
                console.error("❌ 관리자용 여행지 상세 조회 실패:", err);
                setError("여행지 정보를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchAdminTravelDetail();
    }, [travelId]);

    /** ✅ 지도 표시 */
    useEffect(() => {
        if (didMapInit.current) return;
        if (isMapLoaded && travelDetail) {
            updateMap(travelDetail);
            setTimeout(() => {
                relayoutMap();
                updateMap(travelDetail);
            }, 300);
            didMapInit.current = true;
        }
    }, [isMapLoaded, travelDetail]);

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <Spin size="large" tip="상세 정보를 불러오는 중입니다..." />
            </div>
        );

    if (error || !travelDetail)
        return (
            <Result
                status="error"
                title={error || "여행지를 찾을 수 없습니다."}
                extra={
                    <Button type="primary" onClick={() => window.location.reload()}>
                        다시 시도
                    </Button>
                }
            />
        );

    const data = travelDetail;
    const tags = getTagsArray(data.tag);
    const images = data.imagePath
        ? data.imagePath.split(",").map((url) => url.trim()).filter(Boolean)
        : ["https://placehold.co/800x450/EAEAEA/333333?text=No+Image"];

    const infoData = [
        { label: "주소", icon: <EnvironmentFilled style={{ color: "#1890ff" }} />, value: data.address || "-" },
        { label: "전화번호", icon: <PhoneFilled style={{ color: "#52c41a" }} />, value: data.phoneNo || "-" },
        { label: "홈페이지", icon: <HomeFilled style={{ color: "#faad14" }} />, value: data.homepage || "-" },
        { label: "이용 시간", icon: <ClockCircleFilled style={{ color: "#eb2f96" }} />, value: data.hours || "-" },
        { label: "주차 시설", icon: <CarFilled style={{ color: "#f5222d" }} />, value: data.parking || "-" },
        { label: "이용 요금", icon: <CreditCardFilled style={{ color: "#722ed1" }} />, value: data.fee || "-" },
    ];

    return (
        <Layout className="min-h-screen">
            <AdminSiderLayout />
            <Layout>
                <Header
                    className="px-6 shadow flex items-center justify-between text-xl font-bold"
                    style={{ background: "#fefce8" }}
                >
                    <span>NAVI 관리자 페이지</span>

                </Header>

                <Content style={{ padding: "24px", background: "#fff", minHeight: "100vh" }}>
                    <div className="flex flex-col gap-2  items-end">
                        <Button
                            type="primary"
                            style={{
                                backgroundColor: "#9db92dff",
                                color: "#ffffffff",
                            }}
                            onClick={() => navigate(`/adm/travel`)}
                        >
                            목록으로
                        </Button>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            style={{ background: "#0A3D91" }}
                            onClick={() => navigate(`/adm/travel/edit/${travelId}`)}
                        >
                            수정하기
                        </Button>
                    </div>
                    <Row justify="center" style={{ maxWidth: 1200, margin: "0 auto" }}>
                        <Col span={24}>
                            <div style={{ textAlign: "center", marginBottom: 20 }}>
                                <Text type="secondary" style={{ fontSize: "1.1em" }}>
                                    {data.categoryName || "여행지"}
                                </Text>
                                <Title level={1}>{data.title}</Title>

                                <Divider />
                                <Text type="secondary" style={{ fontSize: "0.9em" }}>
                                    조회수 {data.views || 0} &nbsp;|&nbsp;
                                    등록일 {formatDate(data.createdAt)} &nbsp;|&nbsp;
                                    수정일 {formatDate(data.updatedAt)}
                                </Text>
                            </div>

                            {/* 이미지 캐러셀 */}
                            <div style={{ marginBottom: 40 }}>
                                <Carousel autoplay effect="fade">
                                    {images.map((src, i) => (
                                        <div key={i}>
                                            <img
                                                src={src}
                                                alt={`${data.title}-${i + 1}`}
                                                style={{
                                                    width: "100%",
                                                    aspectRatio: "16/9",
                                                    objectFit: "cover",
                                                    borderRadius: 8,
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                }}
                                                onError={(e) =>
                                                    (e.target.src = "https://placehold.co/800x450/EAEAEA/333333?text=No+Image")
                                                }
                                            />
                                        </div>
                                    ))}
                                </Carousel>
                            </div>

                            {/* 소개 */}
                            <Title level={4} style={{ borderLeft: "4px solid #1890ff", paddingLeft: 10 }}>
                                소개
                            </Title>
                            <Paragraph style={{ lineHeight: 1.8, whiteSpace: "pre-line" }}>
                                {data.introduction || "제공된 소개 내용이 없습니다."}
                            </Paragraph>

                            {tags.map((tag, i) => (
                                <Tag key={i} color="blue" style={{ marginBottom: 8 }}>
                                    #{tag}
                                </Tag>
                            ))}

                            {/* 본문 */}
                            {data.description && (
                                <div
                                    style={{ marginTop: 30, lineHeight: 1.8, fontSize: 18 }}
                                    dangerouslySetInnerHTML={{ __html: data.description }}
                                />
                            )}

                            {/* 지도 */}
                            <Title level={4} style={{ borderLeft: "4px solid #1890ff", paddingLeft: 10, marginTop: 40 }}>
                                위치
                            </Title>
                            <div
                                style={{
                                    margin: "10px 0 30px",
                                    border: "1px solid #ccc",
                                    borderRadius: 8,
                                    overflow: "hidden",
                                }}
                            >
                                <div id={MAP_CONTAINER_ID} style={{ height: 350, width: "100%" }}>
                                    {!isMapLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                                            <Spin size="large" tip="지도 로딩 중..." />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 상세 정보 */}
                            <Title level={4} style={{ borderLeft: "4px solid #1890ff", paddingLeft: 10 }}>
                                여행지 정보
                            </Title>
                            <Descriptions column={2} bordered size="large" style={{ marginTop: 20, marginBottom: 50 }}>
                                {infoData.map((item, i) => (
                                    <Descriptions.Item
                                        key={i}
                                        label={
                                            <Space>
                                                {item.icon}
                                                <Text strong>{item.label}</Text>
                                            </Space>
                                        }
                                    >
                                        <div style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
                                            {item.value || "-"}
                                        </div>
                                    </Descriptions.Item>
                                ))}
                            </Descriptions>
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </Layout>
    );
}
