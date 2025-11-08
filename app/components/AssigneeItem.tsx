'use client'

import { useState } from 'react'
import { Assignee } from '@prisma/client'
import { deleteAssignee, updateAssignee } from '@/actions/assignee'

type AssigneeWithCount = Assignee & {
  _count: {
    todos: number
  }
}

type Props = {
  assignee: AssigneeWithCount
}

export default function AssigneeItem({ assignee }: Props) {
  const [isEditing, setIsEditing] = useState(false)

  const handleDelete = async () => {
    if (assignee._count.todos > 0) {
      if (
        !confirm(
          `この担当者には${assignee._count.todos}件のTodoが割り当てられています。削除しますか？`
        )
      ) {
        return
      }
    } else {
      if (!confirm('この担当者を削除しますか？')) {
        return
      }
    }
    await deleteAssignee(assignee.id)
  }

  const handleUpdate = async (formData: FormData) => {
    await updateAssignee(assignee.id, formData)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg shadow">
        <form action={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              名前
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={assignee.name}
              required
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
              defaultValue={assignee.email}
              required
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-600"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium">{assignee.name}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {assignee.email}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            担当Todo: {assignee._count.todos}件
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            作成日: {new Date(assignee.createdAt).toLocaleDateString('ja-JP')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600"
          >
            編集
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}
