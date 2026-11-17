// รายการแจ้งซ่อม (ฝั่งผู้พักอาศัยและแอดมิน)

let globalReports = [];

async function loadReports() {
    if (!currentToken) return;
    const r = await fetch('/api/reports', {headers:{'Authorization':`Bearer ${currentToken}`}});
    if(r.status===401||r.status===403) return logout();
    globalReports = await r.json();
    if(currentUser.role==='admin') { renderAdminTable(globalReports); updateStats(globalReports); }
    else renderStudentTable(globalReports);
}

function renderStudentTable(r) {
    const t = document.getElementById('student-report-tbody');
    if(!r.length) return t.innerHTML=`<tr><td colspan="5" class="p-4 text-center">ไม่มีข้อมูล</td></tr>`;
    t.innerHTML = r.map(i => `
        <tr class="border-b"><td class="p-3 font-mono">#${i.id}</td><td class="p-3 text-center">${i.image_url?`<img src="${i.image_url}" class="h-10 mx-auto">`:''}</td>
        <td class="p-3">${escapeHtml(i.title)}</td><td class="p-3 text-xs">${escapeHtml(i.description||'-')}</td><td class="p-3 text-center">${badge(i.status)}</td></tr>`).join('');
}
function renderAdminTable(r) {
    const t = document.getElementById('admin-report-tbody');
    if(!r.length) return t.innerHTML=`<tr><td colspan="6" class="p-4 text-center">ไม่มีข้อมูล</td></tr>`;
    t.innerHTML = r.map(i => `
        <tr class="border-b"><td class="p-3 font-mono">#${i.id}</td><td class="p-3 text-indigo-600 font-bold">${escapeHtml(i.username)}</td>
        <td class="p-3 text-center">${i.image_url?`<img src="${i.image_url}" class="h-10 mx-auto">`:''}</td>
        <td class="p-3 font-medium">${escapeHtml(i.title)}</td><td class="p-3 text-center">${badge(i.status)}</td>
        <td class="p-3 text-center">
            <button onclick="viewReportDetail(${i.id})" class="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded mr-2">ดูข้อมูล</button>
            <button onclick="updateReportStatus(${i.id}, 'กำลังแก้ไข')" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">กำลังแก้ไข</button>
            <button onclick="updateReportStatus(${i.id}, 'เสร็จสิ้น')" class="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded">เสร็จสิ้น</button>
        </td></tr>`).join('');
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
}

function viewReportDetail(id) {
    const r = globalReports.find(x => x.id === id); if(!r) return;
    document.getElementById('detail-id').innerText = `#${r.id}`; document.getElementById('detail-user').innerText = r.username;
    document.getElementById('detail-title').innerText = r.title; document.getElementById('detail-desc').innerText = r.description||'-';
    document.getElementById('detail-status').innerHTML = badge(r.status);
    document.getElementById('detail-image-container').innerHTML = r.image_url ? `<img src="${r.image_url}" class="max-h-48 cursor-pointer" onclick="window.open('${r.image_url}')">` : 'ไม่มีรูป';
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
    toggleReportModal(false); loadReports(); showAlert('ส่งเรื่องแล้ว'); e.target.reset();
}
