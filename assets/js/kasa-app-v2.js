let kasaChart = null;

/* ==============================
   GRAFİK
============================== */
function loadKasaChart(girisData, cikisData, labels) {
  const canvas = document.getElementById("chartjs-revenue-statistics-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const ctx = canvas.getContext("2d");
  if (kasaChart) kasaChart.destroy();

  kasaChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Kasa Giriş",
          data: girisData,
          borderColor: "#28a745",
          backgroundColor: "rgba(40,167,69,0.1)",
          fill: true,
          tension: 0.3
        },
        {
          label: "Kasa Çıkış",
          data: cikisData,
          borderColor: "#dc3545",
          backgroundColor: "rgba(220,53,69,0.1)",
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

/* ==============================
   PROGRESS BAR
============================== */
function setAutoBar(barId, value, maxValue) {
  let percent = 0;
  if (maxValue > 0) percent = (value / maxValue) * 100;
  if (percent > 100) percent = 100;

  const el = document.getElementById(barId);
  if (el) el.style.width = percent + "%";
}

/* ==============================
   LOGOUT (GLOBAL)
============================== */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}
window.logout = logout;

/* ==============================
   PERMISSIONS (JWT)
============================== */
function getPermissions() {
  try {
    return JSON.parse(localStorage.getItem("permissions") || "[]");
  } catch {
    return [];
  }
}

function applyPermissionsFromToken() {
  const perms = getPermissions();

  // data-perm olan her şeyi kontrol et
  document.querySelectorAll("[data-perm]").forEach((el) => {
    const p = el.getAttribute("data-perm");
    if (p && !perms.includes(p)) {
      el.style.display = "none";
    }
  });
}

function checkPagePermission() {
  const perms = getPermissions().map(p => p.toUpperCase());
  const path = (location.pathname || "").toUpperCase();

  const deny = (perm) => {
    if (!perms.includes(perm)) {
      console.warn("PERMISSION DENIED:", perm, "USER PERMS:", perms);
      window.location.href = "layout.html";
    }
  };

  if (path.includes("KREDI")) deny("KREDILER");
  if (path.includes("KASA")) deny("KASA");
  if (path.includes("CEK")) deny("CEK");
  if (path.includes("SENET")) deny("SENET");
  if (path.includes("MASRAF")) deny("MASRAF");
  if (path.includes("KULLANICI")) deny("KULLANICI_YONETIMI");
}


/* ==============================
   MENU LOAD + UI
============================== */
function afterMenuLoaded() {
  const role = localStorage.getItem("role") || "";

  const adminOnly = document.getElementById("adminMenuOnly");
  if (adminOnly) adminOnly.style.display = role === "ADMIN" ? "block" : "none";

  applyPermissionsFromToken();

  // submenu click (jQuery varsa)
  if (window.$) {
    $(".side-header-menu")
      .find(".has-sub-menu > a")
      .off("click")
      .on("click", function (e) {
        e.preventDefault();
        const parent = $(this).parent();
        parent.toggleClass("open");
        parent.children(".side-header-sub-menu").slideToggle(300);
      });
  }
}

function loadMenu() {
  const menuContainer = document.getElementById("menuContainer");
  if (!menuContainer) return;

  fetch("menu.html")
    .then((r) => r.text())
    .then((html) => {
      menuContainer.innerHTML = html;
      afterMenuLoaded();
    })
    .catch((err) => console.error("MENU LOAD ERROR:", err));
}

/* ==============================
   DOM READY
============================== */
document.addEventListener("DOMContentLoaded", function () {
  // auth-guard.js zaten login kontrolünü yapıyor.
  // Burada sadece UI çalıştırıyoruz.
  loadMenu();

  const role = localStorage.getItem("role");

  const adminDashboard = document.getElementById("adminDashboard");
  const userWelcome = document.getElementById("userWelcome");

  if (role === "USER") {
    if (adminDashboard) adminDashboard.style.display = "none";
    if (userWelcome) userWelcome.style.display = "block";
  } else {
    if (adminDashboard) adminDashboard.style.display = "block";
    if (userWelcome) userWelcome.style.display = "none";
  }

  if (role === "ADMIN") {
    const gunlukGiris = 25000;
    const gunlukCikis = 18000;
    const aylikNet = 42000;
    const kasaBakiye = 185400;

    const maxGunlukGiris = 40000;
    const maxGunlukCikis = 30000;
    const maxAylikNet = 100000;
    const maxBakiye = 250000;

    setAutoBar("barGunlukGiris", gunlukGiris, maxGunlukGiris);
    setAutoBar("barGunlukCikis", gunlukCikis, maxGunlukCikis);
    setAutoBar("barAylikGiris", aylikNet, maxAylikNet);
    setAutoBar("barBakiye", kasaBakiye, maxBakiye);

    loadKasaChart(
      [12000, 15000, 8000, 22000, 17000, 9000, 14000],
      [5000, 7000, 4000, 12000, 9000, 3000, 6000],
      ["1", "2", "3", "4", "5", "6", "7"]
    );
  }

  checkPagePermission();
});

/* ==============================
   Logout click yakalama (onclick'siz de çalışsın)
============================== */
document.addEventListener(
  "click",
  function (e) {
    const a = e.target.closest('a[onclick*="logout"], a#logoutBtn, a[data-logout]');
    if (!a) return;

    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();

    logout();
  },
  true
);


