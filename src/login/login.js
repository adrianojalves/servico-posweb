import { InputText } from 'primereact/inputtext';
import {Password} from 'primereact/password';
import { Button } from 'primereact/button';
import React  from 'react';
import axios from 'axios';
import {isLogado} from '../auth';
import { URL_BACK, URL_MOCK, BACKEND} from "../auth";
import { Link } from 'react-router-dom';

export default class Login extends React.Component{
    constructor(props, context) {
        if(isLogado()){
            window.location.href="/home";
        }
        super();
        this.state = {login: '', senha: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        const dados = {
            login: this.state.login,
            senha: this.state.senha
        };

        if(BACKEND){
            axios.post(`${URL_BACK}/login`, dados)
                .then(res => this.validaAcesso(res))
                .catch(error => {
                    console.log(error);
                    this.mostraErro("Erro ao acessar serviço remoto");
                });
        }
        else{
            // axios.post(`${URL_MOCK}f7f428cf-7051-4d7a-a5f8-96db7f3e421c`, dados) //mockio cliente
            //     .then(res => this.validaAcesso(res))
            //     .catch(error => {
            //         console.log(error);
            //         this.mostraErro("Erro ao acessar serviço remoto");
            //     });
            axios.post(`${URL_MOCK}74ba9f9a-b46f-4ced-83ec-421e098e5cb9`, dados) //mockio prestador
                .then(res => this.validaAcesso(res))
                .catch(error => {
                    console.log(error);
                    this.mostraErro("Erro ao acessar serviço remoto");
                });
        }
    }

    mostraErro(msg){
       alert(msg);
    }

    validaAcesso(res){
        let obj = res.data;

        if(obj.erro){
            alert(obj.msg);
        }
        else{
            localStorage.setItem('usuario', JSON.stringify(obj));

            window.location.href="/home";
        }
    }

    render() {
        return (
            <div className="divLogin">
            <form onSubmit={this.handleSubmit} method="POST">
              <div className="p-fluid divLoginChild">
                  <div className="p-field">
                      <label htmlFor="login">Login</label>
                      <InputText id="login" name="login" value={this.state.login} type="text" onChange={this.handleChange}/>
                  </div>
                  <div className="p-field">
                      <label htmlFor="senha">Senha</label>
                      <Password id="senha" name="senha" value={this.state.senha} feedback={false} onChange={this.handleChange} /> 
                  </div>
    
                  <Button label="Logar" type="submit" className="p-button-raised p-button-secondary p-button-rounded" />

                  <Link to="/create-pessoa"><Button label="Criar Cadastro" className="p-button-link p-button-secondary" /></Link>
              </div>
            </form>
          </div>
        );
      }
}