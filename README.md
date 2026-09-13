# crew-log-app
A mobile-first app that also runs on multi-devices to log third-party workers working in the factory. stores records. with a user-friendly UX design,
==============================================================
CREW/LOG
==============================================================

A mobile-first PWA for logging third-party workers on site -
Production crew: there are some situations where a manufacturing business will hire temporary workers to staff areas such as:

General staff:
(Packing / Post-filler area)

Contractors:
Maintenance,
Electrical, 
Mechanical, 
Steel fabrication, 
Process engineering, 
Tech/IT support,
The App was designed to manage and log data across a three-shift factory roster.

Live app: https://crew-log-keeno2022-curiousone.vercel.app

--------------------------------------------------------------
WHAT IT DOES
--------------------------------------------------------------

* Log worker - record a worker's name, company, date, shift, and
  either a production area/duty or a contractor section.

* Shift board - pick a date and shift to see who's on: production
  duty slots (Forklift, Line 1-3) with fill counts against
  expected headcount, plus a contractors-on-site list grouped by
  section.

* Records - full history, filterable by shift and area/section,
  with CSV export.

* Analyse - hours-on-site, contractor hours, shift counts, and
  company/area/duty breakdowns over a date range.

--------------------------------------------------------------
ROSTER RULES THE APP UNDERSTANDS
--------------------------------------------------------------

* Shifts: Earlies 06:00-14:00, Evenings 14:00-22:00,
  Nights 22:00-06:00.

* Normal roster runs Monday 06:00 to Saturday 03:00.

* Friday nights are flagged as finishing Saturday 03:00 (counted
  as 5 hours in Analyse, not 8).

* Saturday dates are flagged: only the optional earlies shift is
  on the normal roster.

* Expected headcount per duty: Forklift 1, Line 1 = 1,
  Line 2 = 2, Line 3 = 3 (edit DUTIES in index.html if your
  roster differs).

--------------------------------------------------------------
TECH STACK
--------------------------------------------------------------

* Frontend: single static index.html - vanilla JS, no build step,
  no framework.

* Backend: one serverless function (api/records.js) on Vercel.

* Database: Redis, via a Vercel Marketplace integration (Upstash)
  using @vercel/kv.

Records are stored as one JSON array under a single Redis key
(crew-log-records). The frontend does a full read on load and a
full overwrite on every save/delete - simple and fine at this
scale (a single site's shift log); it is not built to handle
concurrent high-volume writes.

--------------------------------------------------------------
PROJECT STRUCTURE
--------------------------------------------------------------

crew-log-project/
    index.html      <- the entire app: markup, styles, client JS
    package.json    <- declares the @vercel/kv dependency
    api/
        records.js  <- GET (read all records) /
                       PUT (overwrite all records)

--------------------------------------------------------------
DEPLOYING IT YOURSELF
--------------------------------------------------------------

1. Push these three files/folders to Vercel - either connect a
   Git repo (Project > Settings > Git) or drag-and-drop the
   folder at vercel.com/new for a Git-less deploy.

2. Connect a database. In the project's Storage tab,
   create/connect a Redis database (Upstash, via the
   Marketplace). This automatically sets the KV_REST_API_URL and
   KV_REST_API_TOKEN environment variables the API route needs.

3. Redeploy if the env vars were added after the first build.

4. (Optional) If you want the URL reachable without a Vercel
   login prompt, go to Settings > Deployment Protection and turn
   off Vercel Authentication.

Until a database is connected, the app still loads and works, but
shows a "No shared database connected yet" notice and records
only live in that browser tab's memory - nothing is lost
silently, it just won't sync across devices yet.

--------------------------------------------------------------
API
--------------------------------------------------------------

api/records.js exposes one endpoint, /api/records:

  METHOD | BODY                | RESPONSE
  -------+---------------------+---------------------------------
  GET    | -                   | { records: [...] }
         |                     | every stored record
  -------+---------------------+---------------------------------
  PUT    | { records: [...] }  | { ok: true }
         |                     | overwrites the full record set

RECORD SHAPE
------------

{
  "id": "1234567890-ab3f9",
  "name": "John Smith",
  "agency": "Acme Staffing",
  "date": "2026-09-12",
  "shift": "earlies",
  "type": "production",
  "area": "Packing",
  "duty": "Line 2",
  "section": "",
  "notes": "",
  "loggedAt": "2026-09-12T05:58:11.000Z"
}

* "type" is "production" or "contractor". Production records use
  area/duty; contractor records use section instead (one of
  Maintenance, Electrical, Mechanical, Steel fabrication, Process
  engineering, Tech / IT support).

* Records with no "type" field (created before contractor logging
  was added) are treated as production by the frontend.

--------------------------------------------------------------
CUSTOMISING
--------------------------------------------------------------

Everything lives in index.html - no build step, so edits take
effect on the next deploy:

* Duties / expected headcount: the DUTIES array.

* Contractor sections: the SECTIONS array (update both the JS
  array and the matching buttons in the #seg-section markup).

* Shift times / hours logic: SHIFT_TIME and the shiftHours()
  function (used by the Analyse tab).

* Colours / branding: CSS custom properties at the top of the
  <style> block (--hivis, --earlies, --packing, etc).

--------------------------------------------------------------
KNOWN LIMITATIONS
--------------------------------------------------------------

* No authentication - anyone with the URL can log, view, or
  delete records. Add Vercel Authentication or your own login if
  that's a concern.

* No edit function for existing records - only add and delete.

* Hours in Analyse assume full shifts; there's no
  clock-in/clock-out capture, so partial shifts aren't reflected.

* The whole record set is read/written on every change, so this
  isn't designed to scale past one site's shift log.

==============================================================
