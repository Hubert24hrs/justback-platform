try {
    console.log('Testing Pinecone import...');
    const pkg = require('@pinecone-database/pinecone');
    console.log('Export keys:', Object.keys(pkg));

    try {
        const { Pinecone } = pkg;
        console.log('Pinecone class:', Pinecone);
    } catch (e) { console.log('Destructure failed'); }

} catch (e) {
    console.error('Require failed:', e);
}
