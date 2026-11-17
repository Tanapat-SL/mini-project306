// ฟังก์ชันช่วยเหลือทั่วไป (UI helpers)

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const icon = document.getElementById('theme-icon');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        if (icon) icon.className = 'fa-solid fa-sun';
    } else {
        document.documentElement.classList.remove('dark');
        if (icon) icon.className = 'fa-solid fa-moon';
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (typeof closeImageViewer === 'function') closeImageViewer();
        if (typeof closeReportDetail === 'function') closeReportDetail();
    }
});

function togglePasswordVisibility() {
    const pInput = document.getElementById('password');
    const icon = document.getElementById('toggle-password-icon');
    if (pInput.type === 'password') { pInput.type = 'text'; icon.classList.replace('fa-eye', 'fa-eye-slash'); }
    else { pInput.type = 'password'; icon.classList.replace('fa-eye-slash', 'fa-eye'); }
}

function showAlert(message, type = 'success') {
    const b = document.getElementById('alert-box');
    const m = document.getElementById('alert-msg');
    const i = document.getElementById('alert-icon');
    b.className = 'mb-6 p-4 rounded-xl shadow-sm border text-sm flex justify-between ' +
        (type==='success' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800');
    i.className = type==='success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';
    m.innerText = message; b.classList.remove('hidden'); setTimeout(hideAlert, 4000);
}
function hideAlert() { document.getElementById('alert-box').classList.add('hidden'); }

function readFileAsBase64(f) { return new Promise(r => { const rd = new FileReader(); rd.onload = () => r(rd.result); rd.readAsDataURL(f); }); }

function badge(s) {
    if(s==='รอดำเนินการ') return `<span class="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-full text-xs font-medium">รอดำเนินการ</span>`;
    if(s==='กำลังแก้ไข') return `<span class="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full text-xs font-medium">กำลังแก้ไข</span>`;
    return `<span class="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-medium">เสร็จสิ้น</span>`;
}
function escapeHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }