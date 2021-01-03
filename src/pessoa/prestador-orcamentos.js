import React, { Component } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { URL_BACK, URL_MOCK, BACKEND, getId} from "../auth";
import { Dropdown } from 'primereact/dropdown';
import axios from 'axios';
import "./lista-servico-prestador.css";
import moment from 'moment';

export default class ListaOrcamentoPrestador extends Component {
    constructor(props) {
        super(props);
        this.options = [
            { name: 'Todos', value: ''},
            { name: 'Não Aceitos', value: false },
            { name: 'Aceitos', value: true }
        ];
        
        this.state = {orcamentos: [], dialogConfirma: false, orcamento: null, tipo: false};

        this.confirmaDialogFooter =  
            <React.Fragment>
                <Button label="Não" icon="pi pi-times" className="p-button-text" onClick={this.hideConfirmaDialog} />
                <Button label="Sim" icon="pi pi-check" className="p-button-text" onClick={this.confirmaOrcamento} />
            </React.Fragment>
        ;
    }

    onTipoChange = (e) => {
        this.setState({
            tipo: e.value
        });

        setTimeout(() => {
            this.componentDidMount();
        }, 200);
    }

    formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 , style: 'currency', currency: 'brl' });
    }

    priceBodyTemplate = (rowData) => {
        return this.formatCurrency(rowData.idServico.preco);
    }

    actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button title="Aceitar orçamento" icon="pi pi-check-circle" disabled={rowData.aceito} className="p-button-rounded p-button-success p-mr-2" onClick={() => this.showConfirmaOrcamento(rowData)} />
            </React.Fragment>
        );
    }

    rowClass = (data) => {
        return {
            'mouse': true
        }
    }

    leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Dropdown value={this.state.tipo} options={this.options} onChange={this.onTipoChange} optionLabel="name" optionValue="value" placeholder="Selecione o tipo" />
            </React.Fragment>
        )
    }

    hideConfirmaDialog = () => {
        this.setState({
            dialogConfirma: false
        });
    }

    confirmaOrcamento = () => {
        let _orcamento = this.state.orcamento;
        var url = BACKEND? `${URL_BACK}/api/orcamentos/${_orcamento.idOrcamento}/aceitar`:`${URL_MOCK}e08f2b38-679c-4807-a04b-3c6f30749811`;

        axios.put(url, null)
            .then(res => {
                if(res.data.erro){
                    alert(res.data.msg);
                }
                else{
                    alert("Orçamento Aceito");

                    if(BACKEND){
                        this.componentDidMount();
                    }
                    else{
                        let _orcamentos = this.state.orcamentos;
                        var i = 0;
                        while (i < _orcamentos.length) {
                            if (_orcamentos[i].idOrcamento === _orcamento.idOrcamento) {
                                _orcamentos[i].aceito=true;
                                break;
                            } else {
                                ++i;
                            }
                        }
                        this.setState({
                            orcamentos: _orcamentos
                        });
                    }

                    this.hideConfirmaDialog();
                }
            })
            .catch(error => {
                console.log(error);
                this.mostraErro("Erro ao acessar serviço remoto");
            });
    }

    showConfirmaOrcamento = (rowData) =>{
        this.setState({
            dialogConfirma: true,
            orcamento: rowData
        });
    }

    formatDate = (value) => {
        return value!=null?moment(value,'YYYY-MM-DD').format('DD/MM/YYYY'):'';
    }

    dateSolicitacaoBodyTemplate = (rowData) => {
        return this.formatDate(rowData.dtSolicitacao);
    }

    dateAtendimentoBodyTemplate = (rowData) => {
        return this.formatDate(rowData.dtAtendimento);
    }

    aceitoTemplate = (rowData) => {
        return rowData.aceito?"Sim":"Não";
    }

    componentDidMount() {
        let _tipo = this.state.tipo;
        axios.get(BACKEND?`${URL_BACK}/prestador-orcamentos`:`${URL_MOCK}c592efa1-361e-4cd0-ba06-15e5d70ab12d`,
        {
            params: {
              tipo: _tipo,
              idPrestador: getId()
            }
        })
          .then(res => {
            if(res.erro){
                alert(res.msg);
            }
            else{
                 this.setState({orcamentos: res.data});
            }
          })
          .catch((error) => {
              console.log(error);
            alert("Erro ao buscar orçamentos.");
          })
    }
  

    render() {
        return (
        <div className="container">
            <Toolbar className="p-mb-4" left={this.leftToolbarTemplate}></Toolbar>
            <div className="card">
                <DataTable rowClassName={this.rowClass} value={this.state.orcamentos} header="Lista de Orçamentos" className="p-datatable-gridlines p-datatable-striped tr">
                    <Column field="idOrcamento" header="Cód" style={{width:'6%'}}></Column>
                    <Column field="idCliente.nome" header="Cliente" style={{width:'47%'}}></Column>
                    <Column field="idServico.preco" header="Preço" body={this.priceBodyTemplate} style={{width:'8%'}}></Column>
                    <Column field="dtSolicitacao" header="Solicitação" body={this.dateSolicitacaoBodyTemplate} style={{width:'11%'}}></Column>
                    <Column field="dtAtendimento" body={this.dateAtendimentoBodyTemplate} header="Atendimento" style={{width:'11%'}}></Column>
                    <Column field="aceito" body={this.aceitoTemplate} header="Aceito" style={{width:'7%'}}></Column>
                    <Column className="center" body={this.actionBodyTemplate} style={{width:'10%'}}></Column>
                </DataTable>
            </div>

            <Dialog visible={this.state.dialogConfirma} style={{ width: '450px' }} header="Confirmação" modal footer={this.confirmaDialogFooter} onHide={this.hideConfirmaDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} />
                    {this.state.orcamento && <span>Confirma que aceita o orçamento: <b>{this.state.orcamento.idOrcamento}</b>?</span>}
                </div>
            </Dialog>
        </div>
        );
    }
}