import React, { useState, useEffect, useRef } from 'react';
import { ICONS, PRODUCTS, PAYPAL_BASE_URL, VERIFICATION_CSV_URL, SUPPORT_EMAIL } from '../constants';
import { Product, Order } from '../types';

interface PaymentPortalProps {
  onClose: () => void;
  onSuccess: (planId: string) => void;
  onWatchAd?: () => void;
}

const SUCCESS_STORIES = [
  { name: "Marcus T.", role: "Solo Developer", text: "Turned a weekend idea into $2.5k MRR in 30 days. The technical architecture prompts saved me months of work.", stars: 5, verified: true },
  { name: "Elena S.", role: "Growth Lead", text: "The viral hooks and growth blueprints are insane. Our first launch got 450k views on TikTok alone.", stars: 5, verified: true },
  { name: "Jason W.", role: "Agency Founder", text: "We use the Idea Engine to validate client concepts now. It's paid for itself 100x over.", stars: 5, verified: true }
];

const PaymentPortal: React.FC<PaymentPortalProps> = ({ onClose, onSuccess, onWatchAd }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(PRODUCTS.find(p => p.popular) || PRODUCTS[1]);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const pollingRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const generateOrderId = () => {
    return 'IDL-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleProceedToPayment = () => {
    if (!selectedProduct) return;

    const orderId = generateOrderId();
    const order: Order = {
      id: orderId,
      productId: selectedProduct.id,
      amount: selectedProduct.price,
      status: 'pending',
      timestamp: Date.now()
    };

    setPendingOrder(order);
    setSecondsElapsed(0);
    
    const paypalUrl = `${PAYPAL_BASE_URL}/${selectedProduct.price}`;
    window.open(paypalUrl, '_blank');
  };

  const checkPaymentStatus = async (orderId: string) => {
    if (isVerifying || !pendingOrder) return;
    setIsVerifying(true);
    setVerificationError(null);

    const separator = VERIFICATION_CSV_URL.includes('?') ? '&' : '?';
    const bust = `cache_bust=${Date.now()}`;
    const targetUrl = `${VERIFICATION_CSV_URL}${separator}${bust}`;

    const fetchMethods = [
      () => fetch(targetUrl, { cache: 'no-store' }),
      () => fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`, { cache: 'no-store' }),
      () => fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`, { cache: 'no-store' })
    ];

    let success = false;
    for (const attemptFetch of fetchMethods) {
      try {
        const response = await attemptFetch();
        if (response.ok) {
          const csvText = await response.text();
          if (csvText.toUpperCase().includes(orderId.toUpperCase())) {
            onSuccess(pendingOrder.productId);
            success = true;
            break; 
          }
        }
      } catch (err) { console.warn(err); }
    }

    if (!success) { setVerificationError("Syncing with PayPal... Please wait."); }
    setIsVerifying(false);
  };

  useEffect(() => {
    if (pendingOrder) {
      pollingRef.current = window.setInterval(() => checkPaymentStatus(pendingOrder.id), 5000);
      timerRef.current = window.setInterval(() => setSecondsElapsed(prev => prev + 1), 1000);
      checkPaymentStatus(pendingOrder.id);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pendingOrder]);

  if (pendingOrder) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
        <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
          <div className="p-8 md:p-12 text-center space-y-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all ${isVerifying ? 'bg-indigo-50 text-indigo-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
              <ICONS.Rocket />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Verifying Activation</h2>
              <p className="text-slate-500 font-medium">Awaiting payment of <strong>${pendingOrder.amount}</strong>. Your account will update instantly.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 text-left space-y-4">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
                <span>Unique Reference</span>
                <span className="text-indigo-600 select-all cursor-copy font-black">{pendingOrder.id}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                1. Complete payment in the PayPal tab.<br/>
                2. <strong>Add {pendingOrder.id} to payment notes.</strong><br/>
                3. Keep this page open while we verify.
              </p>
            </div>
            <button onClick={() => setPendingOrder(null)} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600">Cancel and Return</button>
          </div>
          <div className="bg-slate-900 py-6 text-center text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">SECURE TRANSACTION LAYER</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-[3.5rem] shadow-2xl overflow-hidden border border-white relative flex flex-col lg:flex-row my-auto animate-in zoom-in duration-500">
        <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all z-20 hover:scale-110">×</button>

        <div className="lg:w-2/5 bg-slate-900 p-10 lg:p-14 text-white flex flex-col justify-between space-y-12">
          <div className="space-y-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl"><ICONS.Rocket /></div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tighter leading-none">Activate Success</h2>
              <p className="text-slate-400 text-sm font-bold leading-relaxed">Synthesize high-yield blueprints from 1.5M success patterns.</p>
            </div>
          </div>
          <div className="space-y-10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 border-b border-white/10 pb-4">Wall of Success</h3>
            <div className="space-y-8">
              {SUCCESS_STORIES.map((s, i) => (
                <div key={i} className="space-y-3 p-6 rounded-3xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                  <div className="flex gap-1 mb-2">
                    {[...Array(s.stars)].map((_, i) => <span key={i} className="text-amber-400 text-[10px]">★</span>)}
                  </div>
                  <p className="text-[11px] font-medium text-slate-300 italic">"{s.text}"</p>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{s.name}</div>
                    {s.verified && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md text-[8px] font-black uppercase tracking-widest">Profit Verified</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-3/5 p-10 lg:p-14 flex flex-col justify-between space-y-12 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRODUCTS.map((product) => (
              <div 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`relative p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all flex flex-col justify-between gap-8 ${
                  selectedProduct?.id === product.id ? 'border-indigo-600 bg-white shadow-2xl shadow-indigo-100 scale-[1.03]' : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                {product.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg">Best Value</div>}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{product.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{product.description}</p>
                  </div>
                  <ul className="space-y-3">
                    {product.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 text-[10px] font-bold text-slate-600 leading-relaxed">
                        <div className="text-indigo-600 shrink-0 mt-0.5"><ICONS.Check /></div>{feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-baseline gap-1 pt-6 border-t border-slate-50">
                  <span className="text-4xl font-black text-slate-900">${product.price}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {product.type === 'subscription' ? '/mo' : ' total'}
                  </span>
                </div>
              </div>
            ))}
            
            <div className="p-8 rounded-[2.5rem] border-2 border-slate-100 bg-white flex flex-col justify-center items-center text-center gap-4 hover:border-slate-200 transition-all cursor-pointer">
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Enterprise</h3>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Custom Engine</p>
               <button onClick={() => window.open(`mailto:${SUPPORT_EMAIL}`, '_blank')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline mt-2">Contact Sales</button>
            </div>
          </div>

          <div className="space-y-6">
            <button onClick={handleProceedToPayment} className="w-full py-8 premium-gradient text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[12px] shadow-3xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4">
              Get {selectedProduct?.name} — ${selectedProduct?.price}
            </button>
            
            <div className="relative flex items-center py-2">
               <div className="flex-grow border-t border-slate-200"></div>
               <span className="flex-shrink mx-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">or free reward</span>
               <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button 
              onClick={() => {
                onClose();
                if (onWatchAd) onWatchAd();
              }}
              className="w-full py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-4 shadow-xl shadow-slate-200/50"
            >
              <ICONS.Play /> Watch 2 Ads for +1 Credit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPortal;