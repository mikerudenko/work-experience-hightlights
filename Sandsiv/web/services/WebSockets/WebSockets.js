import { HelperService } from '/services/HelperService';

export class WebSockets {
    constructor() {
        if (WebSockets.instance) {
            return WebSockets.instance;
        }

        WebSockets.instance = this;
        this.autoReconnectInterval = 5000;
        this.actions = {};
    }

    on(type, callback) {
        if (this.actions[type]) {
            this.actions[type].push(callback)
        } else {
            this.actions[type] = [callback];
        }
        return callback;
    }

    off(type, callback) {
        let indexToDelete = this.actions[type].findIndex(cb => cb === callback);
        this.actions[type].splice(indexToDelete, 1);
    }

    init(socketListeners) {
        const socketUrl = `${this.getSocketUrl()}/?jwt=${this.getToken()}`;
        this.socket = new WebSocket(socketUrl);

        this.initListeners();
        socketListeners && socketListeners.forEach(listerer => listerer());
    }

    initListeners() {
        this.socket.onmessage = (e) => {
            const response = JSON.parse(e.data);
            const message = response.nm_message;

            if (message && this.actions[message.action_type]) {
                this.actions[message.action_type].forEach((callback) => {
                    callback(message.data, this.getStore());
                })
            }
        };

        this.socket.onclose = (event) => {
            switch (event.code) {
                case 1000:	// CLOSE_NORMAL
                    break;
                default:	// Abnormal closure
                    this.reconnect();
                    break;
            }
        };

        this.socket.onerror = (e) => {
            switch (e.code) {
                case 'ECONNREFUSED':
                    this.reconnect(e);
                    break;
                default:
                    break;
            }
        };

        this.socket.onopen = () => {
            this.getUpdatesAction();
        };
    }

    reconnect(e) {
        setTimeout(() => {
            this.init();
        }, this.autoReconnectInterval);
    }

    getUpdatesAction() {
        const url = '/socket_notification/get_notification_updates';

        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send();
    }

    setSocketUrl(url) {
        this.url = url;
        return this;
    }

    getSocketUrl() {
        return this.url;
    }

    setToken(token) {
        this.token = token;
        return this;
    }

    getToken() {
        return this.token;
    }

    setStore(store) {
        this.store = store;
        return this;
    }

    getStore() {
        return this.store;
    }
}

export const sockets = new WebSockets();
