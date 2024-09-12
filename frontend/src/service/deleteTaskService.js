import { RetrieveToken } from "./util";

export const deleteTask = async (parent_id, id) => {
    console.log("Delete ->", parent_id, id)
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
            "data" : {
              "id" : id
            }
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete Error: ${errorText}`);
      }
      return;
      
    } catch (error) {
      console.error('Erro:', error, error.message);
      return [];
    }
};