export const isLocalEnv = location.href.indexOf('localhost') > -1;
export const serverHost = isLocalEnv ? 'http://localhost:8003' : 'http://app.webank.com:8003';
