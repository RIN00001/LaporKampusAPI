import multer from "multer";
import path from "path";
import fs from "fs";

// Constant variable for the upload directory path
const UPLOAD_DIR = "public/uploads";

// Constant variable to limit the maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Check if the upload directory exists, if not create it automatically
if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure disk storage for uploaded report images
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, UPLOAD_DIR);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		
		cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
	}
});

// Middleware for handling single image upload with type filtering
export const uploadMiddleware = multer({
	storage: storage,
	limits: {
		fileSize: MAX_FILE_SIZE
	},
	fileFilter: (req, file, cb) => {
		const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
		
		if (allowedMimeTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Only .png, .jpg and .jpeg formats are allowed"));
		}
	}
});