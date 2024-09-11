import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginB from "./pages/LoginB";
import Register from "../src/pages/Register";
import Home from "../src/pages/Home";
import { RetrieveToken } from "./service/util";

function App() {

  const ProtectedRoute = ({ children }) => {
    if (!RetrieveToken()) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return ( 
    <Router>
      <Routes>
        <Route path="/" element={<LoginB />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
    );
  }
  
  export default App;