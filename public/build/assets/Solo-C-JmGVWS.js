import{K as Ge,r as i,j as e,L as Je}from"./app-C5CTNmtl.js";import{b as m,a as w,A as Ke,T as re,C as Qe}from"./app-layout-DdQ9I-30.js";import{S as f}from"./sweetalert2.esm.all-acGi8jXx.js";import{A as Ve}from"./AnimatedBackground-Bm_ow9bj.js";import{C as le}from"./crown-DsYIhjMZ.js";import{S as we}from"./sparkles-l5CM2JbU.js";import{T as je}from"./trophy-DJzPe36u.js";import{C as Ze}from"./circle-check-big-ICkHVkM3.js";import{S as et}from"./search-CU81xoIG.js";import{R as Ne}from"./refresh-cw-Dk3x_NXW.js";import{L as ke}from"./lightbulb-D9v2z3s4.js";import{P as tt}from"./play-DGndtN7K.js";import{B as st}from"./x-Z9BG0lnd.js";import{S as at}from"./send-TqW-wXY0.js";import{T as rt}from"./triangle-alert-vDRLPruu.js";import{Z as lt}from"./zap-DV7ApjB_.js";import"./utils-jAU0Cazi.js";import"./createLucideIcon-Crh6R9AJ.js";import"./users-CZbq84-z.js";const ot=[{title:"Home",href:"/dashboard"},{title:"Practice",href:"#"},{title:"Solo Challenge",href:"/play/solo"}],x={panelClass:"rounded-xl border",panelStyle:{background:"var(--panel-bg, rgba(17,24,39,0.50))",borderColor:"var(--panel-border, rgba(75,85,99,0.50))",backdropFilter:"blur(6px)"},chipClass:"px-2 py-1 text-xs font-semibold rounded-full border",chipBlueStyle:{background:"var(--chip-blue-bg, rgba(30,58,138,0.30))",borderColor:"var(--chip-blue-border, rgba(59,130,246,0.50))",color:"var(--chip-blue-text, #93c5fd)"},chipEasyStyle:{background:"var(--chip-easy-bg, rgba(6,78,59,0.30))",borderColor:"var(--chip-easy-border, rgba(16,185,129,0.50))",color:"var(--chip-easy-text, #86efac)"},chipMedStyle:{background:"var(--chip-med-bg, rgba(113,63,18,0.30))",borderColor:"var(--chip-med-border, rgba(234,179,8,0.50))",color:"var(--chip-med-text, #fde68a)"},chipHardStyle:{background:"var(--chip-hard-bg, rgba(127,29,29,0.30))",borderColor:"var(--chip-hard-border, rgba(248,113,113,0.50))",color:"var(--chip-hard-text, #fca5a5)"},btnPrimaryClass:"rounded-lg shadow-lg hover:scale-110 transition-all duration-300",btnPrimaryStyle:{background:"var(--btn-primary, linear-gradient(90deg,#06b6d4,#2563eb))",color:"var(--btn-primary-text, #fff)"}},it={python:"Python",java:"Java",cpp:"C++"},_e=v=>it[v]??v.toUpperCase();function At(){const{auth:v}=Ge().props;v==null||v.user;const[oe,ie]=i.useState([]),[c,q]=i.useState(null),[Ce,ne]=i.useState(!0),[nt,ce]=i.useState(!0),[X,ct]=i.useState("all"),[C,Se]=i.useState("all"),[S,Ee]=i.useState("all"),[E,Le]=i.useState(""),[l,H]=i.useState(null),[j,D]=i.useState(!1),[g,L]=i.useState(""),[A,Y]=i.useState(!1),[b,F]=i.useState(0),[O,R]=i.useState(null),[M,W]=i.useState(!1),[h,G]=i.useState(null),[dt,J]=i.useState(!1),[T,de]=i.useState([]),[Ae,K]=i.useState(!1),[Fe,Q]=i.useState(!1),[Me,me]=i.useState(!1),[Te,V]=i.useState(!1),[Pe,Z]=i.useState(!1),[Be,pe]=i.useState(!1),P=i.useRef(),[Ie,ue]=i.useState({});i.useEffect(()=>{j?document.body.classList.add("modal-open"):document.body.classList.remove("modal-open")},[j]),i.useEffect(()=>{m.registerSfx("success","/sounds/correct.mp3"),m.registerSfx("failure","/sounds/failure.mp3"),m.registerSfx("levelup","/sounds/levelup.mp3"),m.registerSfx("click","/sounds/click.mp3"),m.registerSfx("hover","/sounds/hover.mp3"),m.registerSfx("victory","/sounds/victory.mp3"),m.registerSfx("streak","/sounds/streak.mp3"),m.registerSfx("typing","/sounds/typing.mp3")},[]);const ee=t=>Math.floor(t/10)+1,te=t=>10-t%10,xe=t=>t%10/10*100,fe=t=>t%10;i.useEffect(()=>{I(),$(),B()},[X,C,S,E]),i.useEffect(()=>{const t=!!(j&&l);try{window.__modalOpen=t,window.dispatchEvent(new CustomEvent("app:modal",{detail:{open:t}}))}catch{}const a=document.documentElement;return t?a.classList.add("overflow-hidden"):a.classList.remove("overflow-hidden"),()=>a.classList.remove("overflow-hidden")},[j,l]),i.useEffect(()=>{let t;return O&&(t=setInterval(()=>{F(Math.floor((Date.now()-O.getTime())/1e3))},1e3)),()=>{t&&clearInterval(t)}},[O]),i.useEffect(()=>{if(T.length>0){const t=()=>{de(a=>a.map(s=>({...s,x:s.x+s.vx,y:s.y+s.vy,vy:s.vy-.15,life:s.life-1,size:s.size*.99})).filter(s=>s.life>0)),T.length>0&&(P.current=requestAnimationFrame(t))};P.current=requestAnimationFrame(t)}return()=>{P.current&&cancelAnimationFrame(P.current)}},[T.length]);const B=async()=>{try{const t=await w.get("/api/solo/taken");if(t.success){const a=(t.data||[]).reduce((s,n)=>(s[n.challenge_id]=n.status,s),{});ue(a)}}catch(t){console.error("Error fetching taken rows:",t),ue({})}},I=async()=>{try{ne(!0);const t={};X!=="all"&&(t.mode=X),C!=="all"&&(t.language=C),S!=="all"&&(t.difficulty=S),E.trim()&&(t.search=E.trim());const a=await w.get("/api/challenges/solo",t);if(a.success){const s=a.data.data||a.data||[];ie(s)}}catch(t){console.error("Error fetching challenges:",t),ie([])}finally{ne(!1)}},$=async()=>{var t,a,s;try{ce(!0);const n=await w.get("/api/me/stats");if(n.success&&n.data){const r=n.data,p=((t=r.totals)==null?void 0:t.xp)||0;let o=[];if(r.completed_challenge_ids&&Array.isArray(r.completed_challenge_ids))o=r.completed_challenge_ids;else if((a=r.solo_stats)!=null&&a.completed_challenge_ids)o=r.solo_stats.completed_challenge_ids;else if(r.attempts){const d=r.attempts.filter(u=>u.is_correct);o=[...new Set(d.map(u=>u.challenge_id))]}else{const d=["completed_challenges","solo_completed_challenges","successful_challenge_ids","completed_solo_challenges"];for(const u of d)if(r[u]&&Array.isArray(r[u])){o=r[u],console.log(`Found completed challenges in field: ${u}`);break}}q({solo_attempts:r.solo_attempts||0,successful_attempts:r.successful_attempts||o.length,total_xp:p,total_stars:((s=r.totals)==null?void 0:s.stars)||0,attempts_today:r.attempts_today||0,current_level:ee(p),xp_to_next_level:te(p),completed_challenge_ids:o,streak:r.streak||0})}}catch(n){console.error("Error fetching user stats:",n),q({solo_attempts:0,successful_attempts:0,total_xp:0,total_stars:0,attempts_today:0,current_level:1,xp_to_next_level:10,completed_challenge_ids:[],streak:0})}finally{ce(!1)}},ge=(t,a,s="success")=>{const n={success:["#10B981","#34D399","#6EE7B7","#FBBF24","#F59E0B"],levelup:["#8B5CF6","#A78BFA","#C4B5FD","#F59E0B","#FBBF24"],streak:["#EF4444","#F87171","#FCA5A5","#FBBF24","#F59E0B"]},r=[],p=s==="levelup"?25:15;for(let o=0;o<p;o++){const d=Math.PI*2*o/p,u=Math.random()*8+4;r.push({id:Date.now()+o,x:t+(Math.random()-.5)*50,y:a+(Math.random()-.5)*30,vx:Math.cos(d)*u+(Math.random()-.5)*2,vy:Math.sin(d)*u-Math.random()*3,life:80+Math.random()*40,maxLife:80,color:n[s][Math.floor(Math.random()*n[s].length)],size:Math.random()*6+3,type:s})}de(o=>[...o,...r])},$e=()=>{const t=document.documentElement;t.requestFullscreen?t.requestFullscreen():t.webkitRequestFullscreen?t.webkitRequestFullscreen():t.msRequestFullscreen&&t.msRequestFullscreen()},ze=()=>{var t;document.fullscreenElement&&((t=document.exitFullscreen)==null||t.call(document))},Ue=t=>{if(m.play("click"),$e(),c!=null&&c.completed_challenge_ids.includes(t.id)){m.play("failure"),f.fire({icon:"info",title:"Challenge Already Completed!",text:"You have already solved this challenge. Try a different one!",timer:2e3,showConfirmButton:!1,background:"#1f2937",color:"#fff"});return}H(t),L(t.buggy_code||""),D(!0),R(new Date),F(0)},he=(t,a)=>{const s=t.length,n=a.length;if(s===0)return n===0?1:0;if(n===0)return 0;const r=Array(n+1).fill(null).map(()=>Array(s+1).fill(null));for(let o=0;o<=s;o++)r[0][o]=o;for(let o=0;o<=n;o++)r[o][0]=o;for(let o=1;o<=n;o++)for(let d=1;d<=s;d++)t[d-1]===a[o-1]?r[o][d]=r[o-1][d-1]:r[o][d]=Math.min(r[o-1][d]+1,r[o][d-1]+1,r[o-1][d-1]+1);const p=Math.max(s,n);return(p-r[n][s])/p},qe=(t,a)=>{var k,_;const s=t.trim(),n=(k=a.fixed_code)==null?void 0:k.trim();if(!s)return console.log("Code validation: FAIL - No code provided"),!1;if(!n)return console.log("Code validation: FAIL - No solution available in database"),!1;if(s===((_=a.buggy_code)==null?void 0:_.trim()))return console.log("Code validation: FAIL - No changes made from original buggy code"),!1;const r=ae=>ae.replace(/\r\n/g,`
`).replace(/\s+/g," ").replace(/\s*;\s*/g,";").replace(/\s*\{\s*/g,"{").replace(/\s*\}\s*/g,"}").replace(/\s*\(\s*/g,"(").replace(/\s*\)\s*/g,")").replace(/\s*==\s*/g,"==").replace(/\s*=\s*/g,"=").trim(),p=r(s),o=r(n);if(p===o)return console.log("Code validation: PASS - Exact match with database solution (100%)"),!0;const u=he(p,o),y=Math.round(u*100);console.log(`Code validation: FAIL - Only ${y}% similarity with database solution (requires 100%)`);const N=u>=1;return console.log(`Code validation: ${N?"PASS":"FAIL"} (${y}% similarity, requires 100%)`),N},Xe=async()=>{var t;if(!l||!g.trim()){m.play("failure"),f.fire("Error","Please write some code before submitting.","error");return}try{if(Y(!0),m.play("typing"),!l.fixed_code){m.play("failure"),f.fire("Error","This challenge does not have a solution stored in the database.","error"),Y(!1);return}const a=qe(g,l),s=he(g.trim().replace(/\s+/g," "),l.fixed_code.trim().replace(/\s+/g," "));G({isCorrect:a,similarity:s}),W(!0);const n={challenge_id:l.id,language:l.language,mode:l.mode,time_spent_sec:b,is_correct:a,code_submitted:g,judge_feedback:a?"Perfect! Your solution is an exact match with the expected answer from database (100% match).":`Incorrect. Your solution has ${Math.round(s*100)}% similarity with the expected answer. You need 100% match to pass. Try again or view the correct answer.`},r=await w.post("/api/solo/attempts",n);if(r.success){const p=((t=r.data)==null?void 0:t.xp_earned)||(a?l.reward_xp:0);if(a){await w.post("/api/solo/mark-taken",{challenge_id:l.id,language:l.language,difficulty:l.difficulty,mode:l.mode,status:"completed",time_spent_sec:b,code_submitted:g,earned_xp:p??0});const o=(c==null?void 0:c.total_xp)||0,d=o+p,u=ee(o),y=ee(d),N=y>u;c&&!c.completed_challenge_ids.includes(l.id)&&q(U=>U?{...U,completed_challenge_ids:[...U.completed_challenge_ids,l.id],successful_attempts:U.successful_attempts+1,total_xp:d,current_level:y,xp_to_next_level:te(d)}:null),m.play("success"),Q(!0),V(!0),Z(!0),pe(!0),setTimeout(()=>pe(!1),2e3);const k=window.innerWidth/2,_=window.innerHeight/2;ge(k,_,"success"),N&&setTimeout(()=>{m.play("levelup"),K(!0),ge(k,_-100,"levelup")},1e3),setTimeout(()=>{m.play("victory")},500);const{isConfirmed:ae}=await f.fire({title:"PERFECT SOLUTION!",html:`
                        <div class="text-center">
                        <div class="text-5xl mb-4">🏆</div>
                        <p class="mb-3 text-lg font-semibold text-yellow-200">
                            Outstanding! Your code is a perfect 100% match!
                        </p>

                        <div class="bg-yellow-900/30 border border-yellow-500/40 rounded-lg p-4 mb-4">
                            <div class="text-2xl font-bold text-yellow-300">100% Perfect Match</div>
                            <div class="text-sm text-gray-200 opacity-80">Exact Database Solution</div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div class="bg-gray-900/40 rounded-lg p-3">
                            <div class="text-lg font-bold text-yellow-300">+${p??3}</div>
                            <div class="text-xs text-gray-300">XP Earned</div>
                            </div>
                            <div class="bg-gray-900/40 rounded-lg p-3">
                            <div class="text-lg font-bold text-purple-300">Level ${y??1}</div>
                            <div class="text-xs text-gray-300">Current Level</div>
                            </div>
                        </div>

                        <div class="text-sm text-gray-300">⏱️ Completed in ${Math.floor(b/60)}m ${b%60}s</div>
                        ${N?`
                            <div class="mt-4 text-center">
                            <div class="text-lg font-bold text-yellow-300 animate-pulse">✨ LEVEL UP! ✨</div>
                            <p class="text-sm text-gray-200">
                                You’ve reached Level ${y}! Next: ${te(d)} XP needed.
                            </p>
                            </div>
                        `:""}
                        </div>
                    `,showConfirmButton:!0,confirmButtonText:"Continue Coding!",confirmButtonColor:"#FACC15",background:"linear-gradient(160deg, #0f172a 0%, #78350f 35%, #fbbf24 100%)",color:"#fefce8",backdrop:"rgba(0,0,0,0.6)",allowOutsideClick:!1,allowEscapeKey:!1});ae&&(Q(!1),V(!1),K(!1),Z(!1),D(!1),H(null),L(""),R(null),F(0),W(!1),G(null),J(!1),await Promise.all([I(),$(),B()])),setTimeout(()=>{Q(!1),V(!1),K(!1),Z(!1)},7e3)}else m.play("failure"),me(!0),setTimeout(()=>me(!1),600),await f.fire({title:"Almost There!",html:`
                            <div class="text-center">
                            <div class="text-5xl mb-4">⚠️</div>
                            <p class="mb-3 text-lg font-semibold text-red-200">
                                Your solution must exactly match the database answer.
                            </p>

                            <div class="bg-red-900/30 border border-red-500/40 rounded-lg p-4 mb-4">
                                <div class="text-lg font-bold text-yellow-300">${Math.round(s*100)}% Match</div>
                                <div class="text-sm text-gray-200 opacity-80">Need 100% for Success</div>
                            </div>

                            <div class="bg-gray-900/40 rounded-lg p-3 text-left text-sm text-gray-200">
                                <div class="font-medium text-yellow-400 mb-1">💡 Tips:</div>
                                <ul class="list-disc list-inside space-y-1">
                                <li>Ensure your code is at least 20 characters long</li>
                                <li>Don’t just copy the buggy version</li>
                                <li>Whitespace, symbols & punctuation matter</li>
                                <li>⚠️ Don’t remove or add unnecessary comments — they are also compared in the database</li>
                                </ul>
                            </div>
                            </div>
                        `,timer:4500,showConfirmButton:!0,confirmButtonText:"Try Again",background:"linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #111827 100%)",color:"#e5e7eb",confirmButtonColor:"#3B82F6",backdrop:"rgba(0,0,0,0.6)"});await Promise.all([$(),I()]),await B()}else throw new Error(r.message||"Submission failed")}catch(a){console.error("Error submitting attempt:",a),m.play("failure");let s="Failed to submit your attempt. Please try again.";a instanceof Error&&(s=a.message),f.fire("Error",s,"error")}finally{Y(!1)}},be=async t=>{try{if(l){const a={challenge_id:l.id,language:l.language,difficulty:l.difficulty,mode:l.mode,status:t,time_spent_sec:b,code_submitted:g||l.buggy_code||"",earned_xp:t==="completed"?l.reward_xp??0:0};await w.post("/api/solo/mark-taken",a),console.log(`Challenge marked as ${t} in database`)}}catch(a){console.error("Error marking challenge as taken:",a),f.fire({title:"Warning",text:"Progress may not have been saved properly.",icon:"warning",timer:1500,showConfirmButton:!1,background:"#1f2937",color:"#fff"})}finally{m.play("click"),D(!1),H(null),L(""),R(null),F(0),W(!1),G(null),J(!1),ze(),await I(),await $(),await B()}},He=async()=>{try{if(!l)return;const t=l.fixed_code;l&&g.trim()!==(l.buggy_code??"").trim()||b>0?await be("abandoned"):await be("abandoned"),t&&t.trim().length>0?ve("Correct Answer",t):f.fire({icon:"info",title:"No Stored Solution",text:"This challenge has no fixed solution saved in the database.",background:"#1f2937",color:"#fff",confirmButtonColor:"#10B981"})}catch(t){console.error("quitAndShowSolution error:",t)}},De=()=>{l!=null&&l.fixed_code&&(m.play("click"),J(!0),ve("Correct Answer",l.fixed_code),f.fire({title:"Correct Answer",html:`
                    <div class="correct-answer-modal">
                        <p class="mb-4 text-gray-300">Here's the exact solution from the database (100% match required):</p>
                        <div class="bg-gray-900 rounded-lg p-4 text-left">
                            <pre class="text-green-400 text-sm overflow-auto max-h-64" style="font-family: 'Courier New', monospace; white-space: pre-wrap;">${l.fixed_code}</pre>
                        </div>
                        <p class="mt-4 text-sm text-gray-400">Your code must match this exactly to pass the challenge.</p>
                    </div>
                `,didOpen:()=>{const t=document.getElementById("solo-solution");t&&(t.textContent=l.fixed_code)},confirmButtonText:"Got it!",background:"#1f2937",color:"#fff",confirmButtonColor:"#10B981",width:"600px"}))},Ye=t=>{switch(t){case"easy":return x.chipEasyStyle;case"medium":return x.chipMedStyle;case"hard":return x.chipHardStyle;default:return x.chipBlueStyle}},Oe=t=>t==="fixbugs"?rt:lt,ye=t=>t==="fixbugs"?"text-yellow-400":"text-purple-400",Re=t=>{const a=Math.floor(t/60),s=t%60;return`${a}:${s.toString().padStart(2,"0")}`},We=new Set(["completed","abandoned"]),se=oe.filter(t=>{const a=c==null?void 0:c.completed_challenge_ids.includes(t.id),s=Ie[t.id];return!(a||s&&We.has(s))}),z=({title:t,value:a,icon:s,color:n,animated:r=!1})=>e.jsx("div",{className:`
                bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 
                ${r?"animate-pulse glow-effect":""} 
                hover:scale-105 hover:shadow-xl transition-all duration-300 
                ${Pe?"glow-success":""}
                cursor-pointer
            `,onMouseEnter:()=>m.play("hover"),children:e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx("div",{className:`p-2 rounded-lg ${n} transition-all duration-300`,children:e.jsx(s,{className:"h-5 w-5 text-white"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-gray-400",children:t}),e.jsx("p",{className:"text-lg font-bold text-white",children:a})]})]})}),ve=(t,a)=>{f.fire({title:`
      <div class="flex flex-col items-center gap-2">
        <span class="text-xl font-semibold text-rose-300 drop-shadow">${t}</span>
        <div class="text-[11px] px-2 py-1 rounded bg-rose-900/60 border border-rose-600/70 text-rose-200 uppercase tracking-wider font-bold">
          Quit & Show Solution
        </div>
      </div>
    `,html:`
      <div class="bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-rose-700/40 rounded-2xl shadow-[0_0_28px_rgba(244,63,94,0.25)] backdrop-blur-md p-5">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="space-y-1">
            <p class="text-slate-300 text-sm">
              <span class="text-rose-300 font-semibold">You quit this attempt.
            </p>
            <p class="text-xs text-slate-400">
              <span class="font-semibold text-amber-300">Reminder:</span>
              Don’t add or delete unnecessary comments—exact match is enforced.
            </p>
          </div>
        </div>

        <div class="relative rounded-xl bg-slate-800/70 border border-slate-700/60 shadow-inner overflow-hidden">
          <pre id="swal-code"
            class="text-amber-200 text-sm p-4 overflow-y-auto"
            style="
              font-family:'JetBrains Mono','Courier New',monospace;
              white-space: pre-wrap;
              word-break: break-word;
              max-height: 60vh;
              line-height: 1.5;

              /* Hide scrollbar cross-browser */
              -ms-overflow-style: none;      /* IE/Edge */
              scrollbar-width: none;         /* Firefox */
            "></pre>
          <style>
            /* Hide scrollbar for WebKit inside the modal only */
            .swal2-html-container pre::-webkit-scrollbar { display: none; }
          </style>
          <div class="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950/90 to-transparent"></div>
        </div>

        <div class="mt-3 text-[11px] text-slate-400 text-right">
          Status: <span class="text-rose-300 font-semibold">Viewed Solution</span>
        </div>
      </div>
    `,width:760,background:"#0a0f1c",color:"#f8fafc",confirmButtonText:"Close",allowOutsideClick:!1,allowEscapeKey:!1,customClass:{confirmButton:"px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg shadow-lg hover:shadow-rose-500/30 transition-all duration-200",popup:"border border-rose-700/50 rounded-2xl"},showClass:{popup:"animate__animated animate__fadeInUp animate__faster"},hideClass:{popup:"animate__animated animate__fadeOutDown animate__faster"},didOpen:()=>{const s=f.getHtmlContainer(),n=s==null?void 0:s.querySelector("#swal-code");n&&(n.textContent=a);const r=s==null?void 0:s.querySelector("#copy-code");r==null||r.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a),r.innerHTML="Copied!",r.classList.add("bg-emerald-600","text-white","border-emerald-500"),setTimeout(()=>{r.innerHTML=`
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="1.5" d="M8 8h8v8H8z"/><path stroke-width="1.5" d="M4 4h8v2H6v6H4z"/></svg>
              Copy code
            `,r.classList.remove("bg-emerald-600","text-white","border-emerald-500")},1200)}catch{r.innerHTML="Copy failed",setTimeout(()=>r.innerHTML="Copy code",1200)}})}})};return e.jsxs("div",{className:"min-h-screen relative overflow-hidden",children:[e.jsx(Ve,{}),e.jsxs("div",{className:"absolute inset-0 overflow-hidden pointer-events-none",children:[e.jsx("div",{className:"absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20"}),e.jsx("div",{className:"absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"}),e.jsx("div",{className:"absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-10"}),e.jsx("div",{className:"absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse opacity-25"}),e.jsx("div",{className:"absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-green-400 rounded-full animate-bounce opacity-15"}),T.map(t=>e.jsx("div",{className:"absolute pointer-events-none particle-effect",style:{left:`${t.x}px`,top:`${t.y}px`,backgroundColor:t.color,width:`${t.size}px`,height:`${t.size}px`,borderRadius:"50%",opacity:t.life/t.maxLife,boxShadow:`0 0 ${t.size}px ${t.color}`}},t.id))]}),Ae&&e.jsx("div",{className:"fixed inset-0 bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-md z-50 flex items-center justify-center animate-fadeIn",children:e.jsxs("div",{className:"text-center text-white animate-bounceIn levelup-container",children:[e.jsxs("div",{className:"crown-animation mb-6",children:[e.jsx(le,{className:"w-24 h-24 mx-auto text-yellow-400 animate-spin-slow"}),e.jsx("div",{className:"crown-glow"})]}),e.jsx("h2",{className:"text-8xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse",children:"LEVEL UP!"}),e.jsxs("p",{className:"text-3xl opacity-90 animate-slideInUp",children:["You reached Level ",c==null?void 0:c.current_level,"!"]}),e.jsx("div",{className:"mt-6 animate-slideInUp delay-300",children:e.jsxs("div",{className:"inline-flex items-center space-x-2 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm",children:[e.jsx(we,{className:"w-5 h-5 text-yellow-400"}),e.jsxs("span",{className:"text-lg font-semibold",children:["Only ",c==null?void 0:c.xp_to_next_level," XP to next level!"]}),e.jsx(we,{className:"w-5 h-5 text-yellow-400"})]})})]})}),e.jsxs(Ke,{breadcrumbs:ot,children:[e.jsx(Je,{title:"Solo Challenge"}),e.jsxs("div",{className:`flex flex-col gap-6 p-4 relative z-10 ${Me?"animate-shake":""}`,children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(re,{className:`h-8 w-8 text-cyan-400 ${Te?"animate-spin":""} transition-all duration-300`}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold",children:"SOLO CHALLENGE"}),e.jsx("p",{className:"text-gray-400 text-sm",children:"Master coding challenges and level up your skills"})]})]}),e.jsx("div",{className:"flex items-center space-x-3"})]}),c&&e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:`${x.panelClass} p-6`,style:x.panelStyle,children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(le,{className:"h-6 w-6 text-yellow-400"}),e.jsxs("span",{className:"text-xl font-bold text-white",children:["Level ",c.current_level]}),e.jsxs("div",{className:"text-sm text-gray-400",children:["(",fe(c.total_xp),"/10 XP)"]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("div",{className:"text-gray-400 text-sm",children:"Next Level"}),e.jsxs("div",{className:"text-cyan-400 font-bold",children:[c.xp_to_next_level," XP needed"]})]})]}),e.jsxs("div",{className:"w-full h-3 bg-gray-700 rounded-full h-4 overflow-hidden relative",children:[e.jsx("div",{className:`bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 ease-out progress-bar-glow ${Be?"animate-pulse":""}`,style:{width:`${xe(c.total_xp)}%`},children:e.jsx("div",{className:"absolute inset-0 bg-white/20 rounded-full animate-pulse"})}),e.jsx("div",{className:"absolute inset-0 flex items-center justify-center",children:e.jsxs("span",{className:"text-xs font-bold text-white drop-shadow-lg",children:[Math.round(xe(c.total_xp)),"%"]})})]}),e.jsxs("div",{className:"flex justify-between text-xs text-gray-400 mt-2",children:[e.jsxs("span",{children:["Level ",c.current_level]}),e.jsxs("span",{children:[fe(c.total_xp)," / 10 XP"]}),e.jsxs("span",{children:["Level ",c.current_level+1]})]})]}),e.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[e.jsx(z,{title:"Level",value:c.current_level,icon:le,color:"bg-orange-500"}),e.jsx(z,{title:"Total XP",value:c.total_xp||0,icon:je,color:"bg-yellow-500"}),e.jsx(z,{title:"Completed",value:c.successful_attempts||0,icon:Ze,color:"bg-green-500",animated:Fe}),e.jsx(z,{title:"Available",value:se.length,icon:re,color:"bg-cyan-500"})]})]}),e.jsx("div",{className:`${x.panelClass} p-6`,style:x.panelStyle,children:e.jsxs("div",{className:"flex flex-col md:flex-row gap-4",children:[e.jsx("div",{className:"flex-1",children:e.jsxs("div",{className:"relative",children:[e.jsx(et,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"}),e.jsx("input",{type:"text",placeholder:"Search challenges by title...",value:E,onChange:t=>Le(t.target.value),className:"w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-gray-400 transition-all duration-300"})]})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:C,onChange:t=>Se(t.target.value),className:"px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300",children:[e.jsx("option",{value:"all",children:"All Languages"}),e.jsx("option",{value:"python",children:"Python"}),e.jsx("option",{value:"java",children:"Java"}),e.jsx("option",{value:"cpp",children:"C++"})]}),e.jsxs("select",{value:S,onChange:t=>Ee(t.target.value),className:"px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300",children:[e.jsx("option",{value:"all",children:"All Difficulties"}),e.jsx("option",{value:"easy",children:"Easy"}),e.jsx("option",{value:"medium",children:"Medium"}),e.jsx("option",{value:"hard",children:"Hard"})]})]})]})}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:Ce?e.jsx("div",{className:"col-span-full flex items-center justify-center py-12",children:e.jsxs("div",{className:"text-center",children:[e.jsx(Ne,{className:"h-8 w-8 animate-spin mx-auto mb-2 text-cyan-400"}),e.jsx("div",{className:"text-gray-300",children:"Loading challenges..."})]})}):se.length===0?e.jsxs("div",{className:"col-span-full text-center py-12 completion-celebration",children:[e.jsx("div",{className:"trophy-large mb-4",children:"🏆"}),e.jsx("div",{className:"text-2xl font-bold text-white mb-2",children:"Outstanding Achievement!"}),e.jsx("div",{className:"text-gray-400",children:oe.length===0?"No challenges match your current filters":"You have conquered all available challenges!"})]}):se.map(t=>{const a=Oe(t.mode);return e.jsxs("div",{className:"bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:border-cyan-500/50 challenge-card",onMouseEnter:()=>m.play("hover"),children:[e.jsxs("div",{className:"flex items-start justify-between mb-4",children:[e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(a,{className:`h-5 w-5 ${ye(t.mode)}`}),e.jsx("span",{className:`text-xs font-bold uppercase ${ye(t.mode)}`,children:t.mode==="fixbugs"?"Fix Bugs":"Random"})]}),e.jsxs("div",{className:"flex space-x-2",children:[e.jsx("span",{className:x.chipClass,style:x.chipBlueStyle,children:_e(t.language)}),e.jsx("span",{className:x.chipClass,style:Ye(t.difficulty),children:t.difficulty.toUpperCase()})]})]}),e.jsx("h3",{className:"text-lg font-bold text-white mb-2",children:t.title}),t.description&&e.jsx("p",{className:"text-sm text-gray-400 mb-4 line-clamp-3",children:t.description}),e.jsxs("div",{className:"flex items-center justify-between mt-4",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsxs("div",{className:"flex items-center space-x-1 text-yellow-400",children:[e.jsx(je,{className:"h-4 w-4"}),e.jsxs("span",{className:"text-sm font-medium",children:[t.reward_xp," XP"]})]}),t.hint&&e.jsx("div",{className:"flex items-center space-x-1 text-cyan-400",title:"Has hint",children:e.jsx(ke,{className:"h-4 w-4"})})]}),e.jsxs("button",{onClick:()=>Ue(t),className:`flex items-center space-x-2 px-4 py-2 ${x.btnPrimaryClass}`,style:x.btnPrimaryStyle,children:[e.jsx(tt,{className:"h-4 w-4"}),e.jsx("span",{children:"Start"})]})]})]},t.id)})}),j&&l&&e.jsx("div",{className:"fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-[10000] pointer-events-auto flex items-center justify-center p-4",children:e.jsxs("div",{className:"relative z-[10001] bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden animate-fadeInUp",children:[e.jsx("div",{className:"bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("h3",{className:"text-lg font-bold text-white flex items-center",children:[e.jsx(re,{className:"h-5 w-5 mr-2"}),l.title]}),e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsxs("div",{className:"flex items-center space-x-2 text-white",children:[e.jsx(Qe,{className:"h-4 w-4"}),e.jsx("span",{className:"text-sm font-medium",children:Re(b)})]}),e.jsx("button",{onClick:He,className:"text-xs md:text-sm font-semibold px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200",title:"Quit and show correct solution",children:"Quit and show correct solution"})]})]})}),e.jsxs("div",{className:"p-6 space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Language"}),e.jsx("div",{className:"text-lg font-bold text-white",children:_e(l.language)})]}),e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Difficulty"}),e.jsx("div",{className:"text-lg font-bold text-white capitalize",children:l.difficulty})]}),e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Reward"}),e.jsxs("div",{className:"text-lg font-bold text-yellow-400",children:[l.reward_xp," XP"]})]})]}),l.description&&e.jsxs("div",{className:"bg-gray-900/30 rounded-lg p-4",children:[e.jsx("h4",{className:"text-cyan-400 font-bold mb-2",children:"Description"}),e.jsx("p",{className:"text-gray-200",children:l.description})]}),l.hint&&e.jsxs("div",{className:"bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4",children:[e.jsxs("h4",{className:"text-yellow-400 font-bold mb-2 flex items-center",children:[e.jsx(ke,{className:"h-4 w-4 mr-2"}),"Hint"]}),e.jsx("p",{className:"text-yellow-200",children:l.hint})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-cyan-400 font-bold mb-2",children:"Your Code"}),e.jsx("textarea",{value:g,onChange:t=>L(t.target.value),className:"w-full h-64 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200 font-mono text-sm transition-all duration-300",placeholder:"Write your solution here..."})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center space-x-2",children:[M&&!(h!=null&&h.isCorrect)&&e.jsxs("button",{onClick:De,disabled:A,className:"flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105",children:[e.jsx(st,{className:"h-4 w-4"}),e.jsx("span",{children:"Show Correct Answer"})]}),M&&h&&e.jsx("div",{className:"text-sm text-gray-400",children:h.isCorrect?e.jsx("span",{className:"text-green-400 font-medium",children:"✅ Perfect 100% match!"}):e.jsxs("span",{className:"text-yellow-400 font-medium",children:["📊 ",Math.round(h.similarity*100),"% similarity (need 100%)"]})})]}),e.jsx("div",{className:"flex items-center space-x-3",children:(!M||!(h!=null&&h.isCorrect))&&e.jsxs("button",{onClick:Xe,disabled:A||!g.trim(),className:"flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105",children:[A?e.jsx(Ne,{className:"h-4 w-4 animate-spin"}):e.jsx(at,{className:"h-4 w-4"}),e.jsx("span",{children:A?"Submitting...":M?"Try Again":"Submit Solution"})]})})]})]})]})})]})]}),e.jsx("style",{children:`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-10px); }
                    40% { transform: translateX(10px); }
                    60% { transform: translateX(-8px); }
                    80% { transform: translateX(8px); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeInUp {
                    from { 
                        opacity: 0; 
                        transform: translateY(50px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                
                @keyframes bounceIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.3);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.1);
                    }
                    70% {
                        transform: scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes spin-slow {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes glow-pulse {
                    0%, 100% {
                        box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
                    }
                    50% {
                        box-shadow: 0 0 30px rgba(16, 185, 129, 0.8);
                    }
                }

                @keyframes progress-fill {
                    from {
                        width: 0%;
                    }
                    to {
                        width: var(--progress-width);
                    }
                }

                .animate-shake {
                    animation: shake 0.6s ease-in-out;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out;
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out;
                }
                
                .animate-bounceIn {
                    animation: bounceIn 1s ease-out;
                }

                .animate-slideInUp {
                    animation: slideInUp 0.8s ease-out;
                }

                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }

                .glow-effect {
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
                }

                .glow-success {
                    animation: glow-pulse 2s infinite;
                }

                .progress-bar-glow {
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
                    position: relative;
                }

                .progress-bar-glow::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                    animation: progress-shimmer 2s infinite;
                }

                @keyframes progress-shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .particle-effect {
                    animation: fadeIn 0.3s ease-out;
                    pointer-events: none;
                    z-index: 1000;
                }

                .challenge-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .challenge-card:hover {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(6, 182, 212, 0.2);
                }

                .challenge-start-btn {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .challenge-start-btn:hover {
                    box-shadow: 0 10px 25px rgba(6, 182, 212, 0.4);
                    transform: scale(1.05);
                }

                .levelup-container {
                    filter: drop-shadow(0 0 50px rgba(168, 85, 247, 0.8));
                }

                .crown-animation {
                    position: relative;
                }

                .crown-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 120px;
                    height: 120px;
                    background: radial-gradient(circle, rgba(251, 191, 36, 0.3), transparent);
                    border-radius: 50%;
                    animation: glow-pulse 2s infinite;
                }

                .trophy-large {
                    font-size: 4rem;
                    animation: bounceIn 1.5s ease-out infinite;
                }

                .completion-celebration {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
                    border-radius: 20px;
                    padding: 3rem;
                    border: 2px solid rgba(16, 185, 129, 0.2);
                }

                .delay-300 {
                    animation-delay: 0.3s;
                }

                .challenge-success-modal {
                    text-align: center;
                }

                .trophy-animation {
                    position: relative;
                    margin: 20px 0;
                }

                .trophy-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100px;
                    height: 100px;
                    background: radial-gradient(circle, rgba(251, 191, 36, 0.4), transparent);
                    border-radius: 50%;
                    animation: glow-pulse 1.5s infinite;
                }

                .trophy-icon {
                    font-size: 3rem;
                    position: relative;
                    z-index: 1;
                }

                .rewards-container {
                    display: flex;
                    justify-content: space-around;
                    margin: 20px 0;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                }

                .reward-item {
                    text-align: center;
                    padding: 10px;
                    transition: transform 0.3s ease;
                }

                .reward-item:hover {
                    transform: scale(1.1);
                }

                .reward-icon {
                    font-size: 1.5rem;
                    margin-bottom: 5px;
                    animation: bounce 2s infinite;
                }

                .reward-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 5px 0;
                    background: linear-gradient(45deg, #fbbf24, #f59e0b);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .reward-label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }

                .time-stats {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin: 15px 0;
                    padding: 10px 20px;
                    background: rgba(59, 130, 246, 0.1);
                    border-radius: 20px;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                }

                .time-icon {
                    font-size: 1.2rem;
                }

                .levelup-celebration {
                    margin-top: 20px;
                    padding: 15px;
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2));
                    border-radius: 15px;
                    border: 2px solid rgba(168, 85, 247, 0.3);
                    animation: fadeIn 0.5s ease-out;
                }

                .levelup-sparkles {
                    font-size: 1.2rem;
                    margin-bottom: 8px;
                    animation: pulse 2s infinite;
                }

                .levelup-text {
                    font-size: 1.1rem;
                    font-weight: bold;
                    margin-bottom: 8px;
                }

                .xp-progress {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.8);
                }

                .xp-needed {
                    background: linear-gradient(45deg, #06b6d4, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 600;
                }

                .failure-modal {
                    text-align: center;
                }

                .thinking-animation {
                    margin: 20px 0;
                    position: relative;
                }

                .thinking-icon {
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                }

                .thinking-dots {
                    position: absolute;
                    top: -15px;
                    right: -25px;
                    animation: pulse 1s ease-out infinite;
                }

                .thinking-dots span {
                    animation: bounce 1.4s ease-in-out infinite both;
                }

                .thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
                .thinking-dots span:nth-child(2) { animation-delay: -0.16s; }

                .failure-message {
                    font-size: 1.1rem;
                    margin: 15px 0;
                    line-height: 1.5;
                }

                .tips-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin: 20px 0;
                    padding: 15px;
                    background: rgba(251, 191, 36, 0.1);
                    border-radius: 12px;
                    border: 1px solid rgba(251, 191, 36, 0.3);
                }

                .tip-icon {
                    font-size: 1.3rem;
                    animation: pulse 2s infinite;
                }

                .tip-text {
                    font-size: 0.95rem;
                    line-height: 1.4;
                    text-align: left;
                }

                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                    }
                    40% {
                        transform: scale(1.0);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }

                /* Enhanced progress bar animations */
                .progress-animated {
                    position: relative;
                    overflow: hidden;
                }

                .progress-animated::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
                    animation: progress-sweep 2s infinite;
                }

                @keyframes progress-sweep {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .rewards-container {
                        flex-direction: column;
                        gap: 10px;
                    }
                    
                    .reward-item {
                        padding: 8px;
                    }
                    
                    .trophy-large {
                        font-size: 3rem;
                    }
                    
                    .levelup-container h2 {
                        font-size: 4rem;
                    }
                }
                    /* When Solo modal is open, completely disable clicks on the left quicklinks
                (CSS-only; no JS, no events). We dim it a bit for clarity. */
                body.modal-open .quick-dock,
                body.modal-open .quick-dock * {
                pointer-events: none !important;
                }

                body.modal-open .quick-dock {
                opacity: 0.5;
                }

                /* Optional: also ignore clicks on the site header while modal is open */
                body.modal-open header {
                pointer-events: none !important;
                }

            `})]})}export{At as default};
