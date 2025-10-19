import{K as lt,r as i,j as e,L as rt}from"./app-BNWgO-Fz.js";import{b as d,a as b,A as ot,T as Ee,S as u,C as nt}from"./app-layout-CBOUSF6H.js";import{A as it}from"./AnimatedBackground-DBoBMLV7.js";import{C as ne}from"./crown-BLKiU3o1.js";import{S as Ae}from"./sparkles-CK5pHVlY.js";import{T as ie}from"./trophy-9kVKDqQe.js";import{C as ce}from"./circle-check-big-CC-7ecby.js";import{S as ct}from"./search-BN1eP4S8.js";import{R as U}from"./refresh-cw-Iru8VgY6.js";import{L as Le}from"./lightbulb-1zm1ZAXT.js";import{P as dt}from"./play-Bn6vf-o6.js";import{X as mt,B as pt}from"./x-CyKYgiHF.js";import{S as xt}from"./send-DepHGKn2.js";import{T as ut}from"./triangle-alert-C-hcWpG2.js";import{Z as ft}from"./zap-SDsdji4V.js";import"./utils-jAU0Cazi.js";import"./createLucideIcon-DqtvVx51.js";import"./users-BWLL3Z1M.js";const gt=[{title:"Home",href:"/dashboard"},{title:"Practice",href:"#"},{title:"Training Challenge",href:"/play/solo"}],f={panelClass:"rounded-xl border",panelStyle:{background:"var(--panel-bg, rgba(17,24,39,0.50))",borderColor:"var(--panel-border, rgba(75,85,99,0.50))",backdropFilter:"blur(6px)"},chipClass:"px-2 py-1 text-xs font-semibold rounded-full border",chipBlueStyle:{background:"var(--chip-blue-bg, rgba(30,58,138,0.30))",borderColor:"var(--chip-blue-border, rgba(59,130,246,0.50))",color:"var(--chip-blue-text, #93c5fd)"},chipEasyStyle:{background:"var(--chip-easy-bg, rgba(6,78,59,0.30))",borderColor:"var(--chip-easy-border, rgba(16,185,129,0.50))",color:"var(--chip-easy-text, #86efac)"},chipMedStyle:{background:"var(--chip-med-bg, rgba(113,63,18,0.30))",borderColor:"var(--chip-med-border, rgba(234,179,8,0.50))",color:"var(--chip-med-text, #fde68a)"},chipHardStyle:{background:"var(--chip-hard-bg, rgba(127,29,29,0.30))",borderColor:"var(--chip-hard-border, rgba(248,113,113,0.50))",color:"var(--chip-hard-text, #fca5a5)"},btnPrimaryClass:"rounded-lg shadow-lg hover:scale-110 transition-all duration-300",btnPrimaryStyle:{background:"var(--btn-primary, linear-gradient(90deg,#06b6d4,#2563eb))",color:"var(--btn-primary-text, #fff)"}},ht={python:"Python",java:"Java",cpp:"C++"},de=v=>ht[v]??v.toUpperCase();function Xt(){const{auth:v}=lt().props;v==null||v.user;const[Y,q]=i.useState([]),[c,R]=i.useState(null),[Be,me]=i.useState(!0),[bt,pe]=i.useState(!0),[A,yt]=i.useState("all"),[w,Fe]=i.useState("all"),[j,Pe]=i.useState("all"),[N,Me]=i.useState(""),[l,D]=i.useState(null),[C,O]=i.useState(!1),[h,L]=i.useState(""),[B,H]=i.useState(!1),[k,F]=i.useState(0),[G,W]=i.useState(null),[P,Q]=i.useState(!1),[g,J]=i.useState(null),[vt,K]=i.useState(!1),[Te,xe]=i.useState(!1),[ue,V]=i.useState([]),[Ie,fe]=i.useState(!1),[ge,$e]=i.useState(!1),[M,he]=i.useState([]),[ze,Z]=i.useState(!1),[Xe,ee]=i.useState(!1),[Ue,be]=i.useState(!1),[Ye,te]=i.useState(!1),[qe,se]=i.useState(!1),[Re,ye]=i.useState(!1),T=i.useRef(),[De,ve]=i.useState({});i.useEffect(()=>{C?document.body.classList.add("modal-open"):document.body.classList.remove("modal-open")},[C]),i.useEffect(()=>{d.registerSfx("success","/sounds/correct.mp3"),d.registerSfx("failure","/sounds/failure.mp3"),d.registerSfx("levelup","/sounds/levelup.mp3"),d.registerSfx("click","/sounds/click.mp3"),d.registerSfx("hover","/sounds/hover.mp3"),d.registerSfx("victory","/sounds/victory.mp3"),d.registerSfx("streak","/sounds/streak.mp3"),d.registerSfx("typing","/sounds/typing.mp3")},[]);const ae=t=>Math.floor(t/10)+1,le=t=>10-t%10,we=t=>t%10/10*100,je=t=>t%10;i.useEffect(()=>{$(),z(),I()},[A,w,j,N]),i.useEffect(()=>{const t=!!(C&&l);try{window.__modalOpen=t,window.dispatchEvent(new CustomEvent("app:modal",{detail:{open:t}}))}catch{}const a=document.documentElement;return t?a.classList.add("overflow-hidden"):a.classList.remove("overflow-hidden"),()=>a.classList.remove("overflow-hidden")},[C,l]),i.useEffect(()=>{let t;return G&&(t=setInterval(()=>{F(Math.floor((Date.now()-G.getTime())/1e3))},1e3)),()=>{t&&clearInterval(t)}},[G]),i.useEffect(()=>{if(M.length>0){const t=()=>{he(a=>a.map(s=>({...s,x:s.x+s.vx,y:s.y+s.vy,vy:s.vy-.15,life:s.life-1,size:s.size*.99})).filter(s=>s.life>0)),M.length>0&&(T.current=requestAnimationFrame(t))};T.current=requestAnimationFrame(t)}return()=>{T.current&&cancelAnimationFrame(T.current)}},[M.length]);const I=async()=>{try{const t=await b.get("/api/solo/taken");if(t.success){const a=(t.data||[]).reduce((s,n)=>(s[n.challenge_id]=n.status,s),{});ve(a)}}catch(t){console.error("Error fetching taken rows:",t),ve({})}},Oe=async()=>{try{fe(!0);const t=await b.get("/api/solo/completed");t.success&&Array.isArray(t.data)?V(t.data):V([])}catch(t){console.error("Error fetching completed challenges:",t),V([])}finally{fe(!1)}},$=async()=>{var t;try{me(!0);const a={};A&&A!=="all"&&(a.mode=A),w&&w!=="all"&&(a.language=w),j&&j!=="all"&&(a.difficulty=j),N!=null&&N.trim()&&(a.search=N.trim()),w==="all"&&j!=="all"&&(a.per_page=500);const s=await b.get("/api/challenges/solo",a);if(s!=null&&s.success){const n=((t=s.data)==null?void 0:t.data)||s.data||[];q(n)}else q([])}catch(a){console.error("Error fetching challenges:",a),q([])}finally{me(!1)}},z=async()=>{var t,a,s;try{pe(!0);const n=await b.get("/api/me/stats");if(n.success&&n.data){const r=n.data,p=((t=r.totals)==null?void 0:t.xp)||0;let o=[];if(r.completed_challenge_ids&&Array.isArray(r.completed_challenge_ids))o=r.completed_challenge_ids;else if((a=r.solo_stats)!=null&&a.completed_challenge_ids)o=r.solo_stats.completed_challenge_ids;else if(r.attempts){const m=r.attempts.filter(x=>x.is_correct);o=[...new Set(m.map(x=>x.challenge_id))]}else{const m=["completed_challenges","solo_completed_challenges","successful_challenge_ids","completed_solo_challenges"];for(const x of m)if(r[x]&&Array.isArray(r[x])){o=r[x],console.log(`Found completed challenges in field: ${x}`);break}}R({solo_attempts:r.solo_attempts||0,successful_attempts:r.successful_attempts||o.length,total_xp:p,total_stars:((s=r.totals)==null?void 0:s.stars)||0,attempts_today:r.attempts_today||0,current_level:ae(p),xp_to_next_level:le(p),completed_challenge_ids:o,streak:r.streak||0})}}catch(n){console.error("Error fetching user stats:",n),R({solo_attempts:0,successful_attempts:0,total_xp:0,total_stars:0,attempts_today:0,current_level:1,xp_to_next_level:10,completed_challenge_ids:[],streak:0})}finally{pe(!1)}},Ne=(t,a,s="success")=>{const n={success:["#10B981","#34D399","#6EE7B7","#FBBF24","#F59E0B"],levelup:["#8B5CF6","#A78BFA","#C4B5FD","#F59E0B","#FBBF24"],streak:["#EF4444","#F87171","#FCA5A5","#FBBF24","#F59E0B"]},r=[],p=s==="levelup"?25:15;for(let o=0;o<p;o++){const m=Math.PI*2*o/p,x=Math.random()*8+4;r.push({id:Date.now()+o,x:t+(Math.random()-.5)*50,y:a+(Math.random()-.5)*30,vx:Math.cos(m)*x+(Math.random()-.5)*2,vy:Math.sin(m)*x-Math.random()*3,life:80+Math.random()*40,maxLife:80,color:n[s][Math.floor(Math.random()*n[s].length)],size:Math.random()*6+3,type:s})}he(o=>[...o,...r])},He=()=>{const t=document.documentElement;t.requestFullscreen?t.requestFullscreen():t.webkitRequestFullscreen?t.webkitRequestFullscreen():t.msRequestFullscreen&&t.msRequestFullscreen()},Ge=()=>{var t;document.fullscreenElement&&((t=document.exitFullscreen)==null||t.call(document))},ke=t=>{if(d.play("click"),He(),c!=null&&c.completed_challenge_ids.includes(t.id)){d.play("failure"),u.fire({icon:"info",title:"Challenge Already Completed!",text:"You have already solved this challenge. Try a different one!",timer:2e3,showConfirmButton:!1,background:"#1f2937",color:"#fff"});return}D(t),L(t.buggy_code||""),O(!0),W(new Date),F(0)},Ce=(t,a)=>{const s=t.length,n=a.length;if(s===0)return n===0?1:0;if(n===0)return 0;const r=Array(n+1).fill(null).map(()=>Array(s+1).fill(null));for(let o=0;o<=s;o++)r[0][o]=o;for(let o=0;o<=n;o++)r[o][0]=o;for(let o=1;o<=n;o++)for(let m=1;m<=s;m++)t[m-1]===a[o-1]?r[o][m]=r[o-1][m-1]:r[o][m]=Math.min(r[o-1][m]+1,r[o][m-1]+1,r[o-1][m-1]+1);const p=Math.max(s,n);return(p-r[n][s])/p},We=(t,a)=>{var S,E;const s=t.trim(),n=(S=a.fixed_code)==null?void 0:S.trim();if(!s)return console.log("Code validation: FAIL - No code provided"),!1;if(!n)return console.log("Code validation: FAIL - No solution available in database"),!1;if(s===((E=a.buggy_code)==null?void 0:E.trim()))return console.log("Code validation: FAIL - No changes made from original buggy code"),!1;const r=oe=>oe.replace(/\r\n/g,`
`).replace(/\s+/g," ").replace(/\s*;\s*/g,";").replace(/\s*\{\s*/g,"{").replace(/\s*\}\s*/g,"}").replace(/\s*\(\s*/g,"(").replace(/\s*\)\s*/g,")").replace(/\s*==\s*/g,"==").replace(/\s*=\s*/g,"=").trim(),p=r(s),o=r(n);if(p===o)return console.log("Code validation: PASS - Exact match with database solution (100%)"),!0;const x=Ce(p,o),y=Math.round(x*100);console.log(`Code validation: FAIL - Only ${y}% similarity with database solution (requires 100%)`);const _=x>=1;return console.log(`Code validation: ${_?"PASS":"FAIL"} (${y}% similarity, requires 100%)`),_},Qe=async()=>{var t;if(!l||!h.trim()){d.play("failure"),u.fire("Error","Please write some code before submitting.","error");return}try{if(H(!0),d.play("typing"),!l.fixed_code){d.play("failure"),u.fire("Error","This challenge does not have a solution stored in the database.","error"),H(!1);return}const a=We(h,l),s=Ce(h.trim().replace(/\s+/g," "),l.fixed_code.trim().replace(/\s+/g," "));J({isCorrect:a,similarity:s}),Q(!0);const n={challenge_id:l.id,language:l.language,difficulty:l.difficulty,mode:l.mode,time_spent_sec:k,is_correct:a,code_submitted:h,judge_feedback:a?"Perfect! Your solution is an exact match with the expected answer from database (100% match).":`Incorrect. Your solution has ${Math.round(s*100)}% similarity with the expected answer. You need 100% match to pass. Try again or view the correct answer.`},r=ge?await b.post("/api/solo/retake",n):await b.post("/api/solo/attempts",n);if(r.success){const p=((t=r.data)==null?void 0:t.xp_earned)||(a?l.reward_xp:0);if(a){await b.post("/api/solo/mark-taken",{challenge_id:l.id,language:l.language,difficulty:l.difficulty,mode:l.mode,status:"completed",time_spent_sec:k,code_submitted:h,earned_xp:p??0});const o=(c==null?void 0:c.total_xp)||0,m=o+p,x=ae(o),y=ae(m),_=y>x;c&&!c.completed_challenge_ids.includes(l.id)&&R(X=>X?{...X,completed_challenge_ids:[...X.completed_challenge_ids,l.id],successful_attempts:X.successful_attempts+1,total_xp:m,current_level:y,xp_to_next_level:le(m)}:null),d.play("success"),ee(!0),te(!0),se(!0),ye(!0),setTimeout(()=>ye(!1),2e3);const S=window.innerWidth/2,E=window.innerHeight/2;Ne(S,E,"success"),_&&setTimeout(()=>{d.play("levelup"),Z(!0),Ne(S,E-100,"levelup")},1e3),setTimeout(()=>{d.play("victory")},500);const{isConfirmed:oe}=await u.fire({title:"PERFECT SOLUTION!",html:`
    <div class="text-center">
      <div class="text-5xl mb-4">🏆</div>
      <p class="mb-3 text-lg font-semibold text-cyan-200">Outstanding! Your code is a perfect 100% match!</p>

      <div class="bg-blue-900/30 border border-blue-500/40 rounded-lg p-4 mb-4">
        <div class="text-2xl font-bold text-green-400">100% Perfect Match</div>
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

      <div class="text-sm text-gray-300">⏱️ Completed in ${Math.floor(k/60)}m ${k%60}s</div>
      ${_?`
        <div class="mt-4 text-center">
          <div class="text-lg font-bold text-pink-400 animate-pulse">✨ LEVEL UP! ✨</div>
          <p class="text-sm text-gray-200">You’ve reached Level ${y}! Next: ${le(m)} XP needed.</p>
        </div>
      `:""}
    </div>
  `,showConfirmButton:!0,confirmButtonText:"Continue Coding!",confirmButtonColor:"#10B981",background:"linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)",color:"#fff",allowOutsideClick:!1,allowEscapeKey:!1});oe&&(ee(!1),te(!1),Z(!1),se(!1),O(!1),D(null),L(""),W(null),F(0),Q(!1),J(null),K(!1),await Promise.all([$(),z(),I()])),setTimeout(()=>{ee(!1),te(!1),Z(!1),se(!1)},7e3)}else d.play("failure"),be(!0),setTimeout(()=>be(!1),600),await u.fire({title:"Almost There!",html:`
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
                                          `,timer:4500,showConfirmButton:!0,confirmButtonText:"Try Again",background:"linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #111827 100%)",color:"#e5e7eb",confirmButtonColor:"#3B82F6",backdrop:"rgba(0,0,0,0.6)"});await Promise.all([z(),$()]),await I()}else throw new Error(r.message||"Submission failed")}catch(a){console.error("Error submitting attempt:",a),d.play("failure");let s="Failed to submit your attempt. Please try again.";a instanceof Error&&(s=a.message),u.fire("Error",s,"error")}finally{H(!1)}},Je=async t=>{try{if(l){const a={challenge_id:l.id,language:l.language,difficulty:l.difficulty,mode:l.mode,status:t,time_spent_sec:k,code_submitted:h||l.buggy_code||"",earned_xp:t==="completed"?l.reward_xp??0:0};await b.post("/api/solo/mark-taken",a),console.log(`Challenge marked as ${t} in database`)}}catch(a){console.error("Error marking challenge as taken:",a),u.fire({title:"Warning",text:"Progress may not have been saved properly.",icon:"warning",timer:1500,showConfirmButton:!1,background:"#1f2937",color:"#fff"})}finally{d.play("click"),O(!1),D(null),L(""),W(null),F(0),Q(!1),J(null),K(!1),Ge(),await $(),await z(),await I()}},Ke=async()=>{!(l!=null&&l.fixed_code)||!(await u.fire({title:"",html:`
      <div class="text-center space-y-3">
        <div class="text-5xl text-red-400 font-bold mb-2">!</div>
        <h2 class="text-2xl font-bold text-red-400">Quit & Show Answer?</h2>
        <p class="text-gray-300 text-sm mt-2">
          Are you sure you want to quit this challenge?<br/>
          <span class="text-red-300 font-semibold">You will NOT receive any rewards.</span>
        </p>
      </div>
    `,showCancelButton:!0,confirmButtonText:"Yes, Show Answer",cancelButtonText:"Cancel",background:"#1f2937",color:"#f8fafc",confirmButtonColor:"#ef4444",cancelButtonColor:"#6b7280",width:450,padding:"2rem 1.5rem",customClass:{popup:"rounded-xl border border-gray-700/50 shadow-xl",htmlContainer:"p-0",confirmButton:"px-5 py-2 rounded-lg font-semibold",cancelButton:"px-5 py-2 rounded-lg font-semibold"}})).isConfirmed||(d.play("click"),await u.fire({title:"",html:`
      <div class="text-center mb-4">
        <h2 class="text-xl font-bold text-red-400 mb-1">You Quit the Challenge</h2>
        <p class="text-gray-300 text-sm">Here’s the correct solution 💡</p>
      </div>
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-4 text-left">
        <pre id="solo-surrender-solution"
             class="text-green-400 text-sm font-mono whitespace-pre-wrap break-words max-h-[50vh] overflow-y-auto"
             style="margin:0;"></pre>
      </div>
      <p class="mt-4 text-xs text-gray-400 text-center">
        Reminder: comments, spacing, and punctuation are compared.
      </p>
    `,width:600,background:"#1f2937",color:"#f8fafc",confirmButtonText:"Close",confirmButtonColor:"#10B981",customClass:{popup:"rounded-xl border border-gray-700/50 shadow-xl backdrop-blur-sm",confirmButton:"px-6 py-2 rounded-lg font-semibold"},didOpen:()=>{const a=document.getElementById("solo-surrender-solution");a&&(a.textContent=l.fixed_code||"")}}),await Je("abandoned"))},Ve=()=>{l!=null&&l.fixed_code&&(d.play("click"),K(!0),at("Correct Answer",l.fixed_code),u.fire({title:"Correct Answer",html:`
                    <div class="correct-answer-modal">
                        <p class="mb-4 text-gray-300">Here's the exact solution from the database (100% match required):</p>
                        <div class="bg-gray-900 rounded-lg p-4 text-left">
                            <pre class="text-green-400 text-sm overflow-auto max-h-64" style="font-family: 'Courier New', monospace; white-space: pre-wrap;">${l.fixed_code}</pre>
                        </div>
                        <p class="mt-4 text-sm text-gray-400">Your code must match this exactly to pass the challenge.</p>
                    </div>
                `,didOpen:()=>{const t=document.getElementById("solo-solution");t&&(t.textContent=l.fixed_code)},confirmButtonText:"Got it!",background:"#1f2937",color:"#fff",confirmButtonColor:"#10B981",width:"600px"}))},Ze=t=>{switch(t){case"easy":return f.chipEasyStyle;case"medium":return f.chipMedStyle;case"hard":return f.chipHardStyle;default:return f.chipBlueStyle}},et=t=>t==="fixbugs"?ut:ft,_e=t=>t==="fixbugs"?"text-yellow-400":"text-purple-400",tt=t=>{const a=Math.floor(t/60),s=t%60;return`${a}:${s.toString().padStart(2,"0")}`},st=new Set(["completed","abandoned"]),Se=Y.filter(t=>{const a=c==null?void 0:c.completed_challenge_ids.includes(t.id),s=De[t.id];return!(a||s&&st.has(s))}),re=({title:t,value:a,icon:s,color:n,animated:r=!1})=>e.jsx("div",{className:`
                bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 
                ${r?"animate-pulse glow-effect":""} 
                hover:scale-105 hover:shadow-xl transition-all duration-300 
                ${qe?"glow-success":""}
                cursor-pointer
            `,onMouseEnter:()=>d.play("hover"),children:e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx("div",{className:`p-2 rounded-lg ${n} transition-all duration-300`,children:e.jsx(s,{className:"h-5 w-5 text-white"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-gray-400",children:t}),e.jsx("p",{className:"text-lg font-bold text-white",children:a})]})]})}),at=(t,a)=>{u.fire({title:t,html:`
      <div>
        <p class="mb-3 text-gray-300">100% match required:</p>
        <div class="bg-gray-900 rounded-lg p-4 text-left">
          <pre id="swal-code"
               class="text-green-400 text-sm overflow-auto"
               style="
                 font-family:'Courier New',monospace;
                 white-space: pre;      /* keep indentation and angle brackets */
                 max-height: 70vh;      /* taller */
                 max-width: 90vw;       /* responsive */
               "></pre>
        </div>
      </div>
    `,width:900,background:"#1f2937",color:"#fff",confirmButtonText:"Got it!",confirmButtonColor:"#10B981",didOpen:()=>{var n;const s=(n=u.getHtmlContainer())==null?void 0:n.querySelector("#swal-code");s&&(s.textContent=a)}})};return e.jsxs("div",{className:"min-h-screen relative overflow-hidden",children:[e.jsx(it,{}),e.jsxs("div",{className:"absolute inset-0 overflow-hidden pointer-events-none",children:[e.jsx("div",{className:"absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20"}),e.jsx("div",{className:"absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"}),e.jsx("div",{className:"absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-10"}),e.jsx("div",{className:"absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse opacity-25"}),e.jsx("div",{className:"absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-green-400 rounded-full animate-bounce opacity-15"}),M.map(t=>e.jsx("div",{className:"absolute pointer-events-none particle-effect",style:{left:`${t.x}px`,top:`${t.y}px`,backgroundColor:t.color,width:`${t.size}px`,height:`${t.size}px`,borderRadius:"50%",opacity:t.life/t.maxLife,boxShadow:`0 0 ${t.size}px ${t.color}`}},t.id))]}),ze&&e.jsx("div",{className:"fixed inset-0 bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-md z-50 flex items-center justify-center animate-fadeIn",children:e.jsxs("div",{className:"text-center text-white animate-bounceIn levelup-container",children:[e.jsxs("div",{className:"crown-animation mb-6",children:[e.jsx(ne,{className:"w-24 h-24 mx-auto text-yellow-400 animate-spin-slow"}),e.jsx("div",{className:"crown-glow"})]}),e.jsx("h2",{className:"text-8xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse",children:"LEVEL UP!"}),e.jsxs("p",{className:"text-3xl opacity-90 animate-slideInUp",children:["You reached Level ",c==null?void 0:c.current_level,"!"]}),e.jsx("div",{className:"mt-6 animate-slideInUp delay-300",children:e.jsxs("div",{className:"inline-flex items-center space-x-2 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm",children:[e.jsx(Ae,{className:"w-5 h-5 text-yellow-400"}),e.jsxs("span",{className:"text-lg font-semibold",children:["Only ",c==null?void 0:c.xp_to_next_level," XP to next level!"]}),e.jsx(Ae,{className:"w-5 h-5 text-yellow-400"})]})})]})}),e.jsxs(ot,{breadcrumbs:gt,children:[e.jsx(rt,{title:"Training Challenge"}),e.jsxs("div",{className:`flex flex-col gap-6 p-4 relative z-10 ${Ue?"animate-shake":""}`,children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(Ee,{className:`h-8 w-8 text-cyan-400 ${Ye?"animate-spin":""} transition-all duration-300`}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold",children:"TRAINING CHALLENGES"}),e.jsx("p",{className:"text-gray-400 text-sm",children:"Master coding challenges and level up your skills"})]})]}),e.jsx("div",{className:"flex items-center space-x-3"})]}),c&&e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:`${f.panelClass} p-6`,style:f.panelStyle,children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(ne,{className:"h-6 w-6 text-yellow-400"}),e.jsxs("span",{className:"text-xl font-bold text-white",children:["Level ",c.current_level]}),e.jsxs("div",{className:"text-sm text-gray-400",children:["(",je(c.total_xp),"/10 XP)"]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("div",{className:"text-gray-400 text-sm",children:"Next Level"}),e.jsxs("div",{className:"text-cyan-400 font-bold",children:[c.xp_to_next_level," XP needed"]})]})]}),e.jsxs("div",{className:"w-full h-3 bg-gray-700 rounded-full h-4 overflow-hidden relative",children:[e.jsx("div",{className:`bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 ease-out progress-bar-glow ${Re?"animate-pulse":""}`,style:{width:`${we(c.total_xp)}%`},children:e.jsx("div",{className:"absolute inset-0 bg-white/20 rounded-full animate-pulse"})}),e.jsx("div",{className:"absolute inset-0 flex items-center justify-center",children:e.jsxs("span",{className:"text-xs font-bold text-white drop-shadow-lg",children:[Math.round(we(c.total_xp)),"%"]})})]}),e.jsxs("div",{className:"flex justify-between text-xs text-gray-400 mt-2",children:[e.jsxs("span",{children:["Level ",c.current_level]}),e.jsxs("span",{children:[je(c.total_xp)," / 10 XP"]}),e.jsxs("span",{children:["Level ",c.current_level+1]})]})]}),e.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-3 gap-4",children:[e.jsx(re,{title:"Level",value:c.current_level,icon:ne,color:"bg-orange-500"}),e.jsx(re,{title:"Total XP",value:c.total_xp||0,icon:ie,color:"bg-yellow-500"}),e.jsx(re,{title:"Completed",value:c.successful_attempts||0,icon:ce,color:"bg-green-500",animated:Xe})]})]}),e.jsx("div",{className:`${f.panelClass} p-6`,style:f.panelStyle,children:e.jsxs("div",{className:"flex flex-col md:flex-row gap-4",children:[e.jsx("div",{className:"flex-1",children:e.jsxs("div",{className:"relative",children:[e.jsx(ct,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"}),e.jsx("input",{type:"text",placeholder:"Search challenges by title...",value:N,onChange:t=>Me(t.target.value),className:"w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-gray-400 transition-all duration-300"})]})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:w,onChange:t=>Fe(t.target.value),className:"px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300",children:[e.jsx("option",{value:"all",children:"All Languages"}),e.jsx("option",{value:"python",children:"Python"}),e.jsx("option",{value:"java",children:"Java"}),e.jsx("option",{value:"cpp",children:"C++"})]}),e.jsxs("select",{value:j,onChange:t=>Pe(t.target.value),className:"px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300",children:[e.jsx("option",{value:"all",children:"All Difficulties"}),e.jsx("option",{value:"easy",children:"Easy"}),e.jsx("option",{value:"medium",children:"Medium"}),e.jsx("option",{value:"hard",children:"Hard"})]}),e.jsxs("button",{onClick:()=>{d.play("click"),Oe(),xe(!0)},className:"flex items-center gap-2 px-4 py-3 rounded-lg bg-green-600/70 border border-green-500/50 text-white hover:bg-green-700 transition-all duration-300",onMouseEnter:()=>d.play("hover"),children:[e.jsx(ce,{className:"h-4 w-4"}),e.jsx("span",{children:"Completed"})]})]})]})}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:Be?e.jsx("div",{className:"col-span-full flex items-center justify-center py-12",children:e.jsxs("div",{className:"text-center",children:[e.jsx(U,{className:"h-8 w-8 animate-spin mx-auto mb-2 text-cyan-400"}),e.jsx("div",{className:"text-gray-300",children:"Loading challenges..."})]})}):Se.length===0?e.jsxs("div",{className:"col-span-full text-center py-12 completion-celebration",children:[e.jsx("div",{className:"trophy-large mb-4",children:"🏆"}),e.jsx("div",{className:"text-2xl font-bold text-white mb-2",children:"Outstanding Achievement!"}),e.jsx("div",{className:"text-gray-400",children:Y.length===0?"No challenges match your current filters":"You have conquered all available challenges!"})]}):Se.map(t=>{const a=et(t.mode);return e.jsxs("div",{className:"bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:border-cyan-500/50 challenge-card",onMouseEnter:()=>d.play("hover"),children:[e.jsxs("div",{className:"flex items-start justify-between mb-4",children:[e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(a,{className:`h-5 w-5 ${_e(t.mode)}`}),e.jsx("span",{className:`text-xs font-bold uppercase ${_e(t.mode)}`,children:t.mode==="fixbugs"?"Fix Bugs":"Random"})]}),e.jsxs("div",{className:"flex space-x-2",children:[e.jsx("span",{className:f.chipClass,style:f.chipBlueStyle,children:de(t.language)}),e.jsx("span",{className:f.chipClass,style:Ze(t.difficulty),children:t.difficulty.toUpperCase()})]})]}),e.jsx("h3",{className:"text-lg font-bold text-white mb-2",children:t.title}),t.description&&e.jsx("p",{className:"text-sm text-gray-400 mb-4 line-clamp-3",children:t.description}),e.jsxs("div",{className:"flex items-center justify-between mt-4",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsxs("div",{className:"flex items-center space-x-1 text-yellow-400",children:[e.jsx(ie,{className:"h-4 w-4"}),e.jsxs("span",{className:"text-sm font-medium",children:[t.reward_xp," XP"]})]}),t.hint&&e.jsx("div",{className:"flex items-center space-x-1 text-cyan-400",title:"Has hint",children:e.jsx(Le,{className:"h-4 w-4"})})]}),e.jsxs("button",{onClick:()=>ke(t),className:`flex items-center space-x-2 px-4 py-2 ${f.btnPrimaryClass}`,style:f.btnPrimaryStyle,children:[e.jsx(dt,{className:"h-4 w-4"}),e.jsx("span",{children:"Start"})]})]})]},t.id)})}),Te&&e.jsx("div",{className:"fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4",children:e.jsxs("div",{className:"relative bg-gray-800/95 border border-gray-700/50 rounded-xl w-full max-w-5xl max-h-[80vh] overflow-y-auto shadow-2xl animate-fadeIn",children:[e.jsxs("div",{className:"flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4",children:[e.jsxs("h3",{className:"text-xl font-bold text-white flex items-center gap-2",children:[e.jsx(ce,{className:"h-5 w-5"}),"Completed & Abandoned Challenges"]}),e.jsx("button",{onClick:()=>{d.play("click"),xe(!1)},className:"text-white hover:text-red-300 transition",children:"✖"})]}),e.jsx("div",{className:"p-6 space-y-4",children:Ie?e.jsx("div",{className:"flex justify-center py-8",children:e.jsx(U,{className:"h-6 w-6 text-green-400 animate-spin"})}):ue.length===0?e.jsx("div",{className:"text-center py-10 text-gray-300",children:e.jsx("p",{children:"No completed or abandoned challenges yet."})}):e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",children:ue.map(t=>{var a,s;return e.jsxs("div",{className:`p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 ${t.status==="completed"?"bg-green-800/30 border-green-500/40 hover:bg-green-700/40":"bg-yellow-800/30 border-yellow-500/40 hover:bg-yellow-700/40"}`,children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("span",{className:`text-xs font-bold uppercase ${t.status==="completed"?"text-green-400":"text-yellow-400"}`,children:t.status}),e.jsxs("span",{className:"text-xs text-gray-400",children:[de(t.language)," • ",t.difficulty]})]}),e.jsx("h4",{className:"font-bold text-white mb-1",children:((a=t.challenge)==null?void 0:a.title)||"Untitled Challenge"}),e.jsx("p",{className:"text-gray-300 text-sm line-clamp-2 mb-3",children:((s=t.challenge)==null?void 0:s.description)||"No description available"}),e.jsx("div",{className:"flex justify-between items-center",children:t.status==="abandoned"?e.jsxs("button",{onClick:()=>{d.play("click");const n=Y.find(r=>r.id===t.challenge_id);n?($e(!0),ke(n)):u.fire("Challenge not found","","error")},className:"flex items-center gap-2 px-3 py-1.5 rounded-md bg-yellow-600/70 border border-yellow-400/50 text-white text-sm hover:bg-yellow-700/80 transition-all",children:[e.jsx(U,{className:"h-4 w-4"}),"Retake (No XP)"]}):e.jsxs("span",{className:"text-green-400 text-sm font-semibold flex items-center gap-1",children:[e.jsx(ie,{className:"h-4 w-4"}),"Completed"]})})]},t.id)})})})]})}),C&&l&&e.jsx("div",{className:"fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-[10000] pointer-events-auto flex items-center justify-center p-4",children:e.jsxs("div",{className:"relative z-[10001] bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden animate-fadeInUp",children:[e.jsx("div",{className:"bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("h3",{className:"text-lg font-bold text-white flex items-center",children:[e.jsx(Ee,{className:"h-5 w-5 mr-2"}),l.title]}),e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsxs("div",{className:"flex items-center space-x-2 text-white",children:[e.jsx(nt,{className:"h-4 w-4"}),e.jsx("span",{className:"text-sm font-medium",children:tt(k)})]}),e.jsxs("button",{onClick:Ke,className:`rounded-lg px-3 py-1.5 text-sm font-semibold flex items-center gap-2
                                                                bg-red-500/20 border border-red-400/40 text-red-200
                                                                hover:bg-red-500/30 hover:text-white transition-all duration-200`,title:"Quit & Show Answer",children:[e.jsx(mt,{className:"h-4 w-4"}),e.jsx("span",{children:"Quit & Show Answer"})]})]})]})}),e.jsxs("div",{className:"p-6 space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Language"}),e.jsx("div",{className:"text-lg font-bold text-white",children:de(l.language)})]}),e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Difficulty"}),e.jsx("div",{className:"text-lg font-bold text-white capitalize",children:l.difficulty})]}),e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Reward"}),e.jsx("div",{className:"text-lg font-bold text-yellow-400",children:ge?"No XP":`${l.reward_xp} XP`})]})]}),l.description&&e.jsxs("div",{className:"bg-gray-900/30 rounded-lg p-4",children:[e.jsx("h4",{className:"text-cyan-400 font-bold mb-2",children:"Description"}),e.jsx("p",{className:"text-gray-200",children:l.description})]}),l.hint&&e.jsxs("div",{className:"bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4",children:[e.jsxs("h4",{className:"text-yellow-400 font-bold mb-2 flex items-center",children:[e.jsx(Le,{className:"h-4 w-4 mr-2"}),"Hint"]}),e.jsx("p",{className:"text-yellow-200",children:l.hint})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-cyan-400 font-bold mb-2",children:"Your Code"}),e.jsx("textarea",{value:h,onChange:t=>L(t.target.value),className:"w-full h-64 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200 font-mono text-sm transition-all duration-300",placeholder:"Write your solution here..."})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center space-x-2",children:[P&&!(g!=null&&g.isCorrect)&&e.jsxs("button",{onClick:Ve,disabled:B,className:"flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105",children:[e.jsx(pt,{className:"h-4 w-4"}),e.jsx("span",{children:"FOR DEMO ONLY"})]}),P&&g&&e.jsx("div",{className:"text-sm text-gray-400",children:g.isCorrect?e.jsx("span",{className:"text-green-400 font-medium",children:"✅ Perfect 100% match!"}):e.jsxs("span",{className:"text-yellow-400 font-medium",children:["📊 ",Math.round(g.similarity*100),"% similarity (need 100%)"]})})]}),e.jsx("div",{className:"flex items-center space-x-3",children:(!P||!(g!=null&&g.isCorrect))&&e.jsxs("button",{onClick:Qe,disabled:B||!h.trim(),className:"flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105",children:[B?e.jsx(U,{className:"h-4 w-4 animate-spin"}):e.jsx(xt,{className:"h-4 w-4"}),e.jsx("span",{children:B?"Submitting...":P?"Try Again":"Submit Solution"})]})})]})]})]})})]})]}),e.jsx("style",{children:`
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

            `})]})}export{Xt as default};
