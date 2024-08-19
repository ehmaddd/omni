import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setPrayerTimes, setError as setPrayerError } from './redux/prayerSlice';
import { setWeather, setError as setWeatherError } from './redux/weatherSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun } from '@fortawesome/free-solid-svg-icons';
import './Prayer.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const PrayerWeather = () => {
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
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
      } else {
        dispatch(setPrayerError('No prayer times found for today.'));
        dispatch(setPrayerTimes(null));
      }
    } catch (err) {
      console.error("Error fetching prayer times:", err); // Debugging line
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
    } catch (err) {
      console.error("Error fetching sunrise and sunset data:", err); // Debugging line
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
  
        {/* Sunrise/Sunset Information on the Right */}
        <div className="col-md-6">
          {weather && weather.sunrise ? (
            <div className="card p-4">
              <h2>Sunrise and Sunset Times</h2>
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Location: {weather.city}, {weather.country}</p> {/* Display city and country */}
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faSun} size="lg" className="mr-2" />
                <p className="mb-0">Sunrise: {weather.sunrise}</p>
              </div>
              <div className="d-flex align-items-center mt-2">
                <FontAwesomeIcon icon={faSun} size="lg" className="mr-2" />
                <p className="mb-0">Sunset: {weather.sunset}</p>
              </div>
            </div>
          ) : (
            <p className="text-danger">Sunrise and sunset information is not available.</p>
          )}
        </div>
      </div>
  
      {/* Prayer Information at the Bottom */}
      <div className="row mt-4">
        <div className="col-md-12">
          {prayerTimes ? (
            <div className="card p-4">
              <h2>Today's Prayer Times</h2>
              <p>Date: {prayerTimes.date}</p>
              <p>Fajr: {prayerTimes.fajr}</p>
              <p>Dhuhr: {prayerTimes.dhuhr}</p>
              <p>Asr: {prayerTimes.asr}</p>
              <p>Maghrib: {prayerTimes.maghrib}</p>
              <p>Isha: {prayerTimes.isha}</p>
            </div>
          ) : (
            <p className="text-danger text-center">{prayerError || 'No prayer times available.'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrayerWeather;
