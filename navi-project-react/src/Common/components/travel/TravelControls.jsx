import React from 'react';
import FilterPanel from './FilterPanel.jsx'; // FilterPanel 임포트

const TravelControls = ({ 
    totalElements, 
    showLoading, 
    activeSort, 
    handleSortChange, 
    toggleRegionPanel, 
    selectedRegions, 
    pageParam, 
    // FilterPanel props
    regionTags, handleCategoryChange, 
    handleRegionSelect, handleSelectAllRegions, handleDeselectAllRegions, 
    isRegionPanelOpen, categories,
    
    // TravelPage로부터 전달받은 prop
    handleClearFilter // 필터 초기화 함수
}) => {

    // 필터 적용 여부를 확인하는 로직 (뱃지 표시에 사용)
    // pageParam.category가 '전체'가 아니거나, selectedRegions에 선택된 지역이 있으면 필터 적용으로 간주
    const isFilterActive = selectedRegions.length > 0 || pageParam.category !== '전체';

    // 필터 버튼 클릭 시 실행할 핸들러 (로직 전체 변경)
    const handleFilterButtonClick = () => {
        if (isRegionPanelOpen) {
            // 패널이 열려 있을 때: 필터 초기화 후 패널 닫기
            handleClearFilter();
            toggleRegionPanel(); // 패널을 닫습니다.
        } else {
            // 패널이 닫혀 있을 때: 패널 열기
            toggleRegionPanel();
        }
    };

    // 패널이 닫혀 있으면 "필터 선택" 표시
    const buttonText = isRegionPanelOpen ? '필터 초기화' : '필터 선택';


    const TotalCountDisplay = showLoading ? (
        <p className="text-base font-semibold text-gray-800">로딩 중...</p>
    ) : (
        <p className="text-base font-semibold text-gray-800">
            총{' '}
            <span className="text-blue-600 font-extrabold text-lg">
                {(totalElements || 0).toLocaleString()}
            </span>
            개
        </p>
    );
    // 버튼 색상을 결정하는 클래스 로직
    const buttonColorClasses = isRegionPanelOpen
        ? 'bg-teal-500 text-white hover:bg-teal-800' // 패널 열림 = 필터 초기화 상태 
        : isFilterActive
            ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' // 필터 적용됨 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'; // 기본 상태
            

    return (
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
                            className={`${activeSort === 'likesCount,desc' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-blue-600'} pb-1 transition`}
                            onClick={() => handleSortChange('likesCount,desc')}
                        >
                            인기순
                        </button>
                        <span className="text-gray-400">|</span>
                        {/* 조회순 버튼 (views 기준) */}
                        <button 
                            className={`${activeSort === 'views,desc' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-blue-600'} pb-1 transition`}
                            onClick={() => handleSortChange('views,desc')}
                        >
                            조회순
                        </button>
                    </div>
                </div>
                
                {/* 필터 토글 버튼 (수정됨) */}
                <button
                    // 버튼 색상 클래스 적용
                    className={`px-4 py-2 text-sm border rounded-md shadow-sm transition flex items-center space-x-1 ${buttonColorClasses}`}
                    onClick={handleFilterButtonClick}
                >
                    <span>
                        {buttonText}
                        
                        {/* 뱃지 표시 로직 */}
                        {isFilterActive ? (
                            <span className="ml-1 px-1 bg-red-500 text-white rounded-full text-xs font-bold">
                                {
                                    // 지역 필터 개수 + 카테고리 필터 적용 여부 (적용되었으면 1, 아니면 0)
                                    (
                                        selectedRegions.length + 
                                        (pageParam.category !== '전체' ? '' : 0) // 카테고리 필터가 '전체'가 아니면 1을 더합니다.
                                    ).toLocaleString()
                                }
                            </span>
                        ) : null}
                    </span>
                </button>
            </div>
            
            {/* 필터 패널 컴포넌트 렌더링 */}
            <FilterPanel 
                regionTags={regionTags} 
                selectedRegions={selectedRegions} 
                isRegionPanelOpen={isRegionPanelOpen}
                handleRegionSelect={handleRegionSelect} 
                handleSelectAllRegions={handleSelectAllRegions} 
                handleDeselectAllRegions={handleDeselectAllRegions} 
                categories={categories}
                // *수정*: pageParam.category는 카테고리 '값' (예: "SIGHTSEEING")을 담고 있으므로 이를 selectedCategory로 전달
                selectedCategory={pageParam.category} 
                handleCategoryChange={handleCategoryChange}
            />
        </div>
    );
};

export default TravelControls;