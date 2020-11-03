import { createGlobalStyle } from 'styled-components';
import { normalText } from '../commonsStyles/globalStyleVariable';

const GlobalStyle = createGlobalStyle`
  body {
    color: ${normalText};
    margin: 0;
  }
  input {
    border: none;
    outline: none;
    color: ${normalText};
    &::placeholder {
      color: #CCCCCC;
    }
  }
  button {
    border: none;
    outline: none;
    padding: 0;
    cursor: pointer;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  input[type="number"]{
    -moz-appearance: textfield;
  }
  
  ul {
    margin: 0;
    padding: 0;
    li {
      list-style: none;
    }  
  }
`;

export default GlobalStyle;
