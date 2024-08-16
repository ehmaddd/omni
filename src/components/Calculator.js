import React, { useState } from 'react';
import './Calculator.css';

const Calculator = () => {
  const [val1, setVal1] = useState(0);
  const [val2, setVal2] = useState(0);
  const [operation, setOperation] = useState('+');
  const [result, setResult] = useState(null);

  const handleCalculation = () => {
    let calculatedResult;

    switch (operation) {
      case '+':
        calculatedResult = Number(val1) + Number(val2);
        break;
      case '-':
        calculatedResult = Number(val1) - Number(val2);
        break;
      case '*':
        calculatedResult = Number(val1) * Number(val2);
        break;
      case '/':
        calculatedResult = val2 !== 0 ? Number(val1) / Number(val2) : 'Cannot divide by zero';
        break;
      default:
        calculatedResult = 'Invalid operation';
    }

    setResult(calculatedResult);
    reset();
  };

  const reset = () => {
    setTimeout(() => {
      setVal1(0);
      setVal2(0);
      setOperation('+');
      setResult(null);
    }, 3000);
  };

  return (
    <div className="calculator-container">
      <h1 className="calculator-title">Calculator</h1>
      <div className="calculator-body">
        <input
          type="number"
          value={val1}
          onChange={(e) => setVal1(e.target.value)}
          placeholder="First Number"
          className="calculator-input"
        />
        <input
          type="number"
          value={val2}
          onChange={(e) => setVal2(e.target.value)}
          placeholder="Second Number"
          className="calculator-input"
        />
        <div className="operation-buttons">
          <label className="radio-label">
            <input
              type="radio"
              value="+"
              checked={operation === '+'}
              onChange={(e) => setOperation(e.target.value)}
            />
            &nbsp;&nbsp;+
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="-"
              checked={operation === '-'}
              onChange={(e) => setOperation(e.target.value)}
            />
            &nbsp;&nbsp;-
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="*"
              checked={operation === '*'}
              onChange={(e) => setOperation(e.target.value)}
            />
            &nbsp;&nbsp;*
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="/"
              checked={operation === '/'}
              onChange={(e) => setOperation(e.target.value)}
            />
            &nbsp;&nbsp;/
          </label>
        </div>
        <button className="calculate-button" onClick={handleCalculation}>Calculate</button>
        <div className="result-box">
          <h3 className="result-text">Result: {result}</h3>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
