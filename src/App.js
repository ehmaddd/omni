import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Calculator from './components/Calculator';
import Quote from './components/Quote';
import Weather from './components/Weather';
import FloatingSocialMenu from './components/FloatingSocialMenu';
import './components/styles.css';

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
        </Routes>
      </Router>
      <FloatingSocialMenu />
    </>
  );
}

export default App;