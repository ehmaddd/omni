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
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [totals, setTotals] = useState({});
    const [income, setIncome] = useState(0);
    const [fetchedIncome, setFetchedIncome] = useState(0);

    const [formData, setFormData] = useState({
      date: '',
      category: categories[0],
      amount: '',
      description: '',
  });

  const fetchExpenses = async () => {
    try {
        const response = await fetch(`http://localhost:5000/expenses/${userId}/${year}/${month}`);
        const data = await response.json();
        setExpenses(data);
    } catch (error) {
        console.error('Error fetching expenses:', error);
    }
};

useEffect(() => {
  fetchIncome(); // Fetch income whenever month or year changes
}, [year, month, userId]);

// Update the fetchIncome function to clear or set income appropriately
const fetchIncome = async () => {
    console.log('fetchIncome called');
    try {
        const response = await fetch(`http://localhost:5000/fetch_income/${userId}/${year}/${month}`);
        const data = await response.json();
        // Check if the data exists
        if (data && data.length > 0) {
            setFetchedIncome(data[0].amount);
        } else {
            setFetchedIncome(0); // Clear if no income found for the month
        }
    } catch (error) {
        console.error('Error fetching income:', error);
    }
};

  const handleIncome = async () => {
    const newIncome = {
        userId,
        year,
        month,
        amount: parseFloat(income),
    };
    try {
      const response = await fetch('http://localhost:5000/store_income', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(newIncome),
      });
      if (!response.ok) {
          throw new Error('Error adding income');
      }
      const data = await response.json();
      console.log('Income added:', data);
      // Clear the form
      setIncome(0);
      // Fetch updated expenses
      fetchIncome();
     } catch (error) {
         console.error('Error:', error);
     }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
        ...prevData,
        [name]: value,
    }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const { date, category, amount, description } = formData;
  const newExpense = {
      user_id: userId,
      date,
      category,
      amount: parseFloat(amount),
      description,
  };

  try {
      const response = await fetch('http://localhost:5000/store_expenses', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(newExpense),
      });
      if (!response.ok) {
          throw new Error('Error adding expense');
      }
      const data = await response.json();
      console.log('Expense added:', data);
      // Clear the form
      setFormData({
        date: '',
        category: categories[0],
        amount: '',
        description: '',
    });
      // Fetch updated expenses
      fetchExpenses();
  } catch (error) {
      console.error('Error:', error);
  }
};

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
    }, [month, year, userId, expenses]);

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
                      <h1 className="nav-title">Budget ({monthNames[parseInt(month.toString().padStart(2, '0'))-1]}-{year}) </h1>
                    </div>
                    <Outlet />
                    <div>
                  <br></br>
                  <form onSubmit={handleSubmit} className="expense-form">
                        <label>Date</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          required
                        />
                        <label>Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                          ))}
                        </select>
                        <label>Amount</label>
                        <input
                           type="number"
                           name="amount"
                           value={formData.amount}
                           onChange={handleChange}
                           required
                           step="0.01"
                        />
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />

                        <button type="submit" className="add-expense">Add Expense</button>
                    </form>

                    <br></br>
                  <label htmlFor="month" className="month-label">Select Month:</label>
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
                  <label htmlFor="month" className="income-label">Monthly Income</label>
                  <input
                    type="number"
                    id="income"
                    value={income}
                    onChange={(e)=>setIncome(e.target.value)}
                  />
                  <button
                    type="button"
                    className="add-income"
                    onClick={()=> handleIncome()}
                  >
                    Add Income
                  </button>
                  <div className="balance-div">
                    <p>
                      <b>Income : </b>{parseInt(fetchedIncome)}
                    </p>
                    <p>
                      <b>Expense : </b>{grandTotal}
                    </p>
                    <p>
                      <b>Balance : </b>{fetchedIncome - grandTotal}
                    </p>
                  </div>

                 <table border="1" style={{ width: '100%', marginTop: '20px', textAlign: 'center' }}>
                   <thead className="sticky-header">
                     <tr>
                       <th>Date</th>
                       {categories.map((category, index) => (
                         <th key={index}>{category.charAt(0).toUpperCase() + category.slice(1)}</th>
                       ))}
                       <th>Date Total</th>
                     </tr>
                   </thead>
                   <tbody>
                   {daysInMonth.map((date, index) => {
                     const formattedDate = date.toISOString().split('T')[0];
                     return (
                       <tr key={index}>
                         <td>{formattedDate}</td>
                         {categories.map((category, catIndex) => (
                           <td key={catIndex}>
                             {Math.floor(expensesByDate[formattedDate][category])} {/* Show as integer */}
                             {/* Show all descriptions for the current category */}
                             {expenses
                               .filter(expense => 
                                 expense.date.split('T')[0] === formattedDate && 
                                 expense.category === category
                               )
                               .map((expense, expIndex) => (
                                 <div key={expIndex} style={{ fontSize: 'small', color: 'gray' }}>
                                   {expense.description}
                                 </div>
                             ))}
                           </td>
                         ))}
                         <td>{Math.floor(dateTotals[formattedDate])}</td> {/* Show date total as integer */}
                       </tr>
                     );
                   })} 
                     <tr>
                       <td><strong>Category Total</strong></td>
                       {categories.map((category, index) => (
                         <td key={index}>
                           <strong>{categoryTotals[category]}</strong>
                         </td>
                       ))}
                       <td><strong>{grandTotal}</strong></td>
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
