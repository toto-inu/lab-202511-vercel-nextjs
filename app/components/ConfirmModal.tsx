'use client'

import { useEffect, useRef } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: Props) {
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

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

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
      className="backdrop:bg-black/50 rounded-lg shadow-xl p-0 max-w-md w-full"
      onClose={onClose}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-600"
            type="button"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            type="button"
          >
            削除
          </button>
        </div>
      </div>
    </dialog>
  )
}
