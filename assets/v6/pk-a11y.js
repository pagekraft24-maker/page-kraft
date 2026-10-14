/* Pagekraft – Barrierefreiheit: Kontraste (WCAG AA), Beschriftungen, Listen- und Überschriften-Struktur.
   Läuft nach dem Rendern und bei Änderungen im DOM (entprellt). */
(function () {
  'use strict';
  function parse(c) {
    var m = c && c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null;
  }
  function lum(c) {
    var a = [c[0], c[1], c[2]].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function blend(fg, bg) { var a = fg[3]; return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1]; }
  function gradientAvg(img) {
    var cs = img.match(/rgba?\([^)]+\)/g); if (!cs) return null;
    var s = [0, 0, 0], n = 0;
    cs.forEach(function (c) { var p = parse(c); if (p && p[3] > 0.5) { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; n++; } });
    return n ? [s[0] / n, s[1] / n, s[2] / n, 1] : null;
  }
  function bgOf(el) {
    var layers = [];
    for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
      var st = getComputedStyle(e);
      if (st.backgroundImage && st.backgroundImage !== 'none') {
        if (/url\(/.test(st.backgroundImage)) return null; // Bild-Hintergrund: nicht berechenbar
        var g = gradientAvg(st.backgroundImage); if (g) { layers.push(g); break; }
      }
      var b = parse(st.backgroundColor);
      if (b && b[3] > 0) { layers.push(b); if (b[3] >= 0.99) break; }
    }
    var base = [255, 255, 255, 1];
    for (var i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base);
    return base;
  }
  function decorative(el) {
    for (var e = el; e && e !== document.body; e = e.parentElement) {
      var c = e.className && e.className.baseVal === undefined ? e.className : '';
      if (/select-none/.test(c) && /pointer-events-none/.test(c)) return true;
      if (e.getAttribute && e.getAttribute('aria-hidden') === 'true') return true;
    }
    return false;
  }
  function contrastEl(el) {

      if (el.__pkC || /^(SCRIPT|STYLE|SVG|PATH|I|BR|IFRAME|IMG|svg|path)$/.test(el.tagName)) return;
      var hasText = false;
      for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) { hasText = true; break; }
      if (!hasText) return;
      var st = getComputedStyle(el);
      if (st.visibility === 'hidden' || st.display === 'none' || +st.opacity === 0) return;
      if (decorative(el)) { // Deko-Text (z. B. große Wasserzeichen-Zahlen) nur noch per CSS darstellen
        el.setAttribute('aria-hidden', 'true');
        if (!el.hasAttribute('data-pk-deco') && el.children.length === 0) { el.setAttribute('data-pk-deco', el.textContent); el.textContent = ''; }
        el.__pkC = 1; return; }
      var fg = parse(st.color), bg = bgOf(el); if (!fg || !bg) return;
      var size = parseFloat(st.fontSize), bold = +st.fontWeight >= 700;
      var need = (size >= 24 || (bold && size >= 18.66)) ? 3 : 4.5;
      var cur = blend(fg, bg);
      if (ratio(cur, bg) >= need + 0.05) { el.__pkC = 1; return; }
      var target = lum(bg) > 0.4 ? [0, 0, 0] : [255, 255, 255], c = cur;
      for (var t = 0.04; t <= 1.0001; t += 0.04) {
        c = [cur[0] + (target[0] - cur[0]) * t, cur[1] + (target[1] - cur[1]) * t, cur[2] + (target[2] - cur[2]) * t, 1];
        if (ratio(c, bg) >= need + 0.15) break;
      }
      el.__pkT = Date.now();
      el.style.setProperty('color', 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')', 'important');
      el.__pkC = 1;
  }
  function fixContrast(root, done) {
    var els = Array.prototype.slice.call(root.querySelectorAll ? root.querySelectorAll('*') : []); if (root.nodeType === 1) els.unshift(root);
    var i = 0;
    (function step(dl) {
      var t0 = Date.now();
      while (i < els.length && Date.now() - t0 < 8) { try { contrastEl(els[i]); } catch (e) {} i++; }
      if (i < els.length) (window.requestIdleCallback || function (f) { return setTimeout(f, 16); })(step); else if (done) done();
    })();
  }
  function fixNames(root) {
    var k = 0;
    root.querySelectorAll('button').forEach(function (b) {
      if (b.getAttribute('aria-label') || b.getAttribute('aria-hidden') || b.textContent.trim() || b.querySelector('img[alt]')) return;
      var r = b.getBoundingClientRect();
      if (r.height < 24 && r.width < 40) { // winzige Deko-Punkte (Vorschau-Karussell): für Screenreader/Tastatur ausblenden
        b.setAttribute('aria-hidden', 'true'); b.setAttribute('tabindex', '-1'); return;
      }
      var sib = b.parentElement ? Array.prototype.indexOf.call(b.parentElement.children, b) + 1 : ++k;
      b.setAttribute('aria-label', 'Ansicht ' + sib);
    });
    root.querySelectorAll('select').forEach(function (s) {
      if (s.getAttribute('aria-label') || (s.id && document.querySelector('label[for="' + s.id + '"]'))) return;
      var o = s.options && s.options[0]; s.setAttribute('aria-label', o ? o.text.replace(/\.+$/, '') : 'Auswahl');
    });
  }
  function fixLists(root) {
    root.querySelectorAll('ul,ol').forEach(function (l) {
      var bad = Array.prototype.some.call(l.children, function (c) { return !/^(LI|SCRIPT|TEMPLATE)$/.test(c.tagName); });
      if (!bad) return;
      l.setAttribute('role', 'list');
      Array.prototype.forEach.call(l.children, function (c) {
        if (c.tagName === 'LI') return;
        c.setAttribute('role', 'listitem');
        c.querySelectorAll('li').forEach(function (li) { if (li.closest('ul,ol') === l) li.setAttribute('role', 'none'); });
      });
    });
  }
  function fixHeadings(root) {
    var prev = 0;
    root.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(function (h) {
      var lvl = +(h.getAttribute('aria-level') || h.tagName[1]);
      if (prev && lvl > prev + 1) { lvl = prev + 1; h.setAttribute('aria-level', String(lvl)); h.setAttribute('role', 'heading'); }
      prev = lvl;
    });
  }
  function run(root) {
    try { fixNames(document); fixLists(document); fixHeadings(document); } catch (e) {}
    fixContrast(root || document.body);
  }
  var pending = [], timer;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      var roots = pending.splice(0); if (!roots.length) return;
      try { fixNames(document); fixLists(document); fixHeadings(document); } catch (e) {}
      roots.forEach(function (r) { if (r.isConnected) fixContrast(r); });
    }, 300);
  }
  function start() {
    run();
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i];
        if (m.type === 'childList') m.addedNodes.forEach(function (n) { if (n.nodeType === 1) pending.push(n); else if (n.parentElement) pending.push(n.parentElement); });
        else if (m.target.nodeType === 1 && !(m.target.__pkT && Date.now() - m.target.__pkT < 150)) { m.target.__pkC = 0; pending.push(m.target); }
      }
      if (pending.length) schedule();
    }).observe(document.getElementById('root') || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  }
  if (document.readyState === 'complete') setTimeout(start, 0); else addEventListener('load', function () { setTimeout(start, 0); });
})();
