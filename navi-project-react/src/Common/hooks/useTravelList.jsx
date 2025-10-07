import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useTravelListFilter } from './useTravelListFilter.jsx'; // 기존 훅 임포트

// ✅ 카테고리 목록 정의 (유지)
const categories = ['전체', '관광지', '음식점', '쇼핑'];

// ✅ 여행지 목록 API 호출 함수 (유지)
const getTravelData = async (domain, pageParam, filterQuery) => {
	const apiUrl = `/api/${domain}`;
	const sortArray = pageParam.sort.split(',');

	const sortParams = [];
	for (let i = 0; i < sortArray.length; i += 2) {
		if (i + 1 < sortArray.length) {
			sortParams.push(`${sortArray[i]},${sortArray[i+1]}`);
		}
	}
	
	let queryString = `?page=${pageParam.page - 1}&size=${pageParam.size}`;
	queryString += sortParams.map(s => `&sort=${s}`).join('');

	if (filterQuery.region2Name && filterQuery.region2Name.length > 0) {
		// 쉼표(CSV) 구분 방식으로 인코딩하여 전송
		const encodedRegions = filterQuery.region2Name.map(region => encodeURIComponent(region)).join(',');
		queryString += `&region2Name=${encodedRegions}`;
	}
	
	// ⭐️ 수정된 부분: 파라미터 이름을 다시 'categoryName'으로 변경했습니다.
	if (pageParam.categoryName && pageParam.categoryName !== '전체') {
		const encodedCategoryName = encodeURIComponent(pageParam.categoryName);
		queryString += `&categoryName=${encodedCategoryName}`;
	}

	try {
		const response = await axios.get(apiUrl + queryString); 
		return response.data;
	} catch (error) {
		console.error('여행지 목록 로딩 실패:', error.message);
		throw error;
	}
};


export const useTravelList = () => {
	const getInitialPage = () => {
		const savedPage = sessionStorage.getItem('travelListPage');
		return savedPage ? parseInt(savedPage, 10) : 1;
	};

	const [pageResult, setPageResult] = useState({
		dtoList: [],
		totalElements: 0,
		totalPages: 0,
		page: 1,
		size: 10,
		startPage: 1,
		endPage: 1,
		pageList: [],
	});
	
	// pageParam 초기값 설정
	const [pageParam, setPageParam] = useState({ 
		page: getInitialPage(), 
		size: 10,
		sort: 'contentsCd,asc,updatedAt,desc',
		categoryName: categories[0] // 현재 선택된 카테고리 이름 (예: '전체')
	});
	
	const isLoadingRef = useRef(false);
	const [showLoading, setShowLoading] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [selectedItem, setSelectedItem] = useState(null);
	const [hoveredItem, setHoveredItem] = useState(null);

	// 지역 필터 변경 시 pageParam 업데이트 로직
	const handleRegionFilterChange = useCallback((newRegions) => {
		// 필터가 변경되면 무조건 1페이지로 돌아가도록 강제합니다.
		// 이 변경이 fetchTravelList를 트리거하게 됩니다.
		setPageParam(prev => ({ ...prev, page: 1 }));
	}, []);

	// 지역 필터 훅 사용
	const regionFilterProps = useTravelListFilter(handleRegionFilterChange);
	

	// 여행지 목록 불러오기
	const fetchTravelList = useCallback(() => {
		if (isLoadingRef.current) return; 

		isLoadingRef.current = true;
		setShowLoading(true);
		setHasError(false);

		// API 호출 시 filterQuery를 사용합니다.
		getTravelData('travel', pageParam, regionFilterProps.filterQuery)
			.then((data) => {
				let fetchedList = data.content || [];
				
				const currentPage = data.number + 1;
				const startBlock = Math.floor(data.number / 10) * 10 + 1;
				const endBlock = Math.min(data.totalPages, startBlock + 9);
				const pageList = Array.from({ length: endBlock - startBlock + 1 }, (_, i) => startBlock + i);

				setPageResult({
					dtoList: fetchedList, 
					totalElements: data.totalElements, 
					totalPages: data.totalPages,
					page: currentPage,
					size: data.size,
					startPage: startBlock,
					endPage: endBlock,
					pageList,
				});

				setSelectedItem((prev) => {
					const isFirstPage = pageParam.page === 1;
					const existsInNewList = prev ? fetchedList.some((it) => it.travelId === prev.travelId) : false;
					// 기존 항목이 새 목록에 없으면, 새 목록의 첫 번째 항목을 선택합니다.
					if (!existsInNewList || isFirstPage) { 
						return fetchedList[0] || null;
					}
					return prev;
				});
				setHoveredItem(null); 
			})
			.catch(() => {
				setHasError(true);                
			})
			.finally(() => {
				isLoadingRef.current = false;
				setShowLoading(false);               
			});
	}, [pageParam, regionFilterProps.filterQuery]);

	useEffect(() => {
		fetchTravelList();
	}, [fetchTravelList]);
	
	// 페이지 클릭 핸들러
	const handlePageClick = useCallback((pageNumber) => {
		if (!showLoading && pageNumber > 0 && pageNumber <= pageResult.totalPages) {
			sessionStorage.removeItem('travelListPage');
			setPageParam((prev) => ({ ...prev, page: pageNumber }));
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}, [showLoading, pageResult.totalPages]);

	// 정렬 변경 핸들러 함수
	const handleSortChange = useCallback((sortType) => {
		const secondarySort = sortType; // 이제 sortType이 'updatedAt,desc' 형태라고 가정
		const newSort = `contentsCd,asc,${secondarySort}`;
		
		setPageParam((prev) => ({ ...prev, page: 1, sort: newSort }));
		sessionStorage.removeItem('travelListPage');
	}, []);

	// 카테고리 변경 핸들러
	const handleCategoryChange = useCallback((categoryName) => {
		setPageParam((prev) => ({ ...prev, page: 1, categoryName: categoryName }));
	}, []);
	
	// 정렬 속성 추출
	const getActiveSort = pageParam.sort.includes('likes,desc') ? 'likes,desc' : 
						 pageParam.sort.includes('views,desc') ? 'views,desc' : 
						 'updatedAt,desc';

	return {
		// 데이터 및 상태
		pageResult,
		pageParam,
		showLoading,
		hasError,
		selectedItem,
		hoveredItem,
		categories,

		// 현재 선택된 카테고리 값을 UI에 전달
		activeCategory: pageParam.categoryName,

		// 핸들러
		handlePageClick,
		handleSortChange,
		handleCategoryChange,
		setSelectedItem,
		setHoveredItem,
		getActiveSort,
		
		// 지역 필터 props 통째로 전달
		...regionFilterProps
	};
};
