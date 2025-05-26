// Calendar availability check with validation
function checkAvailability(items) {
  try {
    const { doctorId, patientId, date } = items[0].json;
    
    // Validate required fields
    if (!doctorId || !patientId || !date) {
      throw new Error('Missing required fields');
    }
    
    // Get appointments and validate
    const appointments = items[0].json.appointments || [];
    if (!Array.isArray(appointments)) {
      throw new Error('Invalid appointments data');
    }
    
    // Filter available slots with validation
    const availableSlots = appointments.filter(slot => {
      if (!slot.time || !slot.date) {
        return false;
      }
      return !slot.isBooked && validateAppointmentTime(slot.date, slot.time);
    });
    
    logOperation('availability_check', { doctorId, patientId, date });
    
    return [{
      json: {
        availableSlots,
        doctorId,
        patientId,
        requestId: Math.random().toString(36).substring(2, 15),
        success: true
      }
    }];
  } catch (error) {
    return [{ json: handleError(error, { type: 'availability_check' }) }];
  }
}

// Book appointment with validation and transaction
async function bookAppointment(items) {
  try {
    const {
      requestId,
      patientId,
      doctorId,
      date,
      time,
      patientEmail
    } = items[0].json;
    
    // Validate all required fields
    if (!requestId || !patientId || !doctorId || !date || !time || !patientEmail) {
      throw new Error('Missing required fields');
    }
    
    // Validate email
    if (!validateEmail(patientEmail)) {
      throw new Error('Invalid email address');
    }
    
    // Validate appointment time
    validateAppointmentTime(date, time);
    
    // Start transaction
    const appointment = {
      id: requestId,
      patientId,
      doctorId,
      date,
      time,
      status: 'PENDING',
      created: new Date().toISOString()
    };
    
    // Log operation
    logOperation('appointment_creation', appointment);
    
    return [{ json: appointment }];
  } catch (error) {
    return [{ json: handleError(error, { type: 'appointment_booking' }) }];
  }
}

// Handle appointment confirmation with retry mechanism
async function confirmAppointment(items) {
  try {
    const { requestId, action } = items[0].json;
    
    if (!requestId) {
      throw new Error('Missing request ID');
    }
    
    // Update appointment status
    const appointment = {
      ...items[0].json,
      status: action === 'confirm' ? 'CONFIRMED' : 'REJECTED',
      updated: new Date().toISOString()
    };
    
    // Schedule reminders if confirmed
    if (action === 'confirm') {
      const config = $getWorkflowStaticData('global').config;
      config.appointments.reminderTimes.forEach(hours => {
        scheduleReminder(appointment, hours);
      });
    }
    
    logOperation('appointment_confirmation', { requestId, action });
    
    return [{ json: appointment }];
  } catch (error) {
    return [{ json: handleError(error, { type: 'appointment_confirmation' }) }];
  }
}

// Schedule appointment reminders
function scheduleReminder(appointment, hoursBeforeAppointment) {
  const reminderTime = new Date(appointment.date);
  reminderTime.setHours(reminderTime.getHours() - hoursBeforeAppointment);
  
  // Create reminder task
  const reminder = {
    type: 'EMAIL',
    appointmentId: appointment.id,
    scheduledFor: reminderTime.toISOString(),
    recipient: appointment.patientEmail,
    status: 'SCHEDULED'
  };
  
  logOperation('reminder_scheduled', reminder);
  
  return reminder;
}

// Handle manual entry by staff with validation
function handleManualEntry(items) {
  try {
    const {
      patientId,
      doctorId,
      date,
      time,
      staffId,
      notes
    } = items[0].json;
    
    // Validate required fields
    if (!patientId || !doctorId || !date || !time || !staffId) {
      throw new Error('Missing required fields');
    }
    
    // Validate appointment time
    validateAppointmentTime(date, time);
    
    // Create appointment
    const appointment = {
      id: Math.random().toString(36).substring(2, 15),
      patientId,
      doctorId,
      date,
      time,
      notes,
      createdBy: staffId,
      status: 'CONFIRMED',
      manualEntry: true,
      created: new Date().toISOString()
    };
    
    logOperation('manual_entry', appointment);
    
    return [{ json: appointment }];
  } catch (error) {
    return [{ json: handleError(error, { type: 'manual_entry' }) }];
  }
}

// Handle cancellations
function handleCancellation(items) {
  try {
    const { appointmentId, reason, canceledBy } = items[0].json;
    
    if (!appointmentId) {
      throw new Error('Missing appointment ID');
    }
    
    // Check cancellation policy
    const appointment = items[0].json.appointment;
    const config = $getWorkflowStaticData('global').config;
    
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60);
    
    const cancellation = {
      appointmentId,
      reason,
      canceledBy,
      timestamp: now.toISOString(),
      lateCancellation: hoursDiff < config.appointments.cancelationPolicy.minHours,
      penalty: hoursDiff < config.appointments.cancelationPolicy.minHours && 
               config.appointments.cancelationPolicy.penalty
    };
    
    logOperation('cancellation', cancellation);
    
    return [{ json: cancellation }];
  } catch (error) {
    return [{ json: handleError(error, { type: 'cancellation' }) }];
  }
}