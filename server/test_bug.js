import axios from 'axios';
async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', { name: 'Test', email: `test${Date.now()}@test.com`, password: 'password123' });
    const token = res.data.data.token;
    
    // Test budget/set
    try {
      const budgetRes = await axios.post('http://localhost:5000/api/budget/set', { monthlyBudget: 5000 }, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Budget Set:', budgetRes.data);
    } catch (e) { console.error('Budget error:', e.response?.data || e.message); }

    // Test health-score
    try {
      const healthRes = await axios.get('http://localhost:5000/api/finance/health-score', { headers: { Authorization: `Bearer ${token}` } });
      console.log('Health Score:', healthRes.data);
    } catch (e) { console.error('Health Score error:', e.response?.data || e.message); }

  } catch(e) {
    console.error('Register error:', e.response?.data || e.message);
  }
}
test();
