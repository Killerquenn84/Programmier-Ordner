// Email template handler with retry mechanism
async function sendEmail(type, data, retryCount = 0) {
  try {
    const config = $getWorkflowStaticData('global').config;
    const templates = {
      CONFIRMATION: {
        subject: 'Terminbestätigung',
        template: `
          Sehr geehrte(r) {{patientName}},
          
          Ihr Termin wurde bestätigt:
          Datum: {{date}}
          Uhrzeit: {{time}}
          Arzt: {{doctorName}}
          
          Bitte erscheinen Sie 10 Minuten vor Ihrem Termin.
          
          Mit freundlichen Grüßen,
          Ihre Praxis
        `
      },
      REMINDER: {
        subject: 'Terminerinnerung',
        template: `
          Sehr geehrte(r) {{patientName}},
          
          Dies ist eine Erinnerung an Ihren morgigen Termin:
          Datum: {{date}}
          Uhrzeit: {{time}}
          Arzt: {{doctorName}}
          
          Mit freundlichen Grüßen,
          Ihre Praxis
        `
      },
      CANCELLATION: {
        subject: 'Terminabsage',
        template: `
          Sehr geehrte(r) {{patientName}},
          
          Leider müssen wir Ihren Termin am {{date}} um {{time}} absagen.
          {{#if alternativeDates}}
          Folgende alternative Termine stehen zur Verfügung:
          {{#each alternativeDates}}
          - {{date}} {{time}}
          {{/each}}
          
          Bitte buchen Sie einen neuen Termin unter: {{bookingUrl}}
          {{/if}}
          
          Mit freundlichen Grüßen,
          Ihre Praxis
        `
      },
      RESCHEDULING: {
        subject: 'Terminverschiebung',
        template: `
          Sehr geehrte(r) {{patientName}},
          
          Ihr Termin wurde verschoben:
          Alter Termin: {{oldDate}} {{oldTime}}
          Neuer Termin: {{newDate}} {{newTime}}
          
          Falls der neue Termin nicht passt, können Sie unter {{bookingUrl}} einen anderen Termin wählen.
          
          Mit freundlichen Grüßen,
          Ihre Praxis
        `
      }
    };
    
    // Validate email
    if (!validateEmail(data.recipientEmail)) {
      throw new Error('Invalid recipient email');
    }
    
    const template = templates[type];
    if (!template) {
      throw new Error('Invalid template type');
    }
    
    // Compile template with data
    const compiledTemplate = template.template.replace(
      /{{(\w+)}}/g,
      (match, key) => data[key] || ''
    );
    
    // Send email
    const emailResult = await $node.sendEmail({
      to: data.recipientEmail,
      subject: template.subject,
      text: compiledTemplate
    });
    
    logOperation('email_sent', {
      type,
      recipient: data.recipientEmail,
      success: true
    });
    
    return emailResult;
    
  } catch (error) {
    // Implement retry mechanism
    if (retryCount < config.email.retryAttempts) {
      await new Promise(resolve => 
        setTimeout(resolve, config.email.retryDelay * (retryCount + 1))
      );
      return sendEmail(type, data, retryCount + 1);
    }
    
    logOperation('email_error', {
      type,
      error: error.message,
      retryCount
    });
    
    throw error;
  }
}