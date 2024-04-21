// App.js

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5005/questions');
        if (response.ok) {
          const data = await response.json();
          setQuestions(data);
          setOriginalQuestions(data);
        } else {
          console.error('Failed to fetch questions');
        }
      } catch (error) {
        console.error('Error fetching questions', error);
      }
    };
    fetchData();
  }, []);

  const handleSaveQuestion = async () => {
    try {
        // Validate that both briefQuestion and longQuestion have values
    if (!briefQuestion || !longQuestion) {
        console.error('Brief question and long question are required.');
        return;
      }
  
      const response = await fetch('http://localhost:5005/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brief_question: briefQuestion,
          long_question: longQuestion,
        }),
      });

      if (response.ok) {
        const newQuestion = await response.json();
        setQuestions([...questions, newQuestion]);
        setBriefQuestion('');
        setLongQuestion('');
      } else {
        console.error('Failed to save question');
      }
    } catch (error) {
      console.error('Error saving question', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5005/questions/${id}`, { method: 'DELETE' });
      const response = await fetch('http://localhost:5005/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
        setSelectedQuestion(null);
        setSearchTermBrief('');
      } else {
        console.error('Failed to fetch questions after delete');
      }
    } catch (error) {
      console.error('Error deleting question', error);
    }
  };

  const handleSelectQuestion = async (question) => {
    try {
      const response = await fetch(`http://localhost:5005/questions/${question.id}`);
      
      if (response.ok) {
        const selectedQuestion = await response.json();
        setSelectedQuestion(selectedQuestion);
        setBriefQuestion(selectedQuestion.brief_question);
        setLongQuestion(selectedQuestion.long_question);
      } else {
        console.error('Failed to fetch question details');
      }
    } catch (error) {
      console.error('Error fetching question details', error);
    }
  };

  const handleSearchBrief = async () => {
    try {
      const response = await fetch(`http://localhost:5005/search-questions?searchTerm=${searchTermBrief}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
        setSelectedQuestion(null);
      } else {
        console.error('Failed to fetch search results');
      }
    } catch (error) {
      console.error('Error searching questions', error);
    }
  };

  const handleClearSearch = async () => {
    try {
      const response = await fetch('http://localhost:5005/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        console.error('Failed to fetch questions after clearing search');
      }
    } catch (error) {
      console.error('Error clearing search', error);
    }

    setSearchTermBrief('');
  };

  const handleClear = async () => {
    try {
      const response = await fetch('http://localhost:5005/clear-questions', {
        method: 'POST',
      });

      if (response.ok) {
        console.log('Questions cleared successfully');
      } else {
        console.error('Failed to clear questions');
      }
    } catch (error) {
      console.error('Error clearing questions', error);
    }
    
    setBriefQuestion('');
    setLongQuestion('');
    setSelectedQuestion(null);
  };

  const toggleDeleteButtons = () => {
    setDeleteButtonsEnabled(!deleteButtonsEnabled);
  };

  return (
    <div className="app-container">
      <div className="questions-container">
        <h1 style={{ display: 'inline-block', marginRight: '10px' }}>Questions</h1>
        <button onClick={toggleDeleteButtons}>
          {deleteButtonsEnabled ? 'Disable All' : 'Delete'}
        </button>
        <div>
          <input
            type='text'
            placeholder='search for question'
            value={searchTermBrief}
            onChange={(e) => setSearchTermBrief(e.target.value)}
          />
          <button onClick={handleSearchBrief}>search</button>
          {searchTermBrief && <button onClick={handleClearSearch}>clear search</button>}
        </div>
        <ul>
          {Array.isArray(questions) &&
            questions.map((question, index) => (
              <li key={question.id} onClick={() => handleSelectQuestion(question)}>
                <strong>{index + 1}.{question.brief_question}</strong>
                {deleteButtonsEnabled && (
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="enabled"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
        </ul>
      </div>

      <div className="input-container">
        <h2>Add Question</h2>
        {selectedQuestion ? (
          <div>
            <label>Brief Question:</label>
            <input type="text" value={selectedQuestion.brief_question} readOnly />
            <label>Long Question:</label>
            <textarea value={selectedQuestion.long_question} readOnly></textarea>
          </div>
        ) : (
          <>
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
          </>
        )}
        <button onClick={handleSaveQuestion}>Save</button>
        <button onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
}

export default App;
