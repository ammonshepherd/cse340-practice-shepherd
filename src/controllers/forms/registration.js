import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers } from '../../models/forms/registration.js';
import { requireLogin } from '../../middleware/auth.js';

const router = Router();

/**
 * Validation rules for user registration
 */
const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, space, apostrophe, and hyphen.'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address')
        .isLength({max: 255})
        .withMessage('Email is too long.'),
    body('emailConfirm')
        .trim()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters.')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-z]/)
        .withMessage('Password must have at least one lower case letter')
        .matches(/[A-Z]/)
        .withMessage('Password must have at least one upper case letter')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage('Password must contain at least one special character'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
];

/**
 * Display the registration form page.
 */
const showRegistrationForm = (req, res) => {
    res.render('forms/registration/form', {
        title: 'User Registration'
    })
};

/**
 * Handle user registration with validation and password hashing.
 */
const processRegistration = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('/register');
    }

    try {
        // Extract validated data from request body
        const { name, email, password } = req.body;

        // Check if email already exists in database
        let existing = await emailExists(email);

        if (existing) {
            req.flash('warning', 'Email already exists.');
            return res.redirect('/register');
        }

        // Hash the password before saving to database
        let hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database with hashed password
        let userResponse = await saveUser(name, email, hashedPassword);

        if (userResponse){
            req.flash('success', "Registration completed successfully.")
            return res.redirect('/login');
        } else {
            req.flash('error', 'Registration could not be completed. Please try again later.')
            return res.redirect('/register');
        }
    } catch (error) {
        console.log("Error with registration.", error);
        req.flash('error', 'Registration could not be completed. Please try again later.')
        return res.redirect('/register');
    }
};

/**
 * Display all registered users.
 */
const showAllUsers = async (req, res) => {
    // Initialize users as empty array
    let users = [];

    try {
        users = await getAllUsers();
    } catch (error) {
        // users remains empty array on error
        console.log("Error getting users: ", error)
    }

    res.render('forms/registration/list', {
        title: 'Registered Users',
        users: users
    })
};


/**
 * GET /register - Display the registration form
 */
router.get('/', showRegistrationForm);

/**
 * POST /register - Handle registration form submission with validation
 */
router.post('/', registrationValidation, processRegistration);

/**
 * GET /register/list - Display all registered users
 */
router.get('/list', requireLogin, showAllUsers);

export default router;