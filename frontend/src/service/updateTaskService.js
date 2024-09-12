import { RetrieveToken } from "./util";

export const createArea = async (parent_id, title, description, status) => {
    try {
        const token = RetrieveToken();
        const response = await fetch('http://localhost:6900/user/tasklist/task', {
        method: 'PATCH',
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
        throw new Error('Usuário ou senha incorretos.');
        }

        const data = await response.json();

    } catch (error) {
        console.error('Erro:', error, error.message);
        return [];
    }
};