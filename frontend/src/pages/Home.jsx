import { useState, useContext } from "react";
import "../styles/home.css";
import TaskColumn from "../components/column";
import { TasksContext } from "../context";

function App() {

  const [selectedProject, setSelectedProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { toDo, doing, done } = useContext(TasksContext);
  
  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
    <div className='body'>
      <div className='container'>
        <div className='barSection'>
            <h1>LP Tarefas</h1>
            <div>
                <select   
                id="projectSelect" 
                className="custom-select"
                value={selectedProject} 
                onChange={handleProjectChange}>
                <option value="" disabled hidden>Selecione um projeto</option>
                <option value="college">Faculdade</option>
                <option value="job">Trabalho</option>
                <option value="home">Casa</option>
                </select>
            </div>
          <div>
            <input
              type="text"
              id="searchInput"
              className="custom-input"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Digite para pesquisar..."
            />
          </div>
        </div>
        
          <div className='tasksArea'>
            <TaskColumn column={"Pendências"} index={1} array={toDo}/>
            <TaskColumn column={"Em andamento"} index={2} array={doing}/>
            <TaskColumn column={"Concluídas"} index={3} array={done}/>
          </div>
      </div>
    </div>
    </>
  )
}

export default App
