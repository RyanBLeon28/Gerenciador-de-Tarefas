import React, { useState, useEffect, createContext } from "react";
// import { toDoList, doingList, doneList } from "../components/Data";
import { tasksList as initialTasksList } from "../components/Data";

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
        const fetchTasks = async () => {
            try {
                const response = await fetch('http://localhost:6900/user/tasklist', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }), // Verifique se username e password estão disponíveis
                });

                if (!response.ok) {
                    throw new Error('Erro ao buscar os dados');
                }

                const data = await response.json();
                console.log("Resposta",data)
                // Filtra as tarefas com base no status
                // setToDo(data.filter(task => task.status === 'toDo'));
                // setDoing(data.filter(task => task.status === 'doing'));
                // setDone(data.filter(task => task.status === 'done'));
            } catch (err) {
                setError(err.message);
            }
        };

        fetchTasks();
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