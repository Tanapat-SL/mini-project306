// จุดเริ่มต้นของหน้าเว็บ + แท็บของแอดมิน

function switchAdminTab(tName) {
    ['repairs', 'bills', 'announcements', 'members', 'accounts'].forEach(t => {
        const tabEl = document.getElementById(`admin-tab-${t}`);
        const btnEl = document.getElementById(`tab-btn-${t}`);
        if (tabEl) tabEl.classList.toggle('hidden', t !== tName);
        if (btnEl) {
            btnEl.className = t === tName
                ? 'px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-sm transition'
                : 'px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition';
        }
    });
    if (tName === 'bills') loadBills();
    if (tName === 'announcements') loadAnnouncements();
    if (tName === 'members') loadMembers();
    if (tName === 'accounts') loadAccounts();
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkInitialAuth();
});
setInterval(() => {
    const token = localStorage.getItem('token');
    if (!token) return; // ถ้ายังไม่ล็อกอินไม่ต้องดึงข้อมูล

    if (typeof loadBills === 'function') loadBills();
    if (typeof loadAnnouncements === 'function') loadAnnouncements();
    if (typeof loadReports === 'function') loadReports();
}, 5000);