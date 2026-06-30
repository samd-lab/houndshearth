// Auto-triggered by Netlify on every form submission (file MUST be named submission-created).
// Adds the submitter to a Brevo list. Configure via env vars:
//   BREVO_API_KEY   = your Brevo v3 API key (Settings > SMTP & API > API Keys)
//   BREVO_LIST_ID   = the numeric ID of the Brevo list to add contacts to
// Optional:
//   BREVO_PARTNER_LIST_ID = list ID for Partner Network signups (form "partner-signup").
//                           If unset, partner leads fall back to BREVO_LIST_ID (tagged via SIGNUP_FORM).
//   BREVO_SKIP_FORMS = comma-separated form names to ignore (e.g. "contact")
//
// Partner intake fields (name,email,phone,business,instagram,website,role,audience,city,state,dogs_monthly)
// are always packed into the SOURCE note (which exists in every Brevo account) and ALSO sent as
// structured attributes. If Brevo rejects an unknown attribute (400), we retry with safe attributes only,
// so a lead is never lost even before you create the matching contact attributes in Brevo.

exports.handler = async (event) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const listId = parseInt(process.env.BREVO_LIST_ID || '0', 10);
    const partnerListId = parseInt(process.env.BREVO_PARTNER_LIST_ID || '0', 10);
    const guideListId = parseInt(process.env.BREVO_GUIDE_LIST_ID || '0', 10);

    const body = JSON.parse(event.body || '{}');
    const payload = body.payload || {};
    const data = payload.data || {};
    const formName = payload.form_name || data['form-name'] || '';

    const skip = (process.env.BREVO_SKIP_FORMS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (skip.includes(formName)) {
      console.log('Skipping form:', formName);
      return { statusCode: 200, body: 'skipped' };
    }

    // Route signups to their dedicated list when configured; else fall back to the main list.
    const isPartner = formName === 'partner-signup';
    const isGuide = formName === 'guide-signup';
    const targetList = (isPartner && partnerListId) ? partnerListId
                     : (isGuide && guideListId) ? guideListId
                     : listId;
    if (!apiKey || !targetList) {
      console.log('Brevo not configured (set BREVO_API_KEY and BREVO_LIST_ID / BREVO_PARTNER_LIST_ID).');
      return { statusCode: 200, body: 'brevo not configured' };
    }

    const email = (data.email || payload.email || '').trim();
    if (!email) return { statusCode: 200, body: 'no email' };

    const fullName = (data.name || '').trim();
    const bits = fullName.split(/\s+/);
    const FIRSTNAME = bits.shift() || '';
    const LASTNAME = bits.join(' ');

    const g = (k) => (data[k] || '').toString().trim();
    const phone = g('phone'), business = g('business'), instagram = g('instagram'),
          website = g('website'), role = g('role'), audience = g('audience'),
          city = g('city'), state = g('state'), dogs = g('dogs_monthly');
    const baseSource = g('source') || "Hound's Hearth website";

    // Human-readable summary packed into SOURCE (always works — attribute exists).
    const parts = [baseSource];
    if (role)      parts.push('type: ' + role);
    if (phone)     parts.push('phone: ' + phone);
    if (business)  parts.push('business: ' + business);
    if (instagram) parts.push('ig: ' + instagram);
    if (website)   parts.push('web: ' + website);
    if (audience)  parts.push('audience: ' + audience);
    if (dogs)      parts.push('dogs/mo: ' + dogs);
    if (city || state) parts.push('loc: ' + [city, state].filter(Boolean).join(', '));
    const sourceNote = parts.join(' | ');

    const safeAttrs = { FIRSTNAME, LASTNAME, SOURCE: sourceNote, SIGNUP_FORM: formName };

    // Structured attributes (best effort — if created in Brevo, these populate; if not, we fall back).
    const richAttrs = Object.assign({}, safeAttrs);
    if (role)      richAttrs.ROLE = role;
    if (phone)     richAttrs.PHONE = phone;
    if (business)  richAttrs.BUSINESS = business;
    if (instagram) richAttrs.INSTAGRAM = instagram;
    if (website)   richAttrs.WEBSITE = website;
    if (audience)  richAttrs.AUDIENCE_SIZE = audience;
    if (city)      richAttrs.CITY = city;
    if (state)     richAttrs.STATE = state;
    if (dogs)      richAttrs.DOGS_MONTHLY = dogs;

    async function addContact(attrs) {
      return fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'Content-Type': 'application/json', 'accept': 'application/json' },
        body: JSON.stringify({ email, attributes: attrs, listIds: [targetList], updateEnabled: true })
      });
    }

    let res = await addContact(richAttrs);
    if (!res.ok && res.status === 400) {
      const errText = await res.text();
      console.log('Brevo 400 with rich attrs, retrying with safe attrs:', errText.slice(0, 160));
      res = await addContact(safeAttrs);
    }
    const text = await res.text();
    console.log('Brevo', res.status, text.slice(0, 300));
    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    console.error('submission-created error:', err);
    return { statusCode: 200, body: 'error logged' }; // 200 so Netlify does not retry-loop
  }
};
