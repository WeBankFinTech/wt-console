import axios from 'axios';
import { createBrowserHistory } from 'history';
// import { isLocalEnv } from '../constants/enviroment';
import { renderToast } from '../commons/toast';

const history = createBrowserHistory();

axios.interceptors.request.use(config => {
  const token = '';
  config.headers =
    token &&
    Object.assign(config.headers, {
      Authorization: `Token ${token}`
    });
  return config;
});

axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    const errorRes = error.response;
    const { message, status }: { message: string; status: number } = errorRes?.data;
    renderToast(message);
    if (status === 401) {
      //clearToken();
      history.push('home');
    }
    return Promise.reject(errorRes);
  }
);

export default axios;
