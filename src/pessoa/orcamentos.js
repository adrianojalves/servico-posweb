import React, { Component } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { URL_BACK, URL_MOCK, BACKEND, getId} from "../auth";
import axios from 'axios';
import { Calendar } from 'primereact/calendar';
import classNames from 'classnames';
import "./orcamentos.css";
import moment from 'moment';

export default class Orcamentos extends Component {
    constructor(props) {
        super(props);

        this.ptBr = {
            firstDayOfWeek: 1,
            dayNames: ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"],
            dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
            dayNamesMin: ["DO", "SE", "TE", "QU", "QI", "SX", "SA"],
            monthNames: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
            monthNamesShort: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
            today: "Hoje",
            clear: "Limpar"
        };
        
        this.state = {orcamentos: [], orcamento: this.emptyOrcamento(), orcamentoDialog: false, valida: false,
                        dialogDelete: false, orcamentoDialogServico: false,
                        listServicos: [], dtInicial: null, dtFinal: null};

        this.orcamentoDialogFooter = 
                <React.Fragment>
                    <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
                    <Button label="Salvar" icon="pi pi-check" className="p-button-text" onClick={this.saveOrcamento}/>
                </React.Fragment>

        this.orcamentoDialogServicoFooter = 
                <React.Fragment>
                </React.Fragment>

        this.deleteDialogFooter =  
            <React.Fragment>
                <Button label="Não" icon="pi pi-times" className="p-button-text" onClick={this.hideDeleteDialog} />
                <Button label="Sim" icon="pi pi-check" className="p-button-text" onClick={this.deleteOrcamento} />
            </React.Fragment>
        ;
    }

    emptyOrcamento = () => {
        return {
            idOrcamento: null,
            idCliente: getId(),
            idServico: null,
            dtSolicitacao: new Date(),
            dtAtendimento: null,
            aceito: false
        };
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
        return rowData.preco?  this.formatCurrency(rowData.preco) : this.formatCurrency(rowData.idServico.preco);
    }

    aceitoTemplate = (rowData) => {
        return rowData.aceito?"Sim":"Não";
    }

    actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" disabled={rowData.aceito} className="p-button-rounded p-button-success p-mr-2" onClick={() => this.editOrcamento(rowData)} />
                <Button icon="pi pi-trash" disabled={rowData.aceito} className="p-button-rounded p-button-warning" onClick={() => this.confirmDeleteOrcamento(rowData)} />
            </React.Fragment>
        );
    }

    actionBodyServicoTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-check-circle" title="Selecionar serviço" className="p-button-rounded p-button-success p-mr-2" onClick={() => this.repassaServico(rowData)} />
            </React.Fragment>
        );
    }

    repassaServico = (rowData) => {
        const _idServico = {
            "idServico": rowData.idServico, 
            "idProfissional": { "idPessoa": rowData.idProfissional, "nome": "" }, 
            "nome": rowData.nome, 
            "preco": rowData.preco, 
            "tempoServico": rowData.tempoServico
            }

        let _orcamento = this.state.orcamento;

        _orcamento.idServico = _idServico;
        this.setState({
            orcamento: _orcamento,
            orcamentoDialogServico: false
        })
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
            orcamento: this.emptyOrcamento(),
            orcamentoDialog: true
        });
    }

    hideDialog = () => {
        this.setState({
            orcamentoDialog: false,
            orcamento: this.emptyOrcamento(),
            valida: false
        });
    }

    hideDialogServico = () => {
        this.setState({
            orcamentoDialogServico: false
        });
    }

    showServicos = () => {
        axios.get(BACKEND?`${URL_BACK}/servicos/list`:`${URL_MOCK}e85834b8-d5fe-4b31-9e1d-6c7c8cb07768`,
        {
            params: {
              nome: ''
            }
        })
          .then(res => {
            if(res.erro){
                alert(res.msg);
            }
            else{
                 this.setState({
                     listServicos: res.data,
                     orcamentoDialogServico: true
                 });
            }
          })
          .catch((error) => {
              console.log(error);
            alert("Erro ao buscar serviços.");
          })
    }

    hideDeleteDialog = () => {
        this.setState({
            dialogDelete: false,
            orcamento: this.emptyOrcamento
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
            
        var url = BACKEND? `${URL_BACK}/orcamentos/${orcamento.idOrcamento}`:`${URL_MOCK}e08f2b38-679c-4807-a04b-3c6f30749811`;

        axios.delete(url, null)
            .then(res => {
                if(res.data.erro===true){
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
    
    saveOrcamento = () => {
        this.setState({
            valida: true
        });

        if (this.validar()) {
            let orcamento = this.state.orcamento;

            orcamento.dtAtendimento = moment(orcamento.dtAtendimento).format('YYYY-MM-DD');
            
            var url = BACKEND? `${URL_BACK}/orcamentos`:`${URL_MOCK}f76d302f-760a-419c-ab0b-ff2613869211`;

            if(orcamento.idOrcamento){
                axios.put(url+"/"+orcamento.idOrcamento, orcamento)
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
                this.setState({
                    orcamentoDialog: false
                });
                this.componentDidMount();
            }
            else{
                let _orcamento = this.state.orcamento;
                let _orcamentos = this.state.orcamentos;

                if(_orcamento.idOrcamento===null){
                    _orcamentos.push(_orcamento);
                }
                else{
                    let i=0;
                    for( i in _orcamentos){
                        if(_orcamentos[i].idOrcamento===this.state.orcamento.idOrcamento){
                            break;
                        }
                    }
                    _orcamentos[i] = _orcamento;
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
        rowData.dtAtendimento = moment(rowData.dtAtendimento, "YYYY-MM-DD'").toDate();
        this.setState({
            orcamento: rowData,
            orcamentoDialog: true
        });
    }

    validar = () => {
        let orcamento = this.state.orcamento;

        if(orcamento.idServico!==null && orcamento.idServico!==0 && !(orcamento.dtAtendimento===null)){
            return true;
        }
        else{
            return false;
        }
    }

    pesquisar(){
        const dtInicial = this.state.dtInicial;
        const dtFinal = this.state.dtFinal;
        axios.get(BACKEND?`${URL_BACK}/orcamentos/list`:`${URL_MOCK}c592efa1-361e-4cd0-ba06-15e5d70ab12d`,
        {
            params: {
              nome: '',
              idCliente: getId(),
              dataAtendimentoInicial: dtInicial,
              dataAtendimentoFinal: dtFinal
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
            alert("Erro ao buscar serviços.");
          });
    }
    
    componentDidMount() {
        this.pesquisar();
    }

    dadosServico(){
        let _orcamento = this.state.orcamento;
        return _orcamento.idServico? 
                    _orcamento.idServico.nome+" "+
                    this.formatCurrency(_orcamento.idServico.preco)
                    : 
                    "";
    }

    changeAtendimento(data){
        let _orcamento = this.state.orcamento;
        _orcamento.dtAtendimento = data;

        this.setState({
            orcamento: _orcamento
        });
    }

    changeDtInicial(data){
        this.setState({
            dtInicial: data
        });
    }

    changeDtFinal(data){
        this.setState({
            dtFinal: data
        });
    }

    render() {
        return (
        <div className="container">
            <Toolbar className="p-mb-4" left={this.leftToolbarTemplate}></Toolbar>
            <div className="card">
                <div className="p-formgrid p-grid">
                    <div className="p-field p-col-5">
                        <label className="p-d-block" htmlFor="dtInicial">Dt Atendimento Inicial</label>
                        <Calendar id="dtInicial" value={this.state.dtInicial} onChange={(e) => this.changeDtInicial(e.value)} locale={this.ptBr} dateFormat="dd/mm/yy" touchUI />
                    </div>
                    <div className="p-field p-col-5">
                        <label className="p-d-block" htmlFor="dtFinal">Dt Atendimento Final</label>
                        <Calendar id="dtFinal" value={this.state.dtFinal} onChange={(e) => this.changeDtFinal(e.value)} locale={this.ptBr} dateFormat="dd/mm/yy" touchUI />
                    </div>
                    <div className="p-field p-col-2">
                        <Button style={{marginTop: '15px'}} label="Pesquisar" icon="pi pi-search" className="p-button-raised p-button-success" title="Buscar Orçamentos" 
                            onClick={() => this.pesquisar()}/>
                    </div>
                </div>
            </div>
            <div className="card">
                <DataTable rowClassName={this.rowClass} value={this.state.orcamentos} header="Lista de Orçamentos" className="p-datatable-gridlines p-datatable-striped tr">
                    <Column field="idServico.idProfissional.nome" header="Prestador" style={{width:'53%'}}></Column>
                    <Column field="idServico.preco" header="Preço" body={this.priceBodyTemplate} style={{width:'8%'}}></Column>
                    <Column field="dtSolicitacao" header="Solicitação" body={this.dateSolicitacaoBodyTemplate} style={{width:'11%'}}></Column>
                    <Column field="dtAtendimento" body={this.dateAtendimentoBodyTemplate} header="Atendimento" style={{width:'11%'}}></Column>
                    <Column field="aceito" body={this.aceitoTemplate} header="Aceito" style={{width:'7%'}}></Column>
                    <Column className="center" body={this.actionBodyTemplate} style={{width:'10%'}}></Column>
                </DataTable>
            </div>

            <Dialog visible={this.state.orcamentoDialog} style={{ width: '550px' }} header="Orçamento" modal className="p-fluid" 
                footer={this.orcamentoDialogFooter} onHide={this.hideDialog}>
                <div className="p-field">
                    <label htmlFor="servico">Serviço</label>
                    <InputText id="servico" value={ this.dadosServico() } readOnly={true} style={{width: '90%'}}
                        required autoFocus className={classNames({ 'p-invalid': this.state.valida && !this.state.orcamento.idServico })} />
                    
                    <Button style={{marginLeft: '3px'}} icon="pi pi-search" className="p-button-rounded p-button-success" title="Pesquisar os serviços" 
                            onClick={this.showServicos}/>
                    
                    {this.state.valida && !this.state.orcamento.idServico && <small className="p-invalid">Pesquise o serviço.</small>}
                </div>

                <div className="p-formgrid p-grid">
                    <div className="p-field p-col">
                        <label htmlFor="dtAtendimento">Data de Atendimento</label>
                        <Calendar id="dtAtendimento" required value={this.state.orcamento.dtAtendimento} onChange={(e) => this.changeAtendimento(e.value)} locale={this.ptBr} dateFormat="dd/mm/yy" touchUI />
                        {this.state.valida && !this.state.orcamento.dtAtendimento && <small className="p-invalid">Digite a data.</small>}
                    </div>
                    <div className="p-field p-col">
                        
                    </div>
                </div>
            </Dialog>

            <Dialog visible={this.state.dialogDelete} style={{ width: '450px' }} header="Confirmação" modal footer={this.deleteDialogFooter} onHide={this.hideDeleteDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} />
                    {this.state.orcamento && <span>Confirma a exclusão do Orçamento: <b>{this.state.orcamento.idOrcamento}</b>?</span>}
                </div>
            </Dialog>

            <Dialog visible={this.state.orcamentoDialogServico} style={{ width: '90%' }} header="Serviços" modal className="p-fluid" 
                footer={this.orcamentoDialogServicoFooter} onHide={this.hideDialogServico}>
                    <DataTable rowClassName={this.rowClass} value={this.state.listServicos} header="Lista de Serviços" 
                        className="p-datatable-gridlines p-datatable-striped tr"
                        paginator currentPageReportTemplate="{first}/{last} de {totalRecords} Serviços" rows={6} rowsPerPageOptions={[6,12,18]}
                         >
                        <Column field="nome" header="Nome" style={{width:'70%'}}></Column>
                        <Column field="preco" header="Preço" body={this.priceBodyTemplate} style={{width:'10%'}}></Column>
                        <Column field="tempoServico" header="Tmp Serviço" style={{width:'10%'}}></Column>
                        <Column className="center" body={this.actionBodyServicoTemplate} style={{width:'5%'}}></Column>
                    </DataTable>
            </Dialog>
        </div>
        );
    }
}