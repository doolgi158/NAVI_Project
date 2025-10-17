import React from 'react';
import FilterPanel from './FilterPanel.jsx';

const TravelControls = ({
  totalElements = 0,
  showLoading = false,
  activeSort = '',
  handleSortChange,
  toggleRegionPanel,
  selectedRegions = [],
  pageParam = { categoryName: '전체' },
  regionTags = [],
  handleCategoryChange,
  handleRegionSelect,
  handleSelectAllRegions,
  handleDeselectAllRegions,
  isRegionPanelOpen = false,
  categories = [],
  handleClearFilter,
}) => {
  const hasRegionFilter = (selectedRegions?.length ?? 0) > 0;
  const hasCategoryFilter =
    pageParam?.categoryName && pageParam.categoryName !== '전체';
  const isFilterActive = hasRegionFilter || hasCategoryFilter;

  const onClickFilter = () => {
    if (isRegionPanelOpen) {
      handleClearFilter?.();
      toggleRegionPanel?.();
    } else {
      toggleRegionPanel?.();
    }
  };

  const TotalCountDisplay = showLoading ? (
    <p className="text-base font-semibold text-gray-800">로딩 중...</p>
  ) : (
    <p className="text-base font-semibold text-gray-800">
      총{' '}
      <span className="text-blue-600 font-extrabold text-lg">
        {totalElements.toLocaleString()}
      </span>
      개
    </p>
  );

  const baseBtn =
    'px-4 py-2 text-sm border rounded-md shadow-sm transition-all duration-300 flex items-center  space-x-1';
  const btnDefault =
    'bg-blue-500 text-white border-gray-300 hover:bg-gray-50 hover:scale-105';
  const btnActive = 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600';
  const btnOpen = 'bg-teal-500 text-white hover:bg-teal-700';

  let filterBtnClass = btnDefault;
  if (isRegionPanelOpen) filterBtnClass = btnOpen;
  else if (isFilterActive) filterBtnClass = btnActive;

  const sortButtons = [
    { label: '최신순', value: 'updatedAt,desc' },
    { label: '인기순', value: 'likesCount,desc' },
    { label: '조회순', value: 'views,desc' },
  ];

  const selectedCategory = pageParam?.categoryName ?? '전체';
  const filterBadgeCount =
    (selectedRegions?.length ?? 0) + (hasCategoryFilter ? 1 : 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 정렬 + 필터 버튼 */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-6">
          {TotalCountDisplay}
          <div className="flex space-x-4 text-sm font-medium">
            {sortButtons.map((sort, idx) => (
              <React.Fragment key={sort.value}>
                <button
                  className={`pb-1 transition ${
                    activeSort === sort.value
                      ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                  onClick={() => handleSortChange(sort.value)}
                >
                  {sort.label}
                </button>
                {idx < sortButtons.length - 1 && (
                  <span className="text-gray-400">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 필터 버튼 */}
        <button className={`${baseBtn} ${filterBtnClass}`} onClick={onClickFilter}>
          <span className="flex items-center">
            {isRegionPanelOpen ? '필터 초기화' : '필터 선택'}
            {isFilterActive && (
              <span className="ml-2 px-2 bg-red-500 text-white rounded-full text-xs font-bold">
                {filterBadgeCount}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* ✅ 필터 패널 내부에 카테고리 포함 */}
      <FilterPanel
        regionTags={regionTags}
        selectedRegions={selectedRegions}
        isRegionPanelOpen={isRegionPanelOpen}
        handleRegionSelect={handleRegionSelect}
        handleSelectAllRegions={handleSelectAllRegions}
        handleDeselectAllRegions={handleDeselectAllRegions}
        categories={categories}
        activeCategory={selectedCategory}
        handleCategoryChange={handleCategoryChange}
      />
    </div>
  );
};

export default TravelControls;
