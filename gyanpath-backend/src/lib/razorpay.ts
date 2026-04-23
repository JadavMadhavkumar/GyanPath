import Razorpay from 'razorpay';
import { config } from '../config';

let razorpayInstance: Razorpay | null = null;

/**
 * Get Razorpay instance
 */
export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }

  return razorpayInstance;
}

export default getRazorpay;
