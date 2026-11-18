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

let pendingDeleteAction = null;

function openDeleteModal({ title, desc, onConfirm }) {
    document.getElementById('delete-modal-title').innerText = title || 'ยืนยันการลบรายการ';
    document.getElementById('delete-modal-desc').innerText = desc || 'ข้อมูลที่ลบแล้วจะไม่สามารถกู้คืนได้ ต้องการดำเนินการต่อหรือไม่?';
    pendingDeleteAction = onConfirm;
    document.getElementById('modal-confirm-delete').classList.remove('hidden');
}

function closeDeleteModal() {
    document.getElementById('modal-confirm-delete').classList.add('hidden');
    pendingDeleteAction = null;
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkInitialAuth();

    const confirmBtn = document.getElementById('btn-confirm-delete');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            if (!pendingDeleteAction) return;
            confirmBtn.disabled = true;
            confirmBtn.innerText = 'กำลังลบ...';
            try {
                await pendingDeleteAction();
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.innerText = 'ลบรายการ';
                closeDeleteModal();
            }
        });
    }
});

// ฟังก์ชันกลางสำหรับลบรายการทุกประเภท
function confirmDeleteItem(type, id) {
    const config = {
        reports: {
            title: 'ลบรายการแจ้งซ่อม',
            desc: 'รายการแจ้งซ่อมนี้จะถูกลบออกจากระบบถาวร',
            endpoint: `/api/reports/${id}`,
            reload: () => typeof loadReports === 'function' && loadReports()
        },
        bills: {
            title: 'ลบบิลค่าเช่า',
            desc: 'ข้อมูลบิลและประวัติการแนบสลิปของรายการนี้จะถูกลบถาวร',
            endpoint: `/api/bills/${id}`,
            reload: () => typeof loadBills === 'function' && loadBills()
        },
        announcements: {
            title: 'ลบประกาศ',
            desc: 'ประกาศนี้จะหายไปจากหน้าจอของผู้พักอาศัยทันที',
            endpoint: `/api/announcements/${id}`,
            reload: () => typeof loadAnnouncements === 'function' && loadAnnouncements()
        },
        members: {
            title: 'ลบข้อมูลผู้พักอาศัย',
            desc: 'ข้อมูลผู้พักอาศัยและห้องพักรายการนี้จะถูกลบออกจากระบบ',
            endpoint: `/api/members/${id}`,
            reload: () => typeof loadMembers === 'function' && loadMembers()
        },
        accounts: {
            title: 'ลบบัญชีเข้าสู่ระบบ',
            desc: 'บัญชีผู้ใช้งานนี้จะไม่สามารถล็อกอินเข้าสู่ระบบได้อีก',
            endpoint: `/api/accounts/${id}`,
            reload: () => typeof loadAccounts === 'function' && loadAccounts()
        }
    };

    const target = config[type];
    if (!target) return;

    openDeleteModal({
        title: target.title,
        desc: target.desc,
        onConfirm: async () => {
            try {
                const res = await fetch(target.endpoint, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${currentToken}` }
                });
                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                    target.reload();
                    showAlert('ลบรายการเรียบร้อยแล้ว', 'success');
                } else {
                    showAlert(data.error || data.message || 'ไม่สามารถลบรายการได้', 'error');
                }
            } catch (err) {
                showAlert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
            }
        }
    });
}