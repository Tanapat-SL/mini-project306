// ============================================================================
// ระบบเชื่อมข้อมูลผู้พักอาศัย (Members) และตัวกรองแยกตามห้อง (All, 100, 303, ...)
// ============================================================================

const RoomFilterState = {
    membersMap: {},
    membersLoaded: false,
    selectedRepairRoom: 'ALL',
    selectedBillRoom: 'ALL',
    isApplying: false
};

function normalizeRoomNumber(raw) {
    if (!raw) return '';
    return String(raw)
        .replace(/ห้องพัก|ห้อง|room|#/gi, '')
        .trim();
}

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
        if (cells.length < 4) return;

        const room = normalizeRoomNumber(cells[1].textContent);
        const name = cells[2].textContent.trim();
        const phone = cells[3].textContent.trim();

        if (room) {
            map[room] = { room, name, phone };
        }
    });

    RoomFilterState.membersMap = map;
    if (rows.length > 0) {
        RoomFilterState.membersLoaded = true;
    }

    updateCreateBillRoomSelector();

    // อัปเดตชื่อผู้เช่าใต้ช่องกรอกเลขห้องทันทีถ้ามีเลขห้องพิมพ์ค้างอยู่
    const billRoomInput = document.getElementById('bill-room');
    if (billRoomInput && billRoomInput.value.trim()) {
        onInputBillRoom(billRoomInput.value);
    }
}

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
        let optionsHtml = `<option value="">-- เลือกห้องผู้เช่าด่วน --</option>`;
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

function onSelectBillRoomDropdown(roomValue) {
    const inputEl = document.getElementById('bill-room');
    if (inputEl) {
        inputEl.value = roomValue;
    }
    onInputBillRoom(roomValue);
}

function onInputBillRoom(rawValue) {
    const cleanRoom = normalizeRoomNumber(rawValue);
    const selectEl = document.getElementById('bill-room-select');
    const hintEl = document.getElementById('bill-tenant-hint');

    if (selectEl) {
        selectEl.value = RoomFilterState.membersMap[cleanRoom] ? cleanRoom : '';
    }
    if (!hintEl) return;

    if (!cleanRoom) {
        hintEl.innerHTML = '';
        return;
    }

    const member = RoomFilterState.membersMap[cleanRoom];
    if (member) {
        hintEl.innerHTML = `<span class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><i class="fa-solid fa-circle-check"></i> ผู้เช่าห้อง ${cleanRoom}: <strong>${member.name}</strong> (${member.phone})</span>`;
    } else if (RoomFilterState.membersLoaded) {
        hintEl.innerHTML = `<span class="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400"><i class="fa-solid fa-triangle-exclamation"></i> ยังไม่มีข้อมูลผู้เช่าห้อง ${cleanRoom} ในระบบจัดการผู้พักอาศัย</span>`;
    } else {
        hintEl.innerHTML = '';
    }
}

// 2. สร้างปุ่มแท็บตัวกรองห้อง (All, 100, 303, ...)
function renderRoomFilterBar(containerId, countsByRoom, totalCount, selectedRoom, onSelectFnName) {
    const container = document.getElementById(containerId);
    if (!container) return;

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
                        ? `<span class="font-normal text-[11px] ${
                              isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-400'
                          }">(${member.name})</span>`
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

// 3. ประมวลผลตาราง "จัดการบิลค่าเช่า"
function applyBillsRoomFilter() {
    if (RoomFilterState.isApplying) return;
    RoomFilterState.isApplying = true;

    try {
        const tbody = document.getElementById('admin-bills-tbody');
        if (!tbody) return;

        const oldEmptyRow = tbody.querySelector('.room-filter-empty-row');
        if (oldEmptyRow) oldEmptyRow.remove();

        const rows = Array.from(tbody.querySelectorAll('tr'));
        const countsByRoom = {};
        let totalCount = 0;
        let visibleCount = 0;

        rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return;

            if (!row.dataset.roomNumber) {
                row.dataset.roomNumber = normalizeRoomNumber(cells[0].textContent);
            }
            const room = row.dataset.roomNumber;
            if (!room) return;

            totalCount++;
            countsByRoom[room] = (countsByRoom[room] || 0) + 1;

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

            const match =
                RoomFilterState.selectedBillRoom === 'ALL' ||
                room === RoomFilterState.selectedBillRoom;

            row.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        });

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

// 4. ประมวลผลตาราง "รายการแจ้งซ่อม"
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

        const elTotal = document.getElementById('stat-total');
        const elPending = document.getElementById('stat-pending');
        const elProgress = document.getElementById('stat-progress');
        const elCompleted = document.getElementById('stat-completed');
        if (elTotal) elTotal.textContent = statTotal;
        if (elPending) elPending.textContent = statPending;
        if (elProgress) elProgress.textContent = statProgress;
        if (elCompleted) elCompleted.textContent = statCompleted;

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

    if (typeof loadMembers === 'function') {
        loadMembers();
    }
    setTimeout(() => {
        syncMembersFromDOM();
        applyBillsRoomFilter();
        applyRepairsRoomFilter();
    }, 400);
});