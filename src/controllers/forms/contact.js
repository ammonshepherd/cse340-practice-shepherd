import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { createContactForm, getAllContactForms, deleteResponse } from '../../models/forms/contact.js';

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
        // Log validation errors for developer debugging
        console.error('Validation errors:', errors.array());
        // Redirect back to form without saving
        return res.redirect('/contact');
    }

    // Extract validated data
    const { name, email, subject, message } = req.body;

    try {
        // Save to database
        await createContactForm(name, email, subject, message);
        console.log('Contact form submitted successfully');
        // Redirect to responses page on success
        res.redirect('/contact/responses');
    } catch (error) {
        console.error('Error saving contact form:', error);
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
        rows = deleteResponse(responseId);
        console.log(rows);
        console.log("response deleted");
    } catch (error) {
        console.log("Error deleting response", error);
    }

    res.redirect('/contact');
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
            .isLength({ min: 2 })
            .withMessage('Name must be at least 2 characters'),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Must be a valid email'),
        body('subject')
            .trim()
            .isLength({ min: 2 })
            .withMessage('Subject must be at least 2 characters'),
        body('message')
            .trim()
            .isLength({ min: 10 })
            .withMessage('Message must be at least 10 characters')
    ],
    handleContactSubmission
);

/**
 * GET /contact/responses - Display all contact form submissions
 */
router.get('/responses', showContactResponses);

/**
 * GET /contact/responses/delete/:id - Delete selected id
 */
router.get('/responses/delete/:responseId', deleteContactResponse);

export default router;