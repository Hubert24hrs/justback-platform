try {
    console.log('Starting debug...');
    require('./src/server');
    console.log('Server required successfully');
} catch (error) {
    console.error('SERVER CRASHED:', error);
}

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err);
});
