package com.eduprajna.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "checkout_selections")
public class CheckoutSelection {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column
    private Long addressId; // selected Address id

    @Column(nullable = false)
    private String deliveryOption; // standard, express

    @Column(nullable = false)
    private String paymentMethod; // cod, card, upi, wallet, online

    @Column(nullable = true)
    private Double subtotal; // Cart subtotal at checkout time

    @Column(nullable = true)
    private Double shippingFee; // Shipping fee at checkout time

    @Column(nullable = true)
    private Double total; // Total amount at checkout time

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Long getAddressId() { return addressId; }
    public void setAddressId(Long addressId) { this.addressId = addressId; }
    public String getDeliveryOption() { return deliveryOption; }
    public void setDeliveryOption(String deliveryOption) { this.deliveryOption = deliveryOption; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
    public Double getShippingFee() { return shippingFee; }
    public void setShippingFee(Double shippingFee) { this.shippingFee = shippingFee; }
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
}


