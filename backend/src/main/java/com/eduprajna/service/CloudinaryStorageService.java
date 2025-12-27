package com.eduprajna.service;

import java.io.IOException;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class CloudinaryStorageService {
    private final Cloudinary cloudinary;
    private final boolean enabled;
    private final StorageService localStorage;
    private final Logger log = LoggerFactory.getLogger(CloudinaryStorageService.class);

    public CloudinaryStorageService(
            StorageService localStorage,
            @Value("${CLOUDINARY_URL:}") String cloudinaryUrl,
            @Value("${CLOUDINARY_CLOUD_NAME:}") String cloudName,
            @Value("${CLOUDINARY_API_KEY:}") String apiKey,
            @Value("${CLOUDINARY_API_SECRET:}") String apiSecret
    ) {
        this.localStorage = localStorage;
        if (cloudinaryUrl != null && !cloudinaryUrl.isEmpty()) {
            this.cloudinary = new Cloudinary(cloudinaryUrl);
        } else if (apiKey != null && !apiKey.isEmpty() && cloudName != null && !cloudName.isEmpty()) {
            // Construct Cloudinary client from separate properties
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret
            ));
        } else {
            // Fallback to default constructor which reads environment/configuration
            this.cloudinary = new Cloudinary();
        }

        // Validate that credentials are available (use constructor-injected values or environment variables)
        boolean hasCloudinaryUrl = cloudinaryUrl != null && !cloudinaryUrl.isEmpty();
        boolean hasSeparateVars = apiKey != null && !apiKey.isEmpty() && cloudName != null && !cloudName.isEmpty() && apiSecret != null && !apiSecret.isEmpty();
        boolean hasEnvVars = (System.getenv("CLOUDINARY_URL") != null && !System.getenv("CLOUDINARY_URL").isEmpty())
                || (System.getenv("CLOUDINARY_API_KEY") != null && !System.getenv("CLOUDINARY_API_KEY").isEmpty());

        this.enabled = hasCloudinaryUrl || hasSeparateVars || hasEnvVars;
        if (!this.enabled) {
            log.warn("Cloudinary credentials not found. Cloudinary uploads are disabled. Set CLOUDINARY_URL or CLOUDINARY_API_KEY + CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_SECRET environment variables to enable.");
        } else {
            log.info("CloudinaryStorageService initialized (enabled={}).", this.enabled);
        }
    }

    // Uploads and returns the secure URL and public_id
    public UploadResult upload(MultipartFile file) throws IOException {
        if (!this.enabled) {
            // Fallback to local storage so product creation still works in dev without cloud credentials
            String localPath = localStorage.store(file); // returns API relative path
            log.info("Cloudinary disabled - stored file locally: {}", localPath);
            return new UploadResult(localPath, null);
        }
        String original = file.getOriginalFilename();
        String publicId = "products/" + System.currentTimeMillis() + (original != null ? ("_" + original.replaceAll("\\s+","_")) : "");
        try {
            Map<?,?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "auto",
                    "public_id", publicId,
                    "overwrite", true
            ));
            Object url = result.get("secure_url");
            return new UploadResult(url != null ? url.toString() : null, publicId);
        } catch (Exception e) {
            // If Cloudinary fails at runtime, fallback to local storage and log the error
            log.error("Cloudinary upload failed - falling back to local storage", e);
            String localPath = localStorage.store(file);
            return new UploadResult(localPath, null);
        }
    }

    // Upload from an already-saved local file path returned by StorageService.store()
    public UploadResult uploadLocal(String apiPath) throws IOException {
        if (!this.enabled) {
            // Just return the local path when Cloudinary disabled
            return new UploadResult(apiPath, null);
        }
        String filename = localStorage.extractFilenameFromUrl(apiPath);
        if (filename == null) {
            log.warn("uploadLocal: could not extract filename from path: {}", apiPath);
            return new UploadResult(apiPath, null);
        }
        java.io.File f = localStorage.getFile(filename);
        if (f == null) {
            log.warn("uploadLocal: local file not found: {}", filename);
            return new UploadResult(apiPath, null);
        }

        String original = filename;
        String publicId = "products/" + System.currentTimeMillis() + (original != null ? ("_" + original.replaceAll("\\s+","_")) : "");
        try {
            Map<?,?> result = cloudinary.uploader().upload(f, ObjectUtils.asMap(
                    "resource_type", "auto",
                    "public_id", publicId,
                    "overwrite", true
            ));
            Object url = result.get("secure_url");
            return new UploadResult(url != null ? url.toString() : null, publicId);
        } catch (Exception e) {
            log.error("Cloudinary uploadLocal failed, returning local path", e);
            return new UploadResult(apiPath, null);
        }
    }

    // Delete by public id or by URL - Cloudinary requires public_id; this method accepts either
    public boolean delete(String urlOrPublicId) {
        if (!this.enabled) {
            // if cloudinary disabled, try to delete local file
            String filename = localStorage.extractFilenameFromUrl(urlOrPublicId);
            if (filename != null) {
                return localStorage.delete(filename);
            }
            log.warn("Attempted to delete image but Cloudinary is not configured and filename extraction failed.");
            return false;
        }
        try {
            String publicId = urlOrPublicId;
            // If full URL provided, try to extract the public id
            if (publicId != null && publicId.startsWith("http")) {
                int idx = publicId.lastIndexOf('/');
                if (idx >= 0 && idx + 1 < publicId.length()) {
                    publicId = publicId.substring(idx + 1);
                    // remove file extension if present
                    int dot = publicId.lastIndexOf('.');
                    if (dot > 0) publicId = publicId.substring(0, dot);
                }
            }
            Map<?,?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            Object res = result.get("result");
            return res != null && ("ok".equals(res) || "not found".equals(res));
        } catch (Exception e) {
            log.error("Cloudinary deletion failed", e);
            return false;
        }
    }

    // Simple DTO for upload result
    public static final class UploadResult {
        private final String url;
        private final String publicId;

        public UploadResult(String url, String publicId) {
            this.url = url;
            this.publicId = publicId;
        }

        public String getUrl() { return url; }
        public String getPublicId() { return publicId; }
    }
}
