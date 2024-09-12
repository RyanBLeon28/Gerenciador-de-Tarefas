import { RetrieveToken } from "./util";

export const createArea = async (title) => {
    try {
        const token = RetrieveToken();
        const response = await fetch('http://localhost:6900/user/tasklist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'token': token
        },
        body: JSON.stringify({ 
            "title" : title
        })
        });

        if (!response.ok) {
            throw new Error('Erro ao criar àrea.');
        }

        const data = await response.json();

        return data;

    } catch (error) {
        console.error('Erro:', error, error.message);
        return [];
    }
};