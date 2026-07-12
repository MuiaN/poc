/* Aviation Dashboard — shared theme manager
   Apply before first paint to avoid flash */
(function () {
  var STORAGE_KEY = 'avTheme';

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
  }

  /* Apply saved theme immediately */
  applyTheme(localStorage.getItem(STORAGE_KEY) || 'dark');

  /* Listen for cross-frame theme changes from parent */
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'avSetTheme') {
      localStorage.setItem(STORAGE_KEY, e.data.theme);
      applyTheme(e.data.theme);
    }
  });

  /* Expose a helper so index.html can call it directly */
  window.__avTheme = {
    get: function () { return localStorage.getItem(STORAGE_KEY) || 'dark'; },
    set: function (t) {
      localStorage.setItem(STORAGE_KEY, t);
      applyTheme(t);
      /* Broadcast to all iframes */
      var frames = document.querySelectorAll('iframe');
      frames.forEach(function (f) {
        try { f.contentWindow.postMessage({ type: 'avSetTheme', theme: t }, '*'); } catch (e) {}
      });
    },
    toggle: function () {
      window.__avTheme.set(window.__avTheme.get() === 'dark' ? 'light' : 'dark');
    }
  };
})();
