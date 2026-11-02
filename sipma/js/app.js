/* =====================================================================
   app.js — INTERAKSI RINGAN (tanpa library)
   Bagian:
     1. Sidebar (hamburger)
     2. Modal <dialog>  (+ isi otomatis dari atribut data-*, + toast)
     3. Tab (Riwayat Akademik / Upload KHS)
     4. Filter tabel (pencarian + dropdown)
     5. Form: login, tombol mata, konfirmasi password, penghitung karakter, nama file
   Halaman tetap terbaca tanpa JS; JS hanya menambah interaksi.
   ===================================================================== */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  /* ---------- 1. SIDEBAR ----------
     Desktop: tombol menyembunyikan sidebar.
     Layar kecil: tombol membuka sidebar sebagai panel geser.        */
  const app = $("[data-app]");
  if (app) {
    const toggles = $$("[data-sidebar-toggle]");
    const mobile = window.matchMedia("(max-width: 56.25em)");

    const syncAria = () => {
      const toggled = app.classList.contains("app--menu-toggled");
      const visible = mobile.matches ? toggled : !toggled;
      toggles.forEach((btn) => btn.setAttribute("aria-expanded", String(visible)));
    };

    toggles.forEach((btn) =>
      btn.addEventListener("click", () => {
        app.classList.toggle("app--menu-toggled");
        syncAria();
      })
    );
    mobile.addEventListener("change", () => {
      app.classList.remove("app--menu-toggled");
      syncAria();
    });
    syncAria();
  }

  /* ---------- 2. MODAL ----------
     Pemicu : <button data-open-modal="id-dialog" data-nama="...">
     Isi    : elemen di dalam dialog dengan data-bind="nama" akan diisi
              dari data-nama milik tombol pemicu.                    */
  const fillModal = (dialog, trigger) => {
    $$("[data-bind]", dialog).forEach((el) => {
      const value = trigger.dataset[el.dataset.bind];
      if (value === undefined) return;
      if ("value" in el) el.value = value;
      else el.textContent = value;
    });
  };

  const showToast = (message) => {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.append(toast);
    setTimeout(() => toast.remove(), 2600);
  };

  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-open-modal]");
    if (opener) {
      const dialog = document.getElementById(opener.dataset.openModal);
      if (dialog) {
        fillModal(dialog, opener);
        dialog.showModal();
      }
    }
    // Klik pada latar gelap (backdrop) menutup dialog
    if (event.target instanceof HTMLDialogElement) event.target.close();
  });

  $$("dialog.modal").forEach((dialog) => {
    dialog.addEventListener("close", () => {
      if (dialog.returnValue === "ok" && dialog.dataset.toast) {
        showToast(dialog.dataset.toast);
      }
      dialog.returnValue = "";
    });
  });

  /* ---------- 3. TAB ---------- */
  $$("[data-tabs]").forEach((tabs) => {
    const tabList = $$('[role="tab"]', tabs);

    const select = (target) => {
      tabList.forEach((tab) => {
        const active = tab === target;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        document.getElementById(tab.getAttribute("aria-controls")).hidden = !active;
      });
      target.focus();
    };

    tabList.forEach((tab, index) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (event) => {
        const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
        if (step) select(tabList[(index + step + tabList.length) % tabList.length]);
      });
    });
  });

  /* ---------- 4. FILTER TABEL ----------
     <form data-filter="#id-tabel">
       <input data-filter-text>                      → cari di seluruh baris
       <select data-filter-key="peran">              → cocokkan data-peran
     Nilai kosong ("") pada select berarti "semua".                  */
  $$("[data-filter]").forEach((form) => {
    const rows = $$(`${form.dataset.filter} tbody tr`);
    const textInput = $("[data-filter-text]", form);
    const selects = $$("[data-filter-key]", form);

    const apply = () => {
      const query = textInput ? textInput.value.trim().toLowerCase() : "";
      rows.forEach((row) => {
        const matchText = !query || row.textContent.toLowerCase().includes(query);
        const matchSelects = selects.every(
          (sel) => !sel.value || row.dataset[sel.dataset.filterKey] === sel.value
        );
        row.hidden = !(matchText && matchSelects);
      });
    };

    form.addEventListener("input", apply);
    form.addEventListener("submit", (event) => event.preventDefault());
  });

  /* ---------- 5. FORM ---------- */
  // Form demo (tanpa backend): setelah validasi HTML lolos, pindah halaman.
  // Password tidak dikirim lewat URL.
  $$("form[data-demo-redirect]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      window.location.href = form.dataset.demoRedirect;
    });
  });

  // Login: peran menentukan halaman tujuan
  const loginForm = $("[data-login]");
  if (loginForm) {
    const roles = $$('input[name="peran"]', loginForm);
    const syncRole = () => {
      const checked = roles.find((radio) => radio.checked);
      if (!checked) return;
      loginForm.dataset.demoRedirect = checked.dataset.home;
    };
    roles.forEach((radio) => radio.addEventListener("change", syncRole));
    syncRole();
  }

  // Tombol mata: buka / tutup password (ikon ditukar CSS lewat aria-pressed)
  $$("[data-toggle-password]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.togglePassword);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-pressed", String(show));
      btn.setAttribute("aria-label", show ? "Sembunyikan password" : "Tampilkan password");
    });
  });

  // Konfirmasi password harus sama: <input data-match="id-password">
  $$("[data-match]").forEach((input) => {
    const source = document.getElementById(input.dataset.match);
    const check = () =>
      input.setCustomValidity(input.value && input.value !== source.value ? "Password tidak sama" : "");
    input.addEventListener("input", check);
    source.addEventListener("input", check);
  });

  // Pesan sukses setelah daftar / reset (dibaca dari ?status=...)
  const messages = {
    daftar: "Akun berhasil dibuat. Silakan login.",
    reset: "Password berhasil direset. Silakan login.",
  };
  const status = new URLSearchParams(window.location.search).get("status");
  if (messages[status]) showToast(messages[status]);

  
  /* ---------- AUTENTIKASI: DAFTAR DAN RESET PASSWORD ---------- */

  // Proses pendaftaran akun (simulasi frontend)
  const registerForm = document.getElementById("register-form");

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!registerForm.reportValidity()) return;

      window.location.href = "index.html?status=daftar";
    });
  }

  // Permintaan reset password melalui email (simulasi frontend)
  const resetForm = document.getElementById("request-reset-form");

  if (resetForm) {
    resetForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!resetForm.reportValidity()) return;

      const email = document.getElementById("email-reset").value;

      // Menyimpan email sementara untuk demonstrasi
      sessionStorage.setItem("resetEmail", email);

      // Menampilkan halaman konfirmasi email
      window.location.href = "email-konfirmasi.html";
    });
  }

  // Menampilkan alamat email pada halaman konfirmasi
  const emailConfirmation = document.querySelector(".email-content");

  if (emailConfirmation) {
    const email = sessionStorage.getItem("resetEmail");

    if (email) {
      const info = document.createElement("p");
      info.className = "email-recipient";
      info.textContent = "Email tujuan: " + email;

      emailConfirmation.insertBefore(
        info,
        emailConfirmation.querySelector(".email-confirm-btn")
      );
    }
  }

  // Proses menyimpan password baru (simulasi frontend)
  const newPasswordForm = document.getElementById("new-password-form");

  if (newPasswordForm) {
    newPasswordForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!newPasswordForm.reportValidity()) return;

      sessionStorage.removeItem("resetEmail");

      window.location.href = "index.html?status=reset";
    });
  }

  // Penghitung karakter pada textarea
  $$("[data-counter]").forEach((area) => {
    const out = document.getElementById(area.dataset.counter);
    const update = () => (out.textContent = `${area.value.length}/${area.maxLength}`);
    area.addEventListener("input", update);
    update();
  });

  // Tampilkan nama file yang dipilih
  $$("[data-file-name]").forEach((input) => {
    input.addEventListener("change", () => {
      const out = document.getElementById(input.dataset.fileName);
      out.textContent = input.files[0] ? input.files[0].name : "";
    });
  });

  // Tautan placeholder (href="#") tidak melompat ke atas halaman
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href="#"]');
    if (link) event.preventDefault();
  });
})();


// POP-UP RESET PASSWORD
const resetOverlay = document.getElementById("reset-overlay");
const openReset = document.querySelector("[data-open-reset]");
const closeReset = document.querySelector("[data-close-reset]");
const resetForm = document.getElementById("reset-form");

if (resetOverlay && openReset && closeReset) {

  openReset.addEventListener("click", function(event) {
    event.preventDefault();
    resetOverlay.hidden = false;
  });

  closeReset.addEventListener("click", function() {
    resetOverlay.hidden = true;
  });

  resetOverlay.addEventListener("click", function(event) {
    if (event.target === resetOverlay) {
      resetOverlay.hidden = true;
    }
  });

  resetForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const password = document.getElementById("reset-password").value;
    const confirm = document.getElementById("reset-confirm").value;

    if (password !== confirm) {
      alert("Konfirmasi password tidak sesuai!");
      return;
    }

    alert("Password berhasil divalidasi. Penyimpanan password perlu dihubungkan ke backend.");
  });
}
