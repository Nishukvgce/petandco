package com.eduprajna.service;

import com.eduprajna.dto.ServiceBookingDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Value("${app.email.from:PET&CO <noreply@pet-co.com>}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendServiceBookingConfirmation(ServiceBookingDTO booking) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(booking.getEmail());
        helper.setSubject("🎉 Your Pet Grooming Appointment is Confirmed - PET&CO");

        String htmlContent = createBookingConfirmationHtml(booking);
        helper.setText(htmlContent, true);

        emailSender.send(message);
    }

    private String createBookingConfirmationHtml(ServiceBookingDTO booking) {
        String dashboardUrl = frontendUrl + "/user-account-dashboard";
        
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Booking Confirmed - PET&CO</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        margin: 0;
                        padding: 0;
                        background-color: #f8f9fa;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                        color: white;
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                    }
                    .header p {
                        margin: 10px 0 0 0;
                        font-size: 16px;
                        opacity: 0.9;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .booking-details {
                        background: #f8fafc;
                        border-radius: 8px;
                        padding: 24px;
                        margin: 24px 0;
                        border-left: 4px solid #6366f1;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;
                        padding: 8px 0;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                        margin-bottom: 0;
                    }
                    .detail-label {
                        font-weight: 600;
                        color: #475569;
                    }
                    .detail-value {
                        color: #1e293b;
                        font-weight: 500;
                    }
                    .cta-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                        color: white !important;
                        text-decoration: none;
                        padding: 16px 32px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 16px;
                        text-align: center;
                        margin: 24px 0;
                        transition: transform 0.2s;
                    }
                    .cta-button:hover {
                        transform: translateY(-2px);
                    }
                    .footer {
                        background: #f1f5f9;
                        padding: 30px;
                        text-align: center;
                        border-top: 1px solid #e2e8f0;
                    }
                    .footer p {
                        margin: 5px 0;
                        color: #64748b;
                        font-size: 14px;
                    }
                    .highlight {
                        color: #6366f1;
                        font-weight: 600;
                    }
                    .price {
                        font-size: 20px;
                        font-weight: 700;
                        color: #059669;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Booking Confirmed!</h1>
                        <p>Your pet's grooming appointment is all set</p>
                    </div>
                    
                    <div class="content">
                        <p>Hello <strong>%s</strong>,</p>
                        
                        <p>Great news! Your pet grooming appointment has been <span class="highlight">confirmed</span>. We're excited to pamper <strong>%s</strong>!</p>
                        
                        <div class="booking-details">
                            <h3 style="margin-top: 0; color: #1e293b;">📋 Appointment Details</h3>
                            
                            <div class="detail-row">
                                <span class="detail-label">🐾 Pet Name:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">🐱/🐶 Pet Type:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">✨ Service:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">📅 Date:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">🕐 Time:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">💰 Total Amount:</span>
                                <span class="detail-value price">₹%,.2f</span>
                            </div>
                        </div>
                        
                        <p>Our grooming experts will take excellent care of your furry friend. We'll contact you if we need any additional information.</p>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="%s" class="cta-button">
                                📱 View My Dashboard
                            </a>
                        </div>
                        
                        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                            <p style="margin: 0; color: #92400e;"><strong>📍 Important:</strong> Please bring your pet 10-15 minutes early for the appointment. If you need to reschedule, please contact us at least 24 hours in advance.</p>
                        </div>
                        
                        <p>Thank you for choosing <strong>PET&CO</strong> for your pet's grooming needs!</p>
                        
                        <p>Best regards,<br>
                        <strong>The PET&CO Team</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p><strong>PET&CO - Premium Pet Care Services</strong></p>
                        <p>📞 Contact us: +91-XXXXXXXXXX | ✉️ support@pet-co.com</p>
                        <p>🌐 Visit: <a href="%s" style="color: #6366f1;">www.pet-co.com</a></p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                booking.getOwnerName(),
                booking.getPetName(),
                booking.getPetName(),
                booking.getPetType().substring(0, 1).toUpperCase() + booking.getPetType().substring(1),
                booking.getServiceName(),
                booking.getPreferredDate().toString(),
                booking.getPreferredTime(),
                booking.getTotalAmount(),
                dashboardUrl,
                frontendUrl
            );
    }
}