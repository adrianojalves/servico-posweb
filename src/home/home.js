import { Button } from 'primereact/button';
import React  from 'react';

import './home.css';

export default class Home extends React.Component{
    
    handleSubmit(event) {
        alert('Um nome foi enviado: ' + JSON.stringify(this.state));

        localStorage.setItem({user: this.state.login});
        event.preventDefault();
    }

    render() {
        return (
            <div className="container">
                <div className="p-grid text-center">
                    <div className="p-col-4"></div>
                    <div className="p-col-4"><Button className="p-button-secondary p-button-rounded p-button-lg" label="Serviços" icon="pi pi-bars" /></div>
                    <div className="p-col-4"></div>
                </div>
          </div>
        );
      }
}