import React, { Component } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { URL_BACK, URL_MOCK, BACKEND, getId} from "../auth";
import axios from 'axios';
import classNames from 'classnames';
import "./orcamentos.css";
import moment from 'moment';

export default class Orcamentos extends Component {
    constructor(props) {
        super(props);
        
        this.emptyOrcamento = {
            idOrcamento: null,
            idCliente: getId(),
            idServico: null,
            dtSolicitacao: new Date(),
            dtAtendimento: null,
            aceito: false
        };
        
        this.state = {orcamentos: [], orcamento: this.emptyOrcamento, orcamentoDialog: false, valida: false,
                        dialogDelete: false};

        this.orcamentoDialogFooter = 
                <React.Fragment>
                    <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
                    <Button label="Salvar" icon="pi pi-check" className="p-button-text" onClick={this.saveOrcamento}/>
                </React.Fragment>

        this.deleteDialogFooter =  
            <React.Fragment>
                <Button label="Não" icon="pi pi-times" className="p-button-text" onClick={this.hideDeleteDialog} />
                <Button label="Sim" icon="pi pi-check" className="p-button-text" onClick={this.deleteOrcamento} />
            </React.Fragment>
        ;
    }

    formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 , style: 'currency', currency: 'brl' });
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

    priceBodyTemplate = (rowData) => {
        return this.formatCurrency(rowData.idServico.preco);
    }

    aceitoTemplate = (rowData) => {
        return rowData.aceito?"Sim":"Não";
    }

    actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" onClick={() => this.editOrcamento(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => this.confirmDeleteOrcamento(rowData)} />
            </React.Fragment>
        );
    }

    rowClass = (data) => {
        return {
            'mouse': true,
            'aceito': data.aceito
        }
    }

    leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Novo" icon="pi pi-plus" className="p-button-success p-mr-2"  onClick={this.openNew}/>
            </React.Fragment>
        )
    }

    openNew = () => {
        this.setState({
            orcamento: this.emptyOrcamento,
            orcamentoDialog: true
        });
    }

    hideDialog = () => {
        this.setState({
            orcamentoDialog: false,
            orcamento: this.emptyOrcamento,
            valida: false
        });
    }

    hideDeleteDialog = () => {
        this.setState({
            dialogDelete: false,
            orcamento: this.emptyorcamento
        });
    }

    onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _orcamento = {...this.state.orcamento};
        _orcamento[`${name}`] = val;

        this.setState({
            orcamento: _orcamento,
        });
    }

    onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _orcamento = {...this.state.orcamento};
        _orcamento[`${name}`] = val;

        this.setState({
            orcamento: _orcamento,
        });
    }

    deleteOrcamento = () => {
        let orcamento = this.state.orcamento;
            
        var url = BACKEND? `${URL_BACK}/api/orcamento/${orcamento.idOrcamento}`:`${URL_MOCK}e08f2b38-679c-4807-a04b-3c6f30749811`;

        axios.delete(url, null)
            .then(res => {
                if(res.data.erro){
                    alert(res.data.msg);
                }
                else{
                    alert("Orçamento Excluído");

                    if(BACKEND){
                        this.componentDidMount();
                    }
                    else{
                        let _orcamentos = this.state.orcamentos;
                        var i = 0;
                        while (i < _orcamentos.length) {
                            if (_orcamentos[i].idOrcamento === this.state.orcamento.idOrcamento) {
                            _orcamentos.splice(i, 1);
                            } else {
                                ++i;
                            }
                        }
                        this.setState({
                            orcamentos: _orcamentos
                        });
                    }

                    this.hideDeleteDialog();
                }
            })
            .catch(error => {
                console.log(error);
                this.mostraErro("Erro ao acessar serviço remoto");
            });
    }
    
    saveservicoOrcamento = () => {
        this.setState({
            valida: true
        });

        if (this.validar()) {
            let orcamento = this.state.orcamento;
            
            var url = BACKEND? `${URL_BACK}/api/orcamentos`:`${URL_MOCK}f76d302f-760a-419c-ab0b-ff2613869211`;

            if(orcamento.idOrcamento){
                axios.put(url, orcamento)
                    .then(res => {
                        this.trataRetorno(res);
                    })
                    .catch(error => {
                        console.log(error);
                        this.mostraErro("Erro ao acessar serviço remoto");
                    });
            }
            else{
                axios.post(url, orcamento)
                    .then(res => {
                        this.trataRetorno(res);
                    })
                    .catch(error => {
                        console.log(error);
                        this.mostraErro("Erro ao acessar serviço remoto");
                    });
            }
        }
    }

    trataRetorno = (res) =>{
        if(res.data.erro){
            alert(res.data.msg);
        }
        else{
            if(BACKEND){
                this.componentDidMount();
            }
            else{
                let _orcamentos = this.state.orcamentos;

                if(_orcamentos.id){
                    _orcamentos.push(res.data);
                }
                else{
                    let i=0;
                    for( i in _orcamentos){
                        if(_orcamentos[i].idOrcamento===this.state.orcamento.idOrcamento){
                            break;
                        }
                    }
                    _orcamentos[i] = this.state.orcamento;
                }
                this.setState({
                    orcamentos: _orcamentos,
                    orcamentoDialog: false
                });
            }
        }
    }

    confirmDeleteOrcamento = (rowData) =>{
        this.setState({
            dialogDelete: true,
            orcamento: rowData
        });
    }

    editOrcamento = (rowData) => {
        this.setState({
            orcamento: rowData,
            orcamentoDialog: true
        });
    }

    validar = () => {
        let orcamento = this.state.orcamento;

        if(orcamento.idServico!=null && orcamento.idServico!=0){
            return true;
        }
        else{
            return false;
        }
    }
    
    componentDidMount() {
        axios.get(BACKEND?`${URL_BACK}/orcamentos/list`:`${URL_MOCK}3c0066ae-79f0-4732-8c5f-39a2e13d11c3`,
        {
            params: {
              nome: 'nome',
              idCliente: getId()
            }
        })
          .then(res => {
            if(res.erro){
                alert(res.msg);
            }
            else{
                console.log(res.data);
                 this.setState({orcamentos: res.data});
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
            <Toolbar className="p-mb-4" left={this.leftToolbarTemplate}></Toolbar>
            <div className="card">
                <DataTable rowClassName={this.rowClass} value={this.state.orcamentos} header="Lista de Orçamentos" className="p-datatable-gridlines p-datatable-striped tr">
                    <Column field="idOrcamento" header="Cód" style={{width:'6%'}}></Column>
                    <Column field="idServico.idProfissional.nome" header="Prestador" style={{width:'47%'}}></Column>
                    <Column field="idServico.preco" header="Preço" body={this.priceBodyTemplate} style={{width:'8%'}}></Column>
                    <Column field="dtSolicitacao" header="Solicitação" body={this.dateSolicitacaoBodyTemplate} style={{width:'11%'}}></Column>
                    <Column field="dtAtendimento" body={this.dateAtendimentoBodyTemplate} header="Atendimento" style={{width:'11%'}}></Column>
                    <Column field="aceito" body={this.aceitoTemplate} header="Aceito" style={{width:'7%'}}></Column>
                    <Column className="center" body={this.actionBodyTemplate} style={{width:'10%'}}></Column>
                </DataTable>
            </div>

            <Dialog visible={this.state.orcamentoDialog} style={{ width: '450px' }} header="Orçamento" modal className="p-fluid" 
                footer={this.orcamentoDialogFooter} onHide={this.hideDialog}>
                
            </Dialog>

            <Dialog visible={this.state.dialogDelete} style={{ width: '450px' }} header="Confirmação" modal footer={this.deleteDialogFooter} onHide={this.hideDeleteDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} />
                    {this.state.orcamento && <span>Confirma a exclusão do Orçamento: <b>{this.state.orcamento.idOrcamento}</b>?</span>}
                </div>
            </Dialog>
        </div>
        );
    }
}