# Карта кода (создаётся `python3 tools/codemap.py`, руками не править)

Модули грузятся в этом порядке (index.html). Код, выполняемый при загрузке, может опираться только на модули выше.

**texts.js** (27 КБ) — extra interface texts (ru/pl/en) added to DICT
—

**screens.js** (7 КБ) — screens and sheets added to the page at start (add())
—

**core.js** (10 КБ) — config (Supabase URL/key), helpers $ $$ esc, language t()/pw(), dates
`SB_URL`, `SB_KEY`, `BUCKET`, `LOGIN_DOMAIN`, `$`, `$$`, `esc`, `I`, `ic`, `paintIcons`, `LOCALE`, `LANG_FIELD`, `LANG_ORDER`, `lang`, `t`, `pIdx`, `pw`, `fTime`, `mkFmt`, `T`, `evLabel`, `dayKey`, `isToday`, `isYest`, `cap`, `when`, `recTime`, `dayTitle`, `toInput`, `fromInput`, `key`, `toN`, `ymd`, `age`, `uuid`

**data.js** (18 КБ) — state, rows <-> app objects, groups, names, species info/texts, machine translation, place tree, species timings
`sb`, `recs`, `spMap`, `curSp`, `curBird`, `tab`, `statusKey`, `phRec`, `encls`, `logRows`, `calMode`, `calM`, `DEF_BACK`, `VIEW_KEY`, `role`, `canWrite`, `isAdmin`, `canEditRec`, `canRmPhoto`, `ms`, `fromRec`, `toRec`, `fromSp`, `toSp`, `fromBird`, `grpTotal`, `grpText`, `toBird`, `EK`, `EK_IC`, `fromEncl`, `toEncl`, `fromPhoto`, `thumbOf`, `photosOf`, `mainOf`, `LANGS`, `altNames`, `dn`, `allNames`, `otherNames`, `bn`, `enDn`, `canonBird`, `spById`, `spName`, `spNames`, `spOther`, `bySp`, `byName`, `findSpByAnyName`, `spOfBird`, `nm`, `backBtn`, `matchQ`, `spLink`, `IUCN`, `spInfo`, `spGroup`, `spPhoto`, `spLocked`, `lockMark`, `spMain`, `iucnBadge`, `SI_WILD`, `SI_ZOO`, `TRK`, `trObj`, `trPick`, `trText`, `trNote`, `decodeHtml`, `mt`, `enclTile`, `enclLink`, `kidsOf`, `pathOf`, `descOf`, `pathText`, `enclPath`, `INDENT`, `byPlace`, `treeOrder`, `placeOf`, `incubDays`, `fledgeDays`, `gestDays`, `sexText`, `authorName`, `roleText`, `compute`, `details`, `occupancy`, `occOf`, `stat`

**photos.js** (8 КБ) — photos: signed links, thumbnails, lightbox, photo field in forms
`urlCache`, `ensureUrls`, `paintPhotos`, `thumbImg`, `thumbs`, `gallery`, `openLightbox`, `closeLightbox`, `shrink`, `photoBox`, `commitPhotos`, `dropPhotosOf`

**render.js** (24 КБ) — rendering of screens and cards (now, species, animal, place)
`card`, `renderNow`, `renderLogs`, `fillBirds`, `renderSpecies`, `renderSpCard`, `renderColl`, `links`, `renderBirdCard`, `renderEncls`, `renderEnclCard`

**changelog.js** (2 КБ) — change log screen
`logLine`, `renderLog`

**calendar.js** (15 КБ) — calendar: list and month grid, expected dates, day sheet
`DAY`, `midnight`, `dayDiff`, `CAL_DOT`, `GUESS_IC`, `calIc`, `calItems`, `mIdx`, `weeksHTML`, `renderCal`, `calJump`, `openCalItem`, `calDay`, `renderDay`, `openDay`, `renderUsers`, `renderAccount`, `openCard`, `index`, `render`

**ui.js** (16 КБ) — tabs, sheets, Back button history, confirmations, place picker, alt-name rows
`toastT`, `toast`, `setStatus`, `applyStatic`, `setLang`, `TAB_OF`, `navOn`, `navState`, `navStart`, `setTab`, `hideSheet`, `openSheet`, `askDone`, `ask`, `formDirty`, `markDirty`, `requestClose`, `closeSheets`, `field`, `spSelect`, `enclSelect`, `wireEnclSelects`, `setEnclSel`, `readEncl`, `ensureEncl`, `nameRow`, `namesEditor`, `readNames`, `activeDrug`, `openForm`

**server.js** (6 КБ) — Supabase calls: loaders, saves, deletes, photo upload
`must`, `errMsg`, `fetchAll`, `LOADERS`, `loadAll`, `pending`, `scheduleReload`, `subscribe`, `putRec`, `dropRec`, `putSp`, `dropSp`, `putBird`, `dropBird`, `putEncl`, `dropEncl`, `ensureSpecies`, `callAdmin`, `adminErr`, `withBusy`

**forms.js** (11 КБ) — record form, offspring card offer, parents, animal (collection) form
`offerKid`, `paOpts`, `paRow`, `parentsEditor`, `openBirdForm`

**places.js** (4 КБ) — housing place form
`openEnclForm`

**locks.js** (8 КБ) — species form fields, "protect from AI" locks, translation of edited texts
`SPF`, `SIF`, `sifId`, `dPhotoCount`, `lockKey`, `lockBox`, `SP_LOCK`, `addLocks`, `lockList`, `formData`, `BIRD_LOCK`, `ENCL_LOCK`, `infoFields`, `readInfo`, `spTr`, `stashTr`, `fillTr`, `translateDirty`

**gaps.js** (3 КБ) — missing data screen
`GAPS`, `hasTxt`, `gapMissing`, `gapsOpen`, `renderGaps`, `openGap`

**species-form.js** (4 КБ) — species form: open, save, delete
`openSpForm`

**users.js** (3 КБ) — staff accounts (admin)
`openUserForm`

**clicks.js** (7 КБ) — global click handler, tall photo fit
`fitPhoto`

**pick.js** (4 КБ) — searchable list for long selects, search fields
`PICK_MIN`, `pickSel`, `pickable`, `pickNorm`, `pickRender`, `openPick`, `closePick`, `pickTouch`

**gate.js** (5 КБ) — CSV export, sign-in gate, loading curtain, boot
`csv`, `splashT0`, `splash`, `gate`, `applyRole`, `resetState`, `booting`, `boot`, `hiddenAt`

**start.js** (1 КБ) — start-up: language buttons, first paint, Supabase client
—
