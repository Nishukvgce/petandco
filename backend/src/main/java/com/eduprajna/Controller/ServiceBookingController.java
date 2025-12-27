package com.eduprajna.Controller;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eduprajna.dto.ServiceBookingDTO;
import com.eduprajna.service.ServiceBookingService;

@RestController
@RequestMapping("/api/service-bookings")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173", "https://nishmitha-pet-co.vercel.app", "https://pet-cotraditional.in", "https://www.pet-cotraditional.in"}, allowCredentials = "true")
public class ServiceBookingController {

    @Autowired
    private ServiceBookingService serviceBookingService;

    // Create a new service booking
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody ServiceBookingDTO bookingDTO) {
        try {
            System.out.println("[DEBUG] Controller: Received booking request for pet: " + (bookingDTO.getPetName() != null ? bookingDTO.getPetName() : "null") + ", service: " + (bookingDTO.getServiceName() != null ? bookingDTO.getServiceName() : "null"));
            System.out.println("[DEBUG] Controller: Service type: " + bookingDTO.getServiceType());
            System.out.println("[DEBUG] Controller: Owner: " + bookingDTO.getOwnerName());
            System.out.println("[DEBUG] Controller: Phone: " + bookingDTO.getPhone());
            System.out.println("[DEBUG] Controller: Address: " + bookingDTO.getAddress());
            
            // Validate required fields
            StringBuilder missingFields = new StringBuilder();
            if (bookingDTO.getPetName() == null || bookingDTO.getPetName().trim().isEmpty()) {
                missingFields.append("petName ");
            }
            if (bookingDTO.getOwnerName() == null || bookingDTO.getOwnerName().trim().isEmpty()) {
                missingFields.append("ownerName ");
            }
            if (bookingDTO.getPhone() == null || bookingDTO.getPhone().trim().isEmpty()) {
                missingFields.append("phone ");
            }
            if (bookingDTO.getServiceName() == null || bookingDTO.getServiceName().trim().isEmpty()) {
                missingFields.append("serviceName ");
            }
            if (bookingDTO.getServiceType() == null || bookingDTO.getServiceType().trim().isEmpty()) {
                missingFields.append("serviceType ");
            }
            if (bookingDTO.getAddress() == null || bookingDTO.getAddress().trim().isEmpty()) {
                missingFields.append("address ");
            }
            if (bookingDTO.getPreferredDate() == null) {
                missingFields.append("preferredDate ");
            }
            if (bookingDTO.getPreferredTime() == null || bookingDTO.getPreferredTime().trim().isEmpty()) {
                missingFields.append("preferredTime ");
            }
            
            if (missingFields.length() > 0) {
                System.err.println("[ERROR] Controller: Missing required fields: " + missingFields.toString());
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Required fields are missing: " + missingFields.toString()
                ));
            }

            // Special validation for pet walking service
            if ("pet-walking".equals(bookingDTO.getServiceType())) {
                System.out.println("[DEBUG] Controller: Processing pet walking service");
                System.out.println("[DEBUG] Controller: Pet photo provided: " + (bookingDTO.getPetPhotoBase64() != null && !bookingDTO.getPetPhotoBase64().isEmpty()));
                System.out.println("[DEBUG] Controller: GPS coordinates: lat=" + bookingDTO.getGpsLatitude() + ", lng=" + bookingDTO.getGpsLongitude());
                System.out.println("[DEBUG] Controller: Address components: area=" + bookingDTO.getArea() + ", city=" + bookingDTO.getCityStateCountry());
                
                if (bookingDTO.getBasePrice() == null || bookingDTO.getBasePrice() <= 0) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Base price is required for pet walking service"
                    ));
                }
                if (bookingDTO.getTotalAmount() == null || bookingDTO.getTotalAmount() <= 0) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Total amount is required for pet walking service"
                    ));
                }
                
                // Validate essential address components for walking service
                if (bookingDTO.getArea() == null || bookingDTO.getArea().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Area is required for pet walking service location"
                    ));
                }
                
                if (bookingDTO.getCityStateCountry() == null || bookingDTO.getCityStateCountry().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "City/State/Country is required for pet walking service"
                    ));
                }
            }

            // Check if the booking date is not in the past
            if (bookingDTO.getPreferredDate().isBefore(LocalDate.now())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Booking date cannot be in the past"
                ));
            }

            ServiceBookingDTO savedBooking = serviceBookingService.createBooking(bookingDTO);
            System.out.println("[DEBUG] Controller: Successfully created booking with ID: " + savedBooking.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Booking created successfully",
                "booking", savedBooking,
                "bookingId", savedBooking.getId()
            ));
        } catch (Exception e) {
            System.err.println("[ERROR] Controller: Error creating booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error creating booking: " + e.getMessage(),
                "error", e.toString()
            ));
        }
    }

    // Get all service bookings (Admin only)
    @GetMapping
    public ResponseEntity<?> getAllBookings() {
        try {
            List<ServiceBookingDTO> bookings = serviceBookingService.getAllBookings();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "bookings", bookings
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error fetching bookings: " + e.getMessage()
            ));
        }
    }

    // Get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            Optional<ServiceBookingDTO> booking = serviceBookingService.getBookingById(id);
            if (booking.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "booking", booking.get()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Booking not found"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error fetching booking: " + e.getMessage()
            ));
        }
    }

    // Update booking status (Admin only)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String status = statusUpdate.get("status");
            String notes = statusUpdate.get("notes");

            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Status is required"
                ));
            }

            // Validate status values
            if (!List.of("PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED").contains(status)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid status value"
                ));
            }

            Optional<ServiceBookingDTO> updatedBooking = serviceBookingService.updateBookingStatus(id, status, notes);
            if (updatedBooking.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Booking status updated successfully",
                    "booking", updatedBooking.get()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Booking not found"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error updating booking: " + e.getMessage()
            ));
        }
    }

    // Get bookings by status
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getBookingsByStatus(@PathVariable String status) {
        try {
            List<ServiceBookingDTO> bookings = serviceBookingService.getBookingsByStatus(status.toUpperCase());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "bookings", bookings
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error fetching bookings: " + e.getMessage()
            ));
        }
    }

    // Get upcoming bookings
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingBookings() {
        try {
            List<ServiceBookingDTO> bookings = serviceBookingService.getUpcomingBookings();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "bookings", bookings
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error fetching upcoming bookings: " + e.getMessage()
            ));
        }
    }

    // Get bookings by date
    @GetMapping("/date/{date}")
    public ResponseEntity<?> getBookingsByDate(@PathVariable String date) {
        try {
            LocalDate localDate = LocalDate.parse(date);
            List<ServiceBookingDTO> bookings = serviceBookingService.getBookingsByDate(localDate);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "bookings", bookings
            ));
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Invalid date format. Use YYYY-MM-DD"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error fetching bookings: " + e.getMessage()
            ));
        }
    }

    // Get bookings for a specific user (by userId, email or phone)
    @GetMapping("/by-user")
    public ResponseEntity<?> getBookingsForUser(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone) {
        try {
            List<ServiceBookingDTO> bookings = serviceBookingService.getBookingsForUser(userId, email, phone);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "bookings", bookings
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Error fetching user bookings: " + e.getMessage()
            ));
        }
    }

    // Get bookings for a user filtered by service type keyword (walking/boarding/grooming)
    @GetMapping("/by-user/type")
    public ResponseEntity<?> getBookingsForUserByType(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam String type) {
        try {
            List<ServiceBookingDTO> bookings = serviceBookingService.getBookingsForUserByType(userId, email, phone, type);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "bookings", bookings
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Error fetching user bookings: " + e.getMessage()
            ));
        }
    }

    // Search bookings
    @GetMapping("/search")
    public ResponseEntity<?> searchBookings(@RequestParam String q) {
        try {
            List<ServiceBookingDTO> bookings = serviceBookingService.searchBookings(q);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "bookings", bookings
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error searching bookings: " + e.getMessage()
            ));
        }
    }

    // Get booking statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getBookingStats() {
        try {
            ServiceBookingService.BookingStats stats = serviceBookingService.getBookingStats();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "stats", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error fetching booking statistics: " + e.getMessage()
            ));
        }
    }
    
    // Test endpoint to verify database connectivity
    @GetMapping("/test-db")
    public ResponseEntity<?> testDatabase() {
        try {
            long count = serviceBookingService.getAllBookings().size();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Database connection successful",
                "totalBookings", count
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Database connection failed: " + e.getMessage()
            ));
        }
    }

    // Test endpoint - create a minimal booking to test database
    @PostMapping("/test-create")
    public ResponseEntity<Map<String, Object>> testCreateBooking() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Create a minimal test booking
            ServiceBookingDTO testBooking = new ServiceBookingDTO();
            testBooking.setPetName("Test Pet");
            testBooking.setPetType("dog");
            testBooking.setOwnerName("Test Owner");
            testBooking.setPhone("1234567890");
            testBooking.setAddress("Test Address");
            testBooking.setServiceName("Test Service");
            testBooking.setServiceType("test");
            testBooking.setBasePrice(100.0);
            testBooking.setTotalAmount(100.0);
            testBooking.setPreferredDate(LocalDate.now().plusDays(1));
            testBooking.setPreferredTime("10:00 AM");
            
            ServiceBookingDTO savedBooking = serviceBookingService.createBooking(testBooking);
            
            response.put("success", true);
            response.put("message", "Test booking created successfully");
            response.put("bookingId", savedBooking.getId());
            response.put("booking", savedBooking);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create test booking: " + e.getMessage());
            response.put("error", e.toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get pet walking bookings specifically
    @GetMapping("/pet-walking")
    public ResponseEntity<?> getPetWalkingBookings() {
        try {
            List<ServiceBookingDTO> walkingBookings = serviceBookingService.getPetWalkingBookings();
            Long walkingCount = serviceBookingService.countPetWalkingBookings();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "bookings", walkingBookings,
                "totalWalkingBookings", walkingCount,
                "message", "Retrieved " + walkingBookings.size() + " pet walking bookings"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error retrieving pet walking bookings: " + e.getMessage()
            ));
        }
    }

    // Test endpoint - create a pet walking booking specifically
    @PostMapping("/test-pet-walking")
    public ResponseEntity<Map<String, Object>> testCreatePetWalkingBooking() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Create a test pet walking booking
            ServiceBookingDTO walkingBooking = new ServiceBookingDTO();
            walkingBooking.setPetName("Test Dog Walker");
            walkingBooking.setPetType("dog");
            walkingBooking.setOwnerName("Walking Test Owner");
            walkingBooking.setPhone("9876543210");
            walkingBooking.setAddress("123 Walk Street, Test City");
            walkingBooking.setServiceName("Pet Walking - 30min");
            walkingBooking.setServiceType("pet-walking");
            walkingBooking.setBasePrice(150.0);
            walkingBooking.setTotalAmount(150.0);
            walkingBooking.setPreferredDate(LocalDate.now().plusDays(1));
            walkingBooking.setPreferredTime("9:00 AM");
            walkingBooking.setSpecialInstructions("Test walking booking");
            
            System.out.println("[DEBUG] Creating test pet walking booking...");
            ServiceBookingDTO savedBooking = serviceBookingService.createBooking(walkingBooking);
            
            response.put("success", true);
            response.put("message", "Pet walking booking created successfully");
            response.put("bookingId", savedBooking.getId());
            response.put("booking", savedBooking);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to create pet walking test booking: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to create pet walking booking: " + e.getMessage());
            response.put("error", e.toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Delete booking (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        try {
            boolean deleted = serviceBookingService.deleteBooking(id);
            if (deleted) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Booking deleted successfully"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Booking not found"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error deleting booking: " + e.getMessage()
            ));
        }
    }
}