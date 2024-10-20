import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    myTheme: 'default',
    defaultTheme: {
        background: '#fff',
        color: '#000',
        primary: '#54458a'
    },
    darkTheme: {
        background: '#000',
        color: '#fff',
        primary: '#000'
    }
};

export const systemSlice = createSlice({
    name: "system",
    initialState,
    reducers: {
        setMyTheme: (state, action) => {
            state.myTheme = action.payload
        }
    },
})

export const { setMyTheme } = systemSlice.actions;
