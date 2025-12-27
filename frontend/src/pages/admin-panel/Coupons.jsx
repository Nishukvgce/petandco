import React, { useEffect, useState } from 'react';
import couponApi from '../../services/couponApi';
import Button from '../../components/ui/Button';

const emptyForm = {
  code: '', description: '', discountType: 'PERCENT', value: 10,
  minSubtotal: 0, applicablePetType: '', applicableCategory: '', applicableSubcategory: '',
  startDate: '', endDate: '', active: true
};

const CouponsAdmin = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setCoupons(await couponApi.list()); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...form };
    // Normalize blanks to null where appropriate
    ['applicablePetType','applicableCategory','applicableSubcategory'].forEach(k=>{ if(!payload[k]) payload[k]=null; });
    if (!editingId) {
      await couponApi.create(payload);
    } else {
      await couponApi.update(editingId, payload);
    }
    setForm(emptyForm); setEditingId(null);
    await load();
  };

  const edit = (c) => {
    setEditingId(c.id);
    setForm({
      code: c.code || '', description: c.description || '', discountType: c.discountType || 'PERCENT', value: c.value || 0,
      minSubtotal: c.minSubtotal ?? 0, applicablePetType: c.applicablePetType || '', applicableCategory: c.applicableCategory || '', applicableSubcategory: c.applicableSubcategory || '',
      startDate: c.startDate || '', endDate: c.endDate || '', active: !!c.active
    });
  };

  const remove = async (id) => { await couponApi.remove(id); await load(); };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Coupon Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
          <div className="space-y-3">
            <input className="w-full border p-2 rounded" placeholder="Code" value={form.code} onChange={e=>setForm({...form, code:e.target.value})} />
            <input className="w-full border p-2 rounded" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
            <div className="flex gap-2">
              <select className="border p-2 rounded" value={form.discountType} onChange={e=>setForm({...form, discountType:e.target.value})}>
                <option value="PERCENT">Percent</option>
                <option value="FIXED">Fixed</option>
              </select>
              <input className="border p-2 rounded w-24" type="number" step="0.01" placeholder="Value" value={form.value} onChange={e=>setForm({...form, value:parseFloat(e.target.value||0)})} />
              <input className="border p-2 rounded w-40" type="number" step="0.01" placeholder="Min Subtotal" value={form.minSubtotal} onChange={e=>setForm({...form, minSubtotal:parseFloat(e.target.value||0)})} />
            </div>
            <div className="flex gap-2">
              <input className="border p-2 rounded" placeholder="PetType (Dog/Cat)" value={form.applicablePetType} onChange={e=>setForm({...form, applicablePetType:e.target.value})} />
              <input className="border p-2 rounded" placeholder="Category" value={form.applicableCategory} onChange={e=>setForm({...form, applicableCategory:e.target.value})} />
            </div>
            <input className="border p-2 rounded" placeholder="Subcategory" value={form.applicableSubcategory} onChange={e=>setForm({...form, applicableSubcategory:e.target.value})} />
            <div className="flex gap-2">
              <input className="border p-2 rounded" type="datetime-local" value={form.startDate} onChange={e=>setForm({...form, startDate:e.target.value})} />
              <input className="border p-2 rounded" type="datetime-local" value={form.endDate} onChange={e=>setForm({...form, endDate:e.target.value})} />
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})} /> Active</label>
            <Button onClick={save}>{editingId ? 'Update' : 'Create'}</Button>
          </div>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">Existing Coupons</h2>
          {loading ? <p>Loading...</p> : (
            <div className="space-y-2">
              {coupons.map(c => (
                <div key={c.id} className="border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.code} {c.active ? <span className="text-green-600">(Active)</span> : <span className="text-gray-500">(Inactive)</span>}</div>
                    <div className="text-sm text-gray-600">{c.description}</div>
                    <div className="text-xs text-gray-500">{c.discountType} {c.value}{c.discountType==='PERCENT'?'%':''} • Min ₹{c.minSubtotal ?? 0}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={()=>edit(c)}>Edit</Button>
                    <Button variant="destructive" onClick={()=>remove(c.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponsAdmin;
