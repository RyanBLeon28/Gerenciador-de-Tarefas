import { useState } from "react"
import { useNavigate } from "react-router-dom";
import '../styles/loginB.css'
import { SaveToken } from "../service/util";

function LoginB() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:6900/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Usuário ou senha incorretos.');
      }

      const data = await response.json();

      const token = data.token;
      if (token) {
        // Armazena o token no localStorage
        SaveToken(token)
        navigate('/home');
        // localStorage.setItem('authToken', token);
        // setError('');
        // navigate('/home');
      } else {
        setError('Falha ao obter o token de autenticação.');
      }
    } catch (err) {
      setError(err.message);
    }
  };


  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Usuário:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button">Entrar</button>
      </form>
      <button className="register-button" onClick={goToRegister}>Registrar</button>
    </div>
  );
}

export default LoginB;
