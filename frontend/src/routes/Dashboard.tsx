import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { BarChart3, Boxes, LayoutDashboard, LogOut, PackageSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useGetInventoryItems } from '@/hooks/use-get-inventory-items'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/services/api/axios'
import type { Category, UserRole } from '@/lib/types'

const sidebarLinks = [
  { label: 'Overview', icon: LayoutDashboard, sectionId: 'overview-section' },
  { label: 'Inventory', icon: Boxes, sectionId: 'inventory-section' },
  { label: 'Analytics', icon: BarChart3, sectionId: 'analytics-section' },
]

const statusClassMap = {
  'In Stock': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Low: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Out of Stock': 'bg-red-500/10 text-red-500 border-red-500/20',
}

const roleClassMap: Record<UserRole, string> = {
  ADMIN: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  MANAGER: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  WORKER: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
}

export default function Dashboard() {
  const { items, isLoading, error, refetch } = useGetInventoryItems()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)

  const [categories, setCategories] = useState<Category[]>([])
  const [createCategoryState, setCreateCategoryState] = useState<'idle' | 'success' | 'error'>('idle')
  const [createProductState, setCreateProductState] = useState<'idle' | 'success' | 'error'>('idle')
  const [createCategoryMessage, setCreateCategoryMessage] = useState<string | null>(null)
  const [createProductMessage, setCreateProductMessage] = useState<string | null>(null)

  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')

  const [productName, setProductName] = useState('')
  const [productQuantity, setProductQuantity] = useState('0')
  const [productPrice, setProductPrice] = useState('0')
  const [productCategoryId, setProductCategoryId] = useState('')

  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [activeSection, setActiveSection] = useState<(typeof sidebarLinks)[number]['sectionId']>('overview-section')

  const isAdmin = user?.role === 'ADMIN'

  const loadCategories = useCallback(async () => {
    try {
      const response = await api.get<Category[]>('/categories')
      setCategories(response.data)

      if (response.data.length > 0 && !productCategoryId) {
        setProductCategoryId(String(response.data[0].id))
      }
    } catch {
      setCategories([])
    }
  }, [productCategoryId])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  const roleBadgeClass = useMemo(() => {
    if (!user?.role) {
      return 'border-border bg-muted text-muted-foreground'
    }

    return roleClassMap[user.role]
  }, [user?.role])

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreateCategoryState('idle')
    setCreateCategoryMessage(null)

    if (!categoryName.trim()) {
      setCreateCategoryState('error')
      setCreateCategoryMessage('Введите название категории')
      return
    }

    setIsCreatingCategory(true)

    try {
      await api.post('/categories', {
        name: categoryName.trim(),
        description: categoryDescription.trim() || undefined,
      })

      setCreateCategoryState('success')
      setCreateCategoryMessage('Категория успешно создана')
      setCategoryName('')
      setCategoryDescription('')
      await loadCategories()
    } catch {
      setCreateCategoryState('error')
      setCreateCategoryMessage('Не удалось создать категорию. Доступно только роли ADMIN.')
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreateProductState('idle')
    setCreateProductMessage(null)

    const parsedQuantity = Number(productQuantity)
    const parsedPrice = Number(productPrice)
    const parsedCategoryId = Number(productCategoryId)

    if (!productName.trim() || Number.isNaN(parsedCategoryId)) {
      setCreateProductState('error')
      setCreateProductMessage('Заполните название товара и выберите категорию')
      return
    }

    setIsCreatingProduct(true)

    try {
      await api.post('/products', {
        name: productName.trim(),
        quantity: Number.isNaN(parsedQuantity) ? 0 : parsedQuantity,
        price: Number.isNaN(parsedPrice) ? 0 : parsedPrice,
        categoryId: parsedCategoryId,
      })

      setCreateProductState('success')
      setCreateProductMessage('Товар успешно создан')
      setProductName('')
      setProductQuantity('0')
      setProductPrice('0')
      await refetch()
    } catch {
      setCreateProductState('error')
      setCreateProductMessage('Не удалось создать товар. Проверьте права ADMIN и данные формы.')
    } finally {
      setIsCreatingProduct(false)
    }
  }

  const scrollToSection = (sectionId: (typeof sidebarLinks)[number]['sectionId']) => {
    setActiveSection(sectionId)

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const totalStocks = items.reduce((acc, item) => acc + item.quantity, 0)
  const lowStockItems = items.filter((item) => item.status === 'Low').length
  const outOfStockItems = items.filter((item) => item.status === 'Out of Stock').length

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r bg-card/70 px-5 py-6 backdrop-blur-xl">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PackageSearch className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">Stockify</p>
            <p className="text-xs text-muted-foreground">Inventory Management</p>
          </div>
        </div>

        <nav className="space-y-1">
          {sidebarLinks.map(({ sectionId, icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => scrollToSection(sectionId)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                activeSection === sectionId && 'bg-accent text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="ml-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-3 border-b bg-background/85 px-8 backdrop-blur">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src="https://i.pravatar.cc/100?img=12" alt="User avatar" />
                  <AvatarFallback>DK</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{user?.email ?? 'Гость'}</DropdownMenuItem>
              <DropdownMenuItem>Role: {user?.role ?? 'UNKNOWN'}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-1 h-4 w-4" />
            Logout
          </Button>
        </header>

        <main className="space-y-8 px-8 py-8">
          <section id="overview-section" className="scroll-mt-24">
            <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">Real-time summary of your warehouse activity.</p>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Личный кабинет</CardTitle>
                <CardDescription>Текущая сессия и роль пользователя</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                  <p className="text-sm">{user?.email ?? 'Не авторизован'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
                  <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-medium', roleBadgeClass)}>
                    {user?.role ?? 'UNKNOWN'}
                  </span>
                </div>
                {!token ? (
                  <p className="text-xs text-amber-300">
                    Для создания категорий и товаров сначала войдите и получите JWT-токен.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Добавить категорию</CardTitle>
                <CardDescription>Только для роли ADMIN</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={handleCreateCategory}>
                  <Input
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    placeholder="Название категории"
                  />
                  <Input
                    value={categoryDescription}
                    onChange={(event) => setCategoryDescription(event.target.value)}
                    placeholder="Описание (опционально)"
                  />
                  {createCategoryMessage ? (
                    <p
                      className={cn(
                        'text-xs',
                        createCategoryState === 'success' ? 'text-emerald-400' : 'text-red-400',
                      )}
                    >
                      {createCategoryMessage}
                    </p>
                  ) : null}
                  <Button type="submit" className="w-full" disabled={!isAdmin || isCreatingCategory}>
                    {isCreatingCategory ? 'Создаём...' : 'Создать категорию'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Добавить товар</CardTitle>
                <CardDescription>Только для роли ADMIN</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={handleCreateProduct}>
                  <Input
                    value={productName}
                    onChange={(event) => setProductName(event.target.value)}
                    placeholder="Название товара"
                  />
                  <Input
                    value={productQuantity}
                    onChange={(event) => setProductQuantity(event.target.value)}
                    placeholder="Количество"
                    type="number"
                    min={0}
                  />
                  <Input
                    value={productPrice}
                    onChange={(event) => setProductPrice(event.target.value)}
                    placeholder="Цена"
                    type="number"
                    min={0}
                    step="0.01"
                  />
                  <select
                    value={productCategoryId}
                    onChange={(event) => setProductCategoryId(event.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {categories.length === 0 ? <option value="">Нет категорий</option> : null}
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {createProductMessage ? (
                    <p
                      className={cn(
                        'text-xs',
                        createProductState === 'success' ? 'text-emerald-400' : 'text-red-400',
                      )}
                    >
                      {createProductMessage}
                    </p>
                  ) : null}
                  <Button type="submit" className="w-full" disabled={!isAdmin || isCreatingProduct}>
                    {isCreatingProduct ? 'Создаём...' : 'Создать товар'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>

          {error ? (
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {error}
            </div>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader>
                <CardDescription>Total Stocks</CardDescription>
                <CardTitle className="text-3xl">{totalStocks}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Low Stock Items</CardDescription>
                <CardTitle className="text-3xl">{lowStockItems}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Pending Orders</CardDescription>
                <CardTitle className="text-3xl">12</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Out of Stock</CardDescription>
                <CardTitle className="text-3xl">{outOfStockItems}</CardTitle>
              </CardHeader>
            </Card>
          </section>

          <section id="inventory-section" className="scroll-mt-24">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Inventory</CardTitle>
                  <CardDescription>Latest warehouse snapshot</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={refetch}>
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-sm text-muted-foreground">Loading inventory data...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                            No inventory items yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                                  statusClassMap[item.status],
                                )}
                              >
                                {item.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>

          <section id="analytics-section" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Быстрый срез по текущему состоянию склада</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Категорий</p>
                  <p className="mt-2 text-2xl font-semibold">{categories.length}</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">SKU в таблице</p>
                  <p className="mt-2 text-2xl font-semibold">{items.length}</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Низкий остаток</p>
                  <p className="mt-2 text-2xl font-semibold">{lowStockItems}</p>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}
