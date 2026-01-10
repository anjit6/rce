import { ReactNode, useState } from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
  showSidebar?: boolean
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (!showSidebar) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      <main className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  )
}
