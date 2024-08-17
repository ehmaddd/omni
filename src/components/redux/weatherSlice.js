// redux/weatherSlice.js
import { createSlice } from '@reduxjs/toolkit';

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    data: {},
    error: null,
    history: []
  },
  reducers: {
    setWeather(state, action) {
      state.data = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    addToHistory(state, action) {
      const newEntry = action.payload;
      // Check for duplicates based on latitude and longitude
      const existingIndex = state.history.findIndex(
        (entry) => entry.lat === newEntry.lat && entry.lon === newEntry.lon
      );
      if (existingIndex === -1) {
        state.history.push(newEntry);
      }
    }
  }
});

export const { setWeather, setError, addToHistory } = weatherSlice.actions;
export default weatherSlice.reducer;
