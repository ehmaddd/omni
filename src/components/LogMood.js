import React, { useState } from 'react';
import { useParams, Link, Outlet } from 'react-router-dom';
import DashNav from './DashNav';
import MoodNav from './MoodNav';
import './LogMood.css';

function LogMood() {
  const [valence, setValence] = useState(0);
  const [arousal, setArousal] = useState(0);
  const [duration, setDuration] = useState('');
  const [trigger, setTrigger] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [errors, setErrors] = useState({});

  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');

  const triggerOptions = [
    'Work',
    'Family',
    'Friends',
    'Health',
    'Finance',
    'Others',
  ];

  const handleChange = (e, fieldName) => {
    const { value } = e.target;
    // Clear error message for the field
    setErrors(prevErrors => ({ ...prevErrors, [fieldName]: '' }));

    switch (fieldName) {
      case 'valence':
        setValence(value);
        break;
      case 'arousal':
        setArousal(value);
        break;
      case 'duration':
        setDuration(value);
        break;
      case 'date':
        setDate(value);
        break;
      case 'time':
        setTime(value);
        break;
      case 'trigger':
        setTrigger(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    let formErrors = {};
    if (valence === '') formErrors.valence = 'Valence level is required';
    if (arousal === '') formErrors.arousal = 'Arousal level is required';
    if (duration === '') formErrors.duration = 'Duration is required';
    if (!date) formErrors.date = 'Date is required';
    if (!time) formErrors.time = 'Time is required';
    if (!trigger) formErrors.trigger = 'Trigger is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const moodLog = {
      userId: storedUserId,
      valence: Number(valence), // Ensure valence is a number
      arousal: Number(arousal), // Ensure arousal is a number
      duration,
      date,
      time,
      trigger
    };

    try {
      const response = await fetch('http://localhost:5000/log-mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(moodLog)
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message); // Show success message
        // Clear form after successful submission
        setValence(0);
        setArousal(0);
        setDuration('');
        setTrigger('');
        setDate(new Date().toISOString().slice(0, 10));
        setTime(new Date().toLocaleTimeString());
      } else {
        const errorResult = await response.json();
        alert(errorResult.message); // Show error message
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving mood log');
    }
  };

  return (
    <>
      <DashNav />
      <div className="nav-bar">
        <h1 className="nav-title">Mood Logger</h1>
        <MoodNav id={userId} />
        <Outlet />
      </div>

      <div className="mood-logger-container">
        <form onSubmit={handleSubmit} className="mood-logger-form">
          <table className="mood-logger-table">
            <tbody>
              <tr>
                <td className="mood-form-group">
                  <label>Valence Level
                    <br />
                    <span style={{ color: 'grey' }}>(Positivity/Negativity)</span>
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={valence}
                    onChange={(e) => handleChange(e, 'valence')}
                    className="slider"
                  />
                  <span className="value-display">{valence}</span> {/* Display valence */}
                  {errors.valence && <div className="error">{errors.valence}</div>}
                </td>
              </tr>
              <tr>
                <td className="mood-form-group">
                  <label>Arousal Level
                    <br />
                    <span style={{ color: 'grey' }}>(Intensity)</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={arousal}
                    onChange={(e) => handleChange(e, 'arousal')}
                    className="slider"
                  />
                  <span className="value-display">{arousal}</span> {/* Display arousal */}
                  {errors.arousal && <div className="error">{errors.arousal}</div>}
                </td>
              </tr>
              <tr>
                <td className="mood-form-group">
                  <label>Estimated Duration (minutes):</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => handleChange(e, 'duration')}
                    placeholder="Duration in minutes"
                    min="0"
                    max="60"
                    step="1"
                  />
                  {errors.duration && <div className="error">{errors.duration}</div>}
                </td>
              </tr>
              <tr>
                <td className="mood-form-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => handleChange(e, 'date')}
                  />
                  {errors.date && <div className="error">{errors.date}</div>}
                </td>
              </tr>
              <tr>
                <td className="mood-form-group">
                  <label>Time:</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleChange(e, 'time')}
                  />
                  {errors.time && <div className="error">{errors.time}</div>}
                </td>
              </tr>
              <tr>
                <td className="mood-form-group">
                  <label>Contextual Trigger:</label>
                  <select
                    value={trigger}
                    onChange={(e) => handleChange(e, 'trigger')}
                    className="trigger-dropdown"
                  >
                    <option value="">-- Select --</option> {/* Default option */}
                    {triggerOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.trigger && <div className="error">{errors.trigger}</div>}
                </td>
              </tr>
              <tr>
                <td>
                  <button type="submit" className="submit-btn">Log Mood</button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </>
  );
}

export default LogMood;
