async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: `test${Date.now()}@test.com`, password: 'password123' })
    });
    const d = await res.json();
    console.log('Register response:', d);
    if (!d.data?.token) return;
    const token = d.data.token;
    
    // Test budget/set
    try {
      const budgetRes = await fetch('http://localhost:5000/api/budget/set', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ monthlyBudget: 5000 })
      });
      const bDat = await budgetRes.json();
      console.log('Budget Set:', bDat);
    } catch (e) { console.error('Budget error:', e); }

    // Test health-score
    try {
      const healthRes = await fetch('http://localhost:5000/api/finance/health-score', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const hDat = await healthRes.json();
      console.log('Health Score:', hDat);
    } catch (e) { console.error('Health Score error:', e); }

  } catch(e) {
    console.error('Register error:', e);
  }
}
test();
