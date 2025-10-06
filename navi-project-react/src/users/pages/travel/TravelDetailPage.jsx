import React, { useState, useEffect } from 'react';
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
import MainLayout from '../layout/MainLayout';

const { Title, Text, Paragraph } = Typography;


const TravelDetailPage = () => {
    const { travelId } = useParams();
    const [travelDetail, setTravelDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // ----------------------------------------------------------------------
    // 로딩 및 에러 처리 UI
    // ----------------------------------------------------------------------
     if (loading) {
        return (
            <MainLayout>
                <div style={{ padding: '80px 0', textAlign: 'center' }}>
                    {/* 💡 [수정] Spin 컴포넌트가 자식 요소를 감싸도록 수정 */}
                    <Spin size="large" tip="상세 정보를 불러오는 중입니다..." >
                        {/* ⚠️ Spin의 Nest Pattern을 위해 반드시 자식 엘리먼트를 추가해야 합니다. 
                            여기서는 최소한의 높이를 가진 빈 div를 추가합니다. */}
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
                    
                    {/* 제목 및 좋아요 영역 */}
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <Title level={1}>{data.title || '제목 없음'}</Title> 
                        <Text type="secondary" style={{ fontSize: '1.1em' }}>
                            {data.region1Name || ''} {' > '} {data.region2Name || ''}
                        </Text>
                    </div>
                    
                    {/* 통계 및 버튼 */}
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

                    {/* 메인 이미지 영역 (imagePath 사용) */}
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
                    
                    {/* 1. 상세 정보 및 태그 영역 */}
                    <Title level={3} style={{ marginTop: 0 }}>소개</Title>
                    <div style={{ marginBottom: 16 }}>
                        {tagsArray.map((tag, index) => (
                            // DTO의 tag 필드를 사용하여 태그 목록을 표시합니다.
                            <Tag key={index} color="blue">{tag}</Tag> 
                        ))}
                    </div>
                    <Paragraph style={{ lineHeight: 1.8, marginBottom: 40 }}>
                        {/* DTO의 introduction 필드 바인딩 */}
                        {data.introduction || '제공된 소개 내용이 없습니다.'}
                        <Button type="link" size="small" style={{ padding: 0, marginLeft: 8 }}>
                            더보기
                        </Button>
                    </Paragraph>

                    {/* 2. 지도/위치 정보 영역 */}
                    <div style={{ height: 300, backgroundColor: '#f0f0f0', marginBottom: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ccc' }}>
                        {/* DTO의 longitude, latitude 바인딩 */}
                        <Text type="secondary">
                            [지도 영역: 위도({data.latitude || '-'}) / 경도({data.longitude || '-'})]
                        </Text> 
                    </div>
                    
                    <Divider />
                    
                    {/* 3. 기본 정보 (이용 안내) 영역 */}
                    <Title level={3}>기본 정보</Title>
                    <Descriptions 
                        column={{ xs: 1, sm: 2, md: 3 }}
                        layout="vertical"
                        bordered
                        size="small"
                    >
                        {/* DTO의 phoneNo 필드 바인딩 */}
                        <Descriptions.Item label={<Space><PhoneOutlined /> 전화번호</Space>}>{data.phoneNo || '-'}</Descriptions.Item>
                        
                        {/* DTO에 홈페이지 필드가 없으므로 임시 처리 */}
                        <Descriptions.Item label={<Space><GlobalOutlined /> 홈페이지</Space>}>-</Descriptions.Item> 
                        
                        {/* DTO의 address 필드 바인딩 */}
                        <Descriptions.Item label={<Space><EnvironmentOutlined /> 주소</Space>}>{data.address || data.roadAddress || '-'}</Descriptions.Item>
                        
                        {/* DTO에 운영시간, 주차, 요금 관련 정보가 없으므로 임시 처리 */}
                        <Descriptions.Item label="운영시간">-</Descriptions.Item>
                        <Descriptions.Item label="주차시설">-</Descriptions.Item>
                        <Descriptions.Item label="요금/가격">-</Descriptions.Item>
                    </Descriptions>

                    {/* 요금 정보 (DTO에 해당 정보가 없어 섹션을 비활성화하거나 임시 정보만 표시) */}
                    <div style={{ marginTop: 30, opacity: 0.7 }}>
                        <Title level={4}>요금표 (정보 미제공)</Title>
                        <Text type="secondary">API DTO에 요금 정보가 포함되어 있지 않습니다.</Text>
                    </div>

                </Col>
            </Row>
        </MainLayout>
    );
};

export default TravelDetailPage;