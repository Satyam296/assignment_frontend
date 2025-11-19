import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://assignment-backend-2-tt6x.onrender.com/api');

interface VariantInventory {
  id: string;
  name: string;
  color?: string;
  storage?: string;
  stock: number;
  isLowStock: boolean;
}

interface ProductInventory {
  id: string;
  slug: string;
  name: string;
  category: string;
  variants: VariantInventory[];
  totalStock: number;
  lowStockCount: number;
  variantCount: number;
}

interface LowStockItem {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  color?: string;
  storage?: string;
  currentStock: number;
  price: number;
}

interface Order {
  id: string;
  product_name: string;
  variant_color?: string;
  variant_storage?: string;
  variant_price: number;
  emi_tenure: number;
  monthly_payment: number;
  status: string;
  expected_delivery_date?: string;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductInventory | null>(null);
  const [updateStock, setUpdateStock] = useState<{ [key: string]: number }>({});
  const [threshold] = useState(5);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; productId: string; productName: string }>({ show: false, productId: '', productName: '' });
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');

  useEffect(() => {
    fetchInventory();
    fetchLowStockItems();
    fetchOrders();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/inventory`);
      setInventory(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventory([]);
      setLoading(false);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/inventory/low-stock?threshold=${threshold}`);
      setLowStockItems(response.data || []);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      setLowStockItems([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/orders`);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const handleUpdateStock = async (productId: string, variantId: string, newStock: number) => {
    try {
      await axios.put(`${API_BASE_URL}/admin/inventory/update-stock`, {
        productId,
        variantId,
        newStock: parseInt(newStock.toString()),
      });
      
      alert('Stock updated successfully!');
      fetchInventory();
      fetchLowStockItems();
      setUpdateStock({});
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}`);
      setDeleteModal({ show: false, productId: '', productName: '' });
      fetchInventory();
      fetchLowStockItems();
      alert('Product deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.error || 'Failed to delete product');
    }
  };

  const totalProducts = inventory?.length || 0;
  const totalVariants = inventory?.reduce((sum, p) => sum + (p.variantCount || 0), 0) || 0;
  const totalStock = inventory?.reduce((sum, p) => sum + (p.totalStock || 0), 0) || 0;
  const totalLowStock = lowStockItems?.length || 0;
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Inventory Management System</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/products/add')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-semibold"
              >
                + Add Product
              </button>
              <a 
                href="/" 
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors text-sm font-semibold"
              >
                Back to Store
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`pb-4 px-2 font-semibold text-sm transition-colors relative ${
                activeTab === 'inventory'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📦 Inventory Management
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 px-2 font-semibold text-sm transition-colors relative ${
                activeTab === 'orders'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🛒 Orders
              {pendingOrders > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingOrders}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Variants</p>
            <p className="text-3xl font-bold text-gray-900">{totalVariants}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Stock</p>
            <p className="text-3xl font-bold text-teal-600">{totalStock}</p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200">
            <p className="text-sm text-red-600 mb-1">Low Stock Items</p>
            <p className="text-3xl font-bold text-red-600">{totalLowStock}</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-1">⚠️ Low Stock Alert</h3>
                <p className="text-sm text-red-700">{lowStockItems.length} items are running low on stock (below {threshold} units)</p>
              </div>
            </div>
            <div className="space-y-2">
              {lowStockItems.map((item, idx) => (
                <div key={idx} className="bg-white rounded p-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-600">{item.variantName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{item.currentStock}</p>
                    <p className="text-xs text-gray-500">units left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Notification Setup */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📧 Email Notification Setup</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-green-800">Email Alerts Enabled</p>
            </div>
            <p className="text-sm text-green-700 ml-7">
              Notifications will be sent to <strong>satyamchhetri629@gmail.com</strong> when stock drops below {threshold} units.
            </p>
          </div>
          <p className="text-xs text-gray-500">
            <strong>Note:</strong> Make sure to configure EMAIL_USER and EMAIL_PASSWORD in your backend .env file to receive email notifications.
          </p>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Product Inventory</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {inventory.map((product) => (
              <div key={product.id} className="p-6">
                <div className="flex justify-between items-center">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
                  >
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">
                      {product.variantCount} variants • Total Stock: {product.totalStock}
                      {product.lowStockCount > 0 && (
                        <span className="ml-2 text-red-600 font-semibold">
                          ({product.lowStockCount} low stock)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteModal({ show: true, productId: product.id, productName: product.name })}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-semibold flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform cursor-pointer ${selectedProduct?.id === product.id ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {selectedProduct?.id === product.id && (
                  <div className="mt-4 space-y-3">
                    {product.variants.map((variant) => (
                      <div 
                        key={variant.id} 
                        className={`flex items-center justify-between p-4 rounded border ${
                          variant.isLowStock ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{variant.name}</p>
                          <p className="text-sm text-gray-600">
                            {variant.color && `${variant.color} • `}
                            {variant.storage && `${variant.storage}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${variant.isLowStock ? 'text-red-600' : 'text-teal-600'}`}>
                              {variant.stock}
                            </p>
                            <p className="text-xs text-gray-500">units</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              placeholder={variant.stock.toString()}
                              value={updateStock[`${product.id}-${variant.id}`] || ''}
                              onChange={(e) => setUpdateStock({
                                ...updateStock,
                                [`${product.id}-${variant.id}`]: parseInt(e.target.value) || 0
                              })}
                              className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <button
                              onClick={() => handleUpdateStock(
                                product.id,
                                variant.id,
                                updateStock[`${product.id}-${variant.id}`] || variant.stock
                              )}
                              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors text-sm font-semibold"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            {/* Orders Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg shadow-sm border border-yellow-200">
                <p className="text-sm text-yellow-600 mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
              </div>
              <div className="bg-teal-50 p-6 rounded-lg shadow-sm border border-teal-200">
                <p className="text-sm text-teal-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-teal-600">
                  ₹{orders.reduce((sum, o) => sum + (o.variant_price || 0), 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">All Orders</h2>
              </div>
              {orders.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium">No orders yet</p>
                  <p className="text-gray-400 text-sm mt-1">Orders will appear here once customers place them</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Variant</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">EMI</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expected Delivery</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-mono text-gray-600">#{order.id.slice(0, 8)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-900">{order.product_name}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900">
                              {order.variant_color && <span>{order.variant_color}</span>}
                              {order.variant_color && order.variant_storage && <span> • </span>}
                              {order.variant_storage && <span>{order.variant_storage}</span>}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-bold text-gray-900">₹{order.variant_price.toLocaleString('en-IN')}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-900">{order.emi_tenure} months</p>
                            <p className="text-xs text-gray-500">₹{order.monthly_payment.toLocaleString('en-IN')}/mo</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-900">{formatDate(order.created_at)}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-semibold text-teal-600">{formatDate(order.expected_delivery_date)}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
                <p className="text-sm text-gray-600 mb-1">
                  Are you sure you want to delete <strong>{deleteModal.productName}</strong>?
                </p>
                <p className="text-sm text-red-600 font-semibold">
                  This action cannot be undone. All variants and data will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, productId: '', productName: '' })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteModal.productId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
