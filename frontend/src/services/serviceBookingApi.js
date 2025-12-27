const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const serviceBookingApi = {
  // Create a new service booking
  createBooking: async (bookingData) => {
    try {
      console.log('[DEBUG] ServiceBookingApi: Sending booking data:', {
        petName: bookingData.petName,
        serviceName: bookingData.serviceName,
        serviceType: bookingData.serviceType,
        ownerName: bookingData.ownerName,
        phone: bookingData.phone,
        address: bookingData.address,
        preferredDate: bookingData.preferredDate,
        preferredTime: bookingData.preferredTime
      });
      
      const response = await fetch(`${API_BASE_URL}/service-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      console.log('[DEBUG] ServiceBookingApi: Response status:', response.status);
      const data = await response.json();
      console.log('[DEBUG] ServiceBookingApi: Response data:', data);
      
      if (!response.ok) {
        console.error('[ERROR] ServiceBookingApi: Server error:', data.message || 'Unknown error');
        throw new Error(data.message || 'Failed to create booking');
      }

      console.log('[DEBUG] ServiceBookingApi: Booking created successfully:', data.booking?.id);
      return data;
    } catch (error) {
      console.error('[ERROR] ServiceBookingApi: Error creating booking:', error);
      throw error;
    }
  },

  // Get all bookings (Admin only)
  getAllBookings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bookings');
      }

      return data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Get booking by ID
  getBookingById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-bookings/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch booking');
      }

      return data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  },

  // Get bookings for user (via userId/email/phone)
  getBookingsForUser: async ({ userId, email, phone }) => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (email) params.append('email', email);
      if (phone) params.append('phone', phone);
      const response = await fetch(`${API_BASE_URL}/service-bookings/by-user?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch user bookings');
      return data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  // Get bookings for user filtered by type keyword
  getBookingsForUserByType: async ({ userId, email, phone, type }) => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (email) params.append('email', email);
      if (phone) params.append('phone', phone);
      if (type) params.append('type', type);
      const response = await fetch(`${API_BASE_URL}/service-bookings/by-user/type?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch user bookings by type');
      return data;
    } catch (error) {
      console.error('Error fetching user bookings by type:', error);
      throw error;
    }
  },

  // Update booking status (Admin only)
  updateBookingStatus: async (id, status, notes) => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update booking status');
      }

      return data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  // Get bookings by status
  getBookingsByStatus: async (status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-bookings/status/${status}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bookings');
      }

      return data;
    } catch (error) {
      console.error('Error fetching bookings by status:', error);
      throw error;
    }
  },

  // Get upcoming bookings
  getUpcomingBookings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-bookings/upcoming`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch upcoming bookings');
      }

      return data;
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      throw error;
    }
  },

  // Get bookings by date
  getBookingsByDate: async (date) => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-bookings/date/${date}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bookings');
      }

      return data;
    } catch (error) {
      console.error('Error fetching bookings by date:', error);
      throw error;
    }
  },

  // Search bookings
  searchBookings: async (searchTerm) => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-bookings/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search bookings');
      }

      return data;
    } catch (error) {
      console.error('Error searching bookings:', error);
      throw error;
    }
  },

  // Get booking statistics
  getBookingStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-bookings/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch booking statistics');
      }

      return data;
    } catch (error) {
      console.error('Error fetching booking statistics:', error);
      throw error;
    }
  },

  // Delete booking (Admin only)
  deleteBooking: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete booking');
      }

      return data;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }
};

export default serviceBookingApi;