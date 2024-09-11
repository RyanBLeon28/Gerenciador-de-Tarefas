import React, { useState, useEffect, createContext } from "react";
// import { toDoList, doingList, doneList } from "../components/Data";
import { tasksList as initialTasksList } from "../components/Data";
import { RetrieveToken } from "../service/util";
export const TasksContext = createContext();

const TasksProvider = ({ children }) => {

    const [selectedProject, setSelectedProject] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState('');

    const [tasksList, setTasksList] = useState(initialTasksList);

    const [ toDo, setToDo ] = useState([]);
    const [ doing, setDoing ] = useState([]);
    const [ done, setDone ] = useState([]);

    useEffect(() => {
        // const token = RetrieveToken(); 
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmF0aW9uIjoxNTAwMDAwLCJpZCI6N30.FUf9G0QH8L-rUokLMVvdIXOVXFblkKAxgkK4jan_gUk";
        console.log("TOKEN",token);
        fetch('http://localhost:6900/user/tasklist',{
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'token': token
            }
          })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              console.log(data); // Processa os dados retornados
            })
            .catch(error => {
              console.error('Erro:', error.message); // Detalha o erro
            });

        //         // Filtra as tarefas com base no status
        //         // setToDo(data.filter(task => task.status === 'toDo'));
        //         // setDoing(data.filter(task => task.status === 'doing'));
        //         // setDone(data.filter(task => task.status === 'done'));
        //     } catch (err) {
        //         console.error(err.message);
        //     }
        // };

        // fetchTasks();
    }, []);

    // useEffect(() => {
    //     setToDo(tasksList.filter(task => task.status === "toDo"));
    //     setDoing(tasksList.filter(task => task.status === "doing"));
    //     setDone(tasksList.filter(task => task.status === "done"));
    // }, []);

    useEffect(() => {
        let filteredTasks = tasksList
        if (selectedProject) {
            filteredTasks = tasksList.filter(task => task.area === selectedProject);
        } 
        setToDo(filteredTasks.filter(task => task.status === "toDo"));
        setDoing(filteredTasks.filter(task => task.status === "doing"));
        setDone(filteredTasks.filter(task => task.status === "done"));
    }, [selectedProject]);


    return(
        <TasksContext.Provider value={{ toDo, setToDo, doing, setDoing, done, setDone, searchTerm, setSearchTerm, setSelectedProject}}>
            {children}
        </TasksContext.Provider>
    );
}

export default TasksProvider;