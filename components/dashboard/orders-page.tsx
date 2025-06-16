'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Truck, 
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface Order {
  id: string;
  payment_intent_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: any;
  amount_cents: number;
  currency: string;
  status: string;
  tracking_number: string;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    name: string;
    price_cents: number;
    currency: string;
    image_urls: string[];
  };
  shops: {
    id: string;
    title: string;
    slug: string;
  };
}

interface OrdersSummary {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  paid_orders: number;
  shipped_orders: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<OrdersSummary>({
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0,
    paid_orders: 0,
    shipped_orders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        status: statusFilter,
      });

      const response = await fetch(`/api/orders/list?${params}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders);
        setSummary(data.summary);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Failed to fetch orders:', data.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      const response = await fetch(`/api/orders/${orderId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the order in state
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
            : order
        ));
        
        // Update selected order if it's the one being updated
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }

        // Refresh summary
        fetchOrders();
      } else {
        console.error('Failed to update order:', data.error);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage and track your sales</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_orders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatPrice(summary.total_revenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pending_orders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.paid_orders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.shipped_orders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {order.products.image_urls[0] && (
                        <img
                          src={order.products.image_urls[0]}
                          alt={order.products.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{order.products.name}</h3>
                        <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">${formatPrice(order.amount_cents)}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                      </div>
                      
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                      
                      {order.status === 'paid' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          disabled={updatingOrder === order.id}
                          size="sm"
                        >
                          Mark as Shipped
                        </Button>
                      )}
                      
                      {order.status === 'shipped' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          disabled={updatingOrder === order.id}
                          size="sm"
                        >
                          Mark as Delivered
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        variant="outline"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <span className="flex items-center px-4 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Order Details</h2>
                <Button onClick={() => setSelectedOrder(null)} variant="ghost" size="sm">
                  ×
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order ID</label>
                    <p className="font-mono text-sm">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-1 capitalize">{selectedOrder.status}</span>
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                    <p>{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Amount</label>
                    <p className="font-medium">${formatPrice(selectedOrder.amount_cents)} {selectedOrder.currency}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-medium mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.customer_email}</span>
                    </div>
                    {selectedOrder.customer_phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedOrder.customer_phone}</span>
                      </div>
                    )}
                    {selectedOrder.shipping_address && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p>{selectedOrder.shipping_address.line1}</p>
                          <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="font-medium mb-3">Product</h3>
                  <div className="flex items-center space-x-4">
                    {selectedOrder.products.image_urls[0] && (
                      <img
                        src={selectedOrder.products.image_urls[0]}
                        alt={selectedOrder.products.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">{selectedOrder.products.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${formatPrice(selectedOrder.products.price_cents)} {selectedOrder.products.currency}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}