module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('[API] Test endpoint called');
    
    return res.status(200).json({
      status: 'success',
      message: 'API is working',
      timestamp: new Date().toISOString(),
      method: req.method,
      hasPrivateKey: !!process.env.PRIVATE_KEY
    });

  } catch (error) {
    console.error('[API] Test error:', error);
    return res.status(500).json({
      error: error.message || 'Test failed',
      status: 'error'
    });
  }
};