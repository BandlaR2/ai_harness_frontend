import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [briefQuestion, setBriefQuestion] = useState('');
  const [longQuestion, setLongQuestion] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchTermBrief, setSearchTermBrief] = useState('');
  const [deleteButtonsEnabled, setDeleteButtonsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveDisabled, setSaveDisabled] = useState(true); 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5005/questions');
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        setQuestions(data);
        setOriginalQuestions(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  // Update save button state based on input field values
  useEffect(() => {
    const isDisabled = briefQuestion.trim() === '' || longQuestion.trim() === '';
    setSaveDisabled(isDisabled);
  }, [briefQuestion, longQuestion]);


  const handleSaveQuestion = async () => {
    console.log('Brief Question:', briefQuestion);
    console.log('Long Question:', longQuestion);
  
     
  
    // Use brief question as long question if long question is empty
    const finalLongQuestion = longQuestion.trim() ? longQuestion : briefQuestion;
    console.log('Final Long Question:', finalLongQuestion);
    if (!briefQuestion.trim()) {
      alert('Brief question and long question are required.');
      return;
    }
  
    try {
      // Send an HTTP POST request to the server
      const response = await fetch('http://localhost:5005/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brief_question: briefQuestion,
          long_question: finalLongQuestion,
        }),
      });
  
      console.log('Response:', response);
      // Handle response from server
      if (response.ok) {
        // If successful, update local state with the new question
        const newQuestion = await response.json();
        console.log('New Question:', newQuestion);
        setQuestions([...questions, newQuestion]);
        setBriefQuestion('');
        setLongQuestion('');
      } else {
        // If there's an error, throw an error
        throw new Error('Failed to save question');
      }
    } catch (error) {
      // Handle any errors that occur during the process
      setError(error.message);
    }
  };
  

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5005/questions/${id}`, { method: 'DELETE' });
      const updatedQuestions = questions.filter(question => question.id !== id);
      setQuestions(updatedQuestions);

      // Clear input fields if the selected question is deleted
      if (selectedQuestion && selectedQuestion.id === id) {
        setSelectedQuestion(null);
        setBriefQuestion('');
        setLongQuestion('');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSelectQuestion = async (question) => {
    setSelectedQuestion(question);
    setBriefQuestion(question.brief_question);
    setLongQuestion(question.long_question);
  };

  const handleSearchBrief = async () => {
    try {
      const response = await fetch(`http://localhost:5005/search-questions?searchTerm=${searchTermBrief}`);

      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        throw new Error('Failed to fetch search results');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleClear = async () => {
   
    // Clear local state
    setBriefQuestion('');
    setLongQuestion('');
    setSelectedQuestion(null);
  };

  const toggleDeleteButtons = () => {
    setDeleteButtonsEnabled(!deleteButtonsEnabled);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="app-container">
      <div className="questions-box">
        <div className="header-section">
          <h1>Questions</h1>
          <button onClick={toggleDeleteButtons} className="delete-button">
            {deleteButtonsEnabled ? 'hide delete' : 'Show Delete'}
          </button>

          <div className="search-section">
            <input
              type="text"
              placeholder="search for question"
              value={searchTermBrief}
              onChange={(e) => setSearchTermBrief(e.target.value)}
            />
            <button onClick={handleSearchBrief}>Search</button>
          </div>
        </div>

        <div className="question-list">
          {questions.map((question, index) => (
            <a key={question.id} href="#"  className="question-box" onClick={() => handleSelectQuestion(question)}>
              <strong>{index + 1}. {question.brief_question}</strong>
              {deleteButtonsEnabled && (
                <button onClick={() => handleDelete(question.id)} className="enabled">
                  Delete
                </button>
              )}
            </a>
          ))}
        </div>
      </div>

      <div className="input-container">
        <h2>Add Question</h2>
        <label>Brief Question:</label>
        <input
          type="text"
          value={briefQuestion}
          onChange={(e) => setBriefQuestion(e.target.value)}
        />
        <label>Long Question:</label>
        <textarea
          value={longQuestion}
          onChange={(e) => setLongQuestion(e.target.value)}
        ></textarea>
        <button onClick={handleSaveQuestion} >Save</button>
        <button onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
}

export default App;
