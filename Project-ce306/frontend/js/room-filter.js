// ============================================================================
// ระบบเชื่อมข้อมูลผู้พักอาศัย (Members) และตัวกรองแยกตามห้อง (All, 100, 303, ...)
// รองรับทั้งหน้า "รายการแจ้งซ่อม" และ "จัดการบิลค่าเช่า"
// ============================================================================

const RoomFilterState = {
    membersMap: {},       // { "100": { room: "100", name: "ชื่อผู้เช่า", phone: "08x..." } }
    selectedRepairRoom: 'ALL',
    selectedBillRoom: 'ALL',
    isApplying: false
};

// ล้างคำนำหน้าให้เหลือเฉพาะเลขห้อง เช่น "ห้อง 100" -> "100"
function normalizeRoomNumber(raw) {
    if (!raw) return '';
    return String(raw)
        .replace(/ห้องพัก|ห้อง|room|#/gi, '')
        .trim();
}

// เรียงเลขห้องจากน้อยไปมาก (เช่น 100, 101, 303)
function sortRoomsNaturally(rooms) {
    return Array.from(rooms).sort((a, b) =>
        a.localeCompare(b, 'th', { numeric: true, sensitivity: 'base' })
    );
}

// 1. ดึงข้อมูลผู้พักอาศัยจากตาราง #admin-members-tbody
function syncMembersFromDOM() {
    const tbody = document.getElementById('admin-members-tbody');
    if (!tbody) return;

    const map = {};
    const rows = tbody.querySelectorAll('tr');

    rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        // ข้ามแถวแจ้งเตือนว่าง (colspan)
        if (cells.length < 4) return;

        const room = normalizeRoomNumber(cells[1].textContent);
        const name = cells[2].textContent.trim();
        const phone = cells[3].textContent.trim();

        if (room) {
            map[room] = { room, name, phone };
        }
    });

    RoomFilterState.membersMap = map;
    updateCreateBillRoomSelector();
}

// อัปเดตตัวเลือกห้องในฟอร์ม "ออกบิลค่าเช่า" ให้อิงจากผู้พักอาศัย
function updateCreateBillRoomSelector() {
    const selectEl = document.getElementById('bill-room-select');
    const datalistEl = document.getElementById('member-rooms-datalist');
    const rooms = sortRoomsNaturally(Object.keys(RoomFilterState.membersMap));

    if (datalistEl) {
        datalistEl.innerHTML = rooms
            .map((r) => {
                const m = RoomFilterState.membersMap[r];
                return `<option value="${r}">ห้อง ${r} - ${m.name}</option>`;
            })
            .join('');
    }

    if (selectEl) {
        const currentVal = selectEl.value;
        let optionsHtml = `<option value="">-- เลือกห้องผู้เช่า --</option>`;
        rooms.forEach((r) => {
            const m = RoomFilterState.membersMap[r];
            optionsHtml += `<option value="${r}">ห้อง ${r} (${m.name})</option>`;
        });
        selectEl.innerHTML = optionsHtml;
        if (currentVal && RoomFilterState.membersMap[currentVal]) {
            selectEl.value = currentVal;
        }
    }
}

// เมื่อเลือกห้องจาก Dropdown ในฟอร์มออกบิล -> ใส่ค่าลงช่อง #bill-room อัตโนมัติ
function onSelectBillRoomDropdown(roomValue) {
    const inputEl = document.getElementById('bill-room');
    const hintEl = document.getElementById('bill-tenant-hint');
    if (inputEl && roomValue) {
        inputEl.value = roomValue;
    }
    if (hintEl) {
        const member = RoomFilterState.membersMap[normalizeRoomNumber(roomValue)];
        hintEl.textContent = member
            ? `ผู้เช่า: ${member.name} (${member.phone})`
            : '';
    }
}

// เมื่อพิมพ์เลขห้องเองในฟอร์มออกบิล -> แสดงชื่อผู้เช่ากำกับอัตโนมัติ
function onInputBillRoom(rawValue) {
    const cleanRoom = normalizeRoomNumber(rawValue);
    const selectEl = document.getElementById('bill-room-select');
    const hintEl = document.getElementById('bill-tenant-hint');

    if (selectEl) {
        selectEl.value = RoomFilterState.membersMap[cleanRoom] ? cleanRoom : '';
    }
    if (hintEl) {
        const member = RoomFilterState.membersMap[cleanRoom];
        hintEl.textContent = member
            ? `ผู้เช่า: ${member.name} (${member.phone})`
            : cleanRoom
            ? 'ยังไม่มีข้อมูลผู้เช่าในระบบจัดการผู้พักอาศัย'
            : '';
    }
}

// 2. สร้างปุ่มแท็บตัวกรองห้อง (All, 100, 303, ...)
function renderRoomFilterBar(containerId, countsByRoom, totalCount, selectedRoom, onSelectFnName) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // รวมเลขห้องจาก "จัดการผู้พักอาศัย" เป็นหลัก + ห้องที่มีรายการอยู่แล้ว
    const allRoomKeys = new Set([
        ...Object.keys(RoomFilterState.membersMap),
        ...Object.keys(countsByRoom)
    ]);
    const sortedRooms = sortRoomsNaturally(allRoomKeys);

    const isAllActive = selectedRoom === 'ALL';
    let html = `
        <button type="button" onclick="${onSelectFnName}('ALL')"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                isAllActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
            }">
            <i class="fa-solid fa-layer-group"></i>
            <span>All (ทั้งหมด)</span>
            <span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                isAllActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }">${totalCount}</span>
        </button>
    `;

    sortedRooms.forEach((room) => {
        const member = RoomFilterState.membersMap[room];
        const count = countsByRoom[room] || 0;
        const isActive = selectedRoom === room;

        html += `
            <button type="button" onclick="${onSelectFnName}('${room}')"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                    isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                }">
                <i class="fa-solid fa-door-closed text-[11px] ${isActive ? 'text-amber-300' : 'text-indigo-500'}"></i>
                <span>${room}</span>
                ${
                    member
                        ? `<span class="font-normal text-[11px] ${ isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-400' }">(${member.name})</span>`
                        : ''
                }
                <span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }">${count}</span>
            </button>
        `;
    });

    container.innerHTML = html;
}

// 3. ประมวลผลตาราง "จัดการบิลค่าเช่า" (เติมชื่อผู้เช่า + กรองตามห้อง)
function applyBillsRoomFilter() {
    if (RoomFilterState.isApplying) return;
    RoomFilterState.isApplying = true;

    try {
        const tbody = document.getElementById('admin-bills-tbody');
        if (!tbody) return;

        // ลบแถวแจ้งเตือนว่างชั่วคราวก่อนคำนวณ
        const oldEmptyRow = tbody.querySelector('.room-filter-empty-row');
        if (oldEmptyRow) oldEmptyRow.remove();

        const rows = Array.from(tbody.querySelectorAll('tr'));
        const countsByRoom = {};
        let totalCount = 0;
        let visibleCount = 0;

        rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return;

            // เก็บเลขห้องต้นฉบับไว้ใน dataset
            if (!row.dataset.roomNumber) {
                row.dataset.roomNumber = normalizeRoomNumber(cells[0].textContent);
            }
            const room = row.dataset.roomNumber;
            if (!room) return;

            totalCount++;
            countsByRoom[room] = (countsByRoom[room] || 0) + 1;

            // เติมชื่อผู้เช่าจากระบบจัดการผู้พักอาศัยลงใต้เลขห้อง
            const member = RoomFilterState.membersMap[room];
            let subLabel = cells[0].querySelector('.tenant-sub-label');
            if (!subLabel) {
                subLabel = document.createElement('div');
                subLabel.className = 'tenant-sub-label text-[11px] font-normal mt-0.5';
                cells[0].appendChild(subLabel);
            }
            if (member) {
                subLabel.className = 'tenant-sub-label text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5';
                subLabel.innerHTML = `<i class="fa-solid fa-user text-[9px] mr-1 text-emerald-500"></i>${member.name}`;
            } else {
                subLabel.className = 'tenant-sub-label text-[11px] font-normal text-slate-400/70 italic mt-0.5';
                subLabel.textContent = 'ยังไม่มีข้อมูลผู้เช่า';
            }

            // กรองการแสดงผลตามห้องที่เลือก
            const match =
                RoomFilterState.selectedBillRoom === 'ALL' ||
                room === RoomFilterState.selectedBillRoom;

            row.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        });

        // ถ้าห้องที่เลือกยังไม่มีบิลเลย ให้แสดงข้อความแจ้งในตาราง
        if (visibleCount === 0 && RoomFilterState.selectedBillRoom !== 'ALL') {
            const room = RoomFilterState.selectedBillRoom;
            const member = RoomFilterState.membersMap[room];
            const tr = document.createElement('tr');
            tr.className = 'room-filter-empty-row';
            tr.innerHTML = `
                <td colspan="7" class="py-10 px-6 text-center text-sm text-slate-400">
                    <i class="fa-solid fa-file-invoice text-2xl mb-2 block text-slate-300 dark:text-slate-600"></i>
                    ยังไม่มีรายการบิลค่าเช่าสำหรับ <strong>ห้อง ${room}</strong> ${member ? `(${member.name})` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        }

        renderRoomFilterBar(
            'bills-room-filter-bar',
            countsByRoom,
            totalCount,
            RoomFilterState.selectedBillRoom,
            'selectBillRoomFilter'
        );
    } finally {
        RoomFilterState.isApplying = false;
    }
}

function selectBillRoomFilter(room) {
    RoomFilterState.selectedBillRoom = room;
    applyBillsRoomFilter();
}

// 4. ประมวลผลตาราง "รายการแจ้งซ่อม" (เติมชื่อผู้เช่า + กรองตามห้อง + อัปเดตตัวเลข KPI)
function applyRepairsRoomFilter() {
    if (RoomFilterState.isApplying) return;
    RoomFilterState.isApplying = true;

    try {
        const tbody = document.getElementById('admin-report-tbody');
        if (!tbody) return;

        const oldEmptyRow = tbody.querySelector('.room-filter-empty-row');
        if (oldEmptyRow) oldEmptyRow.remove();

        const rows = Array.from(tbody.querySelectorAll('tr'));
        const countsByRoom = {};
        let totalCount = 0;
        let visibleCount = 0;

        // ตัวนับสถิติตามห้องที่เลือก
        let statTotal = 0;
        let statPending = 0;
        let statProgress = 0;
        let statCompleted = 0;

        rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return;

            if (!row.dataset.roomNumber) {
                row.dataset.roomNumber = normalizeRoomNumber(cells[1].textContent);
            }
            const room = row.dataset.roomNumber;
            if (!room) return;

            totalCount++;
            countsByRoom[room] = (countsByRoom[room] || 0) + 1;

            // เติมชื่อผู้เช่าจากระบบจัดการผู้พักอาศัยลงใต้เลขห้องผู้แจ้ง
            const member = RoomFilterState.membersMap[room];
            let subLabel = cells[1].querySelector('.tenant-sub-label');
            if (!subLabel) {
                subLabel = document.createElement('div');
                subLabel.className = 'tenant-sub-label text-[11px] font-normal mt-0.5';
                cells[1].appendChild(subLabel);
            }
            if (member) {
                subLabel.className = 'tenant-sub-label text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5';
                subLabel.innerHTML = `<i class="fa-solid fa-user text-[9px] mr-1 text-indigo-500"></i>${member.name}`;
            } else {
                subLabel.className = 'tenant-sub-label text-[11px] font-normal text-slate-400/70 italic mt-0.5';
                subLabel.textContent = '';
            }

            const match =
                RoomFilterState.selectedRepairRoom === 'ALL' ||
                room === RoomFilterState.selectedRepairRoom;

            row.style.display = match ? '' : 'none';

            if (match) {
                visibleCount++;
                statTotal++;
                const statusText = cells[4].textContent.trim();
                if (statusText.includes('รอ')) statPending++;
                else if (statusText.includes('กำลัง')) statProgress++;
                else if (statusText.includes('เสร็จ')) statCompleted++;
            }
        });

        // อัปเดตการ์ด KPI ด้านบนให้ตรงกับห้องที่เลือก
        const elTotal = document.getElementById('stat-total');
        const elPending = document.getElementById('stat-pending');
        const elProgress = document.getElementById('stat-progress');
        const elCompleted = document.getElementById('stat-completed');
        if (elTotal) elTotal.textContent = statTotal;
        if (elPending) elPending.textContent = statPending;
        if (elProgress) elProgress.textContent = statProgress;
        if (elCompleted) elCompleted.textContent = statCompleted;

        // ถ้าห้องที่เลือกยังไม่มีรายการแจ้งซ่อม
        if (visibleCount === 0 && RoomFilterState.selectedRepairRoom !== 'ALL') {
            const room = RoomFilterState.selectedRepairRoom;
            const member = RoomFilterState.membersMap[room];
            const tr = document.createElement('tr');
            tr.className = 'room-filter-empty-row';
            tr.innerHTML = `
                <td colspan="6" class="py-10 px-6 text-center text-sm text-slate-400">
                    <i class="fa-solid fa-screwdriver-wrench text-2xl mb-2 block text-slate-300 dark:text-slate-600"></i>
                    ยังไม่มีรายการแจ้งซ่อมสำหรับ <strong>ห้อง ${room}</strong> ${member ? `(${member.name})` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        }

        renderRoomFilterBar(
            'repairs-room-filter-bar',
            countsByRoom,
            totalCount,
            RoomFilterState.selectedRepairRoom,
            'selectRepairRoomFilter'
        );
    } finally {
        RoomFilterState.isApplying = false;
    }
}

function selectRepairRoomFilter(room) {
    RoomFilterState.selectedRepairRoom = room;
    applyRepairsRoomFilter();
}

// 5. เฝ้าดูการเปลี่ยนแปลงของตารางอัตโนมัติ (เมื่อเพิ่มผู้พักอาศัย / ออกบิล / แจ้งซ่อม / รีเฟรช)
document.addEventListener('DOMContentLoaded', () => {
    const membersTbody = document.getElementById('admin-members-tbody');
    const billsTbody = document.getElementById('admin-bills-tbody');
    const repairsTbody = document.getElementById('admin-report-tbody');

    if (membersTbody) {
        new MutationObserver(() => {
            syncMembersFromDOM();
            applyBillsRoomFilter();
            applyRepairsRoomFilter();
        }).observe(membersTbody, { childList: true, subtree: true });
    }

    if (billsTbody) {
        new MutationObserver(() => {
            if (!RoomFilterState.isApplying) {
                syncMembersFromDOM();
                applyBillsRoomFilter();
            }
        }).observe(billsTbody, { childList: true });
    }

    if (repairsTbody) {
        new MutationObserver(() => {
            if (!RoomFilterState.isApplying) {
                syncMembersFromDOM();
                applyRepairsRoomFilter();
            }
        }).observe(repairsTbody, { childList: true });
    }

    // โหลดข้อมูลผู้พักอาศัยทันทีถ้าฟังก์ชันพร้อมใช้งาน
    if (typeof loadMembers === 'function') {
        loadMembers();
    }
    setTimeout(() => {
        syncMembersFromDOM();
        applyBillsRoomFilter();
        applyRepairsRoomFilter();
    }, 400);
});