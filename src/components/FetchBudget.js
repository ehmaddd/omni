import { useEffect, useState } from "react";

const FetchBudget = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [income, setIncome] = useState(0);
  const userId = localStorage.getItem('user');

  // Get the current year and month
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // JS months are 0-indexed, so add 1

  // Fetch the current month's expenses
  const fetchExpenses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/expenses/${userId}/${year}/${month}`);
      const data = await response.json();

      setExpenses(data);

      // Calculate the total expenses
      const total = data.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      setTotalExpenses(total);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  // Fetch the current month's income
  const fetchIncome = async () => {
    try {
      const response = await fetch(`http://localhost:5000/fetch_income/${userId}/${year}/${month}`);
      const data = await response.json();
      
      // Assuming data.amount returns a single income value for the current month
      setIncome(data[0].amount);
    } catch (error) {
      console.error('Error fetching income:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchIncome();
  }, [userId, year, month]);

  // Calculate in-hand or deficit amount
  const inHandAmount = income - totalExpenses;

  return (
    <div className="budgetDiv" style={{borderStyle: 'solid', borderColor: 'gainsboro', borderRadius: '16px', borderWidth: '1px', padding: '12px', height: 'auto', marginLeft: '2rem'}}>
      <h3>Monthly Budget</h3>
      <p style={{display: 'inline-block', marginBottom: '-15px'}}><strong>Total Income:</strong> {parseInt(income)}</p><br></br>
      <p style={{display: 'inline-block', marginBottom: '-15px'}}><strong>Total Expenses:</strong> {totalExpenses}</p><br></br>
      <p style={{display: 'inline-block'}}>
        <strong>{inHandAmount >= 0 ? 'In Hand Amount' : 'Deficit Amount'}:</strong> {Math.abs(inHandAmount)}
      </p>
    </div>
  );
};

export default FetchBudget;
