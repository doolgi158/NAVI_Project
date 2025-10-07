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
    regionTags, selectedCategory, handleCategoryChange, 
    handleRegionSelect, handleSelectAllRegions, handleDeselectAllRegions, 
    isRegionPanelOpen, categories
}) => {

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
                
                {/* 필터 토글 버튼 */}
                <button
                    className={`px-4 py-2 text-sm border rounded-md shadow-sm transition flex items-center space-x-1 ${
                        isRegionPanelOpen 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={toggleRegionPanel} 
                >
                    <i className="bi bi-funnel text-base"></i>
                    <span>
                        필터 조회 
                        {/* 뱃지 표시 로직 */}
                        {selectedRegions.length > 0 || pageParam.category !== '전체' ? (
                            <span className="ml-1 px-1 bg-red-500 text-white rounded-full text-xs font-bold">
                                {(
                                    selectedRegions.length + 
                                    (pageParam.category !== '전체' ? '' : 0)
                                ).toLocaleString()}
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
                activeCategory={pageParam.categoryName}
                handleCategoryChange={handleCategoryChange}
            />
        </div>
    );
};

export default TravelControls;