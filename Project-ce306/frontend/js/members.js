// ผู้พักอาศัยในห้อง (แอดมิน)

async function loadMembers() {
    try {
        const res = await fetch('/api/members', { headers: { 'Authorization': `Bearer ${currentToken}` } });
        if (!res.ok) return;
        const r = await res.json();
        const tbody = document.getElementById('admin-members-tbody');
        if (!tbody) return;
        if (!r.length) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-400">ยังไม่มีข้อมูลผู้พักอาศัยในระบบ</td></tr>`;
            return;
        }
        tbody.innerHTML = r.map(m => `
            <tr class="border-b dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                <td class="p-3">${m.image_url ? `<img src="${m.image_url}" class="h-9 w-9 object-cover rounded-full border dark:border-slate-600">` : '<div class="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-400"><i class="fa-solid fa-user"></i></div>'}</td>
                <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">ห้อง ${escapeHtml(m.room_number)}</td>
                <td class="p-3 font-medium">${escapeHtml(m.full_name)}</td>
                <td class="p-3 text-slate-500 dark:text-slate-300">${escapeHtml(m.phone || '-')}</td>
                <td class="p-3 text-center">
                    <button onclick="deleteMember(${m.id})" title="ลบ / แจ้งย้ายออก" class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition">
                        <i class="fa-solid fa-trash-can"></i>
                        <span>ย้ายออก</span>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Load members error:', err);
    }
}

async function handleAddMember(e) {
    e.preventDefault();
    const f = document.getElementById('mem-image-file').files[0];
    const b = {
        room_number: document.getElementById('mem-room').value.trim(),
        full_name: document.getElementById('mem-name').value.trim(),
        phone: document.getElementById('mem-phone').value.trim(),
        image_url: f ? await readFileAsBase64(f) : ''
    };
    const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
        body: JSON.stringify(b)
    });
    if (res.ok) {
        loadMembers();
        e.target.reset();
        showAlert('เพิ่มข้อมูลผู้พักอาศัยแล้ว', 'success');
    } else {
        showAlert('ไม่สามารถเพิ่มข้อมูลผู้พักอาศัยได้', 'error');
    }
}

function deleteMember(id) {
    confirmDeleteItem('members', id);
}