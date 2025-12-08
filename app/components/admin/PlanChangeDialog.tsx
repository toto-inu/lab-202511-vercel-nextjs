'use client'

/**
 * プラン変更ダイアログコンポーネント（管理者用）
 */

import { useState, useEffect } from 'react'
import { getAllPlans, updateTenantPlan } from '@/actions/admin'
import { useRouter } from 'next/navigation'
import type { Plan } from '@prisma/client'

interface Tenant {
  id: string
  name: string
  plan: {
    id: string
    name: string
  }
}

interface PlanChangeDialogProps {
  tenant: Tenant
  isOpen: boolean
  onClose: () => void
}

export default function PlanChangeDialog({ tenant, isOpen, onClose }: PlanChangeDialogProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState(tenant.plan.id)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      loadPlans()
      setSelectedPlanId(tenant.plan.id)
      setError(null)
    }
  }, [isOpen, tenant.plan.id])

  const loadPlans = async () => {
    try {
      const allPlans = await getAllPlans()
      setPlans(allPlans)
    } catch (err) {
      setError('プラン一覧の取得に失敗しました')
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedPlanId === tenant.plan.id) {
      onClose()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await updateTenantPlan(tenant.id, selectedPlanId)
      router.refresh()
      onClose()
    } catch (err) {
      setError('プラン変更に失敗しました')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const formatLimit = (limit: number | null | undefined) => {
    if (limit === null || limit === undefined || limit === -1) return '無制限'
    return limit.toString()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">プラン変更</h2>
            <p className="text-gray-600">
              {tenant.name} のプランを変更します
            </p>
            <p className="text-sm text-gray-500 mt-1">
              現在: <span className="font-semibold">{tenant.plan.name}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              {plans.map((plan) => (
                <label
                  key={plan.id}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPlanId === plan.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={selectedPlanId === plan.id}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                        <span className="text-xl font-bold">
                          ¥{(plan.price ?? 0).toLocaleString()}
                          <span className="text-sm font-normal text-gray-500">/月</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">プロジェクト:</span>
                          <br />
                          <span className="font-medium">{formatLimit(plan.maxProjects)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">ユーザー:</span>
                          <br />
                          <span className="font-medium">{formatLimit(plan.maxUsersPerTenant)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Todo:</span>
                          <br />
                          <span className="font-medium">{formatLimit(plan.maxTodosPerProject)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading || selectedPlanId === tenant.plan.id}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '変更中...' : '変更する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
