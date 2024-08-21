import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setWeather, setError, addToHistory } from './redux/weatherSlice';
import './Weather.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Weather = () => {
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const dispatch = useDispatch();
  const weather = useSelector((state) => state.weather.data);
  const error = useSelector((state) => state.weather.error);
  const history = useSelector((state) => state.weather.history);
  const { location } = useSelector((state) => state.location || { location: "defaultLocation" });
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
            fetchWeather(latitude, longitude);
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

  const fetchWeather = async (latitude, longitude) => {
    const existingEntry = history.find(
      (entry) => entry.lat === latitude && entry.lon === longitude
    );

    if (existingEntry) {
      dispatch(setWeather(existingEntry));
      dispatch(setError(null));
    } else {
      try {
        const response = await axios.get('http://api.weatherapi.com/v1/current.json', {
          params: {
            key: APIKey,
            q: `${latitude},${longitude}`,
            aqi: 'no'
          }
        });

        const fetchedWeather = response.data;
        const weatherObj = {
          country: fetchedWeather.location.country,
          location: fetchedWeather.location.name,
          icon: fetchedWeather.current.condition.icon,
          text: fetchedWeather.current.condition.text,
          humidity: fetchedWeather.current.humidity,
          lat: latitude, // Latitude is stored
          lon: longitude // Longitude is stored
        };

        dispatch(setWeather(weatherObj));
        dispatch(setError(null));
        dispatch(addToHistory(weatherObj));  // Add new weather data to history
      } catch (err) {
        dispatch(setError('Failed to fetch weather data'));
        dispatch(setWeather({
          country: '',
          location: '',
          icon: '',
          text: '',
          humidity: ''
        }));
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Weather Finder on the Left */}
        <div className="col-md-6">
          <div className="card p-4">
            <h1 className="mb-4">Weather Finder</h1>
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
            <button className="btn btn-primary btn-block" onClick={() => fetchWeather(lat, lon)}>
              Get Weather
            </button>
          </div>
        </div>

        {/* Weather Information on the Right */}
        <div className="col-md-6">
          {weather && (
            <div className="card p-4">
              <h2>Weather Information</h2>
              <p>Country: {weather.country}</p>
              <p>City: {weather.location}</p>
              <p><img src={weather.icon} alt="Weather Icon" /></p>
              <p>Condition: {weather.text}</p>
              <p>Humidity: {weather.humidity}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Weather History at the Bottom */}
      {history.length > 0 && (
        <div className="row mt-4">
          <div className="col-md-12">
            <div className="card p-4">
              <h2 className="text-center">Weather History</h2>
              <table className="table table-bordered table-striped">
                <thead className="thead-dark">
                  <tr>
                    <th>Location</th>
                    <th>Condition</th>
                    <th>Humidity</th>
                    <th>Icon</th>
                    <th>Latitude</th> {/* New Header */}
                    <th>Longitude</th> {/* New Header */}
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.location}, {entry.country}</td>
                      <td>{entry.text}</td>
                      <td>{entry.humidity}%</td>
                      <td><img src={entry.icon} alt="Weather Icon" /></td>
                      <td>{entry.lat}</td> {/* New Data */}
                      <td>{entry.lon}</td> {/* New Data */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-danger text-center mt-3">{error}</p>}
    </div>
  );
};

export default Weather;
