import { Button } from 'primereact/button';
import React  from 'react';
import {isCliente, isPrestador} from '../auth';
import { Link } from 'react-router-dom';

import './home.css';

export default class Home extends React.Component{
    
    handleSubmit(event) {
        alert('Um nome foi enviado: ' + JSON.stringify(this.state));

        localStorage.setItem({user: this.state.login});
        event.preventDefault();
    }

    classNames = require('classnames');

    divCliente = this.classNames(
        'p-grid text-center',
        {
          'div-on': isCliente(),
          'div-off': !isCliente()
        }
      );
    
    divPrestador = this.classNames(
        'p-grid text-center',
        {
          'div-on': isPrestador(),
          'div-off': !isPrestador()
        }
      );

    render() {
        return (
            <div className="container">
                <div className={this.divPrestador}>
                    <div className="p-col-4"></div>
                    <div className="p-col-4"><Link to="/prestador/list-servicos"><Button className="p-button-secondary p-button-rounded p-button-lg" label="Serviços" icon="pi pi-bars" /></Link></div>
                    <div className="p-col-4"></div>
                </div>

                <div className={this.divCliente}>
                    <div className="p-col-4"></div>
                    <div className="p-col-4"><Button className="p-button-secondary p-button-rounded p-button-lg" label="Solicitar Orçamento" icon="pi pi-bookmark" /></div>
                    <div className="p-col-4"></div>
                </div>
          </div>
        );
      }
}