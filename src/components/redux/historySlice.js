import { createSlice } from '@reduxjs/toolkit';

const historySlice = createSlice({
  name: 'history',
  initialState: [],
  reducers: {
    addToHistory: (state, action) => {
      const existingEntry = state.find(entry => 
        entry.lat === action.payload.lat && entry.lon === action.payload.lon
      );
      if (!existingEntry) {
        state.push(action.payload);
      }
    }
  }
});

export const { addToHistory } = historySlice.actions;
export default historySlice.reducer;
