import React from 'react';
import {isLogado} from './auth';
import CreatePrestador from "./prestador/create-prestador";
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Home from './home/home';
import Login from './login/login';
import ListaServicoPrestador from "./prestador/lista-servico-prestador";

const PrivateRoute = ({component: Component,  ...rest}) => (
    <Route {...rest } render={props => (
        isLogado() ? (
            <Component { ...props} />
        ): (
            <Redirect to={{ pathname: '/', state: { from: props.location  } }} />
        )
    )} />
);

const Routes = () => (
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={() => <Login></Login> }></Route>
            <Route exact path="/create-prestador" component={CreatePrestador} />
            <PrivateRoute exact path="/home" component={Home} />
            <PrivateRoute exact path="/prestador/list-servicos" component={ListaServicoPrestador} />
        </Switch>
    </BrowserRouter>
);

export default Routes;