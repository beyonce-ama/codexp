import{K as We,r as i,j as e,L as Je}from"./app-CXtz5dwq.js";import{b as m,a as w,A as Ke,T as re,C as Qe}from"./app-layout-Bji_u6Wz.js";import{S as f}from"./sweetalert2.esm.all-acGi8jXx.js";import{A as Ve}from"./AnimatedBackground-CZimKHxy.js";import{C as le}from"./crown-C6Sc-rnd.js";import{S as we}from"./sparkles-BcTUXITV.js";import{T as je}from"./trophy-DnfUZ-GT.js";import{C as Ze}from"./circle-check-big-G5I5lCCi.js";import{S as et}from"./search-DIErVXQw.js";import{R as Ne}from"./refresh-cw-Dw0PckJw.js";import{L as ke}from"./lightbulb-C8DgI19m.js";import{P as tt}from"./play-k5K6A1M_.js";import{B as at}from"./x-1eyH-ZKL.js";import{S as st}from"./send-C2hbVX9B.js";import{T as rt}from"./triangle-alert-CGA_IeBv.js";import{Z as lt}from"./zap-8qzNu98X.js";import"./utils-jAU0Cazi.js";import"./createLucideIcon-BupTRr7W.js";import"./users-DPCgKmzj.js";const ot=[{title:"Home",href:"/dashboard"},{title:"Practice",href:"#"},{title:"Solo Challenge",href:"/play/solo"}],x={panelClass:"rounded-xl border",panelStyle:{background:"var(--panel-bg, rgba(17,24,39,0.50))",borderColor:"var(--panel-border, rgba(75,85,99,0.50))",backdropFilter:"blur(6px)"},chipClass:"px-2 py-1 text-xs font-semibold rounded-full border",chipBlueStyle:{background:"var(--chip-blue-bg, rgba(30,58,138,0.30))",borderColor:"var(--chip-blue-border, rgba(59,130,246,0.50))",color:"var(--chip-blue-text, #93c5fd)"},chipEasyStyle:{background:"var(--chip-easy-bg, rgba(6,78,59,0.30))",borderColor:"var(--chip-easy-border, rgba(16,185,129,0.50))",color:"var(--chip-easy-text, #86efac)"},chipMedStyle:{background:"var(--chip-med-bg, rgba(113,63,18,0.30))",borderColor:"var(--chip-med-border, rgba(234,179,8,0.50))",color:"var(--chip-med-text, #fde68a)"},chipHardStyle:{background:"var(--chip-hard-bg, rgba(127,29,29,0.30))",borderColor:"var(--chip-hard-border, rgba(248,113,113,0.50))",color:"var(--chip-hard-text, #fca5a5)"},btnPrimaryClass:"rounded-lg shadow-lg hover:scale-110 transition-all duration-300",btnPrimaryStyle:{background:"var(--btn-primary, linear-gradient(90deg,#06b6d4,#2563eb))",color:"var(--btn-primary-text, #fff)"}},it={python:"Python",java:"Java",cpp:"C++"},_e=v=>it[v]??v.toUpperCase();function Lt(){const{auth:v}=We().props;v==null||v.user;const[oe,ie]=i.useState([]),[c,X]=i.useState(null),[Ce,ne]=i.useState(!0),[nt,ce]=i.useState(!0),[q,ct]=i.useState("all"),[C,Se]=i.useState("all"),[S,Ee]=i.useState("all"),[E,Ae]=i.useState(""),[r,D]=i.useState(null),[j,Y]=i.useState(!1),[g,A]=i.useState(""),[L,O]=i.useState(!1),[b,F]=i.useState(0),[R,H]=i.useState(null),[B,G]=i.useState(!1),[h,W]=i.useState(null),[dt,J]=i.useState(!1),[P,de]=i.useState([]),[Le,K]=i.useState(!1),[Fe,Q]=i.useState(!1),[Be,me]=i.useState(!1),[Pe,V]=i.useState(!1),[Me,Z]=i.useState(!1),[Te,pe]=i.useState(!1),M=i.useRef(),[Ie,ue]=i.useState({});i.useEffect(()=>{j?document.body.classList.add("modal-open"):document.body.classList.remove("modal-open")},[j]),i.useEffect(()=>{m.registerSfx("success","/sounds/correct.mp3"),m.registerSfx("failure","/sounds/failure.mp3"),m.registerSfx("levelup","/sounds/levelup.mp3"),m.registerSfx("click","/sounds/click.mp3"),m.registerSfx("hover","/sounds/hover.mp3"),m.registerSfx("victory","/sounds/victory.mp3"),m.registerSfx("streak","/sounds/streak.mp3"),m.registerSfx("typing","/sounds/typing.mp3")},[]);const ee=t=>Math.floor(t/10)+1,te=t=>10-t%10,xe=t=>t%10/10*100,fe=t=>t%10;i.useEffect(()=>{I(),$(),T()},[q,C,S,E]),i.useEffect(()=>{const t=!!(j&&r);try{window.__modalOpen=t,window.dispatchEvent(new CustomEvent("app:modal",{detail:{open:t}}))}catch{}const s=document.documentElement;return t?s.classList.add("overflow-hidden"):s.classList.remove("overflow-hidden"),()=>s.classList.remove("overflow-hidden")},[j,r]),i.useEffect(()=>{let t;return R&&(t=setInterval(()=>{F(Math.floor((Date.now()-R.getTime())/1e3))},1e3)),()=>{t&&clearInterval(t)}},[R]),i.useEffect(()=>{if(P.length>0){const t=()=>{de(s=>s.map(a=>({...a,x:a.x+a.vx,y:a.y+a.vy,vy:a.vy-.15,life:a.life-1,size:a.size*.99})).filter(a=>a.life>0)),P.length>0&&(M.current=requestAnimationFrame(t))};M.current=requestAnimationFrame(t)}return()=>{M.current&&cancelAnimationFrame(M.current)}},[P.length]);const T=async()=>{try{const t=await w.get("/api/solo/taken");if(t.success){const s=(t.data||[]).reduce((a,n)=>(a[n.challenge_id]=n.status,a),{});ue(s)}}catch(t){console.error("Error fetching taken rows:",t),ue({})}},I=async()=>{try{ne(!0);const t={};q!=="all"&&(t.mode=q),C!=="all"&&(t.language=C),S!=="all"&&(t.difficulty=S),E.trim()&&(t.search=E.trim());const s=await w.get("/api/challenges/solo",t);if(s.success){const a=s.data.data||s.data||[];ie(a)}}catch(t){console.error("Error fetching challenges:",t),ie([])}finally{ne(!1)}},$=async()=>{var t,s,a;try{ce(!0);const n=await w.get("/api/me/stats");if(n.success&&n.data){const o=n.data,p=((t=o.totals)==null?void 0:t.xp)||0;let l=[];if(o.completed_challenge_ids&&Array.isArray(o.completed_challenge_ids))l=o.completed_challenge_ids;else if((s=o.solo_stats)!=null&&s.completed_challenge_ids)l=o.solo_stats.completed_challenge_ids;else if(o.attempts){const d=o.attempts.filter(u=>u.is_correct);l=[...new Set(d.map(u=>u.challenge_id))]}else{const d=["completed_challenges","solo_completed_challenges","successful_challenge_ids","completed_solo_challenges"];for(const u of d)if(o[u]&&Array.isArray(o[u])){l=o[u],console.log(`Found completed challenges in field: ${u}`);break}}X({solo_attempts:o.solo_attempts||0,successful_attempts:o.successful_attempts||l.length,total_xp:p,total_stars:((a=o.totals)==null?void 0:a.stars)||0,attempts_today:o.attempts_today||0,current_level:ee(p),xp_to_next_level:te(p),completed_challenge_ids:l,streak:o.streak||0})}}catch(n){console.error("Error fetching user stats:",n),X({solo_attempts:0,successful_attempts:0,total_xp:0,total_stars:0,attempts_today:0,current_level:1,xp_to_next_level:10,completed_challenge_ids:[],streak:0})}finally{ce(!1)}},ge=(t,s,a="success")=>{const n={success:["#10B981","#34D399","#6EE7B7","#FBBF24","#F59E0B"],levelup:["#8B5CF6","#A78BFA","#C4B5FD","#F59E0B","#FBBF24"],streak:["#EF4444","#F87171","#FCA5A5","#FBBF24","#F59E0B"]},o=[],p=a==="levelup"?25:15;for(let l=0;l<p;l++){const d=Math.PI*2*l/p,u=Math.random()*8+4;o.push({id:Date.now()+l,x:t+(Math.random()-.5)*50,y:s+(Math.random()-.5)*30,vx:Math.cos(d)*u+(Math.random()-.5)*2,vy:Math.sin(d)*u-Math.random()*3,life:80+Math.random()*40,maxLife:80,color:n[a][Math.floor(Math.random()*n[a].length)],size:Math.random()*6+3,type:a})}de(l=>[...l,...o])},$e=()=>{const t=document.documentElement;t.requestFullscreen?t.requestFullscreen():t.webkitRequestFullscreen?t.webkitRequestFullscreen():t.msRequestFullscreen&&t.msRequestFullscreen()},ze=()=>{var t;document.fullscreenElement&&((t=document.exitFullscreen)==null||t.call(document))},Ue=t=>{if(m.play("click"),$e(),c!=null&&c.completed_challenge_ids.includes(t.id)){m.play("failure"),f.fire({icon:"info",title:"Challenge Already Completed!",text:"You have already solved this challenge. Try a different one!",timer:2e3,showConfirmButton:!1,background:"#1f2937",color:"#fff"});return}D(t),A(t.buggy_code||""),Y(!0),H(new Date),F(0)},he=(t,s)=>{const a=t.length,n=s.length;if(a===0)return n===0?1:0;if(n===0)return 0;const o=Array(n+1).fill(null).map(()=>Array(a+1).fill(null));for(let l=0;l<=a;l++)o[0][l]=l;for(let l=0;l<=n;l++)o[l][0]=l;for(let l=1;l<=n;l++)for(let d=1;d<=a;d++)t[d-1]===s[l-1]?o[l][d]=o[l-1][d-1]:o[l][d]=Math.min(o[l-1][d]+1,o[l][d-1]+1,o[l-1][d-1]+1);const p=Math.max(a,n);return(p-o[n][a])/p},Xe=(t,s)=>{var k,_;const a=t.trim(),n=(k=s.fixed_code)==null?void 0:k.trim();if(!a)return console.log("Code validation: FAIL - No code provided"),!1;if(!n)return console.log("Code validation: FAIL - No solution available in database"),!1;if(a===((_=s.buggy_code)==null?void 0:_.trim()))return console.log("Code validation: FAIL - No changes made from original buggy code"),!1;const o=se=>se.replace(/\r\n/g,`
`).replace(/\s+/g," ").replace(/\s*;\s*/g,";").replace(/\s*\{\s*/g,"{").replace(/\s*\}\s*/g,"}").replace(/\s*\(\s*/g,"(").replace(/\s*\)\s*/g,")").replace(/\s*==\s*/g,"==").replace(/\s*=\s*/g,"=").trim(),p=o(a),l=o(n);if(p===l)return console.log("Code validation: PASS - Exact match with database solution (100%)"),!0;const u=he(p,l),y=Math.round(u*100);console.log(`Code validation: FAIL - Only ${y}% similarity with database solution (requires 100%)`);const N=u>=1;return console.log(`Code validation: ${N?"PASS":"FAIL"} (${y}% similarity, requires 100%)`),N},qe=async()=>{var t;if(!r||!g.trim()){m.play("failure"),f.fire("Error","Please write some code before submitting.","error");return}try{if(O(!0),m.play("typing"),!r.fixed_code){m.play("failure"),f.fire("Error","This challenge does not have a solution stored in the database.","error"),O(!1);return}const s=Xe(g,r),a=he(g.trim().replace(/\s+/g," "),r.fixed_code.trim().replace(/\s+/g," "));W({isCorrect:s,similarity:a}),G(!0);const n={challenge_id:r.id,language:r.language,mode:r.mode,time_spent_sec:b,is_correct:s,code_submitted:g,judge_feedback:s?"Perfect! Your solution is an exact match with the expected answer from database (100% match).":`Incorrect. Your solution has ${Math.round(a*100)}% similarity with the expected answer. You need 100% match to pass. Try again or view the correct answer.`},o=await w.post("/api/solo/attempts",n);if(o.success){const p=((t=o.data)==null?void 0:t.xp_earned)||(s?r.reward_xp:0);if(s){await w.post("/api/solo/mark-taken",{challenge_id:r.id,language:r.language,difficulty:r.difficulty,mode:r.mode,status:"completed",time_spent_sec:b,code_submitted:g,earned_xp:p??0});const l=(c==null?void 0:c.total_xp)||0,d=l+p,u=ee(l),y=ee(d),N=y>u;c&&!c.completed_challenge_ids.includes(r.id)&&X(U=>U?{...U,completed_challenge_ids:[...U.completed_challenge_ids,r.id],successful_attempts:U.successful_attempts+1,total_xp:d,current_level:y,xp_to_next_level:te(d)}:null),m.play("success"),Q(!0),V(!0),Z(!0),pe(!0),setTimeout(()=>pe(!1),2e3);const k=window.innerWidth/2,_=window.innerHeight/2;ge(k,_,"success"),N&&setTimeout(()=>{m.play("levelup"),K(!0),ge(k,_-100,"levelup")},1e3),setTimeout(()=>{m.play("victory")},500);const{isConfirmed:se}=await f.fire({title:"PERFECT SOLUTION!",html:`
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

      <div class="text-sm text-gray-300">⏱️ Completed in ${Math.floor(b/60)}m ${b%60}s</div>
      ${N?`
        <div class="mt-4 text-center">
          <div class="text-lg font-bold text-pink-400 animate-pulse">✨ LEVEL UP! ✨</div>
          <p class="text-sm text-gray-200">You’ve reached Level ${y}! Next: ${te(d)} XP needed.</p>
        </div>
      `:""}
    </div>
  `,showConfirmButton:!0,confirmButtonText:"Continue Coding!",confirmButtonColor:"#10B981",background:"linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)",color:"#fff",allowOutsideClick:!1,allowEscapeKey:!1});se&&(Q(!1),V(!1),K(!1),Z(!1),Y(!1),D(null),A(""),H(null),F(0),G(!1),W(null),J(!1),await Promise.all([I(),$(),T()])),setTimeout(()=>{Q(!1),V(!1),K(!1),Z(!1)},7e3)}else m.play("failure"),me(!0),setTimeout(()=>me(!1),600),await f.fire({title:"Almost There!",html:`
                            <div class="text-center">
                            <div class="text-5xl mb-4">⚠️</div>
                            <p class="mb-3 text-lg font-semibold text-red-200">Your solution must exactly match the database answer.</p>
                            
                            <div class="bg-red-900/30 border border-red-500/40 rounded-lg p-4 mb-4">
                                <div class="text-lg font-bold text-yellow-300">${Math.round(a*100)}% Match</div>
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
                        `,timer:4500,showConfirmButton:!0,confirmButtonText:"Try Again",background:"linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)",color:"#fff",confirmButtonColor:"#3B82F6"});await Promise.all([$(),I()]),await T()}else throw new Error(o.message||"Submission failed")}catch(s){console.error("Error submitting attempt:",s),m.play("failure");let a="Failed to submit your attempt. Please try again.";s instanceof Error&&(a=s.message),f.fire("Error",a,"error")}finally{O(!1)}},be=async t=>{try{if(r){const s={challenge_id:r.id,language:r.language,difficulty:r.difficulty,mode:r.mode,status:t,time_spent_sec:b,code_submitted:g||r.buggy_code||"",earned_xp:t==="completed"?r.reward_xp??0:0};await w.post("/api/solo/mark-taken",s),console.log(`Challenge marked as ${t} in database`)}}catch(s){console.error("Error marking challenge as taken:",s),f.fire({title:"Warning",text:"Progress may not have been saved properly.",icon:"warning",timer:1500,showConfirmButton:!1,background:"#1f2937",color:"#fff"})}finally{m.play("click"),Y(!1),D(null),A(""),H(null),F(0),G(!1),W(null),J(!1),ze(),await I(),await $(),await T()}},De=async()=>{try{if(!r)return;const t=r.fixed_code;r&&g.trim()!==(r.buggy_code??"").trim()||b>0?await be("abandoned"):await be("abandoned"),t&&t.trim().length>0?ve("Correct Answer",t):f.fire({icon:"info",title:"No Stored Solution",text:"This challenge has no fixed solution saved in the database.",background:"#1f2937",color:"#fff",confirmButtonColor:"#10B981"})}catch(t){console.error("quitAndShowSolution error:",t)}},Ye=()=>{r!=null&&r.fixed_code&&(m.play("click"),J(!0),ve("Correct Answer",r.fixed_code),f.fire({title:"Correct Answer",html:`
                    <div class="correct-answer-modal">
                        <p class="mb-4 text-gray-300">Here's the exact solution from the database (100% match required):</p>
                        <div class="bg-gray-900 rounded-lg p-4 text-left">
                            <pre class="text-green-400 text-sm overflow-auto max-h-64" style="font-family: 'Courier New', monospace; white-space: pre-wrap;">${r.fixed_code}</pre>
                        </div>
                        <p class="mt-4 text-sm text-gray-400">Your code must match this exactly to pass the challenge.</p>
                    </div>
                `,didOpen:()=>{const t=document.getElementById("solo-solution");t&&(t.textContent=r.fixed_code)},confirmButtonText:"Got it!",background:"#1f2937",color:"#fff",confirmButtonColor:"#10B981",width:"600px"}))},Oe=t=>{switch(t){case"easy":return x.chipEasyStyle;case"medium":return x.chipMedStyle;case"hard":return x.chipHardStyle;default:return x.chipBlueStyle}},Re=t=>t==="fixbugs"?rt:lt,ye=t=>t==="fixbugs"?"text-yellow-400":"text-purple-400",He=t=>{const s=Math.floor(t/60),a=t%60;return`${s}:${a.toString().padStart(2,"0")}`},Ge=new Set(["completed","abandoned"]),ae=oe.filter(t=>{const s=c==null?void 0:c.completed_challenge_ids.includes(t.id),a=Ie[t.id];return!(s||a&&Ge.has(a))}),z=({title:t,value:s,icon:a,color:n,animated:o=!1})=>e.jsx("div",{className:`
                bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 
                ${o?"animate-pulse glow-effect":""} 
                hover:scale-105 hover:shadow-xl transition-all duration-300 
                ${Me?"glow-success":""}
                cursor-pointer
            `,onMouseEnter:()=>m.play("hover"),children:e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx("div",{className:`p-2 rounded-lg ${n} transition-all duration-300`,children:e.jsx(a,{className:"h-5 w-5 text-white"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-gray-400",children:t}),e.jsx("p",{className:"text-lg font-bold text-white",children:s})]})]})}),ve=(t,s)=>{f.fire({title:t,html:`
      <div class="correct-answer-modal">
        <p class="mb-4 text-gray-300">100% match required:</p>
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
    `,width:900,background:"#1f2937",color:"#fff",confirmButtonText:"Got it!",confirmButtonColor:"#10B981",didOpen:()=>{var n;const a=(n=f.getHtmlContainer())==null?void 0:n.querySelector("#swal-code");a&&(a.textContent=s)}})};return e.jsxs("div",{className:"min-h-screen relative overflow-hidden",children:[e.jsx(Ve,{}),e.jsxs("div",{className:"absolute inset-0 overflow-hidden pointer-events-none",children:[e.jsx("div",{className:"absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20"}),e.jsx("div",{className:"absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"}),e.jsx("div",{className:"absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-10"}),e.jsx("div",{className:"absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse opacity-25"}),e.jsx("div",{className:"absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-green-400 rounded-full animate-bounce opacity-15"}),P.map(t=>e.jsx("div",{className:"absolute pointer-events-none particle-effect",style:{left:`${t.x}px`,top:`${t.y}px`,backgroundColor:t.color,width:`${t.size}px`,height:`${t.size}px`,borderRadius:"50%",opacity:t.life/t.maxLife,boxShadow:`0 0 ${t.size}px ${t.color}`}},t.id))]}),Le&&e.jsx("div",{className:"fixed inset-0 bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-md z-50 flex items-center justify-center animate-fadeIn",children:e.jsxs("div",{className:"text-center text-white animate-bounceIn levelup-container",children:[e.jsxs("div",{className:"crown-animation mb-6",children:[e.jsx(le,{className:"w-24 h-24 mx-auto text-yellow-400 animate-spin-slow"}),e.jsx("div",{className:"crown-glow"})]}),e.jsx("h2",{className:"text-8xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse",children:"LEVEL UP!"}),e.jsxs("p",{className:"text-3xl opacity-90 animate-slideInUp",children:["You reached Level ",c==null?void 0:c.current_level,"!"]}),e.jsx("div",{className:"mt-6 animate-slideInUp delay-300",children:e.jsxs("div",{className:"inline-flex items-center space-x-2 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm",children:[e.jsx(we,{className:"w-5 h-5 text-yellow-400"}),e.jsxs("span",{className:"text-lg font-semibold",children:["Only ",c==null?void 0:c.xp_to_next_level," XP to next level!"]}),e.jsx(we,{className:"w-5 h-5 text-yellow-400"})]})})]})}),e.jsxs(Ke,{breadcrumbs:ot,children:[e.jsx(Je,{title:"Solo Challenge"}),e.jsxs("div",{className:`flex flex-col gap-6 p-4 relative z-10 ${Be?"animate-shake":""}`,children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(re,{className:`h-8 w-8 text-cyan-400 ${Pe?"animate-spin":""} transition-all duration-300`}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold",children:"SOLO CHALLENGE"}),e.jsx("p",{className:"text-gray-400 text-sm",children:"Master coding challenges and level up your skills"})]})]}),e.jsx("div",{className:"flex items-center space-x-3"})]}),c&&e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:`${x.panelClass} p-6`,style:x.panelStyle,children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(le,{className:"h-6 w-6 text-yellow-400"}),e.jsxs("span",{className:"text-xl font-bold text-white",children:["Level ",c.current_level]}),e.jsxs("div",{className:"text-sm text-gray-400",children:["(",fe(c.total_xp),"/10 XP)"]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("div",{className:"text-gray-400 text-sm",children:"Next Level"}),e.jsxs("div",{className:"text-cyan-400 font-bold",children:[c.xp_to_next_level," XP needed"]})]})]}),e.jsxs("div",{className:"w-full h-3 bg-gray-700 rounded-full h-4 overflow-hidden relative",children:[e.jsx("div",{className:`bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 ease-out progress-bar-glow ${Te?"animate-pulse":""}`,style:{width:`${xe(c.total_xp)}%`},children:e.jsx("div",{className:"absolute inset-0 bg-white/20 rounded-full animate-pulse"})}),e.jsx("div",{className:"absolute inset-0 flex items-center justify-center",children:e.jsxs("span",{className:"text-xs font-bold text-white drop-shadow-lg",children:[Math.round(xe(c.total_xp)),"%"]})})]}),e.jsxs("div",{className:"flex justify-between text-xs text-gray-400 mt-2",children:[e.jsxs("span",{children:["Level ",c.current_level]}),e.jsxs("span",{children:[fe(c.total_xp)," / 10 XP"]}),e.jsxs("span",{children:["Level ",c.current_level+1]})]})]}),e.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[e.jsx(z,{title:"Level",value:c.current_level,icon:le,color:"bg-orange-500"}),e.jsx(z,{title:"Total XP",value:c.total_xp||0,icon:je,color:"bg-yellow-500"}),e.jsx(z,{title:"Completed",value:c.successful_attempts||0,icon:Ze,color:"bg-green-500",animated:Fe}),e.jsx(z,{title:"Available",value:ae.length,icon:re,color:"bg-cyan-500"})]})]}),e.jsx("div",{className:`${x.panelClass} p-6`,style:x.panelStyle,children:e.jsxs("div",{className:"flex flex-col md:flex-row gap-4",children:[e.jsx("div",{className:"flex-1",children:e.jsxs("div",{className:"relative",children:[e.jsx(et,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"}),e.jsx("input",{type:"text",placeholder:"Search challenges by title...",value:E,onChange:t=>Ae(t.target.value),className:"w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-gray-400 transition-all duration-300"})]})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:C,onChange:t=>Se(t.target.value),className:"px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300",children:[e.jsx("option",{value:"all",children:"All Languages"}),e.jsx("option",{value:"python",children:"Python"}),e.jsx("option",{value:"java",children:"Java"}),e.jsx("option",{value:"cpp",children:"C++"})]}),e.jsxs("select",{value:S,onChange:t=>Ee(t.target.value),className:"px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300",children:[e.jsx("option",{value:"all",children:"All Difficulties"}),e.jsx("option",{value:"easy",children:"Easy"}),e.jsx("option",{value:"medium",children:"Medium"}),e.jsx("option",{value:"hard",children:"Hard"})]})]})]})}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:Ce?e.jsx("div",{className:"col-span-full flex items-center justify-center py-12",children:e.jsxs("div",{className:"text-center",children:[e.jsx(Ne,{className:"h-8 w-8 animate-spin mx-auto mb-2 text-cyan-400"}),e.jsx("div",{className:"text-gray-300",children:"Loading challenges..."})]})}):ae.length===0?e.jsxs("div",{className:"col-span-full text-center py-12 completion-celebration",children:[e.jsx("div",{className:"trophy-large mb-4",children:"🏆"}),e.jsx("div",{className:"text-2xl font-bold text-white mb-2",children:"Outstanding Achievement!"}),e.jsx("div",{className:"text-gray-400",children:oe.length===0?"No challenges match your current filters":"You have conquered all available challenges!"})]}):ae.map(t=>{const s=Re(t.mode);return e.jsxs("div",{className:"bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:border-cyan-500/50 challenge-card",onMouseEnter:()=>m.play("hover"),children:[e.jsxs("div",{className:"flex items-start justify-between mb-4",children:[e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(s,{className:`h-5 w-5 ${ye(t.mode)}`}),e.jsx("span",{className:`text-xs font-bold uppercase ${ye(t.mode)}`,children:t.mode==="fixbugs"?"Fix Bugs":"Random"})]}),e.jsxs("div",{className:"flex space-x-2",children:[e.jsx("span",{className:x.chipClass,style:x.chipBlueStyle,children:_e(t.language)}),e.jsx("span",{className:x.chipClass,style:Oe(t.difficulty),children:t.difficulty.toUpperCase()})]})]}),e.jsx("h3",{className:"text-lg font-bold text-white mb-2",children:t.title}),t.description&&e.jsx("p",{className:"text-sm text-gray-400 mb-4 line-clamp-3",children:t.description}),e.jsxs("div",{className:"flex items-center justify-between mt-4",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsxs("div",{className:"flex items-center space-x-1 text-yellow-400",children:[e.jsx(je,{className:"h-4 w-4"}),e.jsxs("span",{className:"text-sm font-medium",children:[t.reward_xp," XP"]})]}),t.hint&&e.jsx("div",{className:"flex items-center space-x-1 text-cyan-400",title:"Has hint",children:e.jsx(ke,{className:"h-4 w-4"})})]}),e.jsxs("button",{onClick:()=>Ue(t),className:`flex items-center space-x-2 px-4 py-2 ${x.btnPrimaryClass}`,style:x.btnPrimaryStyle,children:[e.jsx(tt,{className:"h-4 w-4"}),e.jsx("span",{children:"Start"})]})]})]},t.id)})}),j&&r&&e.jsx("div",{className:"fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-[10000] pointer-events-auto flex items-center justify-center p-4",children:e.jsxs("div",{className:"relative z-[10001] bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden animate-fadeInUp",children:[e.jsx("div",{className:"bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("h3",{className:"text-lg font-bold text-white flex items-center",children:[e.jsx(re,{className:"h-5 w-5 mr-2"}),r.title]}),e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsxs("div",{className:"flex items-center space-x-2 text-white",children:[e.jsx(Qe,{className:"h-4 w-4"}),e.jsx("span",{className:"text-sm font-medium",children:He(b)})]}),e.jsx("button",{onClick:De,className:"text-xs md:text-sm font-semibold px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200",title:"Quit and show correct solution",children:"Quit and show correct solution"})]})]})}),e.jsxs("div",{className:"p-6 space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Language"}),e.jsx("div",{className:"text-lg font-bold text-white",children:_e(r.language)})]}),e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Difficulty"}),e.jsx("div",{className:"text-lg font-bold text-white capitalize",children:r.difficulty})]}),e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Reward"}),e.jsxs("div",{className:"text-lg font-bold text-yellow-400",children:[r.reward_xp," XP"]})]})]}),r.description&&e.jsxs("div",{className:"bg-gray-900/30 rounded-lg p-4",children:[e.jsx("h4",{className:"text-cyan-400 font-bold mb-2",children:"Description"}),e.jsx("p",{className:"text-gray-200",children:r.description})]}),r.hint&&e.jsxs("div",{className:"bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4",children:[e.jsxs("h4",{className:"text-yellow-400 font-bold mb-2 flex items-center",children:[e.jsx(ke,{className:"h-4 w-4 mr-2"}),"Hint"]}),e.jsx("p",{className:"text-yellow-200",children:r.hint})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-cyan-400 font-bold mb-2",children:"Your Code"}),e.jsx("textarea",{value:g,onChange:t=>A(t.target.value),className:"w-full h-64 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200 font-mono text-sm transition-all duration-300",placeholder:"Write your solution here..."})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center space-x-2",children:[B&&!(h!=null&&h.isCorrect)&&e.jsxs("button",{onClick:Ye,disabled:L,className:"flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105",children:[e.jsx(at,{className:"h-4 w-4"}),e.jsx("span",{children:"Show Correct Answer"})]}),B&&h&&e.jsx("div",{className:"text-sm text-gray-400",children:h.isCorrect?e.jsx("span",{className:"text-green-400 font-medium",children:"✅ Perfect 100% match!"}):e.jsxs("span",{className:"text-yellow-400 font-medium",children:["📊 ",Math.round(h.similarity*100),"% similarity (need 100%)"]})})]}),e.jsx("div",{className:"flex items-center space-x-3",children:(!B||!(h!=null&&h.isCorrect))&&e.jsxs("button",{onClick:qe,disabled:L||!g.trim(),className:"flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105",children:[L?e.jsx(Ne,{className:"h-4 w-4 animate-spin"}):e.jsx(st,{className:"h-4 w-4"}),e.jsx("span",{children:L?"Submitting...":B?"Try Again":"Submit Solution"})]})})]})]})]})})]})]}),e.jsx("style",{children:`
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

            `})]})}export{Lt as default};
