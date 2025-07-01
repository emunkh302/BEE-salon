import multer from 'multer';
import path from 'path';

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // In a real app, you'd upload to a cloud service like AWS S3.
        // For now, we'll save to a local 'uploads' directory.
        // Make sure you create an 'uploads/' folder in your project root.
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Create a unique filename to prevent overwriting
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure multer with file filter for images
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload only images.') as any, false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    }
});

export default upload;
