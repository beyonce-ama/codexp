import{K as $e,r as i,j as e,L as Ee}from"./app-CHGVqS9T.js";import{a as _,A as De,T as C,S as o}from"./app-layout-DgA6-aaM.js";import{C as F}from"./users-NFLexmw2.js";import{c as ae}from"./createLucideIcon-CXwWvQAh.js";import{P as Me}from"./plus-dqOqcsb1.js";import{S as k,X as te}from"./x-CX_OdG6y.js";import{Z as j}from"./zap-ZM8BY20M.js";import{C as Te}from"./chart-column-DpZjjfnA.js";import{S as Fe}from"./search-q9A6cjo9.js";import{F as Be}from"./filter-pwm5--xy.js";import{R as le}from"./refresh-cw-Cd4q_xdK.js";import{T as Le}from"./triangle-alert-DBd3Rq4R.js";import{E as Ie}from"./eye-CdPt3n7W.js";import{S as Ae,T as He}from"./trash-2-DlWc4JmR.js";import"./utils-jAU0Cazi.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Je=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]],Pe=ae("Download",Je);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]],U=ae("Upload",Oe),Ue={width:640,background:"linear-gradient(180deg, #0E1B2E 0%, #0A1527 100%)",color:"#E6F0FF",showConfirmButton:!0,confirmButtonColor:"#22C55E",customClass:{popup:"swal-neo",title:"swal-title-neo",htmlContainer:"swal-html-neo",confirmButton:"swal-confirm-neo"}},R=x=>({...Ue,...x}),Re=[{title:"Home",href:"/dashboard"},{title:"Admin",href:"/dashboard"},{title:"Challenge Management",href:"/admin/challenges"}],qe=(x,y="slate")=>{const u={blue:"bg-blue-500/10 text-blue-300 border-blue-500/30",green:"bg-green-500/10 text-green-300 border-green-500/30",yellow:"bg-yellow-500/10 text-yellow-300 border-yellow-500/30",red:"bg-red-500/10 text-red-300 border-red-500/30",purple:"bg-purple-500/10 text-purple-300 border-purple-500/30",slate:"bg-white/5 text-slate-300 border-white/10"};return e.jsx("span",{className:`px-2 py-0.5 text-[11px] rounded-md border ${u[y]} inline-flex items-center gap-1`,children:x})};function q({title:x,right:y,children:u,className:f=""}){return e.jsxs("div",{className:f,children:[e.jsx("div",{className:"sticky top-6 z-10 mb-3",children:e.jsxs("div",{className:"flex items-center justify-between bg-slate-900/70 border border-white/10 rounded-xl px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50",children:[e.jsx("div",{className:"flex items-center gap-2",children:x}),e.jsx("div",{className:"flex items-center gap-2",children:y})]})}),u]})}function c({icon:x,label:y,value:u,tone:f="slate",hint:p}){const B={blue:"ring-blue-500/20 hover:ring-blue-500/40",green:"ring-green-500/20 hover:ring-green-500/40",yellow:"ring-yellow-500/20 hover:ring-yellow-500/40",red:"ring-red-500/20 hover:ring-red-500/40",purple:"ring-purple-500/20 hover:ring-purple-500/40",slate:"ring-white/10 hover:ring-white/20"};return e.jsx("div",{className:`rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 transition ring-1 ${B[f]}`,children:e.jsxs("div",{className:"flex items-start justify-between gap-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"p-2 rounded-lg border border-white/10 bg-white/5",children:e.jsx(x,{className:"h-5 w-5 text-white/90"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[11px] uppercase tracking-wide text-white/60",children:y}),e.jsx("p",{className:"text-2xl font-bold text-white leading-none",children:u})]})]}),p?qe(p,f):null]})})}const ze={solo:{python:0,java:0,cpp:0,total:0},v1:{python:0,java:0,cpp:0,total:0},soloDiff:{easy:0,medium:0,hard:0},v1Diff:{easy:0,medium:0,hard:0}};function it(){const{props:x}=$e(),y=x==null?void 0:x.activeType,[u,f]=i.useState([]),[p,B]=i.useState(null),[L,z]=i.useState(!0),[n,V]=i.useState("solo"),[v,X]=i.useState(""),[S,se]=i.useState("all"),[$,re]=i.useState("all"),[g,oe]=i.useState(ze),[ie,E]=i.useState(!1),[W,ne]=i.useState("fixbugs"),[I,de]=i.useState("python"),[A,ce]=i.useState("easy"),[w,D]=i.useState([]),[H,Y]=i.useState(!1),Z=t=>t==="cpp"?"C++":(t??"").toUpperCase();i.useMemo(()=>L?"—":u.length,[L,u.length]);const[K,pe]=i.useState(!0),[G,ge]=i.useState(!0),[Q,xe]=i.useState(!0);i.useEffect(()=>{M(),J()},[n,v,S,$]);const M=async()=>{try{z(!0);const t=n==="solo"?"/api/challenges/solo":"/api/challenges/1v1",l={};v.trim()&&(l.search=v.trim()),S!=="all"&&(l.language=S),$!=="all"&&(l.difficulty=$);const r=await _.get(t,l);if(r.success){const a=r.data.data||r.data||[];f(a.map(s=>({...s,type:n})))}else f([])}catch(t){console.error("Error fetching challenges:",t),f([])}finally{z(!1)}},J=async()=>{try{const t=await _.get("/dashboard/stats");if(t.success){const l=t.data;B({total_solo_challenges:l.total_solo_challenges||0,total_1v1_challenges:l.total_1v1_challenges||0,fixbugs_challenges:l.fixbugs_challenges??0,random_challenges:l.random_challenges??0,solo_python_challenges:l.solo_python_challenges??0,solo_java_challenges:l.solo_java_challenges??0,solo_cpp_challenges:l.solo_cpp_challenges??0,duel_python_challenges:l.duel_python_challenges??0,duel_java_challenges:l.duel_java_challenges??0,duel_cpp_challenges:l.duel_cpp_challenges??0,solo_easy:l.solo_easy??0,solo_medium:l.solo_medium??0,solo_hard:l.solo_hard??0,duel_easy:l.duel_easy??0,duel_medium:l.duel_medium??0,duel_hard:l.duel_hard??0}),oe({solo:{python:l.solo_python_challenges??0,java:l.solo_java_challenges??0,cpp:l.solo_cpp_challenges??0,total:l.total_solo_challenges??0},v1:{python:l.duel_python_challenges??0,java:l.duel_java_challenges??0,cpp:l.duel_cpp_challenges??0,total:l.total_1v1_challenges??0},soloDiff:{easy:l.solo_easy??0,medium:l.solo_medium??0,hard:l.solo_hard??0},v1Diff:{easy:l.duel_easy??0,medium:l.duel_medium??0,hard:l.duel_hard??0}})}}catch(t){console.error("Error fetching stats:",t)}},ue=async t=>{if((await o.fire({title:"Delete Challenge?",text:"This action cannot be undone.",icon:"warning",showCancelButton:!0,confirmButtonColor:"#d33",cancelButtonColor:"#3085d6",confirmButtonText:"Yes, delete it!"})).isConfirmed)try{const r=n==="solo"?`/api/challenges/solo/${t}`:`/api/challenges/1v1/${t}`;(await _.delete(r)).success&&(f(u.filter(s=>s.id!==t)),J(),o.fire("Deleted!","Challenge has been deleted.","success"))}catch(r){console.error("Error deleting challenge:",r)}},he=t=>{if(!t)return;if(!t.name.endsWith(".json")){o.fire("Invalid File Type","Please select a JSON file (.json)","error");return}if(t.size>10*1024*1024){o.fire("File Too Large","File size must be less than 10MB","error");return}const l=new FileReader;l.onload=r=>{var a;try{const s=JSON.parse((a=r.target)==null?void 0:a.result);if(Array.isArray(s)){if(s.length===0){o.fire("Empty File","The JSON file contains no challenges.","warning");return}if(s.length>1e3){o.fire("Too Many Items","Maximum 1000 challenges can be imported at once.","error");return}D(s),o.fire({icon:"success",title:"File Loaded",text:`Successfully loaded ${s.length} challenges from ${t.name}`,timer:2e3,showConfirmButton:!1})}else o.fire("Invalid Format","File must contain an array of challenges.","error")}catch(s){console.error("JSON parse error:",s),o.fire("Invalid JSON","Unable to parse JSON file. Please check the file format.","error")}},l.onerror=()=>o.fire("File Read Error","Unable to read the file.","error"),l.readAsText(t)},me=async t=>{if(t.preventDefault(),w.length===0){o.fire("No Data","Please upload a JSON file or paste valid challenge array.","error");return}try{Y(!0);const l=n==="solo"?"/api/challenges/solo/import":"/api/challenges/1v1/import",r=n==="solo"?{mode:W,language:I,difficulty:A,items:w,source_file:"manual_import"}:{language:I,difficulty:A,items:w,source_file:"manual_import"},a=await _.post(l,r);a.success?(E(!1),D([]),M(),J(),o.fire({icon:"success",title:"Import Successful!",text:`Successfully imported ${a.count||w.length} challenges.`,timer:3e3,showConfirmButton:!1})):o.fire({icon:"error",title:"Import Failed",text:a.message||"Unknown error occurred during import.",footer:a.errors?`Details: ${JSON.stringify(a.errors)}`:""})}catch(l){console.error("Error importing challenges:",l),o.fire({icon:"error",title:"Network Error",text:"An error occurred while importing challenges. Please check your connection and try again."})}finally{Y(!1)}},be=()=>Ce(n),fe=t=>_e(t),ye=t=>Ne(t,n),ve=t=>{const l=n==="solo"?`/admin/challenges/solo/${t}/export`:`/admin/challenges/1v1/${t}/export`;window.open(l,"_blank")},we=t=>t==="easy"?"bg-green-500/10 text-green-300 border-green-500/30":t==="medium"?"bg-yellow-500/10 text-yellow-300 border-yellow-500/30":t==="hard"?"bg-red-500/10 text-red-300 border-red-500/30":"bg-white/5 text-slate-300 border-white/10",je=t=>t==="fixbugs"?Le:t==="random"?j:F,d=t=>String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),T=(t,l)=>`
  <span class="inline-flex items-center gap-2 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-slate-200">
    <span class="text-[10px] uppercase tracking-wide opacity-70">${d(t)}</span>
    <span class="font-semibold">${d(l)}</span>
  </span>`,P=(t,l)=>{const r=`code_${Math.random().toString(36).slice(2)}`;return`
    <div class="rounded-lg border border-cyan-500/30 bg-slate-950/70 p-3">
      <div class="flex items-center justify-between mb-2">
        <div class="text-[10px] uppercase tracking-wide opacity-70">${d(t)}</div>
        <button type="button" class="neo-copy px-2 py-1 text-xs rounded-md border border-cyan-500/30 hover:bg-cyan-500/10 transition" data-target="${r}">
          Copy
        </button>
      </div>
      <pre id="${r}" class="text-[12px] overflow-auto max-h-72 leading-[1.35]"><code>${d(l)}</code></pre>
    </div>`},O=t=>`
  <div class="rounded-xl overflow-hidden border border-white/10 bg-slate-900/80">
    <div class="bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        ${t.icon?`<div class="text-white/90 text-xl">${d(t.icon)}</div>`:""}
        <div>
          <div class="text-white font-semibold">${d(t.title)}</div>
          ${t.subtitle?`<div class="text-white/80 text-xs">${d(t.subtitle)}</div>`:""}
        </div>
      </div>
      ${t.right??""}
    </div>
    <div class="p-4 md:p-5 space-y-4">${t.bodyHTML}</div>
  </div>`,_e=t=>{const r=`
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">${[t.language?T("Language",Z(String(t.language))):"",t.difficulty?T("Difficulty",String(t.difficulty).toUpperCase()):"",t.mode?T("Mode",String(t.mode)):"",t.reward_xp!=null?T("Reward",String(t.reward_xp)):""].filter(Boolean).join(" ")}</div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div class="md:col-span-5">
          <div class="rounded-lg border border-white/10 bg-white/5 p-3 h-full">
            <div class="text-[10px] uppercase tracking-wide opacity-70 mb-1">Description</div>
            <div class="text-sm leading-relaxed">${d(t.description??"—")}</div>
          </div>
        </div>

        <div class="md:col-span-7 space-y-3">
          ${t.buggy_code?P("Buggy Code",t.buggy_code):""}
          ${t.fixed_code?P("Fixed Code",t.fixed_code):""}
          ${t.hint?P("Hint",t.hint):""}
        </div>
      </div>
    </div>
  `;o.fire(R({width:960,html:O({icon:"👀",title:t.title||"View Challenge",subtitle:`Created ${new Date(t.created_at??Date.now()).toLocaleString()}`,bodyHTML:r}),confirmButtonText:"Close",customClass:{popup:"rounded-2xl !p-0 backdrop-blur-sm",confirmButton:"swal2-confirm !bg-cyan-600 hover:!bg-cyan-500 !rounded-lg !px-4 !py-2"},didOpen:()=>{document.querySelectorAll(".neo-copy").forEach(a=>{a.addEventListener("click",()=>{var h;const s=a.getAttribute("data-target"),m=((h=document.getElementById(s))==null?void 0:h.innerText)??"";navigator.clipboard.writeText(m);const b=a.textContent;a.textContent="Copied",setTimeout(()=>a.textContent=b,900)})})}}))},Ne=(t,l)=>{const r=l==="solo",a=`
    <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
      <div class="md:col-span-7 space-y-3">
        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="f_title" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Title</label>
          <input id="f_title" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2" value="${d(t.title)}" />
        </div>

        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="f_desc" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Description</label>
          <textarea id="f_desc" rows="3" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">${d(t.description??"")}</textarea>
        </div>

        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label for="f_lang" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Language</label>
              <select id="f_lang" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">
                <option value="python" ${t.language==="python"?"selected":""}>Python</option>
                <option value="java" ${t.language==="java"?"selected":""}>Java</option>
                <option value="cpp"    ${t.language==="cpp"?"selected":""}>C++</option>
              </select>
            </div>
            <div>
              <label for="f_diff" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Difficulty</label>
              <select id="f_diff" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">
                <option value="easy" ${t.difficulty==="easy"?"selected":""}>Easy</option>
                <option value="medium" ${t.difficulty==="medium"?"selected":""}>Medium</option>
                <option value="hard" ${t.difficulty==="hard"?"selected":""}>Hard</option>
              </select>
            </div>
            ${r?`
            <div>
              <label for="f_mode" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Mode</label>
              <select id="f_mode" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">
                <option value="fixbugs" ${t.mode==="fixbugs"?"selected":""}>Fix Bugs</option>
              </select>
            </div>
            <div>
              <label for="f_reward" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Reward XP</label>
              <input id="f_reward" type="number" step="1" min="0" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2" value="${d(t.reward_xp??0)}" />
            </div>`:""}
          </div>
        </div>
      </div>

      <div class="md:col-span-5 space-y-3">
        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="f_bug" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Buggy Code</label>
          <textarea id="f_bug" rows="7" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2 font-mono text-[12px] leading-[1.35]">${d(t.buggy_code??"")}</textarea>
        </div>

        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="f_fix" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Fixed Code</label>
          <textarea id="f_fix" rows="7" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2 font-mono text-[12px] leading-[1.35]">${d(t.fixed_code??"")}</textarea>

          ${r?`
          <label for="f_hint" class="block text-[10px] uppercase tracking-wide mt-3 mb-1 opacity-70">Hint</label>
          <textarea id="f_hint" rows="2" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">${d(t.hint??"")}</textarea>`:""}
        </div>
      </div>
    </div>
  `;o.fire(R({width:960,html:O({icon:"✏️",title:"Edit Challenge",subtitle:t.title?`Editing “${t.title}”`:"Update fields below",bodyHTML:a}),showCancelButton:!0,confirmButtonText:"Save",customClass:{popup:"rounded-2xl !p-0 backdrop-blur-sm",confirmButton:"swal2-confirm !bg-emerald-600 hover:!bg-emerald-500 !rounded-lg !px-4 !py-2",cancelButton:"swal2-cancel !bg-white/10 hover:!bg-white/20 !text-white !rounded-lg !px-4 !py-2",actions:"!px-5 !pb-4"},focusConfirm:!1,preConfirm:()=>{var b;const s=h=>{var N,ee;return((ee=(N=document.getElementById(h))==null?void 0:N.value)==null?void 0:ee.trim())??""},m={title:s("f_title"),description:s("f_desc"),language:s("f_lang"),difficulty:s("f_diff"),buggy_code:s("f_bug"),fixed_code:s("f_fix")};if(r){m.mode=s("f_mode")||"fixbugs",m.hint=s("f_hint");const h=Number(((b=document.getElementById("f_reward"))==null?void 0:b.value)||"0");m.reward_xp=Number.isFinite(h)&&h>=0?Math.floor(h):0}return m.title?m:(o.showValidationMessage("Title is required"),!1)}})).then(s=>{s.isConfirmed&&ke(t.id,s.value,y||l)})},Ce=t=>{const l=t==="solo",r=`
    <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
      <div class="md:col-span-7 space-y-3">
        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="c_title" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Title</label>
          <input id="c_title" placeholder="Awesome challenge name" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2" />
        </div>

        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="c_desc" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Description</label>
          <textarea id="c_desc" rows="3" placeholder="Short description..." class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2"></textarea>
        </div>

        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label for="c_lang" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Language</label>
              <select id="c_lang" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <div>
              <label for="c_diff" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Difficulty</label>
              <select id="c_diff" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            ${l?`
            <div>
              <label for="c_mode" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Mode</label>
              <select id="c_mode" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2">
                <option value="fixbugs">Fix Bugs</option>
              </select>
            </div>
            <div>
              <label for="c_reward" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Reward XP</label>
              <input id="c_reward" type="number" step="1" min="0" value="0" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2" />
            </div>`:""}
          </div>
        </div>
      </div>

      <div class="md:col-span-5 space-y-3">
        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="c_bug" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Buggy Code</label>
          <textarea id="c_bug" rows="7" placeholder="// buggy snippet here" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2 font-mono text-[12px] leading-[1.35]"></textarea>
        </div>

        <div class="rounded-lg border border-white/10 bg-white/5 p-3">
          <label for="c_fix" class="block text-[10px] uppercase tracking-wide opacity-70 mb-1">Fixed Code</label>
          <textarea id="c_fix" rows="7" placeholder="// fixed snippet here" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2 font-mono text-[12px] leading-[1.35]"></textarea>

          ${l?`
          <label for="c_hint" class="block text-[10px] uppercase tracking-wide mt-3 mb-1 opacity-70">Hint</label>
          <textarea id="c_hint" rows="2" placeholder="Small hint (optional)" class="w-full bg-slate-950/70 border border-white/15 rounded-lg text-slate-100 px-3 py-2"></textarea>`:""}
        </div>
      </div>
    </div>
  `;o.fire(R({width:960,html:O({icon:"✨",title:`Create ${l?"Solo":"1v1"} Challenge`,bodyHTML:r}),showCancelButton:!0,confirmButtonText:"Create",customClass:{popup:"rounded-2xl !p-0 backdrop-blur-sm",confirmButton:"swal2-confirm !bg-emerald-600 hover:!bg-emerald-500 !rounded-lg !px-4 !py-2",cancelButton:"swal2-cancel !bg-white/10 hover:!bg-white/20 !text-white !rounded-lg !px-4 !py-2",actions:"!px-5 !pb-4"},focusConfirm:!1,preConfirm:()=>{var m;const a=b=>{var h,N;return((N=(h=document.getElementById(b))==null?void 0:h.value)==null?void 0:N.trim())??""},s={title:a("c_title"),description:a("c_desc"),language:a("c_lang"),difficulty:a("c_diff"),buggy_code:a("c_bug"),fixed_code:a("c_fix")};if(l){s.mode=a("c_mode")||"fixbugs",s.hint=a("c_hint");const b=Number(((m=document.getElementById("c_reward"))==null?void 0:m.value)||"0");s.reward_xp=Number.isFinite(b)&&b>=0?Math.floor(b):0}return s.title?s:(o.showValidationMessage("Title is required"),!1)}})).then(a=>{a.isConfirmed&&Se(a.value,y||t)})},ke=async(t,l,r)=>{const a=r==="solo"?"/api/challenges/solo":"/api/challenges/1v1",s=await _.put(`${a}/${t}`,l);s!=null&&s.success?(o.fire("Saved!","Challenge updated.","success"),M()):o.fire("Error",(s==null?void 0:s.message)||"Update failed","error")},Se=async(t,l)=>{const r=l==="solo"?"/admin/challenges/api/challenges/solo":"/admin/challenges/api/challenges/1v1",a=await _.post(r,t);a!=null&&a.success?(o.fire("Created!","Challenge created.","success"),M()):o.fire("Error",(a==null?void 0:a.message)||"Create failed","error")};return e.jsx("div",{className:"min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative",children:e.jsxs(De,{breadcrumbs:Re,children:[e.jsx(Ee,{title:"Challenge Management"}),e.jsxs("div",{className:"p-4 space-y-6",children:[e.jsx("div",{className:"rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/20 to-indigo-600/10 p-4 backdrop-blur",children:e.jsxs("div",{className:"flex flex-col md:flex-row md:items-center md:justify-between gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"p-2 rounded-lg bg-white/10 border border-white/10",children:e.jsx(F,{className:"h-5 w-5 text-white"})}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-xl md:text-2xl font-bold text-white leading-tight",children:"Challenge Management"}),e.jsx("p",{className:"text-white/80 text-sm",children:"Create, curate, and manage coding challenges"})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{onClick:()=>E(!0),className:"inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500",children:[e.jsx(U,{className:"h-4 w-4"}),e.jsx("span",{children:"Import"})]}),e.jsxs("button",{onClick:be,className:"inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500",children:[e.jsx(Me,{className:"h-4 w-4"}),e.jsx("span",{children:"Create"})]})]})]})}),e.jsx("div",{className:"bg-white/5 border border-white/10 rounded-xl p-2 backdrop-blur-sm",children:e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("button",{onClick:()=>V("solo"),className:`flex items-center gap-2 px-4 py-2 rounded-lg transition ${n==="solo"?"bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg":"bg-white/5 text-gray-200 hover:bg-white/10"}`,children:[e.jsx(C,{className:"h-5 w-5"}),e.jsx("span",{className:"font-medium",children:"Solo"}),p&&e.jsx("span",{className:"bg-black/20 px-2 py-0.5 rounded-full text-xs",children:p.total_solo_challenges})]}),e.jsxs("button",{onClick:()=>V("1v1"),className:`flex items-center gap-2 px-4 py-2 rounded-lg transition ${n==="1v1"?"bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg":"bg-white/5 text-gray-200 hover:bg-white/10"}`,children:[e.jsx(k,{className:"h-5 w-5"}),e.jsx("span",{className:"font-medium",children:"1v1"}),p&&e.jsx("span",{className:"bg-black/20 px-2 py-0.5 rounded-full text-xs",children:p.total_1v1_challenges})]})]})}),e.jsx(q,{title:e.jsxs(e.Fragment,{children:[e.jsx(Te,{className:"h-5 w-5 text-green-300"}),e.jsx("span",{className:"text-white font-semibold",children:"Overview"})]}),right:e.jsx("button",{onClick:()=>pe(t=>!t),className:"text-xs inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 text-slate-200 hover:bg-white/5",children:K?"Hide":"Show"}),children:K&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3",children:[e.jsx(c,{icon:C,label:"Solo",value:(p==null?void 0:p.total_solo_challenges)??0,tone:"blue",hint:"All time"}),e.jsx(c,{icon:k,label:"1v1",value:(p==null?void 0:p.total_1v1_challenges)??0,tone:"purple",hint:"All time"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mt-3",children:[e.jsx(c,{icon:C,label:"Solo • Python",value:g.solo.python,tone:"blue"}),e.jsx(c,{icon:C,label:"Solo • Java",value:g.solo.java,tone:"blue"}),e.jsx(c,{icon:C,label:"Solo • C++",value:g.solo.cpp,tone:"blue"}),e.jsx(c,{icon:k,label:"1v1 • Python",value:g.v1.python,tone:"purple"}),e.jsx(c,{icon:k,label:"1v1 • Java",value:g.v1.java,tone:"purple"}),e.jsx(c,{icon:k,label:"1v1 • C++",value:g.v1.cpp,tone:"purple"})]}),e.jsxs("div",{className:"mt-4",children:[e.jsx("div",{className:"text-xs uppercase tracking-wide text-white/60 mb-2",children:"Solo difficulty"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-3",children:[e.jsx(c,{icon:j,label:"Solo • Easy",value:g.soloDiff.easy,tone:"green"}),e.jsx(c,{icon:j,label:"Solo • Medium",value:g.soloDiff.medium,tone:"yellow"}),e.jsx(c,{icon:j,label:"Solo • Hard",value:g.soloDiff.hard,tone:"red"})]})]}),e.jsxs("div",{className:"mt-4",children:[e.jsx("div",{className:"text-xs uppercase tracking-wide text-white/60 mb-2",children:"1v1 difficulty"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-3",children:[e.jsx(c,{icon:j,label:"1v1 • Easy",value:g.v1Diff.easy,tone:"green"}),e.jsx(c,{icon:j,label:"1v1 • Medium",value:g.v1Diff.medium,tone:"yellow"}),e.jsx(c,{icon:j,label:"1v1 • Hard",value:g.v1Diff.hard,tone:"red"})]})]})]})}),e.jsx(q,{title:e.jsxs(e.Fragment,{children:[e.jsx(Be,{className:"h-5 w-5 text-cyan-300"}),e.jsx("span",{className:"text-white font-semibold",children:"Filters"})]}),right:e.jsx("button",{onClick:()=>ge(t=>!t),className:"text-xs inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 text-slate-200 hover:bg-white/5",children:G?"Hide":"Show"}),children:G&&e.jsx("div",{className:"bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm",children:e.jsxs("div",{className:"flex flex-col md:flex-row gap-4",children:[e.jsx("div",{className:"flex-1",children:e.jsxs("div",{className:"relative",children:[e.jsx(Fe,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"}),e.jsx("input",{type:"text",placeholder:"Search challenges by title or description…",value:v,onChange:t=>X(t.target.value),className:"w-full pl-10 pr-10 py-3 bg-slate-950/60 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-gray-400"}),v&&e.jsx("button",{onClick:()=>X(""),className:"absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200","aria-label":"Clear search",children:e.jsx(te,{className:"h-4 w-4"})})]})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:S,onChange:t=>se(t.target.value),className:"px-4 py-3 bg-slate-950/60 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200",children:[e.jsx("option",{value:"all",children:"All Languages"}),e.jsx("option",{value:"python",children:"Python"}),e.jsx("option",{value:"java",children:"Java"}),e.jsx("option",{value:"cpp",children:"C++"})]}),e.jsxs("select",{value:$,onChange:t=>re(t.target.value),className:"px-4 py-3 bg-slate-950/60 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200",children:[e.jsx("option",{value:"all",children:"All Difficulties"}),e.jsx("option",{value:"easy",children:"Easy"}),e.jsx("option",{value:"medium",children:"Medium"}),e.jsx("option",{value:"hard",children:"Hard"})]})]})]})})}),e.jsx(q,{title:e.jsxs(e.Fragment,{children:[e.jsx(F,{className:"h-5 w-5 text-pink-300"}),e.jsx("span",{className:"text-white font-semibold",children:"Challenges"})]}),right:e.jsx("button",{onClick:()=>xe(t=>!t),className:"text-xs inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 text-slate-200 hover:bg-white/5",children:Q?"Hide":"Show"}),children:Q&&e.jsx("div",{className:"overflow-x-auto bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm",children:e.jsxs("table",{className:"w-full",children:[e.jsx("thead",{className:"bg-slate-950/50",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase",children:"Challenge"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase",children:"Language"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase",children:"Difficulty"}),n==="solo"&&e.jsx("th",{className:"px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase",children:"Mode"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-bold text-cyan-400 uppercase",children:"Created"}),e.jsx("th",{className:"px-6 py-3 text-right text-xs font-bold text-cyan-400 uppercase",children:"Actions"})]})}),e.jsx("tbody",{className:"divide-y divide-white/10",children:L?e.jsx("tr",{children:e.jsx("td",{colSpan:6,className:"px-6 py-12 text-center text-gray-400",children:e.jsxs("div",{className:"flex items-center justify-center",children:[e.jsx(le,{className:"h-5 w-5 animate-spin mr-2 text-cyan-400"}),"Loading challenges…"]})})}):u.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:6,className:"px-6 py-12 text-center text-gray-400",children:v?`No challenges found matching “${v}”`:"No challenges found"})}):u.map(t=>{const l=je(t.mode||"");return e.jsxs("tr",{className:"hover:bg-white/5 transition-colors",children:[e.jsx("td",{className:"px-6 py-4",children:e.jsxs("div",{className:"max-w-xl",children:[e.jsx("div",{className:"text-sm font-semibold text-white",children:t.title}),t.description&&e.jsx("div",{className:"text-xs text-gray-400 truncate",children:t.description})]})}),e.jsx("td",{className:"px-6 py-4",children:e.jsx("span",{className:"px-2 py-1 text-xs font-semibold rounded-full border bg-blue-500/10 text-blue-300 border-blue-500/30",children:Z(t.language)})}),e.jsx("td",{className:"px-6 py-4",children:e.jsx("span",{className:`px-2 py-1 text-xs font-semibold rounded-full border ${we(t.difficulty)}`,children:t.difficulty.toUpperCase()})}),n==="solo"&&e.jsx("td",{className:"px-6 py-4",children:e.jsxs("div",{className:"flex items-center gap-1 text-sm text-gray-300",children:[e.jsx(l,{className:"h-4 w-4 text-gray-400"}),e.jsx("span",{className:"capitalize",children:t.mode})]})}),e.jsx("td",{className:"px-6 py-4 text-sm text-gray-400",children:new Date(t.created_at).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}),e.jsx("td",{className:"px-6 py-4",children:e.jsxs("div",{className:"flex justify-end gap-1",children:[e.jsx("button",{onClick:()=>fe(t),className:"p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition",title:"View",children:e.jsx(Ie,{className:"h-4 w-4"})}),e.jsx("button",{onClick:()=>ye(t),className:"p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 rounded-lg transition",title:"Edit",children:e.jsx(Ae,{className:"h-4 w-4"})}),e.jsx("button",{onClick:()=>ve(t.id),className:"p-2 text-gray-300 hover:text-gray-100 hover:bg-gray-900/30 rounded-lg transition",title:"Download",children:e.jsx(Pe,{className:"h-4 w-4"})}),e.jsx("button",{onClick:()=>ue(t.id),className:"p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition",title:"Delete",children:e.jsx(He,{className:"h-4 w-4"})})]})})]},t.id)})})]})})}),ie&&e.jsx("div",{className:"fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50",children:e.jsxs("div",{className:"bg-gray-800/90 border border-gray-700/50 rounded-xl w-full max-w-2xl",children:[e.jsxs("div",{className:"bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 flex justify-between items-center",children:[e.jsxs("h3",{className:"text-lg font-bold text-white flex items-center",children:[e.jsx(U,{className:"h-5 w-5 mr-2"}),"Import ",n==="solo"?"Solo":"1v1"," Challenges"]}),e.jsx("button",{onClick:()=>{E(!1),D([])},className:"text-white hover:text-gray-200",children:e.jsx(te,{className:"h-5 w-5"})})]}),e.jsxs("form",{onSubmit:me,className:"p-6 space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[n==="solo"&&e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Mode"}),e.jsx("select",{value:W,onChange:t=>ne(t.target.value),className:"w-full px-3 py-2 bg-gray-900 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500",children:e.jsx("option",{value:"fixbugs",children:"Fix Bugs"})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Language"}),e.jsxs("select",{value:I,onChange:t=>de(t.target.value),className:"w-full px-3 py-2 bg-gray-900 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500",children:[e.jsx("option",{value:"python",children:"Python"}),e.jsx("option",{value:"java",children:"Java"}),e.jsx("option",{value:"cpp",children:"C++"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Difficulty"}),e.jsxs("select",{value:A,onChange:t=>ce(t.target.value),className:"w-full px-3 py-2 bg-gray-900 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500",children:[e.jsx("option",{value:"easy",children:"Easy"}),e.jsx("option",{value:"medium",children:"Medium"}),e.jsx("option",{value:"hard",children:"Hard"})]})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Upload JSON File"}),e.jsx("input",{type:"file",accept:".json",onChange:t=>t.target.files&&he(t.target.files[0]),className:"w-full text-gray-200 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500"}),e.jsx("p",{className:"text-xs text-gray-400 mt-1",children:"Upload a JSON file containing an array of challenge objects"})]}),e.jsxs("div",{className:"rounded-lg border border-gray-700 bg-gray-900/60 p-4",children:[e.jsxs("h4",{className:"text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2",children:[e.jsx(F,{className:"h-4 w-4"})," Expected JSON Format"]}),e.jsxs("p",{className:"text-xs text-gray-300 mb-3",children:["Each JSON file should contain an ",e.jsx("strong",{children:"array of challenge objects"}),". Every object must include the following fields:"]}),e.jsx("pre",{className:"text-xs bg-black/40 border border-gray-700 rounded-lg p-3 text-gray-200 font-mono overflow-x-auto",children:`[
  {
    "difficulty": "easy",
    "language": "python",
    "title": "Sum of Two Numbers",
    "description": "The program should take two integers as input and print their sum.",
    "buggy_code": "a = 5\\nb = 7\\nprint('Sum is:', a + b",
    "fixed_code": "a = 5\\nb = 7\\nprint('Sum is:', a + b)",
    "hint": "Check the missing parenthesis in print statement"
  }
]`}),e.jsx("p",{className:"text-xs text-gray-400 mt-2",children:"You can export an existing challenge to see the full structure."}),w.length>0&&e.jsx("div",{className:"mt-3",children:e.jsxs("p",{className:"text-xs text-green-400",children:["✅ Loaded ",e.jsx("strong",{children:w.length})," challenges from file."]})})]}),e.jsxs("div",{className:"flex justify-end gap-3",children:[e.jsx("button",{type:"button",onClick:()=>{E(!1),D([])},className:"px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition",children:"Cancel"}),e.jsxs("button",{type:"submit",disabled:H||w.length===0,className:"flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50",children:[H?e.jsx(le,{className:"h-4 w-4 animate-spin"}):e.jsx(U,{className:"h-4 w-4"}),e.jsx("span",{children:H?"Importing…":"Import Challenges"})]})]})]})]})})]})]})})}export{it as default};
