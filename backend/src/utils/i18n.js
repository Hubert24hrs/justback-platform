// Multi-language support for JustBack
// Supports: English (en), Yoruba (yo), Igbo (ig), Hausa (ha), Pidgin (pcm)

const translations = {
    en: {
        // General
        welcome: 'Welcome to JustBack',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        home: 'Home',
        search: 'Search',
        bookings: 'Bookings',
        profile: 'Profile',
        settings: 'Settings',

        // Auth
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        loginSuccess: 'Login successful',
        registerSuccess: 'Registration successful',

        // Properties
        properties: 'Properties',
        perNight: 'per night',
        guests: 'guests',
        bedrooms: 'bedrooms',
        bathrooms: 'bathrooms',
        amenities: 'Amenities',
        reviews: 'Reviews',
        noReviews: 'No reviews yet',

        // Booking
        bookNow: 'Book Now',
        checkIn: 'Check-in',
        checkOut: 'Check-out',
        totalPrice: 'Total Price',
        confirmBooking: 'Confirm Booking',
        bookingConfirmed: 'Booking Confirmed!',
        bookingPending: 'Booking Pending',

        // Messages
        sendMessage: 'Send Message',
        typeMessage: 'Type a message...',
        noMessages: 'No messages yet',

        // Errors
        errorOccurred: 'An error occurred',
        tryAgain: 'Please try again',
        networkError: 'Network error. Check your connection.',

        // Notifications
        newBooking: 'New Booking Request',
        bookingApproved: 'Booking Approved',
        paymentReceived: 'Payment Received',
        newMessage: 'New Message'
    },

    yo: { // Yoruba
        welcome: 'Ẹ kú àbọ̀ sí JustBack',
        login: 'Wọlé',
        register: 'Forúkọsílẹ̀',
        logout: 'Jáde',
        home: 'Ilé',
        search: 'Wá',
        bookings: 'Àwọn ìpèsè',
        profile: 'Ìpèníjà',
        perNight: 'fún òru kan',
        bookNow: 'Pèsè Báyìí',
        confirmBooking: 'Fìdí múlẹ̀ Ìpèsè',
        sendMessage: 'Fi Ọ̀rọ̀ Ránṣẹ́',
        errorOccurred: 'Àṣìṣe kan ṣẹlẹ̀',
        tryAgain: 'Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kan sí i'
    },

    ig: { // Igbo
        welcome: 'Nnọọ na JustBack',
        login: 'Banye',
        register: 'Debanye aha',
        logout: 'Pụọ',
        home: 'Ụlọ',
        search: 'Chọọ',
        bookings: 'Nchekwa',
        profile: 'Profaịlụ',
        perNight: 'kwa abalị',
        bookNow: 'Debe Ugbu a',
        confirmBooking: 'Kwado Ndebe',
        sendMessage: 'Zipu Ozi',
        errorOccurred: 'Njehie mere',
        tryAgain: 'Biko nwaa ọzọ'
    },

    ha: { // Hausa
        welcome: 'Barka da zuwa JustBack',
        login: 'Shiga',
        register: 'Yi rajista',
        logout: 'Fita',
        home: 'Gida',
        search: 'Nema',
        bookings: 'Ajiyar wurare',
        profile: 'Bayanan ku',
        perNight: 'a dare',
        bookNow: 'Ajiye Yanzu',
        confirmBooking: 'Tabbatar da Ajiya',
        sendMessage: 'Aika Sako',
        errorOccurred: 'An sami kuskure',
        tryAgain: "Don Allah sake gwadawa"
    },

    pcm: { // Nigerian Pidgin
        welcome: 'Welcome to JustBack o!',
        login: 'Enter',
        register: 'Sign Up',
        logout: 'Comot',
        home: 'Home',
        search: 'Find',
        bookings: 'Your Bookings dem',
        profile: 'Your Profile',
        perNight: 'for one night',
        bookNow: 'Book Am Now',
        confirmBooking: 'Confirm the Booking',
        sendMessage: 'Send Message',
        errorOccurred: 'Wahala happen',
        tryAgain: 'Abeg try again'
    }
};

// Get translation
const t = (key, lang = 'en') => {
    const translation = translations[lang]?.[key] || translations.en[key] || key;
    return translation;
};

// Get all translations for a language
const getTranslations = (lang = 'en') => {
    return { ...translations.en, ...translations[lang] };
};

// Middleware to detect and set language
const i18nMiddleware = (req, res, next) => {
    // Priority: Query param > Header > Cookie > Default
    const lang =
        req.query.lang ||
        req.headers['accept-language']?.split(',')[0]?.split('-')[0] ||
        req.cookies?.lang ||
        'en';

    // Validate language
    req.lang = translations[lang] ? lang : 'en';

    // Add translation helper to request
    req.t = (key) => t(key, req.lang);

    next();
};

// Available languages
const supportedLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
    { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo' },
    { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
    { code: 'pcm', name: 'Pidgin', nativeName: 'Naija Pidgin' }
];

module.exports = {
    t,
    getTranslations,
    i18nMiddleware,
    supportedLanguages,
    translations
};
