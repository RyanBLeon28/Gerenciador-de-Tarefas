import React, { useState, useEffect, createContext } from "react";
import { taskList } from "../service/tasklistService";
export const TasksContext = createContext();

const TasksProvider = ({ children }) => {

    const [selectedProject, setSelectedProject] = useState("");
    const [areas, setAreas ] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");

    const [tasksList, setTasksList] = useState([]);
    
    const [ toDo, setToDo ] = useState([]);
    const [ doing, setDoing ] = useState([]);
    const [ done, setDone ] = useState([]);

    const handleLoadTasks = async () => {
      const data = await taskList();
      setTasksList(data);
      
      const newAreas = data.map(element => ({ id: element.id, title: element.title }));
      console.log(newAreas)
      setAreas(newAreas)
      console.log(areas)
    }

    const handleFilter = (selected) => {
      let filteredTasks = tasksList;
      filteredTasks = tasksList.filter(e => e.title === selected);
      setToDo(filteredTasks[0].data.filter(task => task.status === 0));
      setDoing(filteredTasks[0].data.filter(task => task.status === 1));
      setDone(filteredTasks[0].data.filter(task => task.status === 2));
    }

    useEffect(() => {
      handleLoadTasks()
    }, []);
    

    useEffect(() => { 
      if (selectedProject) {
          handleFilter(selectedProject)
      } 
    }, [selectedProject]);


    return(
        <TasksContext.Provider value={{ toDo, setToDo, doing, setDoing, done, setDone, searchTerm, setSearchTerm, setSelectedProject, areas}}>
            {children}
        </TasksContext.Provider>
    );
}

export default TasksProvider;