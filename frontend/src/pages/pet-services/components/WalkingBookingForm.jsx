import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import serviceBookingApi from '../../../services/serviceBookingApi';
import { useAuth } from '../../../contexts/AuthContext';
import AppImage from '../../../components/AppImage';
import BookingConfirmation from './BookingConfirmation';

/**
 * WalkingBookingForm
 * Multi-step booking form specifically for Pet Walking.
 * Steps:
 * 1) Walk Plan & Rules
 * 2) Pet Information
 * 3) Complete Address (with GPS)
 */
const WalkingBookingForm = ({ service, options = [], onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  // Build a duration->price map from options
  const priceMap = useMemo(() => {
    const map = {};
    options?.forEach((opt) => {
      const dur = String(opt?.duration || '').toLowerCase();
      if (dur) map[dur] = Number(opt?.price || 0);
    });
    return map;
  }, [options]);

  const defaultDuration = useMemo(() => (service?.duration ? String(service.duration).toLowerCase() : '30 minutes'), [service]);
  const initialPrice = (priceMap[defaultDuration] ?? Number(service?.price || 0)) || priceMap['30 minutes'] || 199;

  const [form, setForm] = useState({
    // Step 1: Plan & Rules
    duration: defaultDuration, // '30 minutes' | '45 minutes' | '60 minutes'
    date: '',
    timeSlot: '',
    rules: {
      onLeash: true,
      avoidOtherDogs: false,
      pickUpPoop: true,
      carryWater: true,
      harnessRequired: false,
      treatsAllowed: false,
    },

    // Step 2: Pet Info
    petName: '',
    petType: 'dog',
    petBreed: '',
    petDob: '',
    petGender: 'male',
    petPhotoBase64: '',
    petPhotoName: '',
    petPhotoType: '',

    // Step 3: Address + GPS
    addressType: 'home',
    area: '',
    cityStateCountry: '',
    houseNumber: '',
    building: '',
    floor: '',
    landmark: '',
    recipientName: user?.name || '',
    contactNumber: user?.phone || '',
    gps: { lat: null, lng: null },

    // Notes
    specialInstructions: '',
  });

  // Update price when duration changes
  const price = useMemo(() => priceMap[form.duration] ?? initialPrice, [priceMap, form.duration, initialPrice]);

  const timeSlots = [
    '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
  ];

  // Min date: tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const setField = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const setRule = (key, value) => setForm((p) => ({ ...p, rules: { ...p.rules, [key]: value } }));

  const stepForward = () => setStep((s) => Math.min(3, s + 1));
  const stepBack = () => setStep((s) => Math.max(1, s - 1));

  // GPS + reverse geocoding via OSM Nominatim
  const fetchCurrentAddress = async () => {
    try {
      if (!navigator?.geolocation) throw new Error('Geolocation not supported');
      const coords = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
      const { latitude, longitude } = coords;
      setForm((p) => ({ ...p, gps: { lat: latitude, lng: longitude } }));

      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      const disp = data?.display_name || '';
      const suburb = data?.address?.suburb || data?.address?.neighbourhood || data?.address?.quarter || '';
      const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.state_district || '';
      const state = data?.address?.state || '';
      const country = data?.address?.country || '';

      setForm((p) => ({
        ...p,
        area: suburb || disp,
        cityStateCountry: [city, state, country].filter(Boolean).join(', '),
      }));
    } catch (err) {
      alert('Unable to fetch current location. Please allow location access or fill address manually.');
      console.error(err);
    }
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
      setForm((p) => ({
        ...p,
        petPhotoBase64: base64,
        petPhotoName: file.name,
        petPhotoType: file.type,
      }));
    } catch (err) {
      console.error('Photo upload error', err);
      alert('Could not read image file');
    }
  };

  const stepHeader = (
    <div className="sticky top-0 bg-card border-b border-border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-foreground">Book Pet Walking</h2>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full"><Icon name="X" size={20} /></button>
      </div>
      {/* Step indicator */}
      <div className="mt-3 flex items-center gap-2">
        {[1,2,3].map((s) => (
          <span key={s} className={`h-2 w-8 rounded-full ${step===s?'bg-primary':'bg-muted'}`}></span>
        ))}
      </div>
      {service && (
        <div className="mt-3 p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">{service?.name || 'Pet Walking'}</span>
            <span className="text-lg font-bold text-primary">₹{price}</span>
          </div>
          <p className="text-sm text-muted-foreground">Duration: {form.duration}</p>
        </div>
      )}
    </div>
  );

  const computeAgeFromDob = (dobStr) => {
    try {
      if (!dobStr) return '';
      const dob = new Date(dobStr);
      const now = new Date();
      let years = now.getFullYear() - dob.getFullYear();
      let months = now.getMonth() - dob.getMonth();
      if (months < 0) { years -= 1; months += 12; }
      return `${years}y ${months}m`;
    } catch { return ''; }
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    
    // Enhanced validation for all required fields
    if (!form.petName || !form.petName.trim()) {
      alert('Pet name is required');
      return;
    }
    
    if (!form.date) {
      alert('Preferred date is required');
      return;
    }
    
    if (!form.timeSlot) {
      alert('Time slot is required');
      return;
    }
    
    const ownerName = form.recipientName || user?.name;
    if (!ownerName || !ownerName.trim()) {
      alert('Owner/Recipient name is required');
      return;
    }
    
    const phoneNumber = form.contactNumber || user?.phone;
    if (!phoneNumber || !phoneNumber.trim()) {
      alert('Phone number is required');
      return;
    }
    
    // Validate address components
    if (!form.area || !form.area.trim()) {
      alert('Area is required for pet walking service');
      return;
    }
    
    if (!form.cityStateCountry || !form.cityStateCountry.trim()) {
      alert('City/State/Country is required');
      return;
    }
    
    console.log('[DEBUG] All validations passed, submitting walking booking...');
    setIsSubmitting(true);
    try {
      const addressLine = [
        form.houseNumber,
        form.building,
        form.floor && `Floor ${form.floor}`,
        form.area,
        form.landmark && `Landmark: ${form.landmark}`,
        form.cityStateCountry
      ].filter(Boolean).join(', ');

      const bookingData = {
        // Required fields for backend DTO
        petName: form.petName.trim(),
        petType: form.petType,
        petBreed: form.petBreed || null,
        petAge: computeAgeFromDob(form.petDob),
        petGender: form.petGender || null,
        petDateOfBirth: form.petDob || null,
        
        // Pet photo data
        petPhotoBase64: form.petPhotoBase64 || null,
        petPhotoOriginalName: form.petPhotoName || null,
        petPhotoContentType: form.petPhotoType || null,
        
        // Owner information
        ownerName: (form.recipientName || user?.name || 'Guest').trim(),
        phone: (form.contactNumber || user?.phone || '').trim(),
        email: user?.email || null,
        address: addressLine,

        // Detailed address components
        addressType: form.addressType,
        area: form.area,
        cityStateCountry: form.cityStateCountry,
        houseNumber: form.houseNumber,
        building: form.building,
        floor: form.floor,
        landmark: form.landmark,
        recipientName: form.recipientName,
        recipientContactNumber: form.contactNumber,
        
        // GPS coordinates
        gpsLatitude: form.gps?.lat || null,
        gpsLongitude: form.gps?.lng || null,

        // Service details
        serviceName: `Pet Walking - ${form.duration}`,
        serviceType: 'pet-walking',
        basePrice: Number(price),
        totalAmount: Number(price),
        preferredDate: form.date, // YYYY-MM-DD
        preferredTime: form.timeSlot,
        specialInstructions: form.specialInstructions || null,

        // Keep addOns for backward compatibility and additional data
        addOns: {
          duration: form.duration,
          rules: form.rules,
          gps: form.gps,
          petPhoto: form.petPhotoBase64 ? {
            name: form.petPhotoName,
            type: form.petPhotoType,
            data: form.petPhotoBase64
          } : null,
          addressDetails: {
            type: form.addressType,
            area: form.area,
            cityStateCountry: form.cityStateCountry,
            houseNumber: form.houseNumber,
            building: form.building,
            floor: form.floor,
            landmark: form.landmark,
            recipientName: form.recipientName,
            contactNumber: form.contactNumber,
          }
        },

        // Optional linkage
        userId: user?.id || null,
      };

      console.log('[DEBUG] Pet Walking Comprehensive Booking Data:', {
        // Core booking info
        petName: bookingData.petName,
        petType: bookingData.petType,
        petGender: bookingData.petGender,
        petDateOfBirth: bookingData.petDateOfBirth,
        ownerName: bookingData.ownerName,
        phone: bookingData.phone,
        
        // Address details
        address: bookingData.address,
        addressType: bookingData.addressType,
        area: bookingData.area,
        cityStateCountry: bookingData.cityStateCountry,
        houseNumber: bookingData.houseNumber,
        building: bookingData.building,
        
        // GPS coordinates
        gpsLatitude: bookingData.gpsLatitude,
        gpsLongitude: bookingData.gpsLongitude,
        
        // Service info
        serviceName: bookingData.serviceName,
        serviceType: bookingData.serviceType,
        totalAmount: bookingData.totalAmount,
        preferredDate: bookingData.preferredDate,
        preferredTime: bookingData.preferredTime,
        
        // Image info
        hasPetPhoto: !!bookingData.petPhotoBase64,
        petPhotoName: bookingData.petPhotoOriginalName,
        petPhotoType: bookingData.petPhotoContentType,
        
        // Additional data
        addOnsKeys: bookingData.addOns ? Object.keys(bookingData.addOns) : []
      });

      const resp = await serviceBookingApi.createBooking(bookingData);
      console.log('[DEBUG] Pet Walking API Response:', resp);
      
      if (resp?.success) {
        console.log('[DEBUG] Walking booking created successfully:', resp.booking?.id);
        setConfirmation({ booking: resp.booking });
      } else {
        console.error('[ERROR] Walking booking failed:', resp?.message);
        alert(resp?.message || 'Failed to create pet walking booking');
      }
    } catch (err) {
      console.error('[ERROR] Pet walking booking error:', err);
      alert(err?.message || 'There was an error creating your pet walking booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {!confirmation && stepHeader}
        {confirmation ? (
          <BookingConfirmation type="walking" booking={confirmation.booking} onClose={onClose} />
        ) : (
        <form onSubmit={submit} className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">Step 1: Walk Plan & Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Walking Duration *"
                  value={form.duration}
                  onChange={(v) => setField('duration', v)}
                  options={[
                    { value: '30 minutes', label: '30 minutes' },
                    { value: '45 minutes', label: '45 minutes' },
                    { value: '60 minutes', label: '60 minutes' },
                  ]}
                  required
                />
                <Input
                  label="Date *"
                  type="date"
                  min={minDateStr}
                  value={form.date}
                  onChange={(e) => setField('date', e.target.value)}
                  required
                />
                <Select
                  label="Start Time *"
                  value={form.timeSlot}
                  onChange={(v) => setField('timeSlot', v)}
                  options={timeSlots.map((t) => ({ value: t, label: t }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Checkbox checked={!!form.rules.onLeash} onChange={(e) => setRule('onLeash', e.target.checked)} label="Pet will be on leash" />
                <Checkbox checked={!!form.rules.avoidOtherDogs} onChange={(e) => setRule('avoidOtherDogs', e.target.checked)} label="Avoid other dogs during walk" />
                {/* Removed 'Walker to pick up poop' checkbox */}
                <Checkbox checked={!!form.rules.carryWater} onChange={(e) => setRule('carryWater', e.target.checked)} label="Carry water for hydration" />
                <Checkbox checked={!!form.rules.harnessRequired} onChange={(e) => setRule('harnessRequired', e.target.checked)} label="Harness required" />
                <Checkbox checked={!!form.rules.treatsAllowed} onChange={(e) => setRule('treatsAllowed', e.target.checked)} label="Treats allowed" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Special Instructions</label>
                <textarea
                  className="w-full p-3 border border-border rounded-lg"
                  rows={3}
                  placeholder="Any route preference, behavior tips, gate codes, etc."
                  value={form.specialInstructions}
                  onChange={(e) => setField('specialInstructions', e.target.value)}
                />
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={stepForward} iconName="ChevronRight">Next</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">Step 2: Pet Information</h3>
              <p className="text-sm text-muted-foreground">Enter your pet's details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Pet Name *" value={form.petName} onChange={(e) => setField('petName', e.target.value)} placeholder="Enter pet name" required />
                <Select label="Pet Type *" value={form.petType} onChange={(v) => setField('petType', v)} options={[{value:'dog',label:'Dog'},{value:'cat',label:'Cat'}]} required />
                {form.petType === 'dog' ? (
                  <Input
                    label="Pet Breed"
                    value={form.petBreed}
                    onChange={(e) => setField('petBreed', e.target.value)}
                    placeholder="Type your dog's breed"
                  />
                ) : (
                  <Select
                    label="Pet Breed"
                    value={form.petBreed}
                    onChange={(v) => setField('petBreed', v)}
                    options={[
                      { value: 'Persian Cat', label: 'Persian Cat' },
                      { value: 'Siamese', label: 'Siamese' },
                      { value: 'Maine Coon', label: 'Maine Coon' },
                      { value: 'Ragdoll', label: 'Ragdoll' },
                      { value: 'Indie', label: 'Indie' },
                    ]}
                    placeholder="Select Your Cat's Breed"
                  />
                )}
                <Input label="Your Pet's Date of Birth" type="date" value={form.petDob} onChange={(e) => setField('petDob', e.target.value)} />
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Pet Photo</label>
                  <div className="flex items-center gap-4">
                    <Input type="file" accept="image/*" onChange={handlePhotoChange} />
                    {form.petPhotoBase64 && (
                      <AppImage src={form.petPhotoBase64} alt="Pet preview" className="h-16 w-16 rounded object-cover border" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Upload your pet's current photo for walker reference (max 3MB).</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Pet Gender</label>
                <div className="mt-2 flex gap-3">
                  <Button variant={form.petGender==='male'?'default':'outline'} onClick={() => setField('petGender','male')}>Male</Button>
                  <Button variant={form.petGender==='female'?'default':'outline'} onClick={() => setField('petGender','female')}>Female</Button>
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={stepBack} iconName="ChevronLeft">Back</Button>
                <Button onClick={stepForward} iconName="ChevronRight">Next</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">Step 3: Complete Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Area" value={form.area} onChange={(e) => setField('area', e.target.value)} placeholder="e.g., Banashankari" />
                <Input label="City, State, Country" value={form.cityStateCountry} onChange={(e) => setField('cityStateCountry', e.target.value)} placeholder="e.g., Bengaluru, Karnataka, India" />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" iconName="MapPin" onClick={fetchCurrentAddress}>Use Current Location (GPS)</Button>
                {form.gps?.lat && <span className="text-xs text-muted-foreground">Lat: {form.gps.lat?.toFixed(5)}, Lng: {form.gps.lng?.toFixed(5)}</span>}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Address Type</span>
                <div className="flex gap-2">
                  <Button variant={form.addressType==='home'?'default':'outline'} size="sm" onClick={() => setField('addressType','home')}>Home</Button>
                  <Button variant={form.addressType==='work'?'default':'outline'} size="sm" onClick={() => setField('addressType','work')}>Work</Button>
                  <Button variant={form.addressType==='other'?'default':'outline'} size="sm" onClick={() => setField('addressType','other')}>Other</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="House Number" value={form.houseNumber} onChange={(e) => setField('houseNumber', e.target.value)} placeholder="e.g., 99" />
                <Input label="Society/Building Name" value={form.building} onChange={(e) => setField('building', e.target.value)} placeholder="Enter society or building name" />
                <Input label="Floor" value={form.floor} onChange={(e) => setField('floor', e.target.value)} placeholder="Enter floor number" />
                <Input label="Landmark" value={form.landmark} onChange={(e) => setField('landmark', e.target.value)} placeholder="Enter nearby landmark" />
                <Input label="Recipient Name" value={form.recipientName} onChange={(e) => setField('recipientName', e.target.value)} placeholder="Who will hand over pet?" />
                <Input label="Contact Number" type="tel" value={form.contactNumber} onChange={(e) => setField('contactNumber', e.target.value)} placeholder="+91XXXXXXXXXX" />
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={stepBack} iconName="ChevronLeft">Back</Button>
                <Button type="submit" disabled={isSubmitting} iconName={isSubmitting? 'Loader2' : 'Calendar'}>
                  {isSubmitting ? 'Booking...' : `Confirm Walk (₹${price})`}
                </Button>
              </div>
            </div>
          )}
        </form>
        )}
      </div>
    </div>
  );
};

export default WalkingBookingForm;
