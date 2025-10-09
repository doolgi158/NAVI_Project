import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const FilterPanel = ({ 
	//지역
	regionTags,
	selectedRegions, 
	isRegionPanelOpen, 
	handleRegionSelect, 
	handleSelectAllRegions, 
	handleDeselectAllRegions,
	//카테고리
	categories,
	activeCategory,
	handleCategoryChange
}) => {
	//  선택 여부 확인 함수
	const isTagSelected = (tag) => {
		if (tag.region2Cd === '전체') {
			const allSubRegions = regionTags.find(r => r.region1Cd === tag.region1Cd)?.region2s.filter(r => r.region2Cd !== '전체').map(r => r.region2Cd) || [];
			return allSubRegions.length > 0 && 
						 allSubRegions.every(r2 => selectedRegions.some(sr => sr.region1Cd === tag.region1Cd && sr.region2Cd === r2));
		}
		return selectedRegions.some(r => r.region1Cd === tag.region1Cd && r.region2Cd === tag.region2Cd);
	};
	
	// 전체 지역이 선택되었는지 확인 
	const isAllSelected = selectedRegions.length === 17; 

	// 패널이 닫혀 있으면 렌더링하지 않거나 숨김
	if (!isRegionPanelOpen) {
        return null; 
    }
    
    // ⭐️ [추가된 로직] 안전한 카테고리 비교를 위한 함수 정의
    // activeCategory가 null/undefined일 경우를 대비하고, 숨겨진 공백 문자를 제거하여 비교의 정확도를 높입니다.
    const getCleanCategory = (category) => {
        // null 또는 undefined에 대해 빈 문자열로 안전하게 처리
        if (category === null || typeof category === 'undefined') {
            return '';
        }
        // 문자열로 변환 후, 양 끝의 공백을 제거하고 소문자화하여 비교
        return String(category).trim().toLowerCase();
    };
    
    // 현재 활성화된 카테고리의 클린 버전
    const cleanedActiveCategory = getCleanCategory(activeCategory);

	return (
		<div 
			// ⭐️ 조건부 클래스 변경: isRegionPanelOpen을 사용하여 패널 열림/닫힘 상태를 제어합니다.
			className={`overflow-hidden transition-all duration-300 bg-white border-t border-gray-200 ${isRegionPanelOpen ? 'max-h-[500px] opacity-100 p-4 pt-3' : 'max-h-0 opacity-0'}`}
		>
			{/* 카테고리 필터 섹션 */}
			<div className="mb-4">
				<p className="text-base font-bold text-gray-700 mb-2 border-b pb-1">카테고리</p>
				<div className="flex flex-wrap gap-2">
					{categories.map((CategoryName) => (
						<button
							key={CategoryName}
							onClick={() => handleCategoryChange(CategoryName)}
							className={`text-sm px-3 py-1.5 border rounded-full transition-colors whitespace-nowrap ${
								// ⭐️ 수정된 비교 로직 적용: getCleanCategory 함수를 사용하여 안전하게 비교합니다.
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
		
			{/* 지역 필터 헤더 */}
			<p className="text-base font-bold text-gray-700 mb-2 border-b pb-1">지역</p>

			{/* 전체 선택/해제 버튼 섹션 */}
			<div className='mb-3 flex gap-2'>
				<button
					className={`text-sm px-3 py-1.5 border rounded-full transition-colors whitespace-nowrap 
						${isAllSelected ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50' : 'border-blue-500 bg-blue-500 text-white font-medium shadow-sm'}
					`}
					onClick={handleSelectAllRegions}
					disabled={isAllSelected}
				>
					<i className="bi bi-check-all mr-1 text-base"></i>
					전체 선택
				</button>
				<button
					className={`text-sm px-3 py-1.5 border rounded-full transition-colors whitespace-nowrap 
						${selectedRegions.length === 0 ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50' : 'border-red-500 bg-red-500 text-white font-medium shadow-sm'}
					`}
					onClick={handleDeselectAllRegions}
					disabled={selectedRegions.length === 0}
				>
					<i className="bi bi-x-circle mr-1 text-base"></i>
					선택 해제
				</button>
			</div>


			{/* 지역 태그 목록 (대분류별 그룹핑) */}
			<div className="space-y-3">
				{regionTags.map(({ region1Cd, region2s }) => (
					<div key={region1Cd} className="flex flex-wrap items-center gap-2">
						
						{/* 대분류 버튼 (예: #제주시, #서귀포시) */}
						<button
							key={region1Cd}
							className={`flex items-center text-sm px-3 py-1.5 border rounded-full transition-colors whitespace-nowrap 
								border-stone-800 text-stone-800 font-semibold bg-gray-100 hover:bg-gray-200
							`}
							// 대분류를 선택하면 해당 지역의 전체가 선택되도록 '전체' 태그 로직을 호출합니다.
							onClick={() => handleRegionSelect(region2s.find(t => t.region2Cd === '전체'))}
						>
							#{region1Cd}
							<i className="bi bi-chevron-right ml-1 text-xs"></i>
						</button>

						{/* 소분류 버튼 목록 (예: #제주시내, #애월) */}
						<div className="flex flex-wrap gap-2">
							{/* '전체' 태그는 대분류 버튼에서 처리했으므로 소분류에서는 제외하고 렌더링 */}
							{region2s.filter(tag => tag.region2Cd !== '전체').map(tag => {
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
