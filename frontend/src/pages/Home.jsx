import { useState } from "react"
import "../styles/home.css";
import {toDo, doing} from "../components/Data";
import ModalAddTask from "../components/Modal";

function App() {
  const [selectedProject, setSelectedProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
          <div className='containerTasks'>
            <div className='headerTasks'>
                <h2>Tarefas</h2>
                <button className="setting-button" >
                    <p>...</p>
                </button>
            </div>
            {toDo.map((task, index) => (
              <div key={index} className="task-item">
                <h4>{task.title}</h4>
                <p><strong>Responsável:</strong> {task.responsible}</p>
                <p><strong>Tarefa:</strong> {task.task}</p>
              </div>
            ))}
            <button className="add-button" >
                <ModalAddTask />
            </button>
          </div>
          <div className='containerTasks'>
            <div className='headerTasks'>
                <h2>Em andamento</h2>
                <button className="setting-button" >
                    <p>...</p>
                </button>
            </div>
            {doing.map((task, index) => (
              <div key={index} className="task-item">
                <h4>{task.title}</h4>
                <p><strong>Responsável:</strong> {task.responsible}</p>
                <p><strong>Tarefa:</strong> {task.task}</p>
              </div>
            ))}
          </div>
          <div className='containerTasks'>
            <div className='headerTasks'>
                <h2>Concluídas</h2>
                <button className="setting-button" >
                    <p>...</p>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default App
