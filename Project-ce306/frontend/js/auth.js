// การเข้าสู่ระบบ / ออกจากระบบ / สลับหน้าตามสิทธิ์

let currentUser = null;
let currentToken = localStorage.getItem('token') || null;
let realtimeInterval = null;

function checkInitialAuth() {
    if (currentToken) { currentUser = { username: localStorage.getItem('username'), role: localStorage.getItem('user_role') }; renderAuth(); }
    else renderLoginState();
}

async function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    try {
        const r = await fetch('/api/login', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username:u, password:p}) });
        const d = await r.json();
        if (r.ok) {
            currentToken = d.token; currentUser = {username:u, role:d.role};
            localStorage.setItem('token', d.token); localStorage.setItem('user_role', d.role); localStorage.setItem('username', u);
            showAlert(`ยินดีต้อนรับ ${u}`, 'success'); renderAuth();
        } else showAlert(d.message || 'รหัสผ่านผิด', 'error');
    } catch { showAlert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', 'error'); }
}

function logout() {
    stopRealtimeSync();
    const savedTheme = localStorage.getItem('theme');
    localStorage.clear();
    if (savedTheme) localStorage.setItem('theme', savedTheme);
    currentToken=null; currentUser=null;
    renderLoginState();
}

function startRealtimeSync() {
    stopRealtimeSync();
    realtimeInterval = setInterval(() => {
        if (!currentToken || document.hidden) return;
        loadReports(true);
        loadAnnouncements(true);
    }, 5000); // ตรวจสอบข้อมูลใหม่ทุก 5 วินาที
}

function stopRealtimeSync() {
    if (realtimeInterval) {
        clearInterval(realtimeInterval);
        realtimeInterval = null;
    }
}

function renderLoginState() {
    stopRealtimeSync();
    document.getElementById('view-login').classList.remove('hidden');
    document.getElementById('view-student').classList.add('hidden');
    document.getElementById('view-admin').classList.add('hidden');
    document.getElementById('user-nav').classList.add('hidden');
}

function renderAuth() {
    renderLoginState();
    document.getElementById('view-login').classList.add('hidden');
    document.getElementById('user-nav').classList.remove('hidden');
    document.getElementById('nav-user-badge').innerHTML = `<i class="fa-solid fa-user-circle"></i> ${currentUser.username} (${currentUser.role})`;
    if (currentUser.role === 'admin') {
        document.getElementById('view-admin').classList.remove('hidden');
    } else {
        document.getElementById('view-student').classList.remove('hidden');
    }
    loadReports();
    loadAnnouncements();
    startRealtimeSync();
}