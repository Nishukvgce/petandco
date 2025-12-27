package com.eduprajna.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class FileUploadService {
    
    private final String UPLOAD_DIR = "uploads";
    private final String PET_PHOTOS_DIR = "pet-photos";
    
    public FileUploadService() {
        // Ensure upload directories exist
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("[DEBUG] Created upload directory: " + uploadPath.toAbsolutePath());
            }
            
            Path petPhotosPath = Paths.get(UPLOAD_DIR, PET_PHOTOS_DIR);
            if (!Files.exists(petPhotosPath)) {
                Files.createDirectories(petPhotosPath);
                System.out.println("[DEBUG] Created pet photos directory: " + petPhotosPath.toAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println("[ERROR] Failed to create upload directories: " + e.getMessage());
        }
    }
    
    /**
     * Save base64 encoded image to file system
     * @param base64Data The base64 encoded image data
     * @param originalFileName Original filename from frontend
     * @param mimeType Content type (image/jpeg, image/png, etc.)
     * @param petName Pet name for file organization
     * @return Relative path to saved file
     */
    public String saveBase64Image(String base64Data, String originalFileName, String mimeType, String petName) {
        try {
            if (base64Data == null || base64Data.isEmpty()) {
                return null;
            }
            
            // Remove data URL prefix if present (data:image/jpeg;base64,)
            String cleanBase64 = base64Data;
            if (base64Data.contains(",")) {
                cleanBase64 = base64Data.split(",")[1];
            }
            
            // Decode base64 data
            byte[] imageBytes = Base64.getDecoder().decode(cleanBase64);
            
            // Generate unique filename
            String fileExtension = getFileExtension(originalFileName, mimeType);
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String uniqueId = UUID.randomUUID().toString().substring(0, 8);
            String sanitizedPetName = sanitizeFilename(petName);
            String fileName = String.format("%s_%s_%s.%s", sanitizedPetName, timestamp, uniqueId, fileExtension);
            
            // Create file path
            Path filePath = Paths.get(UPLOAD_DIR, PET_PHOTOS_DIR, fileName);
            
            // Write file
            Files.write(filePath, imageBytes);
            
            // Return relative path
            String relativePath = PET_PHOTOS_DIR + "/" + fileName;
            System.out.println("[DEBUG] Saved pet photo: " + relativePath);
            return relativePath;
            
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to save base64 image: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * Get file extension from filename or mime type
     */
    private String getFileExtension(String originalFileName, String mimeType) {
        if (StringUtils.hasText(originalFileName) && originalFileName.contains(".")) {
            return originalFileName.substring(originalFileName.lastIndexOf(".") + 1).toLowerCase();
        }
        
        // Fallback to mime type
        if (mimeType != null) {
            switch (mimeType.toLowerCase()) {
                case "image/jpeg":
                case "image/jpg":
                    return "jpg";
                case "image/png":
                    return "png";
                case "image/gif":
                    return "gif";
                case "image/webp":
                    return "webp";
                default:
                    return "jpg"; // Default fallback
            }
        }
        
        return "jpg"; // Final fallback
    }
    
    /**
     * Sanitize filename to remove invalid characters
     */
    private String sanitizeFilename(String filename) {
        if (filename == null) {
            return "unknown";
        }
        
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_").toLowerCase();
    }
    
    /**
     * Delete file from uploads directory
     */
    public boolean deleteFile(String relativePath) {
        try {
            if (relativePath == null || relativePath.isEmpty()) {
                return false;
            }
            
            Path filePath = Paths.get(UPLOAD_DIR, relativePath);
            boolean deleted = Files.deleteIfExists(filePath);
            
            if (deleted) {
                System.out.println("[DEBUG] Deleted file: " + relativePath);
            }
            
            return deleted;
        } catch (IOException e) {
            System.err.println("[ERROR] Failed to delete file " + relativePath + ": " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Check if file exists
     */
    public boolean fileExists(String relativePath) {
        if (relativePath == null || relativePath.isEmpty()) {
            return false;
        }
        
        Path filePath = Paths.get(UPLOAD_DIR, relativePath);
        return Files.exists(filePath);
    }
    
    /**
     * Get absolute path to uploads directory
     */
    public String getUploadsDirectory() {
        return Paths.get(UPLOAD_DIR).toAbsolutePath().toString();
    }
}