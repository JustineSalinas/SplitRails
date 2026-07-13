import { Outlet } from 'react-router-dom'
import { Nav } from './Nav'

export function Layout() {
  return (
    <div className="min-h-screen pb-20 bg-bg text-text-primary font-sans">
      <Nav />
      <Outlet />
    </div>
  )
}
