// Input validation
function validateEmail(email) {
  const config = $getWorkflowStaticData('global').config;
  const emailRegex = new RegExp(config.validation.emailRegex);
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const config = $getWorkflowStaticData('global').config;
  const phoneRegex = new RegExp(config.validation.phoneRegex);
  return phoneRegex.test(phone);
}

function validateAppointmentTime(date, time) {
  const appointmentDate = new Date(`${date}T${time}`);
  const now = new Date();
  
  // Check minimum notice period
  const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60);
  if (hoursDiff < config.appointments.minNotice) {
    throw new Error(`Appointments must be booked at least ${config.appointments.minNotice} hours in advance`);
  }
  
  // Check maximum future booking
  const daysDiff = hoursDiff / 24;
  if (daysDiff > config.appointments.maxFutureBooking) {
    throw new Error(`Appointments cannot be booked more than ${config.appointments.maxFutureBooking} days in advance`);
  }
  
  return true;
}

// Error handling
function handleError(error, context) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: error.message,
    context,
    stack: error.stack
  };
  
  // Log error
  $node.log('error', errorLog);
  
  // Return user-friendly error
  return {
    success: false,
    error: error.message,
    requestId: context.requestId
  };
}

// Authentication
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Rate limiting
const rateLimitStore = {};

function checkRateLimit(ip) {
  const config = $getWorkflowStaticData('global').config;
  const now = Date.now();
  
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = {
      count: 0,
      windowStart: now
    };
  }
  
  const store = rateLimitStore[ip];
  
  if (now - store.windowStart > config.security.rateLimit.windowMs) {
    store.count = 0;
    store.windowStart = now;
  }
  
  store.count++;
  
  if (store.count > config.security.rateLimit.maxRequests) {
    throw new Error('Rate limit exceeded');
  }
  
  return true;
}

// Logging
function logOperation(operation, data) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    data,
    user: data.userId || 'anonymous'
  };
  
  $node.log('info', logEntry);
}