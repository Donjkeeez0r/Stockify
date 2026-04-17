export type InventoryStatus = 'In Stock' | 'Low' | 'Out of Stock'
export type UserRole = 'ADMIN' | 'MANAGER' | 'WORKER'

export interface InventoryItem {
  id: string
  name: string
  sku: string
  quantity: number
  status: InventoryStatus
}

export interface UserProfile {
  userId: number
  email: string
  role: UserRole
}

export interface Category {
  id: number
  name: string
  description?: string | null
}
