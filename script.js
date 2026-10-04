(function () {
  var fmt = function (n) { return Math.round(n).toLocaleString("sv-SE").replace(/ /g, " ") + " kr"; };
  var v = document.getElementById("v"), e = document.getElementById("e");
  function checked(name) { var c = document.querySelector('input[name="' + name + '"]:checked'); return c ? c.value : ""; }
  function calc() {
    var verif = +v.value, emp = +e.value, moms = checked("moms"), form = checked("form");
    document.getElementById("vOut").textContent = verif;
    document.getElementById("eOut").textContent = emp;
    var rows = [["Grundavgift", form === "ab" ? 790 : 490], ["Bokföring, " + verif + " verifikat", verif * 14]];
    if (moms === "kv") rows.push(["Momsdeklaration, kvartal", 150]);
    if (moms === "man") rows.push(["Momsdeklaration, månad", 350]);
    if (emp > 0) rows.push(["Lön, " + emp + (emp === 1 ? " anställd" : " anställda"), 300 + emp * 120]);
    var sum = rows.reduce(function (a, r) { return a + r[1]; }, 0);
    document.getElementById("price").textContent = fmt(sum);
    var dl = document.getElementById("breakdown");
    dl.innerHTML = "";
    rows.forEach(function (r) {
      var dt = document.createElement("dt"), dd = document.createElement("dd");
      dt.textContent = r[0]; dd.textContent = fmt(r[1]);
      dl.appendChild(dt); dl.appendChild(dd);
    });
  }
  document.querySelectorAll("#v, #e, input[name=moms], input[name=form]").forEach(function (el) { el.addEventListener("input", calc); });
  calc();

  var msg = document.getElementById("msg"), count = document.getElementById("count");
  function words() { var t = msg.value.trim(); return t ? t.split(/\s+/).length : 0; }
  msg.addEventListener("input", function () {
    var n = words(); count.textContent = n + " / 10 ord"; count.classList.toggle("err", false);
  });
  var status = document.getElementById("status");
  document.getElementById("form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var name = document.getElementById("name").value.trim();
    var mail = document.getElementById("email").value.trim();
    var problems = [];
    if (!name) problems.push("namn");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) problems.push("en giltig e-postadress");
    if (words() < 10) { problems.push("minst 10 ord i meddelandet"); count.classList.add("err"); }
    status.hidden = false;
    if (document.getElementById("hp").value) { status.textContent = "Förfrågan stoppades."; return; }
    if (problems.length) { status.textContent = "Fyll i " + problems.join(", ") + " och försök igen."; return; }
    status.textContent = "Tack, " + name.split(" ")[0] + ". Det här är en demosida, så formuläret skickas inte. Koppla det till er e-post eller ert ärendesystem innan sajten publiceras.";
  });

  document.getElementById("copy").addEventListener("click", function () {
    var btn = this, t = document.getElementById("mail");
    function sel() { var r = document.createRange(); r.selectNodeContents(t); var s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "Markerad, tryck Ctrl+C"; }
    try { navigator.clipboard.writeText(t.textContent).then(function () { btn.textContent = "Kopierad"; }, sel); } catch (x) { sel(); }
  });
})();
