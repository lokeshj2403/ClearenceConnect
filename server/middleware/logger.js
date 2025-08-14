/**
 * Request Logger Middleware
 * 
 * Logs all incoming HTTP requests with details
 * Useful for debugging and monitoring
 */

const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log request details
  console.log(`
  📨 ${req.method} ${req.originalUrl}
  🌐 IP: ${req.ip}
  🕐 Time: ${new Date().toISOString()}
  📱 User-Agent: ${req.get('User-Agent') || 'Unknown'}
  ${req.body && Object.keys(req.body).length > 0 ? `📦 Body: ${JSON.stringify(req.body, null, 2)}` : ''}
  ${req.query && Object.keys(req.query).length > 0 ? `🔍 Query: ${JSON.stringify(req.query, null, 2)}` : ''}
  `);

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Log response details
    console.log(`
    📤 Response: ${req.method} ${req.originalUrl}
    ⏱️  Duration: ${duration}ms
    📊 Status: ${statusCode}
    ${statusCode >= 400 ? `❌ Error: ${body.message || 'Unknown error'}` : '✅ Success'}
    `);
    
    return originalJson.call(this, body);
  };

  next();
};

module.exports = logger;