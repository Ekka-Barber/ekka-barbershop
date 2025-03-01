
import { useState } from 'react';
import { Calendar, Search, Filter, Download } from 'lucide-react';
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

export const BookingManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('upcoming');

  // Mock data - in a real app this would come from your backend
  const bookings = [
    {
      id: '1',
      customer: 'Ahmed Hassan',
      phone: '+966 50 123 4567',
      date: '2023-11-15',
      time: '14:30',
      services: ['Haircut', 'Beard Trim'],
      status: 'confirmed',
      barber: 'Mohammed'
    },
    {
      id: '2',
      customer: 'Khalid Al-Saud',
      phone: '+966 55 987 6543',
      date: '2023-11-16',
      time: '10:00',
      services: ['Haircut'],
      status: 'pending',
      barber: 'Ali'
    },
    {
      id: '3',
      customer: 'Omar Abdullah',
      phone: '+966 54 456 7890',
      date: '2023-11-14',
      time: '16:00',
      services: ['Full Grooming', 'Facial'],
      status: 'completed',
      barber: 'Ibrahim'
    },
  ];

  // Filter bookings based on search term and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    // Simple date filtering logic (would be more sophisticated in a real app)
    const matchesDate = dateRange === 'all' || 
      (dateRange === 'upcoming' && new Date(booking.date) >= new Date()) ||
      (dateRange === 'past' && new Date(booking.date) < new Date());
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Booking Management</h2>
          <p className="text-muted-foreground">View and manage customer bookings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Calendar View
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
            placeholder="Search by name or phone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">No bookings found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{booking.customer}</h3>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{booking.phone}</p>
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="font-medium">Date: </span>
                        {new Date(booking.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Time: </span>
                        {booking.time}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Barber: </span>
                        {booking.barber}
                      </div>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {booking.services.map((service, idx) => (
                        <span key={idx} className="rounded-full bg-primary/10 px-2 py-1 text-xs">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 border-t p-4 md:border-l md:border-t-0">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button size="sm">Details</Button>
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
