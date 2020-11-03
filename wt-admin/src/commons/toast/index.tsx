import React from 'react';
import { notification } from 'antd';
import { ToastText } from './style';

interface ToastMessageType {
  message: string;
}

const ToastMessage = (props: ToastMessageType) => {
  return <ToastText>{props.message || '系统异常'}</ToastText>;
};

export const renderToast = (message: string) => {
  return notification.open({
    message: <ToastMessage message={message} />,
    duration: 1,
    style: { top: '153px', right: '48px' }
  });
};
