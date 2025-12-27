package com.eduprajna.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eduprajna.entity.ServiceBooking;

@Repository
public interface ServiceBookingRepository extends JpaRepository<ServiceBooking, Long> {
    
    // Find bookings by status
    List<ServiceBooking> findByStatusOrderByCreatedAtDesc(String status);
    
    // Find bookings by pet type
    List<ServiceBooking> findByPetTypeOrderByCreatedAtDesc(String petType);
    
    // Find bookings by date range
    List<ServiceBooking> findByPreferredDateBetweenOrderByPreferredDateAsc(LocalDate startDate, LocalDate endDate);
    
    // Find bookings by owner phone
    List<ServiceBooking> findByPhoneOrderByCreatedAtDesc(String phone);

    // Find bookings by user id
    List<ServiceBooking> findByUser_IdOrderByCreatedAtDesc(Long userId);

    // Find bookings by email (case-insensitive)
    List<ServiceBooking> findByEmailIgnoreCaseOrderByCreatedAtDesc(String email);
    
    // Find upcoming bookings (after today)
    @Query("SELECT sb FROM ServiceBooking sb WHERE sb.preferredDate >= :today ORDER BY sb.preferredDate ASC, sb.preferredTime ASC")
    List<ServiceBooking> findUpcomingBookings(@Param("today") LocalDate today);
    
    // Find bookings for a specific date
    List<ServiceBooking> findByPreferredDateOrderByPreferredTimeAsc(LocalDate date);
    
    // Find bookings by service type
    List<ServiceBooking> findByServiceTypeOrderByCreatedAtDesc(String serviceType);

    // Find bookings where service type contains text (case-insensitive)
    List<ServiceBooking> findByServiceTypeContainingIgnoreCaseOrderByCreatedAtDesc(String serviceType);
    
    // Find specifically pet walking bookings
    @Query("SELECT sb FROM ServiceBooking sb WHERE sb.serviceType = 'pet-walking' ORDER BY sb.createdAt DESC")
    List<ServiceBooking> findPetWalkingBookings();
    
    // Count pet walking bookings
    @Query("SELECT COUNT(sb) FROM ServiceBooking sb WHERE sb.serviceType = 'pet-walking'")
    Long countPetWalkingBookings();
    
    // Count bookings by status
    @Query("SELECT COUNT(sb) FROM ServiceBooking sb WHERE sb.status = :status")
    Long countByStatus(@Param("status") String status);
    
    // Get all bookings ordered by creation date (newest first)
    List<ServiceBooking> findAllByOrderByCreatedAtDesc();
    
    // Search bookings by owner name or pet name
    @Query("SELECT sb FROM ServiceBooking sb WHERE " +
           "LOWER(sb.ownerName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(sb.petName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(sb.phone) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY sb.createdAt DESC")
    List<ServiceBooking> searchBookings(@Param("searchTerm") String searchTerm);
}