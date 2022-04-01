import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import './index.css';
import App from './App';

// React 17
// ReactDOM.render(
//     <App />,
//   document.getElementById('root')
// );

// React 18
const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App tab="home" />)
