import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Send, 
  CheckCircle2, 
  Navigation, 
  ExternalLink, 
  AlertCircle 
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings } from '../types';
import { api } from '../services/api';

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

  const cleanWhatsApp = settings.whatsappNumber.replace(/^0/, '92').replace(/[^0-9]/g, '');

  const validatePakistaniPhone = (num: string): boolean => {
    // Accepts: 03115321647, 0313-3332141, +923115321647, 03XXXXXXXXX (10-11 digits)
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
      setError('Please enter a valid Pakistani mobile number (e.g., 03115321647).');
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
      setError(err.message || 'Could not send message. You can contact us directly on WhatsApp or call.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe Google Maps Search URL based on exact address
  const encodedAddress = encodeURIComponent(settings.location || 'Main Bus Stop, Islam Shaheed Road, Opposite New Sethi Flour Mills, Hassan Abdal, Pakistan');
  const googleMapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="contact" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
            Get In Touch
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Visit Us or Contact Ali Electronic
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            We are always happy to assist with product availability, prices, and technical questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Details, Phone lines, Business Hours */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Location Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    Shop Address
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {settings.location}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Opposite New Sethi Flour Mills · Main Bus Stop
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                </a>
              </div>
            </div>

            {/* Direct Phone Lines Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    Direct Phone Calls
                  </h3>
                  <p className="text-xs text-slate-500">Tap to call our store representatives</p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {/* Contact Person 1: Arbaz Ahmed */}
                <a
                  href={`tel:${settings.phone1}`}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {settings.phone1Name || 'Arbaz Ahmed'}
                    </div>
                    <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                      {settings.phone1}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Call Now
                  </span>
                </a>

                {/* Contact Person 2: Faraz Ahmed */}
                <a
                  href={`tel:${settings.phone2}`}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {settings.phone2Name || 'Faraz Ahmed'}
                    </div>
                    <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                      {settings.phone2}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Call Now
                  </span>
                </a>
              </div>

              {/* Direct WhatsApp Action */}
              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent('Assalam-o-Alaikum Ali Electronic, I would like to inquire about products.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white text-white" />
                <span>Message on WhatsApp ({settings.whatsappNumber})</span>
              </a>
            </div>

            {/* Business Hours Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  Business Timings
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium pl-6">
                {settings.businessHours || 'Opening Hours — Contact us for current timings'}
              </p>
            </div>

          </div>

          {/* Right Column: Contact Form & Google Map */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Interactive Contact Form */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <div>
                <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                  Send us a Direct Message
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Have a question about an electronics model, stock, or bulk quantity? Leave a message below.
                </p>
              </div>

              {success && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Thank you! Your message has been received by Ali Electronic. We will get back to you promptly.
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
                      placeholder="e.g. 03115321647"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Your Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us what product you are looking for or any question you have..."
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
                    className="py-3 px-6 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Sending Message...' : 'Submit Message'}</span>
                  </button>

                  <a
                    href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(`Assalam-o-Alaikum Ali Electronic, my name is ${name || 'Customer'}. I am contacting you from your website.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366] text-[#25D366]" />
                    <span>Or send directly via WhatsApp</span>
                  </a>
                </div>
              </form>
            </div>

            {/* Embedded Google Maps Section */}
            <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Hassan Abdal Location Map
                  </span>
                </div>
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Full Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative h-64 sm:h-72 w-full bg-slate-200 dark:bg-slate-800">
                <iframe
                  title="Ali Electronic Hassan Abdal Location Map"
                  src={googleMapsEmbedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
