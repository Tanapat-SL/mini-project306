// จัดการบัญชีผู้ใช้งาน (แอดมิน)

async function loadAccounts() {
    try {
        const r = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${currentToken}` } });
        const accs = await r.json();
        const tbody = document.getElementById('admin-accounts-tbody');
        if (!accs.length) return tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center">ไม่มีข้อมูล</td></tr>`;

        tbody.innerHTML = accs.map(a => `
            <tr class="border-b">
                <td class="p-3 font-mono text-xs">#${a.id}</td>
                <td class="p-3 font-bold text-sky-600">${escapeHtml(a.username)}</td>
                <td class="p-3 text-center">${a.role==='admin'?'<span class="bg-rose-100 text-rose-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Admin</span>':'<span class="bg-sky-100 text-sky-700 px-2 py-1 rounded text-[10px] font-bold uppercase">User</span>'}</td>
                <td class="p-3 text-center"><button onclick="deleteAccount(${a.id})" class="text-rose-500 text-xs bg-rose-50 px-2 py-1 rounded hover:bg-rose-100"><i class="fa-solid fa-trash"></i> ลบ</button></td>
            </tr>
        `).join('');
    } catch(err) {}
}

async function handleCreateAccount(e) {
    e.preventDefault();
    const u = document.getElementById('acc-username').value.trim();
    const p = document.getElementById('acc-password').value.trim();
    const r = document.getElementById('acc-role').value;
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` }, body: JSON.stringify({ username: u, password: p, role: r }) });
    const data = await res.json();
    if(res.ok) { showAlert('สร้างบัญชีแล้ว', 'success'); e.target.reset(); loadAccounts(); }
    else showAlert(data.message, 'error');
}

async function deleteAccount(id) {
    if(!confirm('ยืนยันการลบบัญชี? (หากเคยแจ้งซ่อมจะไม่สามารถลบได้)')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${currentToken}` } });
    if(res.ok) { showAlert('ลบบัญชีแล้ว', 'success'); loadAccounts(); }
    else { const d = await res.json(); showAlert(d.message, 'error'); }
}
