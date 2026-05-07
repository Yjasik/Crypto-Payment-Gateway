// src/app/(dashboard)/products/page.tsx — Product management page
'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Search,
  Package,
  Copy,
  Check,
  ExternalLink,
  Pencil,
  Trash2,
  DollarSign,
  Link as LinkIcon,
} from 'lucide-react'
import Link from 'next/link'

// Product type definition
interface Product {
  id: string
  name: string
  description: string
  price: string
  currency: string
  paymentLink: string
  status: 'active' | 'inactive'
  createdAt: string
  totalSales: number
}

// Mock data for development
const mockProducts: Product[] = [
  {
    id: 'prod_abc123',
    name: 'Premium NFT Collection',
    description: 'Exclusive NFT collection with 10 unique artworks',
    price: '150.00',
    currency: 'USDC',
    paymentLink: '/pay/prod_abc123',
    status: 'active',
    createdAt: '2026-05-01',
    totalSales: 12,
  },
  {
    id: 'prod_def456',
    name: 'DeFi Course Access',
    description: 'Full access to DeFi masterclass video course',
    price: '0.05',
    currency: 'ETH',
    paymentLink: '/pay/prod_def456',
    status: 'active',
    createdAt: '2026-04-28',
    totalSales: 45,
  },
  {
    id: 'prod_ghi789',
    name: 'Consulting Session 1h',
    description: 'One-hour blockchain consulting session',
    price: '200.00',
    currency: 'USDT',
    paymentLink: '/pay/prod_ghi789',
    status: 'inactive',
    createdAt: '2026-04-15',
    totalSales: 8,
  },
]

export default function ProductsPage() {
  const { isConnected, address } = useAccount()
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USDC',
  })

  // Copy payment link to clipboard
  const copyToClipboard = (text: string) => {
    const fullUrl = `${window.location.origin}${text}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedLink(text)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  // Format address
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  // Filter products
  const filteredProducts = mockProducts.filter((product) => {
    return (
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.currency.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Handle create product
  const handleCreateProduct = () => {
    console.log('Creating product:', newProduct)
    // TODO: Add real product creation logic
    setIsCreateOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your products and payment links
          </p>
        </div>

        {/* Create product button */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger>
              <Plus className="mr-2 h-4 w-4" />
              Create Product
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription>
                Add a new product and generate a payment link for your customers.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Premium NFT Collection"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product..."
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300"
                    value={newProduct.currency}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, currency: e.target.value })
                    }
                  >
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProduct}>
                Create Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search products by name, description, currency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products list */}
      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Connect your wallet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Connect your wallet to manage products
            </p>
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              No products yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create your first product to start accepting payments
            </p>
            <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Payment Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    {/* Product info */}
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.description.slice(0, 50)}...
                        </p>
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium">
                          {product.price} {product.currency}
                        </span>
                      </div>
                    </TableCell>

                    {/* Payment link */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link
                          href={product.paymentLink}
                          className="flex items-center gap-1 text-sm text-purple-600 hover:underline dark:text-purple-400"
                        >
                          <LinkIcon className="h-3 w-3" />
                          {product.paymentLink}
                        </Link>
                        <button
                          onClick={() => copyToClipboard(product.paymentLink)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {copiedLink === product.paymentLink ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        className={
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>

                    {/* Sales */}
                    <TableCell className="text-sm">
                      {product.totalSales} sold
                    </TableCell>

                    {/* Created */}
                    <TableCell className="text-sm text-gray-500">
                      {product.createdAt}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}