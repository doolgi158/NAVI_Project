import React, { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, Typography, Divider, Button, Space, 
        Descriptions, Spin, Result, Tag, message,Carousel 
} from 'antd'; 
import {  ShareAltOutlined, PhoneFilled, EnvironmentFilled,
          ClockCircleFilled, CarFilled, CreditCardFilled, HomeFilled,
          HeartOutlined, HeartFilled, BookOutlined, BookFilled 
} from '@ant-design/icons'; 
import MainLayout from '../../layout/MainLayout';
import { useKakaoMap } from '../../../Common/hooks/useKakaoMap.jsx'; 


const { Title, Text, Paragraph } = Typography;

// currentUserId가 제공되지 않을 경우 'navi48'을 기본값으로 사용 (테스트용)
const TravelDetailPage = ({ id  = 'navi48'}) => { 
// const TravelDetailPage = ({ id }) => { // 만약 prop을 넘기지 않았을 때 로그아웃 상태로 테스트하려면 이 코드를 사용하세요.
    const { travelId } = useParams();
    const [travelDetail, setTravelDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 좋아요 상태 및 카운트 관리
    const [isLiked, setIsLiked] = useState(false); 
    const [currentLikes, setCurrentLikes] = useState(0); 
    const [isLiking, setIsLiking] = useState(false); 

    // 북마크 상태 및 카운트 관리
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [currentBookmarks, setCurrentBookmarks] = useState(0); 
    const [isBookmarking, setIsBookmarking] = useState(false);


    // 맵 컨테이너 ID 정의
    const MAP_CONTAINER_ID = 'kakao-detail-map-container';
    const { isMapLoaded, updateMap, relayoutMap } = useKakaoMap(MAP_CONTAINER_ID);

    const getTagsArray = (tagString) => {
        if (!tagString) return [];
        return tagString.split(',').map(tag => tag.trim()).filter(Boolean);
    };

    // 날짜 포맷팅 함수 (YYYY.MM.DD)
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).replace(/\./g, '. ').trim(); 
    };



    // 1. 데이터 로드 (최초 1회)
    useEffect(() => {
        if (!travelId) {
            setError("여행지 ID가 제공되지 않았습니다.");
            setLoading(false);
            return;
        }

        const fetchTravelDetail = async () => {
            setLoading(true);
            setError(null);
            
            // [수정] currentUserId를 사용하여 API 호출 URL 생성
            const apiUrl = `/api/travel/detail/${travelId}` + (id ? `?id=${id}` : '');
            const viewsApiUrl = `/api/travel/views/${travelId}`;

            try { 
                // 조회수 증가 API 호출은 비동기로 처리하고, 실패해도 상세 정보 로드는 계속 진행
                axios.post(viewsApiUrl).catch(e => console.warn("views post failed", e.message)); 
            } catch (e) { 
                console.warn("views post failed (outside of try/catch)", e.message);
            }

            try {
                const res = await axios.get(apiUrl);
                setTravelDetail(res.data);
                
                // 서버 응답에 따라 초기 좋아요/북마크 상태 및 카운트 설정
                setCurrentLikes(res.data.likes || 0);
                setIsLiked(res.data.isLiked || false); 

                setCurrentBookmarks(res.data.bookmarkCount || 0); 
                setIsBookmarked(res.data.isBookmarked || false); 
                
            } catch (err) {
                console.error("detail load failed", err);
                setError("여행지 정보를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchTravelDetail();
    }, [travelId, id]); // [수정] 의존성 배열에 id 추가

    // 2. 🗺️ 초기 지도 설정 및 업데이트 (로직 유지)
    useEffect(() => {
        if (isMapLoaded && travelDetail) {
            console.log("[TravelPage] Map and Data Ready: Calling initial updateMap.");
            updateMap(travelDetail);
            
            const timer = setTimeout(() => {
                console.log("[TravelPage] Forced relayout after 500ms delay.");
                relayoutMap();
                updateMap(travelDetail); 
            }, 500);

            return () => clearTimeout(timer); 
        }
    }, [isMapLoaded, travelDetail, updateMap, relayoutMap]); 

    // 3. ❤️ 좋아요 버튼 클릭 핸들러
      const handleLikeClick = async () => {
        // [수정] currentUserId를 사용하여 로그인 여부 체크
        if (!id) {
            message.warning('로그인 후 이용 가능합니다.');
            return;
        }

        if (isLiking) return;

        setIsLiking(true);

        try {
            // [수정] 실제 API 호출: currentUserId를 사용
            const response = await axios.post(`/api/travel/like/${travelId}?id=${id}`);
            const isNewLike = response.data; // true: 좋아요 추가됨, false: 좋아요 취소됨
            
            if (isNewLike) {
                setIsLiked(true);
                setCurrentLikes(prev => prev + 1);
                message.success('좋아요를 눌렀습니다! ');
            } else {
                setIsLiked(false);
                setCurrentLikes(prev => Math.max(0, prev - 1));
                message.success('좋아요를 취소했습니다.');
            }
            
        } catch (error) {
            console.error("Like operation failed:", error);
            message.error('좋아요 처리에 실패했습니다. ');
        } finally {
            setIsLiking(false);
        }
    };

    // 4. 📚 북마크 버튼 클릭 핸들러
    const handleBookmarkClick = async () => {
        // [수정] currentUserId를 사용하여 로그인 여부 체크
        if (!id) {
            message.warning('로그인 후 이용 가능합니다.');
            return;
        }

        if (isBookmarking) return;

        setIsBookmarking(true);

        try {
            // [수정] 실제 API 호출: currentUserId를 사용
            const response = await axios.post(`/api/travel/bookmark/${travelId}?id=${id}`);
            const isNewBookmark = response.data; // true: 북마크 추가됨, false: 북마크 취소됨
            
            if (isNewBookmark) {
                setIsBookmarked(true);
                setCurrentBookmarks(prev => prev + 1);
                message.success('북마크에 추가했습니다! ');
            } else {
                setIsBookmarked(false);
                setCurrentBookmarks(prev => Math.max(0, prev - 1));
                message.success('북마크를 취소했습니다.');
            }

        } catch (error) {
            console.error("Bookmark operation failed:", error);
            message.error('북마크 처리에 실패했습니다.');
        } finally {
            setIsBookmarking(false);
        }
    };


      // 5. 🚀 공유하기 버튼 클릭 핸들러 (로직 유지)
    const handleShareClick = async () => {
        try {
            const currentUrl = "http://localhost:5173/Travel/detail/" + travelId; 
            // navigator.clipboard.writeText를 사용하여 클립보드에 복사 시도
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(currentUrl);
                message.success('현재 페이지 URL이 클립보드에 복사되었습니다.');
            } else {
                message.warning('클립보드 복사 기능이 지원되지 않습니다.');
            }
        } catch (err) {
            console.error('URL 복사 실패:', err);
            message.error('URL 복사에 실패했습니다.');
        }
    };

    
      if (loading) {
        return (
            // 로딩 스피너를 전체 화면 중앙에 표시 (Spin의 tip prop은 이처럼 fullscreen에서 작동합니다.)
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', zIndex: 9999 }}>
                <Spin size="large" tip="상세 정보를 불러오는 중입니다..." />
            </div>
        );
    }


      if (error || !travelDetail) {
        return (
            <MainLayout>
                <div style={{ padding: '80px 0', textAlign: 'center' }}>
                    <Result status="error" title={error || "여행지를 찾을 수 없습니다"} extra={<Button type="primary" onClick={() => window.location.reload()}>다시 시도</Button>} />
                </div>
            </MainLayout>
        );
    }

    const data = travelDetail;
    const tagsArray = getTagsArray(data.tag);

      const infoData = [
        { label: '주소',  icon: <EnvironmentFilled style={{ color: '#1890ff' }} />, value: data.address || data.roadAddress || '-' },
        { label: '전화번호', icon: <PhoneFilled style={{ color: '#52c41a' }} />, value: data.phoneNo || '-' },
        { label: '홈페이지', icon: <HomeFilled style={{ color: '#faad14' }} />, value: data.homepage || '-' }, 
        { label: '이용 시간', icon: <ClockCircleFilled style={{ color: '#eb2f96' }} />, value:data.hours || '-' },
        { label: '주차 시설', icon: <CarFilled style={{ color: '#f5222d' }} />, value: data.parking || '-' },
        { label: '이용 요금',icon: <CreditCardFilled style={{ color: '#722ed1' }} />, value: data.fee || '-' },
    ];

    // 이미지 배열 처리 (쉼표로 구분된 URL 문자열 가정)
    const images = data.imagePath ? data.imagePath.split(',').map(url => url.trim()).filter(Boolean) : [];
    // 이미지가 없으면 플레이스홀더 이미지 추가
    if (images.length === 0) {
        images.push("https://placehold.co/800x450/EAEAEA/333333?text=No+Image");
    }


      const ImageContent = () => (
        // Carousel에 그림자 효과를 주기 위해 Card 대신 단순 div 사용
        <div 
            style={{ 
                borderRadius: 8, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }} 
        >
            <Carousel 
                autoplay 
                dots={{ className: 'carousel-dots' }} 
                effect="fade" 
                style={{ borderRadius: '8px', overflow: 'hidden' }}
            >
                {images.map((imgSrc, index) => (
                    <div key={index}>
                        <img
                            alt={`${data.title || data.name} - ${index + 1}`}
                            src={imgSrc}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/800x450/EAEAEA/333333?text=Image+Load+Failed";
                            }}
                            style={{ 
                                width: '100%', 
                                aspectRatio: '16/9', 
                                objectFit: 'cover', 
                                display: 'block' 
                            }}
                        />
                    </div>
                ))}
            </Carousel>
        </div>
    );


      const DetailContent = () => (
        <>
            <div style={{ padding: '20px 0' }}>
                <Title level={4} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 10, marginBottom: 20 }}>소개</Title>

                <div style={{ marginBottom: 16 }}>
                    {tagsArray.map((t,i) => (
                        <Tag key={i} color="blue" style={{ marginBottom: 8, fontSize: '1.0em', padding: '4px 8px', borderRadius: 4 }}>#{t}</Tag>
                    ))}
                </div>

                <Paragraph style={{ lineHeight: 1.8, marginBottom: 40, whiteSpace: 'pre-wrap', color: '#333' }}>
                    {data.introduction || '제공된 소개 내용이 없습니다.'}
                </Paragraph>
            </div>

            <div style={{ paddingBottom: 20 }}>
                <Title level={4} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 10, marginBottom: 20 }}>위치</Title>
                <div style={{ marginTop: 10, marginBottom: 20, border: '1px solid #ccc', borderRadius: 8,  position: 'relative', zIndex: 10 }}>
                    {/* 맵 컨테이너 ID 사용 및 기본 크기 지정 */}
                    <div id={MAP_CONTAINER_ID} 
                         style={{ 
                            height: 350, 
                            minHeight: 350, 
                            width: '100%', 
                            display: 'block', 
                            position: 'relative', 
                            zIndex: 20, 
                            flex: 'none' 
                          }}>
                        
                        {/* 로딩 UI: isMapLoaded가 false일 때만 표시 -> 경고 해결을 위해 수정 */}
                        {!isMapLoaded && (
                            <div style={{ 
                                position: 'absolute', 
                                top: 0, left: 0, width: '100%', height: '100%',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                                backgroundColor: '#f0f0f0', 
                                zIndex: 100, // 지도를 확실히 덮도록 높은 zIndex 설정
                            }}>
                                {/* [수정] Spinning prop 제거하고 tip을 추가하여 nest 패턴을 유지하고 경고 해결 */}
                               <Spin size="large" tip="지도 로딩 중..." />
                            </div>
                        )}
                        
                    </div>
                </div>

                <Title level={4} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 10, marginTop: 40, marginBottom: 20 }}>여행지 정보</Title>
                <Descriptions column={2} bordered size="large" style={{ marginTop: 10 }}>
                    {infoData.map((item, i) => (
                        <Descriptions.Item 
                            key={i} 
                            label={<span style={{ display: 'flex', alignItems: 'center' }}><Space size={5}>{item.icon}<Text strong>{item.label}</Text></Space></span>}
                        >
                            {item.value}
                        </Descriptions.Item>
                    ))}
                </Descriptions>

            </div>
        </>
    );

    return (
        <MainLayout>
            <Row justify="center" style={{ marginBottom: 80, backgroundColor: '#fff', minHeight: '100%' }}>
                <Col  style={{ padding: '0 24px' }}>
                    
                    <div style={{ textAlign: 'center', margin: '40px 0 20px 0' }}>
                        <Text type="secondary" style={{ fontSize: '1.2em', marginBottom: 5, display: 'block', color: '#666' }}>
                            {data.categoryName || '여행지'}
                        </Text>
                        <Title level={1} style={{ marginBottom: 10, lineHeight: 1.2, fontWeight: 700 }}>
                            {data.title || '제목 없음'}
                        </Title>
                        
                        <Row justify="end" style={{ marginBottom: 20 }}>
                            <Col>
                                <Space size={32}>
                                
                                    <Space direction="vertical" align="center" size={0}>
                                        <Button
                                            type="text"
                                            onClick={handleLikeClick}
                                            disabled={isLiking}
                                            loading={isLiking} 
                                            style={{ padding: 0, height: 'auto' }}
                                            icon={
                                                isLiked 
                                                ? <HeartFilled style={{ fontSize: '2.5em', color: '#ff4d4f', transition: 'transform 0.2s' }} /> 
                                                : <HeartOutlined style={{ fontSize: '2.5em', color: '#999', transition: 'transform 0.2s' }} />
                                            }
                                        />
                                        <Text type="secondary" style={{ fontSize: '0.8em', marginTop: 4, fontWeight: 'bold', color: isLiked ? '#ff4d4f' : '#999' }}>
                                            {currentLikes}
                                        </Text>
                                    </Space>
                                    
                                    
                                    <Space direction="vertical" align="center" size={0}>
                                        <Button
                                            type="text"
                                            onClick={handleBookmarkClick}
                                            disabled={isBookmarking} 
                                            loading={isBookmarking} 
                                            style={{ padding: 0, height: 'auto' }}
                                            icon={
                                                isBookmarked 
                                                ? <BookFilled style={{ fontSize: '2.5em', color: '#52c41a', transition: 'transform 0.2s' }} /> 
                                                : <BookOutlined style={{ fontSize: '2.5em', color: '#999', transition: 'transform 0.2s' }} />
                                            }
                                        />
                                        <Text type="secondary" style={{ fontSize: '0.8em', marginTop: 4, fontWeight: 'bold', color: isBookmarked ? '#52c41a' : '#999' }}>
                                            {currentBookmarks}
                                        </Text>
                                    </Space>

                                    
                                    <Space direction="vertical" align="center" size={0}>
                                        <Button
                                            type="text"
                                            onClick={handleShareClick}
                                            style={{ padding: 0, height: 'auto' }} 
                                            icon={<ShareAltOutlined style={{ fontSize: '2.5em', color: '#999' }} />}
                                        />
                                        <Text style={{ fontSize: '0.8em', marginTop: 4, color: '#999' }}>공유</Text>
                                    </Space>
                                </Space>
                            </Col>
                        </Row>
                        
                        <Divider style={{ margin: '20px 0' }} />
                        
                        <Text type="secondary" style={{ fontSize: '0.9em', display: 'block', color: '#888' }}>
                            조회수: {data.views || 0} &nbsp;&nbsp;|&nbsp;&nbsp;
                            제작일 : {formatDate(data.createdAt)} &nbsp;&nbsp;|&nbsp;&nbsp; 수정일 : {formatDate(data.updatedAt)}
                        </Text>
                    </div>

                    <div style={{ paddingTop: 20, paddingBottom: 40 }}><ImageContent /></div>

                    <Divider />
                    
                    <div style={{ paddingTop: 20 }}><DetailContent /></div>
                </Col>
            </Row>
        </MainLayout>

    );
};

export default TravelDetailPage;