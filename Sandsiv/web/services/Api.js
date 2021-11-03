import axios from 'axios';
import { API_PREFIX } from '../store/middleware/HttpClient';



const API = axios.create();

const responseOnSuccess = (response) => {
	if (response instanceof Error) {
		return Promise.reject(response);
	}
	return response.data;
};

const responseOnError = function(error) {
    const {
        response
    } = error;

    if (response && (response.status === 401 || response.status === 403 )) {
        window.location.reload();
    }
    
	return Promise.reject(error.response);
};

function beforeRequestInterceptor(config) {
    const token = window.localStorage.getItem('token') || '';
    const apiUrl = window.localStorage.getItem('feedbackApi')  || '';
    config.baseURL = apiUrl + API_PREFIX;
    config.headers = {
        ...config.headers,
        'Authorization': `jwt ${token}`,
        'Content-Type': 'application/json'
    };

    return config;
}

API.interceptors.request.use(beforeRequestInterceptor);

API.interceptors.response.use(responseOnSuccess, responseOnError);

export default API;
