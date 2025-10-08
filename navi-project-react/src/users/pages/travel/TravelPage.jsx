import React, { useEffect, useCallback, useRef, useState } from 'react'; 
import 'bootstrap-icons/font/bootstrap-icons.css';
import MainLayout from '../../layout/MainLayout.jsx';
import { useNavigate } from 'react-router-dom';

// 분리된 훅 및 컴포넌트 임포트
import { useKakaoMap } from '../../../Common/hooks/useKakaoMap.jsx'; 
import { useTravelList } from '../../../Common/hooks/useTravelList.jsx'; 
import TravelCard from '../../../Common/components/travel/TravelCard.jsx'; 
import Pagination from '../../../Common/components/travel/Pagination.jsx'; 
import TravelControls from '../../../Common/components/travel/TravelControls.jsx';


const TravelPage = () => {
    const navigate = useNavigate();
    
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

        // 지역 필터 props 
        regionTags,
        selectedRegions,
        isRegionPanelOpen,
        toggleRegionPanel,
        handleRegionSelect,
        handleSelectAllRegions,
        handleDeselectAllRegions,
        categories
    } = useTravelList();

    const { isMapLoaded, updateMap, resetMap } = useKakaoMap('kakao-map-container')
    
    // 검색 입력값을 위한 로컬 상태를 사용합니다.
    const [searchText, setSearchText] = useState(pageParam.search || '');

    // 검색 input 엘리먼트 참조 
    const searchInputRef = useRef(null);
    
    // 필터(지역/카테고리) 및 검색 필터 초기화 핸들러
    const handleClearFilter = useCallback(() => {
        // 검색 필터 초기화
        setSearchText(''); 
        handleSearch(''); // 빈 문자열로 검색하여 검색 필터를 해제하고 전체 목록을 가져옵니다.
        
        // 지역 및 카테고리 필터 초기화
        handleDeselectAllRegions();
        handleCategoryChange('전체');

    }, [handleSearch, handleDeselectAllRegions, handleCategoryChange]);

    // 검색 실행 핸들러: 로컬 상태의 검색어를 훅으로 전달합니다.
    const handleLocalSearchSubmit = useCallback(() => {
        const trimmedSearchText = searchText.trim();

        if (trimmedSearchText) {
            // 검색어가 있으면 해당 내용으로 검색 요청
            handleSearch(trimmedSearchText);
        } else {
            // 검색어가 비어있으면 검색 필터 해제 (전체 목록 표시)
            // handleSearch('')는 URL에서 search 파라미터를 제거합니다.
            handleSearch(''); 
        }
    }, [handleSearch, searchText]);
    
    //  검색 필드 초기화 핸들러: 로컬 상태의 입력 필드를 비우고, 즉시 검색 필터 해제 요청을 보냅니다. 
    const handleClearSearchText = useCallback(() => {
        setSearchText('');
        searchInputRef.current.focus(); 
        
        // 검색 필터를 해제하여 전체 목록을 보여줍니다.
        handleSearch(''); 
        
    }, [handleSearch]);

    // 카드 클릭 핸들러
    const handleCardClick = useCallback((item) => {
        // 상세 페이지로 이동하기 전에 현재 페이지 번호와 스크롤 위치를 저장.
        sessionStorage.setItem('travelListPage', pageParam.page.toString());
        sessionStorage.setItem('travelListScrollY', window.scrollY.toString());

        setSelectedItem(item); 
        navigate(`/travel/detail/${item.travelId}`);
    }, [navigate, pageParam.page, setSelectedItem]);
    
    // 마우스 호버/이탈 핸들러 
    const handleCardHover = useCallback((item) => {
        setHoveredItem(item);
    }, [setHoveredItem]);

    const handleCardLeave = useCallback(() => {
        setHoveredItem(null);
    }, [setHoveredItem]);
    
    // Enter 키로 검색 실행
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handleLocalSearchSubmit();
        }
    }, [handleLocalSearchSubmit]);


    useEffect(() => {
        const savedScroll = sessionStorage.getItem('travelListScrollY');
        if (savedScroll) {
            window.scrollTo(0, parseInt(savedScroll, 10));
            sessionStorage.removeItem('travelListScrollY');
        }
        
        // pageParam.search가 URL에서 변경되면 로컬 상태를 업데이트합니다.
        setSearchText(pageParam.search || '');
    }, [pageParam.search]);


    // 지도 표시 및 초기화 로직 (이하 동일)
    useEffect(() => {
        if (!isMapLoaded) return;
        
        // 1. 검색 결과가 없는 경우: 지도 초기화
        if (pageResult.totalElements === 0 && !showLoading) {
            console.log("[KakaoMap Debug] Total elements is 0. Resetting map markers/overlays.");
            resetMap();
            setSelectedItem(null); 
            setHoveredItem(null);
            return;
        }

        // 2. 검색 결과가 있는 경우: 지도 업데이트
        const itemToDisplay = hoveredItem || selectedItem;
        
        if (itemToDisplay) { 
            updateMap(itemToDisplay); 
        } else if (pageResult.dtoList && pageResult.dtoList.length > 0) {
            // 목록은 있으나 선택된 항목이 없다면 목록의 첫 번째 항목을 표시합니다.
            updateMap(pageResult.dtoList[0]);
        }
    }, [isMapLoaded, pageResult.totalElements, pageResult.dtoList, selectedItem, hoveredItem, updateMap, resetMap, setSelectedItem, setHoveredItem, showLoading]); 

    return (
        <MainLayout>
            <div className="py-8 min-h-[calc(100vh-140px)] space-y-8">
                {/* 1. 검색창 */}
                <div className="flex justify-center">
                    <div className="w-full max-w-3xl flex shadow-lg rounded-lg overflow-hidden border border-blue-300">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="여행지를 검색하세요. (예: 비자림, 한라산)"
                            className="w-full p-4 text-lg border-none focus:outline-none placeholder-gray-400"
                            // 로컬 상태(searchText)를 사용한 Controlled Input
                            value={searchText} 
                            onChange={(e) => setSearchText(e.target.value)} 
                            onKeyDown={handleKeyPress}
                        />
                        
                        {/* 검색어 초기화 버튼 (searchText가 있을 때만 표시) */}
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

                <TravelControls 
                    totalElements={pageResult.totalElements}
                    showLoading={showLoading}
                    activeSort={getActiveSort}
                    handleSortChange={handleSortChange}
                    toggleRegionPanel={toggleRegionPanel}
                    selectedRegions={selectedRegions}
                    pageParam={pageParam}
                    // FilterPanel에 전달할 props
                    regionTags={regionTags}
                    isRegionPanelOpen={isRegionPanelOpen}
                    handleRegionSelect={handleRegionSelect}
                    handleSelectAllRegions={handleSelectAllRegions}
                    handleDeselectAllRegions={handleDeselectAllRegions}
                    categories={categories}
                    selectedCategory={pageParam.categoryName}
                    handleCategoryChange={handleCategoryChange}
                    // 추가된 필터 초기화 prop
                    handleClearFilter={handleClearFilter}
                />

                {/* 4. 목록 + 지도 */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* 좌측 목록 */}
                    <div className="lg:w-4/12 flex flex-col space-y-4">
                        {/* 로딩 및 에러 처리 (유지) */}
                        {showLoading ? (
                            <div className="p-12 text-center text-gray-500 bg-white rounded-lg shadow-md min-h-[400px] flex flex-col items-center justify-center">
                                <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
                                    <TravelCard
                                        key={item.travelId}
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

                    {/* 우측 지도  */}
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

                {pageResult.totalPages > 1 && !hasError && (
                    <Pagination pageResult={pageResult} handlePageClick={handlePageClick} loading={showLoading} />
                )}
            </div>
        </MainLayout>
    );
};

export default TravelPage;