import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  // BrowserRouter as Router,
  Route,
  HashRouter as Router
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from './store';
import App from './containers/App';
import ModelList from './containers/ModelList';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

const store = createStore();

ReactDOM.render(
  <Provider store={store}>
    <Router hashType="noslash">
      <div>
        <Route exact={true} path="/" component={ModelList}/>
        <Route path="/:modelName" component={App}/>
      </div>
    </Router>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
