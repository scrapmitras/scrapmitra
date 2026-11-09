import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ThemeProvider } from './theme-context'

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App


