import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Navbar from './components/Navbar';
import DashNav from './components/DashNav';
import Quote from './components/Quote';
import Weather from './components/Weather';
import Prayer from './components/Prayer';
import Register from './Register';
import Login from './Login';
import FloatingSocialMenu from './components/FloatingSocialMenu';
import './components/styles.css';
import Dashboard from './Dashboard';
import Signout from './Signout';
import MoodTracker from './components/MoodTracker';
import FitnessTracker from './components/FitnessTracker';
import LogMood from './components/LogMood';
import ViewLog from './components/ViewLog';
import ViewSummary from './components/ViewSummary';
import NotFound from './components/NotFound';
import TrackSugar from './components/TrackSugar';
import TrackBp from './components/TrackBp';
import TrackWeight from './components/TrackWeight';
import { CgLogIn } from 'react-icons/cg';

function App() {
  const location = useLocation();
  const isDashboardPath = location.pathname.startsWith('/dashboard');
  const hideNavRoutes = ['/404'];

  return (
    <>
      <Header />
      {!isDashboardPath && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/prayer" element={<Prayer />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/:userId" element={<Dashboard />} />
        <Route path="/dashboard/:userId/mood_tracker" element={<MoodTracker />} />
        <Route path="/dashboard/:userId/mood_tracker/log" element={<LogMood />} />
        <Route path="/dashboard/:userId/mood_tracker/viewlog" element={<ViewLog />} />
        <Route path="/dashboard/:userId/mood_tracker/summary" element={<ViewSummary />} />
        <Route path="/dashboard/:userId/fitness_tracker" element={<FitnessTracker />} />
        <Route path="/dashboard/:userId/fitness_tracker/track_sugar" element={<TrackSugar />} />
        <Route path="/dashboard/:userId/fitness_tracker/track_bp" element={<TrackBp />} />
        <Route path="/dashboard/:userId/fitness_tracker/track_weight" element={<TrackWeight />} />
        <Route path="/signout" element={<Signout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isDashboardPath && <FloatingSocialMenu />}
    </>
  );
}

export default App;
