import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import serviceBookingApi from '../../../services/serviceBookingApi';
import { useAuth } from '../../../contexts/AuthContext';
import AppImage from '../../../components/AppImage';
import BookingConfirmation from './BookingConfirmation';

const BookingForm = ({ service, onClose }) => {
  const { user } = useAuth(); // Get current user from auth context
  
  const [formData, setFormData] = useState({
    petName: '',
    petType: (service?.petType && typeof service.petType === 'string') ? service.petType : '',
    petBreed: '',
    petAge: '',
    ownerName: user?.name || '', // Pre-fill with user's name if logged in
    phone: user?.phone || '',    // Pre-fill with user's phone if available
    email: user?.email || '',    // Pre-fill with user's email if logged in
    address: '',
    preferredDate: '', // For grooming or check-in for boarding
    preferredTime: '', // For grooming or check-in time for boarding
    selectedPackage: (service?.name && typeof service.name === 'string') ? service.name : '',
    addOns: [],
    specialInstructions: '',
    // Boarding-specific
    walksPerDay: '2',
    pickupDropRequired: false,
    foodProvidedByOwner: true,
    litterProvidedByOwner: true,
    emergencyContact: '',
    vaccinationUpToDate: true,
    // Pet photo
    petPhotoBase64: '',
    petPhotoName: '',
    petPhotoType: '',
    // Boarding extras
    checkoutDate: '',
    checkoutTime: '',
    temperament: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  // Update form data when service prop changes
  useEffect(() => {
    if (service) {
      setFormData(prev => ({
        ...prev,
        petType: (service.petType && typeof service.petType === 'string') ? service.petType : prev.petType,
        selectedPackage: (service.name && typeof service.name === 'string') ? service.name : prev.selectedPackage
      }));
    }
  }, [service]);

  const timeSlots = [
    '7:00 AM','7:30 AM','8:00 AM','8:30 AM',
    '9:00 AM','9:30 AM','10:00 AM','10:30 AM',
    '11:00 AM','11:30 AM','12:00 PM','12:30 PM',
    '1:00 PM','1:30 PM','2:00 PM','2:30 PM',
    '3:00 PM','3:30 PM','4:00 PM','4:30 PM',
    '5:00 PM','5:30 PM','6:00 PM','6:30 PM',
    '7:00 PM','7:30 PM','8:00 PM','8:30 PM'
  ];

  const handleInputChange = (field, value) => {
    // Preserve booleans; stringify other values
    const finalValue = typeof value === 'boolean' ? value : (typeof value === 'string' ? value : String(value || ''));
    setFormData(prev => ({
      ...prev,
      [field]: finalValue
    }));
  };

  // Helpers for image upload
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } catch (e) { reject(e); }
  });
  const handlePhotoChange = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
      if (file.size > 3 * 1024 * 1024) { alert('Image must be under 3MB'); return; }
      const base64 = await fileToBase64(file);
      setFormData(prev => ({
        ...prev,
        petPhotoBase64: base64,
        petPhotoName: file.name,
        petPhotoType: file.type,
      }));
    } catch (err) {
      console.error('Photo upload error', err);
      alert('Could not read image file');
    }
  };

  const handleAddOnChange = (addon, isChecked) => {
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        addOns: [...prev.addOns, addon]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        addOns: prev.addOns.filter(item => item.name !== addon.name)
      }));
    }
  };

  const calculateTotal = () => {
    let total = service?.price || 0;
    formData.addOns.forEach(addon => {
      total += addon.price;
    });
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.petName || !formData.ownerName || !formData.phone || !formData.preferredDate || !formData.preferredTime) {
      alert('Please fill in all required fields: Pet Name, Your Name, Phone, Date, and Time');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Prepare booking data for API
      const bookingData = {
        userId: user?.id || null, // Include user ID if logged in
        petName: formData.petName,
        petType: formData.petType,
        petBreed: formData.petBreed || null,
        petAge: formData.petAge || null,
        ownerName: formData.ownerName,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address || "Address not provided",
        serviceName: service?.name || formData.selectedPackage,
        serviceType: service?.serviceType || `${formData.petType}-grooming`,
        basePrice: service?.price || 0,
        // Always send pet photo fields at root for all service types
        petPhotoBase64: formData.petPhotoBase64 || null,
        petPhotoName: formData.petPhotoName || null,
        petPhotoType: formData.petPhotoType || null,
        addOns: {
          selectedAddOns: formData.addOns.reduce((acc, addon) => {
            acc[addon.name] = {
              name: addon.name,
              price: addon.price
            };
            return acc;
          }, {}),
          // Keep petPhoto in addOns for backward compatibility, but root fields are primary
          petPhoto: formData.petPhotoBase64 ? {
            name: formData.petPhotoName,
            type: formData.petPhotoType,
            data: formData.petPhotoBase64
          } : null,
          boardingExtras: isBoarding ? {
            checkoutDate: formData.checkoutDate || null,
            checkoutTime: formData.checkoutTime || null,
            temperament: formData.temperament || null,
            walksPerDay: formData.walksPerDay,
            pickupDropRequired: !!formData.pickupDropRequired,
            foodProvidedByOwner: !!formData.foodProvidedByOwner,
            litterProvidedByOwner: !!formData.litterProvidedByOwner,
            emergencyContact: formData.emergencyContact || null,
            vaccinationUpToDate: !!formData.vaccinationUpToDate,
          } : null,
        },
        totalAmount: calculateTotal(),
        preferredDate: formData.preferredDate, // This should be in YYYY-MM-DD format
        preferredTime: formData.preferredTime,
        specialInstructions: formData.specialInstructions || null,
        // Boarding preferences
        preferences: {
          walksPerDay: formData.walksPerDay,
          pickupDropRequired: !!formData.pickupDropRequired,
          foodProvidedByOwner: !!formData.foodProvidedByOwner,
          litterProvidedByOwner: !!formData.litterProvidedByOwner,
          emergencyContact: formData.emergencyContact || null,
          vaccinationUpToDate: !!formData.vaccinationUpToDate,
        }
      };

      // Debug logging
      console.log('Form Data:', formData);
      console.log('Service Data:', service);
      console.log('Booking Data being sent:', bookingData);

      // Submit booking to backend
      const response = await serviceBookingApi.createBooking(bookingData);
      
      if (response.success) {
        setConfirmation({ booking: response.booking, type: isBoarding ? 'boarding' : 'grooming' });
      } else {
        throw new Error(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert(error.message || 'There was an error submitting your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];
  const isBoarding = !!(service?.serviceType && String(service.serviceType).includes('boarding'));
  const headerTitle = service?.serviceType
    ? `Book ${service.serviceType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`
    : 'Book Service';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        {!confirmation && (
        <div className="sticky top-0 bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-bold text-foreground">{headerTitle}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
          {service && (
            <div className="mt-3 p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{service.name}</span>
                {typeof service.price === 'number' && (
                  <span className="text-lg font-bold text-primary">₹{service.price}</span>
                )}
              </div>
              {service.duration && (
                <p className="text-sm text-muted-foreground">Duration: {service.duration}</p>
              )}
            </div>
          )}
        </div>
        )}

        {/* Confirmation or Form */}
        {confirmation ? (
          <BookingConfirmation type={confirmation.type} booking={confirmation.booking} onClose={onClose} />
        ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plan Summary when boarding */}
          {isBoarding && (
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Selected Plan</div>
                  <div className="text-lg font-semibold text-foreground">{formData.selectedPackage || service?.name}</div>
                  {service?.duration && (
                    <div className="text-xs text-muted-foreground">Duration: {service.duration}</div>
                  )}
                </div>
                <div className="text-2xl font-bold text-primary">₹{service?.price || 0}</div>
              </div>
            </div>
          )}
          {/* Pet Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-heading font-semibold text-foreground">Pet Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Pet Name *"
                value={formData.petName}
                onChange={(e) => handleInputChange('petName', e.target.value)}
                placeholder="Enter your pet's name"
                required
              />
              
              <Select
                label="Pet Type *"
                value={formData.petType}
                onChange={(value) => handleInputChange('petType', value)}
                options={[
                  { value: 'cat', label: 'Cat' },
                  { value: 'dog', label: 'Dog' }
                ]}
                required
              />
              
              <Input
                label="Pet Breed"
                value={formData.petBreed}
                onChange={(e) => handleInputChange('petBreed', e.target.value)}
                placeholder="e.g., Golden Retriever, Persian Cat"
              />
              
              <Input
                label="Pet Age"
                value={formData.petAge}
                onChange={(e) => handleInputChange('petAge', e.target.value)}
                placeholder="e.g., 2 years, 6 months"
              />
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Pet Photo</label>
                <div className="flex items-center gap-4">
                  <Input type="file" accept="image/*" onChange={handlePhotoChange} />
                  {formData.petPhotoBase64 && (
                    <AppImage src={formData.petPhotoBase64} alt="Pet preview" className="h-16 w-16 rounded object-cover border" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Upload your pet's current photo for host reference (max 3MB).</p>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-heading font-semibold text-foreground">Owner Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Your Name *"
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                placeholder="Enter your full name"
                required
              />
              
              <Input
                label="Phone Number *"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                type="tel"
                required
              />
              
              <Input
                label="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                type="email"
              />
            </div>
            
            <Input
              label="Address *"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter your full address"
              required
            />
          </div>

          {/* Appointment / Check-in Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-heading font-semibold text-foreground">
              {isBoarding ? 'Check-in Details' : 'Appointment Details'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={(isBoarding ? 'Check-in Date' : 'Preferred Date') + ' *'}
                value={formData.preferredDate}
                onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                type="date"
                min={minDateStr}
                required
              />
              <Select
                label={(isBoarding ? 'Check-in Time' : 'Preferred Time') + ' *'}
                value={formData.preferredTime}
                onChange={(value) => handleInputChange('preferredTime', value)}
                options={timeSlots.map(slot => ({ value: slot, label: slot }))}
                required
              />
            </div>
          </div>

          {/* Boarding Preferences */}
          {isBoarding && (
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">Boarding Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Walks per day"
                  value={formData.walksPerDay}
                  onChange={(value) => handleInputChange('walksPerDay', value)}
                  options={[
                    { value: '1', label: '1 walk' },
                    { value: '2', label: '2 walks' },
                    { value: '3', label: '3 walks' },
                  ]}
                />
                <Checkbox
                  checked={!!formData.pickupDropRequired}
                  onChange={(e) => handleInputChange('pickupDropRequired', e.target.checked)}
                  label="Pickup/Drop required"
                />
                <Checkbox
                  checked={!!formData.foodProvidedByOwner}
                  onChange={(e) => handleInputChange('foodProvidedByOwner', e.target.checked)}
                  label="Food provided by owner"
                />
                {String(formData.petType).toLowerCase() === 'cat' && (
                  <Checkbox
                    checked={!!formData.litterProvidedByOwner}
                    onChange={(e) => handleInputChange('litterProvidedByOwner', e.target.checked)}
                    label="Litter provided by owner"
                  />
                )}
                <Input
                  label="Emergency Contact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Name & phone of emergency contact"
                />
                <Checkbox
                  checked={!!formData.vaccinationUpToDate}
                  onChange={(e) => handleInputChange('vaccinationUpToDate', e.target.checked)}
                  label="Vaccinations up-to-date"
                />
                <Select
                  label="Temperament"
                  value={formData.temperament}
                  onChange={(value) => handleInputChange('temperament', value)}
                  options={[
                    { value: 'calm', label: 'Calm' },
                    { value: 'friendly', label: 'Friendly' },
                    { value: 'active', label: 'Active' },
                    { value: 'anxious', label: 'Anxious' },
                  ]}
                  description="Helps us match suitable hosts/walkers"
                />
              </div>
            </div>
          )}

          {/* Add-ons */}
          {service?.addOns && service.addOns.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">Add-on Services</h3>
              <div className="space-y-3">
                {service.addOns.map((addon, index) => (
                  <label key={index} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        onChange={(e) => handleAddOnChange(addon, e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-foreground">{addon.name}</span>
                    </div>
                    <span className="font-medium text-foreground">+₹{addon.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Special Instructions
            </label>
            <textarea
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              placeholder="Any special care instructions for your pet?"
              className="w-full p-3 border border-border rounded-lg resize-none"
              rows={3}
            />
          </div>

          {/* Total */}
          <div className="bg-primary/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">₹{calculateTotal()}</span>
            </div>
            {formData.addOns.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Base: ₹{service?.price} + Add-ons: ₹{formData.addOns.reduce((sum, addon) => sum + addon.price, 0)}
              </div>
            )}
            {isBoarding && (
              <div className="mt-2 text-xs text-muted-foreground">
                Note: Festive season rates may apply. Cat boarding excludes food and litter costs.
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
              iconName={isSubmitting ? "Loader2" : "Calendar"}
              iconPosition="left"
            >
              {isSubmitting ? 'Booking...' : 'Book Appointment'}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default BookingForm;