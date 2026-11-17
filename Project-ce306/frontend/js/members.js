// ผู้พักอาศัยในห้อง (แอดมิน)

async function loadMembers() {
    const r = await (await fetch('/api/members', {headers:{'Authorization':`Bearer ${currentToken}`}})).json();
    document.getElementById('admin-members-tbody').innerHTML = r.map(m => `<tr class="border-b"><td class="p-3">${m.image_url?`<img src="${m.image_url}" class="h-8 rounded-full">`:''}</td><td class="p-3 font-bold">${m.room_number}</td><td class="p-3">${m.full_name}</td><td class="p-3">${m.phone}</td><td class="p-3 text-center"><button onclick="deleteMember(${m.id})" class="text-rose-500 text-xs">ย้ายออก</button></td></tr>`).join('');
}
async function handleAddMember(e) {
    e.preventDefault(); const f = document.getElementById('mem-image-file').files[0];
    const b = {room_number:document.getElementById('mem-room').value, full_name:document.getElementById('mem-name').value, phone:document.getElementById('mem-phone').value, image_url:f?await readFileAsBase64(f):''};
    await fetch('/api/members', {method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${currentToken}`}, body:JSON.stringify(b)});
    loadMembers(); e.target.reset(); showAlert('เพิ่มแล้ว');
}
async function deleteMember(id) { if(confirm('ย้ายออก?')) { await fetch(`/api/members/${id}`, {method:'DELETE', headers:{'Authorization':`Bearer ${currentToken}`}}); loadMembers(); } }
