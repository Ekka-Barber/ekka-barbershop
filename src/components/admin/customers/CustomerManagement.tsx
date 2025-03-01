
import { useState } from 'react';
import { Users, Search, Filter, Download, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

export const CustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');

  // Mock data - in a real app this would come from your backend
  const customers = [
    {
      id: '1',
      name: 'Ahmed Hassan',
      phone: '+966 50 123 4567',
      email: 'ahmed@example.com',
      visitCount: 12,
      lastVisit: '2023-10-15',
      status: 'active',
    },
    {
      id: '2',
      name: 'Khalid Al-Saud',
      phone: '+966 55 987 6543',
      email: 'khalid@example.com',
      visitCount: 5,
      lastVisit: '2023-11-02',
      status: 'active',
    },
    {
      id: '3',
      name: 'Omar Abdullah',
      phone: '+966 54 456 7890',
      email: 'omar@example.com',
      visitCount: 8,
      lastVisit: '2023-09-20',
      status: 'inactive',
    },
  ];

  // Filter customers based on search term and filters
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = customerFilter === 'all' || customer.status === customerFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Customer Management</h2>
          <p className="text-muted-foreground">View and manage your customer database</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">No customers found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{customer.name}</h3>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                      <p>{customer.phone}</p>
                      <p>{customer.email}</p>
                    </div>
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="font-medium">Visits: </span>
                        {customer.visitCount}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Last visit: </span>
                        {new Date(customer.lastVisit).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 border-t p-4 md:border-l md:border-t-0">
                    <Button variant="outline" size="sm">Bookings</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button size="sm">View Profile</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
