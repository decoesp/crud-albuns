import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { LogOut, Image, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/utils'
import SkipLink from './ui/SkipLink'

export default function Layout() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipLink href="#main-content">Pular para o conteúdo principal</SkipLink>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link to="/albums" className="flex items-center gap-2 text-lg sm:text-xl font-bold text-primary-600">
              <Image className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="hidden sm:inline">Meus Álbuns de Fotos</span>
              <span className="sm:hidden">Álbuns</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Olá, <span className="font-medium">{user?.name}</span>
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={cn(
            'sm:hidden border-t border-gray-200 transition-all duration-200 ease-in-out overflow-hidden',
            isMobileMenuOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
          )}>
            <div className="py-4 space-y-3">
              <div className="text-sm text-gray-600">
                Olá, <span className="font-medium">{user?.name}</span>
              </div>
              <button
                onClick={() => {
                  logout()
                  setIsMobileMenuOpen(false)
                }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8" role="main">
        <Outlet />
      </main>
    </div>
  )
}
