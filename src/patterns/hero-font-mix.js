// Mixed fonts in the hero heading. The tell is the "fancy emphasized word"
// cliché — a large hero headline that fancies up one word by switching
// typeface or slanting it, e.g. "Stop being a *fraud*." where "fraud." is a
// serif italic. Fires when the biggest heading near the top of the page mixes
// either two font families OR a roman + italic of the same family.

export default {
  id: 'hero_font_mix',
  label: 'Two fonts mixed in the hero',
  shortLabel: 'Hero font mix',
  description: 'Hero headline fancies up one word with a second typeface or a roman→italic switch — e.g. "Stop being a *fraud*."',
  category: 'fonts',
  thresholds: {
    minFontSize: 32,   // a real hero headline, not body copy
    maxTextLen: 140    // a headline, not a paragraph/section wrapper
  },

  extract: function (ctx) {
    var T = ctx.thresholds;
    var MAXTOP = window.innerHeight || 900;
    var cands = [];
    for (var i = 0; i < ctx.visible.length; i++) {
      var el = ctx.visible[i];
      var cs = getComputedStyle(el);
      var size = parseFloat(cs.fontSize) || 0;
      if (size < T.minFontSize) continue;
      var r = el.getBoundingClientRect();
      if (r.top < 0 || r.top > MAXTOP || r.width === 0) continue;
      var txt = (el.textContent || '').trim();
      if (txt.length < 2 || txt.length > T.maxTextLen) continue;
      // A real heading element: has its own text, or wraps only inline runs —
      // not a big-font section that merely contains the heading.
      var hasDirect = false, onlyInline = true;
      for (var c = 0; c < el.childNodes.length; c++) {
        var n = el.childNodes[c];
        if (n.nodeType === 3 && n.textContent.trim().length >= 2) hasDirect = true;
        if (n.nodeType === 1 && !/^(SPAN|EM|I|B|STRONG|MARK|A|U|SMALL)$/.test(n.tagName)) onlyInline = false;
      }
      if (!hasDirect && !onlyInline) continue;
      cands.push({ el: el, size: size, top: r.top, txt: txt });
    }
    cands.sort(function (a, b) { return b.size - a.size || a.top - b.top; });
    if (!cands.length) return { hero: false };

    var hero = cands[0];
    var runs = [];
    (function visit(el) {
      for (var c = 0; c < el.childNodes.length; c++) {
        var n = el.childNodes[c];
        if (n.nodeType === 3) {
          var t = n.textContent.trim();
          if (t.length >= 2) {
            var cs = getComputedStyle(el);
            var fam = (cs.fontFamily || '').split(',')[0].replace(/^['"]|['"]$/g, '').trim();
            if (!fam || /awesome|material icons|icon/i.test(fam)) continue;
            var st = (cs.fontStyle || '');
            runs.push({ fam: fam, style: (st.indexOf('italic') === 0 || st.indexOf('oblique') === 0) ? 'italic' : 'normal' });
          }
        } else if (n.nodeType === 1) {
          visit(n);
        }
      }
    })(hero.el);

    var fams = [], styles = [];
    for (var k = 0; k < runs.length; k++) {
      if (fams.indexOf(runs[k].fam) < 0) fams.push(runs[k].fam);
      if (styles.indexOf(runs[k].style) < 0) styles.push(runs[k].style);
    }
    return {
      hero: true,
      heroText: hero.txt.slice(0, 80),
      fontSize: Math.round(hero.size),
      top: Math.round(hero.top),
      families: fams,
      styles: styles,
      runCount: runs.length
    };
  },

  score: function (signal, T) {
    if (!signal || !signal.hero) return { triggered: false };
    if (signal.runCount < 2) return { triggered: false };
    var twoFamilies = signal.families.length >= 2;
    var styleMix = signal.styles.indexOf('italic') >= 0 && signal.styles.indexOf('normal') >= 0;
    if (!twoFamilies && !styleMix) return { triggered: false };
    return {
      triggered: true,
      evidence: {
        hero: signal.heroText,
        fontSize: signal.fontSize,
        families: signal.families,
        kind: twoFamilies ? 'two typefaces' : 'roman + italic'
      }
    };
  }
};
