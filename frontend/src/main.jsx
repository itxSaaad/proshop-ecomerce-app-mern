import axios from 'axios';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import App from './App';
import './bootstrap.min.css';
import './index.css';
import store from './store';

axios.defaults.baseURL = 'https://proshop-ecomerce-app-mern.vercel.app';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
