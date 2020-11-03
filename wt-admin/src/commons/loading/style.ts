import styled, { keyframes } from 'styled-components';

const spinner = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const LoadingSpinner = styled.div`
  height: 14px;
  width: 14px;
  border-radius: 50%;
  background: transparent;
  border-top: 2px solid #fff;
  border-right: 2px solid transparent;
  animation: ${spinner} 700ms linear infinite;
`;
