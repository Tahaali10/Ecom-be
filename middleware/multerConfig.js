const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirectory = path.resolve(__dirname, '..', 'uploads');  // Absolute path

// Ensure upload directory exists
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
    console.log(`Created upload directory at ${uploadDirectory}`);
} else {
    console.log(`Upload directory already exists at ${uploadDirectory}`);
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDirectory);
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only JPEG and PNG are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 },  // 5 MB limit
    onError: function(err, next) {
        console.log('Error during file upload:', err);
        next(err);
    }
});

module.exports = upload;
