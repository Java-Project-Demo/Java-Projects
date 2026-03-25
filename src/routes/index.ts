import { useRoutes } from 'react-router-dom'
import LayoutClient from '../layouts/LayoutClient.tsx'
import Home from '../pages/Home.tsx'

function App() {
  return useRoutes([
    {
      path: '/',
      Component: LayoutClient,
      children: [{ index: true, Component: Home }]
    }
  ])
}

export default App
