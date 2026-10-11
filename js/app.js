/* National Academy ERP front-end prototype.
   Sample records are fictional and stored only in this browser tab. */
const store = {
  users: [
    {id:"MGT001",password:"manage123",role:"management",name:"School Management",initials:"SM"},
    {id:"TCH001",password:"teach123",role:"teacher",name:"Priya Verma",initials:"PV"},
    {id:"TCH002",password:"teach456",role:"teacher",name:"Amit Singh",initials:"AS"},
    {id:"STU001",password:"stud123",role:"student",name:"Aarav Sharma",initials:"AS",className:"6-A",studentId:1},
    {id:"STU002",password:"stud456",role:"student",name:"Ananya Gupta",initials:"AG",className:"7-B",studentId:2},
    {id:"STU003",password:"stud789",role:"student",name:"Rohan Kumar",initials:"RK",className:"6-A",studentId:3},
    {id:"STU004",password:"stud321",role:"student",name:"Sara Khan",initials:"SK",className:"8-A",studentId:4},
    {id:"STU005",password:"stud654",role:"student",name:"Dev Patel",initials:"DP",className:"7-B",studentId:5}
  ],
  students: [
    {id:1,name:"Aarav Sharma",className:"6-A",roll:1,guardian:"Rakesh Sharma",phone:"98XXXXXX01",feeTotal:24000,feePaid:18000},
    {id:2,name:"Ananya Gupta",className:"7-B",roll:2,guardian:"Neha Gupta",phone:"98XXXXXX02",feeTotal:26000,feePaid:26000},
    {id:3,name:"Rohan Kumar",className:"6-A",roll:3,guardian:"Sanjay Kumar",phone:"98XXXXXX03",feeTotal:24000,feePaid:12000},
    {id:4,name:"Sara Khan",className:"8-A",roll:4,guardian:"Imran Khan",phone:"98XXXXXX04",feeTotal:28000,feePaid:20000},
    {id:5,name:"Dev Patel",className:"7-B",roll:5,guardian:"Kiran Patel",phone:"98XXXXXX05",feeTotal:26000,feePaid:26000},
    {id:6,name:"Meera Joshi",className:"8-A",roll:6,guardian:"Ritu Joshi",phone:"98XXXXXX06",feeTotal:28000,feePaid:14000},
    {id:7,name:"Kabir Das",className:"5-A",roll:7,guardian:"Arun Das",phone:"98XXXXXX07",feeTotal:22000,feePaid:22000},
    {id:8,name:"Ishita Roy",className:"5-A",roll:8,guardian:"Pooja Roy",phone:"98XXXXXX08",feeTotal:22000,feePaid:11000}
  ],
  teachers: [
    {id:"TCH001",name:"Priya Verma",subject:"Mathematics",classes:"6-A, 7-B"},
    {id:"TCH002",name:"Amit Singh",subject:"Science",classes:"5-A, 8-A"},
    {id:"TCH003",name:"Neha Mishra",subject:"English",classes:"6-A, 8-A"}
  ],
  attendance: {},
  notices: [
    {title:"Parent-Teacher Meeting",body:"The next parent-teacher meeting is scheduled for Saturday. Please check with the school office for your time slot.",date:"10 Oct 2026"},
    {title:"Fee Reminder",body:"Families with pending fees are requested to contact the accounts office.",date:"08 Oct 2026"},
    {title:"Sports Day Practice",body:"Class-wise sports practice will take place during the activity period this week.",date:"06 Oct 2026"}
  ]
};
let currentUser=null, currentPage="dashboard", selectedRole="management";
const todayKey=()=>new Date().toISOString().slice(0,10);
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const initials=name=>String(name||"NA").split(/\s+/).map(s=>s[0]).join("").slice(0,2).toUpperCase();
const allPresent=()=>Object.values(store.attendance).flat().filter(x=>x.status==="Present").length;
function getAttendance(studentId,date=todayKey()){return (store.attendance[date]||[]).find(x=>x.studentId===studentId)}
function setAttendance(studentId,status,date=todayKey()){
  if(!store.attendance[date])store.attendance[date]=[];
  const list=store.attendance[date], found=list.find(x=>x.studentId===studentId);
  if(found)found.status=status;else list.push({studentId,status,markedBy:currentUser?.name||"Teacher"});
}
function studentAttendanceStats(id){
  let present=0,absent=0;
  Object.values(store.attendance).forEach(list=>list.forEach(a=>{if(a.studentId===id){if(a.status==="Present")present++;else if(a.status==="Absent")absent++}}));
  const total=present+absent;
  return {present,absent,total,percentage:total?Math.round(present/total*100):0};
}
function studentById(id){return store.students.find(s=>s.id===id)}
function feeStatus(s){return s.feePaid>=s.feeTotal?"Paid":s.feePaid>0?"Partial":"Due"}
function badge(status){const cls=status==="Present"||status==="Paid"?"present":status==="Absent"||status==="Due"?"absent":status==="Late"||status==="Partial"?"late":"neutral";return `<span class="badge ${cls}">${esc(status)}</span>`}
function statCard(label,value,foot,icon){return `<div class="stat"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div></div>`}
function pageHead(title,subtitle,action=""){return `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`}
function navItems(){
 if(currentUser.role==="management")return [["dashboard","▦","Overview"],["students","♙","Students"],["teachers","♧","Teachers"],["fees","₹","Fee Management"],["attendance","✓","Attendance"],["notices","▤","School Notices"]];
 if(currentUser.role==="teacher")return [["dashboard","▦","My Dashboard"],["attendance","✓","Mark Attendance"],["students","♙","Student List"],["notices","▤","School Notices"]];
 return [["dashboard","▦","My Dashboard"],["myattendance","✓","My Attendance"],["myfees","₹","My Fees"],["notices","▤","School Notices"]];
}
function buildNav(){
 document.getElementById("navigation").innerHTML=navItems().map(([key,ico,label])=>`<button class="nav-btn ${key===currentPage?"active":""}" data-page="${key}"><span class="ico">${ico}</span>${label}</button>`).join("");
 document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
}
function login(event){
 event.preventDefault();
 const id=document.getElementById("loginId").value.trim().toUpperCase(),password=document.getElementById("loginPassword").value;
 const user=store.users.find(u=>u.id===id&&u.password===password&&u.role===selectedRole);
 if(!user){document.getElementById("loginError").textContent="Login details don't match this account type.";return}
 currentUser=user;currentPage="dashboard";
 document.getElementById("loginScreen").classList.add("hidden");document.getElementById("app").classList.remove("hidden");
 document.getElementById("sideUser").innerHTML=`${esc(user.name)}<br><span class="small">${esc(user.id)} · ${esc(user.role)}</span>`;
 document.getElementById("roleLabel").textContent=user.role[0].toUpperCase()+user.role.slice(1);
 document.getElementById("topAvatar").textContent=user.initials||initials(user.name);
 buildNav();renderPage();
}
function logout(){currentUser=null;document.getElementById("app").classList.add("hidden");document.getElementById("loginScreen").classList.remove("hidden");document.getElementById("loginForm").reset();document.getElementById("loginError").textContent=""}
function showPage(page){currentPage=page;buildNav();renderPage();window.scrollTo({top:0,behavior:"smooth"})}
function renderPage(){
 const titles={dashboard:"Overview",students:"Students",teachers:"Teachers",fees:"Fee Management",attendance:"Attendance",notices:"School Notices",myattendance:"My Attendance",myfees:"My Fees"};
 document.getElementById("topTitle").textContent=titles[currentPage]||"Dashboard";
 const pages={dashboard:renderDashboard,students:renderStudents,teachers:renderTeachers,fees:renderFees,attendance:renderAttendance,notices:renderNotices,myattendance:renderMyAttendance,myfees:renderMyFees};
 document.getElementById("pageContent").innerHTML=(pages[currentPage]||renderDashboard)();
 bindPageEvents();
}
function renderDashboard(){
 if(currentUser.role==="student")return renderStudentDashboard();
 if(currentUser.role==="teacher"){
  const today=store.attendance[todayKey()]||[],present=today.filter(a=>a.status==="Present").length,absent=today.filter(a=>a.status==="Absent").length;
  return pageHead(`Welcome back, ${esc(currentUser.name.split(" ")[0])} 👋`,"Here is your classroom snapshot for today.")+
  `<div class="grid stats">${statCard("Total Students",store.students.length,"In the sample school","🎓")}${statCard("Marked Present",present,"Today’s marked attendance","✓")}${statCard("Marked Absent",absent,"Today’s marked attendance","↗")}${statCard("Attendance Records",today.length,"Students marked today","▤")}</div>
  <div class="panel"><div class="panel-head"><div><h3>Quick actions</h3><p>Manage your classroom records</p></div></div><button class="primary" data-goto="attendance">Mark today’s attendance →</button> <button class="btn" data-goto="students">View students</button></div>${renderNoticePanel()}`;
 }
 const total=store.students.length,totalFees=store.students.reduce((n,s)=>n+s.feeTotal,0),paid=store.students.reduce((n,s)=>n+s.feePaid,0),pending=totalFees-paid;
 const todays=store.attendance[todayKey()]||[],present=todays.filter(a=>a.status==="Present").length;
 return pageHead("Good afternoon, Management 👋","Here is what is happening at National Academy today.",`<button class="primary" data-action="add-student">+ Add student</button>`)+
 `<div class="grid stats">${statCard("Total Students",total,"Across all listed classes","🎓")}${statCard("Teachers",store.teachers.length,"Teaching staff records","👩‍🏫")}${statCard("Fees Collected",money(paid),Math.round(paid/(totalFees||1)*100)+"% of listed fees","₹")}${statCard("Fees Pending",money(pending),"Outstanding fee balance","◷")}</div>
 <div class="grid two-col"><div class="panel"><div class="panel-head"><div><h3>Attendance overview</h3><p>Based on records marked today</p></div><button class="btn" data-goto="attendance">Open attendance</button></div>
 <div style="display:flex;align-items:center;gap:22px;padding:8px 0 18px"><div class="progress-ring">${todays.length?Math.round(present/todays.length*100):0}%</div><div style="flex:1"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px"><span>Present among marked</span><strong>${present}/${todays.length}</strong></div><div class="bar"><span style="width:${todays.length?present/todays.length*100:0}%"></span></div><p class="muted small">Attendance percentage is calculated from records entered in this prototype.</p></div></div></div>
 <div class="panel"><div class="panel-head"><div><h3>Fee collection</h3><p>Overall fee position</p></div><button class="btn" data-goto="fees">View fees</button></div><div style="font-size:25px;font-weight:800;margin:15px 0 8px">${money(paid)}</div><div class="bar"><span style="width:${Math.min(100,paid/(totalFees||1)*100)}%"></span></div><p class="muted small">${money(pending)} remains pending out of ${money(totalFees)} total listed fees.</p></div></div>
 <div class="grid two-col"><div class="panel"><div class="panel-head"><h3>Recent student records</h3><button class="btn" data-goto="students">All students</button></div>${studentTable(store.students.slice(0,4),false)}</div>${renderNoticePanel()}</div>`;
}
function renderStudentDashboard(){
 const s=studentById(currentUser.studentId),stats=studentAttendanceStats(s.id),due=Math.max(0,s.feeTotal-s.feePaid);
 return pageHead(`Hello, ${esc(s.name.split(" ")[0])} 👋`,"Your personal school overview.")+
 `<div class="grid stats">${statCard("Attendance",stats.percentage+"%",stats.total+" attendance records","✓")}${statCard("Days Present",stats.present,"Recorded present days","📅")}${statCard("Fees Paid",money(s.feePaid),"Out of "+money(s.feeTotal),"₹")}${statCard("Fee Balance",money(due),due===0?"No fee balance shown":"Please contact the school office","◷")}</div>
 <div class="grid two-col"><div class="panel"><div class="panel-head"><div><h3>My profile</h3><p>Student information</p></div></div>
 <div class="person" style="margin:18px 0 24px"><div class="mini-avatar" style="width:48px;height:48px">${initials(s.name)}</div><div><strong>${esc(s.name)}</strong><small>Student ID: ${esc(currentUser.id)}</small></div></div>
 <table><tbody><tr><td class="muted">Class / Section</td><td><strong>${esc(s.className)}</strong></td></tr><tr><td class="muted">Roll number</td><td><strong>${s.roll}</strong></td></tr><tr><td class="muted">Guardian</td><td><strong>${esc(s.guardian)}</strong></td></tr><tr><td class="muted">Fee status</td><td>${badge(feeStatus(s))}</td></tr></tbody></table>
 <button class="btn btn-blue" style="margin-top:16px" data-goto="myattendance">View attendance report</button> <button class="btn" style="margin-top:16px" data-goto="myfees">View fee details</button></div>${renderNoticePanel()}</div>`;
}
function studentTable(list,showActions=true){
 if(!list.length)return `<div class="empty">No students found.</div>`;
 return `<div class="table-wrap"><table><thead><tr><th>Student</th><th>Class</th><th>Fee status</th>${showActions?'<th>Actions</th>':''}</tr></thead><tbody>${list.map(s=>`<tr><td><div class="person"><div class="mini-avatar">${initials(s.name)}</div><div><strong>${esc(s.name)}</strong><small>Roll no. ${s.roll} · NA${String(s.id).padStart(3,"0")}</small></div></div></td><td>${esc(s.className)}</td><td>${badge(feeStatus(s))}</td>${showActions?`<td><button class="btn" data-edit-student="${s.id}">Edit</button></td>`:""}</tr>`).join("")}</tbody></table></div>`;
}
function renderStudents(){
 const list=currentUser.role==="student"?[studentById(currentUser.studentId)]:store.students;
 return pageHead("Student Directory","View student records and class information.",currentUser.role==="management"?`<button class="primary" data-action="add-student">+ Add student</button>`:"")+
 `<div class="panel"><div class="panel-head"><div><h3>Student records</h3><p>${list.length} student records</p></div><input id="studentSearch" placeholder="Search name or class…" style="max-width:240px"></div><div id="studentTable">${studentTable(list,currentUser.role==="management")}</div></div>`;
}
function renderTeachers(){
 return pageHead("Teaching Staff","Teacher records and assigned subjects.",`<button class="primary" data-action="add-teacher">+ Add teacher</button>`)+
 `<div class="grid stats">${statCard("Total Teachers",store.teachers.length,"Listed teaching staff","👩‍🏫")}${statCard("Subjects",new Set(store.teachers.map(t=>t.subject)).size,"Unique listed subjects","📚")}${statCard("Student Records",store.students.length,"Current prototype list","🎓")}${statCard("School", "Active","National Academy","🏫")}</div>
 <div class="panel"><div class="panel-head"><div><h3>Teacher directory</h3><p>Staff details and class assignments</p></div></div><div class="table-wrap"><table><thead><tr><th>Teacher</th><th>Teacher ID</th><th>Subject</th><th>Classes</th></tr></thead><tbody>${store.teachers.map(t=>`<tr><td><div class="person"><div class="mini-avatar">${initials(t.name)}</div><strong>${esc(t.name)}</strong></div></td><td>${esc(t.id)}</td><td>${esc(t.subject)}</td><td>${esc(t.classes)}</td></tr>`).join("")}</tbody></table></div></div>`;
}
function renderFees(){
 const list=currentUser.role==="student"?[studentById(currentUser.studentId)]:store.students;
 const total=list.reduce((n,s)=>n+s.feeTotal,0),paid=list.reduce((n,s)=>n+s.feePaid,0),pending=total-paid;
 return pageHead(currentUser.role==="student"?"My Fee Details":"Fee Management",currentUser.role==="student"?"Review your listed fee amounts and current balance.":"Track fee collection and outstanding balances.",currentUser.role==="management"?`<button class="btn" data-action="export-fees">Export CSV</button>`:"")+
 `<div class="grid stats">${statCard("Total Fees",money(total),"For displayed students","₹")}${statCard("Collected",money(paid),Math.round(paid/(total||1)*100)+"% collected","✓")}${statCard("Pending",money(pending),"Balance due","◷")}${statCard("Students with balance",list.filter(s=>s.feePaid<s.feeTotal).length,"Fee not fully paid","🎓")}</div>
 <div class="panel"><div class="panel-head"><div><h3>${currentUser.role==="student"?"My fee ledger":"Student fee ledger"}</h3><p>Amounts shown are fictional prototype data.</p></div></div><div class="table-wrap"><table><thead><tr><th>Student</th><th>Class</th><th>Total fee</th><th>Paid</th><th>Balance</th><th>Status</th>${currentUser.role==="management"?"<th>Action</th>":""}</tr></thead><tbody>${list.map(s=>`<tr><td><strong>${esc(s.name)}</strong></td><td>${esc(s.className)}</td><td>${money(s.feeTotal)}</td><td>${money(s.feePaid)}</td><td><strong>${money(s.feeTotal-s.feePaid)}</strong></td><td>${badge(feeStatus(s))}</td>${currentUser.role==="management"?`<td><button class="btn" data-fee="${s.id}">Record payment</button></td>`:""}</tr>`).join("")}</tbody></table></div></div>`;
}
function renderAttendance(){
 const date=todayKey(),today=store.attendance[date]||[],present=today.filter(a=>a.status==="Present").length,absent=today.filter(a=>a.status==="Absent").length;
 const teacherMode=currentUser.role==="teacher";
 const classOptions=[...new Set(store.students.map(s=>s.className))].sort();
 return pageHead(teacherMode?"Mark Student Attendance":"Attendance Management",teacherMode?"Choose a class and mark each student present or absent.":"Review and update attendance records.",`<button class="btn" data-action="export-attendance">Export CSV</button>`)+
 `<div class="grid stats">${statCard("Marked Today",today.length,"Out of "+store.students.length+" listed students","✓")}${statCard("Present",present,"Marked present today","🟢")}${statCard("Absent",absent,"Marked absent today","🔴")}${statCard("Not Marked",Math.max(0,store.students.length-today.length),"Awaiting a status","◷")}</div>
 <div class="panel"><div class="panel-head"><div><h3>Daily register</h3><p>Mark attendance for the selected class.</p></div></div><div class="attendance-controls"><input type="date" id="attendanceDate" value="${date}"><select id="attendanceClass"><option value="all">All classes</option>${classOptions.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("")}</select><input id="attendanceSearch" placeholder="Search student…"></div><div id="attendanceTable">${attendanceTable(store.students,date,"all","")}</div></div>`;
}
function attendanceTable(list,date,classFilter,search){
 const filtered=list.filter(s=>(classFilter==="all"||s.className===classFilter)&&(`${s.name} ${s.className}`).toLowerCase().includes(search.toLowerCase()));
 if(!filtered.length)return `<div class="empty">No students match this filter.</div>`;
 const canMark=currentUser.role==="teacher"||currentUser.role==="management";
 return `<div class="table-wrap"><table><thead><tr><th>Student</th><th>Class</th><th>Status</th>${canMark?"<th>Mark attendance</th>":""}</tr></thead><tbody>${filtered.map(s=>{const record=getAttendance(s.id,date);return `<tr><td><div class="person"><div class="mini-avatar">${initials(s.name)}</div><div><strong>${esc(s.name)}</strong><small>Roll no. ${s.roll}</small></div></div></td><td>${esc(s.className)}</td><td>${record?badge(record.status):badge("Not marked")}</td>${canMark?`<td><button class="btn ${record?.status==="Present"?"btn-blue":""}" data-mark="${s.id}" data-status="Present" data-date="${date}">Present</button> <button class="btn ${record?.status==="Absent"?"btn-blue":""}" data-mark="${s.id}" data-status="Absent" data-date="${date}">Absent</button></td>`:""}</tr>`}).join("")}</tbody></table></div>`;
}
function renderMyAttendance(){
 const s=studentById(currentUser.studentId),stats=studentAttendanceStats(s.id);
 const rows=Object.entries(store.attendance).sort((a,b)=>b[0].localeCompare(a[0])).map(([date,records])=>({date,record:records.find(a=>a.studentId===s.id)})).filter(x=>x.record);
 return pageHead("My Attendance","Your recorded attendance history.")+
 `<div class="grid stats">${statCard("Present",stats.present,"Recorded present days","🟢")}${statCard("Absent",stats.absent,"Recorded absent days","🔴")}${statCard("Attendance %",stats.percentage+"%","Present ÷ marked days","📊")}${statCard("Marked Days",stats.total,"Days with a status recorded","📅")}</div>
 <div class="panel"><div class="panel-head"><div><h3>Attendance history</h3><p>Only dates with a recorded status are listed.</p></div></div>${rows.length?`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Status</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.date)}</td><td>${badge(x.record.status)}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">No attendance has been recorded for your account yet.</div>`}</div>`;
}
function renderMyFees(){return renderFees()}
function renderNotices(){
 return pageHead("School Notices","Announcements and updates from National Academy.",currentUser.role==="management"?`<button class="primary" data-action="add-notice">+ Add notice</button>`:"")+
 `<div class="panel"><div class="panel-head"><div><h3>Latest announcements</h3><p>Keep up with school updates.</p></div></div>${store.notices.map((n,i)=>`<div class="notice-item"><div style="display:flex;justify-content:space-between;gap:12px"><strong>${esc(n.title)}</strong><span class="muted small">${esc(n.date)}</span></div><p>${esc(n.body)}</p>${currentUser.role==="management"?`<button class="btn btn-danger" data-delete-notice="${i}">Delete</button>`:""}</div>`).join("")||`<div class="empty">No notices have been posted.</div>`}</div>`;
}
function renderNoticePanel(){return `<div class="panel"><div class="panel-head"><div><h3>School notices</h3><p>Recent announcements</p></div><button class="btn" data-goto="notices">View all</button></div>${store.notices.slice(0,2).map(n=>`<div class="notice-item"><strong>${esc(n.title)}</strong><p>${esc(n.body)}</p><span class="muted small">${esc(n.date)}</span></div>`).join("")}</div>`}
function bindPageEvents(){
 document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.goto)));
 document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>handleAction(b.dataset.action)));
 const search=document.getElementById("studentSearch");if(search)search.addEventListener("input",()=>{const list=currentUser.role==="student"?[studentById(currentUser.studentId)]:store.students;document.getElementById("studentTable").innerHTML=studentTable(list.filter(s=>(s.name+" "+s.className).toLowerCase().includes(search.value.toLowerCase())),currentUser.role==="management");bindEditButtons()});
 bindEditButtons();
 document.querySelectorAll("[data-mark]").forEach(b=>b.addEventListener("click",()=>{setAttendance(Number(b.dataset.mark),b.dataset.status,b.dataset.date);renderPage()}));
 ["attendanceDate","attendanceClass","attendanceSearch"].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener("input",refreshAttendanceTable)});
 document.querySelectorAll("[data-fee]").forEach(b=>b.addEventListener("click",()=>openFeeModal(Number(b.dataset.fee))));
 document.querySelectorAll("[data-delete-notice]").forEach(b=>b.addEventListener("click",()=>{if(confirm("Delete this notice?")){store.notices.splice(Number(b.dataset.deleteNotice),1);renderPage()}}));
}
function bindEditButtons(){document.querySelectorAll("[data-edit-student]").forEach(b=>b.addEventListener("click",()=>openStudentModal(Number(b.dataset.editStudent))))}
function refreshAttendanceTable(){
 const date=document.getElementById("attendanceDate").value||todayKey(),cls=document.getElementById("attendanceClass").value,search=document.getElementById("attendanceSearch").value;
 document.getElementById("attendanceTable").innerHTML=attendanceTable(store.students,date,cls,search);
 document.querySelectorAll("[data-mark]").forEach(b=>b.addEventListener("click",()=>{setAttendance(Number(b.dataset.mark),b.dataset.status,b.dataset.date);refreshAttendanceTable();}));
}
function handleAction(action){
 if(action==="add-student")openStudentModal();
 if(action==="add-teacher")openTeacherModal();
 if(action==="add-notice")openNoticeModal();
 if(action==="export-attendance")exportCSV("attendance.csv",["Date","Student","Class","Status"],Object.entries(store.attendance).flatMap(([date,records])=>records.map(a=>{const s=studentById(a.studentId);return[date,s?.name||"",s?.className||"",a.status]})));
 if(action==="export-fees")exportCSV("fees.csv",["Student","Class","Total Fee","Paid","Balance","Status"],store.students.map(s=>[s.name,s.className,s.feeTotal,s.feePaid,s.feeTotal-s.feePaid,feeStatus(s)]));
}
function modal(title,body,submitLabel="Save"){
 document.getElementById("modalRoot").innerHTML=`<div id="modalBackdrop" style="position:fixed;inset:0;background:#11182780;z-index:20;display:grid;place-items:center;padding:16px"><div style="width:100%;max-width:520px;background:white;border-radius:17px;padding:24px;max-height:90vh;overflow:auto"><div class="panel-head"><h3>${title}</h3><button class="btn" type="button" id="closeModal">✕</button></div><form id="modalForm">${body}<div class="form-actions"><button class="btn" type="button" id="cancelModal">Cancel</button><button class="primary" type="submit">${submitLabel}</button></div></form></div></div>`;
 document.getElementById("closeModal").onclick=closeModal;document.getElementById("cancelModal").onclick=closeModal;
 document.getElementById("modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});
}
function closeModal(){document.getElementById("modalRoot").innerHTML=""}
function openStudentModal(id=null){
 if(currentUser.role!=="management")return;
 const s=id?studentById(id):{name:"",className:"6-A",roll:store.students.length+1,guardian:"",phone:"",feeTotal:24000,feePaid:0};
 modal(id?"Edit student":"Add student",`<div class="field-row"><div><label>Full name</label><input name="name" required value="${esc(s.name)}"></div><div><label>Class / Section</label><input name="className" required value="${esc(s.className)}"></div><div><label>Roll number</label><input name="roll" type="number" min="1" required value="${s.roll}"></div><div><label>Guardian name</label><input name="guardian" value="${esc(s.guardian)}"></div><div><label>Contact (optional)</label><input name="phone" value="${esc(s.phone)}"></div><div><label>Total annual fee (₹)</label><input name="feeTotal" type="number" min="0" required value="${s.feeTotal}"></div><div><label>Fee paid (₹)</label><input name="feePaid" type="number" min="0" required value="${s.feePaid}"></div></div>`);
 document.getElementById("modalForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),obj={name:f.get("name").trim(),className:f.get("className").trim(),roll:Number(f.get("roll")),guardian:f.get("guardian").trim(),phone:f.get("phone").trim(),feeTotal:Number(f.get("feeTotal")),feePaid:Number(f.get("feePaid"))};if(obj.feePaid>obj.feeTotal){alert("Paid amount cannot be greater than total fee.");return}if(id)Object.assign(s,obj);else{obj.id=Math.max(0,...store.students.map(x=>x.id))+1;store.students.push(obj)}closeModal();renderPage()};
}
function openFeeModal(id){
 if(currentUser.role!=="management")return;const s=studentById(id);
 modal("Record fee payment",`<p class="muted small">Student: <strong>${esc(s.name)}</strong> · Current balance: <strong>${money(s.feeTotal-s.feePaid)}</strong></p><label>Payment amount (₹)</label><input name="amount" type="number" min="1" max="${s.feeTotal-s.feePaid}" required>`);
 document.getElementById("modalForm").onsubmit=e=>{e.preventDefault();const amount=Number(new FormData(e.target).get("amount"));if(amount<=0||amount>s.feeTotal-s.feePaid){alert("Enter an amount within the remaining balance.");return}s.feePaid+=amount;closeModal();renderPage()};
}
function openTeacherModal(){
 if(currentUser.role!=="management")return;
 modal("Add teacher",`<label>Teacher name</label><input name="name" required><div class="field-row"><div><label>Subject</label><input name="subject" required></div><div><label>Classes</label><input name="classes" placeholder="e.g. 6-A, 7-B" required></div></div><label>Teacher login ID</label><input name="id" placeholder="e.g. TCH004" required><p class="muted small">For this prototype, teacher login accounts must be configured in the JavaScript separately.</p>`);
 document.getElementById("modalForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),id=f.get("id").trim().toUpperCase();if(store.teachers.some(t=>t.id===id)){alert("That teacher ID already exists.");return}store.teachers.push({id,name:f.get("name").trim(),subject:f.get("subject").trim(),classes:f.get("classes").trim()});closeModal();renderPage()};
}
function openNoticeModal(){
 modal("Publish school notice",`<label>Notice title</label><input name="title" required><label>Message</label><textarea name="body" required rows="4" style="width:100%;border:1px solid #d6deea;border-radius:10px;padding:12px;font:inherit"></textarea>`);
 document.getElementById("modalForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);store.notices.unshift({title:f.get("title").trim(),body:f.get("body").trim(),date:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})});closeModal();renderPage()};
}
function exportCSV(filename,headers,rows){
 const csv=[headers,...rows].map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
 const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}
document.querySelectorAll(".role-choice").forEach(b=>b.addEventListener("click",()=>{selectedRole=b.dataset.role;document.querySelectorAll(".role-choice").forEach(x=>x.classList.toggle("active",x===b));document.getElementById("loginError").textContent=""}));
document.getElementById("loginForm").addEventListener("submit",login);
document.getElementById("logoutBtn").addEventListener("click",logout);
