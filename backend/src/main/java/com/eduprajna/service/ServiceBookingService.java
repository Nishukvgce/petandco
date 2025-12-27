package com.eduprajna.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eduprajna.dto.ServiceBookingDTO;
import com.eduprajna.entity.ServiceBooking;
import com.eduprajna.entity.User;
import com.eduprajna.repository.ServiceBookingRepository;
import com.eduprajna.repository.UserRepository;

@Service
@Transactional
public class ServiceBookingService {

    @Autowired
    private ServiceBookingRepository serviceBookingRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileUploadService fileUploadService;

    // Create a new service booking
    public ServiceBookingDTO createBooking(ServiceBookingDTO bookingDTO) {
        try {
            System.out.println("[DEBUG] Creating booking with DTO: " + (bookingDTO.getPetName() != null ? bookingDTO.getPetName() : "null") + ", " + (bookingDTO.getServiceName() != null ? bookingDTO.getServiceName() : "null"));
            System.out.println("[DEBUG] Service Type: " + bookingDTO.getServiceType());
            System.out.println("[DEBUG] Owner Name: " + bookingDTO.getOwnerName());
            System.out.println("[DEBUG] Phone: " + bookingDTO.getPhone());
            System.out.println("[DEBUG] Address: " + bookingDTO.getAddress());
            
            // Validate required fields
            if (bookingDTO.getPetName() == null || bookingDTO.getPetName().trim().isEmpty()) {
                throw new IllegalArgumentException("Pet name is required");
            }
            if (bookingDTO.getOwnerName() == null || bookingDTO.getOwnerName().trim().isEmpty()) {
                throw new IllegalArgumentException("Owner name is required");
            }
            if (bookingDTO.getPhone() == null || bookingDTO.getPhone().trim().isEmpty()) {
                throw new IllegalArgumentException("Phone number is required");
            }
            if (bookingDTO.getServiceName() == null || bookingDTO.getServiceName().trim().isEmpty()) {
                throw new IllegalArgumentException("Service name is required");
            }
            
            ServiceBooking booking = convertToEntity(bookingDTO);
            System.out.println("[DEBUG] Converted to entity: " + (booking.getPetName() != null ? booking.getPetName() : "null") + ", " + (booking.getServiceName() != null ? booking.getServiceName() : "null"));
            System.out.println("[DEBUG] Entity Service Type: " + booking.getServiceType());
            System.out.println("[DEBUG] Entity Address: " + booking.getAddress());
            
            // Validate entity before saving
            if (booking.getAddress() == null || booking.getAddress().trim().isEmpty()) {
                throw new IllegalArgumentException("Address is required for database constraint");
            }
            if (booking.getPetType() == null || booking.getPetType().trim().isEmpty()) {
                throw new IllegalArgumentException("Pet type is required for database constraint");
            }
            if (booking.getServiceType() == null || booking.getServiceType().trim().isEmpty()) {
                throw new IllegalArgumentException("Service type is required for database constraint");
            }
            if (booking.getPreferredTime() == null || booking.getPreferredTime().trim().isEmpty()) {
                throw new IllegalArgumentException("Preferred time is required for database constraint");
            }
            
            System.out.println("[DEBUG] All validations passed, saving to database...");
            ServiceBooking savedBooking = serviceBookingRepository.save(booking);
            System.out.println("[DEBUG] Saved booking with ID: " + savedBooking.getId());
            
            // Log saved booking details for verification
            System.out.println("[DEBUG] Saved booking details:");
            System.out.println("  - ID: " + savedBooking.getId());
            System.out.println("  - Pet Name: " + savedBooking.getPetName());
            System.out.println("  - Owner Name: " + savedBooking.getOwnerName());
            System.out.println("  - Service: " + savedBooking.getServiceName());
            System.out.println("  - Service Type: " + savedBooking.getServiceType());
            System.out.println("  - Status: " + savedBooking.getStatus());
            System.out.println("  - Total Amount: " + savedBooking.getTotalAmount());
            
            ServiceBookingDTO result = convertToDTO(savedBooking);
            System.out.println("[DEBUG] Returning DTO with ID: " + result.getId());
            return result;
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to save booking: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save booking: " + e.getMessage(), e);
        }
    }

    // Get all service bookings
    public List<ServiceBookingDTO> getAllBookings() {
        return serviceBookingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .filter(dto -> dto != null) // Filter out null DTOs
                .collect(Collectors.toList());
    }

    // Get booking by ID
    public Optional<ServiceBookingDTO> getBookingById(Long id) {
        return serviceBookingRepository.findById(id)
                .map(this::convertToDTO);
    }

    // Update booking status
    public Optional<ServiceBookingDTO> updateBookingStatus(Long id, String status, String notes) {
        return serviceBookingRepository.findById(id)
                .map(booking -> {
                    String previousStatus = booking.getStatus();
                    booking.setStatus(status);
                    if (notes != null) {
                        booking.setNotes(notes);
                    }
                    ServiceBooking savedBooking = serviceBookingRepository.save(booking);
                    ServiceBookingDTO dto = convertToDTO(savedBooking);
                    
                    // Send email notification if status changed to CONFIRMED and customer has email
                    if ("CONFIRMED".equals(status) && 
                        !"CONFIRMED".equals(previousStatus)) {
                        try {
                            // Get email from user account if user is linked
                            String emailAddress = null;
                            if (savedBooking.getUser() != null && 
                                savedBooking.getUser().getEmail() != null && 
                                !savedBooking.getUser().getEmail().trim().isEmpty()) {
                                emailAddress = savedBooking.getUser().getEmail();
                            } else if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
                                emailAddress = dto.getEmail(); // Fallback to booking email
                            }
                            
                            if (emailAddress != null) {
                                // Temporarily set email in DTO for email template
                                dto.setEmail(emailAddress);
                                emailService.sendServiceBookingConfirmation(dto);
                            }
                        } catch (Exception e) {
                            // Log error but don't fail the status update
                            System.err.println("Failed to send confirmation email for booking " + id + ": " + e.getMessage());
                        }
                    }
                    
                    return dto;
                });
    }

    // Get bookings by status
    public List<ServiceBookingDTO> getBookingsByStatus(String status) {
        return serviceBookingRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get upcoming bookings
    public List<ServiceBookingDTO> getUpcomingBookings() {
        return serviceBookingRepository.findUpcomingBookings(LocalDate.now())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get bookings by date
    public List<ServiceBookingDTO> getBookingsByDate(LocalDate date) {
        return serviceBookingRepository.findByPreferredDateOrderByPreferredTimeAsc(date)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get bookings for a user via any identifier
    public List<ServiceBookingDTO> getBookingsForUser(Long userId, String email, String phone) {
        List<ServiceBooking> results = List.of();
        if (userId != null) {
            results = serviceBookingRepository.findByUser_IdOrderByCreatedAtDesc(userId);
        }
        if ((results == null || results.isEmpty()) && email != null && !email.trim().isEmpty()) {
            results = serviceBookingRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc(email.trim());
        }
        if ((results == null || results.isEmpty()) && phone != null && !phone.trim().isEmpty()) {
            results = serviceBookingRepository.findByPhoneOrderByCreatedAtDesc(phone.trim());
        }
        return (results == null ? List.<ServiceBooking>of() : results)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get bookings for a user filtered by service type keyword (walking/boarding/grooming)
    public List<ServiceBookingDTO> getBookingsForUserByType(Long userId, String email, String phone, String typeKeyword) {
        String kw = typeKeyword == null ? "" : typeKeyword.trim();
        List<ServiceBooking> base;
        if (userId != null) base = serviceBookingRepository.findByUser_IdOrderByCreatedAtDesc(userId);
        else if (email != null && !email.trim().isEmpty()) base = serviceBookingRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc(email.trim());
        else if (phone != null && !phone.trim().isEmpty()) base = serviceBookingRepository.findByPhoneOrderByCreatedAtDesc(phone.trim());
        else base = serviceBookingRepository.findAllByOrderByCreatedAtDesc();

        String lkw = kw.toLowerCase();
        return base.stream()
                .filter(b -> (b.getServiceType() + " " + b.getServiceName()).toLowerCase().contains(lkw))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Search bookings
    public List<ServiceBookingDTO> searchBookings(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllBookings();
        }
        return serviceBookingRepository.searchBookings(searchTerm.trim())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get booking statistics
    public BookingStats getBookingStats() {
        Long pending = serviceBookingRepository.countByStatus("PENDING");
        Long confirmed = serviceBookingRepository.countByStatus("CONFIRMED");
        Long inProgress = serviceBookingRepository.countByStatus("IN_PROGRESS");
        Long completed = serviceBookingRepository.countByStatus("COMPLETED");
        Long cancelled = serviceBookingRepository.countByStatus("CANCELLED");

        return new BookingStats(pending, confirmed, inProgress, completed, cancelled);
    }

    // Delete booking
    public boolean deleteBooking(Long id) {
        if (serviceBookingRepository.existsById(id)) {
            serviceBookingRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Convert Entity to DTO
    private ServiceBookingDTO convertToDTO(ServiceBooking booking) {
        if (booking == null) {
            System.err.println("[WARNING] Attempting to convert null ServiceBooking to DTO");
            return null;
        }
        
        ServiceBookingDTO dto = new ServiceBookingDTO();
        dto.setId(booking.getId());
        dto.setPetName(booking.getPetName() != null ? booking.getPetName() : "Unknown Pet");
        dto.setPetType(booking.getPetType() != null ? booking.getPetType() : "Unknown");
        dto.setPetBreed(booking.getPetBreed());
        dto.setPetAge(booking.getPetAge());
        dto.setPetGender(booking.getPetGender());
        dto.setPetDateOfBirth(booking.getPetDateOfBirth());
        
        // Pet photo information
        dto.setPetPhotoPath(booking.getPetPhotoPath());
        dto.setPetPhotoOriginalName(booking.getPetPhotoOriginalName());
        dto.setPetPhotoContentType(booking.getPetPhotoContentType());
        
        dto.setUserId(booking.getUser() != null ? booking.getUser().getId() : null);
        dto.setOwnerName(booking.getOwnerName() != null ? booking.getOwnerName() : "Unknown Owner");
        dto.setPhone(booking.getPhone() != null ? booking.getPhone() : "Unknown");
        dto.setEmail(booking.getEmail());
        dto.setAddress(booking.getAddress() != null ? booking.getAddress() : "Address not provided");
        
        // Detailed address components
        dto.setAddressType(booking.getAddressType());
        dto.setArea(booking.getArea());
        dto.setCityStateCountry(booking.getCityStateCountry());
        dto.setHouseNumber(booking.getHouseNumber());
        dto.setBuilding(booking.getBuilding());
        dto.setFloor(booking.getFloor());
        dto.setLandmark(booking.getLandmark());
        dto.setRecipientName(booking.getRecipientName());
        dto.setRecipientContactNumber(booking.getRecipientContactNumber());
        
        // GPS coordinates
        dto.setGpsLatitude(booking.getGpsLatitude());
        dto.setGpsLongitude(booking.getGpsLongitude());
        
        dto.setServiceName(booking.getServiceName() != null ? booking.getServiceName() : "Unknown Service");
        dto.setServiceType(booking.getServiceType() != null ? booking.getServiceType() : "Unknown");
        dto.setBasePrice(booking.getBasePrice() != null ? booking.getBasePrice() : 0.0);
        dto.setAddOns(booking.getAddOns());
        dto.setTotalAmount(booking.getTotalAmount() != null ? booking.getTotalAmount() : 0.0);
        dto.setPreferredDate(booking.getPreferredDate());
        dto.setPreferredTime(booking.getPreferredTime() != null ? booking.getPreferredTime() : "Not specified");
        dto.setSpecialInstructions(booking.getSpecialInstructions());
        dto.setStatus(booking.getStatus() != null ? booking.getStatus() : "PENDING");
        dto.setNotes(booking.getNotes());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }

    // Convert DTO to Entity
    private ServiceBooking convertToEntity(ServiceBookingDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("ServiceBookingDTO cannot be null");
        }
        
        ServiceBooking booking = new ServiceBooking();
        
        // Validate and set required fields with defaults
        booking.setPetName(dto.getPetName() != null && !dto.getPetName().trim().isEmpty() ? dto.getPetName().trim() : "Unknown Pet");
        booking.setPetType(dto.getPetType() != null && !dto.getPetType().trim().isEmpty() ? dto.getPetType().trim() : "unknown");
        booking.setPetBreed(dto.getPetBreed() != null ? dto.getPetBreed().trim() : null);
        booking.setPetAge(dto.getPetAge() != null ? dto.getPetAge().trim() : null);
        booking.setPetGender(dto.getPetGender() != null ? dto.getPetGender().trim() : null);
        booking.setPetDateOfBirth(dto.getPetDateOfBirth() != null ? dto.getPetDateOfBirth().trim() : null);
        
        // Handle pet photo upload
        if (dto.getPetPhotoBase64() != null && !dto.getPetPhotoBase64().trim().isEmpty()) {
            try {
                String photoPath = fileUploadService.saveBase64Image(
                    dto.getPetPhotoBase64(),
                    dto.getPetPhotoOriginalName(),
                    dto.getPetPhotoContentType(),
                    dto.getPetName()
                );
                booking.setPetPhotoPath(photoPath);
                booking.setPetPhotoOriginalName(dto.getPetPhotoOriginalName());
                booking.setPetPhotoContentType(dto.getPetPhotoContentType());
                System.out.println("[DEBUG] Saved pet photo at: " + photoPath);
            } catch (Exception e) {
                System.err.println("[WARNING] Failed to save pet photo: " + e.getMessage());
                // Don't fail the booking if photo save fails
            }
        }
        
        // Set user relationship if userId is provided
        if (dto.getUserId() != null) {
            try {
                User user = userRepository.findById(dto.getUserId()).orElse(null);
                booking.setUser(user);
            } catch (Exception e) {
                System.err.println("[WARNING] Failed to find user with ID: " + dto.getUserId());
            }
        }
        
        booking.setOwnerName(dto.getOwnerName() != null && !dto.getOwnerName().trim().isEmpty() ? dto.getOwnerName().trim() : "Unknown Owner");
        booking.setPhone(dto.getPhone() != null && !dto.getPhone().trim().isEmpty() ? dto.getPhone().trim() : "Unknown");
        booking.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);
        booking.setAddress(dto.getAddress() != null && !dto.getAddress().trim().isEmpty() ? dto.getAddress().trim() : "Address not provided");
        
        // Set detailed address components
        booking.setAddressType(dto.getAddressType() != null ? dto.getAddressType().trim() : null);
        booking.setArea(dto.getArea() != null ? dto.getArea().trim() : null);
        booking.setCityStateCountry(dto.getCityStateCountry() != null ? dto.getCityStateCountry().trim() : null);
        booking.setHouseNumber(dto.getHouseNumber() != null ? dto.getHouseNumber().trim() : null);
        booking.setBuilding(dto.getBuilding() != null ? dto.getBuilding().trim() : null);
        booking.setFloor(dto.getFloor() != null ? dto.getFloor().trim() : null);
        booking.setLandmark(dto.getLandmark() != null ? dto.getLandmark().trim() : null);
        booking.setRecipientName(dto.getRecipientName() != null ? dto.getRecipientName().trim() : null);
        booking.setRecipientContactNumber(dto.getRecipientContactNumber() != null ? dto.getRecipientContactNumber().trim() : null);
        
        // Set GPS coordinates
        booking.setGpsLatitude(dto.getGpsLatitude());
        booking.setGpsLongitude(dto.getGpsLongitude());
        
        // Extract GPS from addOns if not directly provided
        if (booking.getGpsLatitude() == null && dto.getAddOns() != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> gps = (Map<String, Object>) dto.getAddOns().get("gps");
                if (gps != null) {
                    if (gps.get("lat") != null) {
                        booking.setGpsLatitude(Double.parseDouble(gps.get("lat").toString()));
                    }
                    if (gps.get("lng") != null) {
                        booking.setGpsLongitude(Double.parseDouble(gps.get("lng").toString()));
                    }
                }
            } catch (Exception e) {
                System.err.println("[WARNING] Failed to extract GPS from addOns: " + e.getMessage());
            }
        }
        
        booking.setServiceName(dto.getServiceName() != null && !dto.getServiceName().trim().isEmpty() ? dto.getServiceName().trim() : "Unknown Service");
        booking.setServiceType(dto.getServiceType() != null && !dto.getServiceType().trim().isEmpty() ? dto.getServiceType().trim() : "unknown");
        booking.setBasePrice(dto.getBasePrice() != null ? dto.getBasePrice() : 0.0);
        
        // Store optimized addOns without large data (images, detailed address, GPS)
        // to avoid database column size limits
        Map<String, Object> optimizedAddOns = new HashMap<>();
        if (dto.getAddOns() != null) {
            for (Map.Entry<String, Object> entry : dto.getAddOns().entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();
                
                // Skip large data fields that are stored in dedicated columns
                if (!"petPhoto".equals(key) && !"addressDetails".equals(key) && !"gps".equals(key)) {
                    // Include only essential metadata (duration, rules, etc.)
                    optimizedAddOns.put(key, value);
                }
            }
        }
        booking.setAddOns(optimizedAddOns);
        
        booking.setTotalAmount(dto.getTotalAmount() != null ? dto.getTotalAmount() : 0.0);
        booking.setPreferredDate(dto.getPreferredDate());
        booking.setPreferredTime(dto.getPreferredTime() != null && !dto.getPreferredTime().trim().isEmpty() ? dto.getPreferredTime().trim() : "Not specified");
        booking.setSpecialInstructions(dto.getSpecialInstructions() != null ? dto.getSpecialInstructions().trim() : null);
        
        if (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) {
            booking.setStatus(dto.getStatus().trim());
        } else {
            booking.setStatus("PENDING");
        }
        
        return booking;
    }

    // Get bookings by service type
    public List<ServiceBookingDTO> getBookingsByServiceType(String serviceType) {
        return serviceBookingRepository.findByServiceTypeOrderByCreatedAtDesc(serviceType)
                .stream()
                .map(this::convertToDTO)
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }
    
    // Get specifically pet walking bookings
    public List<ServiceBookingDTO> getPetWalkingBookings() {
        System.out.println("[DEBUG] Getting pet walking bookings...");
        List<ServiceBooking> walkingBookings = serviceBookingRepository.findPetWalkingBookings();
        System.out.println("[DEBUG] Found " + walkingBookings.size() + " pet walking bookings");
        return walkingBookings.stream()
                .map(this::convertToDTO)
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }
    
    // Count pet walking bookings
    public Long countPetWalkingBookings() {
        Long count = serviceBookingRepository.countPetWalkingBookings();
        System.out.println("[DEBUG] Total pet walking bookings in database: " + count);
        return count;
    }

    // Inner class for booking statistics
    public static class BookingStats {
        private Long pending;
        private Long confirmed;
        private Long inProgress;
        private Long completed;
        private Long cancelled;
        private Long total;

        public BookingStats(Long pending, Long confirmed, Long inProgress, Long completed, Long cancelled) {
            this.pending = pending;
            this.confirmed = confirmed;
            this.inProgress = inProgress;
            this.completed = completed;
            this.cancelled = cancelled;
            this.total = pending + confirmed + inProgress + completed + cancelled;
        }

        // Getters
        public Long getPending() { return pending; }
        public Long getConfirmed() { return confirmed; }
        public Long getInProgress() { return inProgress; }
        public Long getCompleted() { return completed; }
        public Long getCancelled() { return cancelled; }
        public Long getTotal() { return total; }
    }
}