const testCORS = async () => {
    try {
        console.log("Testing POST /api/auth/login to Render...");
        const response = await fetch('https://rupee-roast.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Origin': 'https://rupee-roast.vercel.app',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'test@test.com', password: 'test' })
        });
        
        console.log("STATUS:", response.status);
        console.log("Access-Control-Allow-Origin:", response.headers.get('access-control-allow-origin'));
        
        const data = await response.json();
        console.log("BODY:", data);
        
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
};

testCORS();
