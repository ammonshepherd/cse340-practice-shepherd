import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { createContactForm, getAllContactForms, deleteResponse } from '../../models/forms/contact.js';
import { requireLogin } from '../../middleware/auth.js';

const router = Router();

/**
 * Display the contact form page.
 */
const showContactForm = (req, res) => {
    res.render('forms/contact/form', {
        title: 'Contact Us'
    });
};

/**
 * Handle contact form submission with validation.
 * If validation passes, save to database and redirect.
 * If validation fails, log errors and redirect back to form.
 */
const handleContactSubmission = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Store each validation error as a separate flash message
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        // Redirect back to form without saving
        return res.redirect('/contact');
    }

    try {
        // Extract validated data
        const { name, email, subject, message } = req.body;
        // Save to database
        await createContactForm(name, email, subject, message);
        req.flash('success', 'Thank you for contacting us! We will respond soon.');
        // Redirect to responses page on success
        res.redirect('/contact');
    } catch (error) {
        console.error('Error saving contact form:', error);
        req.flash('error', 'Unable to submit your message. Please try again later.');
        res.redirect('/contact');
    }
};

/**
 * Display all contact form submissions.
 */
const showContactResponses = async (req, res) => {
    let contactForms = [];

    try {
        contactForms = await getAllContactForms();
    } catch (error) {
        console.error('Error retrieving contact forms:', error);
    }

    res.render('forms/contact/responses', {
        title: 'Contact Form Submissions',
        contactForms
    });
};

/**
 * Delete the selected contact response
 */
const deleteContactResponse = async (req, res) => {
    let responseId = req.params.responseId;

    try {
        deleteResponse(responseId);
        req.flash('success', "Response deleted.");
    } catch (error) {
        console.log("Error deleting response", error);
    }

    res.redirect('/contact/responses');
};

/**
 * GET /contact - Display the contact form
 */
router.get('/', showContactForm);

/**
 * POST /contact - Handle contact form submission with validation
 */
router.post('/',
    [
        body('name')
            .trim()
            .isLength({ min: 2, max: 55 })
            .withMessage('Name must be between 2 and 55 characters'),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Must be a valid email'),
        body('subject')
            .trim()
            .isLength({ min: 2, max: 255 })
            .withMessage('Subject must be between 2 and 255 characters')
            .matches(/^[a-zA-Z0-9\s\-.,!?]+$/)
            .withMessage('Subject contains invalid characters'),
        body('message')
            .trim()
            .isLength({ min: 10, max: 2000 })
            .withMessage('Message must be between 10 and 2000 characters')
            .custom((value) => {
                // Check for spam patterns (excessive repetition)
                const words = value.split(/\s+/);
                const uniqueWords = new Set(words);
                if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
                    throw new Error('Message appears to be spam');
                }
                return true;
            })
    ],
    handleContactSubmission
);

/**
 * GET /contact/responses - Display all contact form submissions
 */
router.get('/responses', requireLogin, showContactResponses);

/**
 * GET /contact/responses/delete/:id - Delete selected id
 */
router.get('/responses/delete/:responseId', requireLogin, deleteContactResponse);

export default router;