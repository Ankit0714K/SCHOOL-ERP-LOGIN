
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
  paymentRecords: [],
  assignments: [
    {id:1,title:"Fractions practice",subject:"Mathematics",className:"6-A",dueDate:"2026-10-15",description:"Complete questions 1–10 from the fractions worksheet."},
    {id:2,title:"Plant life cycle",subject:"Science",className:"6-A",dueDate:"2026-10-18",description:"Draw and label the stages of a plant’s life cycle."},
    {id:3,title:"Reading response",subject:"English",className:"7-B",dueDate:"2026-10-16",description:"Write a short paragraph about this week’s reading."}
  ],
  assignmentCompletions: [],
  results: [],
  notices: [
    {title:"Parent-Teacher Meeting",body:"The next parent-teacher meeting is scheduled for Saturday. Please check with the school office for your time slot.",date:"10 Oct 2026"},
    {title:"Fee Reminder",body:"Families with pending fees are requested to contact the accounts office.",date:"08 Oct 2026"},
    {title:"Sports Day Practice",body:"Class-wise sports practice will take place during the activity period this week.",date:"06 Oct 2026"}
  ]
};
let currentUser=null, currentPage="dashboard", selectedRole="student", pageHistory=[];
const roleIdLabels={management:"School ID",teacher:"Teacher ID",student:"Student ID"};
document.querySelectorAll(".role-choice").forEach(button=>button.addEventListener("click",()=>{
 selectedRole=button.dataset.role;
 document.querySelectorAll(".role-choice").forEach(choice=>choice.classList.toggle("active",choice===button));
 const idType=roleIdLabels[selectedRole];
 document.getElementById("loginIdLabel").textContent=idType;
 document.getElementById("loginId").placeholder=`Enter your ${idType}`;
 document.getElementById("loginError").textContent="";
}));
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
 if(currentUser.role==="management")return [["dashboard","▦","Overview"],["students","♙","Students"],["teachers","♧","Teachers"],["fees","₹","Fee Management"],["attendance","✓","Attendance"],["results","▤","Results"],["notices","▤","School Notices"]];
 if(currentUser.role==="teacher")return [["dashboard","▦","My Dashboard"],["attendance","✓","Mark Attendance"],["assignments","▣","Assignments"],["students","♙","Student List"],["notices","▤","School Notices"]];
 return [["dashboard","▦","My Dashboard"],["myattendance","✓","My Attendance"],["myfees","₹","My Fees"],["assignments","▣","Assignments"],["results","▤","Results"],["notices","▤","School Notices"]];
}
function buildNav(){
 document.getElementById("navigation").innerHTML=navItems().map(([key,ico,label])=>`<button class="nav-btn ${key===currentPage?"active":""}" data-page="${key}">${label}</button>`).join("");
 document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
}
function login(event){
 event.preventDefault();
 const id=document.getElementById("loginId").value.trim().toUpperCase(),password=document.getElementById("loginPassword").value;
 const user=store.users.find(u=>u.id===id&&u.password===password&&u.role===selectedRole);
 if(!user){document.getElementById("loginError").textContent="Login details don't match this account type.";return}
 currentUser=user;currentPage="dashboard";pageHistory=[];document.getElementById("backBtn").classList.add("hidden");
 document.getElementById("loginScreen").classList.add("hidden");document.getElementById("app").classList.remove("hidden");
 document.getElementById("sideUser").innerHTML=`${esc(user.name)}<br><span class="small">${esc(user.id)} · ${esc(user.role)}</span>`;
  document.getElementById("roleLabel").textContent=user.role[0].toUpperCase()+user.role.slice(1);
  document.getElementById("topAvatar").textContent=user.initials||initials(user.name);
  document.getElementById("profileShortcut").disabled=user.role!=="student";
 buildNav();renderPage();
}
function logout(){currentUser=null;currentPage="dashboard";pageHistory=[];document.getElementById("backBtn").classList.add("hidden");document.getElementById("app").classList.add("hidden");document.getElementById("loginScreen").classList.remove("hidden");document.getElementById("loginForm").reset();document.getElementById("loginError").textContent=""}
function showPage(page,remember=true){if(page===currentPage)return;if(remember)pageHistory.push(currentPage);currentPage=page;document.getElementById("backBtn").classList.toggle("hidden",pageHistory.length===0);buildNav();renderPage();window.scrollTo({top:0,behavior:"smooth"})}
function renderPage(){
  const titles={dashboard:"Overview",students:"Students",teachers:"Teachers",fees:"Fee Management",attendance:"Attendance",assignments:"Assignments",results:"Results",notices:"School Notices",myattendance:"My Attendance",myfees:"My Fees",myprofile:"My Profile"};
 document.getElementById("topTitle").textContent=titles[currentPage]||"Dashboard";
  const pages={dashboard:renderDashboard,students:renderStudents,teachers:renderTeachers,fees:renderFees,attendance:renderAttendance,assignments:renderAssignments,results:renderResults,notices:renderNotices,myattendance:renderMyAttendance,myfees:renderMyFees,myprofile:renderMyProfile};
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
 `<div class="grid stats student-summary"><div class="stat student-summary-card"><div class="stat-top"><span>Attendance</span><span class="stat-icon">✓</span></div><div class="stat-value">${stats.percentage}%</div><div class="stat-foot">${stats.total} attendance records</div><button class="btn btn-blue" style="margin-top:18px" data-goto="myattendance">View details →</button></div><div class="stat student-summary-card"><div class="stat-top"><span>Fees Paid</span><span class="stat-icon">₹</span></div><div class="stat-value">${money(s.feePaid)}</div><div class="stat-foot">Out of ${money(s.feeTotal)}</div><button class="btn btn-blue" style="margin-top:18px" data-goto="myfees">View details →</button></div></div>
 <div class="grid two-col"><div class="panel"><div class="panel-head"><div><h3>My profile</h3><p>Student information</p></div></div>
 <div class="person" style="margin:18px 0 24px"><div class="mini-avatar" style="width:48px;height:48px">${initials(s.name)}</div><div><strong>${esc(s.name)}</strong><small>Student ID: ${esc(currentUser.id)}</small></div></div>
 <table><tbody><tr><td class="muted">Class / Section</td><td><strong>${esc(s.className)}</strong></td></tr><tr><td class="muted">Roll number</td><td><strong>${s.roll}</strong></td></tr><tr><td class="muted">Guardian</td><td><strong>${esc(s.guardian)}</strong></td></tr><tr><td class="muted">Fee status</td><td>${badge(feeStatus(s))}</td></tr></tbody></table>
 <button class="btn btn-blue" style="margin-top:16px" data-goto="myattendance">View attendance report</button> <button class="btn" style="margin-top:16px" data-goto="myfees">View fee details</button></div>${renderNoticePanel()}</div>`;
}
function renderMyProfile(){
 if(currentUser?.role!=="student")return renderDashboard();
 const s=studentById(currentUser.studentId);if(!s)return `<div class="empty">Student profile not found.</div>`;
 return pageHead("My Profile","Your personal and school information.")+`<div class="panel" style="max-width:760px"><div class="person" style="margin:4px 0 22px"><div class="mini-avatar" style="width:58px;height:58px;font-size:17px">${initials(s.name)}</div><div><strong style="font-size:17px">${esc(s.name)}</strong><small>Student ID: ${esc(currentUser.id)}</small></div></div><div class="table-wrap"><table><tbody><tr><td class="muted">Class / Section</td><td><strong>${esc(s.className)}</strong></td></tr><tr><td class="muted">Roll number</td><td><strong>${s.roll}</strong></td></tr><tr><td class="muted">Guardian</td><td><strong>${esc(s.guardian)}</strong></td></tr><tr><td class="muted">Contact</td><td><strong>${esc(s.phone||"Not provided")}</strong></td></tr><tr><td class="muted">Fee status</td><td>${badge(feeStatus(s))}</td></tr></tbody></table></div></div>`;
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
 const isStudent=currentUser.role==="student",s=isStudent?list[0]:null;
 const records=isStudent?store.paymentRecords.filter(r=>r.studentId===s.id):[];
 return pageHead(isStudent?"My Fee Details":"Fee Management",isStudent?"Review your listed fee amounts and current balance.":"Track fee collection and outstanding balances.",isStudent?`<button class="primary" data-action="open-fee-checkout">Pay online →</button>`:currentUser.role==="management"?`<button class="btn" data-action="export-fees">Export CSV</button>`:"")+ 
 `<div class="grid stats">${statCard("Total Fees",money(total),"For displayed students","₹")}${statCard("Collected",money(paid),Math.round(paid/(total||1)*100)+"% collected","✓")}${statCard("Pending",money(pending),"Balance due","◷")}${statCard("Students with balance",list.filter(s=>s.feePaid<s.feeTotal).length,"Fee not fully paid","🎓")}</div>
 <div class="panel"><div class="panel-head"><div><h3>${isStudent?"My fee ledger":"Student fee ledger"}</h3><p>Amounts shown are fictional prototype data.</p></div></div><div class="table-wrap"><table><thead><tr><th>Student</th><th>Class</th><th>Total fee</th><th>Paid</th><th>Balance</th><th>Status</th>${currentUser.role==="management"?"<th>Action</th>":""}</tr></thead><tbody>${list.map(s=>`<tr><td><strong>${esc(s.name)}</strong></td><td>${esc(s.className)}</td><td>${money(s.feeTotal)}</td><td>${money(s.feePaid)}</td><td><strong>${money(s.feeTotal-s.feePaid)}</strong></td><td>${badge(feeStatus(s))}</td>${currentUser.role==="management"?`<td><button class="btn" data-fee="${s.id}">Record payment</button></td>`:""}</tr>`).join("")}</tbody></table></div></div>${isStudent?`<div class="panel"><div class="panel-head"><div><h3>Payment records</h3><p>Payment activity recorded in this demo session.</p></div></div>${records.length?`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Reference</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead><tbody>${records.slice().reverse().map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.reference)}</td><td>${esc(r.method)}</td><td><strong>${money(r.amount)}</strong></td><td>${badge("Recorded")}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">No payment records yet.</div>`}</div>`:""}`;
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
function renderAssignments(){
 if(!["student","teacher"].includes(currentUser?.role))return `<div class="empty">Assignments are available in student and teacher accounts.</div>`;
 const isTeacher=currentUser.role==="teacher",student=isTeacher?null:studentById(currentUser.studentId);
 const list=isTeacher?store.assignments:store.assignments.filter(a=>a.className===student?.className);
 const action=isTeacher?`<button class="primary" data-action="add-assignment">+ Add assignment</button>`:"";
 const cards=list.map(a=>{
  const completion=isTeacher?null:store.assignmentCompletions.find(c=>c.assignmentId===a.id&&c.studentId===student.id);
  const due=new Date(a.dueDate+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
  return `<article class="panel assignment-card"><div class="panel-head"><div><h3>${esc(a.title)}</h3><p>${esc(a.subject)} · ${esc(a.className)}</p></div>${isTeacher?`<button class="btn btn-danger" data-delete-assignment="${a.id}">Remove</button>`:completion?badge("Done"):badge("To do")}</div><p class="assignment-description">${esc(a.description)}</p><div class="assignment-footer"><span class="muted small">Due ${esc(due)}</span>${!isTeacher?(completion?`<span class="muted small">Completed ${esc(completion.completedAt)}</span>`:`<button class="btn btn-blue" data-assignment-done="${a.id}">Mark as done</button>`):""}</div></article>`;
 }).join("");
 return pageHead("Assignments",isTeacher?"Create and manage assignments for each class.":"View assignments for your class and mark completed work as done.",action)+`<div class="assignment-list">${cards||`<div class="panel empty">${isTeacher?"No assignments yet. Add one to get started.":"There are no assignments for your class right now."}</div>`}</div>`;
}
function renderResults(){
 if(!["student","management"].includes(currentUser?.role))return `<div class="empty">Results are available in student and management accounts.</div>`;
 const isStudent=currentUser.role==="student",student=isStudent?studentById(currentUser.studentId):null;
 const list=store.results.filter(r=>!isStudent||r.studentId===student?.id).sort((a,b)=>b.examDate.localeCompare(a.examDate));
 const action=isStudent?`<button class="btn btn-blue" data-action="print-results">Print results</button>`:`<button class="primary" data-action="add-result">+ Add result</button>`;
 const rows=list.map(r=>{const s=studentById(r.studentId),percent=Math.round(r.marks/r.maxMarks*100),date=new Date(r.examDate+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});return `<tr>${!isStudent?`<td><strong>${esc(s?.name||"Student")}</strong><small>${esc(s?.className||"")}</small></td>`:""}<td>${esc(r.examName)}</td><td>${esc(r.subject)}</td><td><strong>${r.marks} / ${r.maxMarks}</strong></td><td>${percent}%</td><td>${esc(date)}</td></tr>`}).join("");
 return pageHead(isStudent?"My Results":"Student Results",isStudent?"View and print results published by school management.":"Add and review student examination results.",action)+`<div class="panel"><div class="panel-head"><div><h3>${isStudent?"Published results":"Results register"}</h3><p>${isStudent?`${list.length} results available for you.`:`${list.length} results recorded.`}</p></div></div>${list.length?`<div class="table-wrap"><table><thead><tr>${!isStudent?"<th>Student</th>":""}<th>Exam</th><th>Subject</th><th>Marks</th><th>Score</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table></div>`:`<div class="empty">${isStudent?"No results have been published for your account yet.":"No results have been added yet."}</div>`}</div>`;
}
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
 document.querySelectorAll("[data-assignment-done]").forEach(b=>b.addEventListener("click",()=>{
  if(currentUser?.role!=="student")return;
  const assignment=store.assignments.find(a=>a.id===Number(b.dataset.assignmentDone)),student=studentById(currentUser.studentId);
  if(!assignment||!student||assignment.className!==student.className||store.assignmentCompletions.some(c=>c.assignmentId===assignment.id&&c.studentId===student.id))return;
  store.assignmentCompletions.push({assignmentId:assignment.id,studentId:student.id,completedAt:new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})});renderPage();
 }));
 document.querySelectorAll("[data-delete-assignment]").forEach(b=>b.addEventListener("click",()=>{
  if(currentUser?.role!=="teacher"||!confirm("Remove this assignment?"))return;
  const id=Number(b.dataset.deleteAssignment);store.assignments=store.assignments.filter(a=>a.id!==id);store.assignmentCompletions=store.assignmentCompletions.filter(c=>c.assignmentId!==id);renderPage();
 }));
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
 if(action==="add-assignment")openAssignmentModal();
 if(action==="add-result")openResultModal();
 if(action==="print-results"&&currentUser?.role==="student")window.print();
 if(action==="open-fee-checkout")openFeeCheckout();
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
function openFeeCheckout(){
 if(currentUser?.role!=="student")return;
 const s=studentById(currentUser.studentId);if(!s)return;
 const records=store.paymentRecords.filter(r=>r.studentId===s.id);
 const data={studentId:s.id,name:s.name,className:s.className,total:s.feeTotal,paid:s.feePaid,balance:Math.max(0,s.feeTotal-s.feePaid),records};
 const tab=window.open("","_blank");
 if(!tab){alert("Please allow pop-ups for this page to open the fee details in a new tab.");return}
 tab.document.open();
 tab.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fee payment · National Academy</title><style>*{box-sizing:border-box}body{margin:0;background:#f3f6fc;color:#172033;font:15px Inter,Segoe UI,Arial,sans-serif}.wrap{max-width:900px;margin:40px auto;padding:0 20px}.brand{color:#14213d;font-size:18px;font-weight:800;margin-bottom:24px}.brand span{color:#3157d5}.head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:22px}.head h1{margin:0 0 7px;font-size:26px}.muted{color:#697586}.layout{display:grid;grid-template-columns:1.1fr .9fr;gap:18px}.card{background:#fff;border:1px solid #e5eaf2;border-radius:16px;padding:22px;margin-bottom:16px}.card h2{font-size:17px;margin:0 0 16px}.summary{display:grid;grid-template-columns:1fr 1fr;gap:12px}.metric{padding:14px;border-radius:12px;background:#f7f9fd}.metric span{display:block;color:#697586;font-size:12px}.metric strong{display:block;margin-top:7px;font-size:21px}.balance{background:#edf2ff}.balance strong{color:#3157d5}.note{padding:12px;border-radius:10px;background:#fff4d9;color:#805b17;font-size:12px;line-height:1.5;margin-bottom:16px}.field{margin:15px 0}.field label{display:block;font-weight:700;font-size:13px;margin-bottom:7px}.field input,.field select{width:100%;padding:12px;border:1px solid #d6deea;border-radius:10px;font:inherit}.primary{width:100%;border:0;border-radius:10px;background:#3157d5;color:white;padding:13px;font:700 14px Inter,Segoe UI,Arial,sans-serif;cursor:pointer}.primary:disabled{opacity:.55;cursor:not-allowed}.records{width:100%;border-collapse:collapse}.records th,.records td{text-align:left;padding:11px 8px;border-bottom:1px solid #edf0f5;font-size:12px}.records th{color:#697586;text-transform:uppercase;font-size:10px}.empty{padding:20px;text-align:center;color:#697586;font-size:13px}.success{color:#16865b;font-size:13px;margin-top:12px}.badge{color:#11764d;background:#e4f7ed;border-radius:20px;padding:4px 8px;font-weight:700;white-space:nowrap}@media(max-width:680px){.wrap{margin:22px auto}.layout{grid-template-columns:1fr}.head h1{font-size:22px}}</style></head><body><main class="wrap"><div class="brand">National <span>Academy</span></div><div class="head"><div><h1>Fee payment</h1><div class="muted">${esc(s.name)} · ${esc(s.className)}</div></div><div class="badge">Student portal</div></div><div class="layout"><section><div class="card"><h2>Fee summary</h2><div class="summary"><div class="metric"><span>Total fees</span><strong id="total"></strong></div><div class="metric"><span>Paid so far</span><strong id="paid"></strong></div><div class="metric balance"><span>Remaining balance</span><strong id="balance"></strong></div><div class="metric"><span>Student ID</span><strong>${esc(currentUser.id)}</strong></div></div></div><div class="card"><h2>Payment records</h2><div id="records"></div></div></section><section class="card"><h2>Pay online</h2><div class="note"><strong>Prototype demo only.</strong> This page is not connected to a bank or payment gateway. Submitting records a simulated payment in this browser; no money is charged.</div><form id="paymentForm"><div class="field"><label for="amount">Payment amount</label><input id="amount" type="number" min="1" step="1" required></div><div class="field"><label for="method">Demo payment method</label><select id="method"><option>UPI (demo)</option><option>Net banking (demo)</option><option>Card (demo)</option></select></div><button class="primary" id="payButton" type="submit">Record demo payment</button><div id="message" class="success" role="status"></div></form></section></div></main></body></html>`);
 tab.document.close();
 const doc=tab.document,money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
 const draw=()=>{
  doc.getElementById("total").textContent=money(data.total);doc.getElementById("paid").textContent=money(data.paid);doc.getElementById("balance").textContent=money(data.balance);
  const amountField=doc.getElementById("amount"),payButton=doc.getElementById("payButton");amountField.max=data.balance;amountField.value=data.balance||"";payButton.disabled=data.balance<=0;
  const host=doc.getElementById("records");host.replaceChildren();
  if(!data.records.length){const empty=doc.createElement("div");empty.className="empty";empty.textContent="No payment records yet.";host.append(empty);return}
  const table=doc.createElement("table");table.className="records";table.innerHTML="<thead><tr><th>Date</th><th>Reference</th><th>Method</th><th>Amount</th></tr></thead><tbody></tbody>";
  const body=table.querySelector("tbody");data.records.slice().reverse().forEach(r=>{const tr=doc.createElement("tr");[r.date,r.reference,r.method,money(r.amount)].forEach(value=>{const td=doc.createElement("td");td.textContent=value;tr.append(td)});body.append(tr)});host.append(table);
 };
 doc.getElementById("paymentForm").addEventListener("submit",event=>{
  event.preventDefault();const amount=Number(doc.getElementById("amount").value);
  if(currentUser?.role!=="student"||currentUser.studentId!==s.id||!Number.isFinite(amount)||amount<=0||amount>data.balance)return;
  const record={studentId:s.id,amount,method:doc.getElementById("method").value,date:new Date().toLocaleDateString("en-GB"),reference:"DEMO-"+Date.now().toString().slice(-8)};
  s.feePaid+=amount;store.paymentRecords.push(record);data.paid+=amount;data.balance-=amount;data.records.push(record);
  doc.getElementById("message").textContent="Demo payment recorded. No money was charged.";draw();
  if(currentPage==="myfees"||currentPage==="dashboard")renderPage();
 });
 draw();
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
function openAssignmentModal(){
 if(currentUser?.role!=="teacher")return;
 const classes=[...new Set(store.students.map(s=>s.className))].sort();
 modal("Add assignment",`<label>Assignment title</label><input name="title" required maxlength="100"><div class="field-row"><div><label>Subject</label><input name="subject" required maxlength="60"></div><div><label>Class</label><select name="className" required>${classes.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("")}</select></div></div><label>Due date</label><input name="dueDate" type="date" min="${todayKey()}" required><label>Instructions</label><textarea name="description" required rows="4" maxlength="1000" style="width:100%;border:1px solid #d6deea;border-radius:10px;padding:12px;font:inherit"></textarea>`);
 document.getElementById("modalForm").onsubmit=e=>{e.preventDefault();if(currentUser?.role!=="teacher")return;const f=new FormData(e.target),assignment={id:Math.max(0,...store.assignments.map(a=>a.id))+1,title:f.get("title").trim(),subject:f.get("subject").trim(),className:f.get("className"),dueDate:f.get("dueDate"),description:f.get("description").trim()};if(!assignment.title||!assignment.subject||!assignment.dueDate||!assignment.description)return;store.assignments.push(assignment);closeModal();renderPage()};
}
function openResultModal(){
 if(currentUser?.role!=="management")return;
 const students=store.students.slice().sort((a,b)=>a.name.localeCompare(b.name));
 modal("Add student result",`<label>Student</label><select name="studentId" required>${students.map(s=>`<option value="${s.id}">${esc(s.name)} · ${esc(s.className)}</option>`).join("")}</select><div class="field-row"><div><label>Exam / assessment</label><input name="examName" required maxlength="80" placeholder="e.g. Term 1 exam"></div><div><label>Subject</label><input name="subject" required maxlength="60"></div><div><label>Marks earned</label><input name="marks" type="number" min="0" step="0.01" required></div><div><label>Maximum marks</label><input name="maxMarks" type="number" min="0.01" step="0.01" required></div></div><label>Exam date</label><input name="examDate" type="date" value="${todayKey()}" required>`);
 document.getElementById("modalForm").onsubmit=e=>{e.preventDefault();if(currentUser?.role!=="management")return;const f=new FormData(e.target),marks=Number(f.get("marks")),maxMarks=Number(f.get("maxMarks"));if(!Number.isFinite(marks)||!Number.isFinite(maxMarks)||maxMarks<=0||marks<0||marks>maxMarks){alert("Marks earned must be between zero and the maximum marks.");return}const examName=f.get("examName").trim(),subject=f.get("subject").trim(),examDate=f.get("examDate");if(!examName||!subject||!examDate)return;store.results.push({id:Math.max(0,...store.results.map(r=>r.id))+1,studentId:Number(f.get("studentId")),examName,subject,marks,maxMarks,examDate});closeModal();renderPage()};
}
function exportCSV(filename,headers,rows){
 const csv=[headers,...rows].map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
 const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}
document.querySelectorAll(".role-choice").forEach(b=>b.addEventListener("click",()=>{selectedRole=b.dataset.role;document.querySelectorAll(".role-choice").forEach(x=>x.classList.toggle("active",x===b));document.getElementById("loginError").textContent=""}));
document.getElementById("loginForm").addEventListener("submit",login);
document.getElementById("logoutBtn").addEventListener("click",logout);
document.getElementById("profileShortcut").addEventListener("click",()=>{if(currentUser?.role==="student")showPage("myprofile")});
document.getElementById("backBtn").addEventListener("click",()=>{if(pageHistory.length)showPage(pageHistory.pop(),false)});
