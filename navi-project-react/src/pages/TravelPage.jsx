import MainLayout from "../layout/MainLayout";
import {Input, List, Button, Card, Pagination, Space,Typography,Row,Col,Image} from 'antd';
import { HeartFilled } from '@ant-design/icons';
import React, { useState } from 'react';

const { Text } = Typography;


const initialTravelItems = [
    // travelImageUrl 필드를 추가하고, views 값을 활용하여 Placeholder URL에 동적인 이미지 크기를 부여합니다.
    { id: 1, title: '비자림', location: '제주시 > 구좌읍', likes: 30000, views: 50000, date: '2024-01-15', active: true, travelImageUrl: "https://placehold.co/100x100/367e91/ffffff?text=비자림" },
    { id: 2, title: '성산일출봉', location: '서귀포시 > 성산읍', likes: 25400, views: 60000, date: '2023-11-20', active: false, travelImageUrl: "https://placehold.co/100x100/9e9d24/ffffff?text=성산" },
    { id: 3, title: '한라산', location: '제주시 > 해안동', likes: 45000, views: 80000, date: '2024-03-01', active: false, travelImageUrl: "https://placehold.co/100x100/546e7a/ffffff?text=한라산" },
    { id: 4, title: '우도', location: '제주시 > 우도면', likes: 18000, views: 40000, date: '2024-02-10', active: false, travelImageUrl: "https://placehold.co/100x100/00bcd4/ffffff?text=우도" },
    { id: 5, 'title': '만장굴', location: '제주시 > 구좌읍', likes: 22000, views: 35000, date: '2023-10-05', active: false, travelImageUrl: "https://placehold.co/100x100/5d4037/ffffff?text=만장굴" },
    { id: 6, title: '협재 해수욕장', location: '제주시 > 한림읍', likes: 19000, views: 42000, date: '2024-04-25', active: false, travelImageUrl: "https://placehold.co/100x100/2962ff/ffffff?text=협재" },
    { id: 7, title: '오설록 티 뮤지엄', location: '서귀포시 > 안덕면', likes: 15000, views: 30000, date: '2023-12-12', active: false, travelImageUrl: "https://placehold.co/100x100/4caf50/ffffff?text=오설록" },
    { id: 8, title: '주상절리대', location: '서귀포시 > 중문동', likes: 12000, views: 25000, date: '2024-05-01', active: false, travelImageUrl: "https://placehold.co/100x100/ff9800/ffffff?text=절리대" },
    { id: 9, title: '카멜리아힐', location: '서귀포시 > 안덕면', likes: 17000, views: 38000, date: '2024-01-01', active: false, travelImageUrl: "https://placehold.co/100x100/d81b60/ffffff?text=카멜리아" },
    { id: 10, title: '새별오름', location: '제주시 > 애월읍', likes: 20000, views: 48000, date: '2024-03-10', active: false, travelImageUrl: "https://placehold.co/100x100/7cb342/ffffff?text=새별오름" },
    { id: 11, title: '섭지코지', location: '서귀포시 > 성산읍', likes: 16000, views: 33000, date: '2023-11-01', active: false, travelImageUrl: "https://placehold.co/100x100/00838f/ffffff?text=섭지코지" },
    { id: 12, title: '천지연 폭포', location: '서귀포시 > 서홍동', likes: 14000, views: 28000, date: '2024-04-05', active: false, travelImageUrl: "https://placehold.co/100x100/1e88e5/ffffff?text=천지연" },
    { id: 13, title: '에코랜드', location: '제주시 > 조천읍', likes: 13000, views: 27000, date: '2023-10-20', active: false, travelImageUrl: "https://placehold.co/100x100/3e2723/ffffff?text=에코랜드" },
    { id: 14, title: '러브랜드', location: '제주시 > 연동', likes: 11000, views: 24000, date: '2024-02-20', active: false, travelImageUrl: "https://placehold.co/100x100/e91e63/ffffff?text=러브랜드" },
    { id: 15, title: '신화월드', location: '서귀포시 > 안덕면', likes: 23000, views: 44000, date: '2023-12-01', active: false, travelImageUrl: "https://placehold.co/100x100/424242/ffffff?text=신화월드" },
];

const TravelPage = () => {
    // 1. 상태 정의
    const [travelItems, setTravelItems] = useState(initialTravelItems);
    const totalCount = 5309; // 목업 총 건수
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // 한 페이지에 10개 항목 표시
    const startIndex = (currentPage - 1) * pageSize;
    const currentItems = travelItems.slice(startIndex, startIndex + pageSize);
    const [isSearching, setIsSearching] = useState(false); // 검색 로딩 상태 추가

    // 현재 활성화된 아이템 찾기
    const activeItem = travelItems.find(item => item.active) || travelItems[0];
    
    // 2. 함수 정의 
    const onSearch = (value) => {
        if (!value) return;
        console.log(`Searching for: ${value}`);
        setIsSearching(true);
        setTimeout(() => {
            setIsSearching(false);
        }, 1000); 
    };

    const renderSortButton = (text, isSelected) => (
        <Button
            type="text"
            style={{ 
                color: isSelected ? '#1890ff' : '#595959', 
                borderBottom: isSelected ? '2px solid #1890ff' : 'none',
                fontWeight: isSelected ? 'bold' : 'normal',
                padding: '0 8px',
                height: 'auto',
                transition: 'all 0.3s',
            }}
            onClick={() => console.log(`${text} 순으로 정렬`)}
        >
            {text}
        </Button>
    );

    const handleItemClick = (id) => {
        setTravelItems(prevItems => 
            prevItems.map(item => ({
                ...item,
                active: item.id === id ? true : false,
            }))
        );
    };

    return (
        <MainLayout>
            MainLayout의 중앙 컨테이너(div.bg-white) 내부로 들어가는 실제 콘텐츠 영역
            <div style={{ padding: '0 8px' }}>
                
                {/* 1. 검색 섹션: Row justify="center"로 중앙에 배치 */}
                <Row justify="center" style={{ marginBottom: 30 }}>
                    <Col xs={24} lg={10}> 
                        <Input.Search
                            placeholder="여행지를 검색하세요"
                            allowClear 
                            enterButton={isSearching ? "검색 중" : "검색"} 
                            size="large" 
                            loading={isSearching}
                            onSearch={onSearch}
                        />
                    </Col>
                </Row>


                {/* 2. 통계 및 정렬 버튼 섹션 */}
                <Row justify="center" style={{ marginBottom: 12 }}>
                    <Col xs={24} lg={19}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text style={{ color: '#595959', fontSize: 14 }}>총 {totalCount.toLocaleString()}건</Text>
                            <Space size="middle">
                                {renderSortButton('최신순', true)}
                                {renderSortButton('인기순', false)}
                                {renderSortButton('조회순', false)}
                            </Space>
                        </div>
                    </Col>
                </Row>

                <hr style={{ marginBottom: 12 }}/>

                {/* 3. 목록 및 상세 정보 레이아웃 */}
                <Row justify="center">
                    <Col xs={24} lg={20}> 
                        <Row gutter={[24, 24]}> 
                            
                            {/* A. 좌측 목록 영역 */}
                            <Col xs={24} md={10}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {currentItems.map((item) => (
                                        <Card
                                            key={item.id}
                                            bodyStyle={{ padding: 12, display: 'flex', gap: '12px' }} // ⚠️ flex 스타일 적용
                                            hoverable
                                            onClick={() => handleItemClick(item.id)}
                                        >
                                            {/* 1. 좌측 이미지 영역 */}
                                            <Image 
                                                src={item.travelImageUrl} 
                                                preview={false}
                                                width={80} // 이미지 너비 설정
                                                height={80} // 이미지 높이 설정
                                                style={{ borderRadius: '8px', objectFit: 'cover' }}
                                            />

                                            {/* 2. 우측 텍스트/메타 정보 영역 */}
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <List.Item
                                                    style={{ borderBottom: 'none', padding: 0 , marginLeft:'20px'}}
                                                >
                                                    <List.Item.Meta
                                                        title={<Text strong style={{ fontSize: '16px' }}>{item.title}</Text>}
                                                        description={<Text type="secondary" style={{ fontSize: '12px'}}>{item.location}</Text>}
                                                    />
                                                    <div style={{ display: 'flex', alignItems: 'center', color: '#ff4d4f', fontSize: 14, whiteSpace: 'nowrap' }}>
                                                        <HeartFilled style={{ marginRight: 4 }} /> 
                                                        {item.likes.toLocaleString()}
                                                    </div>
                                                </List.Item>
                                            </div>
                                        </Card>
                                    ))}
                                </Space>
                            </Col>

                            {/* B. 우측 상세 정보/지도 영역 */}
                            <Col xs={24} md={14}>
                                <Card
                                    title={activeItem.title || "여행지 상세 정보"}
                                    style={{ minHeight: 1135, backgroundColor: '#fafafa' }} 
                                >
                                    {/* 지도 목업 */}
                                    <div style={{ color: '#8c8c8c', padding: 96, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                        선택된 (<Text strong>{activeItem.title}</Text>)의 지도 및 상세 내용이 표시됩니다.
                                        <p style={{ marginTop: 8 }}>위치: {activeItem.location}</p>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>


                {/* 4. 페이지네이션 */}
                <Row justify="center" style={{ marginTop: 40 }}>
                    <Col>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={totalCount}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                        />
                    </Col>
                </Row>

            </div>
        </MainLayout>
    );
 
};

export default TravelPage;
