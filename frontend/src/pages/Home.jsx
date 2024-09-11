import { useState, useContext } from "react";
import "../styles/home.css";
import { Select, Space } from 'antd';
import TaskColumn from "../components/column";
import { TasksContext } from "../context";


function Home() {
  
  const { selectedProject, setSelectedProject } = useContext(TasksContext);
  const { toDo, doing, done } = useContext(TasksContext);
  
  
  const handleProjectChange = (value) => {
    setSelectedProject(value);
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const updatedTasks = tasksList.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasksList(updatedTasks);
  };

  return (
    <>
      <div className='container'>
        <div className='barSection'>
          <h1>LP Tarefas</h1>
          <div>
          <Select
            defaultValue="Selecionar área"
            style={{ width: 180 }}
            onChange={handleProjectChange}
            options={[
              { value: 'university', label: 'Faculdade' },
              { value: 'work', label: 'Trabalho' },
              { value: 'house', label: 'casa' },
            ]}
          />
          </div>
        </div>
        <div className='tasksArea'>
          <TaskColumn column={"Pendências"} index={1} array={toDo}/>
          <TaskColumn column={"Em andamento"} index={2} array={doing}/>
          <TaskColumn column={"Concluídas"} index={3} array={done}/>
        </div>
      </div>
    </>      
  );
}

export default Home;

