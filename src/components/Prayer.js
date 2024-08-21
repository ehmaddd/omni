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
  const [sunriseSunsetData, setSunriseSunsetData] = useState(null);
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

        const locationData = {
          city: sunriseSunsetData?.city || 'Unknown',
          country: sunriseSunsetData?.country || 'Unknown'
        };

        dispatch(setPrayerTimes(prayerObj));
        dispatch(setError(null));
        dispatch(addToHistory({ lat: latitude, lon: longitude, ...prayerObj, ...locationData }));
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
      const locationData = response.data.location;
      
      // Ensure location data is correctly set
      if (fetchedData && locationData) {
        setSunriseSunsetData({
          sunrise: fetchedData.sunrise,
          sunset: fetchedData.sunset,
          city: locationData.name || 'Unknown',
          country: locationData.country || 'Unknown',
        });
      } else {
        setSunriseSunsetData({
          sunrise: 'Unknown',
          sunset: 'Unknown',
          city: 'Unknown',
          country: 'Unknown',
        });
      }
    } catch (err) {
      console.error("Error fetching sunrise and sunset data:", err);
      dispatch(setError('Failed to fetch sunrise and sunset data'));
      setSunriseSunsetData({
        sunrise: 'Unknown',
        sunset: 'Unknown',
        city: 'Unknown',
        country: 'Unknown',
      });
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
              Get Prayer Times
            </button>
          </div>
        </div>

        {/* Prayer Times Display on the Right */}
        <div className="col-md-6">
          {prayerTimes && (
            <div className="card p-4">
              <h2 className="mb-4">Prayer Times</h2>
              {/* Display Sunrise and Sunset */}
              {sunriseSunsetData && (
                <div className="mt-4">
                  <h3>Sunrise and Sunset</h3>
                  <div className="d-flex justify-content-between">
                    <div className="text-center">
                      <img src={sunrise} alt="Sunrise" className="img-fluid" />
                      <p><strong>Sunrise:</strong> {sunriseSunsetData.sunrise}</p>
                    </div>
                    <div className="text-center">
                      <img src={sunset} alt="Sunset" className="img-fluid" />
                      <p><strong>Sunset:</strong> {sunriseSunsetData.sunset}</p>
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <img src={location} alt="Location" className="img-fluid" />
                    <p><strong>Location:</strong> {sunriseSunsetData.city}, {sunriseSunsetData.country}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Display History */}
      {history.length > 0 && (
        <div className="mt-4">
          <h2>History</h2>
          <div className="card p-4">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Fajr</th>
                  <th>Dhuhr</th>
                  <th>Asr</th>
                  <th>Maghrib</th>
                  <th>Isha</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.date}</td>
                    <td>{entry.fajr}</td>
                    <td>{entry.dhuhr}</td>
                    <td>{entry.asr}</td>
                    <td>{entry.maghrib}</td>
                    <td>{entry.isha}</td>
                    <td>{entry.lat}</td>
                    <td>{entry.lon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Display error messages */}
      {prayerError && (
        <div className="alert alert-danger mt-4" role="alert">
          {prayerError}
        </div>
      )}
    </div>
  );
};

export default Prayer;
