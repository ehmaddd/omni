import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from './weatherSlice';
import prayerReducer from './prayerSlice';

const store = configureStore({
  reducer: {
    weather: weatherReducer,
    prayer: prayerReducer,
  }
});

export default store;
