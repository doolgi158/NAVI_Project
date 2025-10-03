import React from 'react';
import { Row, Col, Card, Typography, Divider, Button, Space, Tabs, Descriptions } from 'antd';
import { HeartOutlined, ShareAltOutlined, StarOutlined, ClockCircleOutlined, CarOutlined } from '@ant-design/icons';
import MainLayout
 from '../layout/MainLayout';
const { Title, Text, Paragraph } = Typography;

const TravelDetailPage = () => {

    // 이미지에 보이는 임시 데이터
    const travelData = {
        title: "비자림",
        location: "제주도 제주시",
        likes: "1.3K",
        views: "35.6K",
        introduction: "천년기념물로 지정·보호하고 있는 비자림은 448,165㎡의 면적에 500~800년 비자나무 2,800여 그루가 밀집하여 장관을 이루고 있다. 나무의 높이는 7~14m, 직경은 50~110cm 그리고 수관폭은 10~15m에 이르는, ... (중략) ... 이 아니라 기본 동산이나 본당을 하는데 안성맞춤인 코스이며 특히 영험하다고 알려져 매우 관람을 받고 있다.",
        tel: "064-710-7912",
        homepage: "https://www.visitjeju.net/kr",
        address: "제주특별자치도 제주시 구좌읍 비자숲길 55",
        time: "하절기(4~9월) 09:00 - 18:00 (입장 마감 17:00)",
        parking: "가능",
        babychair: "가능",
        price: [
            { type: "성인", price: "3,000원" },
            { type: "군인/청소년", price: "1,500원" },
            { type: "어린이", price: "1,500원" },
        ]
    };

    return (
                <Row justify="center">
                    <Col xs={24} lg={16} style={{ marginTop: 40 }}>
                        {/* 제목 및 좋아요 영역 */}
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <Title level={1}>{travelData.title}</Title>
                            <Text type="secondary" style={{ fontSize: '1.1em' }}>{travelData.location}</Text>
                        </div>
                        <Row justify="center" align="middle" gutter={24} style={{ marginBottom: 40 }}>
                            <Col>
                                <Space>
                                    <HeartOutlined style={{ color: 'red' }} />
                                    <Text>{travelData.likes}</Text>
                                </Space>
                            </Col>
                            <Col>
                                <Space>
                                    <StarOutlined />
                                    <Text>{travelData.views}</Text>
                                </Space>
                            </Col>
                            <Col>
                                <Button type="default" icon={<ShareAltOutlined />}>
                                    나의 여행
                                </Button>
                            </Col>
                        </Row>

                        {/* 메인 이미지 슬라이더 영역 */}
                        <Card style={{ marginBottom: 40, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
                            <Text strong style={{ fontSize: '1.5em' }}>First slide</Text>
                            {/* 실제 슬라이더 컴포넌트(Carousel 등)가 들어갈 영역 */}
                        </Card>
                        
                        <Divider />
                        
                        {/* 1. 상세 정보 탭 영역 */}
                        <Title level={3} style={{ marginTop: 0 }}>상세정보</Title>
                        <Paragraph style={{ lineHeight: 1.8, marginBottom: 40 }}>
                            {travelData.introduction}
                            <Button type="link" size="small" style={{ padding: 0, marginLeft: 8 }}>
                                더보기 +
                            </Button>
                        </Paragraph>

                        {/* 2. 지도/위치 정보 영역 (이미지에서는 비어있는 회색 박스) */}
                        <div style={{ height: 300, backgroundColor: '#f0f0f0', marginBottom: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ccc' }}>
                            {/* 실제 지도 컴포넌트(KakaoMap, NaverMap 등)가 들어갈 영역 */}
                            <Text type="secondary">[지도 영역]</Text>
                        </div>
                        
                        <Divider />
                        
                        {/* 3. 이용 안내 및 연락처 영역 */}
                        <Title level={3}>이용안내</Title>
                        <Descriptions 
                            column={{ xs: 1, sm: 2, md: 3 }}
                            layout="vertical"
                            bordered
                            size="small"
                        >
                            <Descriptions.Item label="전화번호">{travelData.tel}</Descriptions.Item>
                            <Descriptions.Item label="홈페이지">
                                <a href={travelData.homepage} target="_blank" rel="noopener noreferrer">{travelData.homepage}</a>
                            </Descriptions.Item>
                            <Descriptions.Item label="주소">{travelData.address}</Descriptions.Item>
                            
                            <Descriptions.Item label={<Space><ClockCircleOutlined /> 운영시간</Space>}>{travelData.time}</Descriptions.Item>
                            <Descriptions.Item label={<Space><CarOutlined /> 주차시설</Space>}>{travelData.parking}</Descriptions.Item>
                            <Descriptions.Item label="출발/도착">{/* 데이터 없음 */}-</Descriptions.Item>
                        </Descriptions>

                        {/* 요금 정보 (별도 섹션) */}
                        <div style={{ marginTop: 30 }}>
                            <Title level={4}>요금표</Title>
                            {travelData.price.map((item, index) => (
                                <Text key={index} style={{ display: 'block' }}>
                                    • {item.type}: {item.price}
                                </Text>
                            ))}
                        </div>

                    </Col>
                </Row>
    );
};

export default TravelDetailPage;