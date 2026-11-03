
/* =========================================================
   app.js
   Interaksi website SIMPA tanpa library tambahan
   ========================================================= */

(() => {
  "use strict";

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  /* =========================================================
     1. SIDEBAR
     ========================================================= */

  const app = $("[data-app]");

  if (app) {
    const toggles = $$("[data-sidebar-toggle]");
    const mobile = window.matchMedia("(max-width: 56.25em)");

    const syncAria = () => {
      const toggled = app.classList.contains("app--menu-toggled");
      const visible = mobile.matches ? toggled : !toggled;

      toggles.forEach((btn) => {
        btn.setAttribute("aria-expanded", String(visible));
      });
    };

    toggles.forEach((btn) => {
      btn.addEventListener("click", () => {
        app.classList.toggle("app--menu-toggled");
        syncAria();
      });
    });

    mobile.addEventListener("change", () => {
      app.classList.remove("app--menu-toggled");
      syncAria();
    });

    syncAria();
  }

  /* =========================================================
     2. TOAST NOTIFIKASI
     ========================================================= */

  const showToast = (message) => {
    const toast = document.createElement("div");

    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;

    document.body.append(toast);

    setTimeout(() => toast.remove(), 2600);
  };

  /* =========================================================
     3. MODAL
     ========================================================= */

  const fillModal = (dialog, trigger) => {
    $$("[data-bind]", dialog).forEach((el) => {
      const value = trigger.dataset[el.dataset.bind];

      if (value === undefined) return;

      if (el.type === "checkbox") {
        el.checked = value === "true";
      } else if (el.tagName === "SELECT") {
        el.value = value;
      } else if ("value" in el) {
        el.value = value;
      } else {
        el.textContent = value;
      }
    });
  };

  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-open-modal]");

    if (opener) {
      const dialog = document.getElementById(
        opener.dataset.openModal
      );

      if (dialog) {
        fillModal(dialog, opener);

        if (!dialog.open) {
          dialog.showModal();
        }
      }
    }

    // Menutup dialog melalui klik backdrop
    if (event.target instanceof HTMLDialogElement) {
      event.target.close();
    }
  });

  $$("dialog.modal").forEach((dialog) => {
    dialog.addEventListener("close", () => {
      if (
        dialog.returnValue === "ok" &&
        dialog.dataset.toast
      ) {
        showToast(dialog.dataset.toast);
      }

      dialog.returnValue = "";
    });
  });

  /* =========================================================
     4. TAB
     ========================================================= */

  $$("[data-tabs]").forEach((tabs) => {
    const tabList = $$('[role="tab"]', tabs);

    const selectTab = (target) => {
      tabList.forEach((tab) => {
        const active = tab === target;

        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;

        const panel = document.getElementById(
          tab.getAttribute("aria-controls")
        );

        if (panel) {
          panel.hidden = !active;
        }
      });

      target.focus();
    };

    tabList.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        selectTab(tab);
      });

      tab.addEventListener("keydown", (event) => {
        const step = {
          ArrowRight: 1,
          ArrowLeft: -1
        }[event.key];

        if (step) {
          event.preventDefault();

          selectTab(
            tabList[
              (index + step + tabList.length) % tabList.length
            ]
          );
        }
      });
    });
  });

  /* =========================================================
     5. FILTER TABEL
     ========================================================= */

  $$("[data-filter]").forEach((form) => {
    const table = $(form.dataset.filter);

    if (!table) return;

    const rows = $$("tbody tr", table);
    const textInput = $("[data-filter-text]", form);
    const selects = $$("[data-filter-key]", form);

    const applyFilter = () => {
      const query = textInput
        ? textInput.value.trim().toLowerCase()
        : "";

      rows.forEach((row) => {
        const matchText =
          !query ||
          row.textContent.toLowerCase().includes(query);

        const matchSelects = selects.every((select) => {
          return (
            !select.value ||
            row.dataset[select.dataset.filterKey] ===
              select.value
          );
        });

        row.hidden = !(matchText && matchSelects);
      });
    };

    form.addEventListener("input", applyFilter);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  });

  /* =========================================================
     6. FORM DEMO REDIRECT
     ========================================================= */

  $$("form[data-demo-redirect]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      window.location.href = form.dataset.demoRedirect;
    });
  });

  /* =========================================================
     7. LOGIN
     ========================================================= */

  const loginForm = $("[data-login]");

  if (loginForm) {
    const roles = $$('input[name="peran"]', loginForm);

    const password = $("#password", loginForm);

    const syncRole = () => {
      const checked = roles.find((radio) => radio.checked);

      if (checked) {
        loginForm.dataset.demoRedirect =
          checked.dataset.home;
      }
    };

    roles.forEach((radio) => {
      radio.addEventListener("change", syncRole);
    });

    syncRole();

    loginForm.addEventListener("submit", (event) => {
      if (!password) return;

      if (password.value.length < 8) {
        event.preventDefault();

        alert("Password minimal harus 8 karakter.");

        password.focus();
      }
    });
  }

  /* =========================================================
     8. TOMBOL TAMPIL / SEMBUNYIKAN PASSWORD
     ========================================================= */

  $$("[data-toggle-password]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(
        btn.dataset.togglePassword
      );

      if (!input) return;

      const show = input.type === "password";

      input.type = show ? "text" : "password";

      btn.setAttribute("aria-pressed", String(show));

      btn.setAttribute(
        "aria-label",
        show
          ? "Sembunyikan password"
          : "Tampilkan password"
      );
    });
  });

  /* =========================================================
     9. KONFIRMASI PASSWORD
     ========================================================= */

  $$("[data-match]").forEach((input) => {
    const source = document.getElementById(
      input.dataset.match
    );

    if (!source) return;

    const checkPassword = () => {
      input.setCustomValidity(
        input.value && input.value !== source.value
          ? "Password tidak sama."
          : ""
      );
    };

    input.addEventListener("input", checkPassword);
    source.addEventListener("input", checkPassword);
  });

  /* =========================================================
     10. STATUS DAFTAR DAN RESET PASSWORD
     ========================================================= */

  const messages = {
    daftar: "Akun berhasil dibuat. Silakan login.",
    reset: "Password berhasil direset. Silakan login."
  };

  const status = new URLSearchParams(
    window.location.search
  ).get("status");

  if (messages[status]) {
    showToast(messages[status]);
  }

  /* =========================================================
     11. VALIDASI NPM DAN NIDN
     ========================================================= */

  const registerForm = $("#register-form");

  if (registerForm) {
    const npmNidn = $(
      '[name="npm_nidn"], [name="nomor_identitas"]',
      registerForm
    );

    if (npmNidn) {
      registerForm.addEventListener("submit", (event) => {
        const jumlahKarakter = npmNidn.value.trim().length;

        if (
          jumlahKarakter !== 11 &&
          jumlahKarakter !== 15
        ) {
          event.preventDefault();

          alert(
            "NPM harus 11 karakter atau NIDN harus 15 karakter."
          );

          npmNidn.focus();
        }
      });
    }
  }

  /* =========================================================
     12. RESET PASSWORD MELALUI EMAIL
     ========================================================= */

  const resetRequestForm = $("#request-reset-form");

  if (resetRequestForm) {
    resetRequestForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!resetRequestForm.reportValidity()) return;

      const email = $("#email-reset");

      if (!email) return;

      sessionStorage.setItem(
        "resetEmail",
        email.value
      );

      window.location.href = "email-konfirmasi.html";
    });
  }

  /* =========================================================
     13. KONFIRMASI EMAIL
     ========================================================= */

  const emailConfirmation = $(".email-content");

  if (emailConfirmation) {
    const email = sessionStorage.getItem("resetEmail");

    if (email) {
      const info = document.createElement("p");

      info.className = "email-recipient";
      info.textContent = "Email tujuan: " + email;

      const button = $(".email-confirm-btn", emailConfirmation);

      if (button) {
        emailConfirmation.insertBefore(info, button);
      } else {
        emailConfirmation.append(info);
      }
    }
  }

  /* =========================================================
     14. SIMPAN PASSWORD BARU (SIMULASI)
     ========================================================= */

  const newPasswordForm = $("#new-password-form");

  if (newPasswordForm) {
    newPasswordForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!newPasswordForm.reportValidity()) return;

      sessionStorage.removeItem("resetEmail");

      window.location.href = "index.html?status=reset";
    });
  }

  /* =========================================================
     15. POP-UP RESET PASSWORD
     ========================================================= */

  const resetOverlay = $("#reset-overlay");
  const openReset = $("[data-open-reset]");
  const closeReset = $("[data-close-reset]");
  const resetPopupForm = $("#reset-form");

  if (resetOverlay && openReset && closeReset) {
    openReset.addEventListener("click", (event) => {
      event.preventDefault();

      resetOverlay.hidden = false;
    });

    closeReset.addEventListener("click", () => {
      resetOverlay.hidden = true;
    });

    resetOverlay.addEventListener("click", (event) => {
      if (event.target === resetOverlay) {
        resetOverlay.hidden = true;
      }
    });

    if (resetPopupForm) {
      resetPopupForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!resetPopupForm.reportValidity()) return;

        const password = $("#reset-password");
        const confirm = $("#reset-confirm");

        if (!password || !confirm) return;

        if (password.value !== confirm.value) {
          alert("Konfirmasi password tidak sesuai!");
          confirm.focus();
          return;
        }

        alert(
          "Password berhasil divalidasi. Penyimpanan password perlu dihubungkan ke backend."
        );

        resetOverlay.hidden = true;
      });
    }
  }

  /* =========================================================
     16. PENGHITUNG KARAKTER
     ========================================================= */

  $$("[data-counter]").forEach((area) => {
    const output = document.getElementById(
      area.dataset.counter
    );

    if (!output) return;

    const updateCounter = () => {
      output.textContent =
        `${area.value.length}/${area.maxLength}`;
    };

    area.addEventListener("input", updateCounter);

    updateCounter();
  });

  /* =========================================================
     17. NAMA FILE UPLOAD
     ========================================================= */

  $$("[data-file-name]").forEach((input) => {
    input.addEventListener("change", () => {
      const output = document.getElementById(
        input.dataset.fileName
      );

      if (!output) return;

      output.textContent = input.files[0]
        ? input.files[0].name
        : "";
    });
  });

  /* =========================================================
     18. EDIT DATA PENGGUNA
     ========================================================= */

  const editModal = $("#modal-edit-pengguna");

  if (editModal) {
    $$('[data-open-modal="modal-edit-pengguna"]').forEach(
      (button) => {
        button.addEventListener("click", () => {
          const fields = [
            "nama",
            "nomor",
            "peran",
            "status"
          ];

          fields.forEach((field) => {
            const input = $(
              `[data-bind="${field}"]`,
              editModal
            );

            if (!input) return;

            const value = button.dataset[field];

            if (value === undefined) return;

            input.value = value;
          });
        });
      }
    );
  }

  /* =========================================================
     19. TAUTAN PLACEHOLDER
     ========================================================= */

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href="#"]');

    if (link) {
      event.preventDefault();
    }
  });

})();
