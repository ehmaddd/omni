import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Outlet } from 'react-router-dom';
import DashNav from '../components/DashNav';

const ToDoList = () => {
    const { userId } = useParams();
    const storedUserId = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const [ list, setList] = useState({});
    const [ dbList, setDbList ] = useState([]);

    const fetchDB = async () => {
      try {
        const response = await fetch(`http://localhost:5000/fetch_todos/${userId}`, {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error('No Task Found');
        }
        const result = await response.json();
        setDbList(result);
      } catch (error) {
        console.error('Cannot reach database:', error);
      }
    }

    useEffect(() => {
      // Redirect if no token is present
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }
  
      if (userId !== storedUserId) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
        navigate('/login');
        return;
      }
  
      // Optionally, verify token validity with your backend
      const verifyToken = async () => {
        try {
          const response = await fetch('http://localhost:5000/verify-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Token validation failed');
          }
          const result = await response.json();
          console.log('Token verification result:', result);
          if (!result.valid) {
            localStorage.removeItem('token');
            navigate('/login');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          navigate('/login');
        }
      };
  
      verifyToken();
    }, [token, navigate, userId, storedUserId]);
  
    useEffect(() => {
      fetchDB();
    }, []);

    return (
      <>
        {token ? (
          <>
            <DashNav />
            <div className="nav-bar">
              <h1 className="nav-title">To Do List</h1>
            </div>
            <Outlet />
            <p>Your To Do List ID: {userId}</p>
            <label>Enter Task</label>
            <input
              type="text"
              value={list.task}
              onChange={(e) => setList({ ...list, task: e.target.value })}
            />
            <label>Priority</label>
            <select
              value={list.priority}
              onChange={(e) => setList({ ...list, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <div className="output-div">
           {dbList.map((item) => (
             <ul key={item.id}> {/* Ensure each <ul> has a unique key */}
               <li>
                 {item.task}{item.priority}{item.date}
               </li>
             </ul>
           ))}
         </div>
          </>
        ) : (
          <p>Redirecting...</p>
        )}
      </>
    );
  }

export default ToDoList;