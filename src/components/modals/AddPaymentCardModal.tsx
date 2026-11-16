import React, { useState, useEffect } from 'react';
import { X, CreditCard, ShieldCheck } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const AddPaymentCardModal: React.FC = () => {
  const {
    customerCards,
    saveCustomerContactCards,
    isAddCardOpen,
    setIsAddCardOpen,
    editingCard,
  } = useWorkspace();

  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('12');
  const [expiryYear, setExpiryYear] = useState('2029');
  const [bankName, setBankName] = useState('');
  const [cardType, setCardType] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingCard) {
      setNameOnCard(editingCard.nameOnCard || '');
      setBankName(editingCard.bankName || '');
      setCardType(editingCard.type || 1);
      setCardNumber(editingCard.cardNo || '');
      if (editingCard.expiry) {
        const d = new Date(editingCard.expiry);
        if (!Number.isNaN(d.getTime())) {
          setExpiryMonth(String(d.getMonth() + 1).padStart(2, '0'));
          setExpiryYear(String(d.getFullYear()));
        } else {
          const parts = editingCard.expiry.split('-');
          if (parts.length >= 2) {
            setExpiryYear(parts[0]);
            setExpiryMonth(parts[1]);
          }
        }
      }
      setErrorMessage(null);
    }
  }, [editingCard, isAddCardOpen]);

  if (!isAddCardOpen || !editingCard) return null;

  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    const formatted = clean.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawNumber = cardNumber.replace(/\s+/g, '');
    if (rawNumber && rawNumber.length < 15) {
      setErrorMessage('If updating the card number, please enter 15 or 16 digits.');
      return;
    }
    if (!nameOnCard.trim()) {
      setErrorMessage('Please enter the cardholder name.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const lastFour = rawNumber ? rawNumber.slice(-4) : editingCard.cardNoLastFourDigits;
    const expiryDate = `${expiryYear}-${expiryMonth.padStart(2, '0')}-23T00:00:00`;

    const updatedCard = {
      ...editingCard,
      id: editingCard.id,
      type: cardType,
      cardNoLastFourDigits: lastFour,
      expiry: expiryDate,
      nameOnCard: nameOnCard.trim(),
      bankName: bankName.trim() || null,
      ...(rawNumber ? { cardNo: rawNumber } : {}),
    };

    const updatedList = customerCards.map((c) =>
      c.id === editingCard.id ? updatedCard : c
    );

    const res = await saveCustomerContactCards(updatedList);
    setIsSubmitting(false);

    if (res.success) {
      setIsAddCardOpen(false);
    } else {
      setErrorMessage(res.message || 'Saved locally.');
      setTimeout(() => {
        setIsAddCardOpen(false);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-fade-in">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              Update Card •••• {editingCard.cardNoLastFourDigits}
            </h3>
          </div>
          <button
            onClick={() => setIsAddCardOpen(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Card Type <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="cardTypeRadio"
                  checked={cardType === 1}
                  onChange={() => setCardType(1)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">Credit Card (Type 1)</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="cardTypeRadio"
                  checked={cardType === 2}
                  onChange={() => setCardType(2)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">Debit Card (Type 2)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Card Number (Optional — leave blank to keep •••• {editingCard.cardNoLastFourDigits})
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder={`•••• •••• •••• ${editingCard.cardNoLastFourDigits}`}
                maxLength={19}
                className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 tracking-wider"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Name on Card <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nameOnCard}
              onChange={(e) => setNameOnCard(e.target.value)}
              placeholder="Full name as printed on card"
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Expiry Month / Year <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-slate-50 focus:ring-1 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value)}
                  className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-slate-50 focus:ring-1 focus:ring-blue-500"
                >
                  {['2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033'].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Issuing Bank
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Bank name"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[11px]">
              {errorMessage}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Card ID #{editingCard.id ?? '—'}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsAddCardOpen(false)}
                className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded font-semibold text-xs transition-colors"
              >
                {isSubmitting ? 'Updating...' : 'Update Card'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
