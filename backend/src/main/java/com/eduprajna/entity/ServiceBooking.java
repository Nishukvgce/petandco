package com.eduprajna.entity;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;

import com.eduprajna.converter.JsonMapConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "service_bookings",
    indexes = {
        @Index(name = "idx_service_type", columnList = "serviceType"),
        @Index(name = "idx_preferred_date", columnList = "preferredDate"),
        @Index(name = "idx_status", columnList = "status")
    }
)
public class ServiceBooking {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Pet Information
    @Column(nullable = false)
    private String petName;

    @Column(nullable = false)
    private String petType; // cat, dog

    @Column
    private String petBreed;

    @Column
    private String petAge;

    // Owner Information (User relationship)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String ownerName;

    @Column(nullable = false)
    private String phone;

    @Column
    private String email; // Keep for backward compatibility/guest bookings

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    // Service Information
    @Column(nullable = false, length = 100)
    private String serviceName; // Fresh Pack, Pampered Pack, Pet Walking - 30min, etc.

    @Column(nullable = false, length = 50)
    private String serviceType; // cat-grooming, dog-grooming, pet-walking

    @Column(nullable = false, columnDefinition = "DECIMAL(10,2)")
    private Double basePrice;

    @Convert(converter = JsonMapConverter.class)
    @Column(name = "add_ons", columnDefinition = "LONGTEXT")
    private Map<String, Object> addOns; // Store selected add-ons with prices

    @Column(nullable = false, columnDefinition = "DECIMAL(10,2)")
    private Double totalAmount;

    // Additional pet information for comprehensive storage
    @Column(length = 10)
    private String petGender; // male, female

    @Column
    private String petDateOfBirth;

    // Image and file storage
    @Column(length = 255)
    private String petPhotoPath; // Path to uploaded pet photo

    @Column(length = 100)
    private String petPhotoOriginalName; // Original filename

    @Column(length = 50)
    private String petPhotoContentType; // MIME type

    // Address components for detailed storage
    @Column(length = 50)
    private String addressType; // home, work, other

    @Column(length = 100)
    private String area;

    @Column(length = 100)
    private String cityStateCountry;

    @Column(length = 20)
    private String houseNumber;

    @Column(length = 100)
    private String building;

    @Column(length = 10)
    private String floor;

    @Column(length = 255)
    private String landmark;

    @Column(length = 100)
    private String recipientName;

    @Column(length = 15)
    private String recipientContactNumber;

    // GPS coordinates
    @Column
    private Double gpsLatitude;

    @Column
    private Double gpsLongitude;

    // Appointment Details
    @Column(nullable = false)
    private LocalDate preferredDate;

    @Column(nullable = false)
    private String preferredTime; // e.g., "9:30 AM - 10:30 AM"

    @Column(columnDefinition = "TEXT")
    private String specialInstructions;

    // Booking Status
    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column
    private String notes; // Admin notes

    // Timestamps
    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column
    private OffsetDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now();
        }
        if (this.status == null || this.status.trim().isEmpty()) {
            this.status = "PENDING";
        }
        // Validate pet walking service type
        if ("pet-walking".equals(this.serviceType)) {
            System.out.println("[DEBUG] Saving pet walking booking: " + this.petName + " - " + this.serviceName);
        }
    }

    // Constructors
    public ServiceBooking() {}

    public ServiceBooking(String petName, String petType, String petBreed, String petAge,
                         String ownerName, String phone, String email, String address,
                         String serviceName, String serviceType, Double basePrice,
                         Map<String, Object> addOns, Double totalAmount,
                         LocalDate preferredDate, String preferredTime, String specialInstructions) {
        this.petName = petName;
        this.petType = petType;
        this.petBreed = petBreed;
        this.petAge = petAge;
        this.ownerName = ownerName;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.serviceName = serviceName;
        this.serviceType = serviceType;
        this.basePrice = basePrice;
        this.addOns = addOns;
        this.totalAmount = totalAmount;
        this.preferredDate = preferredDate;
        this.preferredTime = preferredTime;
        this.specialInstructions = specialInstructions;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPetName() { return petName; }
    public void setPetName(String petName) { this.petName = petName; }

    public String getPetType() { return petType; }
    public void setPetType(String petType) { this.petType = petType; }

    public String getPetBreed() { return petBreed; }
    public void setPetBreed(String petBreed) { this.petBreed = petBreed; }

    public String getPetAge() { return petAge; }
    public void setPetAge(String petAge) { this.petAge = petAge; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public Double getBasePrice() { return basePrice; }
    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }

    public Map<String, Object> getAddOns() { return addOns; }
    public void setAddOns(Map<String, Object> addOns) { this.addOns = addOns; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public LocalDate getPreferredDate() { return preferredDate; }
    public void setPreferredDate(LocalDate preferredDate) { this.preferredDate = preferredDate; }

    public String getPreferredTime() { return preferredTime; }
    public void setPreferredTime(String preferredTime) { this.preferredTime = preferredTime; }

    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Additional getters and setters for new fields
    public String getPetGender() { return petGender; }
    public void setPetGender(String petGender) { this.petGender = petGender; }

    public String getPetDateOfBirth() { return petDateOfBirth; }
    public void setPetDateOfBirth(String petDateOfBirth) { this.petDateOfBirth = petDateOfBirth; }

    public String getPetPhotoPath() { return petPhotoPath; }
    public void setPetPhotoPath(String petPhotoPath) { this.petPhotoPath = petPhotoPath; }

    public String getPetPhotoOriginalName() { return petPhotoOriginalName; }
    public void setPetPhotoOriginalName(String petPhotoOriginalName) { this.petPhotoOriginalName = petPhotoOriginalName; }

    public String getPetPhotoContentType() { return petPhotoContentType; }
    public void setPetPhotoContentType(String petPhotoContentType) { this.petPhotoContentType = petPhotoContentType; }

    public String getAddressType() { return addressType; }
    public void setAddressType(String addressType) { this.addressType = addressType; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getCityStateCountry() { return cityStateCountry; }
    public void setCityStateCountry(String cityStateCountry) { this.cityStateCountry = cityStateCountry; }

    public String getHouseNumber() { return houseNumber; }
    public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getRecipientContactNumber() { return recipientContactNumber; }
    public void setRecipientContactNumber(String recipientContactNumber) { this.recipientContactNumber = recipientContactNumber; }

    public Double getGpsLatitude() { return gpsLatitude; }
    public void setGpsLatitude(Double gpsLatitude) { this.gpsLatitude = gpsLatitude; }

    public Double getGpsLongitude() { return gpsLongitude; }
    public void setGpsLongitude(Double gpsLongitude) { this.gpsLongitude = gpsLongitude; }

    @Override
    public String toString() {
        return "ServiceBooking{" +
                "id=" + id +
                ", petName='" + petName + '\'' +
                ", petType='" + petType + '\'' +
                ", ownerName='" + ownerName + '\'' +
                ", serviceName='" + serviceName + '\'' +
                ", totalAmount=" + totalAmount +
                ", preferredDate=" + preferredDate +
                ", status='" + status + '\'' +
                '}';
    }
}