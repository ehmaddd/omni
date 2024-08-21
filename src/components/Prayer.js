import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setPrayerTimes, setError, addToHistory } from './redux/prayerSlice'; // Import the actions
import sunrise from '../images/sunrise.png';
import sunset from '../images/sunset.png';
import location from '../images/location.png';
import './Prayer.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Prayer = () => {
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const dispatch = useDispatch();

  const prayerTimes = useSelector((state) => state.prayer.data);
  const prayerError = useSelector((state) => state.prayer.error);
  const history = useSelector((state) => state.prayer.history);

  const APIKey = 'd9323e0f1cdc4028b3292349241608';
  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (!lat && !lon && !initialFetchDone.current) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLat(latitude);
            setLon(longitude);
            fetchPrayerTimes(latitude, longitude);
            fetchSunriseSunset(latitude, longitude);
            initialFetchDone.current = true;
          },
          (error) => {
            console.error("Error fetching location:", error);
            dispatch(setError('Failed to fetch your location.'));
          }
        );
      } else {
        dispatch(setError('Geolocation is not supported by this browser.'));
      }
    }
  }, [lat, lon, dispatch]);

  const handleLatChange = (e) => {
    setLat(parseFloat(e.target.value));
  };

  const handleLonChange = (e) => {
    setLon(parseFloat(e.target.value));
  };

  const fetchPrayerTimes = async (latitude, longitude) => {
    if (latitude === null || longitude === null) {
      dispatch(setError('Please enter valid latitude and longitude.'));
      return;
    }
  
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
  
    try {
      const response = await axios.get(`http://api.aladhan.com/v1/calendar/${year}/${month}`, {
        params: {
          latitude,
          longitude
        }
      });
  
      const fetchedData = response.data.data.find(d => d.date.gregorian.day === String(day));
  
      if (fetchedData) {
        const prayerObj = {
          date: fetchedData.date.readable,
          fajr: fetchedData.timings.Fajr,
          dhuhr: fetchedData.timings.Dhuhr,
          asr: fetchedData.timings.Asr,
          maghrib: fetchedData.timings.Maghrib,
          isha: fetchedData.timings.Isha,
        };
  
        // Check for duplicates before dispatching
        const isDuplicate = history.some(
          (entry) =>
            entry.lat === latitude &&
            entry.lon === longitude &&
            entry.date === prayerObj.date
        );
  
        if (!isDuplicate) {
          dispatch(setPrayerTimes(prayerObj));
          dispatch(setError(null));
          dispatch(addToHistory({ lat: latitude, lon: longitude, ...prayerObj }));
        } else {
          console.log('Duplicate entry found, not adding to history.');
        }
      } else {
        dispatch(setError('No prayer times found for today.'));
        dispatch(setPrayerTimes(null));
      }
    } catch (err) {
      console.error("Error fetching prayer times:", err);
      dispatch(setError('Failed to fetch prayer times'));
      dispatch(setPrayerTimes(null));
    }
  };

  const fetchSunriseSunset = async (latitude, longitude) => {
    try {
      const response = await axios.get(`https://api.weatherapi.com/v1/astronomy.json`, {
        params: {
          key: APIKey,
          q: `${latitude},${longitude}`,
        }
      });

      const fetchedData = response.data.astronomy.astro;
      const location = response.data.location;
      const sunriseSunsetObj = {
        sunrise: fetchedData.sunrise,
        sunset: fetchedData.sunset,
        city: location.name,
        country: location.country,
      };

      // If you plan to use sunriseSunsetObj, consider storing it in the state
      // dispatch(setWeather(sunriseSunsetObj));
    } catch (err) {
      console.error("Error fetching sunrise and sunset data:", err);
      // Handle errors if needed
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Latitude and Longitude Input on the Left */}
        <div className="col-md-6">
          <div className="card p-4">
            <h1 className="mb-4">Prayer Time Finder</h1>
            <div className="form-group mb-3">
              <label htmlFor="lat">Latitude:</label>
              <input
                type="number"
                id="lat"
                name="lat"
                min="-90"
                max="90"
                onChange={handleLatChange}
                step="0.1"
                style={{ width: '100%', height: '40px' }}
                placeholder="Enter latitude"
                className="form-control"
                value={lat !== null ? lat : ''}
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="long">Longitude:</label>
              <input
                type="number"
                id="long"
                name="long"
                min="-180"
                max="180"
                onChange={handleLonChange}
                step="0.1"
                style={{ width: '100%', height: '40px' }}
                placeholder="Enter longitude"
                className="form-control"
                value={lon !== null ? lon : ''}
              />
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                fetchPrayerTimes(lat, lon);
                fetchSunriseSunset(lat, lon);
              }}
            >
              Get Information
            </button>
          </div>
        </div>

        {/* Combined Prayer and Sunrise/Sunset Information on the Right */}
        <div className="col-md-6">
          <div className="card p-4">
            <h2>Today's Information</h2>
            <h5>{new Date().toLocaleDateString()}</h5>
            {/* Remove weather section if not used */}
            {/* <h3>Sunrise and Sunset</h3>
            {weather ? (
              <>
                <p><img src={location} alt="Location" style={{ width: '30px', height: '40px', marginRight: '10px' }} /> {weather.city}, {weather.country}</p>
                <div className="d-flex align-items-center">
                  <img src={sunrise} alt="Sunrise" style={{ width: '45px', height: '40px', marginRight: '10px' }} />
                  <p>{weather.sunrise}</p>
                </div>
                <div className="d-flex align-items-center mt-2">
                  <img src={sunset} alt="Sunset" style={{ width: '45px', height: '40px', marginRight: '10px' }} />
                  <p>{weather.sunset}</p>
                </div>
              </>
            ) : (
              <p>{weatherError || 'No weather data available'}</p>
            )} */}
            <hr />
            <h3>Prayer Times</h3>
            {prayerTimes ? (
              <ul>
                <li>Fajr: {prayerTimes.fajr}</li>
                <li>Dhuhr: {prayerTimes.dhuhr}</li>
                <li>Asr: {prayerTimes.asr}</li>
                <li>Maghrib: {prayerTimes.maghrib}</li>
                <li>Isha: {prayerTimes.isha}</li>
              </ul>
            ) : (
              <p>{prayerError || 'No prayer times available'}</p>
            )}
            <hr />
            <h3>Prayer Times History</h3>
            {history.length > 0 ? (
              <ul>
                {history.map((entry, index) => (
                  <li key={index}>
                    <strong>Date:</strong> {entry.date} <br />
                    <strong>Latitude:</strong> {entry.lat} <br />
                    <strong>Longitude:</strong> {entry.lon} <br />
                    <strong>Fajr:</strong> {entry.fajr} <br />
                    <strong>Dhuhr:</strong> {entry.dhuhr} <br />
                    <strong>Asr:</strong> {entry.asr} <br />
                    <strong>Maghrib:</strong> {entry.maghrib} <br />
                    <strong>Isha:</strong> {entry.isha} <br />
                    <hr />
                  </li>
                ))}
              </ul>
            ) : (
              <p>No history available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prayer;
