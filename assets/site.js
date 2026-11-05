/* Immobilien Serratore – Schaukopie: Menue, Filter, Galerie, Anfrageformular. Ohne Fremdbibliotheken. */
(function () {
  'use strict';

  // Menue auf dem Handy
  var menue = document.querySelector('.menue');
  var nav = document.getElementById('nav');
  if (menue && nav) {
    menue.addEventListener('click', function () {
      var offen = nav.classList.toggle('offen');
      menue.setAttribute('aria-expanded', offen ? 'true' : 'false');
    });
  }

  // Filter auf immobilien.html
  var filter = document.getElementById('filter');
  if (filter) {
    var karten = Array.prototype.slice.call(document.querySelectorAll('#liste .karte'));
    var liste = document.getElementById('liste');
    var zaehler = document.getElementById('zaehler');
    var leer = document.getElementById('leer');
    var anwenden = function () {
      var ort = filter.ort.value, lage = filter.lage.value;
      var von = parseInt(filter.von.value, 10) || 0;
      var bis = parseInt(filter.bis.value, 10) || Infinity;
      var sort = filter.sort.value, sichtbar = 0;
      karten.forEach(function (k) {
        var preis = parseInt(k.dataset.preis, 10);
        var ok = (!ort || k.dataset.ort === ort) && (!lage || k.dataset.lage === lage) && preis >= von && preis <= bis;
        k.hidden = !ok;
        if (ok) sichtbar++;
      });
      var sortiert = karten.slice();
      if (sort === 'auf') sortiert.sort(function (a, b) { return a.dataset.preis - b.dataset.preis; });
      if (sort === 'ab') sortiert.sort(function (a, b) { return b.dataset.preis - a.dataset.preis; });
      if (sort === 'flaeche') sortiert.sort(function (a, b) { return b.dataset.flaeche - a.dataset.flaeche; });
      sortiert.forEach(function (k) { liste.appendChild(k); });
      zaehler.textContent = sichtbar === 1 ? '1 Immobilie' : sichtbar + ' Immobilien';
      leer.style.display = sichtbar ? 'none' : 'block';
    };
    filter.addEventListener('change', anwenden);
    filter.addEventListener('submit', function (e) { e.preventDefault(); anwenden(); });
    anwenden();
  }

  // Galerie und Vergroesserung auf den Objektseiten
  var galerie = document.querySelector('.galerie');
  if (galerie) {
    var bilder = JSON.parse(galerie.getAttribute('data-bilder'));
    var haupt = galerie.querySelector('.haupt img');
    var zahl = galerie.querySelector('.haupt .zahl');
    var knoepfe = galerie.querySelectorAll('.vorschau button');
    var lb = document.getElementById('lightbox');
    var lbImg = lb.querySelector('img');
    var lbZahl = lb.querySelector('.lbzahl');
    var aktuell = 0, startX = null;
    var zeige = function (i) {
      aktuell = (i + bilder.length) % bilder.length;
      haupt.src = bilder[aktuell].gross;
      haupt.width = bilder[aktuell].b; haupt.height = bilder[aktuell].h;
      zahl.textContent = (aktuell + 1) + ' / ' + bilder.length;
      Array.prototype.forEach.call(knoepfe, function (k, n) { k.setAttribute('aria-current', n === aktuell ? 'true' : 'false'); });
      if (lb.classList.contains('offen')) { lbImg.src = bilder[aktuell].gross; lbZahl.textContent = zahl.textContent; }
    };
    var oeffnen = function () {
      lbImg.src = bilder[aktuell].gross; lbZahl.textContent = zahl.textContent;
      lb.classList.add('offen'); document.body.style.overflow = 'hidden';
      lb.querySelector('.zu').focus();
    };
    var schliessen = function () { lb.classList.remove('offen'); document.body.style.overflow = ''; galerie.querySelector('.haupt').focus(); };
    Array.prototype.forEach.call(knoepfe, function (k, n) { k.addEventListener('click', function () { zeige(n); }); });
    galerie.querySelector('.haupt').addEventListener('click', oeffnen);
    lb.querySelector('.zu').addEventListener('click', schliessen);
    lb.querySelector('.vor').addEventListener('click', function () { zeige(aktuell + 1); });
    lb.querySelector('.zurueck').addEventListener('click', function () { zeige(aktuell - 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) schliessen(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('offen')) return;
      if (e.key === 'Escape') schliessen();
      if (e.key === 'ArrowRight') zeige(aktuell + 1);
      if (e.key === 'ArrowLeft') zeige(aktuell - 1);
    });
    lb.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) zeige(aktuell + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  // Anfrageformular: baut eine E-Mail im eigenen Mailprogramm, es wird nichts automatisch gesendet
  var form = document.getElementById('anfrageform');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var objekt = f.objekt.value;
      var betreff = 'Anfrage' + (objekt ? ' ' + objekt : '') + ' – über die Website';
      var zeilen = [
        f.nachricht.value, '',
        'Name: ' + f.name.value,
        'E-Mail: ' + f.email.value,
        f.telefon.value ? 'Telefon: ' + f.telefon.value : ''
      ].filter(function (z, i) { return i < 2 || z; });
      window.location.href = 'mailto:' + form.getAttribute('data-an') + '?subject=' + encodeURIComponent(betreff) + '&body=' + encodeURIComponent(zeilen.join('\n'));
    });
    var p = new URLSearchParams(window.location.search).get('objekt');
    if (p && form.elements.objekt) {
      Array.prototype.forEach.call(form.elements.objekt.options, function (o) { if (o.value.indexOf('Ref ' + p) > -1) o.selected = true; });
    }
  }
})();
