import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const headings = {
  walking: {
    title: 'Walk Booked Successfully!',
    subtitle: 'Your dog’s walk is scheduled. We’ll keep you updated.'
  },
  boarding: {
    title: 'Boarding Booked Successfully!',
    subtitle: 'Your pet’s stay is confirmed. A host will contact you.'
  },
  grooming: {
    title: 'Grooming Booked Successfully!',
    subtitle: 'Your appointment is confirmed. See you soon!'
  }
};

export default function BookingConfirmation({ type = 'walking', booking = {}, onClose }) {
  const h = headings[type] || headings.walking;
  return (
    <div className="p-6">
      <div className="flex flex-col items-center text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
          <Icon name="Check" size={28} />
        </div>
        <h3 className="mt-4 text-2xl font-heading font-bold text-foreground">{h.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{h.subtitle}</p>
      </div>

      <div className="mt-6 bg-muted/40 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground"><Icon name="PawPrint" size={16} /><span>Pet:</span><span className="text-foreground font-medium">{booking.petName || '—'}</span></div>
          <div className="flex items-center gap-2 text-muted-foreground"><Icon name="ClipboardList" size={16} /><span>Service:</span><span className="text-foreground font-medium">{booking.serviceName || '—'}</span></div>
          <div className="flex items-center gap-2 text-muted-foreground"><Icon name="Calendar" size={16} /><span>Date:</span><span className="text-foreground font-medium">{booking.preferredDate || '—'}</span></div>
          <div className="flex items-center gap-2 text-muted-foreground"><Icon name="Clock" size={16} /><span>Time:</span><span className="text-foreground font-medium">{booking.preferredTime || '—'}</span></div>
          <div className="flex items-center gap-2 text-muted-foreground"><Icon name="IndianRupee" size={16} /><span>Amount:</span><span className="text-foreground font-medium">₹{booking.totalAmount ?? booking.basePrice ?? '—'}</span></div>
          <div className="flex items-center gap-2 text-muted-foreground"><Icon name="Hash" size={16} /><span>Booking ID:</span><span className="text-foreground font-medium">{booking.id ?? '—'}</span></div>
        </div>
        {booking.address && (
          <div className="mt-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2"><Icon name="MapPin" size={16} /><span className="text-foreground">{booking.address}</span></div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <a href="/user-account-dashboard?section=pet-services"><Button variant="secondary" iconName="LayoutDashboard">View in Dashboard</Button></a>
        <Button onClick={onClose} iconName="CheckCircle2">Done</Button>
      </div>

      <p className="mt-3 text-xs text-center text-muted-foreground">You will receive a confirmation call/message shortly. For changes, reply to the confirmation or contact support.</p>
    </div>
  );
}
