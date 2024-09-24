import { useEffect, useState } from "react";

const FetchTodo = () => {
  const [dbList, setDbList] = useState([]);
  const userId = localStorage.getItem('user');

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const dateTasks = getTodayDate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/fetch_todos/${userId}?date=${dateTasks}`, {
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
    };
    if (userId) {
      fetchData();
    }
  }, [userId, dateTasks]);

  // Filter tasks by priority
  const highPriorityTasks = dbList.filter(todo => todo.priority === "High");
  const mediumPriorityTasks = dbList.filter(todo => todo.priority === "Medium");
  const lowPriorityTasks = dbList.filter(todo => todo.priority === "Low");

  return (
    <div style={{ width: '20rem', borderStyle: 'solid', borderWidth: '1px', borderColor: 'gainsboro', borderRadius: '16px', padding: '10px', marginLeft: '1rem' }}>
      <h3 className="task-title-div" style={{textAlign: 'center', backgroundColor: 'gainsboro', marginBottom: '1.2rem'}}>Today Tasks</h3>
      
      <h5 style={{backgroundColor: 'orange', color: 'white', borderRadius: '16px', display: 'inline', padding: '3px 15px'}}>High Priority</h5>
      <ul style={{marginTop: '0.5rem'}}>
        {highPriorityTasks.length > 0 ? highPriorityTasks.map((todo, index) => (
          <li key={index}>{todo.task}</li>
        )) : <li>No High Priority Tasks</li>}
      </ul>

      <h5 style={{backgroundColor: 'olive', color: 'white', borderRadius: '16px', display: 'inline', padding: '3px 15px'}}>Medium Priority</h5>
      <ul style={{marginTop: '0.5rem'}}>
        {mediumPriorityTasks.length > 0 ? mediumPriorityTasks.map((todo, index) => (
          <li key={index}>{todo.task}</li>
        )) : <li>No Medium Priority Tasks</li>}
      </ul>

      <h5 style={{backgroundColor: 'green', color: 'white', borderRadius: '16px', display: 'inline', padding: '3px 15px'}}>Low Priority</h5>
      <ul style={{marginTop: '0.5rem'}}>
        {lowPriorityTasks.length > 0 ? lowPriorityTasks.map((todo, index) => (
          <li key={index}>{todo.task}</li>
        )) : <li>No Low Priority Tasks</li>}
      </ul>
    </div>
  );
};

export default FetchTodo;