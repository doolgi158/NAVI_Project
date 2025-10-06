import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MainLayout from '../../layout/MainLayout.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// ⭐️ [수정] useKakaoMap은 이제 Geocoding 없이 isMapLoaded와 updateMap만 제공합니다.
import { useKakaoMap } from '../../../hooks/useKakaoMap'; 

// ✅ 여행지 목록 API 호출 함수 (유지)
const getTravelData = async (domain, pageParam) => {
  const apiUrl = `/api/${domain}`;
  try {
    const response = await axios.get(apiUrl, {
      params: { page: pageParam.page, size: pageParam.size },
    });
    return response.data;
  } catch (error) {
    console.error('여행지 목록 로딩 실패:', error.message);
    throw error;
  }
};

// ✅ 카드 컴포넌트 (유지)
const AntDCard = ({ item, onClick, isSelected, onMouseEnter, onMouseLeave }) => (
  <div
    className={`bg-white rounded-xl shadow-lg border-2 p-4 cursor-pointer transition duration-300 transform hover:shadow-xl hover:-translate-y-1 ${
      isSelected ? 'border-blue-500 shadow-blue-300/50 scale-[1.01]' : 'border-gray-200'
    } flex space-x-4`}
    onClick={() => onClick(item)}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div className="flex-shrink-0 w-36 h-24 sm:w-40 sm:h-28">
      <img
        src={item.thumbnailPath || 'https://placehold.co/112x112/cccccc/333333?text=No+Image'}
        alt={item.title}
        className="w-full h-full object-cover rounded-lg shadow-md"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://placehold.co/112x112/cccccc/333333?text=No+Image';
        }}
      />
    </div>

    <div className="flex-grow min-w-0 justify-center">
      <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-1 truncate">{item.title}</h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-2">{item.region1Name} {' > '} {item.region2Name}</p>
      <p className="text-xs sm:text-sm text-gray-500 mb-2">{item.tags}</p>
      <div className="text-xs text-gray-400 mb-2 line-clamp-2">{item.address}</div>

      <div className="flex items-center space-x-4 text-sm text-gray-600 font-medium pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          <i className="bi bi-eye-fill text-base text-blue-400"></i>
          <span>{item.views.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <i className="bi bi-suit-heart-fill text-red-500"></i>
          <span>{item.likes.toLocaleString()}</span>
        </div>
      </div>
    </div>
  </div>
);

// ✅ 페이지네이션 (유지)
const AntDPagination = ({ pageResult, handlePageClick, loading }) => (
  <div className="flex justify-center mt-10">
    <div className="flex items-center space-x-1">
      <button
        className={`p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition ${pageResult.startPage > 1 ? '' : 'opacity-50 cursor-not-allowed'}`}
        onClick={() => handlePageClick(pageResult.startPage > 1 ? pageResult.startPage - 10 : 1)}
        disabled={loading || pageResult.startPage <= 1}
      >
        &lt;&lt;
      </button>

      <button
        className={`p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition ${pageResult.page > 1 ? '' : 'opacity-50 cursor-not-allowed'}`}
        onClick={() => handlePageClick(pageResult.page - 1)}
        disabled={loading || pageResult.page <= 1}
      >
        &lt;
      </button>

      {pageResult.pageList.map((p) => (
        <button
          key={p}
          onClick={() => handlePageClick(p)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            pageResult.page === p ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
          }`}
          disabled={loading}
        >
          {p}
        </button>
      ))}

      <button
        className={`p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition ${pageResult.page < pageResult.totalPages ? '' : 'opacity-50 cursor-not-allowed'}`}
        onClick={() => handlePageClick(pageResult.page + 1)}
        disabled={loading || pageResult.page >= pageResult.totalPages}
      >
        &gt;
      </button>

      <button
        className={`p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition ${pageResult.endPage < pageResult.totalPages ? '' : 'opacity-50 cursor-not-allowed'}`}
        onClick={() => handlePageClick(pageResult.endPage + 1)}
        disabled={loading || pageResult.endPage >= pageResult.totalPages}
      >
        &gt;&gt;
      </button>
    </div>
  </div>
);

const TravelPage = () => {
  const navigate = useNavigate();
  const [pageResult, setPageResult] = useState({
    dtoList: [],
    totalElements: 0,
    totalPages: 0,
    page: 1,
    size: 10,
    startPage: 1,
    endPage: 1,
    pageList: [],
  });
  const [pageParam, setPageParam] = useState({ page: 1, size: 10 });
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  // 마우스 호버 상태 관리
  const [hoveredItem, setHoveredItem] = useState(null);
  // ⭐️ [수정] useKakaoMap에서 isMapLoaded와 updateMap만 가져옴
  const { isMapLoaded, updateMap } = useKakaoMap('kakao-map-container')

  // ✅ 여행지 목록 불러오기 (유지)
  const fetchTravelList = useCallback(() => {
    if (loading) return;

    setLoading(true);
    setHasError(false);

    getTravelData('travel', pageParam)
      .then((data) => {
        const currentPage = data.number + 1;
        const startBlock = Math.floor(data.number / 10) * 10 + 1;
        const endBlock = Math.min(data.totalPages, startBlock + 9);
        const pageList = Array.from({ length: endBlock - startBlock + 1 }, (_, i) => startBlock + i);

        setPageResult({
          dtoList: data.content || [],
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          page: currentPage,
          size: data.size,
          startPage: startBlock,
          endPage: endBlock,
          pageList,
        });

        setSelectedItem((prev) => data.content.find((it) => it.travelId === prev?.travelId) || data.content[0] || null);
      })
      .catch((err) => {
        console.error('여행지 목록 로딩 실패:', err.message);
        setPageResult({ dtoList: [], totalElements: 0, totalPages: 0, page: 1, pageList: [] });
        setHasError(true);
        setSelectedItem(null);
      })
      .finally(() => setLoading(false));
  }, [pageParam]);

  useEffect(() => {
    fetchTravelList();
  }, [fetchTravelList]);

  // ⭐️ [수정] 지도 표시 로직: isMapLoaded만 확인
  useEffect(() => {
    // 호버된 항목을 최우선으로 사용하고, 없으면 선택된 항목을 사용
    const itemToDisplay = hoveredItem || selectedItem;
    
    // isMapLoaded 상태가 true이고 표시할 항목이 있으면 updateMap 호출
    if (isMapLoaded && itemToDisplay) { 
      // itemToDisplay 객체 전체를 updateMap에 전달
      updateMap(itemToDisplay); 
    }
  }, [isMapLoaded, selectedItem, hoveredItem, updateMap]); // ⭐️ [수정] 종속성에서 isGeocoderReady 제거

  const handlePageClick = (pageNumber) => {
    if (!loading && pageNumber > 0 && pageNumber <= pageResult.totalPages) {
      setPageParam((prev) => ({ ...prev, page: pageNumber }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  //  마우스 호버/이탈/클릭 핸들러 (유지)
  const handleCardHover = useCallback((item) => {
    setHoveredItem(item);
  }, []);

  const handleCardLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);

  const handleCardClick = (item) => {
    setSelectedItem(item); 
    navigate(`/travel/detail/${item.travelId}`);
  };

  const regionTags = ['제주시', '서귀포시', '동부', '서부', '남부', '북부'];
  const totalCountText = loading ? '로딩 중...' : `총 ${pageResult.totalElements.toLocaleString()}개`;

  return (
    <MainLayout>
      <div className="py-8 min-h-[calc(100vh-140px)] space-y-8">
        {/* 검색창 (유지) */}
        <div className="flex justify-center">
          <div className="w-full max-w-3xl flex shadow-lg rounded-lg overflow-hidden border border-blue-300">
            <input
              type="text"
              placeholder="여행지를 검색하세요. (예: 비자림, 한라산)"
              className="w-full p-4 text-lg border-none focus:outline-none placeholder-gray-400"
            />
            <button className="bg-blue-500 text-white px-6 text-lg hover:bg-blue-600 transition flex items-center justify-center">
              <i className="bi bi-search text-xl"></i>
            </button>
          </div>
        </div>

        {/* 통계 및 필터 (유지) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6">
            <p className="text-base font-semibold text-gray-800">{totalCountText}</p>
            <div className="flex space-x-4 text-sm font-medium">
              <button className="text-blue-600 border-b-2 border-blue-600 pb-1">최신순</button>
              <button className="text-gray-500 hover:text-blue-600">인기순</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {regionTags.map((tag) => (
              <button
                key={tag}
                className="text-sm px-3 py-1 border border-blue-400 text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100 transition"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* 목록 + 지도 (유지) */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 좌측 목록 */}
          <div className="lg:w-4/12 flex flex-col space-y-4">
            {loading ? (
              <div className="p-12 text-center text-gray-500 bg-white rounded-lg shadow-md min-h-[400px] flex flex-col items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500 mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-lg font-medium">데이터를 불러오는 중입니다...</p>
              </div>
            ) : hasError || pageResult.dtoList.length === 0 ? (
              <div className="p-12 text-center text-red-500 border border-red-200 rounded-lg bg-red-50 font-bold text-lg shadow-md min-h-[400px] flex flex-col items-center justify-center">
                찾을 수 없습니다
                <p className="text-sm font-normal mt-2 text-red-400">검색 결과가 없거나 데이터를 불러오는 데 실패했습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pageResult.dtoList.map((item) => (
                  <AntDCard
                    key={item.travelId}
                    item={item}
                    onClick={handleCardClick}
                    isSelected={selectedItem && selectedItem.travelId === item.travelId}
                    // 마우스 호버 이벤트
                    onMouseEnter={() => handleCardHover(item)}
                    onMouseLeave={handleCardLeave}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 우측 지도 */}
          <div className="lg:w-8/12">
            <div className="relative border-2 border-gray-300 rounded-lg shadow-2xl h-[500px] sticky top-6 overflow-hidden">
              <div id="kakao-map-container" style={{ width: '100%', height: '100%' }}>
                {/*  지도 가이드 표시 조건: 선택되거나 호버된 항목이 없을 때 */}
                {!selectedItem && !hoveredItem && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
                    <span className="text-white text-2xl font-semibold p-4 text-center">
                      목록에서 여행지를 선택하거나<br />마우스를 **올려** 위치를 확인하세요.
                    </span>
                  </div>
                )}
                {!isMapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="text-gray-600 text-lg font-medium">카카오맵 SDK 로딩 중...</div>
                  </div>
                )}
              </div>
          </div>
          </div>
        </div>

        {pageResult.totalPages > 1 && !hasError && (
          <AntDPagination pageResult={pageResult} handlePageClick={handlePageClick} loading={loading} />
        )}
      </div>
    </MainLayout>
  );
};

export default TravelPage;