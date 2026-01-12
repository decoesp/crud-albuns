import { Fragment, ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export default function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <Fragment>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className={cn(
            'bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full max-h-[90vh] overflow-auto',
            'sm:max-w-lg',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between p-4 sm:p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="p-4 sm:p-4">{children}</div>
        </div>
      </div>
    </Fragment>
  )
}
