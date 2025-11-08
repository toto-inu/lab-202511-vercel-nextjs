'use client'

import { useState } from 'react'
import { Todo, Assignee } from '@prisma/client'
import { toggleTodo, deleteTodo, updateTodo } from '@/actions/todo'

type TodoWithAssignee = Todo & {
  assignee: Assignee | null
}

type AssigneeWithCount = Assignee & {
  _count: {
    todos: number
  }
}

type Props = {
  todo: TodoWithAssignee
  assignees: AssigneeWithCount[]
}

export default function TodoItem({ todo, assignees }: Props) {
  const [isEditing, setIsEditing] = useState(false)

  const handleToggle = async () => {
    await toggleTodo(todo.id, !todo.completed)
  }

  const handleDelete = async () => {
    if (confirm('このTodoを削除しますか？')) {
      await deleteTodo(todo.id)
    }
  }

  const handleUpdate = async (formData: FormData) => {
    await updateTodo(todo.id, formData)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg shadow">
        <form action={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={todo.title}
              required
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
              defaultValue={todo.description || ''}
              rows={3}
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
              defaultValue={todo.assigneeId || ''}
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
                defaultChecked={todo.completed}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">完了</span>
            </label>
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
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="mt-1 w-5 h-5 cursor-pointer"
        />
        <div className="flex-1">
          <h3
            className={`text-lg font-medium ${
              todo.completed ? 'line-through text-zinc-500' : ''
            }`}
          >
            {todo.title}
          </h3>
          {todo.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {todo.description}
            </p>
          )}
          {todo.assignee && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              担当者: {todo.assignee.name}
            </p>
          )}
          <p className="text-xs text-zinc-500 mt-2">
            作成日: {new Date(todo.createdAt).toLocaleDateString('ja-JP')}
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
