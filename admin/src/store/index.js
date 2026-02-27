import { applyMiddleware, compose, createStore } from 'redux'
import reducer from './reducer'

const composeEnhancers = () => process.env.REACT_APP_NODE_ENV === 'development' ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose

const store = createStore(reducer, composeEnhancers(applyMiddleware()))

export { store }
