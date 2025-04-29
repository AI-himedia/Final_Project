import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter } from 'react-router-dom';
import store from './redux/Store/Store';
import { Provider } from 'react-redux';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { ScaleLoader } from 'react-spinners';

const root = ReactDOM.createRoot(document.getElementById('root'));

const LoadingOverlay = () => {
  const { isLoading } = useLoading();

  return (
    isLoading && (
      <div className="Spinner_Overlay">
        <ScaleLoader color="#2e80ff" />
      </div>
    )
  );
};

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <LoadingProvider>
        <LoadingOverlay />
        <App />
      </LoadingProvider>
    </BrowserRouter>
  </Provider>
);

reportWebVitals();
