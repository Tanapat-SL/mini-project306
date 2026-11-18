// จัดการบัญชีผู้ใช้งาน (แอดมิน)

async function loadAccounts() {
    try {
        const r = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${currentToken}` } });
        if (!r.ok) return;
        const accs = await r.json();
        const tbody = document.getElementById('admin-accounts-tbody');
        if (!tbody) return;
        if (!accs.length) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-slate-400">ไม่มีข้อมูลบัญชีผู้ใช้</td></tr>`;
            return;
        }

        // นับจำนวนบัญชี admin ทั้งหมดในระบบ
        const adminCount = accs.filter(a => a.role === 'admin').length;

        tbody.innerHTML = accs.map(a => {
            const isLastAdmin = a.role === 'admin' && adminCount <= 1;
            return `
                <tr class="border-b dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                    <td class="p-3 font-mono text-xs text-slate-400">#${a.id}</td>
                    <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">${escapeHtml(a.username)}</td>
                    <td class="p-3 text-center">
                        ${a.role === 'admin'
                            ? '<span class="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase">Admin</span>'
                            : '<span class="bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase">User</span>'}
                    </td>
                    <td class="p-3 text-center">
                        ${isLastAdmin
                            ? `<span title="ต้องเหลือบัญชี Admin อย่างน้อย 1 บัญชีในระบบ" class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 cursor-not-allowed select-none">
                                   <i class="fa-solid fa-shield-halved"></i>
                                   <span>บัญชีหลัก</span>
                               </span>`
                            : `<button onclick="deleteAccount(${a.id})" title="ลบบัญชีผู้ใช้" class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition">
                                   <i class="fa-solid fa-trash-can"></i>
                                   <span>ลบ</span>
                               </button>`}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Load accounts error:', err);
    }
}

async function handleCreateAccount(e) {
    e.preventDefault();
    const u = document.getElementById('acc-username').value.trim();
    const p = document.getElementById('acc-password').value.trim();
    const r = document.getElementById('acc-role').value;
    const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
        body: JSON.stringify({ username: u, password: p, role: r })
    });
    const data = await res.json();
    if (res.ok) {
        showAlert('สร้างบัญชีแล้ว', 'success');
        e.target.reset();
        loadAccounts();
    } else {
        showAlert(data.message || data.error || 'ไม่สามารถสร้างบัญชีได้', 'error');
    }
}

function deleteAccount(id) {
    confirmDeleteItem('accounts', id);
}