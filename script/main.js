/**
 * ====================================================================
 * NOONA LAUNDRY - MAIN JAVASCRIPT & AUTHENTICATION (MOCKUP / LOCALSTORAGE)
 * ====================================================================
 */

// Konstanta WhatsApp
const WA_PHONE = "6281234567890";

// Inisialisasi Akun Default ke LocalStorage jika belum ada
const DEFAULT_ACCOUNTS = [
    {
        identifier: "member@noona.com",
        phone: "081234567890",
        name: "Budi Santoso",
        role: "TORU Member",
        saldo: 220000,
        password: "123456"
    },
    {
        identifier: "081234567890",
        phone: "081234567890",
        name: "Budi Santoso",
        role: "TORU Member",
        saldo: 220000,
        password: "123456"
    }
];

function initDefaultUsers() {
    if (!localStorage.getItem("noona_users")) {
        localStorage.setItem("noona_users", JSON.stringify(DEFAULT_ACCOUNTS));
    }
}

// ====================================================================
// AUTH & MODAL FUNCTIONS
// ====================================================================

function openLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.classList.add("open");
        document.body.style.overflow = "hidden"; // Mencegah scrolling latar belakang
        switchAuthTab('login');
        clearAuthAlert();
    }
}

function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.classList.remove("open");
        document.body.style.overflow = "";
        clearAuthAlert();
    }
}

function handleOverlayClick(event) {
    if (event.target.id === "loginModal") {
        closeLoginModal();
    }
}

function switchAuthTab(tab) {
    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const title = document.getElementById("authModalTitle");
    const subtitle = document.getElementById("authModalSubtitle");

    clearAuthAlert();

    if (tab === 'login') {
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        title.innerHTML = 'Masuk ke <span class="accent">Noona Laundry</span>';
        subtitle.textContent = "Akses saldo TORU Member & riwayat laundry kamu";
    } else {
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
        loginForm.style.display = "none";
        registerForm.style.display = "block";
        title.innerHTML = 'Daftar <span class="accent">TORU Member</span>';
        subtitle.textContent = "Dapatkan cashback s.d 20% & kemudahan pesan laundry";
    }
}

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector("i");
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

function showAuthAlert(message, type = "error") {
    const alertBox = document.getElementById("authAlert");
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `auth-alert ${type}`;
    alertBox.style.display = "flex";
}

function clearAuthAlert() {
    const alertBox = document.getElementById("authAlert");
    if (alertBox) {
        alertBox.style.display = "none";
        alertBox.textContent = "";
    }
}

// Handle Login Submit
function handleLoginSubmit(event) {
    event.preventDefault();
    const identifier = document.getElementById("loginIdentifier").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const users = JSON.parse(localStorage.getItem("noona_users") || "[]");

    // Cari user yang cocok
    let user = users.find(u => 
        (u.identifier.toLowerCase() === identifier || (u.phone && u.phone === identifier)) && 
        u.password === password
    );

    // Untuk fleksibilitas demo: jika belum terdaftar, izinkan login langsung sebagai user baru jika password diisi
    if (!user) {
        if (identifier.length >= 3 && password.length >= 4) {
            user = {
                identifier: identifier,
                phone: identifier.startsWith("08") ? identifier : "08123456789",
                name: identifier.includes("@") ? identifier.split("@")[0] : `Member ${identifier.slice(-4)}`,
                role: "TORU Member",
                saldo: 100000,
                password: password
            };
            users.push(user);
            localStorage.setItem("noona_users", JSON.stringify(users));
        } else {
            showAuthAlert("Format akun atau sandi minimal 4 karakter!", "error");
            return;
        }
    }

    // Simpan session user yang aktif
    localStorage.setItem("noona_current_user", JSON.stringify(user));

    showAuthAlert("Login berhasil! Mengalihkan...", "success");

    setTimeout(() => {
        closeLoginModal();
        updateAuthUI();
        showToast(`Selamat datang kembali, ${user.name}! 👋`);
        // Reset form
        document.getElementById("loginForm").reset();
    }, 600);
}

// Handle Register Submit
function handleRegisterSubmit(event) {
    event.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const phone = document.getElementById("regWhatsapp").value.trim();
    const password = document.getElementById("regPassword").value;

    if (!name || !phone || !password) {
        showAuthAlert("Mohon isi semua data pendaftaran!", "error");
        return;
    }

    const users = JSON.parse(localStorage.getItem("noona_users") || "[]");

    // Cek apakah nomor sudah ada
    const existing = users.find(u => u.phone === phone || u.identifier === phone);
    if (existing) {
        showAuthAlert("Nomor WhatsApp ini sudah terdaftar. Silakan langsung Masuk!", "error");
        return;
    }

    const newUser = {
        identifier: phone,
        phone: phone,
        name: name,
        role: "TORU Member Baru",
        saldo: 50000, // Bonus saldo awal pendaftaran
        password: password
    };

    users.push(newUser);
    localStorage.setItem("noona_users", JSON.stringify(users));
    localStorage.setItem("noona_current_user", JSON.stringify(newUser));

    showAuthAlert("Pendaftaran berhasil! Bonus saldo Rp 50.000 aktif.", "success");

    setTimeout(() => {
        closeLoginModal();
        updateAuthUI();
        showToast(`Pendaftaran berhasil! Halo, ${newUser.name} ✨`);
        document.getElementById("registerForm").reset();
    }, 700);
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem("noona_current_user");
    closeUserDropdown();
    updateAuthUI();
    showToast("Anda telah keluar dari akun.");
}

// Toggle Dropdown User
function toggleUserDropdown() {
    const dropdown = document.getElementById("userDropdown");
    const badge = document.getElementById("userBadge");
    if (dropdown && badge) {
        const isOpen = dropdown.classList.contains("show");
        if (isOpen) {
            closeUserDropdown();
        } else {
            dropdown.classList.add("show");
            badge.classList.add("active");
        }
    }
}

function closeUserDropdown() {
    const dropdown = document.getElementById("userDropdown");
    const badge = document.getElementById("userBadge");
    if (dropdown) dropdown.classList.remove("show");
    if (badge) badge.classList.remove("active");
}

// Update Tampilan Header Berdasarkan Status Login
function updateAuthUI() {
    const loginBtn = document.getElementById("loginBtn");
    const userBadge = document.getElementById("userBadge");
    const userNameDisplay = document.getElementById("userNameDisplay");
    const userRoleDisplay = document.getElementById("userRoleDisplay");
    const userSaldoDisplay = document.getElementById("userSaldoDisplay");

    const currentUserStr = localStorage.getItem("noona_current_user");

    if (currentUserStr) {
        const user = JSON.parse(currentUserStr);
        if (loginBtn) loginBtn.style.display = "none";
        if (userBadge) userBadge.style.display = "block";
        if (userNameDisplay) userNameDisplay.textContent = user.name || "Member";
        if (userRoleDisplay) userRoleDisplay.textContent = user.role || "TORU Member";
        if (userSaldoDisplay) {
            userSaldoDisplay.textContent = "Rp " + Number(user.saldo || 0).toLocaleString("id-ID");
        }
    } else {
        if (loginBtn) loginBtn.style.display = "inline-flex";
        if (userBadge) userBadge.style.display = "none";
        closeUserDropdown();
    }
}

// Toast Notification
function showToast(message, isError = false) {
    const toast = document.getElementById("toastNotification");
    const msgElem = document.getElementById("toastMessage");
    const iconElem = document.getElementById("toastIcon");

    if (!toast || !msgElem) return;

    msgElem.textContent = message;

    if (isError) {
        toast.classList.add("error");
        if (iconElem) {
            iconElem.className = "fas fa-exclamation-circle toast-icon";
        }
    } else {
        toast.classList.remove("error");
        if (iconElem) {
            iconElem.className = "fas fa-check-circle toast-icon";
        }
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}

function forgotPasswordNotice() {
    alert("Untuk reset password TORU Member, silakan konfirmasi ke admin via WhatsApp.");
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent("Halo Noona Laundry, saya butuh bantuan reset kata sandi akun saya.")}`, "_blank");
}

// ====================================================================
// FITUR LANDING PAGE (NAV, PESANAN, KALKULATOR, PROMO)
// ====================================================================

function toggleMenu() {
    const nav = document.querySelector(".nav");
    if (nav) {
        nav.classList.toggle("open");
    }
}

function scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        const nav = document.querySelector(".nav");
        if (nav && nav.classList.contains("open")) {
            nav.classList.remove("open");
        }
    }
}

function orderNow() {
    const currentUser = JSON.parse(localStorage.getItem("noona_current_user") || "null");
    let text = "Halo Noona Laundry, saya mau pesan jasa laundry.";
    if (currentUser) {
        text = `Halo Noona Laundry, saya ${currentUser.name} (Member: ${currentUser.role}) mau order laundry.`;
    }
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`, "_blank");
}

function orderService(serviceName, price) {
    const currentUser = JSON.parse(localStorage.getItem("noona_current_user") || "null");
    let text = `Halo Noona Laundry, saya mau order layanan *${serviceName}* (Rp ${price.toLocaleString("id-ID")}).`;
    if (currentUser) {
        text = `Halo Noona Laundry, saya ${currentUser.name} (Member) mau pesan layanan *${serviceName}*.`;
    }
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`, "_blank");
}

function orderMembership(amount, value) {
    const currentUser = JSON.parse(localStorage.getItem("noona_current_user") || "null");
    let text = `Halo Noona Laundry, saya ingin top up / beli paket TORU Member Rp ${amount.toLocaleString("id-ID")} (Dapat saldo Rp ${value.toLocaleString("id-ID")}).`;
    if (currentUser) {
        text = `Halo Noona Laundry, saya ${currentUser.name} mau top up paket saldo Rp ${amount.toLocaleString("id-ID")}.`;
    }
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`, "_blank");
}

function calculatePrice() {
    const serviceSelect = document.getElementById("serviceType");
    const weightInput = document.getElementById("weight");
    const calcResult = document.getElementById("calcResult");
    const totalPriceEl = document.getElementById("totalPrice");
    const discountRow = document.getElementById("discountRow");
    const discountAmountEl = document.getElementById("discountAmount");
    const finalPriceEl = document.getElementById("finalPrice");

    if (!serviceSelect || !weightInput) return;

    const pricePerKg = parseFloat(serviceSelect.value) || 0;
    const weight = parseFloat(weightInput.value) || 0;

    if (weight < 2) {
        alert("Minimal laundry adalah 2 kg.");
        weightInput.value = 2;
        return;
    }

    const subtotal = pricePerKg * weight;
    let discount = 0;

    // Diskon 10% jika berat >= 10kg
    if (weight >= 10) {
        discount = subtotal * 0.1;
        discountRow.style.display = "flex";
        discountAmountEl.textContent = "- Rp " + Math.round(discount).toLocaleString("id-ID");
    } else {
        discountRow.style.display = "none";
    }

    const finalTotal = subtotal - discount;

    totalPriceEl.textContent = "Rp " + Math.round(subtotal).toLocaleString("id-ID");
    finalPriceEl.textContent = "Rp " + Math.round(finalTotal).toLocaleString("id-ID");

    calcResult.style.display = "block";
}

function orderFromCalculator() {
    const serviceSelect = document.getElementById("serviceType");
    const serviceText = serviceSelect.options[serviceSelect.selectedIndex].text;
    const weight = document.getElementById("weight").value;
    const finalPrice = document.getElementById("finalPrice").textContent;

    const currentUser = JSON.parse(localStorage.getItem("noona_current_user") || "null");
    let memberInfo = currentUser ? `\nNama Member: ${currentUser.name}` : "";

    const message = `Halo Noona Laundry, saya mau pesan via Estimasi Website:${memberInfo}\n- Layanan: ${serviceText}\n- Berat: ${weight} kg\n- Estimasi Total: ${finalPrice}`;
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
}

function openMaps() {
    window.open("https://maps.google.com/?q=Laundry+Noona", "_blank");
}

// Countdown Timer Promo
function initCountdown() {
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (!hoursEl || !minutesEl || !secondsEl) return;

    let totalSeconds = 12 * 3600 + 30 * 60 + 45;

    setInterval(() => {
        if (totalSeconds <= 0) {
            totalSeconds = 24 * 3600; // Reset countdown
        }

        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        hoursEl.textContent = String(hrs).padStart(2, "0");
        minutesEl.textContent = String(mins).padStart(2, "0");
        secondsEl.textContent = String(secs).padStart(2, "0");

        totalSeconds--;
    }, 1000);
}

// Global Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    initDefaultUsers();
    updateAuthUI();
    initCountdown();

    // Tutup dropdown user atau mobile nav saat klik di luar
    document.addEventListener("click", (e) => {
        const userBadge = document.getElementById("userBadge");
        if (userBadge && !userBadge.contains(e.target)) {
            closeUserDropdown();
        }

        const nav = document.querySelector(".nav");
        const toggle = document.querySelector(".mobile-toggle");
        if (nav && toggle && !nav.contains(e.target) && !toggle.contains(e.target)) {
            nav.classList.remove("open");
        }
    });

    // Tutup modal dengan tombol Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeLoginModal();
            closeUserDropdown();
        }
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute("id");
            }
        });
        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });

    // Animation Observer untuk cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, observerOptions);

    document.querySelectorAll(".service-card, .membership-card").forEach((card) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";
        card.style.transition = "all 0.6s ease-out";
        observer.observe(card);
    });
});

