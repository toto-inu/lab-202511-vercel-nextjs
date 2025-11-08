'use client'

import { createAssignee } from '@/actions/assignee'

export default function AssigneeForm() {
  const handleSubmit = async (formData: FormData) => {
    await createAssignee(formData)
    // フォームをリセット
    const form = document.getElementById('assignee-form') as HTMLFormElement
    form?.reset()
  }

  return (
    <form id="assignee-form" action={handleSubmit} className="space-y-4">
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
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        追加
      </button>
    </form>
  )
}
