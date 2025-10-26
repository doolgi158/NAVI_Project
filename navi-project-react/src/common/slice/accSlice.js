import { createSlice } from "@reduxjs/toolkit";

/* 숙소 관련 전역 상태 Slice */
const accSlice = createSlice({
    name: "acc",
    initialState: {
        searchState: {},
        selectedAcc: null,
        selectedAccId: null,
    },
    reducers: {
        // 검색 조건 및 검색 결과 전체 저장 (뒤로 가기 시 복원용) 
        setSearchState: (state, action) => {
            state.searchState = action.payload;
        },
        // 특정 숙소를 선택할 때 호출되는 reducer
        setSelectedAcc: (state, action) => {
            const acc = action.payload;         // payload = 선택한 숙소 객체
            state.selectedAcc = acc;
            state.selectedAccId = acc?.accId || null;
        },
        resetAccState: (state) => {
            state.selectedAcc = null;
            state.searchState = null;
        },
    },
});

// reducer 내부에서 선언한 함수들을 action으로 내보내기
// 예: 컴포넌트에서 dispatch(setAccList()) 형태로 사용 가능
export const { setSearchState, setSelectedAcc } = accSlice.actions;
export default accSlice.reducer;