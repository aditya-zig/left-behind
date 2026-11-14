import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// NASA's compressed GLBs decode locally, including on CSP-restricted deployments.
Object.assign(window, {ModelViewerElement: {dracoDecoderLocation: '/draco/'}});
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
