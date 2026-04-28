// Gradient-heavy backgrounds + gradient text on hero.
// Two sub-signals:
//   1. Hero H1 with `background-clip: text` over a gradient (one element)
//   2. ≥5 elements with a CSS gradient background

export default {
  id: 'gradients',
  label: 'Gradient-heavy backgrounds / gradient text on hero',
  shortLabel: 'Gradients',
  description: "Can't pick a color, so pick two and fade them.",
  category: 'colors',
  thresholds: {
    minBgGradients: 4
  },

  extract: function (ctx) {
    const { visible, h1 } = ctx;
    let bgElements = 0;
    let textElements = 0;
    let conic = 0;
    for (const el of visible) {
      const cs = getComputedStyle(el);
      const bgImg = cs.backgroundImage || '';
      if (/gradient\(/.test(bgImg)) {
        bgElements++;
        if (/conic-gradient/.test(bgImg)) conic++;
      }
      if ((cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') && /gradient\(/.test(bgImg)) {
        textElements++;
      }
    }

    // Big centered hero with gradient text — strong signal on its own.
    let bigHeroGradientText = false;
    if (h1) {
      const cs = getComputedStyle(h1);
      const fontSize = parseFloat(cs.fontSize);
      if (fontSize >= 40 && cs.textAlign === 'center'
          && (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text')
          && /gradient\(/.test(cs.backgroundImage || '')) {
        bigHeroGradientText = true;
      }
    }

    return {
      bgElements,
      textElements,
      conic,
      bigHeroGradientText,
      ratio: visible.length ? +(bgElements / visible.length).toFixed(3) : 0
    };
  },

  score: function (signal, T) {
    if (!signal) return { triggered: false };
    // Trigger if hero has gradient text OR there are 5+ gradient backgrounds.
    const triggered = signal.bigHeroGradientText
      || signal.textElements > 0
      || signal.bgElements >= T.minBgGradients;
    if (!triggered) return { triggered: false };
    return {
      triggered: true,
      evidence: {
        gradientBackgrounds: signal.bgElements,
        gradientText: signal.textElements,
        conicGradients: signal.conic,
        heroHasGradientText: signal.bigHeroGradientText
      }
    };
  }
};
