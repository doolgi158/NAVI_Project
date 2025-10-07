// RegionFilterPanel.jsx
import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const RegionFilterPanel = ({ 
    regionTags, 
    selectedRegions, 
    isRegionPanelOpen, 
    handleRegionSelect, 
    handleSelectAllRegions, 
    handleDeselectAllRegions 
}) => {
    return (
        //지역 필터 패널
        <div 
            className={`overflow-hidden transition-all duration-300 ${isRegionPanelOpen ? 'max-h-96 opacity-100 p-4 border-t border-gray-200' : 'max-h-0 opacity-0'}`}
        >
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gray-700">지역 선택</h4>
                <div className="space-x-3">
                    <button
                        onClick={handleSelectAllRegions}
                        className="text-xs font-medium text-blue-500 hover:text-blue-700 transition"
                    >
                        전체선택
                    </button>
                    <button
                        onClick={handleDeselectAllRegions}
                        className="text-xs font-medium text-red-500 hover:text-red-700 transition"
                    >
                        전체취소
                    </button>
                </div>
            </div>

            {/* 지역 태그 목록 */}
            <div className="flex flex-wrap gap-2">
                {regionTags.map((tag) => {
                    const isSelected = selectedRegions.includes(tag);
                    return (
                        <button
                            key={tag}
                            className={`text-xs px-3 py-1.5 border rounded-full transition-colors ${
                                isSelected
                                    ? 'border-blue-500 bg-blue-500 text-white font-semibold'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                            onClick={() => handleRegionSelect(tag)}
                        >
                            {tag}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default RegionFilterPanel;