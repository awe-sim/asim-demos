import React from 'react';
import ReactDOM from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import { App } from './App';
import { ToastsProvider } from './common/MySnackbar';
import { Container } from 'react-modal-promise';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecoilRoot>
      <Container />
      <ToastsProvider>
        <App />
      </ToastsProvider>
    </RecoilRoot>
  </React.StrictMode>,
);
