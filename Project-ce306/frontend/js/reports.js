// รายการแจ้งซ่อม (ฝั่งผู้พักอาศัยและแอดมิน)

let globalReports = [];
let lastReportsSnapshot = '';

async function loadReports(isSilent = false) {
    if (!currentToken) return;
    try {
        const r = await fetch('/api/reports', {headers:{'Authorization':`Bearer ${currentToken}`}});
        if(r.status===401||r.status===403) return logout();
        const data = await r.json();
        const snapshot = JSON.stringify(data);
        if (isSilent && snapshot === lastReportsSnapshot) return;
        lastReportsSnapshot = snapshot;
        globalReports = data;

        if(currentUser.role==='admin') { renderAdminTable(globalReports); updateStats(globalReports); }
        else renderStudentTable(globalReports);
    } catch (err) {
        if (!isSilent) console.error('Load reports error:', err);
    }
}

function renderStudentTable(r) {
    const t = document.getElementById('student-report-tbody');
    if(!r.length) return t.innerHTML=`<tr><td colspan="5" class="p-6 text-center text-slate-400">ไม่มีข้อมูลการแจ้งซ่อม</td></tr>`;
    t.innerHTML = r.map(i => `
        <tr class="border-b dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
            <td class="p-3 font-mono">#${i.id}</td>
            <td class="p-3 text-center">${i.image_url ? `<img src="${i.image_url}" onclick="openReportImage(${i.id})" title="คลิกเพื่อขยายรูป" class="h-10 w-10 object-cover rounded mx-auto cursor-pointer hover:scale-110 transition shadow-sm border dark:border-slate-600">` : '<span class="text-xs text-slate-400">-</span>'}</td>
            <td class="p-3 font-medium">${escapeHtml(i.title)}</td>
            <td class="p-3 text-xs">${escapeHtml(i.description||'-')}</td>
            <td class="p-3 text-center">${badge(i.status)}</td>
        </tr>`).join('');
}

function renderAdminTable(r) {
    const t = document.getElementById('admin-report-tbody');
    if(!r.length) return t.innerHTML=`<tr><td colspan="6" class="p-6 text-center text-slate-400">ไม่มีข้อมูลการแจ้งซ่อม</td></tr>`;
    t.innerHTML = r.map(i => `
        <tr class="border-b dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
            <td class="p-3 font-mono">#${i.id}</td>
            <td class="p-3 text-indigo-600 dark:text-indigo-400 font-bold">${escapeHtml(i.username)}</td>
            <td class="p-3 text-center">${i.image_url ? `<img src="${i.image_url}" onclick="openReportImage(${i.id})" title="คลิกเพื่อขยายรูป" class="h-10 w-10 object-cover rounded mx-auto cursor-pointer hover:scale-110 transition shadow-sm border dark:border-slate-600">` : '<span class="text-xs text-slate-400">-</span>'}</td>
            <td class="p-3 font-medium">${escapeHtml(i.title)}</td>
            <td class="p-3 text-center">${badge(i.status)}</td>
            <td class="p-3 text-center space-x-1">
                <button onclick="viewReportDetail(${i.id})" class="text-xs bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-2.5 py-1 rounded hover:bg-indigo-100">ดูข้อมูล</button>
                <button onclick="updateReportStatus(${i.id}, 'กำลังแก้ไข')" class="text-xs bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded hover:bg-blue-100">กำลังแก้ไข</button>
                <button onclick="updateReportStatus(${i.id}, 'เสร็จสิ้น')" class="text-xs bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 px-2.5 py-1 rounded hover:bg-emerald-100">เสร็จสิ้น</button>
                <button onclick="deleteReport(${i.id})" title="ลบรายการ" class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        </tr>`).join('');
}

function updateStats(r) {
    document.getElementById('stat-total').innerText = r.length;
    document.getElementById('stat-pending').innerText = r.filter(x=>x.status==='รอดำเนินการ').length;
    document.getElementById('stat-progress').innerText = r.filter(x=>x.status==='กำลังแก้ไข').length;
    document.getElementById('stat-completed').innerText = r.filter(x=>x.status==='เสร็จสิ้น').length;
}

async function updateReportStatus(id, s) {
    await fetch(`/api/reports/${id}`, {method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${currentToken}`}, body:JSON.stringify({status:s})});
    loadReports();
    showAlert(`อัปเดตสถานะ #${id} เป็น "${s}" แล้ว`, 'success');
}

function deleteReport(id) {
    confirmDeleteItem('reports', id);
}

function viewReportDetail(id) {
    const r = globalReports.find(x => x.id === id); if(!r) return;
    document.getElementById('detail-id').innerText = `#${r.id}`;
    document.getElementById('detail-user').innerText = `ผู้แจ้ง: ${r.username}`;
    document.getElementById('detail-title').innerText = r.title;
    document.getElementById('detail-desc').innerText = r.description||'-';
    document.getElementById('detail-status').innerHTML = badge(r.status);
    document.getElementById('detail-image-container').innerHTML = r.image_url
        ? `<img src="${r.image_url}" onclick="openReportImage(${r.id})" title="คลิกเพื่อดูรูปขนาดเต็ม" class="max-h-56 rounded-lg cursor-zoom-in hover:opacity-90 transition shadow"><span class="text-[11px] text-slate-400 mt-1.5"><i class="fa-solid fa-magnifying-glass-plus mr-1"></i>คลิกที่รูปเพื่อขยายขนาดเต็ม</span>`
        : '<span class="text-xs text-slate-400 py-4">ไม่มีรูปภาพแนบ</span>';
    document.getElementById('modal-report-detail').classList.remove('hidden');
}
function closeReportDetail() { document.getElementById('modal-report-detail').classList.add('hidden'); }

function openReportImage(id) {
    const r = globalReports.find(x => x.id === id);
    if (!r || !r.image_url) return;
    document.getElementById('image-viewer-img').src = r.image_url;
    document.getElementById('modal-image-viewer').classList.remove('hidden');
}
function closeImageViewer() {
    document.getElementById('modal-image-viewer').classList.add('hidden');
    document.getElementById('image-viewer-img').src = '';
}
function toggleReportModal(show) { document.getElementById('modal-report').classList.toggle('hidden', !show); }

async function handleCreateReport(e) {
    e.preventDefault(); const f = document.getElementById('report-image-file').files[0];
    const b = { title: document.getElementById('report-title').value, description: document.getElementById('report-desc').value, image_url: f ? await readFileAsBase64(f) : '' };
    await fetch('/api/reports', {method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${currentToken}`}, body:JSON.stringify(b)});
    toggleReportModal(false); loadReports(); showAlert('ส่งเรื่องแจ้งซ่อมเรียบร้อยแล้ว', 'success'); e.target.reset();
}