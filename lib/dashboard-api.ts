import api from './axios'

export interface DashboardStats {
  total_patients: number
  total_files: number
  pending_uploads: number
  active_users: number
  changes: {
    patients: number
    files: number
    pending: number
    users: number
  }
  weekly_activity: Array<{
    name: string
    uploads: number
    processed: number
  }>
  recent_uploads: Array<{
    id: string
    filename: string
    uploadedBy: string
    status: string
    time: string
    avatar: string
    initials: string
  }>
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats')
    return response.data
  }
} 