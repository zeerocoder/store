import React, { useState } from 'react';
import {
  Store,
  X,
  CheckCircle2,
  Phone,
  Mail,
  Building,
  CreditCard,
  Truck,
  Sparkles,
} from 'lucide-react';
import { StorefrontSettings } from '../types';

interface StorefrontSettingsModalProps {
  settings: StorefrontSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: Partial<StorefrontSettings>) => void;
}

export const StorefrontSettingsModal: React.FC<StorefrontSettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSave,
}) => {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [bannerHeadline, setBannerHeadline] = useState(settings.bannerHeadline);
  const [bannerSubheadline, setBannerSubheadline] = useState(settings.bannerSubheadline);
  const [announcementBarText, setAnnouncementBarText] = useState(settings.announcementBarText);
  const [showAnnouncement, setShowAnnouncement] = useState(settings.showAnnouncement);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [salesWhatsApp, setSalesWhatsApp] = useState(settings.salesWhatsApp);
  const [centralDepotAddress, setCentralDepotAddress] = useState(settings.centralDepotAddress);
  const [bankName, setBankName] = useState(settings.bankName);
  const [accountNumber, setAccountNumber] = useState(settings.accountNumber);
  const [accountName, setAccountName] = useState(settings.accountName);
  const [paystackEnabled, setPaystackEnabled] = useState(settings.paystackEnabled);
  const [flutterwaveEnabled, setFlutterwaveEnabled] = useState(settings.flutterwaveEnabled);
  const [bankTransferEnabled, setBankTransferEnabled] = useState(settings.bankTransferEnabled);
  const [freeDeliveryThresholdTons, setFreeDeliveryThresholdTons] = useState(settings.freeDeliveryThresholdTons);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      storeName,
      tagline,
      bannerHeadline,
      bannerSubheadline,
      announcementBarText,
      showAnnouncement,
      supportPhone,
      supportEmail,
      salesWhatsApp,
      centralDepotAddress,
      bankName,
      accountNumber,
      accountName,
      paystackEnabled,
      flutterwaveEnabled,
      bankTransferEnabled,
      freeDeliveryThresholdTons: Number(freeDeliveryThresholdTons) || 30,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Store className="w-4 h-4 text-sky-400" />
              <span>Customize Public E-Commerce Storefront</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Configure hero messaging, promotional announcements, and company bank settlement credentials.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Hero Branding */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              1. Hero Branding & Tagline
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700">Official Storefront Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Tagline / Mission</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700">Main Banner Headline</label>
              <input
                type="text"
                value={bannerHeadline}
                onChange={(e) => setBannerHeadline(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">Hero Subheadline Narrative</label>
              <textarea
                value={bannerSubheadline}
                onChange={(e) => setBannerSubheadline(e.target.value)}
                rows={2}
                className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
              />
            </div>
          </div>

          {/* Announcement Bar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-700">
                2. Top Promotional Announcement Banner
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={showAnnouncement}
                  onChange={(e) => setShowAnnouncement(e.target.checked)}
                  className="rounded-sm text-sky-600 focus:ring-sky-500"
                />
                <span>Visible</span>
              </label>
            </div>
            <input
              type="text"
              placeholder="e.g. Bulk discount on Dangote Cement and TMT Steel for Lagos delivery..."
              value={announcementBarText}
              onChange={(e) => setAnnouncementBarText(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
            />
          </div>

          {/* Bank & Payment Gateways */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-700">
              3. Official Settlement Banking (Shown for Direct Wire / Transfer)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">NUBAN Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Account Beneficiary</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={paystackEnabled}
                  onChange={(e) => setPaystackEnabled(e.target.checked)}
                  className="rounded-sm text-sky-600"
                />
                <span>Paystack Gateway</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={flutterwaveEnabled}
                  onChange={(e) => setFlutterwaveEnabled(e.target.checked)}
                  className="rounded-sm text-sky-600"
                />
                <span>Flutterwave Gateway</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={bankTransferEnabled}
                  onChange={(e) => setBankTransferEnabled(e.target.checked)}
                  className="rounded-sm text-sky-600"
                />
                <span>Direct Bank Wire</span>
              </label>
            </div>
          </div>

          {/* Contact Details & Logistics Policy */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase text-[10px]">Customer Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase text-[10px]">WhatsApp Hotline</label>
              <input
                type="text"
                value={salesWhatsApp}
                onChange={(e) => setSalesWhatsApp(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase text-[10px]">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
          <button onClick={onClose} className="px-4 py-2 font-semibold text-slate-600">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs"
          >
            Save & Publish Live Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
