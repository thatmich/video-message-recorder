import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';


// React 17
// ReactDOM.render(
//     <App />,
//   document.getElementById('root')
// );

// React 18
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(<App />);