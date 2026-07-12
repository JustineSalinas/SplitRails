import { Outlet } from 'react-router-dom'
import { Nav } from './Nav'

export function Layout() {
  return (
    <div className="min-h-screen pb-20 bg-[#f9f9ff] text-[#181c23] font-sans">
      <Nav />
      <Outlet />
    </div>
  )
}
