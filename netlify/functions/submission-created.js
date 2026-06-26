// Auto-triggered by Netlify on every form submission (file MUST be named submission-created).
// Adds the submitter to a Brevo list. Configure via env vars:
//   BREVO_API_KEY   = your Brevo v3 API key (Settings > SMTP & API > API Keys)
//   BREVO_LIST_ID   = the numeric ID of the Brevo list to add contacts to
// Optional:
//   BREVO_SKIP_FORMS = comma-separated form names to ignore (e.g. "contact")

exports.handler = async (event) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const listId = parseInt(process.env.BREVO_LIST_ID || '0', 10);
    if (!apiKey || !listId) {
      console.log('Brevo not configured (set BREVO_API_KEY and BREVO_LIST_ID).');
      return { statusCode: 200, body: 'brevo not configured' };
    }

    const body = JSON.parse(event.body || '{}');
    const payload = body.payload || {};
    const data = payload.data || {};
    const formName = payload.form_name || data['form-name'] || '';

    // optional skip list
    const skip = (process.env.BREVO_SKIP_FORMS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (skip.includes(formName)) {
      console.log('Skipping form:', formName);
      return { statusCode: 200, body: 'skipped' };
    }

    const email = (data.email || payload.email || '').trim();
    if (!email) return { statusCode: 200, body: 'no email' };

    const fullName = (data.name || '').trim();
    const bits = fullName.split(/\s+/);
    const FIRSTNAME = bits.shift() || '';
    const LASTNAME = bits.join(' ');

    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME,
          LASTNAME,
          SOURCE: data.source || "Hound's Hearth website",
          SIGNUP_FORM: formName
        },
        listIds: [listId],
        updateEnabled: true   // update the contact if it already exists
      })
    });

    const text = await res.text();
    console.log('Brevo', res.status, text.slice(0, 300));
    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    console.error('submission-created error:', err);
    return { statusCode: 200, body: 'error logged' }; // 200 so Netlify does not retry-loop
  }
};
