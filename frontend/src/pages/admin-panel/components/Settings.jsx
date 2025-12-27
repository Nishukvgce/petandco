
import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import dataService from '../../../services/dataService';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import CouponsAdmin from '../Coupons';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    currency: '',
    shippingFee: '',
    freeShippingThreshold: '',
    taxRate: ''
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const currentSettings = dataService.getSettings();
    setSettings({
      siteName: currentSettings.siteName || '',
      currency: currentSettings.currency || '',
      shippingFee: currentSettings.shippingFee?.toString() || '',
      freeShippingThreshold: currentSettings.freeShippingThreshold?.toString() || '',
      taxRate: (currentSettings.taxRate * 100)?.toString() || ''
    });
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const updatedSettings = {
      siteName: settings.siteName,
      currency: settings.currency,
      shippingFee: parseFloat(settings.shippingFee),
      freeShippingThreshold: parseFloat(settings.freeShippingThreshold),
      taxRate: parseFloat(settings.taxRate) / 100
    };

    dataService.updateSettings(updatedSettings);
    setLoading(false);
    setSaved(true);

    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your store settings</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Site Name</label>
              <Input name="siteName" value={settings.siteName} onChange={handleChange} placeholder="Your Store Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
              <Input name="currency" value={settings.currency} onChange={handleChange} placeholder="INR" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Shipping Fee (₹)</label>
              <Input name="shippingFee" type="number" value={settings.shippingFee} onChange={handleChange} placeholder="50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Free Shipping Threshold (₹)</label>
              <Input name="freeShippingThreshold" type="number" value={settings.freeShippingThreshold} onChange={handleChange} placeholder="500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tax Rate (%)</label>
              <Input name="taxRate" type="number" step="0.01" value={settings.taxRate} onChange={handleChange} placeholder="18" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-border">
            {saved && (<div className="text-sm text-success">Settings saved successfully!</div>)}
            <Button type="submit" disabled={loading} className="flex items-center space-x-2 ml-auto">
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Settings'}</span>
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-heading font-bold text-foreground mb-4">Coupons</h2>
        <p className="text-muted-foreground mb-4">Manage discount codes and activation</p>
        <CouponsAdmin />
      </div>
    </div>
  );
};

export default Settings;
