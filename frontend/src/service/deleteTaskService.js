import { RetrieveToken } from "./util";

export const addTask = async (parent_id, title, description, status) => {
    console.log("addTask print ->", parent_id,title,description,status)
    try {
        
        const token = RetrieveToken(); 
        const response = await fetch('http://localhost:6900/user/tasklist/task', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
            "parent_id" : parent_id,
            "title" : title,
            "description" : description,
            "status" : status
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('Erro:', error, error.message);
      return [];
    }
};