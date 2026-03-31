const base = 'http://127.0.0.1:5000';

const jsonHeaders = { 'Content-Type': 'application/json' };

const request = async (path, { method = 'GET', token, body } = {}) => {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...jsonHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(`${method} ${path} failed: ${msg}`);
  }

  return data;
};

const main = async () => {
  const email = `smoke_${Date.now()}@example.com`;
  const password = 'TestPassword#123';
  const name = 'Smoke Tester';

  console.log('1) Register...');
  let token;
  try {
    const reg = await request('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    token = reg?.data?.token;
  } catch (e) {
    console.warn('Register failed, attempting login:', e.message);
    const login = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    token = login?.data?.token;
  }

  if (!token) throw new Error('No JWT token received.');

  console.log('2) Add expense...');
  const today = new Date().toISOString().split('T')[0];
  await request('/expenses/add', {
    method: 'POST',
    token,
    body: {
      title: 'Coffee blast',
      amount: 350,
      category: 'food',
      type: 'impulsive',
      date: today,
      notes: 'Smoke test expense',
    },
  });

  console.log('3) Generate roast (Gemini may fail -> fallback expected)...');
  const roast1 = await request('/roast/generate', { method: 'POST', token });
  if (!roast1?.roast || !roast1?.insight || !roast1?.suggestion) {
    throw new Error('Roast response missing roast/insight/suggestion.');
  }
  console.log('   -> roast1 keys:', Object.keys(roast1));

  console.log('4) Verify cache hit on identical state...');
  const roast2 = await request('/roast/generate', { method: 'POST', token });
  if (!roast2?.cached) {
    throw new Error('Expected cached=true on second roast generation.');
  }
  console.log('   -> roast2.cached:', roast2.cached, 'fallbackUsed:', roast2.fallbackUsed);

  console.log('5) Verify /roast/latest...');
  const latest = await request('/roast/latest', { method: 'GET', token });
  if (!latest?.roast) throw new Error('Expected latest roast payload.');
  console.log('   -> latest.createdAt:', latest.createdAt);

  console.log('6) Verify /finance/summary...');
  const summary = await request('/finance/summary', { method: 'GET', token });
  const payload = summary?.data || summary;
  if (!payload?.totalMonthlySpending || !payload?.categoryBreakdown) {
    throw new Error('Expected finance summary analytics.');
  }
  console.log('   -> summary.highestSpendingCategory:', payload.highestSpendingCategory);

  console.log('Smoke test completed successfully.');
};

main().catch((err) => {
  console.error('Smoke test failed:', err.message);
  process.exit(1);
});

