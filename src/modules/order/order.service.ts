/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Request } from 'express';
import { config } from '../../config/env.js';

const createPayment = async (req: Request) => {
const { amount, orderId, user } = req.body;
  try {
    const url = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
    const payload = new URLSearchParams({
      store_id: config.SSLCOMMERCE_STORE_ID,
      store_passwd: config.SSLCOMMERCE_STORE_PASSWORD,
      total_amount: amount,
      currency: "BDT",
      tran_id: orderId,
      success_url: `${config.FRONTEND_URL}/payment/success`,
      fail_url: `${config.FRONTEND_URL}/payment/fail`,
      cancel_url: `${config.FRONTEND_URL}/payment/cancel`,
      ipn_url: `http://localhost:5000/api/v1/order/validate-ipn`,

      multi_card_name: "qcash bkash",

      cus_email: user.email,
      cus_phone: user.phone,
      cus_add1: "N/A",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",

      shipping_method: "NO",

      product_name: "Watch, Bag, Camera, Laptop, Mobile",
      product_category: "Electronic or topup or bus ticket or air ticket",
      product_profile: "general",

      store_logo: "https://www.alamy.com/stock-photo/my-letter-logo-design.html?imgt=8",
      store_banner: "https://www.alamy.com/stock-photo/my-letter-logo-design.html?imgt=8",
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    });
    if (!response.ok) {throw new Error("Failed to create payment");};
    const data = await response.json() as { GatewayPageURL: string };
    return {
      gatewayPageURL: data.GatewayPageURL,
      orderId,
    };
  } catch (_error : unknown) {
    throw new Error("Failed to create payment");
  }
};

const validateIPN = async (req: Request) => {
  const { tran_id, val_id } = req.body;
  console.log("IPN req data : ", {tran_id, val_id});
};

export const orderService = {
 createPayment,
 validateIPN
};
