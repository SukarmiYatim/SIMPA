document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('td span').forEach(function (el) {
    var t = el.textContent.trim();
    var k = t.toLowerCase();
    if (k === 'rendah' || k === 'sedang' || k === 'tinggi') {
      el.className = 'badge-klasifikasi ' + k;
      el.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>' +
        '<line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' + t;
    } else if (t === 'Perlu Verifikasi') {
      el.className = 'status-verifikasi';
    }
  });
});