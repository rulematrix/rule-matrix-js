import { createStore as reduxCreateStore, applyMiddleware, Store, compose } from 'redux';
import thunk from 'redux-thunk';
// import { createLogger } from 'redux-logger';
import { rootReducer } from './reducers';
import { RootState } from './state';
export * from './actions';
export * from './reducers';
export * from './state';
export * from './selectors';

let composeEnhancer = compose;

if (process.env.NODE_ENV === 'development') {
  const devTools = require('redux-devtools-extension');
  composeEnhancer = devTools.composeWithDevTools;
}

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // tslint:disable-line
// const middlewares = process.env.NODE_ENV === 'development' ? [thunk, createLogger()] : [thunk];

export const createStore = 
  (): Store<RootState> => reduxCreateStore<RootState>(rootReducer, composeEnhancer(applyMiddleware(thunk)));

// export Dispatch;

// export default {
//   store,
//   getModel,
// };