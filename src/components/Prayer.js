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
            fetchData(latitude, longitude);
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

  const fetchData = async (latitude, longitude) => {
    try {
      // Fetch prayer times
      const prayerResponse = await axios.get(`http://api.aladhan.com/v1/calendar/${new Date().getFullYear()}/${new Date().getMonth() + 1}`, {
        params: {
          latitude,
          longitude
        }
      });

      const fetchedPrayerData = prayerResponse.data.data.find(d => d.date.gregorian.day === String(new Date().getDate()));
      if (!fetchedPrayerData) {
        dispatch(setError('No prayer times found for today.'));
        dispatch(setPrayerTimes(null));
        return;
      }

      const prayerObj = {
        date: fetchedPrayerData.date.readable,
        fajr: fetchedPrayerData.timings.Fajr,
        dhuhr: fetchedPrayerData.timings.Dhuhr,
        asr: fetchedPrayerData.timings.Asr,
        maghrib: fetchedPrayerData.timings.Maghrib,
        isha: fetchedPrayerData.timings.Isha,
      };

      // Fetch sunrise and sunset times
      const sunResponse = await axios.get(`https://api.weatherapi.com/v1/astronomy.json`, {
        params: {
          key: APIKey,
          q: `${latitude},${longitude}`,
        }
      });

      const fetchedSunData = sunResponse.data.astronomy.astro;
      const locationData = sunResponse.data.location;

      const sunriseSunset = {
        sunrise: fetchedSunData.sunrise,
        sunset: fetchedSunData.sunset,
        city: locationData.name || 'Unknown',
        country: locationData.country || 'Unknown',
      };

      // Set state and dispatch actions
      setSunriseSunsetData(sunriseSunset);
      dispatch(setPrayerTimes(prayerObj));
      dispatch(setError(null));
      dispatch(addToHistory({
        lat: latitude,
        lon: longitude,
        ...prayerObj,
        ...sunriseSunset
      }));

    } catch (err) {
      console.error("Error fetching data:", err);
      dispatch(setError('Failed to fetch prayer and location data'));
      dispatch(setPrayerTimes(null));
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
              onClick={() => fetchData(lat, lon)}
            >
              Get Prayer Times
            </button>
          </div>
        </div>

        {/* Prayer Times Display on the Right */}
        <div className="col-md-6">
          <div className="card p-4">
            {sunriseSunsetData && (
                <div className="d-flex justify-content-between mb-4 flex-container">
                  <div className="text-center">
                    <img src={location} alt="Location" className="img-fluid" />
                    <p>{sunriseSunsetData.city}, {sunriseSunsetData.country}</p>
                  </div>
                  <div></div>
                  <div className="text-center mr-3">
                    <img src={sunrise} alt="Sunrise" className="img-fluid" />
                    <p>{sunriseSunsetData.sunrise}</p>
                  </div>
                  <div className="text-center">
                    <img src={sunset} alt="Sunset" className="img-fluid" />
                    <p>{sunriseSunsetData.sunset}</p>
                  </div>
                </div>
            )}
            {prayerTimes && (
              <div className="mt-4">
                <h2 className="mb-4 d-inline">Prayer Times</h2>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <h5 className="d-inline ml-3">( {prayerTimes.date} )</h5>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fajr</th>
                      <th>Dhuhr</th>
                      <th>Asr</th>
                      <th>Maghrib</th>
                      <th>Isha</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{prayerTimes.fajr}</td>
                      <td>{prayerTimes.dhuhr}</td>
                      <td>{prayerTimes.asr}</td>
                      <td>{prayerTimes.maghrib}</td>
                      <td>{prayerTimes.isha}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
                  <th>Location</th> {/* New column for location */}
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
                    <td>{entry.city}, {entry.country}</td> {/* Display location */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prayer;
