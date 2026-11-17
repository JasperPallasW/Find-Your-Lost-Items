---- Find Your Lost Items ----
A campus website where students can report, search, and return lost items, and where
"students who return found items are honored" as Finder Heroes.

---- Problem ----
Students who lose their belongings often report them through chat groups or other existing channels. However, these messages can quickly get buried and become difficult to find. Meanwhile, people who find an item may not know how to report it or connect it with the right owner.

---- Our solution (what is special) ----
- Found item first idea: reporting and returning found items is rewarded.
- Finder Heroes: 10 points per returned item, badges (Good Samaritan, Campus Helper, Campus Hero), a 3D chart, a ranking, and a thank-you wall.
  Points come only after the OWNER confirms that the item came back (the owner may leave feedback). A finder cannot mark his or her own item as returned.
- Hidden detail: only for found items. It is visible only to the finder and is used to check the answer of the person who says the item is theirs.
- Student origin: every account stores where the student is from (Indian state or international country)
  and shows it next to the name, to celebrate our diverse campus.
- Contact by WhatsApp: students give a WhatsApp number when they register, and the owner and the finder contact each other with it
  (only logged in students can see the contact button).
- 3D points chart: the Heroes page draws a 3D bar chart with Three.js (one bar for each finder, height = points / 10).
  It turns by itself and has a "Pause rotation" button.
- JavaScript: menu, filters, tabs, FAQ, and form switching use only HTML and CSS.

---- Pages ----
-----------------------------------------------------------------------------------------------------------------------------------------------------------
| Page             | What it does?                                                                                                                        |
-----------------------------------------------------------------------------------------------------------------------------------------------------------
| Home             | Search box, live numbers, how it works, latest items, top finders, FAQ                                                               |
-----------------------------------------------------------------------------------------------------------------------------------------------------------
| Items            | Numbers and a table of all reports. Keyword search (JavaScript), category list and the All / Lost / Found / Returned tabs (CSS only) |
-----------------------------------------------------------------------------------------------------------------------------------------------------------
| Item detail      | Photo, details, WhatsApp contact (logged in only), respond ("This is my item" / "I found this item"),                                
                     owner-only "I received my item" with optional feedback                                                                               |
-----------------------------------------------------------------------------------------------------------------------------------------------------------
| Report           | Lost / found form. The photo is required. The location is a list                                                                      
                     (Main Building, PG Building, Satyarati Building, Hostel Area, Parking Area, Canteen, Sports Ground, Other = type the name).           
                      The hidden detail field appears only for "I found an item"                                                                          |
-----------------------------------------------------------------------------------------------------------------------------------------------------------
| Heroes           | 3D bar chart of the points (Three.js) with a "Pause rotation" button,                                                                
                     ranking list, badges, how to become a hero, full ranking table, thank-you wall                                                       |
-----------------------------------------------------------------------------------------------------------------------------------------------------------
| About            | Profile of the founder, background, vision, mission, and values                                                                      |
-----------------------------------------------------------------------------------------------------------------------------------------------------------
| Contact Us       | Address, phone, e-mail, office hours, message form, social media links                                                               |
-----------------------------------------------------------------------------------------------------------------------------------------------------------
| Login / Register | localStorage accounts, with state or country of origin and a WhatsApp number                                                         |
-----------------------------------------------------------------------------------------------------------------------------------------------------------

---- Tech stack ----
HTML5, CSS3, Bootstrap 5.3 (CSS only, no Bootstrap JavaScript), Bootstrap Icons, JavaScript,
Three.js r128 (from a CDN, loaded as a normal script) for the 3D chart.
Data is saved in the browser (localStorage). There is no server or database.

---- How it works (short) ----
1. 'js/data.js' holds demo items. On first open they are copied to localStorage.
2. All pages read and write items through 'js/storage.js'.
3. 'js/ui.js' formats text and builds the item card. 'js/auth.js' handles accounts and the navbar.
4. Each page has one small script ('items.js', 'detail.js', 'report.js', 'heroes.js', 'chart3d.js', 'home.js', 'contact.js').
5. 'css/style.css' styles everything and also does the filters, tabs, manual-location field, and phone menu.

---- Folder structure ----
'''
index.html          Home page
pages/              items, detail, report, heroes, about, contact, login, register
css/style.css       All our styles (loaded AFTER Bootstrap)
js/                 data, storage, ui, auth + one script per page (chart3d.js = the 3D chart)
images/             Photos (file names are case sensitive)
docs/               Plan and guides
'''

---- How to run ----
Open 'index.html' in a browser (internet is needed for Bootstrap, the icons, and Three.js).
To reset the data: browser DevTools (F12) > Application > Local Storage > clear.

---- Contact form ----
The form uses Netlify Forms ('data-netlify="true"'). On Netlify the messages appear in the
Netlify dashboard under Forms. When the page is opened as a file on a computer, the message
cannot be sent, so a copy is saved in the browser instead and the page says so.

---- Demo data and limits ----
- Names, origins, and WhatsApp numbers of the starting items are made up.
- Data is saved per browser; another computer will not see it.
- Passwords are saved as plain text for the demo only. A real product needs a server,
  a database, and hashed passwords.

---- Team ----
--------------------------------------------------------------------------------------------------
| Student @JasperPallasW         | Pages, Data and photos, CSS, JavaScript, Three.js, deployment |
--------------------------------------------------------------------------------------------------
| Student @shreyanshshekhar-prog | Presentation, Data, Javascript, Three.js|
--------------------------------------------------------------------------------------------------

Link to the website: 
https://find-your-lost-items.netlify.app/
or 
https://jasperpallasw.github.io/Find-Your-Lost-Items/
