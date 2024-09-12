import { RetrieveToken } from "./util";

export const taskList = async () => {
    try {
      const token = RetrieveToken(); 
      const response = await fetch('http://localhost:6900/user/tasklist', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      return data;
      
    } catch (error) {
      console.error('Erro:', error.message);
      return [];
    }
};