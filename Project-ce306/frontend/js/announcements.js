// จัดการประกาศ (เชื่อมต่อ API และซิงค์ข้อมูลอัตโนมัติ)

let globalAnnouncements = [];
let lastAnnouncementsSnapshot = '';

async function loadAnnouncements(isSilent = false) {
    if (!currentToken) return;
    try {
        const res = await fetch('/api/announcements', {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const snapshot = JSON.stringify(data);
        if (isSilent && snapshot === lastAnnouncementsSnapshot) return;
        lastAnnouncementsSnapshot = snapshot;
        globalAnnouncements = data;

        if (currentUser?.role === 'admin') renderAnnouncementsAdmin();
        else renderAnnouncementsStudent();
    } catch (err) {
        if (!isSilent) console.error('Load announcements error:', err);
    }
}

function renderAnnouncementsStudent() {
    const el = document.getElementById('student-announcements');
    if (!el) return;
    if (!globalAnnouncements.length) {
        el.innerHTML = `<div class="text-xs text-slate-400 py-4 text-center">ยังไม่มีประกาศจากหอพักในขณะนี้</div>`;
        return;
    }
    el.innerHTML = globalAnnouncements.map(a => `
        <div class="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/70 dark:border-slate-700">
            <div class="flex justify-between items-start gap-2">
                <div class="font-bold text-sm text-slate-800 dark:text-slate-100">${escapeHtml(a.title)}</div>
                <span class="text-[11px] text-slate-400 whitespace-nowrap">${escapeHtml(a.date || 'ล่าสุด')}</span>
            </div>
            <div class="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line">${escapeHtml(a.content)}</div>
        </div>
    `).join('');
}

function renderAnnouncementsAdmin() {
    const el = document.getElementById('admin-announcements-list');
    if (!el) return;
    if (!globalAnnouncements.length) {
        el.innerHTML = `<div class="text-xs text-slate-400 py-4 text-center">ยังไม่มีประกาศในระบบ</div>`;
        return;
    }
    el.innerHTML = globalAnnouncements.map(a => `
        <div class="p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-start gap-3">
            <div>
                <div class="font-bold text-sm text-slate-800 dark:text-slate-100">${escapeHtml(a.title)} <span class="text-[11px] font-normal text-slate-400 ml-2">${escapeHtml(a.date || '')}</span></div>
                <div class="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line">${escapeHtml(a.content)}</div>
            </div>
            <button onclick="deleteAnnouncement(${a.id})" title="ลบประกาศ" class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition shrink-0">
                <i class="fa-solid fa-trash-can"></i>
                <span>ลบ</span>
            </button>
        </div>
    `).join('');
}

async function handleCreateAnnouncement(e) {
    e.preventDefault();
    const title = document.getElementById('ann-title').value.trim();
    const content = document.getElementById('ann-content').value.trim();
    const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
        body: JSON.stringify({ title, content })
    });
    if (res.ok) {
        e.target.reset();
        await loadAnnouncements();
        showAlert('โพสต์ประกาศเรียบร้อยแล้ว', 'success');
    } else {
        showAlert('ไม่สามารถโพสต์ประกาศได้', 'error');
    }
}

function deleteAnnouncement(id) {
    confirmDeleteItem('announcements', id);
}