(function () {
  // Sätt till en formulärtjänst (t.ex. https://formspree.io/f/xxxx) för att ta emot förfrågningar på riktigt.
  var FORM_ENDPOINT = "";

  // Exempelpriser i kronor per månad, exklusive moms.
  var PRICES = { baseEf: 490, baseAb: 790, perVerif: 14, momsKv: 150, momsMan: 350, payrollBase: 300, perEmployee: 120 };
  var PRESETS = {
    start: { v: 20, e: 0, moms: "kv", form: "ef" },
    bas: { v: 60, e: 1, moms: "kv", form: "ab" },
    vaxa: { v: 150, e: 5, moms: "man", form: "ab" }
  };

  var fmt = function (n) { return Math.round(n).toLocaleString("sv-SE").replace(/ /g, " ") + " kr"; };
  var $ = function (id) { return document.getElementById(id); };

  /* header: skugga vid scroll, mobilmeny, aktiv länk */
  var header = $("header"), menuBtn = $("menuBtn"), menu = $("menu");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var progress = $("progress"), steps = $("steps"), blobs = document.querySelectorAll("[data-parallax]");
  var lastY = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle("scrolled", y > 8);
    // Göm menyn när man scrollar nedåt, visa när man scrollar uppåt.
    header.classList.toggle("hidden", y > 400 && y > lastY && !header.classList.contains("open"));
    lastY = y;
    progress.style.setProperty("--p", max > 0 ? y / max : 0);
    if (!reduce) blobs.forEach(function (b) { b.style.transform = "translate3d(0," + y * +b.getAttribute("data-parallax") + "px,0)"; });
    if (steps) {
      var r = steps.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (innerHeight * 0.75 - r.top) / r.height));
      steps.style.setProperty("--p", p);
      var items = steps.children;
      for (var i = 0; i < items.length; i++) items[i].classList.toggle("lit", p >= i / (items.length - 1) - 0.02);
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
  function setMenu(open) {
    header.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Stäng menyn" : "Öppna menyn");
  }
  menuBtn.addEventListener("click", function () { setMenu(!header.classList.contains("open")); });
  menu.addEventListener("click", function (ev) { if (ev.target.tagName === "A") setMenu(false); });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") setMenu(false); });

  var links = menu.querySelectorAll("a");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });

    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); reveal.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal, #deadlines").forEach(function (el) { reveal.observe(el); });
  } else {
    document.querySelectorAll(".reveal, #deadlines").forEach(function (el) { el.classList.add("in"); });
  }

  /* färgläge */
  var root = document.documentElement, themeBtn = $("theme");
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  function isDark() { var t = root.getAttribute("data-theme"); return t ? t === "dark" : mq.matches; }
  function syncThemeBtn() { themeBtn.setAttribute("aria-label", isDark() ? "Byt till ljust läge" : "Byt till mörkt läge"); }
  themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (x) {}
    syncThemeBtn();
  });
  syncThemeBtn();

  /* priskalkylator */
  var v = $("v"), e = $("e");
  function checked(name) { var c = document.querySelector('input[name="' + name + '"]:checked'); return c ? c.value : ""; }
  function rowsFor(verif, emp, moms, form) {
    var rows = [["Grundavgift", form === "ab" ? PRICES.baseAb : PRICES.baseEf], ["Bokföring, " + verif + " verifikat", verif * PRICES.perVerif]];
    if (moms === "kv") rows.push(["Momsdeklaration, kvartal", PRICES.momsKv]);
    if (moms === "man") rows.push(["Momsdeklaration, månad", PRICES.momsMan]);
    if (emp > 0) rows.push(["Lön, " + emp + (emp === 1 ? " anställd" : " anställda"), PRICES.payrollBase + emp * PRICES.perEmployee]);
    return rows;
  }
  function sum(rows) { return rows.reduce(function (a, r) { return a + r[1]; }, 0); }
  function calc() {
    var verif = +v.value, emp = +e.value;
    $("vOut").textContent = verif;
    $("eOut").textContent = emp;
    var rows = rowsFor(verif, emp, checked("moms"), checked("form"));
    var price = $("price"), txt = fmt(sum(rows));
    if (price.textContent !== txt && price.textContent !== "0 kr") { price.classList.remove("bump"); void price.offsetWidth; price.classList.add("bump"); }
    price.textContent = txt;
    var dl = $("breakdown");
    dl.innerHTML = "";
    rows.forEach(function (r) {
      var dt = document.createElement("dt"), dd = document.createElement("dd");
      dt.textContent = r[0]; dd.textContent = fmt(r[1]);
      dl.appendChild(dt); dl.appendChild(dd);
    });
  }
  document.querySelectorAll("#v, #e, input[name=moms], input[name=form]").forEach(function (el) { el.addEventListener("input", calc); });
  calc();

  Object.keys(PRESETS).forEach(function (k) {
    var p = PRESETS[k];
    var el = document.querySelector('[data-plan="' + k + '"]');
    if (el) el.textContent = fmt(sum(rowsFor(p.v, p.e, p.moms, p.form)));
  });
  document.querySelectorAll("[data-preset]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var p = PRESETS[btn.getAttribute("data-preset")];
      v.value = p.v; e.value = p.e;
      document.querySelector('input[name=moms][value="' + p.moms + '"]').checked = true;
      document.querySelector('input[name=form][value="' + p.form + '"]').checked = true;
      calc();
      $("kalkyl").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  $("priceCta").addEventListener("click", function () {
    var msg = $("msg");
    if (!msg.value.trim()) {
      msg.value = "Jag är intresserad av en offert: ca " + v.value + " verifikationer per månad, " + e.value + " anställda, " +
        (checked("form") === "ab" ? "aktiebolag" : "enskild firma") + ". Kalkylen visade " + $("price").textContent + " per månad.";
      msg.dispatchEvent(new Event("input"));
    }
  });

  /* deadlines hos Skatteverket (omsättning upp till 40 mnkr) */
  var MONTHS = ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"];
  function dueDate(y, m) {
    // Den 12:e, men den 17:e i januari och augusti. Helgdag flyttas till måndag.
    var d = new Date(y, m, 1);
    d.setDate(d.getMonth() === 0 || d.getMonth() === 7 ? 17 : 12);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d;
  }
  function next(today, lag, periods) {
    for (var i = -4; i < 16; i++) {
      var pm = today.getMonth() + i;
      var p = new Date(today.getFullYear(), pm, 1);
      if (periods && periods.indexOf(p.getMonth()) < 0) continue;
      var d = dueDate(p.getFullYear(), p.getMonth() + lag);
      if (d >= today) return { date: d, period: p };
    }
  }
  function renderDeadlines() {
    var box = $("deadlines");
    if (!box) return;
    var now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var items = [
      { t: "Arbetsgivardeklaration", s: "Skatt och avgifter för löner", r: next(today, 1), p: function (d) { return "Period " + MONTHS[d.getMonth()]; } },
      { t: "Moms, månad", s: "Redovisning varje månad", r: next(today, 2), p: function (d) { return "Period " + MONTHS[d.getMonth()]; } },
      { t: "Moms, kvartal", s: "Redovisning varje kvartal", r: next(today, 2, [2, 5, 8, 11]), p: function (d) { return "Kvartal " + (d.getMonth() + 1) / 3 + " " + d.getFullYear(); } }
    ];
    box.innerHTML = "";
    items.forEach(function (it) {
      var days = Math.round((it.r.date - today) / 864e5);
      var card = document.createElement("article");
      card.className = "deadline" + (days <= 7 ? " soon" : "");
      card.innerHTML = '<span class="label"></span><h3></h3><p class="when"></p><p class="in"></p><p class="sub"></p>';
      card.querySelector(".label").textContent = it.p(it.r.period);
      card.querySelector("h3").textContent = it.t;
      card.querySelector(".when").textContent = it.r.date.getDate() + " " + MONTHS[it.r.date.getMonth()] + " " + it.r.date.getFullYear();
      card.querySelector(".in").textContent = days === 0 ? "Idag" : days === 1 ? "Imorgon" : "Om " + days + " dagar";
      card.querySelector(".sub").textContent = it.s;
      box.appendChild(card);
    });
  }
  renderDeadlines();

  /* hero: verifikationen lutar efter muspekaren */
  var hv = $("heroVisual");
  if (hv && !reduce && window.matchMedia("(hover: hover)").matches) {
    var card = hv.querySelector(".ledger");
    hv.addEventListener("mousemove", function (ev) {
      var r = hv.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--ry", (x * 14).toFixed(2) + "deg");
      card.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg");
    });
    hv.addEventListener("mouseleave", function () { card.style.removeProperty("--ry"); card.style.removeProperty("--rx"); });
  }

  /* tjänstekort: ljuspunkt som följer pekaren */
  document.querySelectorAll(".svc").forEach(function (el) {
    el.addEventListener("pointermove", function (ev) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ev.clientX - r.left + "px");
      el.style.setProperty("--my", ev.clientY - r.top + "px");
    });
  });

  /* räknare i statistikraden */
  if (!reduce && "IntersectionObserver" in window) {
    var counter = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        counter.unobserve(en.target);
        var el = en.target, to = +el.getAttribute("data-to"), t0 = performance.now();
        (function tick(t) {
          var k = Math.min(1, (t - t0) / 1100);
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
    });
    document.querySelectorAll(".count").forEach(function (el) { counter.observe(el); });
  }

  /* kontaktformulär */
  var msg = $("msg"), count = $("count");
  function words() { var t = msg.value.trim(); return t ? t.split(/\s+/).length : 0; }
  msg.addEventListener("input", function () {
    var n = words(); count.textContent = n + " / 10 ord"; count.classList.toggle("err", false);
  });
  var status = $("status"), form = $("form"), send = $("send");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var name = $("name").value.trim();
    var mail = $("email").value.trim();
    var problems = [];
    if (!name) problems.push("namn");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) problems.push("en giltig e-postadress");
    if (words() < 10) { problems.push("minst 10 ord i meddelandet"); count.classList.add("err"); }
    status.hidden = false;
    status.className = "status";
    if ($("hp").value) { status.textContent = "Förfrågan stoppades."; return; }
    if (problems.length) { status.classList.add("bad"); status.textContent = "Fyll i " + problems.join(", ") + " och försök igen."; return; }
    var first = name.split(" ")[0];
    if (!FORM_ENDPOINT) {
      status.classList.add("good");
      status.textContent = "Tack, " + first + ". Det här är en demosida, så formuläret skickas inte. Sätt FORM_ENDPOINT i script.js innan sajten publiceras.";
      return;
    }
    send.disabled = true; send.textContent = "Skickar…";
    fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset(); count.textContent = "0 / 10 ord";
        status.classList.add("good");
        status.textContent = "Tack, " + first + "! Vi har fått din förfrågan och svarar nästa vardag.";
      })
      .catch(function () {
        status.classList.add("bad");
        status.textContent = "Något gick fel när förfrågan skulle skickas. Försök igen eller mejla oss direkt.";
      })
      .then(function () { send.disabled = false; send.textContent = "Skicka förfrågan"; });
  });

  $("copy").addEventListener("click", function () {
    var btn = this, t = $("mail");
    function sel() { var r = document.createRange(); r.selectNodeContents(t); var s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "Markerad, tryck Ctrl+C"; }
    try { navigator.clipboard.writeText(t.textContent).then(function () { btn.textContent = "Kopierad"; }, sel); } catch (x) { sel(); }
  });

  $("year").textContent = new Date().getFullYear();
})();
