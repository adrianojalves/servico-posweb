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
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./lista-servico-prestador.css";

export default class ListaServicoPrestador extends Component {
    constructor(props) {
        super(props);
        
        this.emptyServico = {
            idServico: null,
            nome: '',
            idProfissional: getId(),
            preco: 0,
            tempoServico: 0
        };
        
        this.state = {servicos: [], servico: this.emptyServico, servicoDialog: false, valida: false,
                        dialogDelete: false, nome: ''};

        this.servicoDialogFooter = 
                <React.Fragment>
                    <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
                    <Button label="Salvar" icon="pi pi-check" className="p-button-text" onClick={this.saveServico}/>
                </React.Fragment>

        this.deleteDialogFooter =  
            <React.Fragment>
                <Button label="Não" icon="pi pi-times" className="p-button-text" onClick={this.hideDeleteDialog} />
                <Button label="Sim" icon="pi pi-check" className="p-button-text" onClick={this.deleteServico} />
            </React.Fragment>
        ;
    }

    formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 , style: 'currency', currency: 'brl' });
    }

    priceBodyTemplate = (rowData) => {
        return this.formatCurrency(rowData.preco);
    }

    actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" onClick={() => this.editServico(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => this.confirmDeleteServico(rowData)} />
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
                <Button label="Novo" icon="pi pi-plus" className="p-button-success p-mr-2"  onClick={this.openNew}/>
                <Button label="Relatório" icon="pi pi-file-pdf" className="p-button-success p-mr-2"  onClick={() => this.geraReport()}/>
            </React.Fragment>
        )
    }

    geraReport(){
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "portrait"; // portrait or landscape
    
        const marginLeft = 40;
        const doc = new jsPDF(orientation, unit, size);
    
        doc.setFontSize(15);
    
        const title = "Serviços";
        const headers = [["Nome", "Preço","Tempo Serviço"]];

        let servicos = this.state.servicos;

        const data = servicos.map(s=> [s.nome, this.formatCurrency(s.preco), s.tempoServico]);
    
        let content = {
          startY: 50,
          head: headers,
          body: data
        };
    
        doc.text(title, marginLeft, 40);
        doc.autoTable(content);
        doc.save("servico.pdf")
    }

    openNew = () => {
        this.setState({
            servico: this.emptyServico,
            servicoDialog: true
        });
    }

    hideDialog = () => {
        this.setState({
            servicoDialog: false,
            servico: this.emptyServico,
            valida: false
        });
    }

    hideDeleteDialog = () => {
        this.setState({
            dialogDelete: false,
            servico: this.emptyServico
        });
    }

    onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _servico = {...this.state.servico};
        _servico[`${name}`] = val;

        this.setState({
            servico: _servico,
        });
    }

    changeNome(e){
        const val = (e.target && e.target.value) || '';
        this.setState({
            nome: val,
        });
    }

    onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _servico = {...this.state.servico};
        _servico[`${name}`] = val;

        this.setState({
            servico: _servico,
        });
    }

    deleteServico = () => {
        let servico = this.state.servico;
            
        var url = BACKEND? `${URL_BACK}/servicos/${servico.idServico}`:`${URL_MOCK}e08f2b38-679c-4807-a04b-3c6f30749811`;

        axios.delete(url, null)
            .then(res => {
                if(res.data.erro){
                    alert(res.data.msg);
                }
                else{
                    alert("Serviço Excluído");

                    if(BACKEND){
                        this.componentDidMount();
                    }
                    else{
                        let _servicos = this.state.servicos;
                        var i = 0;
                        while (i < _servicos.length) {
                            if (_servicos[i].idServico === this.state.servico.idServico) {
                            _servicos.splice(i, 1);
                            } else {
                                ++i;
                            }
                        }
                        this.setState({
                            servicos: _servicos
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

    saveServico = () => {
        this.setState({
            valida: true
        });

        if (this.validar()) {
            let servico = this.state.servico;
            
            var url = BACKEND? `${URL_BACK}/servicos`:`${URL_MOCK}f76d302f-760a-419c-ab0b-ff2613869211`;

            if(servico.idServico){
                axios.put(url+"/"+servico.idServico, servico)
                    .then(res => {
                        this.trataRetorno(res);
                    })
                    .catch(error => {
                        console.log(error);
                        this.mostraErro("Erro ao acessar serviço remoto");
                    });
            }
            else{
                axios.post(url, servico)
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

                this.setState({
                    servicoDialog: false
                });
            }
            else{
                let _servicos = this.state.servicos;

                if(_servicos.id){
                    _servicos.push(res.data);
                }
                else{
                    let i=0;
                    for( i in _servicos){
                        if(_servicos[i].idServico===this.state.servico.idServico){
                            break;
                        }
                    }
                    _servicos[i] = this.state.servico;
                }
                this.setState({
                    servicos: _servicos,
                    servicoDialog: false
                });
            }
        }
    }

    confirmDeleteServico = (rowData) =>{
        this.setState({
            dialogDelete: true,
            servico: rowData
        });
    }

    editServico = (rowData) => {
        this.setState({
            servico: rowData,
            servicoDialog: true
        });
    }

    validar = () => {
        let servico = this.state.servico;

        if(servico.nome.trim() && servico.preco>0 && servico.tempoServico>0){
            return true;
        }
        else{
            return false;
        }
    }
    
    componentDidMount() {
        axios.get(BACKEND?`${URL_BACK}/servicos/list`:`${URL_MOCK}e137da93-5157-4b8f-b360-5bf46c429352`,
        {
            params: {
              nome: this.state.nome,
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
            <Toolbar className="p-mb-4" left={this.leftToolbarTemplate}></Toolbar>
            <div className="card">
                <div className="p-formgrid p-grid p-fluid">
                    <div className="p-field p-col-10">
                        <label className="p-d-block" htmlFor="Nome">Nome do Serviço</label>
                        <InputText id="nomePesquisa" onChange={(e) => this.changeNome(e)} value={this.state.nome}  />
                    </div>
                    <div className="p-field p-col-2">
                        <Button style={{marginTop: '25px'}} label="Pesquisar" icon="pi pi-search" className="p-button-raised p-button-success" title="Buscar Serviços" 
                            onClick={() => this.componentDidMount()}/>
                    </div>
                </div>
            </div>
            <div className="card">
                <DataTable rowClassName={this.rowClass} value={this.state.servicos} header="Lista de Serviços" className="p-datatable-gridlines p-datatable-striped tr">
                    <Column field="nome" header="Nome" style={{width:'70%'}}></Column>
                    <Column field="preco" header="Preço" body={this.priceBodyTemplate} style={{width:'10%'}}></Column>
                    <Column field="tempoServico" header="Tmp Serviço" style={{width:'10%'}}></Column>
                    <Column className="center" body={this.actionBodyTemplate} style={{width:'10%'}}></Column>
                </DataTable>
            </div>

            <Dialog visible={this.state.servicoDialog} style={{ width: '450px' }} header="Serviço" modal className="p-fluid" 
                footer={this.servicoDialogFooter} onHide={this.hideDialog}>
                <div className="p-field">
                    <label htmlFor="nome">Nome</label>
                    <InputText id="nome" value={this.state.servico.nome} onChange={(e) => this.onInputChange(e, 'nome')} required autoFocus className={classNames({ 'p-invalid': this.state.valida && !this.state.servico.nome })} />
                    {this.state.valida && !this.state.servico.nome && <small className="p-invalid">Digite o nome.</small>}
                </div>

                <div className="p-formgrid p-grid">
                    <div className="p-field p-col">
                        <label htmlFor="preco">Preço</label>
                        <InputNumber id="preco" required value={this.state.servico.preco} onValueChange={(e) => this.onInputNumberChange(e, 'preco')} mode="currency" className={classNames({ 'p-invalid': this.state.valida && !this.state.servico.preco })} maxFractionDigits={2} minFractionDigits={2} currency="brl" locale="pt-BR" />
                        {this.state.valida && !this.state.servico.preco && <small className="p-invalid">Digite o preço.</small>}
                    </div>
                    <div className="p-field p-col">
                        <label htmlFor="tempoServico">Tempo de Serviço</label>
                        <InputNumber id="tempoServico" required value={this.state.servico.tempoServico} onValueChange={(e) => this.onInputNumberChange(e, 'tempoServico')} integeronly className={classNames({ 'p-invalid': this.state.valida && !this.state.servico.tempoServico })} />
                        {this.state.valida && !this.state.servico.tempoServico && <small className="p-invalid">Digite o tempo de Serviço.</small>}
                    </div>
                </div>
            </Dialog>

            <Dialog visible={this.state.dialogDelete} style={{ width: '450px' }} header="Confirmação" modal footer={this.deleteDialogFooter} onHide={this.hideDeleteDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} />
                    {this.state.servico && <span>Confirma a exclusão do serviço: <b>{this.state.servico.nome}</b>?</span>}
                </div>
            </Dialog>
        </div>
        );
    }
}