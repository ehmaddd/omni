import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import DashNav from '../components/DashNav';
import './Budget.css';

const getDaysInMonth = (year, month) => {
  // Get the first day of the current month
  const firstDay = new Date(year, month - 1, 2);
  // Get the last day of the current month
  const lastDay = new Date(year, month, 1);

  // Create an array to store all the days of the month
  const days = [];
  
  // Iterate from the first day to the last day of the month
  for (let day = new Date(firstDay); day <= lastDay; day.setDate(day.getDate() + 1)) {
    days.push(new Date(day));
  }

  return days;
};

const Budget = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const { userId } = useParams();
    const storedUserId = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const categories = ['food', 'fuel', 'health', 'grocery', 'recreation', 'clothes', 'other']; // Expense categories
    const [expenses, setExpenses] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month
    const [year, setYear] = useState(new Date().getFullYear());     // Current year
    const [totals, setTotals] = useState({});

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
      // Fetch expenses for the selected month and year
      const fetchExpenses = async () => {
        try {
          const response = await fetch(`http://localhost:5000/expenses/${userId}/${year}/${month}`);
          const data = await response.json();
          setExpenses(data);
        } catch (error) {
          console.error('Error fetching expenses:', error);
        }
      };
      fetchExpenses();
    }, [month, year, userId]);

    const daysInMonth = getDaysInMonth(year, month);

    const expensesByDate = {};
    daysInMonth.forEach((date) => {
      const formattedDate = date.toISOString().split('T')[0];
      expensesByDate[formattedDate] = {};
      categories.forEach((category) => {
        expensesByDate[formattedDate][category] = 0;
      });
    });

    expenses.forEach((expense) => {
      const expenseDate = expense.date.split('T')[0]; // Extract date in YYYY-MM-DD format
      if (expensesByDate[expenseDate]) {
        expensesByDate[expenseDate][expense.category] += parseFloat(expense.amount);
      }
    });

    const categoryTotals = {};
  const dateTotals = {};
  let grandTotal = 0;

  categories.forEach((category) => {
    categoryTotals[category] = 0;
  });

  daysInMonth.forEach((date) => {
    const formattedDate = date.toISOString().split('T')[0];
    dateTotals[formattedDate] = 0;
    categories.forEach((category) => {
      const amount = expensesByDate[formattedDate][category];
      categoryTotals[category] += amount;
      dateTotals[formattedDate] += amount;
      grandTotal += amount;
    });
  });

    return (
        <>
            {token ? (
                <>
                    <DashNav />
                    <div className="nav-bar">
                      <h1 className="nav-title">Budget</h1>
                    </div>
                    <Outlet />
                    <p>Your To Budget ID: {userId}</p>
                    <div>
      <h3>{monthNames[parseInt(month.toString().padStart(2, '0'))-1]}-{year}</h3>

      <label htmlFor="month">Select Month:</label>
      <input
        type="month"
        id="month"
        value={`${year}-${month.toString().padStart(2, '0')}`}
        onChange={(e) => {
          const [selectedYear, selectedMonth] = e.target.value.split('-');
          setYear(parseInt(selectedYear));
          setMonth(parseInt(selectedMonth));
        }}
      />

      <table border="1" style={{ width: '100%', marginTop: '20px', textAlign: 'center' }}>
        <thead>
          <tr>
            <th>Date</th>
            {categories.map((category, index) => (
              <th key={index}>{category.charAt(0).toUpperCase() + category.slice(1)}</th>
            ))}
            <th>Total for Date</th>
          </tr>
        </thead>
        <tbody>
          {daysInMonth.map((date, index) => {
            const formattedDate = date.toISOString().split('T')[0];
            return (
              <tr key={index}>
                <td>{formattedDate}</td>
                {categories.map((category, index) => (
                  <td key={index}>
                    ${expensesByDate[formattedDate][category].toFixed(2)}
                  </td>
                ))}
                <td>${dateTotals[formattedDate].toFixed(2)}</td>
              </tr>
            );
          })}
          <tr>
            <td><strong>Total for Category</strong></td>
            {categories.map((category, index) => (
              <td key={index}>
                <strong>${categoryTotals[category].toFixed(2)}</strong>
              </td>
            ))}
            <td><strong>${grandTotal.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
                    
                </>
            ) : (
                <p>Loading...</p>
            )}
        </>
    );
};

export default Budget;
