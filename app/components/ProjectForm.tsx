'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/actions/project'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ProjectFormProps {
  tenantId: string
}

export default function ProjectForm({ tenantId }: ProjectFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setIsSubmitting(true)

    try {
      const project = await createProject(tenantId, formData)
      router.push(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
      setIsSubmitting(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameInput = e.target
    const slugInput = document.getElementById('slug') as HTMLInputElement

    if (slugInput && !slugInput.dataset.manuallyEdited) {
      slugInput.value = generateSlug(nameInput.value)
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slugInput = e.target
    slugInput.dataset.manuallyEdited = 'true'
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <form action={handleSubmit}>
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              プロジェクト名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="例: ウェブサイトリニューアル"
              onChange={handleNameChange}
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2">
              スラッグ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              required
              pattern="[a-z0-9-]+"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              placeholder="例: website-renewal"
              onChange={handleSlugChange}
            />
            <p className="mt-1 text-xs text-gray-500">
              URL用の識別子（半角英数字とハイフンのみ）
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="プロジェクトの説明を入力..."
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '作成中...' : 'プロジェクトを作成'}
            </Button>
            <Link href="/projects">
              <Button
                type="button"
                variant="ghost"
                className="px-6 py-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                キャンセル
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
