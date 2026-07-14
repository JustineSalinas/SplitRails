import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Nav } from './Nav'

export function Layout() {
  return (
    <div className="min-h-screen pb-20 max-lg:pb-24 bg-bg text-text-primary font-sans">
      <Nav />
      <Outlet />
      <BottomNav />
    </div>
  )
}
