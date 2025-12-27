package com.eduprajna.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@Deprecated
// This service stores files on the local filesystem. For production we recommend
// using `CloudinaryStorageService` which uploads files to Cloudinary and returns
// a remote URL. Keep this class only for local development/backwards compatibility.
public class StorageService {
    // Use environment variable UPLOAD_DIR if provided (helps dev machines), else project-relative uploads directory
    private static final String UPLOAD_DIR;

    static {
        String env = System.getenv("UPLOAD_DIR");
        if (env != null && !env.isEmpty()) {
            UPLOAD_DIR = new File(env).getAbsolutePath();
        } else {
            UPLOAD_DIR = new File("./uploads").getAbsolutePath();
        }
    }

    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp", "avif", "bmp", "svg"
    ));

    public String store(MultipartFile file) throws IOException {
        String detectedExt = detectImageExtension(file);
        if (detectedExt == null) {
            throw new IllegalArgumentException("Only image files are allowed to be stored");
        }

        String original = StringUtils.cleanPath(file.getOriginalFilename());
        if (original == null || original.isEmpty() || original.equals("blob")) {
            original = "image";
        }

        String baseName = Long.toString(System.currentTimeMillis()) + "_" + original;
        // ensure file has an extension matching detected type
        String filename = baseName;
        int idx = original.lastIndexOf('.');
        if (idx <= 0) {
            filename = filename + "." + detectedExt;
        }
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) dir.mkdirs();
        File dest = new File(dir, filename);
        file.transferTo(dest);
        // Return an API-served relative path for DB so frontend can fetch via baseURL
        return "/admin/products/images/" + filename; // served by ProductController
    }

    // Quick helper to determine whether an uploaded file is an image we allow to persist
    public boolean isImage(MultipartFile file) {
        if (file == null || file.isEmpty()) return false;
        try {
            String ct = file.getContentType();
            if (ct != null && ct.toLowerCase().startsWith("image/")) return true;
        } catch (Exception ignored) {}
        String name = file.getOriginalFilename();
        if (name == null) return false;
        int idx = name.lastIndexOf('.');
        if (idx <= 0 || idx >= name.length() - 1) return false;
        String ext = name.substring(idx + 1).toLowerCase();
        return ALLOWED_EXTENSIONS.contains(ext);
    }

    // Try to detect the image type from content-type or magic bytes. Returns extension (without dot) or null.
    public String detectImageExtension(MultipartFile file) {
        if (file == null || file.isEmpty()) return null;
        try {
            String ct = file.getContentType();
            if (ct != null && ct.toLowerCase().startsWith("image/")) {
                String sub = ct.substring(ct.indexOf('/') + 1).toLowerCase();
                if (sub.equals("jpeg")) return "jpg";
                if (sub.equals("svg+xml")) return "svg";
                return sub;
            }
        } catch (Exception ignored) {}

        // Fallback: inspect magic bytes
        try (java.io.InputStream in = file.getInputStream()) {
            byte[] header = new byte[16];
            int read = in.read(header, 0, header.length);
            if (read <= 0) return null;
            // JPEG
            if ((header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8) return "jpg";
            // PNG
            if ((header[0] & 0xFF) == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) return "png";
            // GIF
            if (header[0] == 'G' && header[1] == 'I' && header[2] == 'F') return "gif";
            // WEBP: "RIFF" ... "WEBP"
            if (header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F') {
                String s = new String(header, 8, Math.max(0, Math.min(8, read - 8)));
                if (s.startsWith("WEBP")) return "webp";
            }
            // BMP
            if (header[0] == 'B' && header[1] == 'M') return "bmp";
            // SVG is XML/text-based; check for '<svg'
            String asText = new String(header).toLowerCase();
            if (asText.contains("<svg")) return "svg";
        } catch (Exception ignored) {}
        return null;
    }

    // Remove non-image files from the uploads directory and return deleted filenames
    public List<String> sanitizeUploads() {
        List<String> deleted = new ArrayList<>();
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists() || !dir.isDirectory()) return deleted;
        File[] files = dir.listFiles();
        if (files == null) return deleted;
        for (File f : files) {
            if (!f.isFile()) continue;
            try {
                // Attempt to probe by filename extension first
                String name = f.getName();
                int idx = name.lastIndexOf('.');
                boolean isImage = false;
                String currentExt = null;
                if (idx > 0) {
                    currentExt = name.substring(idx + 1).toLowerCase();
                    if (ALLOWED_EXTENSIONS.contains(currentExt)) isImage = true;
                }

                // If not image by extension, try probing content-type
                if (!isImage) {
                    Path p = Paths.get(UPLOAD_DIR).resolve(name).normalize();
                    String type = Files.probeContentType(p);
                    if (type != null && type.toLowerCase().startsWith("image/")) {
                        // derive ext from content-type
                        String sub = type.substring(type.indexOf('/') + 1).toLowerCase();
                        if (sub.equals("jpeg")) sub = "jpg";
                        if (sub.equals("svg+xml")) sub = "svg";
                        if (ALLOWED_EXTENSIONS.contains(sub)) {
                            isImage = true;
                            // if file lacked extension or had wrong extension, rename it to include correct ext
                            if (currentExt == null || !currentExt.equals(sub)) {
                                String newName = (idx > 0 ? name.substring(0, idx) : name) + "." + sub;
                                Files.move(p, p.resolveSibling(newName));
                            }
                        }
                    }
                }

                // If still not recognized, attempt magic-byte detection
                if (!isImage) {
                    String detected = detectImageExtensionForFile(f);
                    if (detected != null) {
                        isImage = true;
                        if (currentExt == null || !currentExt.equals(detected)) {
                            Path p = Paths.get(UPLOAD_DIR).resolve(name).normalize();
                            String newName = (idx > 0 ? name.substring(0, idx) : name) + "." + detected;
                            Files.move(p, p.resolveSibling(newName));
                        }
                    }
                }

                if (!isImage) {
                    if (f.delete()) deleted.add(f.getName());
                }
            } catch (Exception ignored) {}
        }
        return deleted;
    }

    // Inspect a stored file's header bytes to detect image type; returns extension or null
    private String detectImageExtensionForFile(File f) {
        try (java.io.InputStream in = new FileInputStream(f)) {
            byte[] header = new byte[16];
            int read = in.read(header, 0, header.length);
            if (read <= 0) return null;
            if ((header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8) return "jpg";
            if ((header[0] & 0xFF) == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) return "png";
            if (header[0] == 'G' && header[1] == 'I' && header[2] == 'F') return "gif";
            if (header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F') {
                String s = new String(header, 8, Math.max(0, Math.min(8, read - 8)));
                if (s.startsWith("WEBP")) return "webp";
            }
            if (header[0] == 'B' && header[1] == 'M') return "bmp";
            String asText = new String(header).toLowerCase();
            if (asText.contains("<svg")) return "svg";
        } catch (Exception ignored) {}
        return null;
    }

    // Check by filename whether this looks like an allowed image
    public boolean isImageFilename(String name) {
        if (name == null) return false;
        int idx = name.lastIndexOf('.');
        if (idx <= 0 || idx >= name.length() - 1) return false;
        String ext = name.substring(idx + 1).toLowerCase();
        return ALLOWED_EXTENSIONS.contains(ext);
    }

    public Resource loadAsResource(String filename) throws IOException {
        Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
        if (!Files.exists(filePath)) {
            throw new IOException("File not found: " + filename);
        }
        return new InputStreamResource(new FileInputStream(filePath.toFile())) {
            @Override
            public String getFilename() {
                return filePath.getFileName().toString();
            }

            @Override
            public long contentLength() throws IOException {
                return Files.size(filePath);
            }
        };
    }

    public MediaType probeMediaType(String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            String type = Files.probeContentType(filePath);
            if (type != null) return MediaType.parseMediaType(type);
        } catch (Exception ignored) {}
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    public List<String> listAll() {
        List<String> files = new ArrayList<>();
        File dir = new File(UPLOAD_DIR);
        if (dir.exists() && dir.isDirectory()) {
            File[] list = dir.listFiles();
            if (list != null) {
                for (File f : list) {
                    if (f.isFile()) {
                        files.add(f.getName());
                    }
                }
            }
        }
        return files;
    }

    // Delete a stored file by its filename, returns true if deleted or not present
    public boolean delete(String filename) {
        if (filename == null || filename.isEmpty()) return false;
        File f = Paths.get(UPLOAD_DIR).resolve(filename).normalize().toFile();
        if (!f.exists()) return true; // already gone
        return f.delete();
    }

    // Return a File object for a stored filename (or null if not present)
    public File getFile(String filename) {
        if (filename == null || filename.isEmpty()) return null;
        File f = Paths.get(UPLOAD_DIR).resolve(filename).normalize().toFile();
        return f.exists() ? f : null;
    }

    // Extracts filename from an API url like "/api/admin/products/images/abc.jpg"
    public String extractFilenameFromUrl(String url) {
        if (url == null) return null;
        int idx = url.lastIndexOf('/') + 1;
        if (idx <= 0 || idx >= url.length()) return null;
        return url.substring(idx);
    }
}
