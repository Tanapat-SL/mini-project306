// ฟังก์ชันช่วยเหลือทั่วไป (UI helpers)

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
        (type==='success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800');
    i.className = type==='success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';
    m.innerText = message; b.classList.remove('hidden'); setTimeout(hideAlert, 4000);
}
function hideAlert() { document.getElementById('alert-box').classList.add('hidden'); }

function readFileAsBase64(f) { return new Promise(r => { const rd = new FileReader(); rd.onload = () => r(rd.result); rd.readAsDataURL(f); }); }

function badge(s) {
    if(s==='รอดำเนินการ') return `<span class="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">รอดำเนินการ</span>`;
    if(s==='กำลังแก้ไข') return `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">กำลังแก้ไข</span>`;
    return `<span class="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">เสร็จสิ้น</span>`;
}
function escapeHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
