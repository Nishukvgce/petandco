package com.eduprajna.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eduprajna.dto.PasswordUpdateRequest;
import com.eduprajna.dto.ProfileDTO;
import com.eduprajna.entity.User;
import com.eduprajna.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "https://nishmitha-pet-co.vercel.app"}, allowCredentials = "true")
public class ProfileController {
    private final UserService userService;
    public ProfileController(UserService userService) { this.userService = userService; }

    // In a real app, derive email/userId from JWT. Here we accept email param for simplicity.
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam("email") String email) {
        return userService.findByEmail(email)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(toProfileDTO(user)))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "User not found")));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestParam("email") String email,
                                          @RequestBody Map<String, Object> profileData) {
        try {
            java.util.Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }
            
            User user = userOpt.get();
            
            // Update user fields from profileData
            if (profileData.containsKey("name") && profileData.get("name") != null) {
                String name = profileData.get("name").toString().trim();
                if (!name.isEmpty()) {
                    user.setName(name);
                }
            }
            
            if (profileData.containsKey("phone") && profileData.get("phone") != null) {
                String rawPhone = profileData.get("phone").toString();
                String normalized = normalizeIndianPhone(rawPhone);
                if (normalized != null) user.setPhone(normalized);
                else user.setPhone(rawPhone);
            }
            
            if (profileData.containsKey("dateOfBirth") && profileData.get("dateOfBirth") != null) {
                String dateStr = profileData.get("dateOfBirth").toString();
                if (!dateStr.isEmpty()) {
                    try {
                        user.setDateOfBirth(java.time.LocalDate.parse(dateStr));
                    } catch (Exception e) {
                        // Log error but continue with other fields
                        System.err.println("Failed to parse date: " + dateStr);
                    }
                }
            }
            
            if (profileData.containsKey("gender") && profileData.get("gender") != null) {
                String gender = profileData.get("gender").toString();
                if (!gender.isEmpty()) {
                    user.setGender(gender);
                }
            }
            
            // Save updated user
            User updatedUser = userService.save(user);
            
            // Return updated profile data
            return ResponseEntity.ok(toProfileDTO(updatedUser));
            
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid profile data: " + e.getMessage()));
        }
    }

    // Normalize Indian phone numbers. Accepts formats like 7892783668, 07892783668, +917892783668
    // Returns normalized string: +91xxxxxxxxxx if input has country code, or 10-digit string otherwise.
    private String normalizeIndianPhone(String input) {
        if (input == null) return null;
        String s = input.trim();
        // Remove spaces, dashes, parentheses
        s = s.replaceAll("[\\s\\-()]+", "");
        if (s.startsWith("+")) {
            // keep + and digits only
            String digits = s.replaceAll("[^+0-9]", "");
            if (digits.startsWith("+91") && digits.length() == 13) return digits;
            // fallback: strip non-digits
            String only = s.replaceAll("\\D", "");
            if (only.length() == 12 && only.startsWith("91")) return "+" + only;
            return null;
        } else {
            String only = s.replaceAll("\\D", "");
            if (only.length() == 10) return only;
            if (only.length() == 11 && only.startsWith("0")) return only.substring(1);
            if (only.length() == 12 && only.startsWith("91")) return only.substring(2);
            return null;
        }
    }

    @PostMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestParam("email") String email,
                                            @Valid @RequestBody PasswordUpdateRequest req) {
        return userService.findByEmail(email).map(user -> {
            // For demo: compare plain text. In production, verify hash.
            if (user.getPasswordHash() == null || !user.getPasswordHash().equals(req.getCurrentPassword())) {
                return ResponseEntity.status(400).body(Map.of("message", "Current password is incorrect"));
            }
            user.setPasswordHash(req.getNewPassword());
            // Optionally track last password change if field exists (not in entity now)
            userService.save(user);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        }).orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "User not found")));
    }

    private ProfileDTO toProfileDTO(User u) {
        ProfileDTO dto = new ProfileDTO();
        dto.id = u.getId();
        dto.name = u.getName();
        dto.email = u.getEmail();
        dto.phone = u.getPhone();
        dto.dateOfBirth = u.getDateOfBirth();
        dto.gender = u.getGender();
        dto.memberSince = u.getMemberSince();
        dto.lastPasswordChange = u.getLastPasswordChange();
        Integer totalOrders = u.getTotalOrders();
        dto.totalOrders = totalOrders != null ? totalOrders : 0;
        dto.totalSpent = 0.0; // Calculate from orders if needed
        Integer loyaltyPoints = u.getLoyaltyPoints();
        dto.loyaltyPoints = loyaltyPoints != null ? loyaltyPoints : 0;
        dto.totalSaved = 0.0; // Calculate from orders if needed
        return dto;
    }
}


