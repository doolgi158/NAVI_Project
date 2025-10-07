import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MainLayout from '../../layout/MainLayout.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { useKakaoMap } from '../../../Common/hooks/useKakaoMap.jsx'; 
import { useRegionFilter } from '../../../Common/hooks/useRegionFilter.jsx'; 
import RegionFilterPanel from '../../../Common/components/travel/RegionFilterPanel.jsx';


// ✅ 카테고리 목록 정의
const categories = ['전체', '관광지', '음식점', '쇼핑'];

// ✅ 여행지 목록 API 호출 함수)
const getTravelData = async (domain, pageParam) => {
  const apiUrl = `/api/${domain}`;

// 콤마로 구분된 sort 문자열을 배열로 분리 (예: 'contentsCd,asc,updatedAt,desc' -> ['contentsCd', 'asc', 'updatedAt,desc'])
  const sortArray = pageParam.sort.split(',');

  // Spring Data Sort 파라미터 형식: ["필드명,방향", "필드명,방향", ...]
  // 2개씩 끊어서 ["contentsCd,asc", "updatedAt,desc", "views,desc"] 형태로 만듭니다.
  const sortParams = [];
  for (let i = 0; i < sortArray.length; i += 2) {
      if (i + 1 < sortArray.length) {
          sortParams.push(`${sortArray[i]},${sortArray[i+1]}`);
      }
  }
  
  //  쿼리 문자열 수동 생성: page와 size는 기본으로, sort는 배열을 '&sort='로 연결
  // 예: ?page=1&size=10&sort=contentsCd,asc&sort=updatedAt,desc
  let queryString = `?page=${pageParam.page - 1}&size=${pageParam.size}`;
  queryString += sortParams.map(s => `&sort=${s}`).join('');

  try {
    //  Axios get 요청 시 URL에 쿼리 문자열을 직접 붙이고, params 객체는 제거
    const response = await axios.get(apiUrl + queryString); 

    return response.data;
  } catch (error) {
    console.error('여행지 목록 로딩 실패:', error.message);
    throw error;
  }
};

// ✅ 카드 컴포넌트 (수정: 태그 prop명, 북마크 아이콘)
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
      <p className="text-xs sm:text-sm text-gray-400 mb-2 truncate">{item.tag.split(',').map(tag => `#${tag.trim()}`).join(' ')}</p>

      <div className="flex items-center space-x-4 text-lg text-gray-600 font-medium pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          <i className="bi bi-eye-fill text-base text-blue-400"></i>
          <span>{item.views.toLocaleString()}</span>
        </div>

        <div className="flex items-center space-x-1">
          <i className="bi bi-suit-heart-fill text-red-500"></i> 
          <span>{item.likes.toLocaleString()}</span>
        </div>


        <div className="flex items-center space-x-1">
          <i className="bi bi-bookmarks-fill text-green-500"></i> 
          <span>{item.bookmarks?.toLocaleString() || 0}</span>
        </div>

      </div>
    
    </div>
  </div>
);

// ✅ 페이지네이션 
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
    
  const getInitialPage = () => {
    const savedPage = sessionStorage.getItem('travelListPage');
    return savedPage ? parseInt(savedPage, 10) : 1;
  };

  // pageParam 초기값: contentsCd 오름차순(asc), updatedAt 내림차순(desc) (유지)
  const [pageParam, setPageParam] = useState({ 
    page: getInitialPage(), 
    size: 10,
    sort: 'contentsCd,asc,updatedAt,desc' 
  });
  
  const [selectedCategory, setSelectedCategory] = useState(categories[0]); 
   
  const handleRegionFilterChange = useCallback((newRegions) => {
    // 실제 API 호출 시에는 newRegions를 사용하여 필터링 쿼리를 구성해야 합니다.
    // 여기서는 필터가 변경되면 1페이지로 돌아가도록 페이지를 초기화합니다.
    setPageParam(prev => ({ ...prev, page: 1 }));
  }, []);


  //필터 모달 상태 및 선택된 지역 상태 (Hook 사용)
  const {
      regionTags,
      selectedRegions,
      isRegionPanelOpen,
      toggleRegionPanel,
      handleRegionSelect,
      handleSelectAllRegions,
      handleDeselectAllRegions
  } = useRegionFilter(handleRegionFilterChange); // 콜백 함수 전달

  const isLoadingRef = useRef(false);
  const [showLoading, setShowLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { isMapLoaded, updateMap } = useKakaoMap('kakao-map-container')

  //컴포넌트 마운트 시 스크롤 위치 복원
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('travelListScrollY');
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll, 10));
      sessionStorage.removeItem('travelListScrollY');
    }
  }, []);


  // ✅ 여행지 목록 불러오기
  const fetchTravelList = useCallback(() => {
    if (isLoadingRef.current) return; 

    isLoadingRef.current = true; // 로딩 시작
    setShowLoading(true); // UI 업데이트 시작
    setHasError(false);

    getTravelData('travel', pageParam)
      .then((data) => {
        let fetchedList = data.content || [];
        
        // 클라이언트 측 정렬 로직 제거 (서버 정렬에 의존)
        const listToDisplay = fetchedList;
        
        // 페이지네이션 계산 로직 (유지)
        const currentPage = data.number + 1;
        const startBlock = Math.floor(data.number / 10) * 10 + 1;
        const endBlock = Math.min(data.totalPages, startBlock + 9);
        const pageList = Array.from({ length: endBlock - startBlock + 1 }, (_, i) => startBlock + i);

        setPageResult({
          dtoList: listToDisplay, // 정렬된 목록 사용
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          page: currentPage,
          size: data.size,
          startPage: startBlock,
          endPage: endBlock,
          pageList,
        });

        setSelectedItem((prev) => listToDisplay.find((it) => it.travelId === prev?.travelId) || listToDisplay[0] || null);
      })
      .catch((err) => {
        console.error('여행지 목록 로딩 실패:', err.message);
        setPageResult({ dtoList: [], totalElements: 0, totalPages: 0, page: 1, pageList: [] });
        setHasError(true);
        setSelectedItem(null);
      })
      .finally(() => {
        isLoadingRef.current = false;
        setShowLoading(false);
        // 데이터 로드 후 세션에 저장된 페이지 정보 삭제 (유지)
        sessionStorage.removeItem('travelListPage');
      });
  }, [pageParam]); 

  useEffect(() => {
    fetchTravelList();
  }, [fetchTravelList]);

  // 지도 표시 로직 (유지)
  useEffect(() => {
    const itemToDisplay = hoveredItem || selectedItem;
    
    if (isMapLoaded && itemToDisplay) { 
      updateMap(itemToDisplay); 
    }
  }, [isMapLoaded, selectedItem, hoveredItem, updateMap]); 

  const handlePageClick = (pageNumber) => {
    if (!showLoading && pageNumber > 0 && pageNumber <= pageResult.totalPages) {
      // 수동 페이지 이동 시 세션에 저장된 페이지 정보를 삭제하여 복원 기능을 비활성화 (유지)
      sessionStorage.removeItem('travelListPage');
      
      setPageParam((prev) => ({ ...prev, page: pageNumber }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  //  정렬 변경 핸들러 함수
  const handleSortChange = (sortType) => {
    let secondarySort; // 2차 정렬 기준 (updatedAt, likes, views 중 하나)
    if (sortType === 'updatedAt,desc') {
      secondarySort = 'updatedAt,desc';
    } else if (sortType === 'likes,desc') {
      secondarySort = 'likes,desc';
    } else if (sortType === 'views,desc') {
      secondarySort = 'views,desc';
    } else {
      secondarySort = 'updatedAt,desc';
    }

    // 1차 기준 contentsCd,asc와 2차 기준 secondarySort를 하나의 문자열로 합침
    const newSort = `contentsCd,asc,${secondarySort}`;
    
    // 정렬 기준이 바뀌면 1페이지로 이동하는 것이 일반적입니다.
    setPageParam((prev) => ({ ...prev, page: 1, sort: newSort }));
    sessionStorage.removeItem('travelListPage');
  };

// 카테고리 변경 핸들러
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // TODO: 카테고리 변경 시 API 호출 파라미터 업데이트 로직 추가 필요
    setPageParam((prev) => ({ ...prev, page: 1 }));
  };
  


  //  마우스 호버/이탈/클릭 핸들러 (유지)
  const handleCardHover = useCallback((item) => {
    setHoveredItem(item);
  }, []);

  const handleCardLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);

  const handleCardClick = (item) => {
    // 상세 페이지로 이동하기 전에 현재 페이지 번호와 스크롤 위치를 저장합니다. (유지)
    sessionStorage.setItem('travelListPage', pageParam.page.toString());
    sessionStorage.setItem('travelListScrollY', window.scrollY.toString());

    setSelectedItem(item); 
    navigate(`/travel/detail/${item.travelId}`);
  };

  //현재 활성화된 2차 정렬 속성을 추출하여 UI에 반영합니다. 
  const getActiveSort = () => {
      if (pageParam.sort.includes('updatedAt,desc')) return 'updatedAt,desc';
      if (pageParam.sort.includes('likes,desc')) return 'likes,desc'; // 인기순
      if (pageParam.sort.includes('views,desc')) return 'views,desc'; // 조회순
      return 'updatedAt,desc'; // 기본값
  };
  const activeSort = getActiveSort();
  

 const TotalCountDisplay = showLoading ? (
    <p className="text-base font-semibold text-gray-800">로딩 중...</p>
  ) : (
    <p className="text-base font-semibold text-gray-800">
      총{' '}
      <span className="text-blue-600 font-extrabold text-lg">
        {(pageResult.totalElements || 0).toLocaleString()}
      </span>
      개
    </p>
  );
  return (
    <MainLayout>
     <div className="py-8 min-h-[calc(100vh-140px)] space-y-8">
        {/* 1. 검색창 */}
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

        {/* 불필요한 지역 태그 필터 섹션 제거 */}
        <div className="p-4 bg-white rounded-lg shadow-sm border-b border-gray-200">
            <div className="flex space-x-6 overflow-x-auto whitespace-nowrap">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`text-base font-semibold pb-1 transition-colors ${
                            selectedCategory === category
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-blue-600'
                        }`}
                        onClick={() => handleCategoryChange(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>

        {/* 정렬 및 필터 버튼 섹션 (총 개수 및 정렬) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* 정렬 버튼 영역 (상단) */}
            <div className="flex justify-between items-center p-4">
                <div className="flex items-center space-x-6">
                    {TotalCountDisplay}
                    <div className="flex space-x-4 text-sm font-medium">
                        {/* 최신순 버튼 */}
                        <button 
                            className={`${activeSort === 'updatedAt,desc' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-blue-600'} pb-1 transition`}
                            onClick={() => handleSortChange('updatedAt,desc')}
                        >
                            최신순
                        </button>
                        <span className="text-gray-400">|</span>
                        {/* 인기순 버튼 (likes 기준) */}
                        <button 
                            className={`${activeSort === 'likes,desc' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-blue-600'} pb-1 transition`}
                            onClick={() => handleSortChange('likes,desc')}
                        >
                            인기순
                        </button>
                        {/* 조회순 버튼 (views 기준) */}
                        <button 
                            className={`${activeSort === 'views,desc' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-blue-600'} pb-1 transition`}
                            onClick={() => handleSortChange('views,desc')}
                        >
                            조회순
                        </button>
                    </div>
                </div>
                
                {/* 필터 토글 버튼: Hook에서 받은 값 사용 */}
                <button
                    className={`px-4 py-2 text-sm border rounded-md shadow-sm transition flex items-center space-x-1 ${
                        isRegionPanelOpen 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={toggleRegionPanel} 
                >
                    <i className="bi bi-funnel text-base"></i>
                    <span>필터 조회</span>
                </button>
            </div>
            
            {/*  필터 패널 컴포넌트 렌더링: Hook에서 받은 props 전달 */}
            <RegionFilterPanel 
                regionTags={regionTags} 
                selectedRegions={selectedRegions} 
                isRegionPanelOpen={isRegionPanelOpen}
                handleRegionSelect={handleRegionSelect} 
                handleSelectAllRegions={handleSelectAllRegions} 
                handleDeselectAllRegions={handleDeselectAllRegions} 
            />
        </div>

        {/* 4. 목록 + 지도 (유지) */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 좌측 목록 */}
          <div className="lg:w-4/12 flex flex-col space-y-4">
            {/* 로딩 및 에러 처리 (유지) */}
            {showLoading ? (
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

          {/* 우측 지도 (유지) */}
          <div className="lg:w-8/12">
            <div className="relative border-2 border-gray-300 rounded-lg shadow-2xl h-[700px] sticky top-6 overflow-hidden">
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
                {/* 지도 렌더링 영역 */}
              </div>
          </div>
          </div>
        </div>

        {pageResult.totalPages > 1 && !hasError && (
          <AntDPagination pageResult={pageResult} handlePageClick={handlePageClick} loading={showLoading} />
        )}
      </div>
    </MainLayout>
  );
};

export default TravelPage;