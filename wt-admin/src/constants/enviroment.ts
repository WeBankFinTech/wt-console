import { serverHostUrl, localHostUrl, port } from './../../config'

export const isLocalEnv = location.href.includes(localHostUrl)
export const serverHost = isLocalEnv ? `${localHostUrl}${port}` : `${serverHostUrl}${port}`;
