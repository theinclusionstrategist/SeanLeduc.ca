'use client';

import React, { useState } from 'react';
import { createBooking } from '@/app/actions/booking';

const TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '01:00 PM',
  '02:30 PM',
  '04:00 PM',
];

export default function CalendarBooking() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setStatus({ success: false, message: 'Please select a date and time slot.' });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    const res = await createBooking({
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      date: selectedDate,
      timeSlot: selectedTime,
    });

    if (res.success) {
      setStatus({ success: true, message: res.message });
      setName('');
      setEmail('');
      setPhone('');
      setSelectedDate('');
      setSelectedTime('');
    } else {
      setStatus({ success: false, message: res.error || 'Failed to complete booking.' });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 font-sans">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-2xl font-extrabold text-white">Book a Direct Consultation</h3>
        <p className="text-xs text-slate-400 mt-1">
          Select a time that works best for you. Automated calendar confirmations will be sent instantly.
        </p>
      </div>

      {status && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border ${
            status.success
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
          }`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleBooking} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Date Picker */}
          <div>
            <label className="block text-xs uppercase font-bold text-slate-400 mb-2">
              1. Choose Date
            </label>
            <input
              type="date"
              min={minDateString}
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-xs uppercase font-bold text-slate-400 mb-2">
              2. Choose Time Slot (EST)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2.5 text-xs font-semibold rounded-xl border transition ${
                    selectedTime === slot
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <label className="block text-xs uppercase font-bold text-slate-400">
            3. Contact Information
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="email"
              required
              placeholder="Email Address *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <input
            type="tel"
            placeholder="Phone Number (Optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-sm transition shadow-xl shadow-blue-600/30 disabled:opacity-50"
        >
          {isSubmitting ? 'Confirming Appointment...' : 'Confirm Consultation Booking'}
        </button>
      </form>
    </div>
  );
}
