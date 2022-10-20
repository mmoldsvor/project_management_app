
const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
        return null;
    }
};

export function checkToken(){
    const token = sessionStorage.getItem("login-token")
    const decodedJWT = parseJwt(token)
    if (decodedJWT !== null) {
        if(decodedJWT.exp * 1000 < Date.now()) {
            window.location.href(window.location.host + "/logout")
        }
    }
    return token
}
export function setToken(token){
    sessionStorage.setItem("login-token", token)
}

export function isLoggedIn() {
    return (checkToken() !== "")
}
