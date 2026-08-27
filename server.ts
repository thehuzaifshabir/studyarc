import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

// Basic Firebase Admin init (placeholder for real credentials setup)
// In production, you'd use GOOGLE_APPLICATION_CREDENTIALS or a service account JSON
try {
  if (process.env.FIREBASE_PROJECT_ID || "mystudyarc-bc892") {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "mystudyarc-bc892"
    });
    console.log("Firebase Admin initialized");
  } else {
    admin.initializeApp();
    console.log("Firebase Admin initialized (default app)");
  }
} catch (e) {
  console.error("Firebase Admin initialization error", e);
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mock payment endpoint
app.post("/api/payments/create", (req, res) => {
  const { amount, productId, productType, userId } = req.body;
  // In a real app, this would call Razorpay/Stripe API
  res.json({ 
    success: true, 
    orderId: `order_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    amount,
    currency: "INR"
  });
});

app.post("/api/payments/verify", async (req, res) => {
  const { orderId, paymentId, status, userId, productId, productType } = req.body;
  // In a real app, verify signature with payment gateway secret
  if (status === "success") {
    // 1. Create order record
    try {
      const db = getFirestore();
      
      const orderRef = db.collection('orders').doc(orderId);
      await orderRef.set({
        userId,
        productId,
        productType,
        amount: req.body.amount || 0,
        currency: "INR",
        status: "paid",
        gatewayReferenceId: paymentId,
        createdAt: new Date().toISOString()
      });

      // 2. Grant entitlement if it's a product
      if (productType !== "donation") {
        const entitlementRef = db.collection('entitlements').doc(`${userId}_${productId}`);
        await entitlementRef.set({
          userId,
          productId,
          productType,
          orderId,
          createdAt: new Date().toISOString()
        });
      }
      
      res.json({ success: true, message: "Payment verified and entitlement granted" });
    } catch (e: any) {
      console.error("Error processing payment success:", e);
      res.status(500).json({ success: false, message: e.message });
    }
  } else {
    res.json({ success: false, message: "Payment failed" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
