import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    searchName: "",
    selectedAccNo: null,
    expandedRowKeys: [],
};

const roomSlice = createSlice({
    name: "room",
    initialState,
    reducers: {
        setRoomSearchState: (state, action) => {
            return { ...state, ...action.payload };
        },
        clearRoomSearchState: () => initialState,
    },
});

export const { setRoomSearchState, clearRoomSearchState } = roomSlice.actions;
export default roomSlice.reducer;
