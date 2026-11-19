// ระบบแจ้งบิลค่าเช่า-ค่าน้ำไฟ และตรวจสอบสลิป (Billing & Slip Verification)

let globalBills = [];
let lastBillsSnapshot = '';

async function loadBills(isSilent = false) {
    if (!currentToken) return;
    try {
        const res = await fetch('/api/bills', {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const snapshot = JSON.stringify(data);
        if (isSilent && snapshot === lastBillsSnapshot) return;
        lastBillsSnapshot = snapshot;
        globalBills = data;

        if (currentUser?.role === 'admin') renderAdminBills();
        else renderStudentBills();
    } catch (err) {
        if (!isSilent) console.error('Load bills error:', err);
    }
}

function billStatusBadge(status) {
    if (status === 'ชำระแล้ว') return `<span class="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-medium">ชำระแล้ว</span>`;
    if (status === 'รอตรวจสอบสลิป') return `<span class="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full text-xs font-medium">รอตรวจสอบสลิป</span>`;
    if (status === 'สลิปไม่ถูกต้อง') return `<span class="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-full text-xs font-medium">สลิปไม่ถูกต้อง</span>`;
    return `<span class="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full text-xs font-medium">รอชำระเงิน</span>`;
}

// ฝั่งผู้พักอาศัย
function renderStudentBills() {
    const tbody = document.getElementById('student-bills-tbody');
    if (!tbody) return;
    if (!globalBills.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">ยังไม่มีรายการบิลค่าเช่าในขณะนี้</td></tr>`;
        return;
    }
    tbody.innerHTML = globalBills.map(b => `
        <tr class="border-b dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
            <td class="p-3.5 font-semibold">${escapeHtml(b.billing_month)}</td>
            <td class="p-3.5 text-xs">
                ค่าห้อง: ${Number(b.room_rent).toLocaleString()} ฿<br>
                ค่าน้ำ (${b.water_units} หน่วย): ${(b.water_units * b.water_rate).toLocaleString()} ฿<br>
                ค่าไฟ (${b.electric_units} หน่วย): ${(b.electric_units * b.electric_rate).toLocaleString()} ฿
            </td>
            <td class="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">${Number(b.total_amount).toLocaleString()} ฿</td>
            <td class="p-3.5 text-center">
                ${b.slip_url
                    ? `<img src="${b.slip_url}" onclick="openBillSlip(${b.id})" title="คลิกดูสลิป" class="h-10 w-10 object-cover rounded mx-auto cursor-pointer border dark:border-slate-600 hover:scale-110 transition">`
                    : '<span class="text-xs text-slate-400">ยังไม่แนบ</span>'}
            </td>
            <td class="p-3.5 text-center">${billStatusBadge(b.status)}</td>
            <td class="p-3.5 text-center">
                ${b.status !== 'ชำระแล้ว'
                    ? `<button onclick="openUploadSlipModal(${b.id})" class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shadow-sm"><i class="fa-solid fa-receipt mr-1"></i>แจ้งโอน/แนบสลิป</button>`
                    : `<span class="text-xs text-emerald-600 dark:text-emerald-400 font-medium"><i class="fa-solid fa-circle-check mr-1"></i>เรียบร้อย</span>`}
            </td>
        </tr>
    `).join('');
}

// ฝั่งแอดมิน
function renderAdminBills() {
    const tbody = document.getElementById('admin-bills-tbody');
    if (!tbody) return;
    if (!globalBills.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-400">ยังไม่มีรายการบิลในระบบ</td></tr>`;
        return;
    }
    tbody.innerHTML = globalBills.map(b => `
        <tr class="border-b dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
            <td class="p-3 font-bold text-indigo-600 dark:text-indigo-400">ห้อง ${escapeHtml(b.room_number)}</td>
            <td class="p-3 font-medium">${escapeHtml(b.billing_month)}</td>
            <td class="p-3 text-xs">ห้อง ${Number(b.room_rent).toLocaleString()} | น้ำ ${b.water_units}u | ไฟ ${b.electric_units}u</td>
            <td class="p-3 font-bold">${Number(b.total_amount).toLocaleString()} ฿</td>
            <td class="p-3 text-center">
                ${b.slip_url
                    ? `<img src="${b.slip_url}" onclick="openBillSlip(${b.id})" title="คลิกเพื่อตรวจสลิป" class="h-10 w-10 object-cover rounded mx-auto cursor-pointer border dark:border-slate-600 hover:scale-110 transition">`
                    : '<span class="text-xs text-slate-400">-</span>'}
            </td>
            <td class="p-3 text-center">${billStatusBadge(b.status)}</td>
            <td class="p-3 text-center space-x-1">
                ${b.slip_url ? `<button onclick="verifyBill(${b.id}, 'ชำระแล้ว')" class="text-xs bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-100">อนุมัติ</button>` : ''}
                ${b.slip_url ? `<button onclick="verifyBill(${b.id}, 'สลิปไม่ถูกต้อง')" class="text-xs bg-amber-50 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 px-2 py-1 rounded hover:bg-amber-100">ปฏิเสธ</button>` : ''}
                <button onclick="deleteBill(${b.id})" title="ลบบิล" class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// บันทึกและส่งบิล
async function handleCreateBill(e) {
    e.preventDefault();
    const payload = {
        room_number: document.getElementById('bill-room').value.trim(),
        billing_month: document.getElementById('bill-month').value.trim(),
        room_rent: Number(document.getElementById('bill-rent').value) || 0,
        water_units: Number(document.getElementById('bill-water').value) || 0,
        water_rate: 18,
        electric_units: Number(document.getElementById('bill-electric').value) || 0,
        electric_rate: 8
    };

    try {
        const res = await fetch('/api/bills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            e.target.reset();
            loadBills();
            showAlert('ออกบิลค่าเช่าเรียบร้อยแล้ว', 'success');
        } else {
            const err = await res.json();
            showAlert(err.error || 'เกิดข้อผิดพลาดในการออกบิล', 'error');
        }
    } catch (err) {
        showAlert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    }
}

// เปิด-ปิด Modal แนบสลิป
function openUploadSlipModal(billId) {
    const b = globalBills.find(x => x.id === billId);
    if (!b) return;
    document.getElementById('slip-bill-id').value = b.id;
    document.getElementById('slip-bill-info').innerText = `รอบบิล ${b.billing_month} — ยอดชำระ ${Number(b.total_amount).toLocaleString()} บาท`;
    document.getElementById('modal-upload-slip').classList.remove('hidden');
}

function closeSlipModal() {
    document.getElementById('modal-upload-slip').classList.add('hidden');
}

// ส่งรูปสลิปการโอนเงิน
async function handleUploadSlip(e) {
    e.preventDefault();
    const billId = document.getElementById('slip-bill-id').value;
    const fileInput = document.getElementById('slip-image-file');
    const file = fileInput?.files?.[0];

    if (!file) {
        showAlert('กรุณาเลือกรูปภาพสลิปก่อนกดส่ง', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (event) {
        const base64Image = event.target.result;
        try {
            const res = await fetch(`/api/bills/${billId}/slip`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify({ slip_url: base64Image })
            });

            if (res.ok) {
                e.target.reset();
                closeSlipModal();
                loadBills();
                showAlert('ส่งสลิปเรียบร้อยแล้ว รอแอดมินตรวจสอบ', 'success');
            } else {
                const err = await res.json();
                showAlert(err.error || 'เกิดข้อผิดพลาดในการส่งสลิป', 'error');
            }
        } catch (err) {
            showAlert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
        }
    };
    reader.readAsDataURL(file);
}

// แอดมินอนุมัติ/ปฏิเสธสลิป
async function verifyBill(id, status) {
    const res = await fetch(`/api/bills/${id}/verify`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ status })
    });
    if (res.ok) {
        loadBills();
        showAlert(`อัปเดตสถานะบิลเป็น "${status}" แล้ว`, 'success');
    }
}

// แอดมินลบบิล (เรียกใช้ Modal ยืนยันการลบ)
function deleteBill(id) {
    confirmDeleteItem('bills', id);
}

// เปิดดูรูปสลิปขนาดเต็ม
function openBillSlip(id) {
    const b = globalBills.find(x => x.id === id);
    if (!b || !b.slip_url) return;
    document.getElementById('image-viewer-img').src = b.slip_url;
    document.getElementById('modal-image-viewer').classList.remove('hidden');
}

// บันทึกรูปภาพ QR Code ลงเครื่องผู้เช่า
async function downloadQRCode() {
    const modal = document.getElementById('modal-upload-slip');
    const qrImg = document.getElementById('payment-qr-img') || modal?.querySelector('img');
    if (!qrImg || !qrImg.src) {
        showAlert('ไม่พบรูปภาพ QR Code', 'error');
        return;
    }

    const billInfo = document.getElementById('slip-bill-info')?.innerText || 'ชำระค่าเช่า';
    const fileName = `QR-${billInfo.split('—')[0].trim().replace(/\s+/g, '_')}.png`;

    try {
        const res = await fetch(qrImg.src);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
        showAlert('บันทึก QR Code เรียบร้อยแล้ว', 'success');
    } catch (err) {
        window.open(qrImg.src, '_blank');
    }
}