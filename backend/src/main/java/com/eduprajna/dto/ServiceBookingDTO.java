package com.eduprajna.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;

public class ServiceBookingDTO {
    private Long id;
    
    // Pet Information
    private String petName;
    private String petType;
    private String petBreed;
    private String petAge;
    private String petGender;
    private String petDateOfBirth;
    
    // Pet photo information
    private String petPhotoPath;
    private String petPhotoOriginalName;
    private String petPhotoContentType;
    private String petPhotoBase64; // For frontend upload
    
    // Owner Information
    private Long userId; // User ID for linking to users table
    private String ownerName;
    private String phone;
    private String email;
    private String address;
    
    // Detailed address components
    private String addressType;
    private String area;
    private String cityStateCountry;
    private String houseNumber;
    private String building;
    private String floor;
    private String landmark;
    private String recipientName;
    private String recipientContactNumber;
    
    // GPS coordinates
    private Double gpsLatitude;
    private Double gpsLongitude;
    
    // Service Information
    private String serviceName;
    private String serviceType;
    private Double basePrice;
    private Map<String, Object> addOns;
    private Double totalAmount;
    
    // Appointment Details
    private LocalDate preferredDate;
    private String preferredTime;
    private String specialInstructions;
    
    // Booking Status
    private String status;
    private String notes;
    
    // Timestamps
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Constructors
    public ServiceBookingDTO() {}

    public ServiceBookingDTO(String petName, String petType, String petBreed, String petAge,
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

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

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

    public String getPetPhotoBase64() { return petPhotoBase64; }
    public void setPetPhotoBase64(String petPhotoBase64) { this.petPhotoBase64 = petPhotoBase64; }

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
}