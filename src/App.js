import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Calculator from './components/Calculator';
import Quote from './components/Quote';
import Weather from './components/Weather';
import Prayer from './components/Prayer';
import Register from './Register';
import Login from './Login';
import FloatingSocialMenu from './components/FloatingSocialMenu';
import './components/styles.css';
import Dashboard from './Dashboard';
import Signout from './Signout';

function App() {
  return (
    <>
      <Header />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Calculator />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/prayer" element={<Prayer />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/:userId" element={<Dashboard />} />
          <Route path="/signout" element={<Signout />} />
        </Routes>
      </Router>
      <FloatingSocialMenu />
    </>
  );
}

export default App;