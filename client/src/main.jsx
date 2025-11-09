import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core'
import { ApolloProvider } from '@apollo/client/react'

// ✅ Create an explicit HttpLink
const link = new HttpLink({
  uri: 'http://localhost:4000/graphql', // your GraphQL endpoint
})

const client = new ApolloClient({
  link, 
  cache: new InMemoryCache(),
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
)
