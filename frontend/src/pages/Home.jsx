import { useState } from "react";
import "../styles/home.css";
import { tasksList as initialTasksList } from "../components/Data";
import ModalAddTask from "../components/Modal";

function Home() {
  const [tasksList, setTasksList] = useState(initialTasksList);
  const [selectedProject, setSelectedProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const updatedTasks = tasksList.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasksList(updatedTasks);
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
                onChange={handleProjectChange}
              >
                <option value="" disabled hidden>Área</option>
                <option value="faculdade">Faculdade</option>
                <option value="trabalho">Trabalho</option>
                <option value="casa">Casa</option>
              </select>
            </div>
          </div>
          <div className='tasksArea'>
            <div className='containerTasks'>
              <div className='headerTasks'>
                <h2>Tarefas</h2>
                <button className="setting-button">
                  <p>...</p>
                </button>
              </div>
              {tasksList
                .filter(task =>
                  task.title.includes(searchTerm) &&
                  (!selectedProject || task.area === selectedProject) &&
                  task.status === 'toDo'
                )
                .map((task) => (
                  <div key={task.id} className="task-item">
                    <h4>{task.title}</h4>
                    <p><strong>Responsável:</strong> {task.responsible}</p>
                    <p><strong>Tarefa:</strong> {task.task}</p>
                    <button className="status-button" onClick={() => updateTaskStatus(task.id, 'doing')}>
                      Iniciar
                    </button>
                  </div>
              ))}
              <button className="add-button">
                <ModalAddTask />
              </button>
            </div>
            <div className='containerTasks'>
              <div className='headerTasks'>
                <h2>Em Andamento</h2>
                <button className="setting-button">
                  <p>...</p>
                </button>
              </div>
              {tasksList
                .filter(task =>
                  task.title.includes(searchTerm) &&
                  (!selectedProject || task.area === selectedProject) &&
                  task.status === 'doing'
                )
                .map((task) => (
                  <div key={task.id} className="task-item">
                    <h4>{task.title}</h4>
                    <p><strong>Responsável:</strong> {task.responsible}</p>
                    <p><strong>Tarefa:</strong> {task.task}</p>
                    <button className="status-button" onClick={() => updateTaskStatus(task.id, 'toDo')}>
                      Reverter
                    </button>
                    <button className="status-button" onClick={() => updateTaskStatus(task.id, 'done')}>
                      Concluir
                    </button>
                  </div>
              ))}
            </div>
            <div className='containerTasks'>
              <div className='headerTasks'>
                <h2>Concluídas</h2>
                <button className="setting-button">
                  <p>...</p>
                </button>
              </div>
              {tasksList
                .filter(task =>
                  task.title.includes(searchTerm) &&
                  (!selectedProject || task.area === selectedProject) &&
                  task.status === 'done'
                )
                .map((task) => (
                  <div key={task.id} className="task-item">
                    <h4>{task.title}</h4>
                    <p><strong>Responsável:</strong> {task.responsible}</p>
                    <p><strong>Tarefa:</strong> {task.task}</p>
                    <button className="status-button" onClick={() => updateTaskStatus(task.id, 'doing')}>
                      Reabrir
                    </button>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
