import React, { useState, useCallback } from 'react';
import { Layout, Typography, Tabs, Card, Button, List, Pagination, Row, Col, Space } from 'antd';
import { MenuOutlined, PlusOutlined } from '@ant-design/icons';
import MainLayout from '../../layout/MainLayout';

const { Content } = Layout;
const { Title, Text } = Typography;

// --- Mock Data ---
const mockPlannedTrips = [
    {
        id: 1,
        title: "나홀로 배낭여행",
        period: "25.09.22~25.09.25",
        imageUrl: "https://placehold.co/400x300/F0F0F0/ADADAD?text=여행+이미지"
    },
    {
        id: 2,
        title: "제주 가족 힐링 여행",
        period: "25.10.15~25.10.18",
        imageUrl: "https://placehold.co/400x300/F0F0F0/ADADAD?text=여행+이미지"
    },
    {
        id: 3,
        title: "부산 먹방 투어",
        period: "25.11.01~25.11.03",
        imageUrl: "https://placehold.co/400x300/F0F0F0/ADF9D6?text=여행+이미지"
    },
    {
        id: 4,
        title: "강릉 커피 성지순례",
        period: "25.11.20~25.11.21",
        imageUrl: "https://placehold.co/400x300/F0F0F0/ADADAD?text=여행+이미지"
    },
];

// --- Styles (Tailwind CSS is assumed to be available) ---
const styles = {
    contentWrapper: "p-4 sm:p-8 max-w-7xl mx-auto relative",
    buttonCreateBanner: "absolute bottom-6 left-6 z-10 shadow-lg", // 배너 내 위치 스타일
    tabsContainer: "bg-white p-4 sm:p-8 rounded-lg shadow-md",
    
    // 카드 높이를 h-auto(모바일)에서 sm:h-48(데스크톱)로 고정
    planCard: "border-gray-200 h-auto sm:h-48 hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden cursor-pointer w-full", 
    
    // 이미지 컨테이너: 모바일에서는 h-32 고정, 데스크톱에서는 h-full (카드 높이 h-48에 맞춰짐)
    cardImageContainer: "w-full h-32 sm:h-full flex items-center justify-center bg-gray-100", 
    cardBodyCol: "p-4 sm:p-6 h-full flex flex-col justify-center", 

    listTitle: "text-2xl font-semibold mb-6 text-gray-800",
    bannerContainer: "relative w-full h-48 sm:h-64 rounded-xl overflow-hidden mb-8 shadow-lg",
    bannerImage: "absolute inset-0 w-full h-full object-cover filter brightness-75",
    bannerContent: "relative z-10 w-full h-full flex flex-col items-center justify-center p-4",
    bannerTitle: "text-3xl sm:text-4xl text-white font-bold mb-4 drop-shadow-md"
};

// 1. 여행 계획하기 배너 영역 컴포넌트
const TravelBanner = ({ handleCreatePlan }) => (
    <div className={styles.bannerContainer}>
        {/* Mock 배경 이미지 (실제 이미지 URL로 대체 필요) */}
        <img
            src="https://placehold.co/1200x400/1E3A8A/ffffff?text=나의+여행을+계획해보세요" 
            alt="여행 계획 배경 배너"
            className={styles.bannerImage}
        />
        <div className={styles.bannerContent}>
            {/* 버튼을 배너 콘텐츠 내부의 절대 위치에 배치 */}
            <Button 
                type="primary" 
                size="large"
                icon={<PlusOutlined />}
                onClick={handleCreatePlan}
                className={styles.buttonCreateBanner} // absolute bottom-6 left-6
                style={{ borderRadius: '50px', height: 'auto', padding: '12px 24px', fontWeight: 'bold', position: 'absolute' }}
            >
                여행 계획하기
            </Button>
            
        </div>
    </div>
);


const TabContent = ({ status }) => {
    const data = mockPlannedTrips.filter((_, index) => {
        return status === ' 예정' ? true : index % 2 === 0;
    });

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 4;

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 100, behavior: 'smooth' });
    }, []);

    const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div>
            <Title level={3} className={styles.listTitle}>
                나의 여행 계획<Text className="text-base text-gray-500 ml-3">({data.length}개)</Text>
            </Title>
            
            <List
                // Grid 설정: 모바일(xs: 1열), 태블릿 이하(sm: 1열), 데스크톱(md: 2열)
                grid={{
                    gutter: 24, // 아이템 간 간격
                    xs: 1, 
                    sm: 1, 
                    md: 2, 
                }}
                dataSource={paginatedData}
                renderItem={(item) => (
                    // ⭐️ w-full을 추가하여 AntD Grid 컬럼 너비를 꽉 채우도록 보장
                    <List.Item className="p-0 w-full"> 
                        <Card 
                            className={styles.planCard} 
                            bodyStyle={{ padding: 0, height: '100%' }}
                        >
                            {/* h-full 적용: Row의 높이를 Card 전체 높이만큼 채움 */}
                            <Row gutter={[0, 0]} className="h-full">
                                {/* 이미지 영역 (왼쪽) */}
                                <Col xs={24} sm={8} md={8}>
                                    <div className={styles.cardImageContainer}>
                                        <img 
                                            src={item.imageUrl} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover rounded-l-xl sm:rounded-r-none rounded-t-xl sm:rounded-tl-xl sm:rounded-bl-xl"
                                        />
                                    </div>
                                </Col>
                                
                                {/* 텍스트/정보 영역 (오른쪽) */}
                                <Col xs={24} sm={16} md={16} className={styles.cardBodyCol}>
                                    <div className="flex justify-between items-start w-full">
                                        <Title level={4} className="mt-0 mb-2 text-xl font-bold text-gray-800">
                                            {item.title}
                                        </Title>
                                        <Button 
                                            type="text" 
                                            icon={<MenuOutlined className="text-gray-500 text-lg hover:text-blue-500" />} 
                                            className="p-1"
                                            aria-label="여행 계획 옵션"
                                        />
                                    </div>
                                    <Space direction="vertical" size={4}>
                                        <Text className="text-gray-600 text-sm">
                                            여행 기간
                                        </Text>
                                        <Text strong className="text-base text-blue-600">
                                            {item.period}
                                        </Text>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    </List.Item>
                )}
            />

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={data.length}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
};

const TravelPlanList = () => {
    const handleCreatePlan = () => {
        console.log("새로운 여행 계획 페이지로 이동");
        // router.push('/travel/plan/new');
    };
    
    const tabsItems = [
        {
            key: 'expected',
            label: <span className="text-base sm:text-lg font-semibold px-6">여행 예정 계획</span>,
            children: <TabContent status=" 예정" />,
        },
        {
            key: 'completed',
            label: <span className="text-base sm:text-lg font-semibold px-6">여행 완료 계획</span>,
            children: <TabContent status=" 완료" />,
        },
    ];


    return (
        <MainLayout>
        <Content className=" min-h-screen">
            <div className={styles.contentWrapper}>
                
                {/* 1. 여행 계획하기 배너 영역 (버튼 포함) */}
                <TravelBanner handleCreatePlan={handleCreatePlan} />

                {/* 2. 탭 및 목록 영역 */}
                <div className={styles.tabsContainer}>
                    <Tabs 
                        defaultActiveKey="expected" 
                        items={tabsItems} 
                        size="large"
                        centered
                        className="bg-white"
                        tabBarStyle={{ 
                            marginBottom: 0, 
                            borderBottom: 'none', 
                        }}
                        tabBarGutter={0} 
                        tabBarExtraContent={{ 
                            left: null, 
                            right: null 
                        }}
                    />
                </div>
            </div>
        </Content>
        </MainLayout>
    );
};

export default TravelPlanList;
