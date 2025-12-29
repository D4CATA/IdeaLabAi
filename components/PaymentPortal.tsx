
import React, { useState, useEffect, useRef } from 'react';
import { ICONS, PRODUCTS, PAYPAL_BASE_URL, VERIFICATION_CSV_URL, SUPPORT_EMAIL } from '../constants';
import { Product, Order } from '../types';

interface PaymentPortalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentPortal: React.FC<PaymentPortalProps> = ({ onClose, onSuccess }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
    
    // Open PayPal in new tab
    const paypalUrl = `${PAYPAL_BASE_URL}/${selectedProduct.price}`;
    window.open(paypalUrl, '_blank');
  };

  const checkPaymentStatus = async (orderId: string) => {
    if (isVerifying) return;
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
            console.log("Success: Payment verified for", orderId);
            onSuccess();
            success = true;
            break; 
          }
          break;
        }
      } catch (err) {
        console.warn("Attempt failed, trying next method...", err);
      }
    }

    if (!success) {
      setVerificationError("System: Polling for your transaction ID...");
    }
    
    setIsVerifying(false);
  };

  useEffect(() => {
    if (pendingOrder) {
      pollingRef.current = window.setInterval(() => {
        checkPaymentStatus(pendingOrder.id);
      }, 5000);

      timerRef.current = window.setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);

      checkPaymentStatus(pendingOrder.id);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pendingOrder]);

  if (pendingOrder) {
    const takingLonger = secondsElapsed > 60;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
          <div className="p-8 md:p-12 text-center space-y-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all duration-500 ${isVerifying ? 'bg-indigo-50 text-indigo-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
              <ICONS.Rocket />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Verification Active
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                Waiting for payment of <span className="text-slate-900 font-bold">${pendingOrder.amount}</span>.
                <br/>The database will unlock <span className="text-indigo-600 font-bold">automatically</span> once confirmed.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 space-y-4 text-left">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
                <span>Unique Reference</span>
                <span className="text-indigo-600 font-black select-all cursor-copy">{pendingOrder.id}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                1. Complete your payment in the PayPal tab.<br/>
                2. <span className="text-red-600 font-black">IMPORTANT:</span> Put <span className="text-slate-900 font-black">{pendingOrder.id}</span> in the payment notes.<br/>
                3. <span className="text-slate-900 font-black">STAY ON THIS PAGE.</span> We check for your ID every 5 seconds.
              </p>
              
              <div className="flex items-center gap-3 py-2 px-4 bg-white rounded-xl border border-slate-100">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                   {isVerifying ? "Syncing Database Access..." : "Awaiting Confirmation..."}
                 </span>
              </div>
            </div>

            {takingLonger && (
              <div className="p-6 rounded-[1.5rem] bg-amber-50 border border-amber-100 text-left animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <ICONS.Shield />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-900">Taking longer?</h4>
                </div>
                <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                  Verification usually takes 1-3 minutes. If you already paid, check you included the note: <span className="font-black underline">{pendingOrder.id}</span>.
                  <br/><br/>
                  Still stuck? Reach out to <a href={`mailto:${SUPPORT_EMAIL}`} className="underline font-black">{SUPPORT_EMAIL}</a> with your ID.
                </p>
              </div>
            )}

            {!takingLonger && verificationError && (
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                {verificationError}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setPendingOrder(null)}
                className="text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
              >
                Go Back to Selection
              </button>
            </div>
          </div>
          
          <div className="bg-slate-900 py-6 text-center text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
            IDEA LAB AI // DO NOT REFRESH 📡
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-[#f8fafc] w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden border border-white relative flex flex-col md:flex-row my-auto animate-in zoom-in duration-500">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all z-10 hover:scale-110 active:scale-90"
        >
          <span className="text-xl">×</span>
        </button>

        <div className="md:w-1/3 bg-slate-900 p-10 md:p-12 text-white flex flex-col justify-between space-y-12">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl rotate-3">
              <ICONS.Rocket />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter leading-none">Unlock Success</h2>
              <p className="text-slate-400 text-sm font-bold leading-relaxed">
                Unlock our 1.5 million app ideas for success and start your journey.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 group cursor-default">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <ICONS.Shield />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Verified Access</span>
            </div>
            <div className="flex items-center gap-4 group cursor-default">
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <ICONS.Sparkles />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Infinite Blueprints</span>
            </div>
          </div>

          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest pt-8 border-t border-white/10">
            Powered by Idea Lab AI 9.0
          </div>
        </div>

        <div className="md:w-2/3 p-10 md:p-12 flex flex-col justify-between space-y-12">
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRODUCTS.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`relative p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between gap-6 hover:shadow-xl hover:scale-[1.02] ${
                    selectedProduct?.id === product.id 
                    ? 'border-indigo-600 bg-white shadow-indigo-100/50' 
                    : 'border-slate-100 bg-white hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {product.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg animate-bounce">
                      Best Value
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">{product.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{product.description}</p>
                    </div>
                    
                    <ul className="space-y-2">
                      {product.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                          <span className="text-indigo-600"><ICONS.Check /></span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">${product.price}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">USD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <button 
              onClick={handleProceedToPayment}
              disabled={!selectedProduct}
              className="w-full py-6 premium-gradient text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <ICONS.Shield />
              {selectedProduct 
                ? `Upgrade to ${selectedProduct.name} — $${selectedProduct.price}` 
                : 'Select a Tier to Continue'}
            </button>
            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
              Secured by PayPal Payments // System Sync Enabled
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentPortal;
