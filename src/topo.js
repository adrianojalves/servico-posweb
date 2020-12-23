import React  from 'react';
import { Button } from 'primereact/button';
import {isLogado} from './auth';

export default class Topo extends React.Component{
    logout(){
        localStorage.setItem('usuario', null);

        window.location.href="/";
    }

    classNames = require('classnames');

    btnGroupClasses = this.classNames(
        'canto',
        {
          'logout-on': isLogado(),
          'logout-off': !isLogado()
        }
      );
    
    render() {
        return (
            <header className="App-header">
                Serviços Gerais
                <div className={this.btnGroupClasses}><Button label="Logout" onClick={this.logout} className="p-button-raised p-button-secondary p-button-rounded" /></div>
            </header>
        );
      }
}