import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,   // Ensures that `state.prayer.data` is not undefined
  error: null,
  history: []
};

const prayerSlice = createSlice({
  name: 'prayer',
  initialState,
  reducers: {
    setPrayerTimes: (state, action) => {
      state.data = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addToHistory: (state, action) => {
      state.history.push(action.payload);
    }
  }
});

export const { setPrayerTimes, setError, addToHistory } = prayerSlice.actions;
export default prayerSlice.reducer;
