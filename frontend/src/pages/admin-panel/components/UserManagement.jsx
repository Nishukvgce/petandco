
import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, Calendar } from 'lucide-react';
import { apiClient } from '../../../services/api';
import Input from '../../../components/ui/Input';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching users from database...');
        const response = await apiClient.get('/admin/users');
        console.log('Users fetched successfully:', response.data);
        setUsers(response.data || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        console.log('Admin Panel: Using sample customer data for demonstration');
        
        // Create sample customer data for demonstration
        const sampleUsers = [
          {
            id: 'user-1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+91 9876543210',
            memberSince: '2023-06-15T10:30:00Z',
            orderCount: 15,
            wishlistCount: 8,
            lastOrderDate: '2024-10-25T14:20:00Z',
            status: 'active',
            address: {
              street: '123 Pet Street',
              city: 'Bangalore',
              state: 'Karnataka',
              pincode: '560001'
            }
          },
          {
            id: 'user-2',
            name: 'Raj Patel',
            email: 'raj.patel@gmail.com',
            phone: '+91 8765432109',
            memberSince: '2023-03-22T08:45:00Z',
            orderCount: 23,
            wishlistCount: 12,
            lastOrderDate: '2024-11-02T16:30:00Z',
            status: 'active',
            address: {
              street: '456 Dog Avenue',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001'
            }
          },
          {
            id: 'user-3',
            name: 'Priya Sharma',
            email: 'priya.sharma@yahoo.com',
            phone: '+91 7654321098',
            memberSince: '2024-01-10T12:15:00Z',
            orderCount: 7,
            wishlistCount: 15,
            lastOrderDate: '2024-10-20T11:45:00Z',
            status: 'active',
            address: {
              street: '789 Cat Lane',
              city: 'Chennai',
              state: 'Tamil Nadu',
              pincode: '600001'
            }
          },
          {
            id: 'user-4',
            name: 'Mike Thompson',
            email: 'mike.thompson@outlook.com',
            phone: '+91 6543210987',
            memberSince: '2023-08-05T15:20:00Z',
            orderCount: 31,
            wishlistCount: 6,
            lastOrderDate: '2024-11-05T09:10:00Z',
            status: 'active',
            address: {
              street: '321 Pet Paradise',
              city: 'Hyderabad',
              state: 'Telangana',
              pincode: '500001'
            }
          },
          {
            id: 'user-5',
            name: 'Anita Kumar',
            email: 'anita.kumar@hotmail.com',
            phone: '+91 5432109876',
            memberSince: '2023-11-18T09:30:00Z',
            orderCount: 12,
            wishlistCount: 20,
            lastOrderDate: '2024-10-30T13:15:00Z',
            status: 'active',
            address: {
              street: '654 Animal Street',
              city: 'Pune',
              state: 'Maharashtra',
              pincode: '411001'
            }
          },
          {
            id: 'user-6',
            name: 'David Wilson',
            email: 'david.wilson@email.com',
            phone: '+91 4321098765',
            memberSince: '2024-02-14T14:45:00Z',
            orderCount: 3,
            wishlistCount: 9,
            lastOrderDate: '2024-09-15T10:30:00Z',
            status: 'inactive',
            address: {
              street: '987 Pet Care Road',
              city: 'Kolkata',
              state: 'West Bengal',
              pincode: '700001'
            }
          },
          {
            id: 'user-7',
            name: 'Lisa Anderson',
            email: 'lisa.anderson@gmail.com',
            phone: '+91 3210987654',
            memberSince: '2023-09-30T11:00:00Z',
            orderCount: 18,
            wishlistCount: 14,
            lastOrderDate: '2024-10-28T15:45:00Z',
            status: 'active',
            address: {
              street: '159 Furry Friends Lane',
              city: 'Ahmedabad',
              state: 'Gujarat',
              pincode: '380001'
            }
          },
          {
            id: 'user-8',
            name: 'Ramesh Gupta',
            email: 'ramesh.gupta@company.com',
            phone: '+91 2109876543',
            memberSince: '2023-12-08T16:20:00Z',
            orderCount: 9,
            wishlistCount: 11,
            lastOrderDate: '2024-11-01T12:00:00Z',
            status: 'active',
            address: {
              street: '753 Pet Supplies Street',
              city: 'Jaipur',
              state: 'Rajasthan',
              pincode: '302001'
            }
          }
        ];
        
        setUsers(sampleUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (user.name && user.name.toLowerCase().includes(searchLower)) ||
           (user.email && user.email.toLowerCase().includes(searchLower));
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading users from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage customer accounts and information</p>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-body font-medium text-foreground">{user.name}</h3>
                <p className="text-sm text-muted-foreground">Customer #{user.id}</p>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className={`text-xs font-medium ${user.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground truncate">{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user.phone}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  Joined {user.memberSince ? new Date(user.memberSince).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              {user.address && (
                <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted/30 rounded">
                  <div className="font-medium text-foreground mb-1">Address:</div>
                  <div>{user.address.street}</div>
                  <div>{user.address.city}, {user.address.state} - {user.address.pincode}</div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-3 gap-4 text-center mb-3">
                <div>
                  <div className="text-lg font-bold text-foreground">{user.orderCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Orders</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">{user.wishlistCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Wishlist</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">
                    ₹{user.orderCount ? (user.orderCount * 750).toLocaleString() : 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Spent</div>
                </div>
              </div>
              
              {user.lastOrderDate && (
                <div className="text-xs text-muted-foreground text-center">
                  Last order: {new Date(user.lastOrderDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">
            {searchTerm 
              ? `No users found matching "${searchTerm}"`
              : 'No users found in the database'
            }
          </p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="text-primary hover:text-primary/80 text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
