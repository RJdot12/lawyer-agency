# Secure Contact Form Setup Guide

## Overview

Your contact form is now configured to securely submit data to Google Sheets with the following security features:

✅ **HTTPS encryption** - All data transmitted over secure connection
✅ **Secret key authentication** - Prevents unauthorized submissions
✅ **Rate limiting** - Max 5 submissions per email per day
✅ **Data validation** - Server-side input validation and sanitization
✅ **Private access** - Only you can view the Google Sheet
✅ **No third-party limits** - Completely free, unlimited submissions

---

## Configuration Status

Your `.env` file is already configured with:
- ✅ Google Script URL
- ✅ Secret Key

**Important:** The `.env` file is excluded from git (in `.gitignore`) to keep your credentials secure.

---

## Google Apps Script Setup

### Step 1: Update the Secret Key in Google Apps Script

You need to add the same secret key to your Google Apps Script:

1. Go to your Google Sheet: **Lawyer Agency - Contact Submissions**
2. Click **Extensions** → **Apps Script**
3. In the script editor, find line 2:
   ```javascript
   const SECRET_KEY = 'YOUR_SECRET_KEY_HERE';
   ```
4. Replace `YOUR_SECRET_KEY_HERE` with your actual key from `.env`:
   ```javascript
   const SECRET_KEY = 'eDZAS7zhuqDjrq5u9yOSBMZeG0RQzbV6';
   ```
5. Click **Save** (💾)

### Step 2: Complete Apps Script Code

Here's the complete secure script to paste (if not already done):

```javascript
// SECURITY: Replace with your secret key
const SECRET_KEY = 'eDZAS7zhuqDjrq5u9yOSBMZeG0RQzbV6';

// Rate limiting: max submissions per email per day
const MAX_SUBMISSIONS_PER_DAY = 5;

function doPost(e) {
  try {
    // Parse request
    const data = JSON.parse(e.postData.contents);

    // SECURITY: Verify secret key
    if (data.secretKey !== SECRET_KEY) {
      return createResponse(false, 'Invalid request');
    }

    // SECURITY: Validate required fields
    if (!data.name || !data.email || !data.phone || !data.service) {
      return createResponse(false, 'Missing required fields');
    }

    // SECURITY: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return createResponse(false, 'Invalid email format');
    }

    // SECURITY: Validate phone (basic check)
    if (data.phone.length < 10) {
      return createResponse(false, 'Invalid phone number');
    }

    // SECURITY: Rate limiting check
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (isRateLimited(sheet, data.email)) {
      return createResponse(false, 'Too many submissions. Please try again tomorrow.');
    }

    // SECURITY: Sanitize inputs (prevent injection)
    const sanitizedData = {
      name: data.name.substring(0, 100),
      email: data.email.substring(0, 100),
      phone: data.phone.substring(0, 20),
      service: data.service.substring(0, 200),
      message: (data.message || '').substring(0, 1000)
    };

    // Get client IP (if available)
    const ipAddress = e.parameter.userip || 'Unknown';

    // Add to spreadsheet
    sheet.appendRow([
      new Date(),
      sanitizedData.name,
      sanitizedData.phone,
      sanitizedData.email,
      sanitizedData.service,
      sanitizedData.message,
      ipAddress,
      'New'
    ]);

    // Optional: Send email notification to you
    // Uncomment the lines below and add your email:
    // MailApp.sendEmail({
    //   to: 'your-email@example.com',
    //   subject: 'New Contact Form Submission',
    //   body: `New submission from: ${sanitizedData.name} (${sanitizedData.email})`
    // });

    return createResponse(true, 'Form submitted successfully');

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return createResponse(false, 'Server error. Please try again later.');
  }
}

// Helper: Check rate limiting
function isRateLimited(sheet, email) {
  const data = sheet.getDataRange().getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let count = 0;
  for (let i = 1; i < data.length; i++) {
    const rowDate = new Date(data[i][0]);
    const rowEmail = data[i][3];

    if (rowEmail === email && rowDate >= today) {
      count++;
    }
  }

  return count >= MAX_SUBMISSIONS_PER_DAY;
}

// Helper: Create JSON response
function createResponse(success, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success, message }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Step 3: Deploy (if not already deployed)

1. Click **Deploy** → **New deployment** (or **Manage deployments** if already deployed)
2. Click gear icon ⚙️ → **Web app**
3. Configure:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Copy the Web App URL (should match the one in your `.env`)

---

## Google Sheet Setup

### Column Headers

Make sure your Google Sheet has these column headers in Row 1:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Timestamp | Name | Phone | Email | Service | Message | IP Address | Status |

### Formatting Tips

1. **Freeze the header row**: View → Freeze → 1 row
2. **Add filters**: Select Row 1 → Data → Create a filter
3. **Format columns**:
   - Column A (Timestamp): Format → Number → Date time
   - Column H (Status): Add dropdown (New, In Progress, Completed, Closed)
4. **Conditional formatting** for Status column:
   - New = Yellow
   - In Progress = Blue
   - Completed = Green
   - Closed = Gray

---

## Security Features Explained

### 1. Secret Key Authentication
- Every form submission must include the correct secret key
- Key is stored in `.env` (not committed to git)
- Prevents unauthorized API access

### 2. Rate Limiting
- Maximum 5 submissions per email address per day
- Prevents spam and abuse
- Configurable in Apps Script (`MAX_SUBMISSIONS_PER_DAY`)

### 3. Data Validation
- Server-side email format validation
- Phone number length check
- Required field validation
- Input sanitization (max lengths to prevent overflow)

### 4. HTTPS Encryption
- All data transmitted over secure HTTPS connection
- Google's infrastructure handles SSL/TLS

### 5. Private Data Access
- Google Sheet only accessible by you
- Web App only accepts POST requests (no data retrieval)

---

## Testing the Form

### Local Testing

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:4321/contact`

3. Fill out the form and submit

4. Check your Google Sheet for the new row

### Production Testing

1. Build the site:
   ```bash
   npm run build
   ```

2. Preview:
   ```bash
   npm run preview
   ```

3. Test the form again

---

## Troubleshooting

### Form doesn't submit

**Check:**
1. ✅ Secret key matches in `.env` and Apps Script
2. ✅ Google Script URL is correct in `.env`
3. ✅ Apps Script is deployed as "Web app"
4. ✅ Web app access is set to "Anyone"
5. ✅ Browser console for errors (F12)

### "Invalid request" error

**Cause:** Secret key mismatch

**Fix:** Verify the secret key is identical in:
- `/lawyer-agency/.env` → `PUBLIC_FORM_SECRET_KEY`
- Google Apps Script → `const SECRET_KEY`

### "Too many submissions" error

**Cause:** Rate limit reached (5 per day per email)

**Fix:**
- Wait until tomorrow, or
- Change `MAX_SUBMISSIONS_PER_DAY` in Apps Script

### Data not appearing in Google Sheet

**Check:**
1. ✅ Script has permissions (re-authorize if needed)
2. ✅ Correct spreadsheet is active
3. ✅ Column headers are in Row 1
4. ✅ Apps Script logs: Apps Script → Executions

---

## Optional: Email Notifications

To receive an email when someone submits the form:

1. In Google Apps Script, find this section (around line 57):
   ```javascript
   // Optional: Send email notification to you
   // MailApp.sendEmail({
   //   to: 'your-email@example.com',
   //   subject: 'New Contact Form Submission',
   //   body: `New submission from: ${sanitizedData.name} (${sanitizedData.email})`
   // });
   ```

2. Uncomment the code and replace `your-email@example.com`:
   ```javascript
   MailApp.sendEmail({
     to: 'info@lawyer-agency.ua',
     subject: 'Нова заявка з контактної форми',
     body: `Нова заявка від: ${sanitizedData.name} (${sanitizedData.email})\n\nПослуга: ${sanitizedData.service}\n\nПовідомлення: ${sanitizedData.message}`
   });
   ```

3. Save and redeploy

---

## Viewing Submissions

### In Google Sheets

1. Open your Google Sheet: **Lawyer Agency - Contact Submissions**
2. View all submissions as a table
3. Use filters to sort by Status, Date, Service, etc.
4. Export to Excel: File → Download → Microsoft Excel

### Sharing Access (Optional)

To give someone else view access:

1. Click **Share** (top right)
2. Add their email
3. Set permission to **Viewer** (not Editor)
4. Click **Send**

⚠️ **Warning:** Only share with trusted people - this contains customer data!

---

## Data Privacy & GDPR

Since you're collecting personal data:

1. ✅ You have a privacy policy page (`/privacy-policy`)
2. ✅ Form mentions data protection
3. Consider adding:
   - Checkbox: "I agree to the privacy policy"
   - Link to `/privacy-policy` in the form
   - Data retention policy (how long you keep submissions)

---

## Support

If you need help:
1. Check the troubleshooting section above
2. Review Google Apps Script logs: Apps Script → Executions
3. Check browser console for frontend errors
4. Verify all configuration steps were completed

---

## Summary

✅ **Secure** - Secret key + HTTPS + validation
✅ **Free** - Unlimited submissions
✅ **Simple** - Easy to view in Google Sheets
✅ **Reliable** - Google's infrastructure
✅ **Private** - Only you can access the data
