const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5005;

const pool = new Pool({
    user: "postgres",
    password: "password",
    database: "CustomerDatabase",
    host: "localhost",
    port: 5432
});

// Apply CORS middleware at the beginning
app.use(cors());
app.use(express.json());

// Get all questions
app.get('/questions', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM questions');
        res.json(rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to fetch question details by ID
app.get('/api/questions/:id', async (req, res) => {
    try {
      const questionId = req.params.id;
      const result = await pool.query('SELECT * FROM fn_get_question_details_by_id($1)', [questionId]);
      const questionDetails = result.rows;
  
      if (questionDetails.length === 0) {
        return res.status(404).json({ error: 'Question not found.' });
      }
  
      res.json(questionDetails[0]);
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


// Define the route to handle saving a new question
app.post('/questions', async (req, res) => {
    const { brief_question, long_question } = req.body;

    // Check if both arguments are provided in the request body
    if (!brief_question || !long_question) {
        return res.status(400).json({ error: 'Brief question and long question are required.' });
    }

    try {
        // Execute the PostgreSQL function to insert a row
        const result = await pool.query('SELECT * FROM fn_insert_row($1, $2)', [brief_question, long_question]);

        // Send the result of the function call as the response
        res.json(result.rows[0]); // Assuming the function returns something
    } catch (error) {
        // Handle any errors that occur during query execution
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Define the route to handle deleting a row
app.delete('/delete-row/:id', async (req, res) => {
    const questionId = req.params.id;

    // Check if the id is provided in the request params
    if (!questionId) {
        return res.status(400).json({ error: 'Invalid question ID.' });
    }

    try {
        // Execute the PostgreSQL function to delete the row
        await pool.query('SELECT * FROM fn_delete_row($1)', [questionId]);

        // Send a success response
        res.json({ message: 'Row deleted successfully.' });
    } catch (error) {
        // Handle any errors that occur during query execution
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// // Define the route to handle clearing all questions
// app.post('/clear-questions', async (req, res) => {
//     try {
//         // Execute the PostgreSQL function to clear all questions
//         await pool.query('SELECT fn_clear_questions()');

//         // Send a success response
//         res.status(200).json({ message: 'Questions cleared successfully' });
//     } catch (error) {
//         // Handle any errors that occur during the execution of the function
//         console.error('Error clearing questions', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });



// Define the route to handle searching for questions
app.get('/search-questions', async (req, res) => {
    try {
        // Extract the search term from the query parameters
        const searchTerm = req.query.searchTerm;

        // Call the PostgreSQL function to search for questions
        const result = await pool.query('SELECT * FROM fn_search_questions($1)', [searchTerm]);

        // Extract the found questions from the query result
        const foundQuestions = result.rows;

        // Send the found questions as the response
        res.json(foundQuestions);
    } catch (error) {
        // Handle any errors that occur during the search process
        console.error('Error searching questions', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Define the route to handle searching for questions by long question
app.get('/questions/search-long', async (req, res) => {
    try {
        // Extract the search term from the query parameters
        const searchTerm = req.query.searchTerm;

        // Call the PostgreSQL function to search for questions by long question
        const result = await pool.query('SELECT * FROM fn_search_questions_by_long($1)', [searchTerm]);

        // Extract the found questions from the query result
        const foundQuestions = result.rows;

        // Send the found questions as the response
        res.json(foundQuestions);
    } catch (error) {
        // Handle any errors that occur during the search process
        console.error('Error searching questions', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
