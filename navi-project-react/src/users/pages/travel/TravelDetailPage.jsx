import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Row, Col, Typography, Divider, Button, Space,
  Descriptions, Spin, Result, Tag, message, Carousel
} from 'antd';
import {
  ShareAltOutlined, PhoneFilled, EnvironmentFilled,
  ClockCircleFilled, CarFilled, CreditCardFilled, HomeFilled,
  HeartOutlined, HeartFilled, BookOutlined, BookFilled
} from '@ant-design/icons';
import MainLayout from '../../layout/MainLayout';
import { useKakaoMap } from '../../../common/hooks/useKakaoMap.jsx';

const { Title, Text, Paragraph } = Typography;

const TravelDetailPage = ({ id }) => {
  const { travelId } = useParams();
  const [travelDetail, setTravelDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 좋아요 & 북마크 상태
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentBookmarks, setCurrentBookmarks] = useState(0);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // 지도 관련
  const MAP_CONTAINER_ID = 'kakao-detail-map-container';
  const { isMapLoaded, updateMap, relayoutMap } = useKakaoMap(MAP_CONTAINER_ID);
  const didMapInit = useRef(false);

  // 태그 변환
  const getTagsArray = (tagString) =>
    tagString ? tagString.split(',').map(t => t.trim()).filter(Boolean) : [];

  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).replace(/\./g, '. ').trim();
  };

  /** 상세정보 및 조회수 로드 */
  useEffect(() => {
    if (!travelId) {
      setError("여행지 ID가 제공되지 않았습니다.");
      setLoading(false);
      return;
    }

    const fetchTravelDetail = async () => {
      setLoading(true);
      const apiUrl = `/api/travel/detail/${travelId}` + (id ? `?id=${id}` : '');
      const viewsApiUrl = `/api/travel/views/${travelId}`;

      // 조회수 증가
      try {
        axios.post(viewsApiUrl)
          .then(() => setTravelDetail(prev => prev ? {
            ...prev,
            views: (prev.views || 0) + 1
          } : prev))
          .catch(e => console.warn("views post failed", e.message));
      } catch (e) {
        console.warn("views post failed (outer catch)", e.message);
      }

      // 상세 정보 불러오기
      try {
        const res = await axios.get(apiUrl);
        setTravelDetail(res.data);
        setCurrentLikeCount(res.data.likesCount || 0);
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
  }, [travelId, id]);

  /** 지도 초기화 (React 18 중복 렌더링 방지) */
  useEffect(() => {
    if (didMapInit.current) return;
    if (isMapLoaded && travelDetail) {
      updateMap(travelDetail);
      setTimeout(() => {
        relayoutMap();
        updateMap(travelDetail);
      }, 500);
      didMapInit.current = true;
    }
  }, [isMapLoaded, travelDetail]);

  /** 좋아요 */
  const handleLikeClick = async () => {
    if (!id) return message.warning('로그인 후 이용 가능합니다.');
    if (isLiking) return;
    setIsLiking(true);

    try {
      const res = await axios.post(`/api/travel/like/${travelId}?id=${id}`);
      const msg = res.data;
      if (msg.includes("추가")) {
        setIsLiked(true);
        setCurrentLikeCount(p => p + 1);
      } else {
        setIsLiked(false);
        setCurrentLikeCount(p => Math.max(0, p - 1));
      }
    } catch (e) {
      console.error("Like failed:", e);
      message.error('좋아요 처리에 실패했습니다.');
    } finally {
      setIsLiking(false);
    }
  };

  /** 북마크 */
  const handleBookmarkClick = async () => {
    if (!id) return message.warning('로그인 후 이용 가능합니다.');
    if (isBookmarking) return;
    setIsBookmarking(true);

    try {
      const res = await axios.post(`/api/travel/bookmark/${travelId}?id=${id}`);
      const msg = res.data;
      if (msg.includes("추가")) {
        setIsBookmarked(true);
        setCurrentBookmarks(p => p + 1);
      } else {
        setIsBookmarked(false);
        setCurrentBookmarks(p => Math.max(0, p - 1));
      }
    } catch (e) {
      console.error("Bookmark failed:", e);
      message.error('북마크 처리에 실패했습니다.');
    } finally {
      setIsBookmarking(false);
    }
  };

  /** 공유하기 */
  const handleShareClick = async () => {
    try {
      const currentUrl = `http://localhost:5173/travel/detail/${travelId}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentUrl);
        message.success('현재 페이지 URL이 복사되었습니다.');
      } else {
        message.warning('클립보드 복사가 지원되지 않습니다.');
      }
    } catch (err) {
      console.error('URL 복사 실패:', err);
      message.error('URL 복사에 실패했습니다.');
    }
  };

  /** 로딩 / 에러 UI */
  if (loading)
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#fff', zIndex: 9999
      }}>
        <Spin size="large" tip="상세 정보를 불러오는 중입니다..." />
      </div>
    );

  if (error || !travelDetail)
    return (
      <MainLayout>
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <Result
            status="error"
            title={error || "여행지를 찾을 수 없습니다."}
            extra={<Button type="primary" onClick={() => window.location.reload()}>다시 시도</Button>}
          />
        </div>
      </MainLayout>
    );

  const data = travelDetail;
  const tagsArray = getTagsArray(data.tag);

  const infoData = [
    { label: '주소', icon: <EnvironmentFilled style={{ color: '#1890ff' }} />, value: data.address || data.roadAddress || '-' },
    { label: '전화번호', icon: <PhoneFilled style={{ color: '#52c41a' }} />, value: data.phoneNo || '-' },
    { label: '홈페이지', icon: <HomeFilled style={{ color: '#faad14' }} />, value: data.homepage || '-' },
    { label: '이용 시간', icon: <ClockCircleFilled style={{ color: '#eb2f96' }} />, value: data.hours || '-' },
    { label: '주차 시설', icon: <CarFilled style={{ color: '#f5222d' }} />, value: data.parking || '-' },
    { label: '이용 요금', icon: <CreditCardFilled style={{ color: '#722ed1' }} />, value: data.fee || '-' },
  ];

  const images = data.imagePath
    ? data.imagePath.split(',').map(url => url.trim()).filter(Boolean)
    : ["https://placehold.co/800x450/EAEAEA/333333?text=No+Image"];

  return (
    <MainLayout>
      <Row justify="center" style={{ marginBottom: 80, backgroundColor: '#fff', minHeight: '100%' }}>
        <Col span={24} style={{ padding: '0 24px', maxWidth: 1200, width: '100%' }}>
          <div style={{ textAlign: 'center', margin: '40px 0 20px 0' }}>
            <Text type="secondary" style={{ fontSize: '1.2em', color: '#666' }}>
              {data.categoryName || '여행지'}
            </Text>
            <Title level={1} style={{ marginBottom: 10, fontWeight: 700 }}>
              {data.title || '제목 없음'}
            </Title>

            {/* 좋아요/북마크/공유 버튼 */}
            <Row justify="end" style={{ marginBottom: 20 }}>
              <Col>
                <Space size={32}>
                  <Space direction="vertical" align="center">
                    <Button
                      type="text"
                      onClick={handleLikeClick}
                      disabled={isLiking}
                      icon={isLiked
                        ? <HeartFilled style={{ fontSize: '2.5em', color: '#ff4d4f' }} />
                        : <HeartOutlined style={{ fontSize: '2.5em', color: '#999' }} />}
                    />
                    <Text style={{ color: isLiked ? '#ff4d4f' : '#999', fontWeight: 'bold' }}>
                      {currentLikeCount}
                    </Text>
                  </Space>

                  <Space direction="vertical" align="center">
                    <Button
                      type="text"
                      onClick={handleBookmarkClick}
                      disabled={isBookmarking}
                      icon={isBookmarked
                        ? <BookFilled style={{ fontSize: '2.5em', color: '#52c41a' }} />
                        : <BookOutlined style={{ fontSize: '2.5em', color: '#999' }} />}
                    />
                    <Text style={{ color: isBookmarked ? '#52c41a' : '#999', fontWeight: 'bold' }}>
                      {currentBookmarks}
                    </Text>
                  </Space>

                  <Space direction="vertical" align="center">
                    <Button
                      type="text"
                      onClick={handleShareClick}
                      icon={<ShareAltOutlined style={{ fontSize: '2.5em', color: '#999' }} />}
                    />
                    <Text style={{ color: '#999' }}>공유</Text>
                  </Space>
                </Space>
              </Col>
            </Row>

            <Divider />
            <Text type="secondary" style={{ fontSize: '0.9em', color: '#888' }}>
              조회수: {data.views || 0} &nbsp;|&nbsp;
              제작일: {formatDate(data.createdAt)} &nbsp;|&nbsp;
              수정일: {formatDate(data.updatedAt)}
            </Text>
          </div>

          {/* 이미지 */}
          <div style={{ paddingTop: 20, paddingBottom: 40 }}>
            <div style={{
              borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden'
            }}>
              <Carousel key={travelId} autoplay effect="fade">
                {images.map((src, i) => (
                  <div key={i}>
                    <img
                      src={src}
                      alt={`${data.title}-${i + 1}`}
                      style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
                      onError={e => e.target.src = "https://placehold.co/800x450/EAEAEA/333333?text=Image+Load+Failed"}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>

          {/* 상세정보 */}
          <Title level={4} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 10 }}>소개</Title>
          <div style={{ marginBottom: 16 }}>
            {tagsArray.map((t, i) => (
              <Tag key={i} color="blue" style={{ marginBottom: 8 }}>#{t}</Tag>
            ))}
          </div>
          <Paragraph style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {data.introduction || '제공된 소개 내용이 없습니다.'}
          </Paragraph>

          {/* 지도 */}
          <Title level={4} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 10, marginTop: 40 }}>위치</Title>
          <div style={{ margin: '10px 0 20px', border: '1px solid #ccc', borderRadius: 8, position: 'relative' }}>
            <div id={MAP_CONTAINER_ID} style={{ height: 350, width: '100%' }}>
              {!isMapLoaded && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  background: '#f0f0f0', zIndex: 100
                }}>
                  <Spin size="large" tip="지도 로딩 중..." />
                </div>
              )}
            </div>
          </div>

          {/* 기본정보 */}
          <Title level={4} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 10 }}>여행지 정보</Title>
          <Descriptions column={2} bordered size="large" style={{ marginTop: 10 }}>
            {infoData.map((item, i) => (
              <Descriptions.Item key={i} label={
                <Space size={5}>{item.icon}<Text strong>{item.label}</Text></Space>
              }>
                {item.value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Col>
      </Row>
    </MainLayout>
  );
};

export default TravelDetailPage;
