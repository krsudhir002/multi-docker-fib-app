
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Fib() {
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});
  const [index, setIndex] = useState('');

  useEffect(() => {
    fetchValues();
    const interval = setInterval(fetchValues, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchValues = async () => {
    const seenRes = await axios.get('http://localhost:5000/values/all');
    setSeenIndexes(seenRes.data);

    const valuesRes = await axios.get('http://localhost:5000/values/current');
    setValues(valuesRes.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/values', { index });
    setIndex('');
  };

  return (
    <div>
      <h1>Fib Calculater</h1>

      <form onSubmit={handleSubmit}>
        <label>Enter your index: </label>
        <input
          value={index}
          onChange={(e) => setIndex(e.target.value)}
        />
        <button>Submit</button>
      </form>

      <h3>Indices I have seen:</h3>
      <p>{seenIndexes.map(({ number }) => number).join(', ')}</p>

      <h3>Calculated Values:</h3>
      {Object.entries(values).map(([key, val]) => (
        <div key={key}>
          For index {key} I calculated {val}
        </div>
      ))}
    </div>
  );
}

export default Fib;
