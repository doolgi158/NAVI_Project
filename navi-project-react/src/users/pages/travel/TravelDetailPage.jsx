import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    Row, Col, Card, Typography, Divider, Button, Space, 
    Descriptions, Spin, Result, Tag 
} from 'antd'; 
import { 
    HeartOutlined, ShareAltOutlined, StarOutlined, 
    PhoneOutlined, GlobalOutlined, EnvironmentOutlined 
} from '@ant-design/icons';
import MainLayout from '../../layout/MainLayout';
// ⭐️ [추가] 이전에 작성했던 카카오맵 훅을 가져옵니다.
import { useKakaoMap } from '../../../hooks/useKakaoMap'; 

const { Title, Text, Paragraph } = Typography;


const TravelDetailPage = () => {
    const { travelId } = useParams();
    const [travelDetail, setTravelDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // ⭐️ [추가] 카카오맵 훅을 사용하고, 고유한 ID를 부여합니다.
    const { isMapLoaded, updateMap } = useKakaoMap('kakao-detail-map-container');


    // 태그 문자열을 분리하는 유틸리티 함수 (쉼표나 공백으로 분리한다고 가정)
    const getTagsArray = (tagString) => {
        if (!tagString) return [];
        return tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    };

    useEffect(() => {
        if (!travelId) {
            setError("여행지 ID가 제공되지 않았습니다.");
            setLoading(false);
            return;
        }

        const fetchTravelDetail = async () => {
            setLoading(true);
            setError(null);
            
            const apiUrl = `/api/travel/detail/${travelId}`;
            const viewsApiUrl = `/api/travel/views/${travelId}`;
            
            // 1. 조회수 증가 시도 (실패해도 데이터 조회는 계속)
            try {
                //조회수 증가 API 호출
                await axios.post(viewsApiUrl);
            } catch (err) {
                //조회수 증가 실패했으나, 로그만 남기고 에러발생 x
                console.warn(`조회수 증가 실패 (id: ${travelId}):`,err.message);
            }
               //상세 정보 조회
            try{
                const response = await axios.get(apiUrl);            
                setTravelDetail(response.data); 

            } catch (err) {
                console.error("여행지 상세 정보 로딩 실패:", err);
                setError("여행지 정보를 불러오는 데 실패했거나 존재하지 않습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchTravelDetail();
    }, [travelId]);
    
    // ⭐️ [추가] 지도 로직을 처리하는 useEffect
    useEffect(() => {
        // 지도 SDK가 로드되었고, 상세 정보가 있으며, 위경도 값이 유효할 때만 실행
        if (
            isMapLoaded && 
            travelDetail && 
            travelDetail.latitude && 
            travelDetail.longitude
        ) {
            // updateMap 함수에 travelDetail 객체 전체를 전달하여 지도에 위치를 표시합니다.
            updateMap(travelDetail); 
        }
    }, [isMapLoaded, travelDetail, updateMap]);

    // ----------------------------------------------------------------------
    // 로딩 및 에러 처리 UI (유지)
    // ----------------------------------------------------------------------
     if (loading) {
        return (
            <MainLayout>
                <div style={{ padding: '80px 0', textAlign: 'center' }}>
                    <Spin size="large" tip="상세 정보를 불러오는 중입니다..." >
                        <div style={{ height: 100, display: 'block' }} /> 
                    </Spin>
                </div>
            </MainLayout>
        );
    }

    if (error || !travelDetail) {
        return (
            <MainLayout>
                <div style={{ padding: '80px 0', textAlign: 'center' }}>
                    <Result
                        status={error ? "error" : "404"}
                        title={error || "여행지를 찾을 수 없습니다"}
                        subTitle={error ? "서버 통신 중 오류가 발생했습니다." : `ID: ${travelId}에 해당하는 정보를 찾을 수 없습니다.`}
                        extra={<Button type="primary" onClick={() => window.location.reload()}>다시 시도</Button>}
                    />
                </div>
            </MainLayout>
        );
    }
    
    // DTO 데이터 바인딩
    const data = travelDetail;
    const tagsArray = getTagsArray(data.tag);

    return (
        <MainLayout>
            <Row justify="center" style={{marginBottom:80}}>
                <Col xs={24} lg={16} style={{ marginTop: 40, padding: '0 24px' }}>
                    
                    {/* 제목 및 좋아요 영역 (유지) */}
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <Title level={1}>{data.title || '제목 없음'}</Title> 
                        <Text type="secondary" style={{ fontSize: '1.1em' }}>
                            {data.region1Name || ''} {' > '} {data.region2Name || ''}
                        </Text>
                    </div>
                    
                    {/* 통계 및 버튼 (유지) */}
                    <Row justify="center" align="middle" gutter={24} style={{ marginBottom: 40 }}>
                        <Col>
                            <Space>
                                <HeartOutlined style={{ color: 'red' }} />
                                <Text>{(data.likes || 0).toLocaleString()}</Text> 
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                <StarOutlined /> 
                                <Text>{(data.views || 0).toLocaleString()}</Text> 
                            </Space>
                        </Col>
                        <Col>
                            <Button type="default" icon={<ShareAltOutlined />}>
                                공유
                            </Button>
                        </Col>
                    </Row>

                    {/* 메인 이미지 영역 (유지) */}
                    <Card 
                        style={{ 
                            marginBottom: 40, 
                            height: 400, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            backgroundColor: '#f0f0f0',
                            backgroundImage: data.imagePath ? `url(${data.imagePath})` : 'none', 
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {(!data.imagePath) && (
                            <Text strong style={{ fontSize: '1.5em', color: '#666' }}>이미지 없음</Text>
                        )}
                    </Card>
                    
                    <Divider />
                    
                    {/* 1. 상세 정보 및 태그 영역 (유지) */}
                    <Title level={3} style={{ marginTop: 0 }}>소개</Title>
                    <div style={{ marginBottom: 16 }}>
                        {tagsArray.map((tag, index) => (
                            <Tag key={index} color="blue">{tag}</Tag> 
                        ))}
                    </div>
                    <Paragraph style={{ lineHeight: 1.8, marginBottom: 40 }}>
                        {data.introduction || '제공된 소개 내용이 없습니다.'}
                        <Button type="link" size="small" style={{ padding: 0, marginLeft: 8 }}>
                            더보기
                        </Button>
                    </Paragraph>

                    {/* ⭐️ [수정] 2. 지도/위치 정보 영역: 카카오맵 컨테이너로 교체 */}
                    <Title level={3}>위치</Title>
                    <div style={{ marginBottom: 40, border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden' }}>
                        <div 
                            id="kakao-detail-map-container" 
                            style={{ height: 350, width: '100%' }}
                        >
                            {/* 지도 로딩 중일 때 표시할 UI */}
                            {!isMapLoaded && (
                                <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
                                    <Spin tip="지도 SDK 로딩 중..." />
                                </div>
                            )}
                        </div>
                    </div>
                    <Divider />
                    
                    {/* 3. 기본 정보 (이용 안내) 영역 (유지) */}
                    <Title level={3}>기본 정보</Title>
                    <Descriptions 
                        column={{ xs: 1, sm: 2, md: 3 }}
                        layout="vertical"
                        bordered
                        size="small"
                    >
                        <Descriptions.Item label={<Space><PhoneOutlined /> 전화번호</Space>}>{data.phoneNo || '-'}</Descriptions.Item>
                        <Descriptions.Item label={<Space><GlobalOutlined /> 홈페이지</Space>}>-</Descriptions.Item> 
                        <Descriptions.Item label={<Space><EnvironmentOutlined /> 주소</Space>}>{data.address || data.roadAddress || '-'}</Descriptions.Item>
                        <Descriptions.Item label="운영시간">-</Descriptions.Item>
                        <Descriptions.Item label="주차시설">-</Descriptions.Item>
                        <Descriptions.Item label="요금/가격">-</Descriptions.Item>
                    </Descriptions>

                </Col>
            </Row>
        </MainLayout>
    );
};

export default TravelDetailPage;