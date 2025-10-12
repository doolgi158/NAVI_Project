import React, { useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import api from '../../../common/api/naviApi.js';
import { message } from 'antd';
import { useSelector } from 'react-redux'; // ✅ Redux 로그인 정보 가져오기

const TravelCard = ({ item, onClick, isSelected, onMouseEnter, onMouseLeave }) => {
  const [isLiked, setIsLiked] = useState(item.likedByUser || false);
  const [isBookmarked, setIsBookmarked] = useState(item.bookmarkedByUser || false);
  const [likeCount, setLikeCount] = useState(item.likesCount || 0);
  const [bookmarkCount, setBookmarkCount] = useState(item.bookmarkCount || 0);
  const [loading, setLoading] = useState(false);

  // ✅ Redux에서 로그인 정보 가져오기
  const reduxUser = useSelector((state) => state.login);
  const userId = reduxUser?.username || null;
  const token = reduxUser?.token || localStorage.getItem('accessToken');

  /** ❤️ 좋아요 토글 */
  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (!userId || !token) return message.warning('로그인 후 이용 가능합니다.');
    if (loading) return;
    setLoading(true);

    try {
      const res = await api.post(`/travel/like/${item.travelId}?id=${userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ 백엔드에서 JSON 응답을 받음
      const { success, liked, message: serverMessage } = res.data;

      if (success) {
        setIsLiked(liked);
        setLikeCount((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
        message.success(serverMessage);
      } else {
        message.warning(serverMessage || '좋아요 처리 실패');
      }
    } catch (err) {
      console.error('❌ 좋아요 실패:', err);
      if (err.response?.status === 401) message.warning('로그인이 필요합니다.');
      else message.error('좋아요 처리 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  /** 📚 북마크 토글 */
  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    if (!userId || !token) return message.warning('로그인 후 이용 가능합니다.');
    if (loading) return;
    setLoading(true);

    try {
      const res = await api.post(`/travel/bookmark/${item.travelId}?id=${userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { success, bookmarked, message: serverMessage } = res.data;

      if (success) {
        setIsBookmarked(bookmarked);
        setBookmarkCount((prev) => (bookmarked ? prev + 1 : Math.max(0, prev - 1)));
        message.success(serverMessage);
      } else {
        message.warning(serverMessage || '북마크 처리 실패');
      }
    } catch (err) {
      console.error('❌ 북마크 실패:', err);
      if (err.response?.status === 401) message.warning('로그인이 필요합니다.');
      else message.error('북마크 처리 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border-2 p-4 cursor-pointer transition duration-300 transform hover:shadow-xl hover:-translate-y-1 ${
        isSelected ? 'border-blue-500 shadow-blue-300/50 scale-[1.01]' : 'border-gray-200'
      } flex space-x-4`}
      onClick={() => onClick(item)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ✅ 썸네일 */}
      <div className="flex-shrink-0 w-36 h-24 sm:w-40 sm:h-28">
        <img
          src={
            item.thumbnailPath ||
            item.imagePath ||
            'https://placehold.co/112x112/cccccc/333333?text=No+Image'
          }
          alt={item.title}
          className="w-full h-full object-cover rounded-lg shadow-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/112x112/cccccc/333333?text=No+Image';
          }}
        />
      </div>

      {/* ✅ 본문 정보 */}
      <div className="flex-grow min-w-0 justify-center">
        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-1 truncate">
          {item.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-2">
          {item.region1Name} {' > '} {item.region2Name}
        </p>
        <p className="text-xs sm:text-sm text-gray-400 mb-2 truncate">
          {item.tag?.split(',').map((tag) => `#${tag.trim()}`).join(' ') || ''}
        </p>

        {/* ✅ 조회수 / 좋아요 / 북마크 */}
        <div className="flex items-center space-x-4 text-lg text-gray-600 font-medium pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <i className="bi bi-eye-fill text-base text-blue-400"></i>
            <span>{item.views?.toLocaleString() || 0}</span>
          </div>

          <div
            className="flex items-center space-x-1 cursor-pointer hover:scale-110 transition"
            onClick={handleLikeClick}
          >
            <i
              className={`bi ${
                isLiked ? 'bi-suit-heart-fill text-red-500' : 'bi-suit-heart text-gray-400'
              } text-base`}
            ></i>
            <span>{likeCount.toLocaleString()}</span>
          </div>

          <div
            className="flex items-center space-x-1 cursor-pointer hover:scale-110 transition"
            onClick={handleBookmarkClick}
          >
            <i
              className={`bi ${
                isBookmarked ? 'bi-bookmark-fill text-green-500' : 'bi-bookmark text-gray-400'
              } text-base`}
            ></i>
            <span>{bookmarkCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelCard;
