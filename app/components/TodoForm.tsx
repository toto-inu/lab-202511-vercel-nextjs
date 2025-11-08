'use client'

import { Assignee } from '@prisma/client'
import { createTodo } from '@/actions/todo'

type AssigneeWithCount = Assignee & {
  _count: {
    todos: number
  }
}

type Props = {
  assignees: AssigneeWithCount[]
}

export default function TodoForm({ assignees }: Props) {
  const handleSubmit = async (formData: FormData) => {
    await createTodo(formData)
    // フォームをリセット
    const form = document.getElementById('todo-form') as HTMLFormElement
    form?.reset()
  }

  return (
    <form id="todo-form" action={handleSubmit} className="space-y-4">
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
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        追加
      </button>
    </form>
  )
}
