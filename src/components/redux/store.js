import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from './weatherSlice';
import prayerReducer from './prayerSlice';
import historyReducer from './features/historySlice';

const store = configureStore({
  reducer: {
    weather: weatherReducer,
    prayer: prayerReducer,
    history: historyReducer
  }
});

export default store;
