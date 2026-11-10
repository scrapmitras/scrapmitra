import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ThemeProvider } from './theme-context'
import { AuthProvider } from './auth-context'

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
