import React, { useState, useEffect, createContext } from "react";
import { taskList } from "../service/tasklistService";
export const TasksContext = createContext();

const TasksProvider = ({ children }) => {

    const [selectedProject, setSelectedProject] = useState("");
    const [areas, setAreas ] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [tasksList, setTasksList] = useState([]);
    
    const [ toDo, setToDo ] = useState([]);
    const [ doing, setDoing ] = useState([]);
    const [ done, setDone ] = useState([]);

    const [deleteTask, setDeleteTask] = useState(false);

    const handleLoadTasks = async () => {
      const data = await taskList();
      setTasksList(data);
      
      const newAreas = data.map(element => ({ id: element.id, title: element.title }));
      setAreas(newAreas)
    }

    const handleFilter = (selected) => {
      let filteredTasks = tasksList;
      // console.log("lista", taskList)
      filteredTasks = tasksList.filter(e => e.title === selected);
      setToDo(filteredTasks[0].data.filter(task => task.status === 0));
      setDoing(filteredTasks[0].data.filter(task => task.status === 1));
      setDone(filteredTasks[0].data.filter(task => task.status === 2));
    }

    useEffect(() => {
      handleLoadTasks()
    }, []);

    // useEffect(() => {
    //   handleLoadTasks()
    // }, [deleteTask]);
    

    useEffect(() => { 
      if (selectedProject) {
        handleFilter(selectedProject)
        // console.log("chama o filter");
      } 
      
    }, [selectedProject, taskList]);


    return(
        <TasksContext.Provider value={{ 
          toDo, setToDo, 
          doing, setDoing, 
          done, setDone, 
          searchTerm, setSearchTerm, 
          selectedProject, setSelectedProject, 
          areas, setAreas,
          setDeleteTask,
          setTasksList,
          isModalOpen, setIsModalOpen}}>
            {children}
        </TasksContext.Provider>
    );
}

export default TasksProvider;