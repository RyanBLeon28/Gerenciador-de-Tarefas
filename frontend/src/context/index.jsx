import React, { useState, useEffect, createContext } from "react";
// import { toDoList, doingList, doneList } from "../components/Data";
import { tasksList as initialTasksList } from "../components/Data";

export const TasksContext = createContext();

const TasksProvider = ({ children }) => {

    const [selectedProject, setSelectedProject] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [tasksList, setTasksList] = useState(initialTasksList);
    // const [filteredTasks, setFilderedTasks] = useState([]);

    const [ toDo, setToDo ] = useState([]);
    const [ doing, setDoing ] = useState([]);
    const [ done, setDone ] = useState([]);

    useEffect(() => {
        setToDo(tasksList.filter(task => task.status === "toDo"));
        setDoing(tasksList.filter(task => task.status === "doing"));
        setDone(tasksList.filter(task => task.status === "done"));
    }, []);

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