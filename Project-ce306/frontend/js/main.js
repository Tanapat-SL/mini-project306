// จุดเริ่มต้นของหน้าเว็บ + แท็บของแอดมิน

function switchAdminTab(tName) {
    ['repairs', 'announcements', 'members', 'accounts'].forEach(t => {
        document.getElementById(`admin-tab-${t}`).classList.toggle('hidden', t !== tName);
        document.getElementById(`tab-btn-${t}`).className = t === tName
            ? 'px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-sm transition'
            : 'px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition';
    });
    if(tName==='announcements') loadAnnouncements();
    if(tName==='members') loadMembers();
    if(tName==='accounts') loadAccounts();
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkInitialAuth();
});