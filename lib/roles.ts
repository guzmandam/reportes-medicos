export enum Resource {
  USERS = 'users',
  PATIENTS = 'patients',
  MEDICAL_RECORDS = 'medical_records',
  APPOINTMENTS = 'appointments',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export interface Permission {
  resource: Resource
  actions: Action[]
}

export const ROLE_PERMISSIONS: Record<string, Record<Resource, Action[]>> = {
  admin: {
    [Resource.USERS]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MANAGE],
    [Resource.PATIENTS]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MANAGE],
    [Resource.MEDICAL_RECORDS]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MANAGE],
    [Resource.APPOINTMENTS]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MANAGE],
    [Resource.ANALYTICS]: [Action.READ, Action.MANAGE],
    [Resource.SETTINGS]: [Action.READ, Action.UPDATE, Action.MANAGE],
  },
  doctor: {
    [Resource.USERS]: [],
    [Resource.PATIENTS]: [Action.CREATE, Action.READ, Action.UPDATE],
    [Resource.MEDICAL_RECORDS]: [Action.CREATE, Action.READ, Action.UPDATE],
    [Resource.APPOINTMENTS]: [Action.CREATE, Action.READ, Action.UPDATE],
    [Resource.ANALYTICS]: [Action.READ],
    [Resource.SETTINGS]: [Action.READ],
  },
  nurse: {
    [Resource.USERS]: [],
    [Resource.PATIENTS]: [Action.READ, Action.UPDATE],
    [Resource.MEDICAL_RECORDS]: [Action.CREATE, Action.READ],
    [Resource.APPOINTMENTS]: [Action.READ, Action.UPDATE],
    [Resource.ANALYTICS]: [],
    [Resource.SETTINGS]: [],
  },
  receptionist: {
    [Resource.USERS]: [],
    [Resource.PATIENTS]: [Action.CREATE, Action.READ],
    [Resource.MEDICAL_RECORDS]: [],
    [Resource.APPOINTMENTS]: [Action.CREATE, Action.READ, Action.UPDATE],
    [Resource.ANALYTICS]: [],
    [Resource.SETTINGS]: [],
  },
  user: {
    [Resource.USERS]: [],
    [Resource.PATIENTS]: [Action.READ],
    [Resource.MEDICAL_RECORDS]: [Action.READ],
    [Resource.APPOINTMENTS]: [Action.READ],
    [Resource.ANALYTICS]: [],
    [Resource.SETTINGS]: [],
  },
}

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Full system access and management capabilities',
  doctor: 'Manage patients, medical records, and appointments',
  nurse: 'Access to patient data and ability to create medical records',
  receptionist: 'Manage appointments and basic patient information',
  user: 'Basic access to view information',
}

export function hasPermission(role: string, resource: Resource, action: Action): boolean {
  if (!role || !ROLE_PERMISSIONS[role]) return false
  if (!ROLE_PERMISSIONS[role][resource]) return false
  return ROLE_PERMISSIONS[role][resource].includes(action)
}

export function getRolePermissions(role: string): Record<Resource, Action[]> {
  return ROLE_PERMISSIONS[role] || {}
}

export function getAllRoles(): string[] {
  return Object.keys(ROLE_PERMISSIONS)
}

export function getRoleDescription(role: string): string {
  return ROLE_DESCRIPTIONS[role] || ''
} 