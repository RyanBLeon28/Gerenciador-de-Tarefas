// import axios from "axios";

// const api = axios.create({
//     baseURL: "http://localhost:6900",
// });

// export const Login = async (username, password) => {
//     const headerParams = {
//         headers: {
//             'Content-Type': 'application/json'  
//         }
//     }
//     const body = {
//         login: {
//             username, 
//             password
//         }
//     }
//     await api.post('/login', body, headerParams)
//     .then(response => {
//         SaveToken(response)
//     })
//     .catch(error => {
//         console.error('Erro ao cadastrar usuário:', error);
//     });
// };

// export const Register = async (username, password) => {
//     const headerParams = {
//         headers: {
//             'Content-Type': 'application/json'  
//         }
//     }
//     const body = {
//         login: {
//             username, 
//             password
//         }
//     }
//     await api.post('/user', body, headerParams)
//     .then(response => {
//         SaveToken(response)
//     })
//     .catch(error => {
//         console.error('Erro ao registrar usuário:', error);
//     });
// };