/* toc.js: The Journal. Two small enhancements, no libraries.
   1. Article side table of contents: [data-toc] marks the section being read with aria-current (IntersectionObserver).
   2. Journal filter chips are real links to the category pages (they work without JS); with JS they filter in place, so the
      navigation is cancelled here and site.js's [data-filter-group] handler does the filtering. */
(function () {
  var nav = document.querySelector('[data-toc]');
  if (nav && 'IntersectionObserver' in window) {
    var links = [].slice.call(nav.querySelectorAll('a[href^="#"]'));
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var inBand = [];
    var mark = function (i) {
      links.forEach(function (a, n) {
        if (n === i) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var i = targets.indexOf(en.target);
        var at = inBand.indexOf(i);
        if (en.isIntersecting && at < 0) inBand.push(i);
        if (!en.isIntersecting && at >= 0) inBand.splice(at, 1);
      });
      if (inBand.length) mark(Math.max.apply(null, inBand));
    }, { rootMargin: '-22% 0px -68% 0px', threshold: 0 });
    targets.forEach(function (t) { if (t) io.observe(t); });
  }
  var group = document.querySelector('[data-filter-group]');
  if (group) {
    [].slice.call(group.querySelectorAll('a[data-filter]')).forEach(function (a) {
      a.setAttribute('role', 'button');
      a.addEventListener('click', function (e) { e.preventDefault(); }, true);
      a.addEventListener('keydown', function (e) {
        if (e.key === ' ') { e.preventDefault(); a.click(); }
      });
    });
  }
})();
