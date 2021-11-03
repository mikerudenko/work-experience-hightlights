import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import App from './App';
import { WebSockets } from './services/WebSockets/WebSockets';

import registerServiceWorker from './registerServiceWorker';

const store = configureStore();

export default store;

const sockets = new WebSockets();
sockets.setStore(store);

ReactDOM.render(
    <Provider store={ store }>
        <App sockets={ sockets }/>
    </Provider>,
    document.getElementById('body-container')
);

registerServiceWorker();
