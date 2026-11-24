import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { AppRoutes } from './routes/AppRoutes';
import { GlobalValidationTooltip } from './components/common/GlobalValidationTooltip';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <WorkspaceProvider>
        <AppRoutes />
        <GlobalValidationTooltip />
      </WorkspaceProvider>
    </BrowserRouter>
  );
};

export default App;
