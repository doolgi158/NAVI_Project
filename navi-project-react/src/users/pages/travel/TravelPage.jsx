import React, { useEffect, useCallback, useRef, useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MainLayout from '../../layout/MainLayout.jsx';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // ✅ Redux에서 로그인 사용자 정보 불러옴
import api from '../../../common/api/naviApi.js';
import { useKakaoMap } from '../../../common/hooks/useKakaoMap.jsx';
import { useTravelList } from '../../../common/hooks/useTravelList.jsx';
import TravelCard from '../../../common/components/travel/TravelCard.jsx';
import Pagination from '../../../common/components/travel/Pagination.jsx';
import TravelControls from '../../../common/components/travel/TravelControls.jsx';

const TravelPage = ({ user }) => {
  const navigate = useNavigate();

  /** ✅ Redux store에서 로그인 정보 가져오기 */
  const reduxUser = useSelector((state) => state.login);

  /** ✅ userId 확인 (prop 우선, 없으면 Redux) */
  const userId = user?.username || reduxUser?.username || null;

  /** ✅ 정렬 초기 복원 */
  useEffect(() => {
    const savedSort = sessionStorage.getItem('travelListSort');
    if (savedSort && savedSort !== pageParam?.sort) {
      handleSortChange(savedSort);
    }
  }, []); // 최초 1회 실행

  /** ✅ 토큰 재적용 확인 */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  /** ✅ 사용자 ID 기반으로 훅 초기화 */
  const {
    pageResult,
    pageParam,
    showLoading,
    hasError,
    selectedItem,
    hoveredItem,
    setSelectedItem,
    setHoveredItem,
    handlePageClick,
    handleSortChange,
    handleCategoryChange,
    handleSearch,
    getActiveSort,
    regionTags,
    selectedRegions,
    isRegionPanelOpen,
    toggleRegionPanel,
    handleRegionSelect,
    handleSelectAllRegions,
    handleDeselectAllRegions,
    categories,
  } = useTravelList(userId);

  /** ✅ 지도 훅 */
  const { isMapLoaded, updateMap, resetMap } = useKakaoMap('kakao-map-container');

  const [searchText, setSearchText] = useState(pageParam?.search || '');
  const searchInputRef = useRef(null);

  /** ✅ 필터 초기화 */
  const handleClearFilter = useCallback(() => {
    setSearchText('');
    handleSearch('');
    handleDeselectAllRegions();
    handleCategoryChange('전체');
  }, [handleSearch, handleDeselectAllRegions, handleCategoryChange]);

  /** ✅ 검색 처리 */
  const handleLocalSearchSubmit = useCallback(() => {
    const trimmed = searchText.trim();
    handleSearch(trimmed || '');
  }, [handleSearch, searchText]);

  const handleClearSearchText = useCallback(() => {
    setSearchText('');
    searchInputRef.current?.focus();
    handleSearch('');
  }, [handleSearch]);

  /** ✅ 상세페이지 이동 */
  const handleCardClick = useCallback(
    (item) => {
      sessionStorage.setItem('travelListPage', pageParam?.page?.toString() || '1');
      sessionStorage.setItem('travelListScrollY', window.scrollY.toString());
      sessionStorage.setItem('travelListSort', pageParam?.sort?.toString() || '');
      sessionStorage.setItem('travelListSearch', pageParam?.search || '');
      sessionStorage.setItem('travelListCategory', pageParam?.categoryName || '전체');
      sessionStorage.setItem('travelListRegions', JSON.stringify(selectedRegions || []));
      sessionStorage.setItem('travelLastViewedId', item.travelId.toString());
      setSelectedItem(item);
      navigate(`/travel/detail/${item.travelId}`);
    },
    [navigate, pageParam, selectedRegions, setSelectedItem]
  );

  /** ✅ 호버 이벤트 */
  const handleCardHover = useCallback((item) => setHoveredItem(item), [setHoveredItem]);
  const handleCardLeave = useCallback(() => setHoveredItem(null), [setHoveredItem]);
  const handleKeyPress = useCallback(
    (e) => e.key === 'Enter' && handleLocalSearchSubmit(),
    [handleLocalSearchSubmit]
  );

  /** ✅ 스크롤 복원 */
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('travelListScrollY');
    if (savedScroll) {
      setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 100);
    }
  }, []);

  /** ✅ 지도 표시 로직 */
  useEffect(() => {
    if (!isMapLoaded) return;
    if (pageResult.totalElements === 0 && !showLoading) {
      resetMap();
      setSelectedItem(null);
      setHoveredItem(null);
      return;
    }

    const itemToDisplay = hoveredItem || selectedItem;
    if (itemToDisplay) updateMap(itemToDisplay);
    else if (pageResult.dtoList?.length > 0) updateMap(pageResult.dtoList[0]);
  }, [
    isMapLoaded,
    pageResult.totalElements,
    pageResult.dtoList,
    selectedItem,
    hoveredItem,
    updateMap,
    resetMap,
    setSelectedItem,
    setHoveredItem,
    showLoading,
  ]);

  return (
    <MainLayout>
      <div className="py-8 min-h-[calc(100vh-140px)] space-y-8">
       

        {/* ✅ 검색창 */}
        <div className="flex justify-center">
          <div className="w-full max-w-3xl flex shadow-lg rounded-lg overflow-hidden border border-blue-300">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="여행지를 검색하세요. (예: 비자림, 한라산)"
              className="w-full p-4 text-lg border-none focus:outline-none placeholder-gray-400"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            {searchText && (
              <button
                className="text-gray-500 hover:text-gray-700 px-3 transition bg-white"
                onClick={handleClearSearchText}
                title="검색어 초기화"
              >
                <i className="bi bi-x-lg text-lg"></i>
              </button>
            )}
            <button
              className="bg-blue-500 text-white px-6 text-lg hover:bg-blue-600 transition flex items-center justify-center"
              onClick={handleLocalSearchSubmit}
            >
              <i className="bi bi-search text-xl"></i>
            </button>
          </div>
        </div>

        {/* ✅ 필터 & 정렬 */}
        <TravelControls
          totalElements={pageResult?.totalElements || 0}
          showLoading={showLoading}
          activeSort={getActiveSort}
          handleSortChange={handleSortChange}
          toggleRegionPanel={toggleRegionPanel}
          selectedRegions={selectedRegions || []}
          pageParam={pageParam || { categoryName: '전체' }}
          regionTags={regionTags || []}
          isRegionPanelOpen={isRegionPanelOpen}
          handleRegionSelect={handleRegionSelect}
          handleSelectAllRegions={handleSelectAllRegions}
          handleDeselectAllRegions={handleDeselectAllRegions}
          categories={categories || []}
          selectedCategory={pageParam?.categoryName || '전체'}
          handleCategoryChange={handleCategoryChange}
          handleClearFilter={handleClearFilter}
        />

        {/* ✅ 목록 & 지도 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 좌측 리스트 */}
          <div className="lg:w-4/12 flex flex-col space-y-4">
            {showLoading ? (
              <div className="p-12 text-center text-gray-500 bg-white rounded-lg shadow-md min-h-[400px] flex flex-col items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-lg font-medium">데이터를 불러오는 중입니다...</p>
              </div>
            ) : hasError || pageResult.dtoList?.length === 0 ? (
              <div className="p-12 text-center text-red-500 border border-red-200 rounded-lg bg-red-50 font-bold text-lg shadow-md min-h-[400px] flex flex-col items-center justify-center">
                찾을 수 없습니다
                <p className="text-sm font-normal mt-2 text-red-400">검색 결과가 없거나 데이터를 불러오는 데 실패했습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pageResult.dtoList.map((item) => (
                  <TravelCard
                    key={item.travelId}
                    user={{ username: userId }} // ✅ 명시적으로 user 전달
                    item={item}
                    onClick={handleCardClick}
                    isSelected={selectedItem && selectedItem.travelId === item.travelId}
                    onMouseEnter={() => handleCardHover(item)}
                    onMouseLeave={handleCardLeave}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 우측 지도 */}
          <div className="lg:w-8/12">
            <div className="relative border-2 border-gray-300 rounded-lg shadow-2xl h-[700px] sticky top-6 overflow-hidden">
              <div id="kakao-map-container" style={{ width: '100%', height: '100%' }}>
                {!selectedItem && !hoveredItem && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
                    <span className="text-white text-2xl font-semibold p-4 text-center">
                      {pageResult.totalElements === 0 && !showLoading
                        ? '적용된 필터/검색 조건에 해당하는 여행지가 없습니다.'
                        : '목록에서 항목을 선택하거나 마우스를 올려 지도를 확인하세요.'}
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

        {/* ✅ 페이지네이션 */}
        {pageResult.totalPages > 1 && !hasError && (
          <Pagination pageResult={pageResult} handlePageClick={handlePageClick} loading={showLoading} />
        )}
      </div>
    </MainLayout>
  );
};

export default TravelPage;
