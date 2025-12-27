package com.eduprajna.service;

import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;

@Service
public class RazorpayService {

    private final RazorpayClient client;
    private final String keySecret;

    public RazorpayService(@Value("${razorpay.keyId:}") String keyId,
                          @Value("${razorpay.keySecret:}") String keySecret) {
        this.keySecret = keySecret;
        if (keyId == null || keyId.isEmpty() || keySecret == null || keySecret.isEmpty()) {
            this.client = null;
        } else {
            try {
                this.client = new RazorpayClient(keyId, keySecret);
            } catch (RazorpayException e) {
                throw new RuntimeException("Failed to initialize Razorpay client", e);
            }
        }
    }

    public Map<String, Object> createOrder(long amountPaise, String currency, String receipt) throws Exception {
        if (client == null) {
            throw new IllegalStateException("Razorpay client not configured");
        }

        JSONObject options = new JSONObject();
        options.put("amount", amountPaise);
        options.put("currency", currency);
        options.put("receipt", receipt);
        options.put("payment_capture", 1);

        // The Razorpay SDK exposes the Orders API via the 'orders' field on RazorpayClient
        Order order = client.Orders.create(options);

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", order.get("id"));
        resp.put("amount", order.get("amount"));
        resp.put("currency", order.get("currency"));
        resp.put("receipt", order.get("receipt"));
        return resp;
    }

    public boolean verifySignature(String razorpayPaymentId, String razorpayOrderId, String razorpaySignature) throws Exception {
        if (client == null) throw new IllegalStateException("Razorpay client not configured");

        JSONObject attrs = new JSONObject();
        attrs.put("razorpay_payment_id", razorpayPaymentId);
        attrs.put("razorpay_order_id", razorpayOrderId);
        attrs.put("razorpay_signature", razorpaySignature);

        // will throw exception if verification fails
        Utils.verifyPaymentSignature(attrs, this.keySecret);
        return true;
    }
}