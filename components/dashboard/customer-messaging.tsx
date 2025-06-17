'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Search,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  User,
  ArrowLeft
} from 'lucide-react';

interface Message {
  id: string;
  customer_email: string;
  customer_name: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
  order_id?: string;
}

interface CustomerMessagingProps {
  shopId?: string;
}

export default function CustomerMessaging({ shopId }: CustomerMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [filter, setFilter] = useState('all');

  // Mock data for demo purposes
  useEffect(() => {
    // Simulate loading messages
    setTimeout(() => {
      setMessages([
        {
          id: '1',
          customer_email: 'john@example.com',
          customer_name: 'John Smith',
          subject: 'Question about shipping',
          message: 'Hi! I just placed an order and wanted to know the estimated delivery time. Thanks!',
          status: 'unread',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          order_id: 'order_123'
        },
        {
          id: '2',
          customer_email: 'sarah@example.com',
          customer_name: 'Sarah Johnson',
          subject: 'Product customization',
          message: 'Hello, I was wondering if you offer any customization options for your product? I would love to have it personalized.',
          status: 'read',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          customer_email: 'mike@example.com',
          customer_name: 'Mike Wilson',
          subject: 'Great product!',
          message: 'Just wanted to say thanks for the amazing product. Quality is excellent and shipping was fast!',
          status: 'replied',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          order_id: 'order_456'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const markAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, status: 'read' } : msg
    ));
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setSendingReply(true);
    
    // Simulate sending reply
    setTimeout(() => {
      setMessages(messages.map(msg => 
        msg.id === selectedMessage.id ? { ...msg, status: 'replied' } : msg
      ));
      setReplyText('');
      setSendingReply(false);
      setSelectedMessage({ ...selectedMessage, status: 'replied' });
    }, 1000);
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    return msg.status === filter;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <MessageCircle className="h-4 w-4 text-blue-600" />;
      case 'read': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'replied': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedMessage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedMessage(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedMessage.subject}</h1>
            <p className="text-muted-foreground">
              From {selectedMessage.customer_name} • {formatDate(selectedMessage.created_at)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Message Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedMessage.customer_name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedMessage.customer_email}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(selectedMessage.status)}>
                    {getStatusIcon(selectedMessage.status)}
                    <span className="ml-1 capitalize">{selectedMessage.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedMessage.message}
                </div>
              </CardContent>
            </Card>

            {/* Reply Form */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Send Reply</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  disabled={selectedMessage.status === 'replied'}
                />
                
                {selectedMessage.status !== 'replied' ? (
                  <div className="flex justify-end">
                    <Button 
                      onClick={sendReply} 
                      disabled={sendingReply || !replyText.trim()}
                    >
                      {sendingReply ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ You have already replied to this message
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedMessage.customer_email}</span>
                </div>
                
                {selectedMessage.order_id && (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-blue-600 rounded-sm flex items-center justify-center">
                      <span className="text-xs text-white font-mono">#</span>
                    </div>
                    <span className="text-sm">Order: {selectedMessage.order_id}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Customer
                </Button>
                
                {selectedMessage.order_id && (
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    View Order Details
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Messages</h1>
        <p className="text-muted-foreground">Manage customer inquiries and support requests</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {messages.filter(m => m.status === 'unread').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reply</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {messages.filter(m => m.status === 'read').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replied</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {messages.filter(m => m.status === 'replied').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'unread', 'read', 'replied'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All Messages' : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p>Customer messages will appear here when you receive them</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (message.status === 'unread') {
                      markAsRead(message.id);
                    }
                  }}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {message.customer_name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {message.customer_email}
                          </p>
                        </div>
                      </div>
                      
                      <h4 className={`font-medium mb-1 ${message.status === 'unread' ? 'text-blue-900' : ''}`}>
                        {message.subject}
                      </h4>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.message}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <Badge className={getStatusColor(message.status)}>
                        {getStatusIcon(message.status)}
                        <span className="ml-1 capitalize">{message.status}</span>
                      </Badge>
                      
                      <span className="text-xs text-muted-foreground">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-blue-900">Demo Mode</h4>
              <p className="text-sm text-blue-800">
                This is a simulated customer messaging system for portfolio demonstration. 
                In production, this would integrate with email services and provide real customer support features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}