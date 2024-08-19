import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setPrayerTimes, setError as setPrayerError } from './redux/prayerSlice';
import { setWeather, setError as setWeatherError } from './redux/weatherSlice';
import sunrise from '../images/sunrise.png';
import sunset from '../images/sunset.png';
import location from '../images/location.png';
import './Prayer.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const PrayerWeather = () => {
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [history, setHistory] = useState([]);
  const dispatch = useDispatch();

  const prayerTimes = useSelector((state) => state.prayer?.data);
  const prayerError = useSelector((state) => state.prayer?.error);

  const weather = useSelector((state) => state.weather?.data);
  const weatherError = useSelector((state) => state.weather?.error);

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
            dispatch(setPrayerError('Failed to fetch your location.'));
            dispatch(setWeatherError('Failed to fetch your location.'));
          }
        );
      } else {
        dispatch(setPrayerError('Geolocation is not supported by this browser.'));
        dispatch(setWeatherError('Geolocation is not supported by this browser.'));
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
      dispatch(setPrayerError('Please enter valid latitude and longitude.'));
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

        dispatch(setPrayerTimes(prayerObj));
        dispatch(setPrayerError(null));

        // Update history
        setHistory(prevHistory => {
          const existingIndex = prevHistory.findIndex(record => record.lat === latitude && record.lon === longitude);
          if (existingIndex > -1) {
            const newHistory = [...prevHistory];
            newHistory[existingIndex] = { ...newHistory[existingIndex], ...prayerObj };
            return newHistory;
          } else {
            const weatherData = prevHistory.find(record => record.lat === latitude && record.lon === longitude);
            if (weatherData) {
              return [...prevHistory, { ...weatherData, ...prayerObj }];
            }
            return [...prevHistory, { ...prayerObj, lat: latitude, lon: longitude }];
          }
        });
      } else {
        dispatch(setPrayerError('No prayer times found for today.'));
        dispatch(setPrayerTimes(null));
      }
    } catch (err) {
      console.error("Error fetching prayer times:", err);
      dispatch(setPrayerError('Failed to fetch prayer times'));
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
      const location = response.data.location; // Assuming location data is available
      const sunriseSunsetObj = {
        sunrise: fetchedData.sunrise,
        sunset: fetchedData.sunset,
        city: location.name,
        country: location.country,
      };

      dispatch(setWeather(sunriseSunsetObj));
      dispatch(setWeatherError(null));

      // Update history
      setHistory(prevHistory => {
        const existingIndex = prevHistory.findIndex(record => record.lat === latitude && record.lon === longitude);
        if (existingIndex > -1) {
          const newHistory = [...prevHistory];
          newHistory[existingIndex] = { ...newHistory[existingIndex], ...sunriseSunsetObj };
          return newHistory;
        } else {
          return [...prevHistory, { ...sunriseSunsetObj, lat: latitude, lon: longitude }];
        }
      });
    } catch (err) {
      console.error("Error fetching sunrise and sunset data:", err);
      dispatch(setWeatherError('Failed to fetch sunrise and sunset data'));
      dispatch(setWeather(null));
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
            {weather ? (
              <>
                <br></br>
                <p><img src={location} alt="Location" style={{ width: '30px', height: '40px', marginRight: '10px' }} /> {weather.city}, {weather.country}</p>
                <br></br>
                <div className="d-flex align-items-center">
                  <img src={sunrise} alt="Sunrise" style={{ width: '45px', height: '40px', marginRight: '10px' }} />
                  <p className="mb-0">Sunrise: {weather.sunrise}</p>
                </div>
                <div className="d-flex align-items-center mt-2">
                  <img src={sunset} alt="Sunset" style={{ width: '55px', height: '40px', marginRight: '10px' }} />
                  <p className="mb-0">Sunset: {weather.sunset}</p>
                </div>
              </>
            ) : (
              <p className="text-danger">Sunrise and sunset information is not available.</p>
            )}
          </div>
        </div>
      </div>
  
      {/* History Table */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card p-4">
            <h2>History</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Sunrise</th>
                  <th>Sunset</th>
                  <th>Fajr</th>
                  <th>Dhuhr</th>
                  <th>Asr</th>
                  <th>Maghrib</th>
                  <th>Isha</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr key={index}>
                    <td>{record.city || '-'}, {record.country || '-'}</td>
                    <td>{record.sunrise || '-'}</td>
                    <td>{record.sunset || '-'}</td>
                    <td>{record.fajr || '-'}</td>
                    <td>{record.dhuhr || '-'}</td>
                    <td>{record.asr || '-'}</td>
                    <td>{record.maghrib || '-'}</td>
                    <td>{record.isha || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerWeather;
