import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import serviceBookingApi from '../../../services/serviceBookingApi';

const ServiceBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [stats, setStats] = useState(null);

  const statusOptions = [
    { value: 'ALL', label: 'All Bookings' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200'
  };

  useEffect(() => {
    loadBookings();
    loadStats();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await serviceBookingApi.getAllBookings();
      if (response.success) {
        setBookings(response.bookings);
      }
    } catch (err) {
      setError('Failed to load bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await serviceBookingApi.getBookingStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings].filter(booking => booking != null); // Remove null bookings

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(booking => (booking.status || 'PENDING') === statusFilter);
    }

    // Filter by search term (defensive: ensure searchTerm is a string)
    const safeSearchTerm = typeof searchTerm === 'string' ? searchTerm : '';
    if (safeSearchTerm.trim()) {
      const term = safeSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(booking =>
        (booking.ownerName || '').toLowerCase().includes(term) ||
        (booking.petName || '').toLowerCase().includes(term) ||
        (booking.phone || '').includes(term) ||
        (booking.serviceName || '').toLowerCase().includes(term)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleStatusUpdate = async (bookingId, newStatus, notes = '') => {
    try {
      const response = await serviceBookingApi.updateBookingStatus(bookingId, newStatus, notes);
      if (response.success) {
        setBookings(bookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: newStatus, notes }
            : booking
        ));
        loadStats(); // Refresh stats
        
        // Show appropriate success message
        if (newStatus === 'CONFIRMED') {
          alert('Booking confirmed successfully! 📧 Confirmation email sent to customer.');
        } else {
          alert('Booking status updated successfully!');
        }
      }
    } catch (err) {
      alert('Failed to update booking status: ' + err.message);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const response = await serviceBookingApi.deleteBooking(bookingId);
      if (response.success) {
        setBookings(bookings.filter(booking => booking.id !== bookingId));
        loadStats(); // Refresh stats
        alert('Booking deleted successfully!');
      }
    } catch (err) {
      alert('Failed to delete booking: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading bookings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-foreground">Service Booking Management</h1>
        <Button
          onClick={loadBookings}
          iconName="RefreshCw"
          iconPosition="left"
          variant="outline"
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-muted-foreground">Cancelled</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Search Bookings"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by owner name, pet name, phone, or service..."
          />
          <Select
            label="Filter by Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Booking Details</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Service</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Appointment</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {bookings.length === 0 ? 'No bookings found' : 'No bookings match your filters'}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  // Add null safety checks
                  if (!booking) return null;
                  
                  return (
                  <tr key={booking.id} className="hover:bg-muted/20">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-foreground">{booking.ownerName || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{booking.phone || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          Pet: {booking.petName || 'N/A'} ({booking.petType || 'N/A'})
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Booked: {booking.createdAt ? formatDateTime(booking.createdAt) : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-foreground">{booking.serviceName || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">₹{booking.totalAmount || 0}</div>
                        {booking.addOns && Object.keys(booking.addOns).length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            +{Object.keys(booking.addOns).length} add-ons
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-foreground">{booking.preferredDate ? formatDate(booking.preferredDate) : 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{booking.preferredTime || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status] || statusColors.PENDING}`}>
                        {booking.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowBookingModal(true);
                          }}
                          iconName="Eye"
                        >
                          View
                        </Button>
                        <Select
                          value={booking.status || 'PENDING'}
                          onChange={(newStatus) => handleStatusUpdate(booking.id, newStatus)}
                          options={statusOptions.filter(opt => opt.value !== 'ALL')}
                          className="text-xs"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteBooking(booking.id)}
                          iconName="Trash2"
                          className="text-red-600 hover:text-red-700"
                        />
                      </div>
                    </td>
                  </tr>
                  );
                }).filter(Boolean)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBooking(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

// Booking Detail Modal Component
const BookingDetailModal = ({ booking, onClose, onStatusUpdate }) => {
  // Add null safety for booking object
  if (!booking) {
    return null;
  }

  const [notes, setNotes] = useState(booking.notes || '');
  const [newStatus, setNewStatus] = useState(booking.status || 'PENDING');

  const handleUpdateStatus = () => {
    if (newStatus !== (booking.status || 'PENDING')) {
      onStatusUpdate(booking.id, newStatus, notes);
      onClose();
    }
  };

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-foreground">
              Booking Details #{booking.id || 'Unknown'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Pet & Owner Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Pet Information</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {booking.petName || 'N/A'}</div>
                <div><span className="font-medium">Type:</span> {booking.petType || 'N/A'}</div>
                {booking.petBreed && <div><span className="font-medium">Breed:</span> {booking.petBreed}</div>}
                {booking.petAge && <div><span className="font-medium">Age:</span> {booking.petAge}</div>}
                {booking.petGender && <div><span className="font-medium">Gender:</span> {booking.petGender}</div>}
                {booking.petDateOfBirth && <div><span className="font-medium">Date of Birth:</span> {booking.petDateOfBirth}</div>}
                {/* Pet Image if available in any field */}
                {(() => {
                  // 1. petPhotoBase64 (direct base64 string)
                  if (booking.petPhotoBase64) {
                    return (
                      <div className="mt-2">
                        <span className="font-medium block mb-1">Pet Image:</span>
                        <img
                          src={booking.petPhotoBase64}
                          alt="Pet"
                          className="w-32 h-32 object-cover rounded border"
                          onError={e => { e.target.onerror = null; e.target.src = '/assets/images/no_image.png'; }}
                        />
                      </div>
                    );
                  }
                  // 2. addOns.petPhoto.data (base64 string)
                  if (booking.addOns && booking.addOns.petPhoto && booking.addOns.petPhoto.data) {
                    return (
                      <div className="mt-2">
                        <span className="font-medium block mb-1">Pet Image:</span>
                        <img
                          src={booking.addOns.petPhoto.data}
                          alt="Pet"
                          className="w-32 h-32 object-cover rounded border"
                          onError={e => { e.target.onerror = null; e.target.src = '/assets/images/no_image.png'; }}
                        />
                      </div>
                    );
                  }
                  // 3. addOns.petPhoto (base64 string, no .data)
                  if (booking.addOns && booking.addOns.petPhoto && typeof booking.addOns.petPhoto === 'string') {
                    return (
                      <div className="mt-2">
                        <span className="font-medium block mb-1">Pet Image:</span>
                        <img
                          src={booking.addOns.petPhoto}
                          alt="Pet"
                          className="w-32 h-32 object-cover rounded border"
                          onError={e => { e.target.onerror = null; e.target.src = '/assets/images/no_image.png'; }}
                        />
                      </div>
                    );
                  }
                  // 4. petPhotoPath (relative path to uploads)
                  if (booking.petPhotoPath) {
                    let url = booking.petPhotoPath;
                    if (!/^https?:\/\//i.test(url)) {
                      const backend = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
                      const base = backend.replace(/\/api$/, '');
                      url = `${base}/${url.replace(/^pet-photos[\\/]/, 'uploads/pet-photos/')}`;
                    }
                    return (
                      <div className="mt-2">
                        <span className="font-medium block mb-1">Pet Image:</span>
                        <img
                          src={url}
                          alt="Pet"
                          className="w-32 h-32 object-cover rounded border"
                          onError={e => { e.target.onerror = null; e.target.src = '/assets/images/no_image.png'; }}
                        />
                      </div>
                    );
                  }
                  // 5. petPhoto (base64 string at root)
                  if (booking.petPhoto) {
                    return (
                      <div className="mt-2">
                        <span className="font-medium block mb-1">Pet Image:</span>
                        <img
                          src={booking.petPhoto}
                          alt="Pet"
                          className="w-32 h-32 object-cover rounded border"
                          onError={e => { e.target.onerror = null; e.target.src = '/assets/images/no_image.png'; }}
                        />
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Owner Information</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {booking.ownerName || 'N/A'}</div>
                <div><span className="font-medium">Phone:</span> {booking.phone || 'N/A'}</div>
                {booking.email && <div><span className="font-medium">Email:</span> {booking.email}</div>}
                <div><span className="font-medium">Address:</span> {booking.address || 'N/A'}</div>
                {/* Detailed address fields if available */}
                {booking.houseNumber && <div><span className="font-medium">House No.:</span> {booking.houseNumber}</div>}
                {booking.building && <div><span className="font-medium">Building:</span> {booking.building}</div>}
                {booking.floor && <div><span className="font-medium">Floor:</span> {booking.floor}</div>}
                {booking.area && <div><span className="font-medium">Area:</span> {booking.area}</div>}
                {booking.cityStateCountry && <div><span className="font-medium">City/State/Country:</span> {booking.cityStateCountry}</div>}
                {booking.landmark && <div><span className="font-medium">Landmark:</span> {booking.landmark}</div>}
                {booking.recipientName && <div><span className="font-medium">Recipient Name:</span> {booking.recipientName}</div>}
                {booking.recipientContactNumber && <div><span className="font-medium">Recipient Contact:</span> {booking.recipientContactNumber}</div>}
                {(booking.gpsLatitude || booking.gpsLongitude) && (
                  <div><span className="font-medium">GPS:</span> {booking.gpsLatitude || 'N/A'}, {booking.gpsLongitude || 'N/A'}</div>
                )}
              </div>
            </div>
                    {/* Preferences/Boarding/Walking Details */}
                    {(booking.addOns?.boardingExtras || booking.preferences || booking.addOns?.preferences) && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-foreground">Preferences & Special Requirements</h3>
                        <div className="space-y-2 text-sm">
                          {/* Boarding/Walking Preferences */}
                          {(() => {
                            const prefs = booking.addOns?.boardingExtras || booking.preferences || booking.addOns?.preferences || {};
                            if (!prefs) return null;
                            return <>
                              {prefs.walksPerDay && <div><span className="font-medium">Walks per day:</span> {prefs.walksPerDay}</div>}
                              {prefs.pickupDropRequired !== undefined && <div><span className="font-medium">Pickup/Drop Required:</span> {prefs.pickupDropRequired ? 'Yes' : 'No'}</div>}
                              {prefs.foodProvidedByOwner !== undefined && <div><span className="font-medium">Food Provided by Owner:</span> {prefs.foodProvidedByOwner ? 'Yes' : 'No'}</div>}
                              {prefs.litterProvidedByOwner !== undefined && <div><span className="font-medium">Litter Provided by Owner:</span> {prefs.litterProvidedByOwner ? 'Yes' : 'No'}</div>}
                              {prefs.emergencyContact && <div><span className="font-medium">Emergency Contact:</span> {prefs.emergencyContact}</div>}
                              {prefs.vaccinationUpToDate !== undefined && <div><span className="font-medium">Vaccinations Up-to-date:</span> {prefs.vaccinationUpToDate ? 'Yes' : 'No'}</div>}
                              {prefs.temperament && <div><span className="font-medium">Temperament:</span> {prefs.temperament}</div>}
                              {prefs.checkoutDate && <div><span className="font-medium">Checkout Date:</span> {prefs.checkoutDate}</div>}
                              {prefs.checkoutTime && <div><span className="font-medium">Checkout Time:</span> {prefs.checkoutTime}</div>}
                            </>;
                          })()}
                        </div>
                      </div>
                    )}
          </div>

          {/* Service Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Service Information</h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Service:</span>
                <span>{booking.serviceName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Base Price:</span>
                <span>₹{booking.basePrice || 0}</span>
              </div>
              {/* Show add-ons as checklist if present, including pet-walking rules */}
              {(booking.serviceType && booking.serviceType.toLowerCase().includes('groom')) && booking.addOns && (() => {
                // Only show add-ons for pet grooming services
                // If selectedAddOns exists, use it for checklist
                const selected = booking.addOns.selectedAddOns;
                if (selected && typeof selected === 'object' && Object.keys(selected).length > 0) {
                  return (
                    <div className="space-y-1">
                      <span className="font-medium">Add-ons:</span>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {Object.values(selected).map((addon, idx) => (
                          <label key={idx} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={true} readOnly className="accent-orange-600" />
                            <span>{addon?.name || 'Unknown Add-on'}</span>
                            {addon?.price > 0 && <span className="ml-auto text-xs text-muted-foreground">+₹{addon.price}</span>}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }
                // Fallback: show as before if addOns is a flat object
                const addOnList = Object.keys(booking.addOns).length > 0 ? Object.values(booking.addOns) : [];
                if (addOnList.length === 0) return null;
                return (
                  <div className="space-y-1">
                    <span className="font-medium">Add-ons:</span>
                    {addOnList.map((addon, index) => (
                      <div key={index} className="flex justify-between text-sm ml-4">
                        <span>• {addon?.name || 'Unknown Add-on'}</span>
                        <span>₹{addon?.price || 0}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Amount:</span>
                <span>₹{booking.totalAmount || 0}</span>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Appointment Details</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Date:</span> {booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString('en-IN') : 'N/A'}</div>
              <div><span className="font-medium">Time:</span> {booking.preferredTime || 'N/A'}</div>
              {booking.specialInstructions && (
                <div><span className="font-medium">Special Instructions:</span> {booking.specialInstructions}</div>
              )}
            </div>
          </div>

          {/* Status Update */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Status Management</h3>
            <div className="space-y-3">
              <Select
                label="Update Status"
                value={newStatus}
                onChange={setNewStatus}
                options={statusOptions}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Admin Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this booking..."
                  className="w-full p-3 border border-border rounded-lg resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {newStatus !== (booking.status || 'PENDING') && (
              <Button onClick={handleUpdateStatus} className="flex-1">
                Update Status
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingManagement;