export const isLogado = () => {
    let user = localStorage.getItem('usuario');

    if(user === undefined || user=="null" || user==null){
        return false;
    }
    else{
        return true;
    }
}

export const URL_MOCK = "https://run.mocky.io/v3/";
export const URL_BACK = "http://localhost:4000/api";

export const BACKEND=false;