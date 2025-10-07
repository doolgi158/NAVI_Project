// useRegionFilter.jsx
import { useState, useCallback } from 'react';

// 지역 태그 목록 (하드코딩)
const REGION_TAGS = ['제주시', '서귀포시', '동부', '서부', '남부', '북부'];

export const useRegionFilter = (onFilterChange) => {
    // 기본값: 모든 지역이 선택된 상태
    const [selectedRegions, setSelectedRegions] = useState(REGION_TAGS); 
    const [isRegionPanelOpen, setIsRegionPanelOpen] = useState(false);

    // 패널 열기/닫기 토글 함수
    const toggleRegionPanel = useCallback(() => {
        setIsRegionPanelOpen(prev => !prev);
    }, []);

    // 지역 태그 선택/해제 핸들러
    const handleRegionSelect = useCallback((region) => {
        setSelectedRegions(prev => {
            let newRegions;
            if (prev.includes(region)) {
                // 해제
                newRegions = prev.filter(r => r !== region);
            } else {
                // 선택
                newRegions = [...prev, region];
            }
            
            // 필터 변경 시 콜백 함수 실행 (TravelPage의 pageParam 변경 유도)
            if (onFilterChange) {
                onFilterChange(newRegions);
            }
            return newRegions;
        });
    }, [onFilterChange]);

    // 전체 선택 핸들러
    const handleSelectAllRegions = useCallback(() => {
        setSelectedRegions(REGION_TAGS);
        if (onFilterChange) {
            onFilterChange(REGION_TAGS);
        }
    }, [onFilterChange]);

    // 전체 취소 핸들러
    const handleDeselectAllRegions = useCallback(() => {
        setSelectedRegions([]);
        if (onFilterChange) {
            onFilterChange([]);
        }
    }, [onFilterChange]);

    return {
        regionTags: REGION_TAGS, // 지역 목록
        selectedRegions, // 현재 선택된 지역
        isRegionPanelOpen, // 패널 확장 상태
        toggleRegionPanel, // 패널 토글 함수
        handleRegionSelect, // 지역 선택/해제 함수
        handleSelectAllRegions, // 전체 선택 함수
        handleDeselectAllRegions, // 전체 취소 함수
    };
};