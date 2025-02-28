"use client";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { createOrder } from "../lib/supabase";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Layout from "./layout/Layout";
import { createPaymentIntent } from '../lib/stripe';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { cart = [], userId } = location.state || {};
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = cart.length > 0 
    ? cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    : 0;

  const handleOnlinePayment = async () => {
    if (!userId) {
      toast.error("Please log in to make a payment");
      return;
    }

    if (!stripe || !elements) {
      toast.error("Payment system not loaded");
      return;
    }

    setIsProcessing(true);
    try {
      const clientSecret = await createPaymentIntent(totalAmount * 100, {
        userId,
        orderDate: new Date().toISOString(),
      });

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card input not found");
      }

      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: "User",
            email: "user@example.com",
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === "succeeded") {
        await createOrder({
          payment_id: paymentIntent.id,
          amount: totalAmount,
          items: cart,
          user_id: userId,
        }, cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })));
        
        toast.success("Order placed successfully");
        navigate('/', { state: { orderPlaced: true, amount: totalAmount } });
      } else {
        throw new Error("Payment not completed successfully");
      }
    } catch (error) {
      toast.error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashOnDelivery = async () => {
    if (!userId) {
      toast.error("Please log in to place an order");
      return;
    }

    setIsProcessing(true);
    try {
      await createOrder({
        payment_method: "cash",
        amount: totalAmount,
        items: cart,
        user_id: userId,
      }, cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })));
      toast.success("Order placed successfully");
      navigate('/', { state: { orderPlaced: true, amount: totalAmount } });
    } catch (error) {
      toast.error("Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (selectedPaymentMethod === "online") await handleOnlinePayment();
    else if (selectedPaymentMethod === "cod") await handleCashOnDelivery();
  };

  if (!cart || cart.length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Checkout</h1>
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <p className="text-gray-600 text-sm sm:text-base">Your cart is empty. Please add items to proceed with checkout.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Order Summary</h2>
            <div className="bg-white shadow rounded-lg p-4 sm:p-6">
              {cart.map((item) => (
                <div key={item.product.id} className="flex flex-col sm:flex-row justify-between mb-3 sm:mb-4">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="font-medium text-sm sm:text-base">{item.product.name}</h3>
                    <p className="text-gray-500 text-xs sm:text-sm">x {item.quantity}</p>
                  </div>
                  <p className="text-sm sm:text-base">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
                <div className="flex justify-between font-semibold text-sm sm:text-base">
                  <span>Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Payment Method</h2>
            <div className="bg-white shadow rounded-lg p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <label className="flex items-center space-x-2 sm:space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={selectedPaymentMethod === "online"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-indigo-600"
                    disabled={isProcessing}
                  />
                  <span className="text-sm sm:text-base">Pay Online</span>
                </label>
                {selectedPaymentMethod === "online" && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 border rounded-md">
                    <CardElement 
                      options={{
                        style: {
                          base: {
                            fontSize: '14px sm:16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#9e2146',
                          },
                        },
                        disabled: isProcessing,
                      }}
                    />
                  </div>
                )}
                <label className="flex items-center space-x-2 sm:space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={selectedPaymentMethod === "cod"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-indigo-600"
                    disabled={isProcessing}
                  />
                  <span className="text-sm sm:text-base">Cash on Delivery</span>
                </label>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="mt-4 sm:mt-6 w-full bg-indigo-600 text-white py-2 sm:py-2 px-3 sm:px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 text-sm sm:text-base"
                disabled={!selectedPaymentMethod || isProcessing}
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const CheckoutWithStripe = () => {
  return (
    <Elements stripe={stripePromise}>
      <Checkout />
    </Elements>
  );
};

export default CheckoutWithStripe;