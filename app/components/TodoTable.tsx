'use client'

import { useState } from 'react'
import { Todo, Assignee } from '@prisma/client'
import { toggleTodo, deleteTodo, createTodo, updateTodo } from '@/actions/todo'
import Modal from './Modal'
import ConfirmModal from './ConfirmModal'

type TodoWithAssignee = Todo & {
  assignee: Assignee | null
}

type AssigneeWithCount = Assignee & {
  _count: {
    todos: number
  }
}

type Props = {
  todos: TodoWithAssignee[]
  assignees: AssigneeWithCount[]
}

export default function TodoTable({ todos, assignees }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<TodoWithAssignee | null>(null)

  const handleToggle = async (todo: TodoWithAssignee) => {
    await toggleTodo(todo.id, !todo.completed)
  }

  const handleEditClick = (todo: TodoWithAssignee) => {
    setSelectedTodo(todo)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (todo: TodoWithAssignee) => {
    setSelectedTodo(todo)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedTodo) {
      await deleteTodo(selectedTodo.id)
      setSelectedTodo(null)
    }
  }

  const handleCreateSubmit = async (formData: FormData) => {
    await createTodo(formData)
    setIsCreateModalOpen(false)
  }

  const handleEditSubmit = async (formData: FormData) => {
    if (selectedTodo) {
      await updateTodo(selectedTodo.id, formData)
      setIsEditModalOpen(false)
      setSelectedTodo(null)
    }
  }

  return (
    <>
      <div className="mb-4">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + 新しいTodoを追加
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-12">
                完了
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                タイトル
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                説明
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                担当者
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
            {todos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  Todoがまだありません
                </td>
              </tr>
            ) : (
              todos.map((todo) => (
                <tr key={todo.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo)}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-medium ${
                        todo.completed ? 'line-through text-zinc-500' : ''
                      }`}
                    >
                      {todo.title}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {todo.description || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {todo.assignee?.name || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-500">
                      {new Date(todo.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditClick(todo)}
                      className="px-3 py-1 text-sm bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 mr-2"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteClick(todo)}
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
        title="新しいTodoを追加"
      >
        <form action={handleCreateSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="買い物に行く"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="野菜と果物を買う"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800"
            />
          </div>
          <div>
            <label htmlFor="assigneeId" className="block text-sm font-medium mb-1">
              担当者
            </label>
            <select
              id="assigneeId"
              name="assigneeId"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800"
            >
              <option value="">なし</option>
              {assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </option>
              ))}
            </select>
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
      {selectedTodo && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedTodo(null)
          }}
          title="Todoを編集"
        >
          <form action={handleEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium mb-1">
                タイトル
              </label>
              <input
                type="text"
                id="edit-title"
                name="title"
                defaultValue={selectedTodo.title}
                required
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium mb-1">
                説明
              </label>
              <textarea
                id="edit-description"
                name="description"
                defaultValue={selectedTodo.description || ''}
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label htmlFor="edit-assigneeId" className="block text-sm font-medium mb-1">
                担当者
              </label>
              <select
                id="edit-assigneeId"
                name="assigneeId"
                defaultValue={selectedTodo.assigneeId || ''}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800"
              >
                <option value="">なし</option>
                {assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="completed"
                  value="true"
                  defaultChecked={selectedTodo.completed}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">完了</span>
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedTodo(null)
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
      {selectedTodo && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedTodo(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Todoを削除"
          message={`「${selectedTodo.title}」を削除してもよろしいですか？この操作は取り消せません。`}
        />
      )}
    </>
  )
}
