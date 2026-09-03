/**
 * ShieldBank - Interactive Fraud Protection Engine & Dual-Phone State Machine
 */

const state = {
  balance: 42500,
  isOnCall: false,
  isLocked: false,
  currentLang: 'en-US',
  pendingTransfer: null,
  escrowTransfers: [],
  escrowInterval: null
};

// Vernacular Multilingual Voice Dictionary
const i18n = {
  'en-US': {
    balance: "Your current safe balance is 42,500 rupees.",
    scamWarning: "Warning! You are on an active phone call. Genuine bank officers or police will never ask you to transfer money. Your son Ramesh has been notified.",
    safeSuccess: "Transfer of 500 rupees to Suresh Milkman was successful and verified with biometrics.",
    callMomAlert: "Transaction halted. Your guardian Ramesh blocked this transfer to protect you from fraud. Please talk to Ramesh.",
    cancelRefund: "Transfer cancelled successfully. 15,000 rupees have been safely refunded to your account.",
    escrowStarted: "Payment placed in 15 minute safe buffer. You can cancel at any time.",
    biometricPrompt: "Please touch the fingerprint sensor to verify.",
    accountFrozen: "Your banking app has been locked by your guardian for security."
  },
  'hi-IN': {
    balance: "आपका सुरक्षित बैलेंस 42,500 रुपये है।",
    scamWarning: "सावधान! आप फोन कॉल पर हैं। बैंक अधिकारी कभी भी पैसे ट्रांसफर करने के लिए नहीं कहते। आपके बेटे रमेश को सूचित कर दिया गया है।",
    safeSuccess: "सुरेश ग्वाले को 500 रुपये का ट्रांसफर सुरक्षित रूप से पूरा हो गया है।",
    callMomAlert: "ट्रांसफर रोक दिया गया है। धोखाधड़ी से बचाने के लिए आपके बेटे रमेश ने इसे रद्द कर दिया है।",
    cancelRefund: "भुगतान रद्द कर दिया गया है। 15,000 रुपये आपके खाते में वापस जमा कर दिए गए हैं।",
    escrowStarted: "भुगतान 15 मिनट के सुरक्षित एस्क्रो में है। आप कभी भी रद्द कर सकते हैं।",
    biometricPrompt: "कृपया पुष्टि करने के लिए फिंगरप्रिंट सेंसर को स्पर्श करें।",
    accountFrozen: "सुरक्षा कारणों से आपके अभिभावक ने आपका खाता अस्थायी रूप से लॉक कर दिया है।"
  },
  'te-IN': {
    balance: "మీ సురక్షిత బ్యాలెన్స్ 42,500 రూపాయలు.",
    scamWarning: "హెచ్చరిక! మీరు ఫోన్ కాల్‌లో ఉన్నారు. బ్యాంక్ అధికారులు ఎప్పుడూ డబ్బు పంపమని అడగరు. మీ కుమారుడు రమేష్‌కు సమాచారం అందించబడింది.",
    safeSuccess: "సురేష్‌కు 500 రూపాయల బదిలీ విజయవంతంగా పూర్తయింది.",
    callMomAlert: "లావాదేవీ నిలిపివేయబడింది. మోసం నుండి రక్షించడానికి రమేష్ దీన్ని రద్దు చేశారు.",
    cancelRefund: "లావాదేవీ రద్దు చేయబడింది. 15,000 రూపాయలు మీ ఖాతాకు తిరిగి చేర్చబడ్డాయి.",
    escrowStarted: "చెల్లింపు 15 నిమిషాల సురక్షిత బఫర్‌లో ఉంది. మీరు ఎప్పుడైనా రద్దు చేయవచ్చు.",
    biometricPrompt: "ధృవీకరించడానికి దయచేసి వేలిముద్ర సెన్సార్‌ను తాకండి.",
    accountFrozen: "భద్రత కొరకు మీ ఖాతా తాత్కాలికంగా లాక్ చేయబడింది."
  },
  'es-ES': {
    balance: "Su saldo seguro actual es de 42.500 rupias.",
    scamWarning: "¡Advertencia! Está en una llamada telefónica activa. El personal del banco nunca le pedirá que transfiera dinero.",
    safeSuccess: "Transferencia de 500 rupias a Suresh realizada con éxito.",
    callMomAlert: "Transacción detenida. Su guardián Ramesh bloqueó esta transferencia.",
    cancelRefund: "Transferencia cancelada con éxito. Fondos reembolsados a su cuenta.",
    escrowStarted: "Pago retenido en búfer de 15 minutos. Puede cancelar en cualquier momento.",
    biometricPrompt: "Toque el sensor de huellas dactilares para verificar.",
    accountFrozen: "Su aplicación bancaria ha sido bloqueada por su guardián por seguridad."
  }
};

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);
});

function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sClock = document.getElementById('senior-clock');
  const gClock = document.getElementById('guardian-clock');
  if (sClock) sClock.innerText = timeStr;
  if (gClock) gClock.innerText = timeStr;
}

// Text-to-Speech Engine
function speak(key) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); // Stop ongoing speech

  const lang = state.currentLang || 'en-US';
  const text = i18n[lang]?.[key] || i18n['en-US'][key] || key;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95; // Slightly slower, clearer for seniors
  utterance.pitch = 1.0;

  // Visual highlight on Mini AI bubble
  const bubble = document.getElementById('mini-ai-bubble');
  if (bubble) {
    bubble.classList.add('ring-2', 'ring-indigo-400');
    utterance.onend = () => bubble.classList.remove('ring-2', 'ring-indigo-400');
  }

  window.speechSynthesis.speak(utterance);
}

function speakBalance() {
  speak('balance');
  updateMiniAIText(`"Your safe balance is ₹42,500. All accounts protected."`);
}

function speakCurrentWarning() {
  speak('scamWarning');
}

function replayCurrentAIText() {
  const text = document.getElementById('mini-ai-text').innerText.replace(/"/g, '');
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.currentLang;
  window.speechSynthesis.speak(utterance);
}

function updateMiniAIText(text) {
  const elem = document.getElementById('mini-ai-text');
  if (elem) elem.innerText = text;
}

function changeVoiceLanguage(lang) {
  state.currentLang = lang;
  speak('balance');
}

// TOGGLE ACTIVE CALL (Scam Simulator Trigger)
function toggleActiveCall(forceState) {
  state.isOnCall = forceState !== undefined ? forceState : !state.isOnCall;
  const badge = document.getElementById('call-active-badge');
  const warnBox = document.getElementById('active-call-warning-box');
  const icon = document.getElementById('call-icon');
  const text = document.getElementById('call-text');

  if (state.isOnCall) {
    badge.classList.remove('hidden');
    warnBox.classList.remove('hidden');
    icon.className = 'fa-solid fa-phone text-rose-400 animate-pulse';
    text.innerText = 'Call: ON (Risk)';
    text.className = 'text-rose-400 font-bold';
    updateMiniAIText(`"⚠️ Warning: Active phone call detected! Scammers often demand quick transfers. Genuine bank staff never call to ask for funds."`);
    speak('scamWarning');
  } else {
    badge.classList.add('hidden');
    warnBox.classList.add('hidden');
    icon.className = 'fa-solid fa-phone-slash text-slate-400';
    text.innerText = 'Call: Off';
    text.className = 'text-slate-300';
    updateMiniAIText(`"Monitoring active. Ready for safe transactions."`);
  }
}

// TRIGGER SCENARIO 1: SAFE TRANSFER (₹500 to Milkman Suresh)
function triggerScenario(type) {
  if (state.isLocked) {
    alert("Grandpa's account is currently locked by Guardian. Unlock first.");
    return;
  }

  if (type === 'safe') {
    toggleActiveCall(false);
    prefillPayment('Suresh (Milkman)', '9876543212', 500, true);
  } else if (type === 'scam') {
    // Turn on active call & trigger high risk transfer
    toggleActiveCall(true);
    prefillPayment('POWER_OFFICER_VERIFY', '8877665544', 15000, false);
  }
}

// Prefill payment flow
function prefillPayment(name, number, amount, isTrusted) {
  state.pendingTransfer = { name, number, amount, isTrusted };
  openSeniorPayModal();
}

// OPEN SENIOR PAYMENT MODAL
function openSeniorPayModal() {
  const modal = document.getElementById('senior-modal');
  const transfer = state.pendingTransfer || {
    name: 'Suresh (Milkman)',
    number: '9876543212',
    amount: 500,
    isTrusted: true
  };

  const isHighRisk = !transfer.isTrusted || state.isOnCall || transfer.amount > 3000;

  modal.innerHTML = `
    <!-- Modal Header -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <div class="flex items-center space-x-2">
        <span class="text-emerald-400 font-black text-lg">Send Money</span>
        <span class="text-xs px-2 py-0.5 rounded-full ${isHighRisk ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300'}">
          ${isHighRisk ? '⚠️ High Attention' : '🛡️ Safe Transfer'}
        </span>
      </div>
      <button onclick="closeSeniorModal()" class="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center">
        ✕
      </button>
    </div>

    <!-- Payment Details Form (High Contrast & Big Fonts) -->
    <div class="space-y-4 my-auto py-2">
      
      <!-- Recipient Card -->
      <div class="p-3.5 rounded-2xl bg-slate-900 border ${isHighRisk ? 'border-rose-500/50' : 'border-slate-700'}">
        <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Paying To:</label>
        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg font-black text-white">${transfer.name}</div>
            <div class="text-xs text-slate-400">${transfer.number}</div>
          </div>
          <span class="text-xs px-2.5 py-1 rounded-lg font-bold ${transfer.isTrusted ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'}">
            ${transfer.isTrusted ? '✓ Trusted Contact' : '⚠️ Unknown Account'}
          </span>
        </div>
      </div>

      <!-- Amount Input (Large readable font) -->
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-700">
        <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Amount to Transfer:</label>
        <div class="flex items-center">
          <span class="text-2xl font-bold text-emerald-400 mr-2">₹</span>
          <input type="number" id="pay-amount-input" value="${transfer.amount}" class="w-full bg-transparent text-2xl font-black text-white outline-none" />
        </div>
      </div>

      <!-- Plain-Language Trust Radar Box -->
      ${isHighRisk ? `
        <div class="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500 text-rose-200 text-xs space-y-2">
          <div class="font-bold flex items-center text-rose-300">
            <i class="fa-solid fa-shield-halved mr-1.5 text-rose-400 text-sm"></i> Shield Guardian Intercept:
          </div>
          <p class="text-[11px] leading-relaxed">
            ${state.isOnCall ? '• Active phone call detected! Scammers rush payments under pressure.<br>' : ''}
            ${!transfer.isTrusted ? '• This account was newly registered 2 days ago.<br>' : ''}
            • Amount exceeds safe threshold (₹3,000). Co-sign required.
          </p>
          <div class="p-2 rounded-lg bg-slate-900/90 text-amber-300 font-semibold text-[11px] flex items-center">
            <i class="fa-solid fa-mobile-screen mr-2 text-sky-400"></i>
            Sent approval alert to Son Ramesh.
          </div>
        </div>
      ` : `
        <div class="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <i class="fa-solid fa-circle-check text-emerald-400 text-base"></i>
          <span>Verified regular payee. Protected by Touch Biometrics.</span>
        </div>
      `}

    </div>

    <!-- Action Buttons -->
    <div class="pt-2 space-y-2">
      <button onclick="proceedToAuthentication(${isHighRisk})" class="w-full py-4 rounded-2xl font-black text-base transition flex items-center justify-center space-x-2 shadow-lg ${isHighRisk ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'}">
        <i class="fa-solid ${isHighRisk ? 'fa-user-check' : 'fa-fingerprint'} text-lg"></i>
        <span>${isHighRisk ? 'Request Guardian Co-Sign' : 'Verify with Fingerprint'}</span>
      </button>

      <button onclick="closeSeniorModal()" class="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">
        Cancel
      </button>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeSeniorModal() {
  document.getElementById('senior-modal').classList.add('hidden');
}

// PROCEED TO AUTHENTICATION
function proceedToAuthentication(isHighRisk) {
  closeSeniorModal();
  const amtInput = document.getElementById('pay-amount-input');
  if (amtInput && state.pendingTransfer) {
    state.pendingTransfer.amount = Number(amtInput.value) || state.pendingTransfer.amount;
  }

  if (isHighRisk) {
    // Route to Guardian Dual Co-Sign Flow
    triggerGuardianCoSignAlert();
  } else {
    // Route to simplified Biometric Flow
    showBiometricScanner();
  }
}

// =========================================================================
// FLOW 1: SAFE TRANSFER -> BIOMETRIC SCANNER SIMULATION
// =========================================================================
function showBiometricScanner() {
  const bioModal = document.getElementById('biometric-modal');
  bioModal.innerHTML = `
    <div class="w-full max-w-xs space-y-6">
      <div>
        <h3 class="text-lg font-black text-white">Biometric Verification</h3>
        <p class="text-xs text-slate-400 mt-1">Touch sensor or look at screen to approve ₹${state.pendingTransfer.amount}</p>
      </div>

      <!-- Animated Fingerprint Visual -->
      <div class="relative w-28 h-28 mx-auto flex items-center justify-center">
        <div class="absolute inset-0 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 biometric-active"></div>
        <div class="scanner-laser"></div>
        <i class="fa-solid fa-fingerprint text-6xl text-emerald-400"></i>
      </div>

      <div class="text-xs font-semibold text-emerald-400 animate-pulse">
        Scanning Biometrics... (Hold 1 sec)
      </div>

      <button onclick="simulateBiometricSuccess()" class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">
        Tap to Complete Biometric
      </button>
    </div>
  `;
  bioModal.classList.remove('hidden');
  speak('biometricPrompt');

  // Auto-complete after 2 seconds for demo realism
  setTimeout(() => {
    simulateBiometricSuccess();
  }, 2200);
}

function simulateBiometricSuccess() {
  const bioModal = document.getElementById('biometric-modal');
  bioModal.classList.add('hidden');

  // Deduct balance
  const amt = state.pendingTransfer?.amount || 500;
  state.balance -= amt;

  // Trigger audio
  speak('safeSuccess');
  updateMiniAIText(`"Payment of ₹${amt} to ${state.pendingTransfer?.name} completed successfully."`);

  // Log in Guardian app
  addGuardianLog(`₹ ${amt} to ${state.pendingTransfer?.name}`, 'Cleared via Biometric (Safe)');

  alert(`✓ Success! ₹${amt} sent to ${state.pendingTransfer?.name}. Safe transfer completed.`);
}


// =========================================================================
// FLOW 2: SCAM ATTEMPT -> GUARDIAN CO-SIGN PROTOCOL
// =========================================================================
function triggerGuardianCoSignAlert() {
  // Show waiting state on Grandpa's phone
  const modal = document.getElementById('senior-modal');
  modal.innerHTML = `
    <div class="my-auto text-center space-y-5 p-4">
      <div class="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 mx-auto flex items-center justify-center text-amber-400 text-3xl animate-spin">
        <i class="fa-solid fa-hourglass-half"></i>
      </div>

      <div>
        <h3 class="text-xl font-black text-white">Guardian Co-Sign Requested</h3>
        <p class="text-xs text-amber-300 mt-2 leading-relaxed">
          Because an active call was detected and this payee is unknown, an approval request was sent to your son <strong>Ramesh</strong>.
        </p>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-left space-y-1">
        <div class="text-slate-400">Transferring: <strong class="text-white">₹ ${state.pendingTransfer.amount}</strong></div>
        <div class="text-slate-400">Recipient: <strong class="text-white">${state.pendingTransfer.name}</strong></div>
        <div class="text-emerald-400 font-semibold pt-1">● Ramesh's phone is ringing right now.</div>
      </div>

      <div class="pt-4">
        <button onclick="closeSeniorModal()" class="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold">
          Abort / Go Back
        </button>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');

  // Trigger priority approval card on Guardian phone (Device 2)
  const gCard = document.getElementById('guardian-approval-card');
  gCard.classList.remove('hidden');
  gCard.scrollIntoView({ behavior: 'smooth' });

  // Update guardian radar status
  const gRadar = document.getElementById('shield-radar-status');
  if (gRadar) {
    gRadar.className = 'px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] animate-pulse';
    gRadar.innerText = '⚠️ CRITICAL ALERT: SCAM RISK';
  }
}

// GUARDIAN ACTION 1: REJECT TRANSFER & PROTECT DAD
function guardianRejectTransfer() {
  // Hide guardian card
  document.getElementById('guardian-approval-card').classList.add('hidden');

  // Reset radar
  const gRadar = document.getElementById('shield-radar-status');
  if (gRadar) {
    gRadar.className = 'px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]';
    gRadar.innerText = '● ALL SYSTEMS SAFE (THREAT BLOCKED)';
  }

  // Add to Guardian activity log
  addGuardianLog(`₹ 15,000 to POWER_OFFICER`, 'BLOCKED by Guardian (Scam Call)', true);

  // Update Grandpa's screen to alert him
  const modal = document.getElementById('senior-modal');
  modal.innerHTML = `
    <div class="my-auto text-center space-y-5 p-4">
      <div class="w-20 h-20 rounded-full bg-rose-600/20 border-2 border-rose-500 mx-auto flex items-center justify-center text-rose-400 text-3xl animate-pulse">
        <i class="fa-solid fa-shield-xmark"></i>
      </div>

      <div>
        <h3 class="text-xl font-black text-white">Transfer Blocked by Ramesh</h3>
        <p class="text-xs text-rose-300 mt-2 leading-relaxed">
          Your son Ramesh reviewed this transaction and <strong>declined it</strong>. Ramesh has flagged this caller as a potential scammer.
        </p>
      </div>

      <div class="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-xs text-left space-y-2">
        <div class="font-bold text-rose-200">Son's Note:</div>
        <p class="text-slate-300 italic">"Dad, disconnect the call immediately! Electricity departments never threaten arrest or demand UPI payments."</p>
      </div>

      <div class="pt-3 space-y-2">
        <button onclick="toggleActiveCall(false); closeSeniorModal();" class="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition">
          <i class="fa-solid fa-phone-slash mr-2"></i> Disconnect Call & Stay Safe
        </button>
      </div>
    </div>
  `;

  // Voice AI speaks to Grandpa
  speak('callMomAlert');
  updateMiniAIText(`"Ramesh blocked this transfer. Please hang up your phone call. Scammers try to panic you."`);
}

// GUARDIAN ACTION 2: APPROVE WITH OTP -> MOVES TO 15-MIN ESCROW BUFFER
function guardianApproveWithOTP() {
  document.getElementById('guardian-approval-card').classList.add('hidden');

  // Prompt Grandpa for the Guardian OTP (Simulated 9421)
  const modal = document.getElementById('senior-modal');
  modal.innerHTML = `
    <div class="my-auto text-center space-y-5 p-4">
      <div class="w-16 h-16 rounded-full bg-sky-500/20 border border-sky-400 mx-auto flex items-center justify-center text-sky-400 text-2xl">
        <i class="fa-solid fa-key"></i>
      </div>

      <div>
        <h3 class="text-lg font-black text-white">Enter Guardian OTP</h3>
        <p class="text-xs text-slate-300 mt-1">Ramesh verified this transfer and sent a safety OTP to his phone: <strong class="text-emerald-400">9421</strong></p>
      </div>

      <!-- Large OTP Input Grid -->
      <div class="flex justify-center space-x-3 my-4">
        <input type="text" maxlength="1" value="9" class="w-12 h-14 text-2xl font-black text-center bg-slate-900 border border-slate-700 rounded-xl text-white" readonly />
        <input type="text" maxlength="1" value="4" class="w-12 h-14 text-2xl font-black text-center bg-slate-900 border border-slate-700 rounded-xl text-white" readonly />
        <input type="text" maxlength="1" value="2" class="w-12 h-14 text-2xl font-black text-center bg-slate-900 border border-slate-700 rounded-xl text-white" readonly />
        <input type="text" maxlength="1" value="1" class="w-12 h-14 text-2xl font-black text-center bg-slate-900 border border-slate-700 rounded-xl text-white" readonly />
      </div>

      <div class="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px]">
        🛡️ For safety, funds will be placed into a <strong>15-minute revocable escrow</strong>.
      </div>

      <button onclick="confirmEscrowTransfer()" class="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition">
        Confirm & Start 15-Min Safe Escrow
      </button>
    </div>
  `;
}

// CONFIRM TRANSFER INTO 15-MINUTE ESCROW BUFFER
function confirmEscrowTransfer() {
  const amt = state.pendingTransfer?.amount || 15000;
  state.balance -= amt;

  const newEscrow = {
    id: Date.now(),
    name: state.pendingTransfer?.name || 'POWER_OFFICER_VERIFY',
    amount: amt,
    remainingSeconds: 900 // 15 minutes
  };

  state.escrowTransfers.push(newEscrow);
  updateEscrowBadge();

  // Voice AI
  speak('escrowStarted');
  updateMiniAIText(`"₹${amt} placed in 15-minute safe buffer. You have 15 minutes to cancel and get an instant refund."`);

  // Log in Guardian app
  addGuardianLog(`₹ ${amt} to ${newEscrow.name}`, 'Placed in 15-Min Escrow Buffer');

  // Display Escrow screen
  showEscrowBufferView();
}

// =========================================================================
// FEATURE 3: 15-MINUTE SAFE ESCROW BUFFER VIEW
// =========================================================================
function showEscrowBufferView() {
  const modal = document.getElementById('senior-modal');

  if (state.escrowTransfers.length === 0) {
    modal.innerHTML = `
      <div class="my-auto text-center space-y-4 p-4">
        <div class="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-400 text-2xl">
          <i class="fa-solid fa-box-archive"></i>
        </div>
        <div>
          <h3 class="text-base font-bold text-white">No Active Escrow Buffers</h3>
          <p class="text-xs text-slate-400 mt-1">High-risk transfers enter a 15-minute revocable buffer with 1-tap refund.</p>
        </div>
        <button onclick="closeSeniorModal()" class="py-2.5 px-6 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">
          Back
        </button>
      </div>
    `;
    modal.classList.remove('hidden');
    return;
  }

  const escrow = state.escrowTransfers[0];

  modal.innerHTML = `
    <!-- Header -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <span class="text-amber-400 font-black text-base">🛡️ 15-Minute Safe Escrow</span>
      <button onclick="closeSeniorModal()" class="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center">
        ✕
      </button>
    </div>

    <!-- Escrow Card Details -->
    <div class="my-auto space-y-5 py-2">
      
      <!-- Big Countdown Clock -->
      <div class="p-4 rounded-2xl bg-gradient-to-br from-amber-950/50 to-slate-900 border-2 border-amber-500/60 text-center">
        <span class="text-xs font-bold uppercase tracking-wider text-amber-400">Escrow Cancellation Window</span>
        <div id="escrow-countdown" class="text-4xl font-black text-white font-mono tracking-widest my-2">14:52</div>
        <p class="text-[11px] text-slate-300">Money has NOT yet been delivered to the recipient. You can reverse it immediately.</p>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs space-y-1.5">
        <div class="flex justify-between">
          <span class="text-slate-400">Recipient:</span>
          <span class="font-bold text-white">${escrow.name}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Amount:</span>
          <span class="font-bold text-white">₹ ${escrow.amount}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Guardian Status:</span>
          <span class="font-bold text-emerald-400">Co-Signed by Ramesh</span>
        </div>
      </div>

      <!-- Big Red Instant Cancel & Refund Button -->
      <button onclick="cancelEscrowTransfer(${escrow.id})" class="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-sm shadow-xl shadow-rose-950/60 transition flex items-center justify-center space-x-2">
        <i class="fa-solid fa-arrow-rotate-left text-lg"></i>
        <span>I CHANGED MY MIND - CANCEL & REFUND</span>
      </button>
      
      <p class="text-[10px] text-slate-400 text-center">
        Zero fee, 100% immediate credit back to your account.
      </p>

    </div>

    <button onclick="closeSeniorModal()" class="w-full py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
      Keep in Escrow & Return
    </button>
  `;

  modal.classList.remove('hidden');

  // Start countdown interval
  if (state.escrowInterval) clearInterval(state.escrowInterval);
  state.escrowInterval = setInterval(() => {
    if (escrow.remainingSeconds > 0) {
      escrow.remainingSeconds--;
      const mins = Math.floor(escrow.remainingSeconds / 60).toString().padStart(2, '0');
      const secs = (escrow.remainingSeconds % 60).toString().padStart(2, '0');
      const el = document.getElementById('escrow-countdown');
      if (el) el.innerText = `${mins}:${secs}`;
    }
  }, 1000);
}

// CANCEL ESCROW TRANSFER & REFUND
function cancelEscrowTransfer(id) {
  const index = state.escrowTransfers.findIndex(t => t.id === id);
  if (index !== -1) {
    const refundAmt = state.escrowTransfers[index].amount;
    state.balance += refundAmt;
    state.escrowTransfers.splice(index, 1);
  }

  if (state.escrowInterval) clearInterval(state.escrowInterval);
  updateEscrowBadge();

  // Audio confirmation
  speak('cancelRefund');
  updateMiniAIText(`"Transaction cancelled. ₹15,000 refunded safely to your account."`);

  // Guardian activity log
  addGuardianLog(`₹ 15,000 Refunded`, 'Grandpa cancelled within 15-min escrow');

  // Show Refunded Screen
  const modal = document.getElementById('senior-modal');
  modal.innerHTML = `
    <div class="my-auto text-center space-y-4 p-4">
      <div class="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 text-3xl">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <div>
        <h3 class="text-xl font-black text-white">Refund Completed!</h3>
        <p class="text-xs text-emerald-300 mt-1">₹15,000 has been returned to your safe balance.</p>
      </div>
      <div class="text-xs text-slate-400">
        New Safe Balance: <strong class="text-white">₹ ${state.balance.toLocaleString('en-IN')}</strong>
      </div>
      <button onclick="closeSeniorModal()" class="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
        Done
      </button>
    </div>
  `;
}

function updateEscrowBadge() {
  const badge = document.getElementById('escrow-badge-count');
  if (badge) {
    const count = state.escrowTransfers.length;
    badge.innerText = `${count} Active ${count === 1 ? 'Buffer' : 'Buffers'}`;
  }
}

// EMERGENCY SOS
function triggerEmergencySOS() {
  alert("🚨 EMERGENCY SOS ACTIVATED!\n- Guardian Ramesh has been called.\n- Digital outgoing transfers locked for 1 hour.\n- Anti-Scam hotline alerted.");
  updateMiniAIText(`"Emergency SOS sent to your son Ramesh. Outgoing transfers are safely paused."`);
}

// GUARDIAN EMERGENCY FREEZE SWITCH
function toggleFreezeAccount() {
  state.isLocked = !state.isLocked;
  const btn = document.getElementById('btn-freeze-account');
  const txt = document.getElementById('freeze-text');
  const seniorScreen = document.getElementById('senior-screen');

  if (state.isLocked) {
    btn.className = 'px-3 py-1.5 rounded-full bg-rose-600 text-white border border-rose-500 text-xs font-bold transition flex items-center shadow-lg shadow-rose-900/50';
    txt.innerText = 'Unlock Dad';

    // Cover senior screen with lock banner
    const lockOverlay = document.createElement('div');
    lockOverlay.id = 'senior-lock-overlay';
    lockOverlay.className = 'absolute inset-0 bg-slate-950/98 z-50 p-6 flex flex-col items-center justify-center text-center space-y-4';
    lockOverlay.innerHTML = `
      <div class="w-20 h-20 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 text-3xl">
        <i class="fa-solid fa-lock"></i>
      </div>
      <div>
        <h3 class="text-lg font-black text-white">App Temporarily Shielded</h3>
        <p class="text-xs text-rose-300 mt-2 leading-relaxed">
          Your son Ramesh locked this app to protect you from an unauthorized scam. Please talk to Ramesh.
        </p>
      </div>
      <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
        Ramesh's Phone: <strong>+91 98765 43210</strong>
      </div>
    `;
    seniorScreen.appendChild(lockOverlay);
    speak('accountFrozen');
  } else {
    btn.className = 'px-3 py-1.5 rounded-full bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center';
    txt.innerText = "Lock Dad's App";

    const lockOverlay = document.getElementById('senior-lock-overlay');
    if (lockOverlay) lockOverlay.remove();
  }
}

// LOG HELPER FOR GUARDIAN FEED
function addGuardianLog(title, subtitle, isAlert = false) {
  const list = document.getElementById('guardian-activity-list');
  if (!list) return;

  const item = document.createElement('div');
  item.className = `p-3 rounded-xl bg-slate-900/90 border ${isAlert ? 'border-rose-500/60 bg-rose-950/30' : 'border-slate-800'} flex items-center justify-between text-xs`;
  item.innerHTML = `
    <div class="flex items-center space-x-2.5">
      <div class="w-8 h-8 rounded-full ${isAlert ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'} flex items-center justify-center font-bold">
        ${isAlert ? '✕' : '✓'}
      </div>
      <div>
        <div class="font-bold text-white">${title}</div>
        <div class="text-[10px] text-slate-400">${subtitle}</div>
      </div>
    </div>
    <span class="text-[10px] ${isAlert ? 'text-rose-400 font-bold' : 'text-slate-400'}">Just now</span>
  `;

  list.prepend(item);
}

// GUARDIAN INFO MODAL (Senior Device)
function showGuardianInfoModal() {
  const modal = document.getElementById('senior-modal');
  modal.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <span class="text-sky-400 font-black text-base">Linked Family Guardian</span>
      <button onclick="closeSeniorModal()" class="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center">
        ✕
      </button>
    </div>

    <div class="my-auto space-y-4 py-3 text-center">
      <div class="w-20 h-20 rounded-full bg-sky-700/30 border border-sky-400 mx-auto flex items-center justify-center text-4xl">
        👨‍💼
      </div>
      <div>
        <h3 class="text-lg font-bold text-white">Ramesh Rao (Son)</h3>
        <p class="text-xs text-emerald-400 font-semibold">Active Guardian • Daily Limit ₹20,000</p>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-left space-y-2 text-slate-300">
        <div class="flex items-center space-x-2">
          <i class="fa-solid fa-shield-check text-emerald-400"></i>
          <span>Co-signs payments to unverified recipients</span>
        </div>
        <div class="flex items-center space-x-2">
          <i class="fa-solid fa-bell text-sky-400"></i>
          <span>Receives immediate alert if scam call is detected</span>
        </div>
        <div class="flex items-center space-x-2">
          <i class="fa-solid fa-phone text-indigo-400"></i>
          <span>Direct SOS emergency hotline</span>
        </div>
      </div>
    </div>

    <button onclick="closeSeniorModal()" class="w-full py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
      Close
    </button>
  `;
  modal.classList.remove('hidden');
}

// AI VOICE ASSISTANT ACTIVATION
function activateSeniorAIAssistant() {
  updateMiniAIText(`"Listening... Say 'Send 500 to Suresh' or 'Check my balance'"`);
  speak('balance');
}

// RESET PROTOTYPE
function resetAll() {
  state.balance = 42500;
  state.isOnCall = false;
  state.isLocked = false;
  state.pendingTransfer = null;
  state.escrowTransfers = [];
  if (state.escrowInterval) clearInterval(state.escrowInterval);

  toggleActiveCall(false);
  updateEscrowBadge();
  closeSeniorModal();

  const lockOverlay = document.getElementById('senior-lock-overlay');
  if (lockOverlay) lockOverlay.remove();

  const gCard = document.getElementById('guardian-approval-card');
  if (gCard) gCard.classList.add('hidden');

  const gRadar = document.getElementById('shield-radar-status');
  if (gRadar) {
    gRadar.className = 'px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]';
    gRadar.innerText = '● ALL SYSTEMS SAFE';
  }

  updateMiniAIText(`"I am monitoring your transactions. If anyone asks you to pay to cancel an arrest or power cut, tap SOS or tell me."`);
  alert("Prototype reset to default state.");
}
