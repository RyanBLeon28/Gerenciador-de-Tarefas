export const SaveToken = (token) => localStorage.setItem("authToken", token);

export const RetrieveToken = () => localStorage.getItem("authToken");

export const RemoveToken = () => {
    localStorage.removeItem("authToken");
    window.location.reload();
}