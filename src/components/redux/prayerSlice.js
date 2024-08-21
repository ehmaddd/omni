// prayerSlice.js
import { createSlice } from '@reduxjs/toolkit';

const prayerSlice = createSlice({
  name: 'prayer',
  initialState: {
    data: null,
    error: null,
    history: [],
  },
  reducers: {
    setPrayerTimes: (state, action) => {
      state.data = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addToHistory: (state, action) => {
      const entry = action.payload;

      // Check for duplicates
      const isDuplicate = state.history.some(
        (item) => item.lat === entry.lat && item.lon === entry.lon && item.date === entry.date
      );

      if (!isDuplicate) {
        state.history.push(entry);
      }
    },
  },
});

export const { setPrayerTimes, setError, addToHistory } = prayerSlice.actions;
export default prayerSlice.reducer;
