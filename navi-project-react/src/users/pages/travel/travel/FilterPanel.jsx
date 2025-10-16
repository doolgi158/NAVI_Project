import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const FilterPanel = ({
  // 지역 관련
  regionTags,
  selectedRegions,
  isRegionPanelOpen,
  handleRegionSelect,
  handleSelectAllRegions,
  handleDeselectAllRegions,
  // 카테고리 관련
  categories,
  activeCategory,
  handleCategoryChange,
}) => {
  const isTagSelected = (tag) => {
    if (tag.region2Cd === '전체') {
      const allSubRegions =
        regionTags
          .find((r) => r.region1Cd === tag.region1Cd)
          ?.region2s.filter((r) => r.region2Cd !== '전체')
          .map((r) => r.region2Cd) || [];
      return (
        allSubRegions.length > 0 &&
        allSubRegions.every((r2) =>
          selectedRegions.some(
            (sr) => sr.region1Cd === tag.region1Cd && sr.region2Cd === r2
          )
        )
      );
    }
    return selectedRegions.some(
      (r) => r.region1Cd === tag.region1Cd && r.region2Cd === tag.region2Cd
    );
  };

  const isAllSelected = selectedRegions.length === 17;
  if (!isRegionPanelOpen) return null;

  const getCleanCategory = (category) =>
    String(category ?? '').trim().toLowerCase();
  const cleanedActiveCategory = getCleanCategory(activeCategory);

  return (
    <div
      className={`overflow-hidden transition-all duration-300 bg-white border-t border-gray-200 ${
        isRegionPanelOpen ? 'max-h-[700px] opacity-100 p-4 pt-3' : 'max-h-0 opacity-0'
      }`}
    >
      {/* ✅ 카테고리 섹션 (상단 고정 대신 패널 내부로 이동) */}
      <div className="mb-6">
        <p className="text-base font-bold text-gray-700 mb-2 border-b pb-1">
          카테고리
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((CategoryName) => (
            <button
              key={CategoryName}
              onClick={() => handleCategoryChange(CategoryName)}
              className={`text-sm px-3 py-1.5 border rounded-full transition-colors whitespace-nowrap ${
                cleanedActiveCategory === getCleanCategory(CategoryName)
                  ? 'border-blue-500 bg-blue-500 text-white font-medium shadow-sm'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {CategoryName}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ 지역 필터 섹션 */}
      <p className="text-base font-bold text-gray-700 mb-2 border-b pb-1">지역</p>

      <div className="mb-3 flex gap-2">
        <button
          className={`text-sm px-3 py-1.5 border rounded-full transition-colors whitespace-nowrap 
            ${
              isAllSelected
                ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                : 'border-blue-500 bg-blue-500 text-white font-medium shadow-sm'
            }`}
          onClick={handleSelectAllRegions}
          disabled={isAllSelected}
        >
          <i className="bi bi-check-all mr-1 text-base"></i>
          전체 선택
        </button>
        <button
          className={`text-sm px-3 py-1.5 border rounded-full transition-colors whitespace-nowrap 
            ${
              selectedRegions.length === 0
                ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                : 'border-red-500 bg-red-500 text-white font-medium shadow-sm'
            }`}
          onClick={handleDeselectAllRegions}
          disabled={selectedRegions.length === 0}
        >
          <i className="bi bi-x-circle mr-1 text-base"></i>
          선택 해제
        </button>
      </div>

      {/* 지역 목록 */}
      <div className="space-y-3">
        {regionTags.map(({ region1Cd, region2s }) => (
          <div key={region1Cd} className="flex flex-wrap items-center gap-2">
            <button
              key={region1Cd}
              className={`flex items-center text-sm px-3 py-1.5 border rounded-full transition-colors whitespace-nowrap 
                border-stone-800 text-stone-800 font-semibold bg-gray-100 hover:bg-gray-200
              `}
              onClick={() =>
                handleRegionSelect(region2s.find((t) => t.region2Cd === '전체'))
              }
            >
              #{region1Cd}
              <i className="bi bi-chevron-right ml-1 text-xs"></i>
            </button>

            <div className="flex flex-wrap gap-2">
              {region2s
                .filter((tag) => tag.region2Cd !== '전체')
                .map((tag) => {
                  const isSelected = isTagSelected(tag);
                  return (
                    <button
                      key={`${tag.region1Cd}-${tag.region2Cd}`}
                      onClick={() => handleRegionSelect(tag)}
                      className={`text-sm px-3 py-1.5 border rounded-full transition-colors whitespace-nowrap ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500 text-white font-medium shadow-sm'
                          : 'border-stone-400 bg-white text-stone-800 hover:bg-gray-50'
                      }`}
                    >
                      #{tag.region2Cd}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterPanel;
