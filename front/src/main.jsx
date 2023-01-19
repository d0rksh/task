import { ChakraProvider } from '@chakra-ui/react'
import { configureStore } from '@reduxjs/toolkit'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { api } from './store/api'
import slice from './store/store'

const store = configureStore({
  reducer:{
    auth: slice.reducer,
    api: api.reducer
  },
  middleware: (getDefaultMiddleware) =>{
    return getDefaultMiddleware().concat(api.middleware)
  },
  devTools: process.env.NODE_ENV === 'development'
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
)
