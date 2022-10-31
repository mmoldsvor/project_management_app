
const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
        return null;
    }
};

export function checkToken(){
    const token = localStorage.getItem("login-token")
    const decodedJWT = parseJwt(token)
    if (decodedJWT !== null) {
        if(decodedJWT.exp * 1000 < Date.now()) {
            localStorage.removeItem("login-token")
            localStorage.removeItem("selected_project-id")
            window.location.href = window.location.origin + "/project_managment_app/login"
        }
    }
    return token
}
export function setToken(token){
    localStorage.setItem("login-token", token)
}

export function isLoggedIn() {
    return (checkToken() !== null)
}
