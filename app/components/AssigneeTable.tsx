'use client'

import { useState } from 'react'
import { Assignee } from '@prisma/client'
import { deleteAssignee, createAssignee, updateAssignee } from '@/actions/assignee'
import Modal from './Modal'
import ConfirmModal from './ConfirmModal'

type AssigneeWithCount = Assignee & {
  _count: {
    todos: number
  }
}

type Props = {
  assignees: AssigneeWithCount[]
}

export default function AssigneeTable({ assignees }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState<AssigneeWithCount | null>(null)

  const handleEditClick = (assignee: AssigneeWithCount) => {
    setSelectedAssignee(assignee)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (assignee: AssigneeWithCount) => {
    setSelectedAssignee(assignee)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedAssignee) {
      await deleteAssignee(selectedAssignee.id)
      setSelectedAssignee(null)
    }
  }

  const handleCreateSubmit = async (formData: FormData) => {
    await createAssignee(formData)
    setIsCreateModalOpen(false)
  }

  const handleEditSubmit = async (formData: FormData) => {
    if (selectedAssignee) {
      await updateAssignee(selectedAssignee.id, formData)
      setIsEditModalOpen(false)
      setSelectedAssignee(null)
    }
  }

  return (
    <>
      <div className="mb-4">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + 新しい担当者を追加
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                名前
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                メールアドレス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                担当Todo数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                作成日
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-32">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {assignees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  担当者がまだいません
                </td>
              </tr>
            ) : (
              assignees.map((assignee) => (
                <tr key={assignee.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4">
                    <span className="font-medium">{assignee.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {assignee.email}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {assignee._count.todos}件
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-500">
                      {new Date(assignee.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditClick(assignee)}
                      className="px-3 py-1 text-sm bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 mr-2"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteClick(assignee)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 作成モーダル */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="新しい担当者を追加"
      >
        <form action={handleCreateSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              名前
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="山田太郎"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="yamada@example.com"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800"
            />
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-600"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              追加
            </button>
          </div>
        </form>
      </Modal>

      {/* 編集モーダル */}
      {selectedAssignee && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedAssignee(null)
          }}
          title="担当者を編集"
        >
          <form action={handleEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
                名前
              </label>
              <input
                type="text"
                id="edit-name"
                name="name"
                defaultValue={selectedAssignee.name}
                required
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                id="edit-email"
                name="email"
                defaultValue={selectedAssignee.email}
                required
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedAssignee(null)
                }}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-600"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 削除確認モーダル */}
      {selectedAssignee && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedAssignee(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="担当者を削除"
          message={
            selectedAssignee._count.todos > 0
              ? `「${selectedAssignee.name}」には${selectedAssignee._count.todos}件のTodoが割り当てられています。削除してもよろしいですか？この操作は取り消せません。`
              : `「${selectedAssignee.name}」を削除してもよろしいですか？この操作は取り消せません。`
          }
        />
      )}
    </>
  )
}
