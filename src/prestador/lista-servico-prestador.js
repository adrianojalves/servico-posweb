import React, { Component } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { URL_BACK, URL_MOCK, BACKEND, getId} from "../auth";
import axios from 'axios';
import "./lista-servico-prestador.css";

export default class ListaServicoPrestador extends Component {
    constructor(props) {
        super(props);
        this.state = {servicos: []};
    }

    formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 , style: 'currency', currency: 'brl' });
    }

    priceBodyTemplate = (rowData) => {
        return this.formatCurrency(rowData.preco);
    }

    rowClass = (data) => {
        return {
            'mouse': true
        }
    }
    
    componentDidMount() {
        axios.get(BACKEND?`${URL_BACK}/servicos/list`:`${URL_MOCK}e137da93-5157-4b8f-b360-5bf46c429352`,
        {
            params: {
              nome: 'nome',
              idPrestador: getId()
            }
        })
          .then(res => {
            if(res.erro){
                alert(res.msg);
            }
            else{
                 this.setState({servicos: res.data});
            }
          })
          .catch((error) => {
              console.log(error);
            alert("Erro ao buscar serviços.");
          })
    }
  

    render() {
        return (
        <div className="container">
            <div className="card">
                <DataTable rowClassName={this.rowClass} value={this.state.servicos} header="Lista de Serviços" className="p-datatable-gridlines p-datatable-striped tr">
                    <Column field="idServico" header="Cód" style={{width:'7%'}}></Column>
                    <Column field="nome" header="Nome" style={{width:'73%'}}></Column>
                    <Column field="preco" header="Preço" body={this.priceBodyTemplate} style={{width:'10%'}}></Column>
                    <Column field="tempoServico" header="Tmp Serviço" style={{width:'10%'}}></Column>
                </DataTable>
            </div>
        </div>
        );
    }
}