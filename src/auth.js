export const isLogado = () => {
    let user = localStorage.getItem('usuario');

    if(user === undefined || user==="null" || user===null){
        return false;
    }
    else{
        return true;
    }
}

export const isCliente = () => {
    let user = localStorage.getItem('usuario');

    
    if(user === undefined || user==="null" || user===null){
        return false;
    }
    user = JSON.parse(user);

   // console.log("iscliente="+(user.tipoPessoa==="C"));
    return user.tipoPessoa==="C";
}

export const isPrestador = () => {
    let user = localStorage.getItem('usuario');

    if(user === undefined || user==="null" || user===null){
        return false;
    }

    user = JSON.parse(user);

    //console.log("isPRESTADOR="+(user.tipoPessoa==="P"));
    return user.tipoPessoa==="P";
}

export const getId = () => {
    let user = localStorage.getItem('usuario');

    if(user === undefined || user==="null" || user===null){
        return 0;
    }

    user = JSON.parse(user);

    return user.idPessoa;
}

export const URL_MOCK = "https://run.mocky.io/v3/";
export const URL_BACK = "http://localhost:5000/api";

export const BACKEND=false;