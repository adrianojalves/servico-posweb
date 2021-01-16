import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { URL_BACK, URL_MOCK, BACKEND} from "../auth";
import axios from 'axios';
import { InputNumber } from 'primereact/inputnumber';
import { SelectButton } from 'primereact/selectbutton';
import "./create-pessoa.css";
import classNames from 'classnames';
import {Password} from 'primereact/password';

export default class CreatePessoa extends Component {
  constructor(props) {
    super(props);
    this.options = ['Cliente', 'Prestador'];

    this.emptyPessoa = {
      idPessoa: null,
      nome: '',
      cpf: '',
      senha: '',
      telefone: '',
      experiencia: null,
      endereco: ''
    };

    this.state = {opcao: "Prestador", classCliente:"p-field hide", classPrestador: "p-field show",
      pessoa: this.emptyPessoa, valida: false
    };
  }

  save = () => {
    this.setState({
      valida: true
    });

    if(this.validar()){
      let pessoa = this.state.pessoa;

      if(this.isCliente()){
        pessoa.tipo="C";
      }
      else{
        pessoa.tipo="P";
      }
      //26555646004
      var url = BACKEND? `${URL_BACK}/pessoa`:`${URL_MOCK}e08f2b38-679c-4807-a04b-3c6f30749811`;

      axios.post(url, pessoa)
        .then(res => {
            if(res.data.erro){
              alert(res.data.msg);
            }
            else{
              alert("Cadastro efetuado com sucesso, logue para acessar o serviço");
              window.location.href="/";
            }
        })
        .catch(error => {console.log(this.state);
      
            console.log(error);
            this.mostraErro("Erro ao acessar serviço remoto");
        });
    }
  }

  validar = () => {
    let pessoa = this.state.pessoa;

    if(pessoa.nome.trim() && pessoa.cpf.trim() && pessoa.senha.trim()){
        return true;
    }
    else{
        return false;
    }
  }

  setarOpcao  = (e) => {
    if(e.value==null){
      if(this.isCliente()){
        e.value="Prestador";
      }
      else{
        e.value = "Cliente";
      }
    }
    this.setState({
        opcao: e.value
    });

    setTimeout(() => {
      this.setClass();
    }, 200); 
  }

  setClass(){
    if(this.isCliente()){
      this.setState({
          classCliente:"p-field show", classPrestador: "p-field hide"
      });
    }
    else{
      this.setState({
          classCliente:"p-field hide", classPrestador: "p-field show"
      });
    }
  }

  isCliente(){
    return this.state && this.state.opcao==='Cliente';
  }

  isPrestador(){
    return this.state && this.state.opcao==='Prestador';
  }

  onInputChange = (e, name) => {
      const val = (e.target && e.target.value) || '';
      let _pessoa = {...this.state.pessoa};
      _pessoa[`${name}`] = val;

      this.setState({
          pessoa: _pessoa,
      });
  }

  onInputNumberChange = (e, name) => {
      const val = e.value || 0;
      let _pessoa = {...this.state.pessoa};
      _pessoa[`${name}`] = val;

      this.setState({
          pessoa: _pessoa,
      });
  }

  render() {
    return (
      <div className="container">
          <div className="p-fluid cadastro">
              <div className="p-field">
                <SelectButton value={this.state.opcao} options={this.options} onChange={ (e) => this.setarOpcao(e)} />
              </div>
              <div className="p-field">
                  <label htmlFor="nome">Nome</label>
                  <InputText id="nome" value={this.state.pessoa.nome} onChange={(e) => this.onInputChange(e, 'nome')} type="text"
                      required autoFocus className={classNames({ 'p-invalid': this.state.valida && !this.state.pessoa.nome })} />
                  {this.state.valida && !this.state.pessoa.nome && <small className="p-invalid">Digite o nome.</small>}
              </div>
              <div className="p-field">
                  <label htmlFor="cpf">CPF</label>
                  <InputText id="cpf" value={this.state.pessoa.cpf} onChange={(e) => this.onInputChange(e, 'cpf')} type="text"
                        required className={classNames({ 'p-invalid': this.state.valida && !this.state.pessoa.cpf })}/>
                  {this.state.valida && !this.state.pessoa.cpf && <small className="p-invalid">Digite o CPF.</small>}
              </div>
              <div className="p-field">
                  <label htmlFor="senha">Senha</label>
                  <Password id="senha" value={this.state.pessoa.senha} onChange={(e) => this.onInputChange(e, 'senha')} 
                      required className={classNames({ 'p-invalid': this.state.valida && !this.state.pessoa.senha })} />
                  {this.state.valida && !this.state.pessoa.senha && <small className="p-invalid">Digite a senha.</small>}
              </div>
              <div className={this.state.classCliente}>
                  <label htmlFor="endereco">Endereço</label>
                  <InputText id="endereco" value={this.state.pessoa.endereco} onChange={(e) => this.onInputChange(e, 'endereco')} type="text"/>
              </div>
              <div className={this.state.classPrestador}>
                  <label htmlFor="expereiencia">Tempo de Experiência</label>
                  <InputNumber id="experiencia" value={this.state.pessoa.experiencia} onValueChange={(e) => this.onInputNumberChange(e, 'experiencia')} integeronly />
              </div>

              <div className="divBotao">
                  <Button label="Gravar" onClick={this.save} className="p-button-raised p-button-secondary p-button-rounded" />
              </div>
          </div>
      </div>
    );
  }
}