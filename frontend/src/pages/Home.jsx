import { useState, useEffect, useContext } from "react";
import "../styles/home.css";
import { Flex, Select, Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import TaskColumn from "../components/column";
import { TasksContext } from "../context";
import { RemoveToken } from "../service/util";
import { Navigate } from "react-router-dom";

function Home() {
  
  const { areas } = useContext(TasksContext);
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

  const handleLogout = () => {
    RemoveToken();
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <div className='container'>
        <div className='barSection'>
          <h1>LP Tarefas</h1>
          <div>
          <Flex gap="large">
            <Select
              defaultValue="Selecionar área"
              style={{ width: 180 }}
              onChange={handleProjectChange}
              options={areas.map(element => ({
                value: element.title, 
                label: element.title,  
              }))}
            />
            <Button 
              icon={<LogoutOutlined style={{ fontSize: '26px', color: "#FFF" }}/>} 
              style={{ background: "transparent", border: "none" }}
              onClick={handleLogout} 
            />
          </Flex>
          </div>
        </div>
        <div className='tasksArea'>
          <TaskColumn column={"Pendências"} index={0} array={toDo}/>
          <TaskColumn column={"Em andamento"} index={1} array={doing}/>
          <TaskColumn column={"Concluídas"} index={2} array={done}/>
        </div>
      </div>
    </>      
  );
}

export default Home;

