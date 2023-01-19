import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    token:null
}

const slice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload
        }
    }
})

export default slice
export const { setToken } = slice.actions