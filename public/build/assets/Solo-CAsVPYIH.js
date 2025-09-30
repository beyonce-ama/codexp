import{K as Oe,r as o,j as e,L as qe}from"./app-BKJNZaE5.js";import{b as d,a as w,A as Re,T as le,C as Ge}from"./app-layout-CbALjkYR.js";import{S as h}from"./sweetalert2.esm.all-acGi8jXx.js";import{A as We}from"./AnimatedBackground-DNP8POzI.js";import{C as ie}from"./crown-Bk6Uyfnr.js";import{S as je}from"./sparkles-CIQ47xrD.js";import{R as oe}from"./refresh-cw-BYeFgMYF.js";import{T as Ne}from"./trophy-BY0il8Xx.js";import{C as Ke}from"./circle-check-big-qhL0R6mR.js";import{S as Ve}from"./search-DQqRftcz.js";import{L as ke}from"./lightbulb-r1fj_3fN.js";import{P as Ze}from"./play-D6ZRHR-Y.js";import{X as Je,B as Qe}from"./x-z-b1TVtm.js";import{S as et}from"./send-BUVX0lOg.js";import{T as tt}from"./triangle-alert-AYchdiiD.js";import{Z as at}from"./zap-s838zygG.js";import"./utils-jAU0Cazi.js";import"./createLucideIcon-B0NHoyLD.js";import"./users-f4hBEond.js";const st=[{title:"Home",href:"/dashboard"},{title:"Practice",href:"#"},{title:"Solo Challenge",href:"/play/solo"}],g={panelClass:"rounded-xl border",panelStyle:{background:"var(--panel-bg, rgba(17,24,39,0.50))",borderColor:"var(--panel-border, rgba(75,85,99,0.50))",backdropFilter:"blur(6px)"},chipClass:"px-2 py-1 text-xs font-semibold rounded-full border",chipBlueStyle:{background:"var(--chip-blue-bg, rgba(30,58,138,0.30))",borderColor:"var(--chip-blue-border, rgba(59,130,246,0.50))",color:"var(--chip-blue-text, #93c5fd)"},chipEasyStyle:{background:"var(--chip-easy-bg, rgba(6,78,59,0.30))",borderColor:"var(--chip-easy-border, rgba(16,185,129,0.50))",color:"var(--chip-easy-text, #86efac)"},chipMedStyle:{background:"var(--chip-med-bg, rgba(113,63,18,0.30))",borderColor:"var(--chip-med-border, rgba(234,179,8,0.50))",color:"var(--chip-med-text, #fde68a)"},chipHardStyle:{background:"var(--chip-hard-bg, rgba(127,29,29,0.30))",borderColor:"var(--chip-hard-border, rgba(248,113,113,0.50))",color:"var(--chip-hard-text, #fca5a5)"},btnPrimaryClass:"rounded-lg shadow-lg hover:scale-110 transition-all duration-300",btnPrimaryStyle:{background:"var(--btn-primary, linear-gradient(90deg,#06b6d4,#2563eb))",color:"var(--btn-primary-text, #fff)"}};function Ct(){const{auth:O}=Oe().props;O==null||O.user;const[ne,ce]=o.useState([]),[n,q]=o.useState(null),[_e,de]=o.useState(!0),[rt,me]=o.useState(!0),[R,lt]=o.useState("all"),[L,Ce]=o.useState("all"),[A,Se]=o.useState("all"),[B,Ee]=o.useState(""),[i,P]=o.useState(null),[G,M]=o.useState(!1),[f,j]=o.useState(""),[N,W]=o.useState(!1),[b,k]=o.useState(0),[K,T]=o.useState(null),[v,F]=o.useState(!1),[x,I]=o.useState(null),[it,$]=o.useState(!1),[z,pe]=o.useState([]),[Le,V]=o.useState(!1),[Ae,Z]=o.useState(!1),[Be,ue]=o.useState(!1),[Pe,J]=o.useState(!1),[Me,Q]=o.useState(!1),[Te,xe]=o.useState(!1),X=o.useRef(),[Fe,ge]=o.useState({});o.useEffect(()=>{G?document.body.classList.add("modal-open"):document.body.classList.remove("modal-open")},[G]),o.useEffect(()=>{d.registerSfx("success","/sounds/correct.mp3"),d.registerSfx("failure","/sounds/failure.mp3"),d.registerSfx("levelup","/sounds/levelup.mp3"),d.registerSfx("click","/sounds/click.mp3"),d.registerSfx("hover","/sounds/hover.mp3"),d.registerSfx("victory","/sounds/victory.mp3"),d.registerSfx("streak","/sounds/streak.mp3"),d.registerSfx("typing","/sounds/typing.mp3")},[]);const ee=t=>Math.floor(t/10)+1,te=t=>10-t%10,fe=t=>t%10/10*100,he=t=>t%10;o.useEffect(()=>{_(),Y(),U()},[R,L,A,B]),o.useEffect(()=>{let t;return K&&(t=setInterval(()=>{k(Math.floor((Date.now()-K.getTime())/1e3))},1e3)),()=>{t&&clearInterval(t)}},[K]),o.useEffect(()=>{if(z.length>0){const t=()=>{pe(s=>s.map(a=>({...a,x:a.x+a.vx,y:a.y+a.vy,vy:a.vy-.15,life:a.life-1,size:a.size*.99})).filter(a=>a.life>0)),z.length>0&&(X.current=requestAnimationFrame(t))};X.current=requestAnimationFrame(t)}return()=>{X.current&&cancelAnimationFrame(X.current)}},[z.length]);const U=async()=>{try{const t=await w.get("/api/solo/taken");if(t.success){const s=(t.data||[]).reduce((a,c)=>(a[c.challenge_id]=c.status,a),{});ge(s)}}catch(t){console.error("Error fetching taken rows:",t),ge({})}},_=async()=>{try{de(!0);const t={};R!=="all"&&(t.mode=R),L!=="all"&&(t.language=L),A!=="all"&&(t.difficulty=A),B.trim()&&(t.search=B.trim());const s=await w.get("/api/challenges/solo",t);if(s.success){const a=s.data.data||s.data||[];ce(a)}}catch(t){console.error("Error fetching challenges:",t),ce([])}finally{de(!1)}},Y=async()=>{var t,s,a;try{me(!0);const c=await w.get("/api/me/stats");if(c.success&&c.data){const l=c.data,p=((t=l.totals)==null?void 0:t.xp)||0;let r=[];if(l.completed_challenge_ids&&Array.isArray(l.completed_challenge_ids))r=l.completed_challenge_ids;else if((s=l.solo_stats)!=null&&s.completed_challenge_ids)r=l.solo_stats.completed_challenge_ids;else if(l.attempts){const m=l.attempts.filter(u=>u.is_correct);r=[...new Set(m.map(u=>u.challenge_id))]}else{const m=["completed_challenges","solo_completed_challenges","successful_challenge_ids","completed_solo_challenges"];for(const u of m)if(l[u]&&Array.isArray(l[u])){r=l[u],console.log(`Found completed challenges in field: ${u}`);break}}q({solo_attempts:l.solo_attempts||0,successful_attempts:l.successful_attempts||r.length,total_xp:p,total_stars:((a=l.totals)==null?void 0:a.stars)||0,attempts_today:l.attempts_today||0,current_level:ee(p),xp_to_next_level:te(p),completed_challenge_ids:r,streak:l.streak||0})}}catch(c){console.error("Error fetching user stats:",c),q({solo_attempts:0,successful_attempts:0,total_xp:0,total_stars:0,attempts_today:0,current_level:1,xp_to_next_level:10,completed_challenge_ids:[],streak:0})}finally{me(!1)}},be=(t,s,a="success")=>{const c={success:["#10B981","#34D399","#6EE7B7","#FBBF24","#F59E0B"],levelup:["#8B5CF6","#A78BFA","#C4B5FD","#F59E0B","#FBBF24"],streak:["#EF4444","#F87171","#FCA5A5","#FBBF24","#F59E0B"]},l=[],p=a==="levelup"?25:15;for(let r=0;r<p;r++){const m=Math.PI*2*r/p,u=Math.random()*8+4;l.push({id:Date.now()+r,x:t+(Math.random()-.5)*50,y:s+(Math.random()-.5)*30,vx:Math.cos(m)*u+(Math.random()-.5)*2,vy:Math.sin(m)*u-Math.random()*3,life:80+Math.random()*40,maxLife:80,color:c[a][Math.floor(Math.random()*c[a].length)],size:Math.random()*6+3,type:a})}pe(r=>[...r,...l])},Ie=t=>{if(d.play("click"),n!=null&&n.completed_challenge_ids.includes(t.id)){d.play("failure"),h.fire({icon:"info",title:"Challenge Already Completed!",text:"You have already solved this challenge. Try a different one!",timer:2e3,showConfirmButton:!1,background:"#1f2937",color:"#fff"});return}P(t),j(t.buggy_code||""),M(!0),T(new Date),k(0)},ye=(t,s)=>{const a=t.length,c=s.length;if(a===0)return c===0?1:0;if(c===0)return 0;const l=Array(c+1).fill(null).map(()=>Array(a+1).fill(null));for(let r=0;r<=a;r++)l[0][r]=r;for(let r=0;r<=c;r++)l[r][0]=r;for(let r=1;r<=c;r++)for(let m=1;m<=a;m++)t[m-1]===s[r-1]?l[r][m]=l[r-1][m-1]:l[r][m]=Math.min(l[r-1][m]+1,l[r][m-1]+1,l[r-1][m-1]+1);const p=Math.max(a,c);return(p-l[c][a])/p},$e=(t,s)=>{var S,E;const a=t.trim(),c=(S=s.fixed_code)==null?void 0:S.trim();if(!a)return console.log("Code validation: FAIL - No code provided"),!1;if(!c)return console.log("Code validation: FAIL - No solution available in database"),!1;if(a===((E=s.buggy_code)==null?void 0:E.trim()))return console.log("Code validation: FAIL - No changes made from original buggy code"),!1;const l=re=>re.replace(/\r\n/g,`
`).replace(/\s+/g," ").replace(/\s*;\s*/g,";").replace(/\s*\{\s*/g,"{").replace(/\s*\}\s*/g,"}").replace(/\s*\(\s*/g,"(").replace(/\s*\)\s*/g,")").replace(/\s*==\s*/g,"==").replace(/\s*=\s*/g,"=").trim(),p=l(a),r=l(c);if(p===r)return console.log("Code validation: PASS - Exact match with database solution (100%)"),!0;const u=ye(p,r),y=Math.round(u*100);console.log(`Code validation: FAIL - Only ${y}% similarity with database solution (requires 100%)`);const C=u>=1;return console.log(`Code validation: ${C?"PASS":"FAIL"} (${y}% similarity, requires 100%)`),C},ze=async()=>{var t;if(!i||!f.trim()){d.play("failure"),h.fire("Error","Please write some code before submitting.","error");return}try{if(W(!0),d.play("typing"),!i.fixed_code){d.play("failure"),h.fire("Error","This challenge does not have a solution stored in the database.","error"),W(!1);return}const s=$e(f,i),a=ye(f.trim().replace(/\s+/g," "),i.fixed_code.trim().replace(/\s+/g," "));I({isCorrect:s,similarity:a}),F(!0);const c={challenge_id:i.id,language:i.language,mode:i.mode,time_spent_sec:b,is_correct:s,code_submitted:f,judge_feedback:s?"Perfect! Your solution is an exact match with the expected answer from database (100% match).":`Incorrect. Your solution has ${Math.round(a*100)}% similarity with the expected answer. You need 100% match to pass. Try again or view the correct answer.`},l=await w.post("/api/solo/attempts",c);if(l.success){const p=((t=l.data)==null?void 0:t.xp_earned)||(s?i.reward_xp:0);if(s){await w.post("/api/solo/mark-taken",{challenge_id:i.id,language:i.language,difficulty:i.difficulty,mode:i.mode,status:"completed",time_spent_sec:b,code_submitted:f,earned_xp:p??0});const r=(n==null?void 0:n.total_xp)||0,m=r+p,u=ee(r),y=ee(m),C=y>u;n&&!n.completed_challenge_ids.includes(i.id)&&q(H=>H?{...H,completed_challenge_ids:[...H.completed_challenge_ids,i.id],successful_attempts:H.successful_attempts+1,total_xp:m,current_level:y,xp_to_next_level:te(m)}:null),d.play("success"),Z(!0),J(!0),Q(!0),xe(!0),setTimeout(()=>xe(!1),2e3);const S=window.innerWidth/2,E=window.innerHeight/2;be(S,E,"success"),C&&setTimeout(()=>{d.play("levelup"),V(!0),be(S,E-100,"levelup")},1e3),setTimeout(()=>{d.play("victory")},500);const{isConfirmed:re}=await h.fire({title:"PERFECT SOLUTION!",html:`
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
      ${C?`
        <div class="mt-4 text-center">
          <div class="text-lg font-bold text-pink-400 animate-pulse">✨ LEVEL UP! ✨</div>
          <p class="text-sm text-gray-200">You’ve reached Level ${y}! Next: ${te(m)} XP needed.</p>
        </div>
      `:""}
    </div>
  `,showConfirmButton:!0,confirmButtonText:"Continue Coding!",confirmButtonColor:"#10B981",background:"linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)",color:"#fff",allowOutsideClick:!1,allowEscapeKey:!1});re&&(Z(!1),J(!1),V(!1),Q(!1),M(!1),P(null),j(""),T(null),k(0),F(!1),I(null),$(!1),await Promise.all([_(),Y(),U()])),setTimeout(()=>{Z(!1),J(!1),V(!1),Q(!1)},7e3)}else d.play("failure"),ue(!0),setTimeout(()=>ue(!1),600),await h.fire({title:"Almost There!",html:`
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
                                </ul>
                            </div>
                            </div>
                        `,timer:4500,showConfirmButton:!0,confirmButtonText:"Try Again",background:"linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)",color:"#fff",confirmButtonColor:"#3B82F6"});await Promise.all([Y(),_()]),await U()}else throw new Error(l.message||"Submission failed")}catch(s){console.error("Error submitting attempt:",s),d.play("failure");let a="Failed to submit your attempt. Please try again.";s instanceof Error&&(a=s.message),h.fire("Error",a,"error")}finally{W(!1)}},ve=async()=>{if(v&&(x!=null&&x.isCorrect)){await ae("completed"),d.play("click"),M(!1),P(null),j(""),T(null),k(0),F(!1),I(null),$(!1);return}if(i&&f.trim()!==(i.buggy_code??"").trim()||b>0)if((await h.fire({title:"Leave challenge?",text:"You have progress. Leaving now will mark this as abandoned.",icon:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"Yes, leave",cancelButtonText:"Continue coding",background:"#1f2937",color:"#fff",customClass:{confirmButton:"px-4 py-2 rounded-lg",cancelButton:"px-4 py-2 rounded-lg"}})).isConfirmed)await ae("abandoned");else return;else await ae("viewed")},ae=async t=>{try{if(i){const s={challenge_id:i.id,language:i.language,difficulty:i.difficulty,mode:i.mode,status:t,time_spent_sec:b,code_submitted:f||i.buggy_code||"",earned_xp:t==="completed"?i.reward_xp??0:0};await w.post("/api/solo/mark-taken",s),console.log(`Challenge marked as ${t} in database`)}}catch(s){console.error("Error marking challenge as taken:",s),h.fire({title:"Warning",text:"Progress may not have been saved properly.",icon:"warning",timer:1500,showConfirmButton:!1,background:"#1f2937",color:"#fff"})}finally{d.play("click"),M(!1),P(null),j(""),T(null),k(0),F(!1),I(null),$(!1),await _(),await Y(),await U()}},Xe=()=>{i!=null&&i.fixed_code&&(d.play("click"),$(!0),h.fire({title:"Correct Answer",html:`
                    <div class="correct-answer-modal">
                        <p class="mb-4 text-gray-300">Here's the exact solution from the database (100% match required):</p>
                        <div class="bg-gray-900 rounded-lg p-4 text-left">
                            <pre class="text-green-400 text-sm overflow-auto max-h-64" style="font-family: 'Courier New', monospace; white-space: pre-wrap;">${i.fixed_code}</pre>
                        </div>
                        <p class="mt-4 text-sm text-gray-400">Your code must match this exactly to pass the challenge.</p>
                    </div>
                `,confirmButtonText:"Got it!",background:"#1f2937",color:"#fff",confirmButtonColor:"#10B981",width:"600px"}))},Ue=t=>{switch(t){case"easy":return g.chipEasyStyle;case"medium":return g.chipMedStyle;case"hard":return g.chipHardStyle;default:return g.chipBlueStyle}},Ye=t=>t==="fixbugs"?tt:at,we=t=>t==="fixbugs"?"text-yellow-400":"text-purple-400",De=t=>{const s=Math.floor(t/60),a=t%60;return`${s}:${a.toString().padStart(2,"0")}`},He=new Set(["completed","abandoned"]),se=ne.filter(t=>{const s=n==null?void 0:n.completed_challenge_ids.includes(t.id),a=Fe[t.id];return!(s||a&&He.has(a))}),D=({title:t,value:s,icon:a,color:c,animated:l=!1})=>e.jsx("div",{className:`
                bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 
                ${l?"animate-pulse glow-effect":""} 
                hover:scale-105 hover:shadow-xl transition-all duration-300 
                ${Me?"glow-success":""}
                cursor-pointer
            `,onMouseEnter:()=>d.play("hover"),children:e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx("div",{className:`p-2 rounded-lg ${c} transition-all duration-300`,children:e.jsx(a,{className:"h-5 w-5 text-white"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-gray-400",children:t}),e.jsx("p",{className:"text-lg font-bold text-white",children:s})]})]})});return e.jsxs("div",{className:"min-h-screen relative overflow-hidden",children:[e.jsx(We,{}),e.jsxs("div",{className:"absolute inset-0 overflow-hidden pointer-events-none",children:[e.jsx("div",{className:"absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20"}),e.jsx("div",{className:"absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-30"}),e.jsx("div",{className:"absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-10"}),e.jsx("div",{className:"absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse opacity-25"}),e.jsx("div",{className:"absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-green-400 rounded-full animate-bounce opacity-15"}),z.map(t=>e.jsx("div",{className:"absolute pointer-events-none particle-effect",style:{left:`${t.x}px`,top:`${t.y}px`,backgroundColor:t.color,width:`${t.size}px`,height:`${t.size}px`,borderRadius:"50%",opacity:t.life/t.maxLife,boxShadow:`0 0 ${t.size}px ${t.color}`}},t.id))]}),Le&&e.jsx("div",{className:"fixed inset-0 bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-md z-50 flex items-center justify-center animate-fadeIn",children:e.jsxs("div",{className:"text-center text-white animate-bounceIn levelup-container",children:[e.jsxs("div",{className:"crown-animation mb-6",children:[e.jsx(ie,{className:"w-24 h-24 mx-auto text-yellow-400 animate-spin-slow"}),e.jsx("div",{className:"crown-glow"})]}),e.jsx("h2",{className:"text-8xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse",children:"LEVEL UP!"}),e.jsxs("p",{className:"text-3xl opacity-90 animate-slideInUp",children:["You reached Level ",n==null?void 0:n.current_level,"!"]}),e.jsx("div",{className:"mt-6 animate-slideInUp delay-300",children:e.jsxs("div",{className:"inline-flex items-center space-x-2 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm",children:[e.jsx(je,{className:"w-5 h-5 text-yellow-400"}),e.jsxs("span",{className:"text-lg font-semibold",children:["Only ",n==null?void 0:n.xp_to_next_level," XP to next level!"]}),e.jsx(je,{className:"w-5 h-5 text-yellow-400"})]})})]})}),e.jsxs(Re,{breadcrumbs:st,children:[e.jsx(qe,{title:"Solo Challenge"}),e.jsxs("div",{className:`flex flex-col gap-6 p-4 relative z-10 ${Be?"animate-shake":""}`,children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(le,{className:`h-8 w-8 text-cyan-400 ${Pe?"animate-spin":""} transition-all duration-300`}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold",children:"SOLO CHALLENGE"}),e.jsx("p",{className:"text-gray-400 text-sm",children:"Master coding challenges and level up your skills"})]})]}),e.jsx("div",{className:"flex items-center space-x-3",children:e.jsxs("button",{onClick:()=>{d.play("click"),_()},className:"flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 hover:scale-105 transition-all duration-300",onMouseEnter:()=>d.play("hover"),children:[e.jsx(oe,{className:"h-4 w-4"}),e.jsx("span",{children:"Refresh"})]})})]}),n&&e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:`${g.panelClass} p-6`,style:g.panelStyle,children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(ie,{className:"h-6 w-6 text-yellow-400"}),e.jsxs("span",{className:"text-xl font-bold text-white",children:["Level ",n.current_level]}),e.jsxs("div",{className:"text-sm text-gray-400",children:["(",he(n.total_xp),"/10 XP)"]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("div",{className:"text-gray-400 text-sm",children:"Next Level"}),e.jsxs("div",{className:"text-cyan-400 font-bold",children:[n.xp_to_next_level," XP needed"]})]})]}),e.jsxs("div",{className:"w-full h-3 bg-gray-700 rounded-full h-4 overflow-hidden relative",children:[e.jsx("div",{className:`bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 ease-out progress-bar-glow ${Te?"animate-pulse":""}`,style:{width:`${fe(n.total_xp)}%`},children:e.jsx("div",{className:"absolute inset-0 bg-white/20 rounded-full animate-pulse"})}),e.jsx("div",{className:"absolute inset-0 flex items-center justify-center",children:e.jsxs("span",{className:"text-xs font-bold text-white drop-shadow-lg",children:[Math.round(fe(n.total_xp)),"%"]})})]}),e.jsxs("div",{className:"flex justify-between text-xs text-gray-400 mt-2",children:[e.jsxs("span",{children:["Level ",n.current_level]}),e.jsxs("span",{children:[he(n.total_xp)," / 10 XP"]}),e.jsxs("span",{children:["Level ",n.current_level+1]})]})]}),e.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[e.jsx(D,{title:"Level",value:n.current_level,icon:ie,color:"bg-orange-500"}),e.jsx(D,{title:"Total XP",value:n.total_xp||0,icon:Ne,color:"bg-yellow-500"}),e.jsx(D,{title:"Completed",value:n.successful_attempts||0,icon:Ke,color:"bg-green-500",animated:Ae}),e.jsx(D,{title:"Available",value:se.length,icon:le,color:"bg-cyan-500"})]})]}),e.jsx("div",{className:`${g.panelClass} p-6`,style:g.panelStyle,children:e.jsxs("div",{className:"flex flex-col md:flex-row gap-4",children:[e.jsx("div",{className:"flex-1",children:e.jsxs("div",{className:"relative",children:[e.jsx(Ve,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"}),e.jsx("input",{type:"text",placeholder:"Search challenges by title...",value:B,onChange:t=>Ee(t.target.value),className:"w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 placeholder-gray-400 transition-all duration-300"})]})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("select",{value:L,onChange:t=>Ce(t.target.value),className:"px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300",children:[e.jsx("option",{value:"all",children:"All Languages"}),e.jsx("option",{value:"python",children:"Python"}),e.jsx("option",{value:"java",children:"Java"})]}),e.jsxs("select",{value:A,onChange:t=>Se(t.target.value),className:"px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-gray-200 transition-all duration-300",children:[e.jsx("option",{value:"all",children:"All Difficulties"}),e.jsx("option",{value:"easy",children:"Easy"}),e.jsx("option",{value:"medium",children:"Medium"}),e.jsx("option",{value:"hard",children:"Hard"})]})]})]})}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:_e?e.jsx("div",{className:"col-span-full flex items-center justify-center py-12",children:e.jsxs("div",{className:"text-center",children:[e.jsx(oe,{className:"h-8 w-8 animate-spin mx-auto mb-2 text-cyan-400"}),e.jsx("div",{className:"text-gray-300",children:"Loading challenges..."})]})}):se.length===0?e.jsxs("div",{className:"col-span-full text-center py-12 completion-celebration",children:[e.jsx("div",{className:"trophy-large mb-4",children:"🏆"}),e.jsx("div",{className:"text-2xl font-bold text-white mb-2",children:"Outstanding Achievement!"}),e.jsx("div",{className:"text-gray-400",children:ne.length===0?"No challenges match your current filters":"You have conquered all available challenges!"})]}):se.map(t=>{const s=Ye(t.mode);return e.jsxs("div",{className:"bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:border-cyan-500/50 challenge-card",onMouseEnter:()=>d.play("hover"),children:[e.jsxs("div",{className:"flex items-start justify-between mb-4",children:[e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(s,{className:`h-5 w-5 ${we(t.mode)}`}),e.jsx("span",{className:`text-xs font-bold uppercase ${we(t.mode)}`,children:t.mode==="fixbugs"?"Fix Bugs":"Random"})]}),e.jsxs("div",{className:"flex space-x-2",children:[e.jsx("span",{className:g.chipClass,style:g.chipBlueStyle,children:t.language.toUpperCase()}),e.jsx("span",{className:g.chipClass,style:Ue(t.difficulty),children:t.difficulty.toUpperCase()})]})]}),e.jsx("h3",{className:"text-lg font-bold text-white mb-2",children:t.title}),t.description&&e.jsx("p",{className:"text-sm text-gray-400 mb-4 line-clamp-3",children:t.description}),e.jsxs("div",{className:"flex items-center justify-between mt-4",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsxs("div",{className:"flex items-center space-x-1 text-yellow-400",children:[e.jsx(Ne,{className:"h-4 w-4"}),e.jsxs("span",{className:"text-sm font-medium",children:[t.reward_xp," XP"]})]}),t.hint&&e.jsx("div",{className:"flex items-center space-x-1 text-cyan-400",title:"Has hint",children:e.jsx(ke,{className:"h-4 w-4"})})]}),e.jsxs("button",{onClick:()=>Ie(t),className:`flex items-center space-x-2 px-4 py-2 ${g.btnPrimaryClass}`,style:g.btnPrimaryStyle,children:[e.jsx(Ze,{className:"h-4 w-4"}),e.jsx("span",{children:"Start"})]})]})]},t.id)})}),G&&i&&e.jsx("div",{className:"fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4",children:e.jsxs("div",{className:"relative bg-gray-800/90 backdrop-blur-md border border-gray-700/50 w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden animate-fadeInUp",children:[e.jsx("div",{className:"bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("h3",{className:"text-lg font-bold text-white flex items-center",children:[e.jsx(le,{className:"h-5 w-5 mr-2"}),i.title]}),e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsxs("div",{className:"flex items-center space-x-2 text-white",children:[e.jsx(Ge,{className:"h-4 w-4"}),e.jsx("span",{className:"text-sm font-medium",children:De(b)})]}),e.jsx("button",{onClick:ve,className:"text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all duration-200",children:e.jsx(Je,{className:"h-6 w-6"})})]})]})}),e.jsxs("div",{className:"p-6 space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Language"}),e.jsx("div",{className:"text-lg font-bold text-white",children:i.language.toUpperCase()})]}),e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Difficulty"}),e.jsx("div",{className:"text-lg font-bold text-white capitalize",children:i.difficulty})]}),e.jsxs("div",{className:"bg-gray-900/50 rounded-lg p-4",children:[e.jsx("div",{className:"text-sm text-gray-400",children:"Reward"}),e.jsxs("div",{className:"text-lg font-bold text-yellow-400",children:[i.reward_xp," XP"]})]})]}),i.description&&e.jsxs("div",{className:"bg-gray-900/30 rounded-lg p-4",children:[e.jsx("h4",{className:"text-cyan-400 font-bold mb-2",children:"Description"}),e.jsx("p",{className:"text-gray-200",children:i.description})]}),i.hint&&e.jsxs("div",{className:"bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4",children:[e.jsxs("h4",{className:"text-yellow-400 font-bold mb-2 flex items-center",children:[e.jsx(ke,{className:"h-4 w-4 mr-2"}),"Hint"]}),e.jsx("p",{className:"text-yellow-200",children:i.hint})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-cyan-400 font-bold mb-2",children:"Your Code"}),e.jsx("textarea",{value:f,onChange:t=>j(t.target.value),className:"w-full h-64 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200 font-mono text-sm transition-all duration-300",placeholder:"Write your solution here..."})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center space-x-2",children:[v&&!(x!=null&&x.isCorrect)&&e.jsxs("button",{onClick:Xe,disabled:N,className:"flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105",children:[e.jsx(Qe,{className:"h-4 w-4"}),e.jsx("span",{children:"Show Correct Answer"})]}),v&&x&&e.jsx("div",{className:"text-sm text-gray-400",children:x.isCorrect?e.jsx("span",{className:"text-green-400 font-medium",children:"✅ Perfect 100% match!"}):e.jsxs("span",{className:"text-yellow-400 font-medium",children:["📊 ",Math.round(x.similarity*100),"% similarity (need 100%)"]})})]}),e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx("button",{onClick:ve,disabled:N,className:"px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 disabled:opacity-50 transition-all duration-300 font-medium",children:v&&(x!=null&&x.isCorrect)?"Continue":"Cancel"}),(!v||!(x!=null&&x.isCorrect))&&e.jsxs("button",{onClick:ze,disabled:N||!f.trim(),className:"flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:scale-105",children:[N?e.jsx(oe,{className:"h-4 w-4 animate-spin"}):e.jsx(et,{className:"h-4 w-4"}),e.jsx("span",{children:N?"Submitting...":v?"Try Again":"Submit Solution"})]})]})]})]})]})})]})]}),e.jsx("style",{children:`
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
            `})]})}export{Ct as default};
