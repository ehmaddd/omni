import React, { useEffect } from 'react';
import { useParams, Link, useNavigate, Outlet } from 'react-router-dom';
import DashNav from '../components/DashNav';

const ToDoList = () => {
    const { userId } = useParams();
    const storedUserId = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
  
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
          </>
        ) : (
          <p>Redirecting...</p>
        )}
      </>
    );
  }

export default ToDoList;