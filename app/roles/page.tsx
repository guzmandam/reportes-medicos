'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Resource, Action } from '@/lib/roles'
import api from '@/lib/axios'
import { toast } from 'react-hot-toast'

interface Role {
  id: string
  name: string
  description: string
  permissions: Record<Resource, Action[]>
  is_system_role: boolean
}

export default function RolesPage() {
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [resources, setResources] = useState<{ name: string; actions: string[] }[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  useEffect(() => {
    fetchRoles()
    fetchResources()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles')
      setRoles(response.data)
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Failed to fetch roles')
    }
  }

  const fetchResources = async () => {
    try {
      const response = await api.get('/resources')
      setResources(response.data)
    } catch (error) {
      console.error('Error fetching resources:', error)
      toast.error('Failed to fetch resources')
    }
  }

  const handleCreateRole = async (role: Omit<Role, 'id'>) => {
    setIsLoading(true)
    try {
      await api.post('/roles', role)
      await fetchRoles()
      toast.success('Role created successfully')
      return true
    } catch (error: any) {
      console.error('Error creating role:', error)
      toast.error(error.response?.data?.detail || 'Failed to create role')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRole = async (id: string, role: Partial<Role>) => {
    setIsLoading(true)
    try {
      await api.put(`/roles/${id}`, role)
      await fetchRoles()
      toast.success('Role updated successfully')
      return true
    } catch (error: any) {
      console.error('Error updating role:', error)
      toast.error(error.response?.data?.detail || 'Failed to update role')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const openDeleteModal = (role: Role) => {
    setRoleToDelete(role)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setRoleToDelete(null)
  }

  const handleDeleteRole = async () => {
    if (!roleToDelete) return
    
    setIsLoading(true)
    try {
      await api.delete(`/roles/${roleToDelete.id}`)
      await fetchRoles()
      toast.success('Role deleted successfully')
      closeDeleteModal()
    } catch (error: any) {
      console.error('Error deleting role:', error)
      toast.error(error.response?.data?.detail || 'Failed to delete role')
    } finally {
      setIsLoading(false)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="mt-2 text-gray-600">Manage user roles and their permissions</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Role List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Roles</h2>
                <button
                  onClick={() => {
                    setSelectedRole(null)
                    setIsEditing(true)
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  disabled={isLoading}
                >
                  Create New Role
                </button>
              </div>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{role.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedRole(role)
                          setIsEditing(true)
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={isLoading || role.is_system_role}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(role)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        disabled={role.is_system_role || isLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Role Editor */}
          {isEditing && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {selectedRole ? 'Edit Role' : 'Create Role'}
                </h2>
                <RoleEditor
                  role={selectedRole}
                  resources={resources}
                  isLoading={isLoading}
                  onSave={async (roleData) => {
                    let success;
                    if (selectedRole) {
                      success = await handleUpdateRole(selectedRole.id, roleData)
                    } else {
                      success = await handleCreateRole(roleData as Omit<Role, 'id'>)
                    }
                    if (success) {
                      setIsEditing(false)
                      setSelectedRole(null)
                    }
                  }}
                  onCancel={() => {
                    setIsEditing(false)
                    setSelectedRole(null)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRole}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface RoleEditorProps {
  role: Role | null
  resources: { name: string; actions: string[] }[]
  isLoading: boolean
  onSave: (role: Partial<Role>) => void
  onCancel: () => void
}

function RoleEditor({ role, resources, isLoading, onSave, onCancel }: RoleEditorProps) {
  const [formData, setFormData] = useState<Omit<Role, 'id' | 'is_system_role'>>({
    name: '',
    description: '',
    permissions: {
      [Resource.USERS]: [],
      [Resource.PATIENTS]: [],
      [Resource.MEDICAL_RECORDS]: [],
      [Resource.APPOINTMENTS]: [],
      [Resource.ANALYTICS]: [],
      [Resource.SETTINGS]: [],
    },
  })

  // Update form data when role changes
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      })
    } else {
      // Clear form data for new role creation
      setFormData({
        name: '',
        description: '',
        permissions: {
          [Resource.USERS]: [],
          [Resource.PATIENTS]: [],
          [Resource.MEDICAL_RECORDS]: [],
          [Resource.APPOINTMENTS]: [],
          [Resource.ANALYTICS]: [],
          [Resource.SETTINGS]: [],
        },
      })
    }
  }, [role])

  const handlePermissionChange = (resource: string, action: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [resource]: checked
          ? [...(prev.permissions?.[resource as Resource] || []), action as Action]
          : (prev.permissions?.[resource as Resource] || []).filter((a) => a !== action),
      },
    }))
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(formData)
      }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          rows={3}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Permissions</h3>
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.name} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">{resource.name}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {resource.actions.map((action) => (
                  <label key={`${resource.name}-${action}`} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.[resource.name as Resource]?.includes(
                        action as Action
                      )}
                      onChange={(e) =>
                        handlePermissionChange(resource.name, action, e.target.checked)
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-700">{action}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
} 