/**
 * Prague Quant Club — receiver for the application terminal on the website.
 *
 * What it does with each application:
 *   1. checks it (required fields, e-mail shape, consent, PDF up to 5 MB),
 *   2. saves the CV into a Drive folder called "PQC applications - CVs",
 *   3. adds a row to this spreadsheet,
 *   4. e-mails a notice to the account that owns the script.
 *
 * Setup (once, in the club's Google account):
 *   1. Create a new Google Sheet, e.g. "PQC applications".
 *   2. In that sheet: Extensions -> Apps Script. Delete the sample code and
 *      paste this whole file. Save.
 *   3. Deploy -> New deployment -> type "Web app".
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      Approve the permissions Google asks for (Sheets, Drive, Mail).
 *   4. Copy the web app URL (it ends with /exec) into APPLY_ENDPOINT at the
 *      top of script.js on the website.
 *
 * After editing this file later: Deploy -> Manage deployments -> edit ->
 * Version "New version", otherwise the old code keeps running.
 */

var MAX_CV_BYTES = 5 * 1024 * 1024;   // keep in sync with MAX_CV in script.js
var CV_FOLDER_NAME = "PQC applications - CVs";
var HEADER = ["Received", "Name", "School", "E-mail", "Motivation", "CV", "Consent", "Language"];

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.website) return json({ ok: true });            // spam trap was filled: pretend success

    var name = field(d.name, 200), school = field(d.school, 200);
    var email = field(d.email, 200), motivation = field(d.motivation, 1500);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("invalid e-mail");
    if (d.consent !== true) throw new Error("consent is required");

    if (!d.cv || typeof d.cv.data !== "string") throw new Error("CV is missing");
    if (d.cv.data.length > MAX_CV_BYTES * 1.4) throw new Error("CV is too large");   // base64 is ~1.37x
    var bytes = Utilities.base64Decode(d.cv.data);
    if (bytes.length > MAX_CV_BYTES) throw new Error("CV is too large");
    // A real PDF starts with "%PDF" — do not trust the type the browser claims.
    if (bytes.length < 5 || bytes[0] !== 37 || bytes[1] !== 80 || bytes[2] !== 68 || bytes[3] !== 70) {
      throw new Error("CV must be a PDF");
    }

    var stamp = Utilities.formatDate(new Date(), "Europe/Prague", "yyyy-MM-dd HHmm");
    var fileName = stamp + " " + name.replace(/[^\p{L}\p{N} ._-]/gu, "").slice(0, 60) + ".pdf";
    var file = cvFolder().createFile(Utilities.newBlob(bytes, "application/pdf", fileName));

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADER);
    sheet.appendRow([new Date(), cell(name), cell(school), cell(email), cell(motivation),
                     file.getUrl(), "yes", d.lang === "en" ? "en" : "cs"]);

    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      replyTo: email,
      subject: "PQC application: " + name,
      body: "Name: " + name + "\nSchool: " + school + "\nE-mail: " + email +
            "\n\nMotivation:\n" + motivation + "\n\nCV: " + file.getUrl()
    });

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  }
}

/** Required text field, trimmed, with a length limit. */
function field(value, max) {
  var s = String(value == null ? "" : value).trim();
  if (!s) throw new Error("a required field is empty");
  if (s.length > max) throw new Error("a field is too long");
  return s;
}

/** Sheets treats text starting with = + - @ as a formula; a leading ' keeps it text. */
function cell(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

/** The Drive folder for CVs: created on first use, then remembered by id. */
function cvFolder() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("CV_FOLDER_ID");
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (err) { /* deleted: make a new one */ }
  }
  var folder = DriveApp.createFolder(CV_FOLDER_NAME);
  props.setProperty("CV_FOLDER_ID", folder.getId());
  return folder;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
