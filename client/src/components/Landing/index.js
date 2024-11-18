import React, { useState } from 'react';

function Landing() {
  // State for storing the question and answer
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  // Handle the question input change
  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setAnswer('Loading answer... (this will be replaced by OpenAI API response)');
    
    // const response = await fetch('/api/openai', { method: 'POST', body: JSON.stringify({ question }) });
    // const data = await response.json();
    // setAnswer(data.answer);  // Assuming the response from OpenAI will have an answer field
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Ask a Question</h1>

      {/* Form for user input */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="question">Question:</label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={handleQuestionChange}
            placeholder="Enter your question"
            style={{ width: '300px', padding: '10px', margin: '10px 0' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>Submit</button>
      </form>

      {/* Display the answer here */}
      {answer && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default Landing;