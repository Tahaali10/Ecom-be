const multer = require('multer');

// Set up Multer to handle image uploads
const storage = multer.memoryStorage(); // Use memory storage for temporary handling

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
    limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB limit
    onError: function(err, next) {
        console.log('Error during file upload:', err);
        next(err);
    }
});

module.exports = upload;
