const fs = require('fs');
const testCORS = async () => {
    try {
        const response = await fetch('https://rupee-roast.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Origin': 'https://rupee-roast.vercel.app',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'test@test.com', password: 'test' })
        });
        
        const out = [
          "STATUS: " + response.status,
          "CORS ORIGIN: " + response.headers.get('access-control-allow-origin'),
          "CREDENTIALS: " + response.headers.get('access-control-allow-credentials'),
          "BODY: " + JSON.stringify(await response.json())
        ].join('\n');
        
        fs.writeFileSync('remote_test_output.txt', out);
        console.log("Done. Check local file.");
    } catch (e) {
        fs.writeFileSync('remote_test_output.txt', "ERROR: " + e.message);
    }
};

testCORS();
