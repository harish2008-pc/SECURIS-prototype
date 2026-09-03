/**
 * Securis v1.1 - Core Application & State Engine
 * Proactive Financial Protection for Vulnerable Customers
 * Tiered Security: >₹10k Guardian Approval | >₹50k Dual OTP | New Payee Interceptor | Mini Securis AI
 */

// =========================================================================
// 1. STATE STORE & PERSISTENCE
// =========================================================================
const DEFAULT_STATE = {
  currentView: 'user', // 'user' | 'guardian' | 'dual'
  balance: 85000,
  isOnCall: false,
  isLocked: false,
  currentLang: 'en-US',
  seniorMode: true,
  dailyLimit: 100000,
  guardianApprovalThreshold: 10000, // >10k requires Guardian
  dualOtpThreshold: 50000,         // >50k requires Dual OTP
  pendingApprovals: [],
  activeEscrows: [],
  aiGuideText: "Hello Mr. Rao! I am Mini Securis, your protective banking guide. Tap 'Send Money' to begin, or ask me if any payment is safe.",
  auditLog: [
    { id: 1, type: 'safe', title: '₹ 500 to Suresh (Milkman)', subtitle: 'Biometric Verified • Regular Payee', time: '8:15 AM', status: 'Cleared' },
    { id: 2, type: 'blocked', title: '₹ 25,000 to UNKNOWN_LOTTERY', subtitle: 'Blocked by Guardian Ramesh (>₹10k rule)', time: 'Yesterday', status: 'Threat Blocked' }
  ],
  trustedContacts: [
    { name: 'Ramesh (Son)', phone: '9876543210', avatar: '👨‍💼', relation: 'Family Guardian', verified: true, defaultAmt: 5000 },
    { name: 'Priya (Daughter)', phone: '9876543211', avatar: '👩‍⚕️', relation: 'Family Contact', verified: true, defaultAmt: 2000 },
    { name: 'Suresh (Milkman)', phone: '9876543212', avatar: '🥛', relation: 'Regular Merchant', verified: true, defaultAmt: 500 },
    { name: 'Dr. Verma (Clinic)', phone: '9876543213', avatar: '🩺', relation: 'Medical Services', verified: true, defaultAmt: 1500 }
  ]
};

// Load or Initialize State
let state = loadPersistedState();

function loadPersistedState() {
  try {
    const saved = localStorage.getItem('securis_state_v1_1');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (e) {
    console.warn("Could not load localStorage, using defaults", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  try {
    localStorage.setItem('securis_state_v1_1', JSON.stringify(state));
  } catch (e) {
    console.warn("Could not save to localStorage", e);
  }
  syncAllViews();
}

function resetSecurisData() {
  localStorage.removeItem('securis_state_v1_1');
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  saveState();
  showToast("Securis reset to default factory state.", "success");
}

// =========================================================================
// 2. MULTILINGUAL VERNACULAR VOICE ENGINE
// =========================================================================
const translations = {
  'en-US': {
    welcome: "Hello! I am Mini Securis. I guide you and protect your money from scams.",
    balance: "Your safe balance is 85,000 rupees. All security shields are active.",
    scamWarning: "Warning! You are on a phone call. Genuine bank staff or police will never ask you to transfer money. Your son Ramesh has been alerted.",
    safeTransfer: "Transfer completed successfully with biometric verification.",
    newPayeeWarning: "Caution! You are paying a new, unverified person. Scammers often use temporary accounts. Please verify before proceeding.",
    over10kNotice: "Transfers above 10,000 rupees require Guardian approval. We notified your son Ramesh to review this.",
    over50kNotice: "High value transfer above 50,000 rupees. Dual OTP verification with your guardian is required.",
    blockedBySon: "Transfer halted! Your guardian Ramesh rejected this payment to protect you from fraud. Please hang up.",
    escrowRefunded: "Payment cancelled. Funds have been safely refunded back to your account."
  },
  'hi-IN': {
    welcome: "नमस्ते! मैं मिनी सिक्योरिस हूँ। मैं आपके पैसों को धोखाधड़ी से सुरक्षित रखने में आपकी मदद करूँगा।",
    balance: "आपका सुरक्षित बैलेंस 85,000 रुपये है। सभी सुरक्षा शील्ड सक्रिय हैं।",
    scamWarning: "सावधान! आप फोन कॉल पर हैं। बैंक अधिकारी या पुलिस कभी भी पैसे ट्रांसफर करने के लिए नहीं कहते। आपके बेटे रमेश को सूचित कर दिया गया है।",
    safeTransfer: "बायोमेट्रिक सत्यापन के साथ ट्रांसफर सुरक्षित रूप से पूरा हो गया है।",
    newPayeeWarning: "सावधान! आप एक नए, असत्यापित व्यक्ति को पैसे भेज रहे हैं। धोखेबाज़ अक्सर नए खातों का उपयोग करते हैं।",
    over10kNotice: "10,000 रुपये से अधिक के ट्रांसफर के लिए अभिभावक की मंजूरी आवश्यक है। रमेश को सूचित कर दिया गया है।",
    over50kNotice: "50,000 रुपये से अधिक का बड़ा ट्रांसफर। बैंक और अभिभावक दोनों के डुअल ओटीपी की आवश्यकता है।",
    blockedBySon: "ट्रांसफर रोक दिया गया है! धोखाधड़ी से बचाने के लिए रमेश ने इसे अस्वीकार कर दिया है। कृपया फोन काट दें।",
    escrowRefunded: "भुगतान रद्द कर दिया गया। पैसे आपके खाते में सुरक्षित वापस जमा कर दिए गए हैं।"
  },
  'te-IN': {
    welcome: "నమస్కారం! నేను మినీ సెక్యూరిస్. మోసాల నుండి మీ డబ్బును రక్షించడానికి నేను సహాయం చేస్తాను.",
    balance: "మీ సురక్షిత బ్యాలెన్స్ 85,000 రూపాయలు. భద్రతా షీల్డ్‌లు సక్రియంగా ఉన్నాయి.",
    scamWarning: "హెచ్చరిక! మీరు ఫోన్ కాల్‌లో ఉన్నారు. బ్యాంక్ అధికారులు లేదా పోలీసులు డబ్బు పంపమని ఎప్పుడూ అడగరు.",
    safeTransfer: "బయోమెట్రిక్ ధృవీకరణతో బదిలీ విజయవంతంగా పూర్తయింది.",
    newPayeeWarning: "హెచ్చరిక! మీరు కొత్త, ధృవీకరించని వ్యక్తికి డబ్బు పంపుతున్నారు. దయచేసి జాగ్రత్తగా ఉండండి.",
    over10kNotice: "10,000 రూపాయల కంటే ఎక్కువ బదిలీకి రమేష్ అనుమతి అవసరం.",
    over50kNotice: "50,000 కంటే ఎక్కువ బదిలీకి డ్యూయల్ ఓటీపీ ధృవీకరణ అవసరం.",
    blockedBySon: "లావాదేవీ నిలిపివేయబడింది! రమేష్ దీన్ని రద్దు చేశారు.",
    escrowRefunded: "చెల్లింపు రద్దు చేయబడింది. నిధులు మీ ఖాతాకు తిరిగి వచ్చాయి."
  },
  'es-ES': {
    welcome: "¡Hola! Soy Mini Securis. Te guiaré y protegeré tu dinero de estafas.",
    balance: "Su saldo seguro es de 85.000 rupias. Toda la protección está activa.",
    scamWarning: "¡Advertencia! Está en una llamada. La policía o el banco nunca piden transferencias.",
    safeTransfer: "Transferencia completada con éxito con biometría.",
    newPayeeWarning: "¡Atención! Está pagando a un nuevo beneficiario no verificado.",
    over10kNotice: "Transferencias mayores a 10.000 requieren la aprobación de su tutor.",
    over50kNotice: "Transferencia mayor a 50.000. Se requiere verificación Dual OTP.",
    blockedBySon: "Transacción detenida por su guardián.",
    escrowRefunded: "Pago cancelado y reembolsado."
  }
};

function speak(key) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const lang = state.currentLang || 'en-US';
  const text = translations[lang]?.[key] || translations['en-US'][key] || key;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function updateMiniAIGuide(text, speechKey = null) {
  state.aiGuideText = text;
  const bubble = document.getElementById('user-ai-bubble-text');
  if (bubble) bubble.innerText = `"${text}"`;
  if (speechKey) speak(speechKey);
}

function changeLanguage(lang) {
  state.currentLang = lang;
  saveState();
  speak('welcome');
  showToast(`Language set to ${lang}`, 'info');
}

// =========================================================================
// 3. GLOBAL NAVIGATION & VIEW SWITCHER
// =========================================================================
function switchView(view) {
  state.currentView = view;
  saveState();

  const btnUser = document.getElementById('nav-btn-user');
  const btnGuardian = document.getElementById('nav-btn-guardian');
  const btnDual = document.getElementById('nav-btn-dual');

  const secUser = document.getElementById('view-user-standalone');
  const secGuardian = document.getElementById('view-guardian-standalone');
  const secDual = document.getElementById('view-dual-presentation');

  [btnUser, btnGuardian, btnDual].forEach(b => {
    b.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 text-slate-400 hover:text-white';
  });

  secUser.classList.add('hidden');
  secGuardian.classList.add('hidden');
  secDual.classList.add('hidden');

  if (view === 'user') {
    btnUser.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 bg-emerald-600 text-white shadow-md';
    secUser.classList.remove('hidden');
    renderUserUI('user-ui-mount');
  } else if (view === 'guardian') {
    btnGuardian.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 bg-sky-600 text-white shadow-md';
    secGuardian.classList.remove('hidden');
    renderGuardianUI('guardian-ui-mount', false);
  } else if (view === 'dual') {
    btnDual.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 bg-indigo-600 text-white shadow-md';
    secDual.classList.remove('hidden');
    renderUserUI('user-dual-mount');
    renderGuardianUI('guardian-dual-mount', true);
  }
}

function syncAllViews() {
  if (state.currentView === 'user') {
    renderUserUI('user-ui-mount');
  } else if (state.currentView === 'guardian') {
    renderGuardianUI('guardian-ui-mount', false);
  } else if (state.currentView === 'dual') {
    renderUserUI('user-dual-mount');
    renderGuardianUI('guardian-dual-mount', true);
  }

  const callIcon = document.getElementById('call-icon');
  const callText = document.getElementById('call-text');
  const callBtn = document.getElementById('btn-call-toggle');
  if (state.isOnCall) {
    callIcon.className = 'fa-solid fa-phone text-rose-400 animate-pulse mr-1.5';
    callText.innerText = 'Call: ON (Risk)';
    callBtn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/70 border border-rose-500/50 text-rose-300 transition flex items-center';
  } else {
    callIcon.className = 'fa-solid fa-phone-slash text-slate-400 mr-1.5';
    callText.innerText = 'Call: Off';
    callBtn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center';
  }
}

// =========================================================================
// 4. RENDERER: CUSTOMER / USER INTERFACE (WITH MINI SECURIS AI)
// =========================================================================
function renderUserUI(mountId) {
  const container = document.getElementById(mountId);
  if (!container) return;

  const isLocked = state.isLocked;
  const isOnCall = state.isOnCall;
  const escrowBadge = state.activeEscrows.length;

  container.innerHTML = `
    <div class="phone-frame w-full bg-slate-900 rounded-[40px] p-3.5 shadow-2xl border-4 border-slate-800 relative overflow-hidden flex flex-col min-h-[740px]">
      
      <!-- Top Dynamic Island & Status Bar -->
      <div class="pt-4 px-5 pb-2 flex justify-between items-center text-xs text-slate-400">
        <span class="font-black text-slate-200">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <div class="flex items-center space-x-2">
          ${isOnCall ? `
            <span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-black text-[10px] border border-rose-500/40 animate-pulse flex items-center">
              <i class="fa-solid fa-phone mr-1"></i> ACTIVE CALL
            </span>
          ` : ''}
          <i class="fa-solid fa-wifi text-slate-400"></i>
          <i class="fa-solid fa-battery-full text-emerald-400"></i>
        </div>
      </div>

      <!-- App Header -->
      <div class="px-5 py-2.5 flex items-center justify-between border-b border-slate-800/80">
        <div class="flex items-center space-x-2.5">
          <div class="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center text-2xl">👴</div>
          <div>
            <h3 class="font-extrabold text-white text-base leading-tight">Mr. Rao</h3>
            <span class="text-[11px] font-semibold text-emerald-400 flex items-center">
              <i class="fa-solid fa-shield-halved mr-1"></i> Securis Shield Active
            </span>
          </div>
        </div>
        <button onclick="triggerSOS()" class="px-3 py-1.5 rounded-full bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center">
          <i class="fa-solid fa-circle-exclamation mr-1.5 text-rose-400"></i> SOS
        </button>
      </div>

      <!-- APP SCROLLABLE CONTENT -->
      <div class="flex-1 p-5 space-y-4 overflow-y-auto">

        <!-- Active Call Threat Interceptor Banner -->
        ${isOnCall ? `
          <div class="p-3.5 rounded-2xl bg-rose-950/80 border-2 border-rose-600 text-rose-200 space-y-2 animate-pulse">
            <div class="flex items-start space-x-2.5">
              <div class="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                <i class="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <h4 class="font-black text-rose-100 text-sm">ACTIVE PHONE CALL DETECTED</h4>
                <p class="text-xs text-rose-200 mt-0.5">Scammers coerce victims into immediate transfers over calls. Bank staff <strong>never</strong> ask for transfers.</p>
              </div>
            </div>
            <button onclick="speak('scamWarning')" class="w-full py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center">
              <i class="fa-solid fa-volume-high mr-2"></i> Listen to AI Scam Warning
            </button>
          </div>
        ` : ''}

        <!-- Big Safe Balance Card -->
        <div class="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-md">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Your Safe Balance</span>
            <button onclick="speak('balance')" class="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center bg-emerald-950/50 px-2 py-1 rounded-md border border-emerald-500/30">
              <i class="fa-solid fa-volume-high mr-1.5"></i> Read Out
            </button>
          </div>
          <div class="text-3xl font-extrabold text-white tracking-tight">₹ ${state.balance.toLocaleString('en-IN')}<span class="text-sm font-normal text-slate-400">.00</span></div>
          <div class="mt-2 text-[10px] text-slate-300 flex items-center justify-between border-t border-slate-800 pt-2">
            <span>🛡️ >₹10k: Co-Sign Required</span>
            <span>🔑 >₹50k: Dual OTP</span>
          </div>
        </div>

        <!-- 4-Card Accessible Touch Grid -->
        <div class="grid grid-cols-2 gap-3">
          <!-- 1. Send Money (Opens Payee Selector) -->
          <button onclick="openPayeeDirectoryDialog()" class="senior-card-btn p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-left flex flex-col justify-between h-28 shadow-lg shadow-emerald-950/40 border border-emerald-400/30">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl">
              <i class="fa-solid fa-paper-plane"></i>
            </div>
            <div>
              <div class="font-extrabold text-white text-base leading-tight">Send Money</div>
              <div class="text-[11px] text-emerald-100">Select or New Payee</div>
            </div>
          </button>

          <!-- 2. Voice Guide -->
          <button onclick="activateMiniSecurisInteractive()" class="senior-card-btn p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-left flex flex-col justify-between h-28 shadow-lg shadow-indigo-950/40 border border-indigo-400/30">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl animate-pulse">
              <i class="fa-solid fa-microphone"></i>
            </div>
            <div>
              <div class="font-extrabold text-white text-base leading-tight">Mini Securis</div>
              <div class="text-[11px] text-indigo-100">Interactive AI Guide</div>
            </div>
          </button>

          <!-- 3. Safe Escrow Vault -->
          <button onclick="openEscrowVaultDialog()" class="senior-card-btn p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-left flex flex-col justify-between h-28 border border-slate-700">
            <div class="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-amber-400 text-xl">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div>
              <div class="font-extrabold text-white text-base leading-tight">Safe Escrow</div>
              <div class="text-[11px] text-amber-400 font-semibold">${escrowBadge} Active Buffer</div>
            </div>
          </button>

          <!-- 4. Guardian Info -->
          <button onclick="openGuardianInfoDialog()" class="senior-card-btn p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-left flex flex-col justify-between h-28 border border-slate-700">
            <div class="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-sky-400 text-xl">
              <i class="fa-solid fa-people-arrows"></i>
            </div>
            <div>
              <div class="font-extrabold text-white text-base leading-tight">Guardian</div>
              <div class="text-[11px] text-sky-300">Ramesh (Linked)</div>
            </div>
          </button>
        </div>

        <!-- ============================================================= -->
        <!-- MINI SECURIS INTERACTIVE COMPANION WIDGET                     -->
        <!-- ============================================================= -->
        <div class="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-sky-950/70 border-2 border-indigo-500/40 shadow-lg space-y-2.5">
          <div class="flex items-center space-x-3">
            <div class="relative w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white text-lg shrink-0 mini-securis-halo">
              <i class="fa-solid fa-robot"></i>
              <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-center">
                <span class="text-xs font-black text-indigo-300 uppercase tracking-wider">Mini Securis AI Guide</span>
                <button onclick="speak('welcome')" class="text-xs text-sky-400 hover:text-sky-200">
                  <i class="fa-solid fa-volume-high"></i>
                </button>
              </div>
              <span class="text-[10px] text-slate-400">Step-by-step assistant & fraud advisor</span>
            </div>
          </div>

          <p id="user-ai-bubble-text" class="text-xs text-slate-200 leading-relaxed italic bg-slate-950/60 p-2.5 rounded-xl border border-indigo-500/20">
            "${state.aiGuideText}"
          </p>

          <!-- Interactive Companion Prompt Buttons -->
          <div class="grid grid-cols-2 gap-1.5 pt-1">
            <button onclick="interactiveAIGuideFlow('guide')" class="py-1.5 px-2 rounded-lg bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-200 text-[11px] font-bold border border-indigo-500/30 flex items-center justify-center">
              <i class="fa-solid fa-compass mr-1.5"></i> Guide Me
            </button>
            <button onclick="interactiveAIGuideFlow('safetyCheck')" class="py-1.5 px-2 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 text-[11px] font-bold border border-emerald-500/30 flex items-center justify-center">
              <i class="fa-solid fa-shield mr-1.5"></i> Is This Safe?
            </button>
          </div>
        </div>

        <!-- Trusted Verified Payees Section -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Approved Family & Regulars</h4>
            <span class="text-[10px] text-emerald-400 font-semibold">100% Safe</span>
          </div>
          <div class="grid grid-cols-4 gap-2">
            ${state.trustedContacts.map(c => `
              <button onclick="handlePayeeSelected('${c.name}', '${c.phone}', ${c.defaultAmt}, true)" class="flex flex-col items-center p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 border border-slate-700 transition">
                <div class="w-10 h-10 rounded-full bg-slate-700 text-lg flex items-center justify-center mb-1">${c.avatar}</div>
                <span class="text-[11px] font-bold text-white truncate w-full text-center">${c.name.split(' ')[0]}</span>
                <span class="text-[9px] text-slate-400">${c.relation.split(' ')[0]}</span>
              </button>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- OVERLAY 1: REMOTE APP FREEZE -->
      ${isLocked ? `
        <div class="absolute inset-0 bg-slate-950/98 z-50 p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div class="w-20 h-20 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 text-4xl">
            <i class="fa-solid fa-lock"></i>
          </div>
          <div>
            <h3 class="text-xl font-black text-white">App Temporarily Shielded</h3>
            <p class="text-xs text-rose-300 mt-2 leading-relaxed max-w-xs">
              Your son Ramesh locked this app to protect you from an unauthorized scam or coercive phone call.
            </p>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            Ramesh's Contact: <strong class="text-white">+91 98765 43210</strong>
          </div>
        </div>
      ` : ''}

      <!-- DYNAMIC MODAL CONTAINER (User device) -->
      <div id="user-modal-container" class="hidden absolute inset-0 bg-slate-950/95 backdrop-blur-md z-40 p-5 flex flex-col justify-between overflow-y-auto"></div>

    </div>
  `;
}

// =========================================================================
// 5. RENDERER: GUARDIAN COMPANION PORTAL
// =========================================================================
function renderGuardianUI(mountId, isCompact = false) {
  const container = document.getElementById(mountId);
  if (!container) return;

  const pending = state.pendingApprovals;
  const isLocked = state.isLocked;

  container.innerHTML = `
    <div class="w-full bg-slate-900 rounded-[32px] p-4 sm:p-5 shadow-2xl border-4 border-slate-800 text-slate-100 flex flex-col min-h-[740px]">
      
      <!-- Guardian Header -->
      <div class="pb-3 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center space-x-2.5">
          <div class="w-10 h-10 rounded-full bg-sky-600/30 border border-sky-400/50 flex items-center justify-center text-2xl">👨‍💼</div>
          <div>
            <div class="flex items-center space-x-1.5">
              <h3 class="font-extrabold text-white text-sm sm:text-base leading-tight">Ramesh Rao</h3>
              <span class="text-[10px] px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">Guardian</span>
            </div>
            <p class="text-[11px] text-slate-400">Supervising: <strong class="text-white">Dad (Mr. Rao)</strong></p>
          </div>
        </div>

        <button onclick="toggleAppLock()" class="px-3 py-1.5 rounded-full ${isLocked ? 'bg-rose-600 text-white font-black shadow-lg shadow-rose-900/50' : 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40'} text-xs font-bold transition flex items-center">
          <i class="fa-solid fa-snowflake mr-1.5"></i>
          <span>${isLocked ? "Unlock Dad's App" : "Lock Dad's App"}</span>
        </button>
      </div>

      <!-- BODY CONTENT -->
      <div class="flex-1 py-4 space-y-4 overflow-y-auto">

        <!-- CRITICAL ACTION REQUIRED: CO-SIGN APPROVAL CARD -->
        ${pending.length > 0 ? `
          <div class="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 shadow-xl shadow-rose-950/50 space-y-3 animate-pulse">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-2">
                <span class="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                <span class="text-xs font-black uppercase tracking-wider text-rose-300">Action Required: Co-Sign</span>
              </div>
              <span class="text-[10px] text-rose-400 font-mono">Just Now</span>
            </div>

            <div>
              <h4 class="font-black text-white text-base">⚠️ Dad is sending ₹ ${pending[0].amount.toLocaleString('en-IN')}</h4>
              <p class="text-xs text-rose-200 mt-0.5">Payee: <strong class="text-white">${pending[0].payee}</strong></p>
            </div>

            <!-- Risk Telemetry -->
            <div class="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/30 text-[11px] space-y-1.5 text-slate-300">
              <div class="text-rose-400 font-bold flex items-center">
                <i class="fa-solid fa-triangle-exclamation mr-1.5"></i> Security Triggers:
              </div>
              ${pending[0].amount > 50000 ? `
                <div class="flex items-center space-x-1.5 text-rose-300 font-bold">
                  <i class="fa-solid fa-key text-rose-400"></i>
                  <span>Tier 3 (>₹50,000): Dual OTP verification required</span>
                </div>
              ` : `
                <div class="flex items-center space-x-1.5 text-amber-300">
                  <i class="fa-solid fa-shield-halved text-amber-400"></i>
                  <span>Tier 2 (>₹10,000): Mandates Guardian approval</span>
                </div>
              `}
              ${state.isOnCall ? `
                <div class="flex items-center space-x-1.5 text-rose-200">
                  <i class="fa-solid fa-phone text-xs text-rose-400"></i>
                  <span>Active phone call in progress during transaction!</span>
                </div>
              ` : ''}
              ${!pending[0].isTrusted ? `
                <div class="flex items-center space-x-1.5 text-amber-300">
                  <i class="fa-solid fa-user-xmark text-xs text-amber-400"></i>
                  <span>New unverified payee (Not in trusted contacts)</span>
                </div>
              ` : ''}
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-2 pt-1">
              <button onclick="guardianRejectTransfer(${pending[0].id})" class="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center">
                <i class="fa-solid fa-ban mr-1.5"></i> Reject & Call Dad
              </button>
              <button onclick="guardianApproveTransfer(${pending[0].id})" class="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center">
                <i class="fa-solid fa-shield-check mr-1.5"></i> ${pending[0].amount > 50000 ? 'Issue OTP (9421)' : 'Approve Transfer'}
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Safety Radar & Rules Summary -->
        <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow">
          <div class="flex justify-between items-center mb-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Securis Protection Rules</h4>
            <span class="px-2 py-0.5 rounded-full ${pending.length > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'} font-bold text-[10px]">
              ${pending.length > 0 ? '⚠️ APPROVAL PENDING' : '● ALL RULES ACTIVE'}
            </span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span class="text-slate-400 flex items-center">
                <i class="fa-solid fa-shield-halved text-amber-400 mr-2"></i> Tier 2 Co-Sign Rule:
              </span>
              <span class="font-bold text-white">Above ₹ 10,000</span>
            </div>

            <div class="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span class="text-slate-400 flex items-center">
                <i class="fa-solid fa-key text-rose-400 mr-2"></i> Tier 3 Dual OTP Rule:
              </span>
              <span class="font-bold text-white">Above ₹ 50,000</span>
            </div>

            <div class="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span class="text-slate-400 flex items-center">
                <i class="fa-solid fa-user-plus text-indigo-400 mr-2"></i> New Payee Rule:
              </span>
              <span class="font-bold text-indigo-300">Mandatory Caution Modal</span>
            </div>

            <div class="flex justify-between items-center py-1.5">
              <span class="text-slate-400 flex items-center">
                <i class="fa-solid fa-hourglass-half text-amber-400 mr-2"></i> Safe Escrow:
              </span>
              <span class="font-bold text-white">15-Min Cancellation Window</span>
            </div>
          </div>
        </div>

        <!-- Activity Audit Trail -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Activity & Threat Audit Trail</h4>
            <span class="text-[10px] text-slate-400 font-mono">${state.auditLog.length} Records</span>
          </div>

          <div class="space-y-2 text-xs">
            ${state.auditLog.map(item => `
              <div class="p-3 rounded-xl bg-slate-950/70 border ${item.type === 'blocked' ? 'border-rose-500/40 bg-rose-950/20' : 'border-slate-800'} flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                  <div class="w-8 h-8 rounded-full ${item.type === 'blocked' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'} flex items-center justify-center font-bold">
                    ${item.type === 'blocked' ? '✕' : '✓'}
                  </div>
                  <div>
                    <div class="font-bold text-white">${item.title}</div>
                    <div class="text-[10px] text-slate-400">${item.subtitle} • ${item.time}</div>
                  </div>
                </div>
                <span class="text-[10px] font-semibold ${item.type === 'blocked' ? 'text-rose-400' : 'text-emerald-400'}">${item.status}</span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

    </div>
  `;
}

// =========================================================================
// 6. PAYEE DIRECTORY & NEW PAYEE WARNING INTERCEPTOR
// =========================================================================
function openPayeeDirectoryDialog() {
  const modal = document.getElementById('user-modal-container');
  if (!modal) return;

  updateMiniAIGuide("Please select who you want to pay, or enter a new UPI ID or account number.", null);

  modal.innerHTML = `
    <!-- Header -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <div class="flex items-center space-x-2">
        <span class="text-white font-black text-base">Select Payee</span>
      </div>
      <button onclick="closeUserModal()" class="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold">
        ✕
      </button>
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto py-3 space-y-4">
      
      <!-- Verified Payees List -->
      <div class="space-y-2">
        <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Approved Payees (Zero Risk)</label>
        ${state.trustedContacts.map(c => `
          <button onclick="handlePayeeSelected('${c.name}', '${c.phone}', ${c.defaultAmt}, true)" class="w-full p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between transition text-left">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-slate-800 text-xl flex items-center justify-center">${c.avatar}</div>
              <div>
                <div class="font-extrabold text-white text-sm">${c.name}</div>
                <div class="text-xs text-slate-400">${c.relation} • ${c.phone}</div>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
              ✓ Verified
            </span>
          </button>
        `).join('')}
      </div>

      <!-- Add New Payee Section -->
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/40 space-y-3">
        <div class="flex items-center space-x-2 text-indigo-300 font-bold text-xs">
          <i class="fa-solid fa-user-plus"></i>
          <span>Pay a New Person or UPI ID</span>
        </div>
        
        <div>
          <label class="text-[10px] text-slate-400 uppercase font-bold block mb-1">Enter Name or Business</label>
          <input type="text" id="new-payee-name" placeholder="e.g. Electric Officer / XYZ Store" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500" />
        </div>

        <div>
          <label class="text-[10px] text-slate-400 uppercase font-bold block mb-1">Enter UPI ID / Mobile / Account</label>
          <input type="text" id="new-payee-id" placeholder="e.g. 9876543210@upi" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500" />
        </div>

        <button onclick="submitNewPayeeForm()" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-md">
          <span>Continue with New Payee</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>

    </div>

    <button onclick="closeUserModal()" class="w-full py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
      Cancel
    </button>
  `;

  modal.classList.remove('hidden');
}

function submitNewPayeeForm() {
  const nameInput = document.getElementById('new-payee-name');
  const idInput = document.getElementById('new-payee-id');
  const name = nameInput?.value.trim() || 'NEW_UNVERIFIED_PAYEE';
  const phone = idInput?.value.trim() || 'unknown@upi';

  // Route to the NEW PAYEE WARNING INTERCEPTOR
  showNewPayeeWarningModal(name, phone);
}

// =========================================================================
// NEW PAYEE WARNING POP-UP INTERCEPTOR
// =========================================================================
function showNewPayeeWarningModal(name, phone) {
  const modal = document.getElementById('user-modal-container');
  if (!modal) return;

  // Mini Securis Speaks Warning
  updateMiniAIGuide(`Warning! You are trying to pay ${name}. This account is NOT in your verified directory. Scammers often use new accounts.`, 'newPayeeWarning');

  modal.innerHTML = `
    <div class="my-auto text-center space-y-4 p-2">
      
      <!-- Big Flashing Danger Badge -->
      <div class="w-20 h-20 rounded-full bg-rose-600/20 border-2 border-rose-500 mx-auto flex items-center justify-center text-rose-400 text-4xl animate-bounce">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>

      <div>
        <span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase tracking-wider">
          Security Intercept: New Payee
        </span>
        <h3 class="text-lg font-black text-white mt-2">Unverified Payee Detected</h3>
        <p class="text-xs text-rose-200 mt-1 leading-relaxed">
          <strong class="text-white">${name}</strong> (${phone}) is <strong>not</strong> in your family-approved contacts.
        </p>
      </div>

      <!-- Plain Language Scam Caution Card -->
      <div class="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/60 text-xs text-left space-y-2 text-rose-100">
        <div class="font-bold flex items-center text-rose-300">
          <i class="fa-solid fa-shield-halved mr-1.5"></i> Why are we warning you?
        </div>
        <p class="text-[11px] leading-relaxed text-slate-300">
          • 85% of digital arrest and bill disconnection scams instruct victims to pay new, disposable accounts.<br>
          • Genuine government and bank officials will <strong>never</strong> ask you to transfer funds to verify your identity.
        </p>
      </div>

      <!-- Action Choices -->
      <div class="pt-2 space-y-2">
        <button onclick="abortAndCallGuardian()" class="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-950/60 transition flex items-center justify-center space-x-2">
          <i class="fa-solid fa-phone mr-1.5"></i>
          <span>Stop & Call Guardian Ramesh</span>
        </button>

        <button onclick="handlePayeeSelected('${name}', '${phone}', 5000, false)" class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition">
          I Know This Person — Proceed to Amount
        </button>
      </div>

    </div>
  `;
}

function abortAndCallGuardian() {
  closeUserModal();
  updateMiniAIGuide("Wise choice! You stopped the transaction and chose to consult Ramesh. Staying safe is number one.", null);
  showToast("Transfer aborted. Guardian Ramesh alerted.", "success");
}

// =========================================================================
// 7. TRANSACTION FLOW WITH TIERED SECURITY RULES
// =========================================================================
function handlePayeeSelected(name, phone, defaultAmt, isTrusted) {
  openAmountEntryModal({
    name,
    phone,
    amount: defaultAmt,
    isTrusted
  });
}

function openAmountEntryModal(transfer) {
  const modal = document.getElementById('user-modal-container');
  if (!modal) return;

  updateMiniAIGuide(`Enter how much money you want to transfer to ${transfer.name}. Remember: >₹10,000 requires Guardian approval, and >₹50,000 requires Dual OTP.`, null);

  modal.innerHTML = `
    <!-- Header -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <div class="flex items-center space-x-2">
        <span class="text-white font-black text-base">Enter Amount</span>
      </div>
      <button onclick="closeUserModal()" class="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold">
        ✕
      </button>
    </div>

    <!-- Body -->
    <div class="space-y-4 my-auto py-2">
      <!-- Payee badge -->
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-between">
        <div>
          <div class="text-base font-extrabold text-white">${transfer.name}</div>
          <div class="text-xs text-slate-400">${transfer.phone}</div>
        </div>
        <span class="text-xs px-2.5 py-1 rounded-lg font-bold ${transfer.isTrusted ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'}">
          ${transfer.isTrusted ? '✓ Trusted' : '⚠️ New Payee'}
        </span>
      </div>

      <!-- Amount Input -->
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-700">
        <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Transfer Amount (₹)</label>
        <div class="flex items-center">
          <span class="text-3xl font-black text-emerald-400 mr-2">₹</span>
          <input type="number" id="entered-amount-field" value="${transfer.amount}" class="w-full bg-transparent text-3xl font-black text-white outline-none" oninput="previewSecurityTier(this.value, ${transfer.isTrusted})" />
        </div>
      </div>

      <!-- Live Dynamic Security Tier Indicator -->
      <div id="security-tier-preview" class="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
        <!-- Rendered dynamically -->
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="pt-2 space-y-2">
      <button onclick="processEnteredTransaction('${transfer.name}', '${transfer.phone}', ${transfer.isTrusted})" class="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg shadow-emerald-950/40 transition flex items-center justify-center space-x-2">
        <span>Proceed to Verification</span>
        <i class="fa-solid fa-arrow-right"></i>
      </button>

      <button onclick="closeUserModal()" class="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">
        Cancel
      </button>
    </div>
  `;

  modal.classList.remove('hidden');
  previewSecurityTier(transfer.amount, transfer.isTrusted);
}

function previewSecurityTier(amountStr, isTrusted) {
  const amt = Number(amountStr) || 0;
  const preview = document.getElementById('security-tier-preview');
  if (!preview) return;

  if (amt > 50000) {
    preview.innerHTML = `
      <div class="flex items-center space-x-2 text-rose-400 font-bold mb-1">
        <i class="fa-solid fa-key text-rose-400"></i>
        <span>Tier 3: High Value (>₹50,000)</span>
      </div>
      <p class="text-[11px] text-slate-300">Requires <strong>Dual OTP Verification</strong> (Bank SMS OTP + Guardian Ramesh OTP).</p>
    `;
    preview.className = 'p-3 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-xs';
  } else if (amt > 10000 || !isTrusted || state.isOnCall) {
    preview.innerHTML = `
      <div class="flex items-center space-x-2 text-amber-400 font-bold mb-1">
        <i class="fa-solid fa-user-check text-amber-400"></i>
        <span>Tier 2: Guardian Co-Sign Required (>₹10,000)</span>
      </div>
      <p class="text-[11px] text-slate-300">Approval alert will route directly to Son Ramesh before money can leave.</p>
    `;
    preview.className = 'p-3 rounded-2xl bg-amber-950/50 border border-amber-500/50 text-xs';
  } else {
    preview.innerHTML = `
      <div class="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
        <i class="fa-solid fa-circle-check text-emerald-400"></i>
        <span>Tier 1: Safe Transfer (≤₹10,000)</span>
      </div>
      <p class="text-[11px] text-slate-300">Direct 1-tap biometric fingerprint verification.</p>
    `;
    preview.className = 'p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs';
  }
}

// PROCESS ACCORDING TO USER'S RULES:
// 1. amt <= 10,000: Direct Biometric
// 2. amt > 10,000: Guardian Co-Sign
// 3. amt > 50,000: Dual OTP Verification
function processEnteredTransaction(name, phone, isTrusted) {
  const amtInput = document.getElementById('entered-amount-field');
  const amount = amtInput ? Number(amtInput.value) || 500 : 500;

  if (amount > 50000) {
    // TIER 3: DUAL OTP
    startDualOtpFlow(name, amount, isTrusted);
  } else if (amount > 10000 || !isTrusted || state.isOnCall) {
    // TIER 2: GUARDIAN CO-SIGN
    routeToGuardianApproval(name, amount, isTrusted);
  } else {
    // TIER 1: DIRECT BIOMETRIC
    showBiometricDialog(amount, name);
  }
}

// =========================================================================
// TIER 2: GUARDIAN APPROVAL FLOW (>₹10,000)
// =========================================================================
function routeToGuardianApproval(payee, amount, isTrusted) {
  const approvalReq = {
    id: Date.now(),
    payee,
    amount,
    isTrusted,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  state.pendingApprovals.unshift(approvalReq);
  saveState();

  updateMiniAIGuide(`Because this payment of ₹${amount.toLocaleString('en-IN')} exceeds 10,000 rupees, we sent an approval request to your son Ramesh.`, 'over10kNotice');

  const modal = document.getElementById('user-modal-container');
  modal.innerHTML = `
    <div class="my-auto text-center space-y-5 p-4">
      <div class="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 mx-auto flex items-center justify-center text-amber-400 text-3xl animate-spin">
        <i class="fa-solid fa-hourglass-half"></i>
      </div>

      <div>
        <h3 class="text-xl font-black text-white">Guardian Co-Sign Required</h3>
        <p class="text-xs text-amber-300 mt-2 leading-relaxed">
          Transfers above <strong>₹10,000</strong> must be confirmed by your guardian <strong>Ramesh</strong>.
        </p>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-left space-y-1">
        <div class="text-slate-400">Transferring: <strong class="text-white">₹ ${amount.toLocaleString('en-IN')}</strong></div>
        <div class="text-slate-400">Recipient: <strong class="text-white">${payee}</strong></div>
        <div class="text-emerald-400 font-semibold pt-1">● Ramesh's Securis portal has been alerted.</div>
      </div>

      <div class="pt-4">
        <button onclick="closeUserModal()" class="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold">
          Close / Return Home
        </button>
      </div>
    </div>
  `;
  showToast("Guardian Co-Sign request sent to Son Ramesh (>₹10k rule).", "warning");
}

// =========================================================================
// TIER 3: DUAL OTP VERIFICATION FLOW (>₹50,000)
// =========================================================================
function startDualOtpFlow(payee, amount, isTrusted) {
  // Push into guardian queue with high-value flag
  const approvalReq = {
    id: Date.now(),
    payee,
    amount,
    isTrusted,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  state.pendingApprovals.unshift(approvalReq);
  saveState();

  updateMiniAIGuide(`High value transfer of ₹${amount.toLocaleString('en-IN')}. Both your Bank SMS OTP and your Guardian's OTP are required.`, 'over50kNotice');

  const modal = document.getElementById('user-modal-container');
  modal.innerHTML = `
    <div class="my-auto text-center space-y-4 p-3">
      
      <div class="w-16 h-16 rounded-full bg-rose-600/20 border border-rose-500 mx-auto flex items-center justify-center text-rose-400 text-2xl animate-pulse">
        <i class="fa-solid fa-key"></i>
      </div>

      <div>
        <span class="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black border border-rose-500/30">
          Tier 3 Security: >₹50,000
        </span>
        <h3 class="text-lg font-black text-white mt-1">Dual OTP Verification</h3>
        <p class="text-xs text-slate-300 mt-1 leading-snug">
          To protect large savings, you must verify both your Bank SMS OTP and Ramesh's Guardian OTP.
        </p>
      </div>

      <!-- OTP 1: Bank SMS OTP -->
      <div class="p-3 rounded-2xl bg-slate-900 border border-slate-700 text-left space-y-1.5">
        <div class="flex justify-between text-xs">
          <span class="text-slate-300 font-bold">1. Customer Bank SMS OTP:</span>
          <span class="text-emerald-400 font-mono font-bold">Auto-filled (7829)</span>
        </div>
        <div class="flex justify-center space-x-2">
          <input type="text" maxlength="1" value="7" class="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-slate-700 rounded-xl text-white" readonly />
          <input type="text" maxlength="1" value="8" class="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-slate-700 rounded-xl text-white" readonly />
          <input type="text" maxlength="1" value="2" class="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-slate-700 rounded-xl text-white" readonly />
          <input type="text" maxlength="1" value="9" class="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-slate-700 rounded-xl text-white" readonly />
        </div>
      </div>

      <!-- OTP 2: Guardian Co-Sign OTP -->
      <div class="p-3 rounded-2xl bg-slate-900 border border-amber-500/40 text-left space-y-1.5">
        <div class="flex justify-between text-xs">
          <span class="text-amber-300 font-bold">2. Guardian Ramesh OTP:</span>
          <span class="text-amber-400 font-mono font-bold">(Ramesh enters: 9421)</span>
        </div>
        <div class="flex justify-center space-x-2">
          <input type="text" maxlength="1" value="9" class="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-amber-500/40 rounded-xl text-white" readonly />
          <input type="text" maxlength="1" value="4" class="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-amber-500/40 rounded-xl text-white" readonly />
          <input type="text" maxlength="1" value="2" class="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-amber-500/40 rounded-xl text-white" readonly />
          <input type="text" maxlength="1" value="1" class="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-amber-500/40 rounded-xl text-white" readonly />
        </div>
      </div>

      <p class="text-[10px] text-slate-400">
        🛡️ Once verified, funds enter a 15-minute revocable escrow buffer.
      </p>

      <button onclick="completeDualOtpVerification('${payee}', ${amount})" class="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-950/40 transition">
        Validate Dual OTP & Enter Safe Escrow
      </button>

    </div>
  `;

  showToast("Dual OTP required: Waiting for Bank & Guardian verification.", "warning");
}

function completeDualOtpVerification(payee, amount) {
  // Clear from pending
  if (state.pendingApprovals.length > 0) {
    state.pendingApprovals.shift();
  }

  state.balance -= amount;

  // Put into 15-minute escrow
  const escrowItem = {
    id: Date.now(),
    payee,
    amount,
    remainingSeconds: 900
  };
  state.activeEscrows.unshift(escrowItem);

  state.auditLog.unshift({
    id: Date.now(),
    type: 'escrow',
    title: `₹ ${amount.toLocaleString('en-IN')} to ${payee}`,
    subtitle: 'Dual OTP Verified (>₹50,000 Rule)',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'In Escrow'
  });

  saveState();
  updateMiniAIGuide(`Dual OTP verified! ₹${amount.toLocaleString('en-IN')} has been placed in the 15-minute safe escrow. You can reverse it anytime.`, null);
  showToast("Dual OTP Success! Funds placed in 15-Minute Safe Escrow.", "success");
  openEscrowVaultDialog();
}

// =========================================================================
// TIER 1: DIRECT BIOMETRIC VERIFICATION (≤₹10,000)
// =========================================================================
function showBiometricDialog(amount, payee) {
  const modal = document.getElementById('user-modal-container');
  updateMiniAIGuide(`Please touch the fingerprint sensor to approve this transfer of ₹${amount.toLocaleString('en-IN')}.`, 'safeTransfer');

  modal.innerHTML = `
    <div class="my-auto text-center space-y-6 p-4">
      <div>
        <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
          Tier 1: Safe Transfer (≤₹10,000)
        </span>
        <h3 class="text-xl font-black text-white mt-1">Biometric Verification</h3>
        <p class="text-xs text-slate-400 mt-1">Touch the fingerprint sensor to approve ₹${amount.toLocaleString('en-IN')}</p>
      </div>

      <div class="relative w-28 h-28 mx-auto flex items-center justify-center">
        <div class="absolute inset-0 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 biometric-active"></div>
        <div class="scanner-laser"></div>
        <i class="fa-solid fa-fingerprint text-6xl text-emerald-400"></i>
      </div>

      <div class="text-xs font-bold text-emerald-400 animate-pulse">
        Scanning Biometrics... (Hold 1 sec)
      </div>

      <button onclick="executeSafeTransfer(${amount}, '${payee}')" class="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition">
        Tap to Complete Biometric Scan
      </button>
    </div>
  `;

  setTimeout(() => {
    executeSafeTransfer(amount, payee);
  }, 1800);
}

function executeSafeTransfer(amount, payee) {
  state.balance -= amount;
  state.auditLog.unshift({
    id: Date.now(),
    type: 'safe',
    title: `₹ ${amount.toLocaleString('en-IN')} to ${payee}`,
    subtitle: 'Biometric Verified (≤₹10k Rule)',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Cleared'
  });
  saveState();
  closeUserModal();

  updateMiniAIGuide(`Transfer of ₹${amount.toLocaleString('en-IN')} to ${payee} was completed safely.`, 'safeTransfer');
  showToast(`✓ Success! ₹${amount} sent to ${payee}.`, "success");
}

// =========================================================================
// GUARDIAN APPROVAL / REJECTION
// =========================================================================
function guardianApproveTransfer(id) {
  const index = state.pendingApprovals.findIndex(p => p.id === id);
  if (index === -1) return;

  const req = state.pendingApprovals.splice(index, 1)[0];

  if (req.amount > 50000) {
    // If over 50k, prompt dual OTP screen on user device
    saveState();
    startDualOtpFlow(req.payee, req.amount, req.isTrusted);
    return;
  }

  state.balance -= req.amount;

  const escrowItem = {
    id: Date.now(),
    payee: req.payee,
    amount: req.amount,
    remainingSeconds: 900
  };
  state.activeEscrows.unshift(escrowItem);

  state.auditLog.unshift({
    id: Date.now(),
    type: 'escrow',
    title: `₹ ${req.amount.toLocaleString('en-IN')} to ${req.payee}`,
    subtitle: 'Co-Signed by Ramesh (>₹10k Rule)',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'In Escrow'
  });

  saveState();
  updateMiniAIGuide(`Your son Ramesh approved the payment of ₹${req.amount.toLocaleString('en-IN')}. It is now in safe 15-minute escrow.`, null);
  showToast("Guardian Approved: Placed in 15-Minute Safe Escrow.", "success");
  openEscrowVaultDialog();
}

function guardianRejectTransfer(id) {
  const index = state.pendingApprovals.findIndex(p => p.id === id);
  if (index === -1) return;

  const req = state.pendingApprovals.splice(index, 1)[0];

  state.auditLog.unshift({
    id: Date.now(),
    type: 'blocked',
    title: `₹ ${req.amount.toLocaleString('en-IN')} to ${req.payee}`,
    subtitle: 'BLOCKED by Guardian Ramesh',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Threat Blocked'
  });

  saveState();
  updateMiniAIGuide("Your son Ramesh examined this transfer and declined it. He believes this is a scam attempt.", 'blockedBySon');
  showToast("Guardian blocked the transfer! Grandpa's account is safe.", "error");

  const modal = document.getElementById('user-modal-container');
  if (modal) {
    modal.innerHTML = `
      <div class="my-auto text-center space-y-5 p-4">
        <div class="w-20 h-20 rounded-full bg-rose-600/20 border-2 border-rose-500 mx-auto flex items-center justify-center text-rose-400 text-3xl animate-pulse">
          <i class="fa-solid fa-shield-xmark"></i>
        </div>

        <div>
          <h3 class="text-xl font-black text-white">Transfer Blocked by Ramesh</h3>
          <p class="text-xs text-rose-300 mt-2 leading-relaxed">
            Your son Ramesh examined this transfer and <strong>declined it</strong> to protect you from fraud.
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-xs text-left space-y-2">
          <div class="font-bold text-rose-200">Ramesh's Safety Note:</div>
          <p class="text-slate-300 italic">"Dad, please disconnect the phone call! Scammers frequently pretend to be electricity or police officers."</p>
        </div>

        <div class="pt-3">
          <button onclick="state.isOnCall = false; saveState(); closeUserModal();" class="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition">
            <i class="fa-solid fa-phone-slash mr-2"></i> Disconnect Call & Stay Safe
          </button>
        </div>
      </div>
    `;
    modal.classList.remove('hidden');
  }
}

// =========================================================================
// 8. ESCROW BUFFER & CANCEL FLOW
// =========================================================================
function openEscrowVaultDialog() {
  const modal = document.getElementById('user-modal-container');
  if (!modal) return;

  if (state.activeEscrows.length === 0) {
    modal.innerHTML = `
      <div class="my-auto text-center space-y-4 p-4">
        <div class="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-400 text-2xl">
          <i class="fa-solid fa-box-archive"></i>
        </div>
        <div>
          <h3 class="text-base font-bold text-white">No Active Escrow Buffers</h3>
          <p class="text-xs text-slate-400 mt-1">High-risk transfers enter a 15-minute revocable buffer with instant 1-tap refund.</p>
        </div>
        <button onclick="closeUserModal()" class="py-2.5 px-6 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">
          Back
        </button>
      </div>
    `;
    modal.classList.remove('hidden');
    return;
  }

  const escrow = state.activeEscrows[0];

  modal.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <span class="text-amber-400 font-black text-base">🛡️ 15-Minute Safe Escrow</span>
      <button onclick="closeUserModal()" class="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center">
        ✕
      </button>
    </div>

    <div class="my-auto space-y-5 py-2">
      <div class="p-4 rounded-2xl bg-gradient-to-br from-amber-950/50 to-slate-900 border-2 border-amber-500/60 text-center">
        <span class="text-xs font-bold uppercase tracking-wider text-amber-400">Escrow Cancellation Window</span>
        <div class="text-4xl font-black text-white font-mono tracking-widest my-2">14:52</div>
        <p class="text-[11px] text-slate-300">Funds have NOT yet been delivered. You can cancel and refund right now.</p>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs space-y-1.5">
        <div class="flex justify-between">
          <span class="text-slate-400">Recipient:</span>
          <span class="font-bold text-white">${escrow.payee}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Amount:</span>
          <span class="font-bold text-white">₹ ${escrow.amount.toLocaleString('en-IN')}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Status:</span>
          <span class="font-bold text-emerald-400">Protected in Safe Escrow</span>
        </div>
      </div>

      <button onclick="cancelEscrow(${escrow.id})" class="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-sm shadow-xl shadow-rose-950/60 transition flex items-center justify-center space-x-2">
        <i class="fa-solid fa-arrow-rotate-left text-lg"></i>
        <span>I CHANGED MY MIND - CANCEL & REFUND</span>
      </button>
      <p class="text-[10px] text-slate-400 text-center">Zero fee, 100% immediate credit back to safe balance.</p>
    </div>

    <button onclick="closeUserModal()" class="w-full py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
      Keep in Buffer & Return
    </button>
  `;

  modal.classList.remove('hidden');
}

function cancelEscrow(id) {
  const index = state.activeEscrows.findIndex(e => e.id === id);
  if (index !== -1) {
    const refundAmt = state.activeEscrows[index].amount;
    state.balance += refundAmt;
    state.activeEscrows.splice(index, 1);

    state.auditLog.unshift({
      id: Date.now(),
      type: 'safe',
      title: `₹ ${refundAmt.toLocaleString('en-IN')} Refunded`,
      subtitle: 'Cancelled within 15-min Escrow Buffer',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Refunded'
    });
  }

  saveState();
  updateMiniAIGuide("Transaction cancelled. Your money has been safely restored to your account.", 'escrowRefunded');
  showToast("Escrow cancelled. Funds safely restored to your account.", "success");
  closeUserModal();
}

// =========================================================================
// 9. MINI SECURIS INTERACTIVE GUIDE AGENT
// =========================================================================
function activateMiniSecurisInteractive() {
  speak('welcome');
  updateMiniAIGuide("I am Mini Securis! Tap 'Send Money' to pay someone, or tap 'Is This Safe?' if anyone on a phone call is asking you for money.", null);
}

function interactiveAIGuideFlow(action) {
  if (action === 'guide') {
    updateMiniAIGuide("Step 1: Tap 'Send Money' to choose an approved contact like Suresh or Ramesh, or enter a new payee.", null);
    openPayeeDirectoryDialog();
  } else if (action === 'safetyCheck') {
    if (state.isOnCall) {
      updateMiniAIGuide("⚠️ DANGER! You are on a phone call right now. Scammers often pretend to be police or power officers. DO NOT transfer money!", 'scamWarning');
    } else {
      updateMiniAIGuide("All systems safe! No active phone call detected, and all spending rules (>₹10k Co-Sign, >₹50k Dual OTP) are active.", null);
    }
  }
}

// =========================================================================
// 10. SCENARIO TRIGGERS (FOR DEMO TOOLBAR)
// =========================================================================
function triggerScenario(type) {
  if (state.isLocked) {
    showToast("Dad's app is currently locked by Guardian. Unlock first.", "error");
    return;
  }

  if (type === 'safe') {
    state.isOnCall = false;
    saveState();
    handlePayeeSelected('Suresh (Milkman)', '9876543212', 2000, true);
  } else if (type === 'over10k') {
    state.isOnCall = false;
    saveState();
    handlePayeeSelected('Ramesh (Son)', '9876543210', 15000, true);
  } else if (type === 'over50k') {
    state.isOnCall = false;
    saveState();
    handlePayeeSelected('Dr. Verma (Clinic)', '9876543213', 60000, true);
  } else if (type === 'newPayee') {
    state.isOnCall = true;
    saveState();
    showNewPayeeWarningModal('POWER_DEPT_OFFICER', '8877665544@upi');
  }
}

function toggleActiveCall() {
  state.isOnCall = !state.isOnCall;
  saveState();
  if (state.isOnCall) {
    updateMiniAIGuide("Warning! Active call detected. Scammers force rapid payments. Please be careful.", 'scamWarning');
    showToast("Active Phone Call Simulation: ON (High Scam Risk)", "warning");
  } else {
    showToast("Active Phone Call Simulation: OFF", "info");
  }
}

function toggleAppLock() {
  state.isLocked = !state.isLocked;
  saveState();
  if (state.isLocked) {
    showToast("Guardian locked Dad's app remotely.", "error");
  } else {
    showToast("Dad's app unlocked successfully.", "success");
  }
}

function triggerSOS() {
  alert("🚨 EMERGENCY SOS ACTIVATED!\n- Guardian Ramesh notified.\n- Outgoing digital transfers temporarily frozen.\n- Anti-Fraud helpline contacted.");
  showToast("🚨 SOS Alert Sent to Guardian Ramesh!", "error");
}

function openGuardianInfoDialog() {
  const modal = document.getElementById('user-modal-container');
  if (!modal) return;

  modal.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <span class="text-sky-400 font-black text-base">Linked Family Guardian</span>
      <button onclick="closeUserModal()" class="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold">
        ✕
      </button>
    </div>

    <div class="my-auto space-y-4 py-3 text-center">
      <div class="w-20 h-20 rounded-full bg-sky-700/30 border border-sky-400 mx-auto flex items-center justify-center text-4xl">
        👨‍💼
      </div>
      <div>
        <h3 class="text-lg font-bold text-white">Ramesh Rao (Son)</h3>
        <p class="text-xs text-emerald-400 font-semibold">Active Guardian • Daily Limit ₹1,00,000</p>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-left space-y-2 text-slate-300">
        <div class="flex items-center space-x-2">
          <i class="fa-solid fa-shield-check text-emerald-400"></i>
          <span>Co-signs all payments above ₹10,000</span>
        </div>
        <div class="flex items-center space-x-2">
          <i class="fa-solid fa-key text-rose-400"></i>
          <span>Dual OTP required for payments above ₹50,000</span>
        </div>
        <div class="flex items-center space-x-2">
          <i class="fa-solid fa-bell text-sky-400"></i>
          <span>Receives immediate alert if scam call is detected</span>
        </div>
      </div>
    </div>

    <button onclick="closeUserModal()" class="w-full py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
      Close
    </button>
  `;
  modal.classList.remove('hidden');
}

function closeUserModal() {
  const modal = document.getElementById('user-modal-container');
  if (modal) modal.classList.add('hidden');
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('global-toast');
  const msgEl = document.getElementById('toast-message');
  const iconEl = document.getElementById('toast-icon');
  if (!toast || !msgEl || !iconEl) return;

  msgEl.innerText = message;

  if (type === 'success') {
    iconEl.className = 'w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs';
    iconEl.innerText = '✓';
    toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-200 text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2.5 animate-slide-up';
  } else if (type === 'error') {
    iconEl.className = 'w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs';
    iconEl.innerText = '✕';
    toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 border border-rose-500 text-rose-200 text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2.5 animate-slide-up';
  } else if (type === 'warning') {
    iconEl.className = 'w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs';
    iconEl.innerText = '⚠️';
    toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-500/50 text-amber-200 text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2.5 animate-slide-up';
  } else {
    iconEl.className = 'w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs';
    iconEl.innerText = 'ℹ';
    toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2.5 animate-slide-up';
  }

  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  switchView(state.currentView || 'user');
});
