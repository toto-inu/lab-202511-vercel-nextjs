'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { switchTenant } from '@/actions/tenant'
import { useRouter } from 'next/navigation'

interface Tenant {
  id: string
  name: string
  slug: string
  role: string
  plan: {
    name: string
    displayName: string
  }
}

interface TenantSwitcherProps {
  tenants: Tenant[]
  currentTenantId: string
}

export default function TenantSwitcher({ tenants, currentTenantId }: TenantSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const currentTenant = tenants.find(t => t.id === currentTenantId)

  const handleSwitch = async (tenantId: string) => {
    if (tenantId === currentTenantId) {
      setIsOpen(false)
      return
    }

    setIsLoading(true)

    try {
      await switchTenant(tenantId)
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to switch tenant:', error)
      alert('Tenantの切り替えに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-background border hover:bg-accent transition-colors disabled:opacity-50"
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{currentTenant?.name || 'Tenant'}</span>
          <span className="text-xs text-muted-foreground">
            {currentTenant?.role} • {currentTenant?.plan.displayName}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-72 bg-background border rounded-md shadow-lg z-20">
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Tenant切り替え
              </div>
              {tenants.map(tenant => (
                <button
                  key={tenant.id}
                  onClick={() => handleSwitch(tenant.id)}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <div className="flex-shrink-0 w-5">
                    {tenant.id === currentTenantId && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{tenant.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {tenant.role} • {tenant.plan.displayName}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
