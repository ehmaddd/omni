import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import DashNav from '../components/DashNav';
import './ToDoList.css'; // Import the CSS file

const ToDoList = () => {
    const { userId } = useParams();
    const storedUserId = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const [list, setList] = useState({});
    const [dbList, setDbList] = useState([]);

    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format

    const fetchDB = async () => {
        try {
            const response = await fetch(`http://localhost:5000/fetch_todos/${userId}?date=${currentDate}`, {
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

    // Function to filter tasks by priority
    const filterByPriority = (priority) => dbList.filter(item => item.priority === priority);

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
                    <form className="todo-form">
                        <label className="todo-label" htmlFor="task">Enter Task</label>
                        <input
                            id="task"
                            type="text"
                            value={list.task}
                            onChange={(e) => setList({ ...list, task: e.target.value })}
                            placeholder="Task description"
                        />
                        <label className="todo-label" htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            value={list.priority}
                            onChange={(e) => setList({ ...list, priority: e.target.value })}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                        <label className="todo-label" htmlFor="date">Date</label>
                        <input
                            id="date"
                            type="date"
                            value={list.date}
                            onChange={(e) => setList({ ...list, date: e.target.value })}
                        />
                        <button type="submit" className="submit-button">Add Task</button>
                    </form>
                    <h5>Date : {currentDate}</h5>
                    <div className="output-div">
                        <h2>High Priority</h2>
                        <table className="high-priority">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                              {filterByPriority('High').map(item => (
                                <tr key={item.id}>
                                  <td>{item.task}</td>
                                  <td>{item.status}</td>
                                  <td>
                                      {item.status === "pending" ? (
                                          <>
                                              <button className="complete-button">Mark as Complete</button>
                                              <button className="delete-button">Delete</button>
                                          </>
                                      ) : (
                                          <>
                                              <button className="complete-button" disabled>Completed</button>
                                              <button className="delete-button">Delete</button>
                                          </>
                                      )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                        </table>

                        <h2>Medium Priority</h2>
                        <table className="medium-priority">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                            {filterByPriority('Medium').map(item => (
    <tr key={item.id}>
        <td>{item.task}</td>
        <td>{item.status}</td>
        <td>
            {item.status === "pending" ? (
                <>
                    <button className="complete-button">Mark as Complete</button>
                    <button className="delete-button">Delete</button>
                </>
            ) : (
                <>
                    <button className="complete-button" disabled>Completed</button>
                    <button className="delete-button">Delete</button>
                </>
            )}
        </td>
    </tr>
))}
                            </tbody>
                        </table>

                        <h2>Low Priority</h2>
                          <table className="low-priority">
                              <thead>
                                  <tr>
                                      <th>Task</th>
                                      <th>Status</th>
                                      <th>Actions</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {filterByPriority('Low').map(item => (
                                      <tr key={item.id}>
                                          <td>{item.task}</td>
                                          <td>{item.status}</td>
                                          <td>
                                              {item.status === "pending" ? (
                                                  <>
                                                      <button className="complete-button">Mark as Complete</button>
                                                      <button className="delete-button">Delete</button>
                                                  </>
                                              ) : (
                                                  <>
                                                      <button className="complete-button" disabled>Completed</button>
                                                      <button className="delete-button">Delete</button>
                                                  </>
                                              )}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                    </div>
                </>
            ) : (
                <p>Redirecting...</p>
            )}
        </>
    );
}

export default ToDoList;
