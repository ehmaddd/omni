// src/redux/weatherSlice.js
import { createSlice } from '@reduxjs/toolkit';

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    data: {
      country: '',
      location: '',
      icon: '',
      text: '',
      humidity: ''
    },
    error: null,
    history: []  // Add history to the state
  },
  reducers: {
    setWeather: (state, action) => {
      state.data = action.payload;
      state.history = [...state.history, action.payload];  // Add new weather data to history
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setWeather, setError } = weatherSlice.actions;

export default weatherSlice.reducer;
