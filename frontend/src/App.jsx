import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginB from './pages/LoginB';
import Register from '../src/pages/Register';
import Home from '../src/pages/Home';

function App() {
  console.log('aqui no app');

  return ( 
    <Router>
      <Routes>
        <Route path="/" element={<LoginB />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
    );
  }
  
  export default App;