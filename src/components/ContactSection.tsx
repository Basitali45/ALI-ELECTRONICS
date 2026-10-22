import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  ShieldCheck,
  Mail
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings } from '../types';
import { api } from '../services/api';
import { OFFICIAL_WHATSAPP_NUMBER } from '../lib/policy';

interface ContactSectionProps {
  settings: StoreSettings;
}

export function ContactSection({ settings }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const officialNumber = settings?.whatsappNumber || OFFICIAL_WHATSAPP_NUMBER;
  const cleanWhatsApp = officialNumber.replace(/^0/, '92').replace(/[^0-9]/g, '');

  const validatePakistaniPhone = (num: string): boolean => {
    const cleaned = num.replace(/[\s-]/g, '');
    return /^(03[0-9]{9}|\+923[0-9]{9}|923[0-9]{9})$/.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide your phone number.');
      return;
    }
    if (!validatePakistaniPhone(phone)) {
      setError('Please enter a valid Pakistani mobile number (e.g., 0318-9869746).');
      return;
    }
    if (!message.trim()) {
      setError('Please enter your message.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitContact({
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim(),
      });
      setSuccess(true);
      setName('');
      setPhone('');
      setMessage('');
      setTimeout(() => setSuccess(false), 8000);
    } catch (err: any) {
      setError(err.message || 'Could not send message. You can contact us directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-cyan-400 uppercase">
            Get In Touch
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Contact ZAPLIX Customer Care
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Have questions about product availability, order tracking, or special inquiries? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Channels & Delivery Info */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WhatsApp Priority Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-7 h-7 fill-[#25D366]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    Official WhatsApp Desk
                  </h3>
                  <p className="text-xs text-slate-500">Fastest response for inquiries &amp; orders</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                  Direct WhatsApp Helpline:
                </span>
                <div className="font-mono text-lg font-black text-slate-900 dark:text-white">
                  0318-9869746
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Click below to open chat instantly on your phone or desktop.
                </p>
              </div>

              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent('Hello Zaplix Team! I would like to inquire about your products.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#25D366]/30 cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp (03189869746)</span>
              </a>
            </div>

            {/* Nationwide Delivery & Payment Highlights */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    Nationwide Shipping
                  </h3>
                  <p className="text-xs text-slate-500">Free Home Delivery on all orders</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span><strong>Zero Delivery Fees:</strong> Rs. 0 delivery charge nationwide.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span><strong>Cash on Delivery (COD):</strong> Pay at your doorstep upon arrival.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span><strong>7-Day Returns:</strong> Easy replacement if damaged or incorrect.</span>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  Customer Support Timings
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium pl-6">
                Daily 9:00 AM – 11:00 PM (Monday through Sunday)
              </p>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <div>
                <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                  Send a Message to ZAPLIX
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Submit your inquiry below and our team will get back to you via call or WhatsApp.
                </p>
              </div>

              {success && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Thank you! Your message has been received by ZAPLIX Customer Care. We will contact you promptly.
                  </span>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Muhammad Bilal"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Pakistani Mobile / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0318-XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Your Message / Inquiry <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about the product you wish to order or any question you have..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-3 px-6 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Sending Message...' : 'Submit Message'}</span>
                  </button>

                  <a
                    href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(`Hello Zaplix Team, my name is ${name || 'Customer'}. I am contacting you from your website.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366] text-[#25D366]" />
                    <span>Or send via WhatsApp</span>
                  </a>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
