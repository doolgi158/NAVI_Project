import { useState, useCallback, useMemo } from 'react';

// ⭐️ 지역 분류 정의 (유지)
const ALL_REGIONS = {
    '제주시': ['전체', '제주시내', '애월', '한림', '한경', '조천', '구좌', '우도'],
    '서귀포시': ['전체', '성산', '서귀포시내', '대정', '안덕', '중문', '남원', '표선']
};

// 모든 지역 태그를 플랫 리스트로 만듭니다. (유지)
const REGION_TAGS = Object.entries(ALL_REGIONS).flatMap(([region1Cd, region2s]) =>
    region2s.map(region2Cd => ({
        region1Cd: region1Cd,
        region2Cd: region2Cd
    }))
).filter(tag => tag.region2Cd !== '전체'); // "전체" 태그는 제외하고 필터링에 사용할 태그만 만듭니다.


export const useTravelListFilter = (onFilterChange) => {
    // selectedRegions 상태는 { region1Cd: '제주시', region2Cd: '애월읍' } 형태의 객체 배열로 관리 
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [isRegionPanelOpen, setIsRegionPanelOpen] = useState(false);

    // 태그를 선택/해제하는 로직 (유지 및 onFilterChange 호출 로직 강화)
    const handleRegionSelect = useCallback((tag) => {
        setSelectedRegions(prev => {
            const isSelected = prev.some(r => r.region1Cd === tag.region1Cd && r.region2Cd === tag.region2Cd);
            let newRegions;

            if (tag.region2Cd === '전체') {
                // '제주시 전체', '서귀포시 전체' 선택/해제 로직 
                const allSubRegions = ALL_REGIONS[tag.region1Cd].filter(r => r !== '전체');
                // 현재 선택된 목록 중, 해당 region1Cd의 모든 소분류가 선택되었는지 확인
                const isAllSelected = allSubRegions.every(r2 => prev.some(r => r.region1Cd === tag.region1Cd && r.region2Cd === r2));

                if (isAllSelected) {
                    newRegions = prev.filter(r => r.region1Cd !== tag.region1Cd);
                } else {
                    // 기존에 선택된 다른 지역들은 유지하고, 현재 region1Cd의 모든 소분류를 추가
                    const existingFiltered = prev.filter(r => r.region1Cd !== tag.region1Cd);
                    const toAdd = allSubRegions.map(r2 => ({ region1Cd: tag.region1Cd, region2Cd: r2 }));
                    newRegions = [...existingFiltered, ...toAdd];
                }
            } else {
                // 개별 소분류 선택/해제 로직
                if (isSelected) {
                    newRegions = prev.filter(r => !(r.region1Cd === tag.region1Cd && r.region2Cd === tag.region2Cd));
                } else {
                    newRegions = [...prev, tag];
                }
            }

            // 중복 제거 및 상태 업데이트
            const uniqueRegions = Array.from(new Set(newRegions.map(JSON.stringify))).map(JSON.parse);

            // 필터 변경 콜백 호출
            if (onFilterChange) {
                // 변경된 필터 배열을 직접 전달
                onFilterChange(uniqueRegions);
            }
            return uniqueRegions;
        });
    }, [onFilterChange]);

    const toggleRegionPanel = useCallback(() => {
        setIsRegionPanelOpen(prev => !prev);
    }, []);

    //모든 지역 선택 핸들러
    const handleSelectAllRegions = useCallback(() => {
        if (onFilterChange) {
            onFilterChange(REGION_TAGS);
        }
        setSelectedRegions(REGION_TAGS);
    }, [onFilterChange]);

    //모든 지역 선택 해제 핸들러
    const handleDeselectAllRegions = useCallback(() => {
        if (onFilterChange) {
            onFilterChange([]); // 빈 배열 전달
        }
        setSelectedRegions([]);
    }, [onFilterChange]);

    // UI 렌더링을 위해 지역을 계층적으로 재구성 
    const categorizedTags = useMemo(() => {
        return Object.entries(ALL_REGIONS).map(([region1Cd, region2s]) => ({
            region1Cd,
            region2s: region2s.map(region2Cd => ({
                region1Cd,
                region2Cd
            }))
        }));
    }, []);

    //API 호출에 필요한 쿼리 파라미터 문자열 생성 
    const filterQuery = useMemo(() => {
        if (selectedRegions.length === 0 || selectedRegions.length === REGION_TAGS.length) {
            // 필터가 적용되지 않은 경우 
            return { region2Name: [] };
        }

        // region2Cd 목록만 추출
        const region2List = Array.from(new Set(selectedRegions.map(r => r.region2Cd)));

        return {
            region2Name: region2List  // 예: ['애월', '한림', '성산']
        };
    }, [selectedRegions]);


    return {
        regionTags: categorizedTags,
        selectedRegions,
        isRegionPanelOpen,
        toggleRegionPanel,
        handleRegionSelect,
        handleSelectAllRegions,
        handleDeselectAllRegions,
        filterQuery
    };
};