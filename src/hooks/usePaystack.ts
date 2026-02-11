import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => { openIframe: () => void };
    };
  }
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number; // in kobo (NGN * 100)
  ref: string;
  currency: string;
  onClose: () => void;
  callback: (response: PaystackResponse) => void;
}

export interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
}

interface UsePaystackOptions {
  onSuccess: (response: PaystackResponse) => void;
  onClose: () => void;
}

const PAYSTACK_SCRIPT_URL = "https://js.paystack.co/v1/inline.js";

export function usePaystack({ onSuccess, onClose }: UsePaystackOptions) {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Check if already loaded
    if (document.querySelector(`script[src="${PAYSTACK_SCRIPT_URL}"]`)) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement("script");
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove the script on cleanup — it's fine to keep it
    };
  }, []);

  const initializePayment = useCallback(
    (email: string, amountInNaira: number, reference: string) => {
      if (!window.PaystackPop) {
        console.error("Paystack SDK not loaded yet");
        return;
      }

      const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!publicKey) {
        console.error("Paystack public key not configured");
        return;
      }

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount: Math.round(amountInNaira * 100), // Convert to kobo
        ref: reference,
        currency: "NGN",
        callback: onSuccess,
        onClose,
      });

      handler.openIframe();
    },
    [onSuccess, onClose]
  );

  return { initializePayment };
}
