import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../../common/api/naviApi.js';
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

const TravelDetailPage = () => {
  const { travelId } = useParams();
  const reduxUser = useSelector((state) => state.login);
  const userId = reduxUser?.username || null;
  const token = reduxUser?.token || localStorage.getItem("accessToken");

  const [travelDetail, setTravelDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ❤️ 좋아요 & 📚 북마크 상태
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  // 지도
  const MAP_CONTAINER_ID = 'kakao-detail-map-container';
  const { isMapLoaded, updateMap, relayoutMap } = useKakaoMap(MAP_CONTAINER_ID);
  const didMapInit = useRef(false);

  const getTagsArray = (tagString) =>
    tagString ? tagString.split(',').map(t => t.trim()).filter(Boolean) : [];

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).replace(/\./g, '. ').trim();
  };

  

useEffect(() => {
  if (travelDetail) {
    console.log("🧭 전체 travelDetail:", travelDetail);
      console.log("🧭 description 내용:", travelDetail?.description);
  }
}, [travelDetail]);


  
  /** ✅ 상세정보 + 조회수 증가 */
  useEffect(() => {
    const fetchTravelDetail = async () => {
      if (!travelId) {
        setError("여행지 ID가 없습니다.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        await api.post(`/travel/views/${travelId}`); // 조회수 증가
        const res = await api.get(`/travel/detail/${travelId}`);
        const data = res.data;
        setTravelDetail(data);
        setLikeCount(data.likesCount || 0);
        setBookmarkCount(data.bookmarkCount || 0);
        setIsLiked(data.likedByUser || false);
        setIsBookmarked(data.bookmarkedByUser || false);
        setError(null);
      } catch (err) {
        console.error("❌ 상세 조회 실패:", err);
        setError("여행지 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchTravelDetail();
  }, [travelId, userId]);

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

  /** ❤️ 좋아요 처리 */
  const handleLikeClick = async () => {
    if (!userId || !token) return message.warning('로그인 후 이용 가능합니다.');
    if (loadingLike) return;
    setLoadingLike(true);

    try {
      const res = await api.post(`/travel/like/${travelId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { success, liked, message: serverMessage } = res.data;

      if (success) {
        setIsLiked(liked);
        setLikeCount((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
        message.success(serverMessage || '좋아요 상태 변경');
      } else {
        message.warning(serverMessage || '좋아요 처리 실패');
      }
    } catch (err) {
      console.error("❌ 좋아요 실패:", err);
      message.error('좋아요 처리 중 오류가 발생했습니다.');
    } finally {
      setLoadingLike(false);
    }
  };

  /** 📚 북마크 처리 */
  const handleBookmarkClick = async () => {
    if (!userId || !token) return message.warning('로그인 후 이용 가능합니다.');
    if (loadingBookmark) return;
    setLoadingBookmark(true);

    try {
      const res = await api.post(`/travel/bookmark/${travelId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { success, bookmarked, message: serverMessage } = res.data;

      if (success) {
        setIsBookmarked(bookmarked);
        setBookmarkCount((prev) => (bookmarked ? prev + 1 : Math.max(0, prev - 1)));
        message.success(serverMessage || '북마크 상태 변경');
      } else {
        message.warning(serverMessage || '북마크 처리 실패');
      }
    } catch (err) {
      console.error("❌ 북마크 실패:", err);
      message.error('북마크 처리 중 오류가 발생했습니다.');
    } finally {
      setLoadingBookmark(false);
    }
  };

  /** 🔗 공유하기 */
  const handleShareClick = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      message.success('URL이 복사되었습니다.');
    } catch (err) {
      console.error("공유 실패:", err);
      message.error('URL 복사에 실패했습니다.');
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Spin size="large" tip="상세 정보를 불러오는 중입니다..." />
      </div>
    );

  if (error || !travelDetail)
    return (
      <MainLayout>
        <Result
          status="error"
          title={error || "여행지를 찾을 수 없습니다."}
          extra={<Button type="primary" onClick={() => window.location.reload()}>다시 시도</Button>}
        />
      </MainLayout>
    );

  const data = travelDetail;
  const tags = getTagsArray(data.tag);
  const images = data.imagePath
    ? data.imagePath.split(',').map(url => url.trim()).filter(Boolean)
    : ["https://placehold.co/800x450/EAEAEA/333333?text=No+Image"];

  const infoData = [
    { label: '주소', icon: <EnvironmentFilled style={{ color: '#1890ff' }} />, value: data.address || '-' },
    { label: '전화번호', icon: <PhoneFilled style={{ color: '#52c41a' }} />, value: data.phoneNo || '-' },
    { label: '홈페이지', icon: <HomeFilled style={{ color: '#faad14' }} />, value: data.homepage || '-' },
    { label: '이용 시간', icon: <ClockCircleFilled style={{ color: '#eb2f96' }} />, value: data.hours || '-' },
    { label: '주차 시설', icon: <CarFilled style={{ color: '#f5222d' }} />, value: data.parking || '-' },
    { label: '이용 요금', icon: <CreditCardFilled style={{ color: '#722ed1' }} />, value: data.fee || '-' },
  ];

  return (
    <MainLayout>
      <Row justify="center" style={{ backgroundColor: '#fff', minHeight: '100%' }}>
        <Col span={24} style={{ padding: '0 24px', maxWidth: 1200, width: '100%' }}>
          {/* 제목 */}
          <div style={{ textAlign: 'center', margin: '40px 0 20px' }}>
            <Text type="secondary" style={{ fontSize: '1.1em' }}>
              {data.categoryName || '여행지'}
            </Text>
            <Title level={1}>{data.title}</Title>

            {/* ❤️ 북마크 공유 */}
            <Row justify="end" style={{ marginBottom: 20 }}>
              <Space size={32}>
                <Space direction="vertical" align="center">
                  <Button
                    type="text"
                    onClick={handleLikeClick}
                    icon={isLiked
                      ? <HeartFilled style={{ fontSize: '2.3em', color: '#ff4d4f' }} />
                      : <HeartOutlined style={{ fontSize: '2.3em', color: '#999' }} />}
                  />
                  <Text style={{ color: isLiked ? '#ff4d4f' : '#999' }}>{likeCount}</Text>
                </Space>

                <Space direction="vertical" align="center">
                  <Button
                    type="text"
                    onClick={handleBookmarkClick}
                    icon={isBookmarked
                      ? <BookFilled style={{ fontSize: '2.3em', color: '#52c41a' }} />
                      : <BookOutlined style={{ fontSize: '2.3em', color: '#999' }} />}
                  />
                  <Text style={{ color: isBookmarked ? '#52c41a' : '#999' }}>{bookmarkCount}</Text>
                </Space>

                <Space direction="vertical" align="center">
                  <Button
                    type="text"
                    onClick={handleShareClick}
                    icon={<ShareAltOutlined style={{ fontSize: '2.3em', color: '#999' }} />}
                  />
                  <Text style={{ color: '#999' }}>공유</Text>
                </Space>
              </Space>
            </Row>

            <Divider />
            <Text type="secondary" style={{ fontSize: '0.9em' }}>
              조회수 {data.views || 0} &nbsp;|&nbsp;
              등록일 {formatDate(data.createdAt)} &nbsp;|&nbsp;
              수정일 {formatDate(data.updatedAt)}
            </Text>
          </div>

          {/* 이미지 */}
          <div style={{ padding: '20px 0 40px' }}>
            <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Carousel autoplay effect="fade">
                {images.map((src, i) => (
                  <div key={i}>
                    <img
                      src={src}
                      alt={`${data.title}-${i + 1}`}
                      style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
                      onError={(e) => (e.target.src = "https://placehold.co/800x450/EAEAEA/333333?text=No+Image")}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>

          {/* 소개 */}
          <Title level={4} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 10 }}>소개</Title>
           <Paragraph style={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {data.introduction || '제공된 소개 내용이 없습니다.'}
          </Paragraph>
          {tags.map((tag, i) => (
            <Tag key={i} color="blue" style={{ marginBottom: 8 }}>#{tag}</Tag>
          ))}
         

          {/* ✅ 본문(description) 추가 */}
          {data.description && (
            <div
              className="travel-description"
              style={{ marginTop: 30, lineHeight: 1.8, fontSize: 20,lineHeight:2}}
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          )}
          
          {/* 지도 */}
          <Title level={4} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 10, marginTop: 40 }}>위치</Title>
          <div style={{ margin: '10px 0 20px', border: '1px solid #ccc', borderRadius: 8, position: 'relative',marginTop: 20 }}>
            <div id={MAP_CONTAINER_ID} style={{ height: 350, width: '100%' }}>
              {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <Spin size="large" tip="지도 로딩 중..." />
                </div>
              )}
            </div>
          </div>

          {/* 상세 정보 */}
          <Title level={4} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 10,marginTop:30 }}>여행지 정보</Title>
          <Descriptions column={2} bordered size="large" style={{ marginTop: 20, marginBottom:50}}>
            {infoData.map((item, i) => (
              <Descriptions.Item
                key={i}
                label={<Space>{item.icon}<Text strong>{item.label}</Text></Space>}
              >
                <div style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                  {item.value || '-'}
                </div>
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Col>
      </Row>
    </MainLayout>
  );
};

export default TravelDetailPage;
