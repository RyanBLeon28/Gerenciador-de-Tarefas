import React, { useState } from 'react';

const TabBar = () => {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <div>
      <div className="tabBar">
        <button onClick={() => setActiveTab('Home')}>Home</button>
        <button onClick={() => setActiveTab('Tasks')}>Tasks</button>
        <button onClick={() => setActiveTab('Settings')}>Settings</button>
      </div>
      <div className="tabContent">
        {activeTab === 'Home' && <div>Home Content</div>}
        {activeTab === 'Tasks' && (
          <div>
            <div className='containerTasks'>
              <p>Tarefas</p>
            </div>
            <div className='containerTasks'>
              <p>Em andamento</p>
            </div>
            <div className='containerTasks'>
              <p>Concluídas</p>
            </div>
          </div>
        )}
        {activeTab === 'Settings' && <div>Settings Content</div>}
      </div>
    </div>
  );
};

export default TabBar;