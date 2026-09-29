const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3001;

// Setup View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing URL-encoded bodies & serving static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter validation (Images only: jpg, jpeg, png, gif, webp)
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: imageFilter
});

// Multer upload fields setup: profilePic (1), otherPics (max 5)
const cpUpload = upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'otherPics', maxCount: 5 }
]);

// Route 1: Display Registration Form
app.get('/', (req, res) => {
  res.render('register', {
    errors: {},
    oldInput: {},
    fileErrors: []
  });
});

// Route 2: Process Registration Form
app.post('/register', (req, res) => {
  cpUpload(req, res, async (err) => {
    let fileErrors = [];
    if (err instanceof multer.MulterError) {
      fileErrors.push(err.message);
    } else if (err) {
      fileErrors.push(err.message);
    }

    // Manual check for required profilePic
    if (!req.files || !req.files['profilePic'] || req.files['profilePic'].length === 0) {
      fileErrors.push('Profile picture is required.');
    }

    // Run Express Validator rules manually
    await body('username')
      .trim()
      .notEmpty().withMessage('Username is required.')
      .isLength({ min: 3 }).withMessage('Username must be at least 3 characters.')
      .run(req);

    await body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please provide a valid email address.')
      .run(req);

    await body('password')
      .notEmpty().withMessage('Password is required.')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
      .run(req);

    await body('confirmPassword')
      .notEmpty().withMessage('Please confirm your password.')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match.');
        }
        return true;
      })
      .run(req);

    await body('gender')
      .notEmpty().withMessage('Please select a gender.')
      .run(req);

    await body('hobbies')
      .custom((value) => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          throw new Error('Please select at least one hobby.');
        }
        return true;
      })
      .run(req);

    const valResults = validationResult(req);
    const hasErrors = !valResults.isEmpty() || fileErrors.length > 0;

    if (hasErrors) {
      // Clean up uploaded files if validation failed
      if (req.files) {
        if (req.files['profilePic']) {
          req.files['profilePic'].forEach(f => fs.unlink(f.path, () => {}));
        }
        if (req.files['otherPics']) {
          req.files['otherPics'].forEach(f => fs.unlink(f.path, () => {}));
        }
      }

      // Convert validation errors array to key-value object
      const formattedErrors = {};
      valResults.array().forEach(e => {
        formattedErrors[e.path] = e.msg;
      });

      // Format hobbies as array for re-populating checkboxes
      let hobbies = req.body.hobbies || [];
      if (typeof hobbies === 'string') hobbies = [hobbies];

      return res.render('register', {
        errors: formattedErrors,
        fileErrors: fileErrors,
        oldInput: {
          username: req.body.username || '',
          email: req.body.email || '',
          gender: req.body.gender || '',
          hobbies: hobbies
        }
      });
    }

    // Success: Prepare data for tabular view
    const profilePicFile = req.files['profilePic'][0];
    const otherPicFiles = req.files['otherPics'] || [];

    let hobbiesList = req.body.hobbies;
    if (typeof hobbiesList === 'string') hobbiesList = [hobbiesList];

    const userData = {
      username: req.body.username,
      email: req.body.email,
      gender: req.body.gender,
      hobbies: hobbiesList.join(', '),
      profilePic: {
        filename: profilePicFile.filename,
        originalname: profilePicFile.originalname,
        path: `/uploads/${profilePicFile.filename}`
      },
      otherPics: otherPicFiles.map(f => ({
        filename: f.filename,
        originalname: f.originalname,
        path: `/uploads/${f.filename}`
      }))
    };

    res.render('success', { user: userData });
  });
});

// Route 3: File Download Route (Requirement: Express download route)
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        res.status(500).send('Error downloading file.');
      }
    });
  } else {
    res.status(404).send('File not found.');
  }
});

app.listen(PORT, () => {
  console.log(`Q1 Server running on http://localhost:${PORT}`);
});
