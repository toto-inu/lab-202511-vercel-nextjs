'use client'

import { useEffect, useRef } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current
    if (!dialog) return

    const rect = dialog.getBoundingClientRect()
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width

    if (!isInDialog) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="backdrop:bg-black/50 rounded-lg shadow-xl p-0 max-w-2xl w-full"
      onClose={onClose}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-lg">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-2xl"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </dialog>
  )
}
