import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

interface AppContainerProps {
  children: React.ReactNode;
}

const AppContainer = (props: AppContainerProps) => {
  const history = useHistory();
  useEffect(() => {
    const unListener = history.listen(location => {
      /* eslint-disable no-console */
      console.log(location.pathname);
    });
    return unListener;
  }, []);

  return <>{props.children}</>;
};

export default AppContainer;
