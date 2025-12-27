package com.eduprajna.Controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.eduprajna.dto.UserSummaryDTO;
import com.eduprajna.entity.User;
import com.eduprajna.repository.OrderRepository;
import com.eduprajna.repository.UserRepository;
import com.eduprajna.repository.WishlistItemRepository;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "https://nishmitha-pet-co.vercel.app"}, allowCredentials = "true")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WishlistItemRepository wishlistItemRepository;

    @GetMapping("")
    @ResponseBody
    public List<UserSummaryDTO> getAllUsers() {
        // Fetch only users whose role is not 'admin'
        return userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == null || !user.getRole().equalsIgnoreCase("admin"))
                .map(this::convertToUserSummaryDTO)
                .collect(Collectors.toList());
    }

    private UserSummaryDTO convertToUserSummaryDTO(User user) {
        long orderCount = orderRepository.findByUserOrderByCreatedAtDesc(user).size();
        long wishlistCount = wishlistItemRepository.countByUser(user);
        
        return new UserSummaryDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole(),
            user.getCreatedAt(),
            user.getMemberSince(),
            user.getIsActive(),
            orderCount,
            wishlistCount,
            user.getLoyaltyPoints()
        );
    }
}