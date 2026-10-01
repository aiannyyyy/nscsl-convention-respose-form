/**
 * NSCSL Convention 2026 - registration backend (Google Apps Script web app).
 *
 * Setup: fill in the two spreadsheet IDs below, then Deploy > New deployment >
 * Web app > Execute as: Me, Who has access: Anyone.
 */
var TZ = 'Asia/Manila';

// Date (Asia/Manila) -> day config. Registration is closed on any other date.
var TEST_SHEET_ID = '1RKChg-x4OVzzGjuR-gsP0ej2nX-wlsaXXeXZQtXStlQ'; // NSCSL Convention Testing Responses
var DAYS = {
  // Testing (Oct 1-4) -> day 0. Remove these four lines once testing is done.
  '2026-10-01': { day: 0, sheetId: TEST_SHEET_ID },
  '2026-10-02': { day: 0, sheetId: TEST_SHEET_ID },
  '2026-10-03': { day: 0, sheetId: TEST_SHEET_ID },
  '2026-10-04': { day: 0, sheetId: TEST_SHEET_ID },
  // Convention
  '2026-10-05': { day: 1, sheetId: '1VQtpoMScALau2WfQLF07jFNXq9SM2ZWwPD6NSBge2WU' }, // NSCSL Convention 2026 Responses Day 1
  '2026-10-06': { day: 2, sheetId: '1f3H-fc8-smUpZywPFJZkfYxmtktI4w1hLg5Bpnow7k8' }  // NSCSL Convention 2026 Responses Day 2
};

var HEADERS = ['Timestamp', 'Control Number', 'Email Address', 'Name', 'Gender',
               'Designation', 'Place of Assignment', 'Contact Number'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var now = new Date();
    var cfg = DAYS[Utilities.formatDate(now, TZ, 'yyyy-MM-dd')];
    if (!cfg) return json({ ok: false, code: 'CLOSED', message: 'Registration is closed.' });

    var d = JSON.parse(e.postData.contents);
    var v = {
      email: str(d.email), name: str(d.name), gender: str(d.gender),
      designation: str(d.designation), place: str(d.placeOfAssignment), contact: str(d.contactNumber)
    };
    for (var k in v) if (!v[k]) return json({ ok: false, code: 'INVALID', message: 'All fields are required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return json({ ok: false, code: 'INVALID', message: 'Invalid email address.' });
    var phone = normPhone(v.contact);
    if (!/^9\d{9}$/.test(phone)) return json({ ok: false, code: 'INVALID', message: 'Invalid mobile number.' });

    lock.waitLock(30000);

    var ss = SpreadsheetApp.openById(cfg.sheetId);
    if (ss.getSpreadsheetTimeZone() !== TZ) ss.setSpreadsheetTimeZone(TZ); // timestamps show Manila time
    var sheet = ss.getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    var last = sheet.getLastRow();

    // Same-day duplicate check (this day's sheet only).
    if (last > 1) {
      var rows = sheet.getRange(2, 2, last - 1, 7).getValues(); // columns B..H
      var email = v.email.toLowerCase(), name = normName(v.name);
      for (var i = 0; i < rows.length; i++) {
        if (String(rows[i][1]).trim().toLowerCase() === email)
          return json({ ok: false, code: 'DUPLICATE', message: 'This email address is already registered today.' });
        if (normName(rows[i][2]) === name)
          return json({ ok: false, code: 'DUPLICATE', message: 'This name is already registered today.' });
        if (normPhone(rows[i][6]) === phone)
          return json({ ok: false, code: 'DUPLICATE', message: 'This contact number is already registered today.' });
      }
    }

    // Control number restarts at 00001 each day: last control number in this day's sheet + 1.
    var n = 0;
    if (last > 1) {
      var m = /(\d+)$/.exec(String(sheet.getRange(last, 2).getValue()));
      n = m ? parseInt(m[1], 10) : last - 1;
    }
    var control = 'NSCSL' + ('00000' + (n + 1)).slice(-5);

    // Contact stored as text so the leading 0 is kept.
    var row = last + 1;
    sheet.getRange(row, 1).setNumberFormat('mmm d, yyyy h:mm:ss AM/PM'); // e.g. Oct 5, 2026 8:15:30 AM
    sheet.getRange(row, 8).setNumberFormat('@');
    sheet.getRange(row, 1, 1, 8).setValues([[now, control, v.email, v.name, v.gender, v.designation, v.place, v.contact]]);
    SpreadsheetApp.flush();

    return json({ ok: true, controlNumber: control, day: cfg.day });
  } catch (err) {
    return json({ ok: false, code: 'ERROR', message: 'Something went wrong. Please try again.' });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function str(s) { return String(s == null ? '' : s).trim(); }
function normName(s) { return String(s).trim().toLowerCase().replace(/\s+/g, ' '); }
// 09171234567 / +639171234567 / 639171234567 -> 9171234567
function normPhone(s) { return String(s).replace(/\D/g, '').replace(/^(63|0)/, ''); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
