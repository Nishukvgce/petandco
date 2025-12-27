import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const AddressBook = ({ addresses, onAddAddress, onUpdateAddress, onDeleteAddress, onSetDefault }) => {
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'Home'
  });
  const [errors, setErrors] = useState({});

  const addressTypes = ['Home', 'Work', 'Other'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(?:\+91|0)?[6-9]\d{9}$/.test(formData?.phone?.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid Indian phone number (10 digits, optional +91 or leading 0)';
    }
    
    if (!formData?.street?.trim()) {
      newErrors.street = 'Street address is required';
    }
    
    if (!formData?.city?.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData?.state?.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData?.pincode?.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/?.test(formData?.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSaveAddress = () => {
    if (validateForm()) {
      if (editingAddress) {
        onUpdateAddress(editingAddress?.id, formData);
        setEditingAddress(null);
      } else {
        onAddAddress(formData);
        setIsAddingAddress(false);
      }
      resetForm();
    }
  };

  const handleEditAddress = (address) => {
    setFormData({
      name: address?.name,
      phone: address?.phone,
      street: address?.street,
      city: address?.city,
      state: address?.state,
      pincode: address?.pincode,
      landmark: address?.landmark || '',
      addressType: address?.addressType
    });
    setEditingAddress(address);
    setIsAddingAddress(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      addressType: 'Home'
    });
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    setIsAddingAddress(false);
    setEditingAddress(null);
  };

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case 'Home':
        return 'Home';
      case 'Work':
        return 'Building';
      default:
        return 'MapPin';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Address Book
        </h1>
        {!isAddingAddress && !editingAddress && (
          <Button
            variant="default"
            onClick={() => setIsAddingAddress(true)}
            iconName="Plus"
            iconPosition="left"
          >
            Add New Address
          </Button>
        )}
      </div>
      {/* Add/Edit Address Form */}
      {(isAddingAddress || editingAddress) && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              type="text"
              value={formData?.name}
              onChange={(e) => handleInputChange('name', e?.target?.value)}
              error={errors?.name}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              value={formData?.phone}
              onChange={(e) => handleInputChange('phone', e?.target?.value)}
              error={errors?.phone}
              required
            />

            <div className="md:col-span-2">
              <Input
                label="Street Address"
                type="text"
                value={formData?.street}
                onChange={(e) => handleInputChange('street', e?.target?.value)}
                error={errors?.street}
                placeholder="House/Flat number, Street name"
                required
              />
            </div>

            <Input
              label="City"
              type="text"
              value={formData?.city}
              onChange={(e) => handleInputChange('city', e?.target?.value)}
              error={errors?.city}
              required
            />

            <Input
              label="State"
              type="text"
              value={formData?.state}
              onChange={(e) => handleInputChange('state', e?.target?.value)}
              error={errors?.state}
              required
            />

            <Input
              label="Pincode"
              type="text"
              value={formData?.pincode}
              onChange={(e) => handleInputChange('pincode', e?.target?.value)}
              error={errors?.pincode}
              maxLength={6}
              required
            />

            <Input
              label="Landmark (Optional)"
              type="text"
              value={formData?.landmark}
              onChange={(e) => handleInputChange('landmark', e?.target?.value)}
              placeholder="Near landmark or area"
            />

            <div>
              <label className="block font-body font-medium text-foreground mb-2">
                Address Type
              </label>
              <div className="flex space-x-4">
                {addressTypes?.map((type) => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="addressType"
                      value={type}
                      checked={formData?.addressType === type}
                      onChange={(e) => handleInputChange('addressType', e?.target?.value)}
                      className="w-4 h-4 text-primary border-border focus:ring-primary"
                    />
                    <span className="font-body text-sm text-foreground">
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6 pt-6 border-t border-border">
            <Button
              variant="default"
              onClick={handleSaveAddress}
            >
              {editingAddress ? 'Update Address' : 'Save Address'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      {/* Address List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {addresses?.length === 0 ? (
          <div className="lg:col-span-2 text-center py-12 bg-card border border-border rounded-lg">
            <Icon name="MapPin" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="font-heading font-semibold text-foreground mb-2">
              No addresses saved
            </h3>
            <p className="font-body text-muted-foreground mb-4">
              Add your first address to get started with faster checkout.
            </p>
            <Button
              variant="default"
              onClick={() => setIsAddingAddress(true)}
            >
              Add Address
            </Button>
          </div>
        ) : (
          addresses?.map((address) => (
            <div
              key={address?.id}
              className={`bg-card border rounded-lg p-4 ${
                address?.isDefault ? 'border-primary ring-1 ring-primary/20' : 'border-border'
              }`}
            >
              {/* Address Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={getAddressTypeIcon(address?.addressType)} 
                    size={16} 
                    className="text-primary" 
                  />
                  <span className="font-body font-medium text-foreground">
                    {address?.addressType}
                  </span>
                  {address?.isDefault && (
                    <span className="bg-primary/10 text-primary text-xs font-caption font-medium px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="p-1 hover:bg-muted rounded transition-colors duration-200"
                    aria-label="Edit address"
                  >
                    <Icon name="Edit" size={16} className="text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => onDeleteAddress(address?.id)}
                    className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors duration-200"
                    aria-label="Delete address"
                  >
                    <Icon name="Trash2" size={16} className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-1 mb-4">
                <p className="font-body font-medium text-foreground">
                  {address?.name}
                </p>
                <p className="font-body text-sm text-foreground">
                  {address?.street}
                </p>
                {address?.landmark && (
                  <p className="font-caption text-sm text-muted-foreground">
                    Near {address?.landmark}
                  </p>
                )}
                <p className="font-body text-sm text-foreground">
                  {address?.city}, {address?.state} {address?.pincode}
                </p>
                <p className="font-caption text-sm text-muted-foreground">
                  Phone: {address?.phone}
                </p>
              </div>

              {/* Address Actions */}
              {!address?.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetDefault(address?.id)}
                  fullWidth
                >
                  Set as Default
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddressBook;