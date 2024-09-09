import React, { useState, createContext } from "react";
import { toDoList, doingList, doneList } from "../components/Data";

export const TasksContext = createContext();

const TasksProvider = ({ children }) => {
    const [ toDo, setToDo ] = useState(toDoList);
    const [ doing, setDoing ] = useState(doingList);
    const [ done, setDone ] = useState(doneList);

    return(
        <TasksContext.Provider value={{ toDo, setToDo, doing, setDoing, done, setDone }}>
            {children}
        </TasksContext.Provider>
    );
}

export default TasksProvider;