import https from 'https';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('GEMINI_API_KEY not found in environment');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                const names = json.models.map(m => m.name);
                console.log('Available Models:');
                console.log(JSON.stringify(names, null, 2));
                
                const imageModels = names.filter(n => n.toLowerCase().includes('image'));
                console.log('\nImage Generation Models:');
                console.log(JSON.stringify(imageModels, null, 2));
            } else {
                console.log('No models found or error response:', JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw data:', data);
        }
    });
}).on('error', (err) => {
    console.error('Request error:', err.message);
});