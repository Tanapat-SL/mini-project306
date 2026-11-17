// ประกาศ (ตอนนี้เก็บในหน่วยความจำของเบราว์เซอร์ ยังไม่ได้ต่อฐานข้อมูล เหมือนของเดิม)

let mockAnnouncements = [{ id: 1, title: 'แจ้งล้างแอร์', content: 'ทีมช่างจะเข้า...', date: 'วันนี้' }];

function renderAnnouncementsStudent() {
    document.getElementById('student-announcements').innerHTML = mockAnnouncements.map(a =>
        `<div class="p-3 bg-slate-50 rounded border mb-2"><div class="font-bold text-sm">${escapeHtml(a.title)}</div><div class="text-xs text-slate-600">${escapeHtml(a.content)}</div></div>`).join('');
}
function renderAnnouncementsAdmin() {
    document.getElementById('admin-announcements-list').innerHTML = mockAnnouncements.map(a =>
        `<div class="p-3 bg-white rounded border flex justify-between mb-2"><div><div class="font-bold text-sm">${escapeHtml(a.title)}</div><div class="text-xs text-slate-600">${escapeHtml(a.content)}</div></div><button onclick="deleteAnnouncement(${a.id})" class="text-rose-500 text-xs"><i class="fa-solid fa-trash"></i></button></div>`).join('');
}
function handleCreateAnnouncement(e) {
    e.preventDefault();
    mockAnnouncements.unshift({ id: Date.now(), title: document.getElementById('ann-title').value, content: document.getElementById('ann-content').value, date: 'วันนี้' });
    e.target.reset(); renderAnnouncementsAdmin(); showAlert('โพสต์ประกาศแล้ว', 'success');
}
function deleteAnnouncement(id) { mockAnnouncements = mockAnnouncements.filter(a => a.id !== id); renderAnnouncementsAdmin(); }
