import { useCallback, useEffect, useState } from 'react'
import { api } from '@/services/api/axios'
import type { InventoryItem, InventoryStatus } from '@/lib/types'

const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'MacBook Pro 14"', sku: 'MBP-14-M4', quantity: 23, status: 'In Stock' },
  { id: '2', name: 'Logitech MX Master 3S', sku: 'LGT-MX3S', quantity: 8, status: 'Low' },
  { id: '3', name: 'Dell UltraSharp U2723QE', sku: 'DLL-U2723', quantity: 4, status: 'Low' },
  { id: '4', name: 'Apple Magic Keyboard', sku: 'APL-MKYB', quantity: 32, status: 'In Stock' },
  { id: '5', name: 'Samsung T7 SSD 1TB', sku: 'SMS-T7-1T', quantity: 17, status: 'In Stock' },
  { id: '6', name: 'Raspberry Pi 5', sku: 'RPI-5-8G', quantity: 0, status: 'Out of Stock' },
  { id: '7', name: 'TP-Link Omada Switch', sku: 'TPL-OM-SW', quantity: 11, status: 'In Stock' },
]

type ProductApiItem = {
  id?: number | string
  name?: string
  quantity?: number
}

const toInventoryStatus = (quantity: number): InventoryStatus => {
  if (quantity <= 0) return 'Out of Stock'
  if (quantity <= 10) return 'Low'
  return 'In Stock'
}

const mapProductsToInventory = (products: ProductApiItem[]): InventoryItem[] =>
  products.slice(0, 10).map((item, index) => {
    const quantity = item.quantity ?? 0
    return {
      id: String(item.id ?? index + 1),
      name: item.name ?? `Item ${index + 1}`,
      sku: `SKU-${String(item.id ?? index + 1).padStart(4, '0')}`,
      quantity,
      status: toInventoryStatus(quantity),
    }
  })

export function useGetInventoryItems() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInventoryItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get<ProductApiItem[] | { data: ProductApiItem[] }>('/products', {
        params: { take: 10 },
      })

      const products = Array.isArray(response.data) ? response.data : response.data.data

      setItems(Array.isArray(products) ? mapProductsToInventory(products) : [])
    } catch {
      setError('Не удалось загрузить данные с сервера. Показаны mock-данные.')
      setItems(MOCK_INVENTORY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchInventoryItems()
  }, [fetchInventoryItems])

  return {
    items,
    isLoading,
    error,
    refetch: fetchInventoryItems,
  }
}
