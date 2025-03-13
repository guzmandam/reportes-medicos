'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Resource, Action, hasPermission } from '@/lib/roles'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
  requiredPermissions?: Array<{
    resource: Resource
    action: Action
  }>
}

export function ProtectedRoute({ 
  children, 
  adminOnly = false,
  requiredPermissions = []
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Check authentication
      if (!user) {
        router.push('/login')
        return
      }

      // Check admin access if required
      if (adminOnly && user.role !== 'admin') {
        router.push('/')
        return
      }

      // Check specific permissions
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(
          ({ resource, action }) => hasPermission(user.role, resource, action)
        )
        if (!hasAllPermissions) {
          router.push('/')
          return
        }
      }
    }
  }, [user, isLoading, adminOnly, requiredPermissions, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  // Check permissions before rendering
  if (!user || (adminOnly && user.role !== 'admin')) {
    return null
  }

  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(
      ({ resource, action }) => hasPermission(user.role, resource, action)
    )
    if (!hasAllPermissions) {
      return null
    }
  }

  return <>{children}</>
} 