import React, { useEffect, useState } from 'react'

const Home = () => {
    const[questions,setQuestions]=useState([])
    const[briefQuestion,setBriefQuestion]=useState('');
    const[longQuestion,setLongQuestion]=useState('')
    const[selectedQuestion,setSelectedQuestion]= useState(null)
    const[searchTermBrief,setSearchTermBreif]=useState('');

   
    useEffect(()=>{
        const fetchData = async ()=>{
            const response =await fetch('http://localhost:5005/questions');
            if (response.ok) {
                const data = await response.json();
                setQuestions(data);
              } else {
                console.error('Failed to fetch questions');
              }
        }
        fetchData();
    },[])

    const handleSaveQuestion = async()=>{
       const response=await fetch('http://localhost:5005/questions',{
            method: 'POST',
            headers :{
                'Content-Type':'application/json',
            },
            body:JSON.stringify({
                brief_question:briefQuestion,
                long_question : longQuestion,
            })
        })
        if(response.ok){
            const newQuestion = await response.json();
            setQuestions([...questions,newQuestion]);
            setBriefQuestion('');
            setLongQuestion('');

        }else{
            console.log('Failed to save question')
        }
    }


    const handleSearchBrief =()=>{
        const foundBreifQuestion = questions.find(
            (question)=>
            question.breif_question.toLowerCase().includes(searchTermBrief.toLowerCase())
        );
        if (foundBreifQuestion.ok){
            setSelectedQuestion(foundBreifQuestion)
        }else{
            setSelectedQuestion(null);
        }
    }


    const handleDelete= async(id)=>{
       await fetch(`http://localhost:5005/questions/${id}` ,
       {method:'Delete'});
       const response =await fetch('http://localhost:5005/questions');
       if(response.ok){
        const data=await response.json();
         setQuestions(data);
         setSelectedQuestion(null);
       }else{
        console.error('Failed to fetch questions after delete');
       }
    }
    const handleSelectQuestion =(question) =>{
        setSelectedQuestion(question)
    }
  return (
    <div>Home
        <div>
            {Array.isArray(questions)&&
             questions.map((question)=>(
                <li key={question.id} onClick={()=>handleSelectQuestion(question)}>
                    <strong>{question.long_question}</strong>
                    <button onClick={()=>handleDelete(question.id)}>Delete</button>
                </li>
             ))
            }
        </div>
        <div>
           <div>
           <h1>Add Question</h1>
            <label>Brief Question: </label>
            <input type='text' 
               value={briefQuestion}
               onChange={(e)=>setBriefQuestion(e.target.value)}
            />
           </div>
            <div>
            <label>Long Question :</label>
            <input type='text' 
               value={longQuestion}
               onChange={(e)=>setLongQuestion(e.target.value)}
            />
            <button onClick={handleSaveQuestion}>save</button>
            </div>
            <div>
            <label>Brief Question Search:</label>
            <input type='text'
               placeholder='Search for a brief question....'
               value ={searchTermBrief}
               onChange={(e)=>setSearchTermBreif(e.target.value)}
               />
            <button onClick={handleSearchBrief}>Search</button>
            </div>
            <div>
                <label>Selected Question</label>
                {selectedQuestion && (
                    <div>
                        <strong>{selectedQuestion.breif_question} </strong>
                        <p>{selectedQuestion.long_question}</p>
                    </div>
                )}
            </div>
        </div>

    </div>
  )
}

export default Home