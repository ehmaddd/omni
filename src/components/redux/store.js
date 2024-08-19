import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from './weatherSlice';
import prayerReducer from './prayerSlice';  // Import prayerReducer

const store = configureStore({
  reducer: {
    weather: weatherReducer,
    prayer: prayerReducer
  }
});

export default store;
