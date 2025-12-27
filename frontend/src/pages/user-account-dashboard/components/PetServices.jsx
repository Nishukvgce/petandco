import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import serviceBookingApi from '../../../services/serviceBookingApi';

const statusChip = (status = 'PENDING') => {
  const map = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-muted text-foreground';
};

const typeIcon = (type = '') => {
  const t = (type || '').toLowerCase();
  if (t.includes('walk')) return { name: 'Footprints', color: 'text-orange-500' };
  if (t.includes('board')) return { name: 'Home', color: 'text-blue-500' };
  if (t.includes('groom')) return { name: 'Scissors', color: 'text-purple-500' };
  return { name: 'PawPrint', color: 'text-primary' };
};

const normalize = (raw = {}) => ({
  id: raw.id,
  serviceName: raw.serviceName,
  serviceType: raw.serviceType,
  petName: raw.petName,
  petBreed: raw.petBreed,
  petAge: raw.petAge,
  preferredDate: raw.preferredDate,
  preferredTime: raw.preferredTime,
  status: raw.status || 'PENDING',
  totalAmount: raw.totalAmount ?? raw.basePrice,
  ownerName: raw.ownerName,
  phone: raw.phone,
  email: raw.email,
  addOns: raw.addOns || {},
  userId: raw.userId || null,
  createdAt: raw.createdAt,
});

const sortByDateTime = (a, b) => {
  const da = new Date(`${a.preferredDate || a.createdAt} ${a.preferredTime || ''}`);
  const db = new Date(`${b.preferredDate || b.createdAt} ${b.preferredTime || ''}`);
  return db - da; // newest first
};

export default function PetServices({ user }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await serviceBookingApi.getBookingsForUser({ userId: user?.id, email: user?.email, phone: user?.phone });
        let results = (resp?.bookings || []).map(normalize);
        setBookings(results.sort(sortByDateTime));
      } catch (e) {
        console.error('Failed to load bookings', e);
        setError(e.message || 'Failed to load pet services');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, user?.email, user?.phone, user?.name]);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'walking', label: 'Walking' },
    { id: 'boarding', label: 'Boarding' },
    { id: 'grooming', label: 'Grooming' },
  ];

  const filtered = useMemo(() => {
    if (activeTab === 'all') return bookings;
    return bookings.filter(b => {
      const t = `${b.serviceType} ${b.serviceName}`.toLowerCase();
      if (activeTab === 'walking') return t.includes('walk');
      if (activeTab === 'boarding') return t.includes('board');
      if (activeTab === 'grooming') return t.includes('groom');
      return true;
    });
  }, [bookings, activeTab]);

  const counts = useMemo(() => {
    const c = { all: bookings.length, walking: 0, boarding: 0, grooming: 0 };
    bookings.forEach(b => {
      const t = `${b.serviceType} ${b.serviceName}`.toLowerCase();
      if (t.includes('walk')) c.walking++;
      else if (t.includes('board')) c.boarding++;
      else if (t.includes('groom')) c.grooming++;
    });
    return c;
  }, [bookings]);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">My Pet Services</h2>
          <p className="text-sm text-muted-foreground">View your walking, boarding, and grooming bookings in one place.</p>
        </div>
        <div className="hidden md:flex gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${activeTab===t.id?'bg-primary text-primary-foreground border-primary':'bg-background hover:bg-muted border-border'}`}
            >
              {t.label}
              <span className="ml-2 text-xs opacity-80">{counts[t.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="mt-4 md:hidden flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${activeTab===t.id?'bg-primary text-primary-foreground border-primary':'bg-background hover:bg-muted border-border'}`}
          >
            {t.label}
            <span className="ml-2 text-xs opacity-80">{counts[t.id] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading && (
          <div className="text-center text-muted-foreground">Loading your bookings…</div>
        )}
        {error && !loading && (
          <div className="text-center text-destructive">{error}</div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center text-muted-foreground p-8 border border-dashed border-border rounded-lg">
            <p>No bookings found yet.</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <a href="/pet-walking"><Button size="sm" variant="secondary" iconName="Footprints">Book Walking</Button></a>
              <a href="/pet-boarding"><Button size="sm" variant="secondary" iconName="Home">Book Boarding</Button></a>
              <a href="/shop-for-dogs/dog-grooming"><Button size="sm" variant="secondary" iconName="Scissors">Explore Grooming</Button></a>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(b => {
            const ic = typeIcon(`${b.serviceType} ${b.serviceName}`);
            return (
              <div key={b.id} className="bg-white rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center ${ic.color}`}>
                      <Icon name={ic.name} size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{b.serviceName}</div>
                      <div className="text-xs text-muted-foreground">For {b.petName}{b.petBreed?` • ${b.petBreed}`:''}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusChip(b.status)}`}>{b.status?.replace('_',' ')}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground"><Icon name="Calendar" size={16} /><span>{b.preferredDate || '—'}</span></div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Icon name="Clock" size={16} /><span>{b.preferredTime || '—'}</span></div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Icon name="IndianRupee" size={16} /><span>₹{b.totalAmount}</span></div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Icon name="User" size={16} /><span>{b.ownerName}</span></div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {/* <button className="text-sm text-primary hover:underline" onClick={() => setExpanded(expanded===b.id?null:b.id)}>
                    {expanded===b.id? 'Hide details' : 'View details'}
                  </button> */}
                  {/* Placeholder actions */}
                  {/* <div className="flex gap-2">
                    {b.status === 'PENDING' && <Button size="sm" variant="outline" iconName="X">Cancel</Button>}
                    <Button size="sm" variant="outline" iconName="Download">Invoice</Button>
                  </div> */}
                </div>
                {expanded===b.id && (
                  <div className="mt-3 p-3 bg-muted/40 rounded-lg text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-muted-foreground">
                      <div>Phone: <span className="text-foreground">{b.phone || '—'}</span></div>
                      <div>Email: <span className="text-foreground">{b.email || '—'}</span></div>
                      <div>Notes: <span className="text-foreground">{(b.addOns?.notes || b.notes || '—')}</span></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
