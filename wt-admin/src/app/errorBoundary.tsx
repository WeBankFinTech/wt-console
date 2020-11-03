import React, { Component } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    /* eslint-disable no-console */
    console.log('===', error, errorInfo);
  }
  render() {
    return <>{this.props.children}</>;
  }
}

export default ErrorBoundary;
