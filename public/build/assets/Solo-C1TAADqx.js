import{K as He,r as n,j as e,L as Ge}from"./app-BJhQd_PZ.js";import{b as m,a as k,A as We,T as be,C as Qe,S as f}from"./app-layout-Dle9PyH0.js";import{A as Je}from"./AnimatedBackground-D4Tfl3W2.js";import{C as ae}from"./crown-BRqejXGR.js";import{S as ye}from"./sparkles-dcyrORPX.js";import{T as ve}from"./trophy-_adu0j5O.js";import{C as Ke}from"./circle-check-big-CXiULuHG.js";import{S as Ve}from"./search-DeN1i7bI.js";import{R as we}from"./refresh-cw-CxWP3tcZ.js";import{L as je}from"./lightbulb-CDEcUafz.js";import{P as Ze}from"./play-BhCQaBA6.js";import{X as et}from"./x-D63ij1Yn.js";import{S as tt}from"./send-tgPyFjpZ.js";import{T as st}from"./triangle-alert-Df00j_ld.js";import{Z as at}from"./zap-BcfkSNOI.js";import"./utils-jAU0Cazi.js";import"./createLucideIcon-BKKyVU85.js";import"./users-BBAKaOU6.js";const rt=[{title:"Home",href:"/dashboard"},{title:"Practice",href:"#"},{title:"Training Challenge",href:"/play/solo"}],x={panelClass:"rounded-xl border",panelStyle:{background:"var(--panel-bg, rgba(17,24,39,0.50))",borderColor:"var(--panel-border, rgba(75,85,99,0.50))",backdropFilter:"blur(6px)"},chipClass:"px-2 py-1 text-xs font-semibold rounded-full border",chipBlueStyle:{background:"var(--chip-blue-bg, rgba(30,58,138,0.30))",borderColor:"var(--chip-blue-border, rgba(59,130,246,0.50))",color:"var(--chip-blue-text, #93c5fd)"},chipEasyStyle:{background:"var(--chip-easy-bg, rgba(6,78,59,0.30))",borderColor:"var(--chip-easy-border, rgba(16,185,129,0.50))",color:"var(--chip-easy-text, #86efac)"},chipMedStyle:{background:"var(--chip-med-bg, rgba(113,63,18,0.30))",borderColor:"var(--chip-med-border, rgba(234,179,8,0.50))",color:"var(--chip-med-text, #fde68a)"},chipHardStyle:{background:"var(--chip-hard-bg, rgba(127,29,29,0.30))",borderColor:"var(--chip-hard-border, rgba(248,113,113,0.50))",color:"var(--chip-hard-text, #fca5a5)"},btnPrimaryClass:"rounded-lg shadow-lg hover:scale-110 transition-all duration-300",btnPrimaryStyle:{background:"var(--btn-primary, linear-gradient(90deg,#06b6d4,#2563eb))",color:"var(--btn-primary-text, #fff)"}},lt={python:"Python",java:"Java",cpp:"C++"},Ne=b=>lt[b]??b.toUpperCase();function St(){const{auth:b}=He().props;b==null||b.user;const[re,z]=n.useState([]),[i,X]=n.useState(null),[ke,le]=n.useState(!0),[ot,oe]=n.useState(!0),[A,nt]=n.useState("all"),[y,_e]=n.useState("all"),[v,Ce]=n.useState("all"),[w,Se]=n.useState(""),[o,U]=n.useState(null),[_,Y]=n.useState(!1),[g,L]=n.useState(""),[q,D]=n.useState(!1),[j,F]=n.useState(0),[R,O]=n.useState(null),[H,G]=n.useState(!1),[N,W]=n.useState(null),[it,ne]=n.useState(!1),[B,ie]=n.useState([]),[Ee,Q]=n.useState(!1),[Ae,J]=n.useState(!1),[Le,ce]=n.useState(!1),[Fe,K]=n.useState(!1),[Be,V]=n.useState(!1),[Pe,de]=n.useState(!1),P=n.useRef(),[Te,me]=n.useState({});n.useEffect(()=>{_?document.body.classList.add("modal-open"):document.body.classList.remove("modal-open")},[_]),n.useEffect(()=>{m.registerSfx("success","/sounds/correct.mp3"),m.registerSfx("failure","/sounds/failure.mp3"),m.registerSfx("levelup","/sounds/levelup.mp3"),m.registerSfx("click","/sounds/click.mp3"),m.registerSfx("hover","/sounds/hover.mp3"),m.registerSfx("victory","/sounds/victory.mp3"),m.registerSfx("streak","/sounds/streak.mp3"),m.registerSfx("typing","/sounds/typing.mp3")},[]);const Z=t=>Math.floor(t/10)+1,ee=t=>10-t%10,pe=t=>t%10/10*100,ue=t=>t%10;n.useEffect(()=>{I(),M(),T()},[A,y,v,w]),n.useEffect(()=>{const t=!!(_&&o);try{window.__modalOpen=t,window.dispatchEvent(new CustomEvent("app:modal",{detail:{open:t}}))}catch{}const s=document.documentElement;return t?s.classList.add("overflow-hidden"):s.classList.remove("overflow-hidden"),()=>s.classList.remove("overflow-hidden")},[_,o]),n.useEffect(()=>{let t;return R&&(t=setInterval(()=>{F(Math.floor((Date.now()-R.getTime())/1e3))},1e3)),()=>{t&&clearInterval(t)}},[R]),n.useEffect(()=>{if(B.length>0){const t=()=>{ie(s=>s.map(a=>({...a,x:a.x+a.vx,y:a.y+a.vy,vy:a.vy-.15,life:a.life-1,size:a.size*.99})).filter(a=>a.life>0)),B.length>0&&(P.current=requestAnimationFrame(t))};P.current=requestAnimationFrame(t)}return()=>{P.current&&cancelAnimationFrame(P.current)}},[B.length]);const T=async()=>{try{const t=await k.get("/api/solo/taken");if(t.success){const s=(t.data||[]).reduce((a,c)=>(a[c.challenge_id]=c.status,a),{});me(s)}}catch(t){console.error("Error fetching taken rows:",t),me({})}},I=async()=>{var t;try{le(!0);const s={};A&&A!=="all"&&(s.mode=A),y&&y!=="all"&&(s.language=y),v&&v!=="all"&&(s.difficulty=v),w!=null&&w.trim()&&(s.search=w.trim()),y==="all"&&v!=="all"&&(s.per_page=500);const a=await k.get("/api/challenges/solo",s);if(a!=null&&a.success){const c=((t=a.data)==null?void 0:t.data)||a.data||[];z(c)}else z([])}catch(s){console.error("Error fetching challenges:",s),z([])}finally{le(!1)}},M=async()=>{var t,s,a;try{oe(!0);const c=await k.get("/api/me/stats");if(c.success&&c.data){const l=c.data,p=((t=l.totals)==null?void 0:t.xp)||0;let r=[];if(l.completed_challenge_ids&&Array.isArray(l.completed_challenge_ids))r=l.completed_challenge_ids;else if((s=l.solo_stats)!=null&&s.completed_challenge_ids)r=l.solo_stats.completed_challenge_ids;else if(l.attempts){const d=l.attempts.filter(u=>u.is_correct);r=[...new Set(d.map(u=>u.challenge_id))]}else{const d=["completed_challenges","solo_completed_challenges","successful_challenge_ids","completed_solo_challenges"];for(const u of d)if(l[u]&&Array.isArray(l[u])){r=l[u],console.log(`Found completed challenges in field: ${u}`);break}}X({solo_attempts:l.solo_attempts||0,successful_attempts:l.successful_attempts||r.length,total_xp:p,total_stars:((a=l.totals)==null?void 0:a.stars)||0,attempts_today:l.attempts_today||0,current_level:Z(p),xp_to_next_level:ee(p),completed_challenge_ids:r,streak:l.streak||0})}}catch(c){console.error("Error fetching user stats:",c),X({solo_attempts:0,successful_attempts:0,total_xp:0,total_stars:0,attempts_today:0,current_level:1,xp_to_next_level:10,completed_challenge_ids:[],streak:0})}finally{oe(!1)}},xe=(t,s,a="success")=>{const c={success:["#10B981","#34D399","#6EE7B7","#FBBF24","#F59E0B"],levelup:["#8B5CF6","#A78BFA","#C4B5FD","#F59E0B","#FBBF24"],streak:["#EF4444","#F87171","#FCA5A5","#FBBF24","#F59E0B"]},l=[],p=a==="levelup"?25:15;for(let r=0;r<p;r++){const d=Math.PI*2*r/p,u=Math.random()*8+4;l.push({id:Date.now()+r,x:t+(Math.random()-.5)*50,y:s+(Math.random()-.5)*30,vx:Math.cos(d)*u+(Math.random()-.5)*2,vy:Math.sin(d)*u-Math.random()*3,life:80+Math.random()*40,maxLife:80,color:c[a][Math.floor(Math.random()*c[a].length)],size:Math.random()*6+3,type:a})}ie(r=>[...r,...l])},Ie=()=>{const t=document.documentElement;t.requestFullscreen?t.requestFullscreen():t.webkitRequestFullscreen?t.webkitRequestFullscreen():t.msRequestFullscreen&&t.msRequestFullscreen()},Me=()=>{var t;document.fullscreenElement&&((t=document.exitFullscreen)==null||t.call(document))},$e=t=>{if(m.play("click"),Ie(),i!=null&&i.completed_challenge_ids.includes(t.id)){m.play("failure"),f.fire({icon:"info",title:"Challenge Already Completed!",text:"You have already solved this challenge. Try a different one!",timer:2e3,showConfirmButton:!1,background:"#1f2937",color:"#fff"});return}U(t),L(t.buggy_code||""),Y(!0),O(new Date),F(0)},fe=(t,s)=>{const a=t.length,c=s.length;if(a===0)return c===0?1:0;if(c===0)return 0;const l=Array(c+1).fill(null).map(()=>Array(a+1).fill(null));for(let r=0;r<=a;r++)l[0][r]=r;for(let r=0;r<=c;r++)l[r][0]=r;for(let r=1;r<=c;r++)for(let d=1;d<=a;d++)t[d-1]===s[r-1]?l[r][d]=l[r-1][d-1]:l[r][d]=Math.min(l[r-1][d]+1,l[r][d-1]+1,l[r-1][d-1]+1);const p=Math.max(a,c);return(p-l[c][a])/p},ze=(t,s)=>{var S,E;const a=t.trim(),c=(S=s.fixed_code)==null?void 0:S.trim();if(!a)return console.log("Code validation: FAIL - No code provided"),!1;if(!c)return console.log("Code validation: FAIL - No solution available in database"),!1;if(a===((E=s.buggy_code)==null?void 0:E.trim()))return console.log("Code validation: FAIL - No changes made from original buggy code"),!1;const l=se=>se.replace(/\r\n/g,`
`).replace(/\s+/g," ").replace(/\s*;\s*/g,";").replace(/\s*\{\s*/g,"{").replace(/\s*\}\s*/g,"}").replace(/\s*\(\s*/g,"(").replace(/\s*\)\s*/g,")").replace(/\s*==\s*/g,"==").replace(/\s*=\s*/g,"=").trim(),p=l(a),r=l(c);if(p===r)return console.log("Code validation: PASS - Exact match with database solution (100%)"),!0;const u=fe(p,r),h=Math.round(u*100);console.log(`Code validation: FAIL - Only ${h}% similarity with database solution (requires 100%)`);const C=u>=1;return console.log(`Code validation: ${C?"PASS":"FAIL"} (${h}% similarity, requires 100%)`),C},Xe=async()=>{var t;if(!o||!g.trim()){m.play("failure"),f.fire("Error","Please write some code before submitting.","error");return}try{if(D(!0),m.play("typing"),!o.fixed_code){m.play("failure"),f.fire("Error","This challenge does not have a solution stored in the database.","error"),D(!1);return}const s=ze(g,o),a=fe(g.trim().replace(/\s+/g," "),o.fixed_code.trim().replace(/\s+/g," "));W({isCorrect:s,similarity:a}),G(!0);const c={challenge_id:o.id,language:o.language,mode:o.mode,time_spent_sec:j,is_correct:s,code_submitted:g,judge_feedback:s?"Perfect! Your solution is an exact match with the expected answer from database (100% match).":`Incorrect. Your solution has ${Math.round(a*100)}% similarity with the expected answer. You need 100% match to pass. Try again or view the correct answer.`},l=await k.post("/api/solo/attempts",c);if(l.success){const p=((t=l.data)==null?void 0:t.xp_earned)||(s?o.reward_xp:0);if(s){await k.post("/api/solo/mark-taken",{challenge_id:o.id,language:o.language,difficulty:o.difficulty,mode:o.mode,status:"completed",time_spent_sec:j,code_submitted:g,earned_xp:p??0});const r=(i==null?void 0:i.total_xp)||0,d=r+p,u=Z(r),h=Z(d),C=h>u;i&&!i.completed_challenge_ids.includes(o.id)&&X($=>$?{...$,completed_challenge_ids:[...$.completed_challenge_ids,o.id],successful_attempts:$.successful_attempts+1,total_xp:d,current_level:h,xp_to_next_level:ee(d)}:null),m.play("success"),J(!0),K(!0),V(!0),de(!0),setTimeout(()=>de(!1),2e3);const S=window.innerWidth/2,E=window.innerHeight/2;xe(S,E,"success"),C&&setTimeout(()=>{m.play("levelup"),Q(!0),xe(S,E-100,"levelup")},1e3),setTimeout(()=>{m.play("victory")},500);const{isConfirmed:se}=await f.fire({title:"PERFECT SOLUTION!",html:`
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
          <div class="text-lg font-bold text-purple-300">Level ${h??1}</div>
          <div class="text-xs text-gray-300">Current Level</div>
        </div>
      </div>

      <div class="text-sm text-gray-300">⏱️ Completed in ${Math.floor(j/60)}m ${j%60}s</div>
      ${C?`
        <div class="mt-4 text-center">
          <div class="text-lg font-bold text-pink-400 animate-pulse">✨ LEVEL UP! ✨</div>
          <p class="text-sm text-gray-200">You’ve reached Level ${h}! Next: ${ee(d)} XP needed.</p>
        </div>
      `:""}
    </div>
  `,showConfirmButton:!0,confirmButtonText:"Continue Coding!",confirmButtonColor:"#10B981",background:"linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)",color:"#fff",allowOutsideClick:!1,allowEscapeKey:!1});se&&(J(!1),K(!1),Q(!1),V(!1),Y(!1),U(null),L(""),O(null),F(0),G(!1),W(null),ne(!1),await Promise.all([I(),M(),T()])),setTimeout(()=>{J(!1),K(!1),Q(!1),V(!1)},7e3)}else m.play("failure"),ce(!0),setTimeout(()=>ce(!1),600),await f.fire({title:"Almost There!",html:`
                                              <div class="text-center">
                                              <div class="text-5xl mb-4">⚠️</div>
                                              <p class="mb-3 text-lg font-semibold text-red-200">
                                                  Your solution must exactly match the database answer.
                                              </p>
                  
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
                                          `,timer:4500,showConfirmButton:!0,confirmButtonText:"Try Again",background:"linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #111827 100%)",color:"#e5e7eb",confirmButtonColor:"#3B82F6",backdrop:"rgba(0,0,0,0.6)"});await Promise.all([M(),I()]),await T()}else throw new Error(l.message||"Submission failed")}catch(s){console.error("Error submitting attempt:",s),m.play("failure");let a="Failed to submit your attempt. Please try again.";s instanceof Error&&(a=s.message),f.fire("Error",a,"error")}finally{D(!1)}},Ue=async t=>{try{if(o){const s={challenge_id:o.id,language:o.language,difficulty:o.difficulty,mode:o.mode,status:t,time_spent_sec:j,code_submitted:g||o.buggy_code||"",earned_xp:t==="completed"?o.reward_xp??0:0};await k.post("/api/solo/mark-taken",s),console.log(`Challenge marked as ${t} in database`)}}catch(s){console.error("Error marking challenge as taken:",s),f.fire({title:"Warning",text:"Progress may not have been saved properly.",icon:"warning",timer:1500,showConfirmButton:!1,background:"#1f2937",color:"#fff"})}finally{m.play("click"),Y(!1),U(null),L(""),O(null),F(0),G(!1),W(null),ne(!1),Me(),await I(),await M(),await T()}},Ye=async()=>{!(o!=null&&o.fixed_code)||!(await f.fire({title:"",html:`
      <div class="text-center space-y-3">
        <div class="text-5xl text-red-400 font-bold mb-2">!</div>
        <h2 class="text-2xl font-bold text-red-400">Quit & Show Answer?</h2>
        <p class="text-gray-300 text-sm mt-2">
          Are you sure you want to quit this challenge?<br/>
          <span class="text-red-300 font-semibold">You will NOT receive any rewards.</span>
        </p>
      </div>
    `,showCancelButton:!0,confirmButtonText:"Yes, Show Answer",cancelButtonText:"Cancel",background:"#1f2937",color:"#f8fafc",confirmButtonColor:"#ef4444",cancelButtonColor:"#6b7280",width:450,padding:"2rem 1.5rem",customClass:{popup:"rounded-xl border border-gray-700/50 shadow-xl",htmlContainer:"p-0",confirmButton:"px-5 py-2 rounded-lg font-semibold",cancelButton:"px-5 py-2 rounded-lg font-semibold"}})).isConfirmed||(m.play("click"),await f.fire({title:"",html:`
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
    `,width:600,background:"#1f2937",color:"#f8fafc",confirmButtonText:"Close",confirmButtonColor:"#10B981",customClass:{popup:"rounded-xl border border-gray-700/50 shadow-xl backdrop-blur-sm",confirmButton:"px-6 py-2 rounded-lg font-semibold"},didOpen:()=>{const s=document.getElementById("solo-surrender-solution");s&&(s.textContent=o.fixed_code||"")}}),await Ue("abandoned"))},qe=t=>{switch(t){case"easy":return x.chipEasyStyle;case"medium":return x.chipMedStyle;case"hard":return x.chipHardStyle;default:return x.chipBlueStyle}},De=t=>t==="fixbugs"?st:at,ge=t=>t==="fixbugs"?"text-yellow-400":"text-purple-400",Re=t=>{const s=Math.floor(t/60),a=t%60;return`${s}:${a.toString().padStart(2,"0")}`},Oe=new Set(["completed","abandoned"]),he=re.filter(t=>{const s=i==null?void 0:i.completed_challenge_ids.includes(t.id),a=Te[t.id];return!(s||a&&Oe.has(a))}),te=({title:t,value:s,icon:a,color:c,animated:l=!1})=>e.jsx("div",{className:`
                bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 
                ${l?"animate-pulse glow-effect":""} 
                hover:scale-105 hover:shadow-xl transition-all duration-300 
                ${Be?"glow-success":""}
                cursor-pointer
            `,onMouseEnter:()=>m.play("hover"),children:e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx("div",{className:`p-2 rounded-lg ${c} transition-all duration-300`,children:e.jsx(a,{className:"h-5 w-5 text-white"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-gray-400",children:t}),e.jsx("p",{className:"text-lg font-bold text-white",children:s})]})]})});return e.jsxs("div",{className:"min-h-screen relative overflow-hidden",children:[e.jsx(Je,{}),e.jsxs("div",{className:"absolute inset-0 overflow-hidden pointer-events-none",children:[e.jsx("div",{className:"absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20"}),e.jsx("div",{className:"absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"}),e.jsx("div",{className:"absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-10"}),e.jsx("div",{className:"absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse opacity-25"}),e.jsx("div",{className:"absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-green-400 rounded-full animate-bounce opacity-15"}),B.map(t=>e.jsx("div",{className:"absolute pointer-events-none particle-effect",style:{left:`${t.x}px`,top:`${t.y}px`,backgroundColor:t.color,width:`${t.size}px`,height:`${t.size}px`,borderRadius:"50%",opacity:t.life/t.maxLife,boxShadow:`0 0 ${t.size}px ${t.color}`}},t.id))]}),Ee&&e.jsx("div",{className:"fixed inset-0 bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-md z-50 flex items-center justify-center animate-fadeIn",children:e.jsxs("div",{className:"text-center text-white animate-bounceIn levelup-container",children:[e.jsxs("div",{className:"crown-animation mb-6",children:[e.jsx(ae,{className:"w-24 h-24 mx-auto text-yellow-400 animate-spin-slow"}),e.jsx("div",{className:"crown-glow"})]}),e.jsx("h2",{className:"text-8xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse",children:"LEVEL UP!"}),e.jsxs("p",{className:"text-3xl opacity-90 animate-slideInUp",children:["You reached Level ",i==null?void 0:i.current_level,"!"]}),e.jsx("div",{className:"mt-6 animate-slideInUp delay-300",children:e.jsxs("div",{className:"inline-flex items-center space-x-2 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm",children:[e.jsx(ye,{className:"w-5 h-5 text-yellow-400"}),e.jsxs("span",{className:"text-lg font-semibold",children:["Only ",i==null?void 0:i.xp_to_next_level," XP to next level!"]}),e.jsx(ye,{className:"w-5 h-5 text-yellow-400"})]})})]})}),e.jsxs(We,{breadcrumbs:rt,children:[e.jsx(Ge,{title:"Training Challenge"}),e.jsxs("div",{className:`flex flex-col gap-6 p-4 relative z-10 ${Le?"animate-shake":""}`,children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(be,{className:`h-8 w-8 text-cyan-400 ${Fe?"animate-spin":""} transition-all duration-300`}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold",children:"TRAINING CHALLENGES"}),e.jsx("p",{className:"text-gray-400 text-sm",children:"Master coding challenges and level up your skills"})]})]}),e.jsx("div",{className:"flex items-center space-x-3"})]}),i&&e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:`${x.panelClass} p-6`,style:x.panelStyle,children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(ae,{className:"h-6 w-6 text-yellow-400"}),e.jsxs("span",{className:"text-xl font-bold text-white",children:["Level ",i.current_level]}),e.jsxs("div",{className:"text-sm text-gray-400",children:["(",ue(i.total_xp),"/10 XP)"]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("div",{className:"text-gray-400 text-sm",children:"Next Level"}),e.jsxs("div",{className:"text-cyan-400 font-bold",children:[i.xp_to_next_level," XP needed"]})]})]}),e.jsxs("div",{className:"w-full h-3 bg-gray-700 rounded-full h-4 overflow-hidden relative",children:[e.jsx("div",{className:`bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 ease-out progress-bar-glow ${Pe?"animate-pulse":""}`,style:{width:`${pe(i.total_xp)}%`},children:e.jsx("div",{className:"absolute inset-0 bg-white/20 rounded-full animate-pulse"})}),e.jsx("div",{className:"absolute inset-0 flex items-center justify-center",children:e.jsxs("span",{className:"text-xs font-bold text-white drop-shadow-lg",children:[Math.round(pe(i.total_xp)),"%"]})})]}),e.jsxs("div",{className:"flex justify-between text-xs text-gray-400 mt-2",children:[e.jsxs("span",{children:["Level ",i.current_level]}),e.jsxs("span",{children:[ue(i.total_xp)," / 10 XP"]}),e.jsxs("span",{children:["Level ",i.current_level+1]})]})]}),e.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-3 gap-4",children:[e.jsx(te,{title:"Level",value:i.current_level,icon:ae,color:"bg-orange-500"}),e.jsx(te,{title:"Total XP",value:i.total_xp||0,icon:ve,color:"bg-yellow-500"}),e.jsx(te,{title:"Completed",value:i.successful_attempts||0,icon:Ke,color:"bg-green-500",animated:Ae})]})]}),e.jsx("div",{className:`${x.panelClass} p-6`,style:x.panelStyle,children:e.jsxs("div",{className:"flex flex-col md:flex-row gap-4",children:[e.jsx("div",{className:"flex-1",children:e.jsxs("div",{className:"relative",children:[e.jsx(Ve,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"}),e.jsx("input",{type:"text",placeholder:"Search challenges by title...",value:w,onChange:t=>Se(t.target.value),className:"w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-gray-400 transition-all duration-300"})]})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:y,onChange:t=>_e(t.target.value),className:"px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300",children:[e.jsx("option",{value:"all",children:"All Languages"}),e.jsx("option",{value:"python",children:"Python"}),e.jsx("option",{value:"java",children:"Java"}),e.jsx("option",{value:"cpp",children:"C++"})]}),e.jsxs("select",{value:v,onChange:t=>Ce(t.target.value),className:"px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300",children:[e.jsx("option",{value:"all",children:"All Difficulties"}),e.jsx("option",{value:"easy",children:"Easy"}),e.jsx("option",{value:"medium",children:"Medium"}),e.jsx("option",{value:"hard",children:"Hard"})]})]})]})}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:ke?e.jsx("div",{className:"col-span-full flex items-center justify-center py-12",children:e.jsxs("div",{className:"text-center",children:[e.jsx(we,{className:"h-8 w-8 animate-spin mx-auto mb-2 text-cyan-400"}),e.jsx("div",{className:"text-gray-300",children:"Loading challenges..."})]})}):he.length===0?e.jsxs("div",{className:"col-span-full text-center py-12 completion-celebration",children:[e.jsx("div",{className:"trophy-large mb-4",children:"🏆"}),e.jsx("div",{className:"text-2xl font-bold text-white mb-2",children:"Outstanding Achievement!"}),e.jsx("div",{className:"text-gray-400",children:re.length===0?"No challenges match your current filters":"You have conquered all available challenges!"})]}):he.map(t=>{const s=De(t.mode);return e.jsxs("div",{className:"bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:border-cyan-500/50 challenge-card",onMouseEnter:()=>m.play("hover"),children:[e.jsxs("div",{className:"flex items-start justify-between mb-4",children:[e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(s,{className:`h-5 w-5 ${ge(t.mode)}`}),e.jsx("span",{className:`text-xs font-bold uppercase ${ge(t.mode)}`,children:t.mode==="fixbugs"?"Fix Bugs":"Random"})]}),e.jsxs("div",{className:"flex space-x-2",children:[e.jsx("span",{className:x.chipClass,style:x.chipBlueStyle,children:Ne(t.language)}),e.jsx("span",{className:x.chipClass,style:qe(t.difficulty),children:t.difficulty.toUpperCase()})]})]}),e.jsx("h3",{className:"text-lg font-bold text-white mb-2",children:t.title}),t.description&&e.jsx("p",{className:"text-sm text-gray-400 mb-4 line-clamp-3",children:t.description}),e.jsxs("div",{className:"flex items-center justify-between mt-4",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsxs("div",{className:"flex items-center space-x-1 text-yellow-400",children:[e.jsx(ve,{className:"h-4 w-4"}),e.jsxs("span",{className:"text-sm font-medium",children:[t.reward_xp," XP"]})]}),t.hint&&e.jsx("div",{className:"flex items-center space-x-1 text-cyan-400",title:"Has hint",children:e.jsx(je,{className:"h-4 w-4"})})]}),e.jsxs("button",{onClick:()=>$e(t),className:`flex items-center space-x-2 px-4 py-2 ${x.btnPrimaryClass}`,style:x.btnPrimaryStyle,children:[e.jsx(Ze,{className:"h-4 w-4"}),e.jsx("span",{children:"Start"})]})]})]},t.id)})}),_&&o&&e.jsx("div",{className:"fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-[10000] pointer-events-auto flex items-center justify-center p-4",children:e.jsxs("div",{className:"relative z-[10001] bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden animate-fadeInUp",children:[e.jsx("div",{className:"bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("h3",{className:"text-lg font-bold text-white flex items-center",children:[e.jsx(be,{className:"h-5 w-5 mr-2"}),o.title]}),e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsxs("div",{className:"flex items-center space-x-2 text-white",children:[e.jsx(Qe,{className:"h-4 w-4"}),e.jsx("span",{className:"text-sm font-medium",children:Re(j)})]}),e.jsxs("button",{onClick:Ye,className:`rounded-lg px-3 py-1.5 text-sm font-semibold flex items-center gap-2
                                                                bg-red-500/20 border border-red-400/40 text-red-200
                                                                hover:bg-red-500/30 hover:text-white transition-all duration-200`,title:"Quit & Show Answer",children:[e.jsx(et,{className:"h-4 w-4"}),e.jsx("span",{children:"Quit & Show Answer"})]})]})]})}),e.jsxs("div",{className:"p-6 space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Language"}),e.jsx("div",{className:"text-lg font-bold text-white",children:Ne(o.language)})]}),e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Difficulty"}),e.jsx("div",{className:"text-lg font-bold text-white capitalize",children:o.difficulty})]}),e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Reward"}),e.jsxs("div",{className:"text-lg font-bold text-yellow-400",children:[o.reward_xp," XP"]})]})]}),o.description&&e.jsxs("div",{className:"bg-gray-900/30 rounded-lg p-4",children:[e.jsx("h4",{className:"text-cyan-400 font-bold mb-2",children:"Description"}),e.jsx("p",{className:"text-gray-200",children:o.description})]}),o.hint&&e.jsxs("div",{className:"bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4",children:[e.jsxs("h4",{className:"text-yellow-400 font-bold mb-2 flex items-center",children:[e.jsx(je,{className:"h-4 w-4 mr-2"}),"Hint"]}),e.jsx("p",{className:"text-yellow-200",children:o.hint})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-cyan-400 font-bold mb-2",children:"Your Code"}),e.jsx("textarea",{value:g,onChange:t=>L(t.target.value),className:"w-full h-64 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200 font-mono text-sm transition-all duration-300",placeholder:"Write your solution here..."})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex items-center space-x-2",children:H&&N&&e.jsx("div",{className:"text-sm text-gray-400",children:N.isCorrect?e.jsx("span",{className:"text-green-400 font-medium",children:"✅ Perfect 100% match!"}):e.jsxs("span",{className:"text-yellow-400 font-medium",children:["📊 ",Math.round(N.similarity*100),"% similarity (need 100%)"]})})}),e.jsx("div",{className:"flex items-center space-x-3",children:(!H||!(N!=null&&N.isCorrect))&&e.jsxs("button",{onClick:Xe,disabled:q||!g.trim(),className:"flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105",children:[q?e.jsx(we,{className:"h-4 w-4 animate-spin"}):e.jsx(tt,{className:"h-4 w-4"}),e.jsx("span",{children:q?"Submitting...":H?"Try Again":"Submit Solution"})]})})]})]})]})})]})]}),e.jsx("style",{children:`
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

            `})]})}export{St as default};
