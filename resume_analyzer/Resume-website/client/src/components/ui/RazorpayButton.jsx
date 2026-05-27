import { useState } from "react";
import axios from "axios";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const RazorpayButton = ({ plan, btnStyle, label }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
      console.log("[RazorpayButton] Using API URL:", apiUrl);
      console.log("[RazorpayButton] JWT token:", token);
      if (!token) {
        alert("Please login first to upgrade your plan!");
        window.location.href = "/login";
        return;
      }

      // Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert(
          "Failed to load payment gateway. Please check your internet connection.",
        );
        return;
      }

      // Create order from backend
      let data;
      try {
        const res = await axios.post(
          `${apiUrl}/api/payment/create-order`,
          { plan },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        data = res.data;
      } catch (err) {
        console.error("[RazorpayButton] create-order error:", err);
        if (err.response) {
          alert(
            `Order creation failed: ${err.response.data.message || err.response.statusText}`,
          );
        } else {
          alert("Order creation failed: Network or server error.");
        }
        setLoading(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ATSify",
        description: data.planName,
        image: "/vite.svg",
        order_id: data.orderId,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyRes = await axios.post(
              `${apiUrl}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );

            if (verifyRes.data.success) {
              alert(`🎉 Payment successful! ${data.planName} activated.`);
              window.location.href = "/dashboard";
            }
          } catch (err) {
            console.error("[RazorpayButton] verify error:", err);
            if (err.response) {
              alert(
                `Payment verification failed: ${err.response.data.message || err.response.statusText}`,
              );
            } else {
              alert("Payment verification failed: Network or server error.");
            }
          }
        },
        prefill: {},
        theme: {
          color: plan === "pro" ? "#f59e0b" : "#2563eb",
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error("[RazorpayButton] Unexpected error:", err);
      if (err.response) {
        alert(
          `Payment error: ${err.response.data.message || err.response.statusText}`,
        );
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
      style={btnStyle}
    >
      {loading ? "Processing..." : label}
    </button>
  );
};

export default RazorpayButton;
