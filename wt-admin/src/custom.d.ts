declare module '*.css';
declare module '*.png';
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.gif' {
  const content: any;
  export default content;
}

declare module 'jsencrypt';
declare module 'js-base64';