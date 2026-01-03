const express = require('express');
const router = express.Router();
const { supportedLanguages, getTranslations } = require('../utils/i18n');

// Get supported languages
router.get('/languages', (req, res) => {
    res.json({
        success: true,
        data: {
            languages: supportedLanguages,
            default: 'en'
        }
    });
});

// Get translations for a language
router.get('/translations/:lang', (req, res) => {
    const { lang } = req.params;
    const translations = getTranslations(lang);

    res.json({
        success: true,
        data: {
            language: lang,
            translations
        }
    });
});

module.exports = router;
