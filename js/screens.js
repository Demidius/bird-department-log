// screens.js — screens and sheets added to the page at start (add())
/* ---------- housing places: screens added to the page ---------- */
{
  const add = (sel, where, html) => { const el = document.querySelector(sel); if (el) el.insertAdjacentHTML(where, html); };
  add('#view-menu [data-view=species]', 'beforebegin', `<button class="row" type="button" data-view="encls" style="margin-top:10px"><span class="tile t-amber" data-ic="home"></span><span class="rt"><b data-t="encls_t"></b><small id="encl-count"></small></span><span class="chev" data-ic="chev" data-s="20"></span></button>
`);
  add('#acc-line', 'afterend', '<p class="hint app-ver" id="app-ver"></p>');
  add('#view-menu [data-view=species]', 'beforebegin', `<button class="row" type="button" data-view="log" style="margin-top:10px"><span class="tile t-grey" data-ic="clock"></span><span class="rt"><b data-t="log_t"></b><small id="log-count"></small></span><span class="chev" data-ic="chev" data-s="20"></span></button>
`);
  add('#view-menu [data-view=species]', 'beforebegin', `<button class="row" type="button" data-view="gaps" style="margin-top:10px"><span class="tile t-amber" data-ic="clip"></span><span class="rt"><b data-t="gaps_t"></b><small id="gaps-count"></small></span><span class="chev" data-ic="chev" data-s="20"></span></button>
`);
  add('#view-users', 'beforebegin', `<section class="view" id="view-gaps" hidden>
<button class="backlink" type="button" data-tab="menu"><span data-ic="back" data-s="18" data-w="2.2"></span><span data-t="menu"></span></button>
<h1 data-t="gaps_t"></h1>
<p class="lead" data-t="gaps_lead"></p>
<div class="list" id="gaps-body"></div>
</section>
`);
  add('#view-users', 'beforebegin', `<section class="view" id="view-log" hidden>
<button class="backlink" type="button" data-tab="menu"><span data-ic="back" data-s="18" data-w="2.2"></span><span data-t="menu"></span></button>
<h1 data-t="log_t"></h1>
<p class="lead" data-t="log_lead"></p>
<div class="chips" id="lg-chips" role="group"></div>
<div class="list" id="log-body" style="margin-top:12px"></div>
</section>
`);
  add('#sheet-breed .steps', 'beforeend', `<button class="step" type="button" data-new="birth"><span class="tile t-amber"><span data-ic="paw"></span></span><span class="rt"><b data-t="ev_birth"></b></span><span class="chev" data-ic="chev" data-s="20"></span></button>`);
  add('.tab[data-tab=now]', 'afterend', `<button class="tab" type="button" data-tab="cal"><span class="ti" data-ic="calgrid" data-s="22"></span><span data-t="tab_cal"></span></button>`);
  add('#view-users', 'beforebegin', `<section class="view" id="view-cal" hidden>
<div class="cal-head"><h1 id="cal-title"></h1><div class="cal-nav"><button class="mini ghost" type="button" data-cal-nav="-1" data-ta="cal_prev"><span data-ic="chevl" data-s="18" data-w="2.4"></span></button><button class="mini ghost" type="button" data-cal-nav="0" data-t="cal_today"></button><button class="mini ghost" type="button" data-cal-nav="1" data-ta="cal_next"><span data-ic="chev" data-s="18" data-w="2.4"></span></button></div></div>
<div class="chips cal-modes" id="cal-modes" role="group" data-ta="cal_modes"><button class="chip" type="button" data-cal-mode="list" data-t="cal_m_list"></button><button class="chip" type="button" data-cal-mode="grid" data-t="cal_m_grid"></button></div>
<div class="cal-wrap"><div id="cal-months"></div><div class="cal-tip" id="cal-tip" role="status" hidden></div></div>
<p class="cal-legend"><span><i class="cdot cic t-amber" data-ic="crack" data-s="14" data-w="2.2"></i><span data-t="leg_dot"></span></span><span><i class="cleg k-amber"></i><span data-t="leg_line"></span></span><span><i class="cleg k-amber pend"></i><span data-t="leg_dash"></span></span><span><i class="cdot cic t-amber guess" data-ic="crack" data-s="14" data-w="2.2"></i><span data-t="leg_guess"></span></span></p>
<section class="nsec cal-listsec"><h2 class="nh"><span data-t="cal_list"></span><span class="nc" id="cal-n"></span></h2><div id="cal-list"></div></section>
</section>
`);
  add('#view-users', 'beforebegin', `<section class="view" id="view-encls" hidden>
<button class="backlink" type="button" data-tab="menu"><span data-ic="back" data-s="18" data-w="2.2"></span><span data-t="menu"></span></button>
<h1 data-t="encls_t"></h1>
<p class="lead" data-t="encls_lead"></p>
<button class="btn pri add-sp w-only" type="button" data-encl-new><span data-ic="plus" data-s="20" data-w="2.4"></span><span data-t="add_encl"></span></button>
<div class="fld"><label for="eq" data-t="eq_label"></label><input id="eq" type="search" autocomplete="off" data-tp="eq_ph"></div>
<div class="chips" id="ek-chips" role="group" data-ta="ek_aria" hidden></div>
<div class="list" id="encls-body" style="margin-top:12px"></div>
</section>

<section class="view" id="view-encl" hidden>
<div id="encl-body"></div>
</section>
`);
  document.body.insertAdjacentHTML('beforeend', `<div class="pick" id="pick" role="dialog" aria-modal="true" aria-labelledby="pick-t" hidden><div class="pick-box" tabindex="-1"><div class="pick-h"><h2 id="pick-t"></h2><button class="x" type="button" id="pick-x" data-ta="close"><span data-ic="x" data-s="20" data-w="2.2"></span></button></div><input id="pick-q" type="search" autocomplete="off" enterkeyhint="search"><div class="pick-list" id="pick-list" role="listbox"></div></div></div>`);
  document.body.insertAdjacentHTML('beforeend', `<div class="cfm" id="cfm" role="alertdialog" aria-modal="true" aria-labelledby="cfm-t" aria-describedby="cfm-p" hidden><div class="cfm-box"><h2 id="cfm-t"></h2><p id="cfm-p"></p><div class="cfm-acts"><button class="btn sec" type="button" id="cfm-no"></button><button class="btn pri" type="button" id="cfm-ok"></button></div></div></div>`);
  add('#sheet-user', 'beforebegin', `<section class="sheet" id="sheet-day" role="dialog" aria-modal="true" aria-labelledby="dy-title" tabindex="-1" aria-hidden="true" inert>
<div class="grip" aria-hidden="true"></div>
<div class="sh"><span class="tile t-green" data-ic="calgrid"></span><div><h2 id="dy-title"></h2><p id="dy-sub"></p></div><button class="x" type="button" data-close data-ta="close"><span data-ic="x" data-s="20" data-w="2.2"></span></button></div>
<div id="dy-body"></div>
</section>
`);
  add('#sheet-user', 'beforebegin', `<section class="sheet" id="sheet-encl" role="dialog" aria-modal="true" aria-labelledby="ef-title" tabindex="-1" aria-hidden="true" inert>
<div class="grip" aria-hidden="true"></div>
<div class="sh"><span class="tile t-amber" data-ic="home"></span><div><h2 id="ef-title"></h2><p id="ef-sub"></p></div><button class="x" type="button" data-close data-ta="close"><span data-ic="x" data-s="20" data-w="2.2"></span></button></div>
<form id="encl-form" novalidate>
<div id="ef-fields"></div>
<div class="fld" id="ef-ph"></div>
<p class="err" id="ef-err" role="alert"></p>
<div class="acts"><button class="btn pri" type="submit" id="ef-save" data-t="save"></button><button class="btn del" type="button" id="ef-del" hidden></button></div>
</form>
</section>
`);
}
