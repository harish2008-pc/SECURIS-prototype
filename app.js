/**
 * Securis v1.3 - Core Application & State Engine
 * Multi-Guardian Network | Screen-Share Shield | Night-Time Cool-Down | Digital Receipts | Mini Securis AI
 */

// =========================================================================
// 1. STATE STORE & PERSISTENCE
// =========================================================================
const DEFAULT_STATE = {
  currentView: 'user', // 'user' | 'guardian' | 'dual'
  balance: 85000,
  isOnCall: false,
  isScreenSharing: false, // AnyDesk / TeamViewer simulator
  isNightTime: false,     // 11 PM - 6 AM late-night panic transfer simulator
  isLocked: false,
  ultraContrast: false,
  currentLang: 'en-US',
  guardianApprovalThreshold: 10000, // >10k requires Guardian
  guardianOtpThreshold: 50000,      // >50k requires Single Guardian OTP
  pendingApprovals: [],
  activeEscrows: [],
  lastTransaction: {
    id: 'SEC-98421',
    payee: 'Suresh (Milkman)',
    amount: 500,
    time: 'Today, 8:15 AM',
    guardianSigned: 'Ramesh Rao (Son)',
    status: 'Settled & Verified'
  },
  guardians: [
    { id: 1, name: 'Ramesh Rao', relation: 'Son (Primary Guardian)', phone: '+91 98765 43210', avatar: '👨‍💼', status: 'Online & Monitoring' },
    { id: 2, name: 'Priya Rao', relation: 'Daughter (Secondary Guardian)', phone: '+91 98765 43211', avatar: '👩‍⚕️', status: 'Active Co-Signer' }
  ],
  aiGuideText: "Hello Mr. Rao! I am Mini Securis. Tap 'Talk to AI' or speak commands like 'Send 500 to Suresh' or 'Show my last receipt'.",
  chatMessages: [
    { sender: 'ai', text: "Hello Mr. Rao! I am Mini Securis. You can speak or type to me anytime. Try saying 'Check my balance', 'Send 500 to Suresh', or 'Show last receipt'!", time: 'Just Now' }
  ],
  auditLog: [
    { id: 1, type: 'safe', title: '₹ 500 to Suresh (Milkman)', subtitle: 'Biometric Verified • Regular Payee', time: '8:15 AM', status: 'Cleared' },
    { id: 2, type: 'blocked', title: '₹ 25,000 to UNKNOWN_LOTTERY', subtitle: 'Blocked by Guardian Ramesh (>₹10k rule)', time: 'Yesterday', status: 'Threat Blocked' },
    { id: 3, type: 'blocked', title: '₹ 15,000 to POWER_OFFICER', subtitle: 'Screen-Share Intercept (AnyDesk Active)', time: '3 Days Ago', status: 'Threat Blocked' }
  ],
  trustedContacts: [
    { name: 'Ramesh (Son)', phone: '9876543210', avatar: '👨‍💼', relation: 'Primary Guardian', verified: true, defaultAmt: 5000 },
    { name: 'Priya (Daughter)', phone: '9876543211', avatar: '👩‍⚕️', relation: 'Secondary Guardian', verified: true, defaultAmt: 2000 },
    { name: 'Suresh (Milkman)', phone: '9876543212', avatar: '🥛', relation: 'Regular Merchant', verified: true, defaultAmt: 500 },
    { name: 'Dr. Verma (Clinic)', phone: '9876543213', avatar: '🩺', relation: 'Medical Services', verified: true, defaultAmt: 1500 }
  ]
};

// Load or Initialize State
let state = loadPersistedState();
let speechRecognitionInstance = null;
let isRecognizing = false;

function loadPersistedState() {
  try {
    const saved = localStorage.getItem('securis_state_v1_3');
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
    localStorage.setItem('securis_state_v1_3', JSON.stringify(state));
  } catch (e) {
    console.warn("Could not save to localStorage", e);
  }
  syncAllViews();
}

function resetSecurisData() {
  localStorage.removeItem('securis_state_v1_3');
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
    screenShareAlert: "Danger! Remote screen sharing detected. Someone may be watching or controlling your screen via AnyDesk. Outgoing transfers are paused!",
    nightTimeAlert: "Night-time mode active. Transfers made late at night are held in a 30-minute cool-down to protect you from panic scams.",
    safeTransfer: "Transfer completed successfully with biometric verification.",
    newPayeeWarning: "Caution! You are paying a new, unverified person. Scammers often use temporary accounts. Please verify before proceeding.",
    over10kNotice: "Transfers above 10,000 rupees require Guardian approval. We notified your son Ramesh to review this.",
    over50kOtpNotice: "High value transfer above 50,000 rupees. Single Guardian OTP verification from Ramesh is required.",
    blockedBySon: "Transfer halted! Your guardian Ramesh rejected this payment to protect you from fraud. Please hang up.",
    escrowRefunded: "Payment cancelled. Funds have been safely refunded back to your account."
  },
  'hi-IN': {
    welcome: "नमस्ते! मैं मिनी सिक्योरिस हूँ। मैं आपके पैसों को धोखाधड़ी से सुरक्षित रखने में मदद करूँगा।",
    balance: "आपका सुरक्षित बैलेंस 85,000 रुपये है। सभी सुरक्षा शील्ड सक्रिय हैं।",
    scamWarning: "सावधान! आप फोन कॉल पर हैं। बैंक अधिकारी या पुलिस कभी भी पैसे ट्रांसफर करने के लिए नहीं कहते।",
    screenShareAlert: "खतरा! स्क्रीन शेयरिंग ऐप सक्रिय है। एनीडेस्क के जरिए कोई आपकी स्क्रीन देख सकता है। ट्रांसफर रोक दिया गया है!",
    nightTimeAlert: "रात्रि सुरक्षा सक्रिय। देर रात के ट्रांसफर 30 मिनट के कूल-डाउन में रखे जाते हैं।",
    safeTransfer: "बायोमेट्रिक सत्यापन के साथ ट्रांसफर सुरक्षित पूरा हो गया है।",
    newPayeeWarning: "सावधान! आप एक नए, असत्यापित व्यक्ति को पैसे भेज रहे हैं।",
    over10kNotice: "10,000 रुपये से अधिक के ट्रांसफर के लिए रमेश की मंजूरी आवश्यक है।",
    over50kOtpNotice: "50,000 रुपये से अधिक का ट्रांसफर। रमेश का गार्जियन ओटीपी आवश्यक है।",
    blockedBySon: "ट्रांसफर रोक दिया गया है! धोखाधड़ी से बचाने के लिए रमेश ने इसे रद्द कर दिया है।",
    escrowRefunded: "भुगतान रद्द कर दिया गया। पैसे सुरक्षित वापस आ गए हैं।"
  },
  'te-IN': {
    welcome: "నమస్కారం! నేను మినీ సెక్యూరిస్. మోసాల నుండి మీ డబ్బును రక్షించడానికి సహాయం చేస్తాను.",
    balance: "మీ సురక్షిత బ్యాలెన్స్ 85,000 రూపాయలు. భద్రతా షీల్డ్‌లు సక్రియంగా ఉన్నాయి.",
    scamWarning: "హెచ్చరిక! మీరు ఫోన్ కాల్‌లో ఉన్నారు. బ్యాంక్ అధికారులు ఎప్పుడూ డబ్బు పంపమని అడగరు.",
    screenShareAlert: "ప్రమాదం! స్క్రీన్ షేరింగ్ గుర్తించబడింది. బదిలీ నిలిపివేయబడింది!",
    nightTimeAlert: "రాత్రి భద్రతా మోడ్ సక్రియంగా ఉంది.",
    safeTransfer: "బయోమెట్రిక్ ధృవీకరణతో బదిలీ పూర్తయింది.",
    newPayeeWarning: "హెచ్చరిక! మీరు కొత్త, ధృవీకరించని వ్యక్తికి డబ్బు పంపుతున్నారు.",
    over10kNotice: "10,000 కంటే ఎక్కువ బదిలీకి రమేష్ అనుమతి అవసరం.",
    over50kOtpNotice: "50,000 కంటే ఎక్కువ బదిలీకి రమేష్ గార్డియన్ ఓటీపీ అవసరం.",
    blockedBySon: "లావాదేవీ నిలిపివేయబడింది! రమేష్ దీన్ని రద్దు చేశారు.",
    escrowRefunded: "చెల్లింపు రద్దు చేయబడింది. నిధులు తిరిగి వచ్చాయి."
  },
  'es-ES': {
    welcome: "¡Hola! Soy Mini Securis. Te guiaré y protegeré tu dinero de estafas.",
    balance: "Su saldo seguro es de 85.000 rupias. Toda la protección está activa.",
    scamWarning: "¡Advertencia! Está en una llamada. La policía o el banco nunca piden transferencias.",
    screenShareAlert: "¡Peligro! Pantalla compartida detectada. Transferencias pausadas.",
    nightTimeAlert: "Modo nocturno activo. Retención de 30 minutos.",
    safeTransfer: "Transferencia completada con éxito con biometría.",
    newPayeeWarning: "¡Atención! Está pagando a un nuevo beneficiario no verificado.",
    over10kNotice: "Transferencias mayores a 10.000 requieren aprobación de su tutor.",
    over50kOtpNotice: "Transferencia mayor a 50.000. Se requiere OTP de su guardián.",
    blockedBySon: "Transacción detenida por su guardián.",
    escrowRefunded: "Pago cancelado y reembolsado."
  }
};

function speak(textOrKey) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const lang = state.currentLang || 'en-US';
  const text = translations[lang]?.[textOrKey] || translations['en-US'][textOrKey] || textOrKey;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function updateMiniAIGuide(text, speechKeyOrText = null) {
  state.aiGuideText = text;
  const bubble = document.getElementById('user-ai-bubble-text');
  if (bubble) bubble.innerText = `"${text}"`;
  if (speechKeyOrText) speak(speechKeyOrText);
}

function changeLanguage(lang) {
  state.currentLang = lang;
  saveState();
  speak('welcome');
  showToast(`Language set to ${lang}`, 'info');
}

// =========================================================================
// 3. CONVERSATIONAL AI VOICE & CHAT AGENT ("MINI SECURIS")
// =========================================================================
function openMiniSecurisChatModal() {
  const modal = document.getElementById('ai-chat-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderAIChatMessages();
  speak("Hello! I am Mini Securis. Speak or tap a command.");
}

function closeMiniSecurisChatModal() {
  const modal = document.getElementById('ai-chat-modal');
  if (modal) modal.classList.add('hidden');
  stopVoiceListening();
}

function renderAIChatMessages() {
  const container = document.getElementById('ai-chat-history');
  if (!container) return;

  container.innerHTML = state.chatMessages.map(msg => `
    <div class="flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-start space-x-2">
      ${msg.sender === 'ai' ? `
        <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white text-xs shrink-0">
          🤖
        </div>
      ` : ''}
      <div class="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none leading-relaxed'}">
        <div class="font-semibold text-[10px] ${msg.sender === 'user' ? 'text-indigo-200' : 'text-indigo-400'} mb-0.5">
          ${msg.sender === 'user' ? 'You' : 'Mini Securis'}
        </div>
        ${msg.text}
        <div class="text-[9px] ${msg.sender === 'user' ? 'text-indigo-300' : 'text-slate-400'} text-right mt-1">${msg.time}</div>
      </div>
      ${msg.sender === 'user' ? `
        <div class="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs shrink-0">
          👴
        </div>
      ` : ''}
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

function sendUserVoiceOrTextMessage(text) {
  if (!text || !text.trim()) return;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  state.chatMessages.push({ sender: 'user', text, time });
  renderAIChatMessages();

  setTimeout(() => {
    parseAndExecuteAICommand(text.trim());
  }, 400);
}

function submitAIChatInput() {
  const input = document.getElementById('ai-chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (text) {
    input.value = '';
    sendUserVoiceOrTextMessage(text);
  }
}

function parseAndExecuteAICommand(rawText) {
  const text = rawText.toLowerCase();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let responseText = "";
  let actionFn = null;

  if (text.includes('balance') || text.includes('how much money') || text.includes('kitna paisa')) {
    responseText = `Your current safe balance is ₹${state.balance.toLocaleString('en-IN')}. All shields (>₹10k Co-Sign, >₹50k Guardian OTP, Screen-Share Shield) are fully operational.`;
    actionFn = () => speak(responseText);
  } else if (text.includes('receipt') || text.includes('bill') || text.includes('proof')) {
    responseText = `Opening the official bank receipt for your last transaction of ₹${state.lastTransaction.amount} to ${state.lastTransaction.payee}.`;
    actionFn = () => {
      closeMiniSecurisChatModal();
      openLastTransactionReceipt();
    };
  } else if (text.includes('send') || text.includes('pay') || text.includes('transfer')) {
    const numbers = text.match(/\d+/g);
    let amount = numbers ? parseInt(numbers[0], 10) : 500;

    let contact = null;
    if (text.includes('suresh') || text.includes('milkman')) {
      contact = state.trustedContacts.find(c => c.name.toLowerCase().includes('suresh'));
    } else if (text.includes('ramesh') || text.includes('son')) {
      contact = state.trustedContacts.find(c => c.name.toLowerCase().includes('ramesh'));
    } else if (text.includes('priya') || text.includes('daughter')) {
      contact = state.trustedContacts.find(c => c.name.toLowerCase().includes('priya'));
    } else if (text.includes('verma') || text.includes('doctor') || text.includes('clinic')) {
      contact = state.trustedContacts.find(c => c.name.toLowerCase().includes('verma'));
    }

    if (contact) {
      if (amount > 50000) {
        responseText = `Preparing high-value transfer of ₹${amount.toLocaleString('en-IN')} to ${contact.name}. Because this exceeds ₹50,000, Guardian OTP verification from Ramesh is required.`;
        actionFn = () => {
          closeMiniSecurisChatModal();
          startSingleGuardianOtpFlow(contact.name, amount, true);
        };
      } else if (amount > 10000) {
        responseText = `Preparing transfer of ₹${amount.toLocaleString('en-IN')} to ${contact.name}. Because this exceeds ₹10,000, Guardian Co-Sign from Son Ramesh is required.`;
        actionFn = () => {
          closeMiniSecurisChatModal();
          routeToGuardianApproval(contact.name, amount, true);
        };
      } else {
        responseText = `Setting up safe transfer of ₹${amount.toLocaleString('en-IN')} to ${contact.name}. Fast-path biometric verification ready.`;
        actionFn = () => {
          closeMiniSecurisChatModal();
          showBiometricDialog(amount, contact.name);
        };
      }
    } else {
      responseText = `I hear you want to transfer money. Opening the Payee Directory so you can choose a recipient.`;
      actionFn = () => {
        closeMiniSecurisChatModal();
        openPayeeDirectoryDialog();
      };
    }
  } else if (text.includes('add payee') || text.includes('new payee') || text.includes('register payee')) {
    responseText = `Opening the Payee Directory. Remember: always exercise extreme caution when paying new, unverified accounts.`;
    actionFn = () => {
      closeMiniSecurisChatModal();
      openPayeeDirectoryDialog();
    };
  } else if (text.includes('guardian') || text.includes('co-sign') || text.includes('ramesh') || text.includes('priya')) {
    responseText = `Here is how your Multi-Guardian Network works: Both your son Ramesh and daughter Priya act as your safety co-signers. For any transfer above ₹10,000, they receive an alert to verify the recipient. They cannot withdraw your money—they only protect you from scams!`;
    actionFn = () => speak(responseText);
  } else if (text.includes('scam') || text.includes('call') || text.includes('safe') || text.includes('screen') || text.includes('police')) {
    if (state.isScreenSharing) {
      responseText = `🚨 CRITICAL WARNING: Remote screen sharing (AnyDesk/TeamViewer) is currently ACTIVE! Someone may be viewing or controlling your phone. Outgoing payments are frozen!`;
      actionFn = () => speak(responseText);
    } else if (state.isOnCall) {
      responseText = `⚠️ DANGER ALERT: You are on an active phone call! Scammers frequently impersonate police or power officials. HANG UP IMMEDIATELY!`;
      actionFn = () => speak(responseText);
    } else {
      responseText = `All systems safe! No active calls or screen-sharing apps detected. Your balance of ₹${state.balance.toLocaleString('en-IN')} is guarded.`;
      actionFn = () => speak(responseText);
    }
  } else {
    responseText = `I'm here to help! You can say:\n• "Check my balance"\n• "Send 500 to Suresh"\n• "Send 15000 to Ramesh"\n• "Show last receipt"\n• "Add new payee"`;
    actionFn = () => speak(responseText);
  }

  state.chatMessages.push({ sender: 'ai', text: responseText, time });
  renderAIChatMessages();

  if (actionFn) actionFn();
}

function toggleVoiceListening() {
  if (isRecognizing) {
    stopVoiceListening();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser. Please type or use quick chips.");
    return;
  }

  speechRecognitionInstance = new SpeechRecognition();
  speechRecognitionInstance.lang = state.currentLang || 'en-US';
  speechRecognitionInstance.interimResults = false;
  speechRecognitionInstance.maxAlternatives = 1;

  const micStatus = document.getElementById('mic-status-bar');
  const micBtn = document.getElementById('btn-mic-toggle');

  speechRecognitionInstance.onstart = () => {
    isRecognizing = true;
    if (micStatus) micStatus.classList.remove('hidden');
    if (micBtn) micBtn.classList.add('mic-listening', 'bg-rose-600');
  };

  speechRecognitionInstance.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    stopVoiceListening();
    sendUserVoiceOrTextMessage(transcript);
  };

  speechRecognitionInstance.onerror = () => stopVoiceListening();
  speechRecognitionInstance.onend = () => stopVoiceListening();

  try {
    speechRecognitionInstance.start();
  } catch (e) {
    stopVoiceListening();
  }
}

function stopVoiceListening() {
  isRecognizing = false;
  const micStatus = document.getElementById('mic-status-bar');
  const micBtn = document.getElementById('btn-mic-toggle');
  if (micStatus) micStatus.classList.add('hidden');
  if (micBtn) {
    micBtn.classList.remove('mic-listening', 'bg-rose-600');
    micBtn.classList.add('bg-indigo-600');
  }
  if (speechRecognitionInstance) {
    try { speechRecognitionInstance.stop(); } catch (e) {}
  }
}

// =========================================================================
// 4. GLOBAL NAVIGATION & VIEW SWITCHER
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

  // Update Call Toggle
  const callIcon = document.getElementById('call-icon');
  const callText = document.getElementById('call-text');
  const callBtn = document.getElementById('btn-call-toggle');
  if (state.isOnCall) {
    callIcon.className = 'fa-solid fa-phone text-rose-400 animate-pulse mr-1';
    callText.innerText = 'Call: ON (Risk)';
    callBtn.className = 'px-2 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/70 border border-rose-500/50 text-rose-300 transition flex items-center';
  } else {
    callIcon.className = 'fa-solid fa-phone-slash text-slate-400 mr-1';
    callText.innerText = 'Call: Off';
    callBtn.className = 'px-2 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center';
  }

  // Update Screen-Share Toggle
  const ssIcon = document.getElementById('screenshare-icon');
  const ssText = document.getElementById('screenshare-text');
  const ssBtn = document.getElementById('btn-screenshare-toggle');
  if (state.isScreenSharing) {
    ssIcon.className = 'fa-solid fa-desktop text-amber-400 animate-bounce mr-1';
    ssText.innerText = 'AnyDesk: ACTIVE';
    ssBtn.className = 'px-2 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/80 border border-amber-500/60 text-amber-300 transition flex items-center';
  } else {
    ssIcon.className = 'fa-solid fa-desktop text-slate-400 mr-1';
    ssText.innerText = 'AnyDesk: Off';
    ssBtn.className = 'px-2 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center';
  }

  // Update Night Mode Toggle
  const nmIcon = document.getElementById('nightmode-icon');
  const nmText = document.getElementById('nightmode-text');
  const nmBtn = document.getElementById('btn-nightmode-toggle');
  if (state.isNightTime) {
    nmIcon.className = 'fa-solid fa-moon text-indigo-400 animate-pulse mr-1';
    nmText.innerText = 'Night: 30m Cool-down';
    nmBtn.className = 'px-2 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/80 border border-indigo-500/60 text-indigo-300 transition flex items-center';
  } else {
    nmIcon.className = 'fa-solid fa-moon text-slate-400 mr-1';
    nmText.innerText = 'Night: Off';
    nmBtn.className = 'px-2 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center';
  }

  // Update Ultra Contrast Mode
  const body = document.getElementById('securis-body');
  if (state.ultraContrast) {
    body.classList.add('ultra-contrast-mode');
  } else {
    body.classList.remove('ultra-contrast-mode');
  }
}

// =========================================================================
// 5. RENDERER: CUSTOMER / USER INTERFACE
// =========================================================================
function renderUserUI(mountId) {
  const container = document.getElementById(mountId);
  if (!container) return;

  const isLocked = state.isLocked;
  const isOnCall = state.isOnCall;
  const isScreenSharing = state.isScreenSharing;
  const isNightTime = state.isNightTime;
  const escrowBadge = state.activeEscrows.length;

  container.innerHTML = `
    <div class="phone-frame w-full bg-slate-900 rounded-[40px] p-3.5 shadow-2xl border-4 border-slate-800 relative overflow-hidden flex flex-col min-h-[740px]">
      
      <!-- Top Dynamic Island & Status Bar -->
      <div class="pt-4 px-5 pb-2 flex justify-between items-center text-xs text-slate-400">
        <span class="font-black text-slate-200">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <div class="flex items-center space-x-2">
          ${isNightTime ? `
            <span class="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px] border border-indigo-500/30">
              🌙 NIGHT SHIELD
            </span>
          ` : ''}
          ${isOnCall ? `
            <span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-black text-[10px] border border-rose-500/40 animate-pulse flex items-center">
              <i class="fa-solid fa-phone mr-1"></i> CALL ACTIVE
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
              <i class="fa-solid fa-shield-halved mr-1"></i> Multi-Guardian Guarded
            </span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="openMiniSecurisChatModal()" class="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center text-sm shadow-md transition" title="Talk to Mini Securis">
            <i class="fa-solid fa-microphone"></i>
          </button>
          <button onclick="triggerSOS()" class="px-3 py-1.5 rounded-full bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center">
            <i class="fa-solid fa-circle-exclamation mr-1.5 text-rose-400"></i> SOS
          </button>
        </div>
      </div>

      <!-- APP SCROLLABLE CONTENT -->
      <div class="flex-1 p-5 space-y-4 overflow-y-auto">

        <!-- SCREEN-SHARE THREAT INTERCEPTOR (AnyDesk Alert) -->
        ${isScreenSharing ? `
          <div class="screenshare-alert-box p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-500 text-amber-200 space-y-2">
            <div class="flex items-start space-x-2.5">
              <div class="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                <i class="fa-solid fa-desktop"></i>
              </div>
              <div>
                <h4 class="font-black text-amber-100 text-sm">REMOTE ACCESS DETECTED (AnyDesk)</h4>
                <p class="text-xs text-amber-200 mt-0.5">Your screen is being viewed remotely. Outgoing transfers have been automatically <strong>frozen</strong> for your protection.</p>
              </div>
            </div>
            <button onclick="speak('screenShareAlert')" class="w-full py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
              <i class="fa-solid fa-volume-high mr-2"></i> Listen to Alert
            </button>
          </div>
        ` : ''}

        <!-- Active Call Threat Interceptor Banner -->
        ${isOnCall ? `
          <div class="p-3.5 rounded-2xl bg-rose-950/80 border-2 border-rose-600 text-rose-200 space-y-2 animate-pulse">
            <div class="flex items-start space-x-2.5">
              <div class="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                <i class="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <h4 class="font-black text-rose-100 text-sm">ACTIVE PHONE CALL DETECTED</h4>
                <p class="text-xs text-rose-200 mt-0.5">Scammers coerce victims over calls. Bank staff <strong>never</strong> ask for transfers.</p>
              </div>
            </div>
            <button onclick="speak('scamWarning')" class="w-full py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center">
              <i class="fa-solid fa-volume-high mr-2"></i> Listen to AI Scam Warning
            </button>
          </div>
        ` : ''}

        <!-- Safe Balance Card -->
        <div class="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-md">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Your Safe Balance</span>
            <button onclick="speak('balance')" class="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center bg-emerald-950/50 px-2 py-1 rounded-md border border-emerald-500/30">
              <i class="fa-solid fa-volume-high mr-1.5"></i> Read Out
            </button>
          </div>
          <div class="text-3xl font-extrabold text-white tracking-tight">₹ ${state.balance.toLocaleString('en-IN')}<span class="text-sm font-normal text-slate-400">.00</span></div>
          <div class="mt-2 text-[10px] text-slate-300 flex items-center justify-between border-t border-slate-800 pt-2">
            <span>🛡️ >₹10k: Guardian Co-Sign</span>
            <span>🔑 >₹50k: Guardian OTP</span>
          </div>
        </div>

        <!-- 4-Card Accessible Touch Grid -->
        <div class="grid grid-cols-2 gap-3">
          <button onclick="openPayeeDirectoryDialog()" class="senior-card-btn p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-left flex flex-col justify-between h-28 shadow-lg shadow-emerald-950/40 border border-emerald-400/30">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl">
              <i class="fa-solid fa-paper-plane"></i>
            </div>
            <div>
              <div class="font-extrabold text-white text-base leading-tight">Send Money</div>
              <div class="text-[11px] text-emerald-100">Select or New Payee</div>
            </div>
          </button>

          <button onclick="openMiniSecurisChatModal()" class="senior-card-btn p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-left flex flex-col justify-between h-28 shadow-lg shadow-indigo-950/40 border border-indigo-400/30">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl animate-pulse">
              <i class="fa-solid fa-microphone"></i>
            </div>
            <div>
              <div class="font-extrabold text-white text-base leading-tight">Talk to AI</div>
              <div class="text-[11px] text-indigo-100">Voice & Chat Guide</div>
            </div>
          </button>

          <button onclick="openEscrowVaultDialog()" class="senior-card-btn p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-left flex flex-col justify-between h-28 border border-slate-700">
            <div class="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-amber-400 text-xl">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div>
              <div class="font-extrabold text-white text-base leading-tight">Safe Escrow</div>
              <div class="text-[11px] text-amber-400 font-semibold">${escrowBadge} Active Buffer</div>
            </div>
          </button>

          <button onclick="openLastTransactionReceipt()" class="senior-card-btn p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-left flex flex-col justify-between h-28 border border-slate-700">
            <div class="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-sky-400 text-xl">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <div>
              <div class="font-extrabold text-white text-base leading-tight">Last Receipt</div>
              <div class="text-[11px] text-sky-300">View Official Proof</div>
            </div>
          </button>
        </div>

        <!-- MINI SECURIS INTERACTIVE COMPANION WIDGET -->
        <div class="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-sky-950/70 border-2 border-indigo-500/40 shadow-lg space-y-2.5">
          <div class="flex items-center space-x-3">
            <div class="relative w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white text-lg shrink-0 mini-securis-halo">
              <i class="fa-solid fa-robot"></i>
              <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-center">
                <span class="text-xs font-black text-indigo-300 uppercase tracking-wider">Mini Securis Voice Guide</span>
                <button onclick="openMiniSecurisChatModal()" class="text-xs text-sky-400 hover:text-sky-200 font-bold flex items-center">
                  <i class="fa-solid fa-comments mr-1"></i> Open Chat
                </button>
              </div>
              <span class="text-[10px] text-slate-400">Speak commands or ask for guidance</span>
            </div>
          </div>

          <p id="user-ai-bubble-text" class="text-xs text-slate-200 leading-relaxed italic bg-slate-950/60 p-2.5 rounded-xl border border-indigo-500/20">
            "${state.aiGuideText}"
          </p>

          <div class="grid grid-cols-2 gap-1.5 pt-1">
            <button onclick="openMiniSecurisChatModal()" class="py-2 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-md transition flex items-center justify-center">
              <i class="fa-solid fa-headset mr-1.5"></i> Talk to Mini Securis
            </button>
            <button onclick="interactiveAIGuideFlow('safetyCheck')" class="py-2 px-2 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 text-[11px] font-bold border border-emerald-500/30 flex items-center justify-center">
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

      <!-- OVERLAY: REMOTE APP FREEZE -->
      ${isLocked ? `
        <div class="absolute inset-0 bg-slate-950/98 z-50 p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div class="w-20 h-20 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 text-4xl">
            <i class="fa-solid fa-lock"></i>
          </div>
          <div>
            <h3 class="text-xl font-black text-white">App Temporarily Shielded</h3>
            <p class="text-xs text-rose-300 mt-2 leading-relaxed max-w-xs">
              Your guardians Ramesh & Priya locked this app to protect you from an unauthorized scam or coercive phone call.
            </p>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            Guardian Contact: <strong class="text-white">+91 98765 43210</strong>
          </div>
        </div>
      ` : ''}

      <div id="user-modal-container" class="hidden absolute inset-0 bg-slate-950/95 backdrop-blur-md z-40 p-5 flex flex-col justify-between overflow-y-auto"></div>

    </div>
  `;
}

// =========================================================================
// 6. RENDERER: MULTI-GUARDIAN COMPANION PORTAL
// =========================================================================
function renderGuardianUI(mountId, isCompact = false) {
  const container = document.getElementById(mountId);
  if (!container) return;

  const pending = state.pendingApprovals;
  const isLocked = state.isLocked;

  container.innerHTML = `
    <div class="w-full bg-slate-900 rounded-[32px] p-4 sm:p-5 shadow-2xl border-4 border-slate-800 text-slate-100 flex flex-col min-h-[740px]">
      
      <!-- Multi-Guardian Header -->
      <div class="pb-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="font-extrabold text-white text-base leading-tight">Multi-Guardian Network</h3>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">2 Guardians Active</span>
          </div>
          <p class="text-[11px] text-slate-400">Guarding: <strong class="text-white">Dad (Mr. Rao)</strong></p>
        </div>

        <button onclick="toggleAppLock()" class="px-3 py-1.5 rounded-full ${isLocked ? 'bg-rose-600 text-white font-black shadow-lg shadow-rose-900/50' : 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40'} text-xs font-bold transition flex items-center">
          <i class="fa-solid fa-snowflake mr-1.5"></i>
          <span>${isLocked ? "Unlock Dad's App" : "Lock Dad's App"}</span>
        </button>
      </div>

      <div class="flex-1 py-4 space-y-4 overflow-y-auto">

        <!-- Linked Guardians Cards -->
        <div class="grid grid-cols-2 gap-2">
          ${state.guardians.map(g => `
            <div class="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-2.5">
              <div class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-lg shrink-0">${g.avatar}</div>
              <div class="overflow-hidden">
                <div class="font-bold text-white text-xs truncate">${g.name}</div>
                <div class="text-[10px] text-emerald-400 font-semibold truncate">${g.relation}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- ACTION REQUIRED: CO-SIGN / OTP APPROVAL CARD -->
        ${pending.length > 0 ? `
          <div class="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 shadow-xl shadow-rose-950/50 space-y-3 animate-pulse">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-2">
                <span class="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                <span class="text-xs font-black uppercase tracking-wider text-rose-300">Action Required: Guardian Co-Sign</span>
              </div>
              <span class="text-[10px] text-rose-400 font-mono">Just Now</span>
            </div>

            <div>
              <h4 class="font-black text-white text-base">⚠️ Dad is sending ₹ ${pending[0].amount.toLocaleString('en-IN')}</h4>
              <p class="text-xs text-rose-200 mt-0.5">Payee: <strong class="text-white">${pending[0].payee}</strong></p>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/30 text-[11px] space-y-1.5 text-slate-300">
              <div class="text-rose-400 font-bold flex items-center">
                <i class="fa-solid fa-triangle-exclamation mr-1.5"></i> Security Triggers:
              </div>
              ${pending[0].amount > 50000 ? `
                <div class="flex items-center space-x-1.5 text-rose-300 font-bold">
                  <i class="fa-solid fa-key text-rose-400"></i>
                  <span>Single Guardian OTP required (>₹50,000 Rule)</span>
                </div>
              ` : `
                <div class="flex items-center space-x-1.5 text-amber-300">
                  <i class="fa-solid fa-shield-halved text-amber-400"></i>
                  <span>Guardian Co-Sign required (>₹10,000 Rule)</span>
                </div>
              `}
              ${state.isScreenSharing ? `
                <div class="flex items-center space-x-1.5 text-amber-400 font-bold">
                  <i class="fa-solid fa-desktop"></i>
                  <span>Screen-Sharing (AnyDesk) detected! Remote theft risk.</span>
                </div>
              ` : ''}
              ${state.isOnCall ? `
                <div class="flex items-center space-x-1.5 text-rose-200">
                  <i class="fa-solid fa-phone text-xs text-rose-400"></i>
                  <span>Active phone call in progress during transaction!</span>
                </div>
              ` : ''}
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1">
              <button onclick="guardianRejectTransfer(${pending[0].id})" class="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center">
                <i class="fa-solid fa-ban mr-1.5"></i> Reject & Call Dad
              </button>
              <button onclick="guardianApproveTransfer(${pending[0].id})" class="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center">
                <i class="fa-solid fa-shield-check mr-1.5"></i> ${pending[0].amount > 50000 ? 'Send OTP (849201)' : 'Approve Transfer'}
              </button>
            </div>
          </div>
        ` : ''}

        <!-- MONTHLY SPENDING ANALYTICS & FRAUD DEFENSE CHART -->
        <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow space-y-3">
          <div class="flex justify-between items-center">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Spending & Fraud Defense</h4>
            <span class="text-[10px] text-emerald-400 font-bold">● LIVE METRICS</span>
          </div>

          <!-- Metric Cards -->
          <div class="grid grid-cols-2 gap-2 text-center">
            <div class="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30">
              <span class="text-[10px] text-rose-300 uppercase font-bold block">Scams Prevented</span>
              <span class="text-base font-black text-rose-400">₹ 40,000</span>
            </div>
            <div class="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
              <span class="text-[10px] text-emerald-300 uppercase font-bold block">Safe Spent</span>
              <span class="text-base font-black text-emerald-400">₹ 12,500</span>
            </div>
          </div>

          <!-- Progress Bars -->
          <div class="space-y-2 text-xs">
            <div>
              <div class="flex justify-between text-[11px] mb-1">
                <span class="text-slate-400">Daily Safe Limit Used:</span>
                <span class="text-white font-bold">₹ 12,500 / ₹ 1,00,000</span>
              </div>
              <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full" style="width: 12.5%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[11px] mb-1">
                <span class="text-slate-400">Fraud Protection Rate:</span>
                <span class="text-emerald-400 font-bold">100% Shielded</span>
              </div>
              <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div class="bg-indigo-500 h-full rounded-full" style="width: 100%"></div>
              </div>
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
// 7. PAYEE DIRECTORY & NEW PAYEE WARNING INTERCEPTOR
// =========================================================================
function openPayeeDirectoryDialog() {
  const modal = document.getElementById('user-modal-container');
  if (!modal) return;

  updateMiniAIGuide("Please select who you want to pay, or enter a new UPI ID or account number.", null);

  modal.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <div class="flex items-center space-x-2">
        <span class="text-white font-black text-base">Select Payee</span>
      </div>
      <button onclick="closeUserModal()" class="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold">
        ✕
      </button>
    </div>

    <div class="flex-1 overflow-y-auto py-3 space-y-4">
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

  showNewPayeeWarningModal(name, phone);
}

function showNewPayeeWarningModal(name, phone) {
  const modal = document.getElementById('user-modal-container');
  if (!modal) return;

  updateMiniAIGuide(`Warning! You are trying to pay ${name}. This account is NOT in your verified directory. Scammers often use new accounts.`, 'newPayeeWarning');

  modal.innerHTML = `
    <div class="my-auto text-center space-y-4 p-2">
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

      <div class="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/60 text-xs text-left space-y-2 text-rose-100">
        <div class="font-bold flex items-center text-rose-300">
          <i class="fa-solid fa-shield-halved mr-1.5"></i> Why are we warning you?
        </div>
        <p class="text-[11px] leading-relaxed text-slate-300">
          • 85% of digital arrest and bill disconnection scams instruct victims to pay new, disposable accounts.<br>
          • Genuine government and bank officials will <strong>never</strong> ask you to transfer funds to verify your identity.
        </p>
      </div>

      <div class="pt-2 space-y-2">
        <button onclick="abortAndCallGuardian()" class="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-950/60 transition flex items-center justify-center space-x-2">
          <i class="fa-solid fa-phone mr-1.5"></i>
          <span>Stop & Call Guardians (Ramesh & Priya)</span>
        </button>

        <button onclick="handlePayeeSelected('${name}', '${phone}', 5000, false)" class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition">
          I Know This Person — Proceed to Amount
        </button>
      </div>

    </div>
  `;
  modal.classList.remove('hidden');
}

function abortAndCallGuardian() {
  closeUserModal();
  updateMiniAIGuide("Wise choice! You stopped the transaction. Staying safe is number one.", null);
  showToast("Transfer aborted. Guardians alerted.", "success");
}

// =========================================================================
// 8. AMOUNT ENTRY & SECURITY TIERS
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

  updateMiniAIGuide(`Enter amount to pay ${transfer.name}. Over ₹10,000 requires Guardian approval, and over ₹50,000 requires Guardian OTP.`, null);

  modal.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <div class="flex items-center space-x-2">
        <span class="text-white font-black text-base">Enter Amount</span>
      </div>
      <button onclick="closeUserModal()" class="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold">
        ✕
      </button>
    </div>

    <div class="space-y-4 my-auto py-2">
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-between">
        <div>
          <div class="text-base font-extrabold text-white">${transfer.name}</div>
          <div class="text-xs text-slate-400">${transfer.phone}</div>
        </div>
        <span class="text-xs px-2.5 py-1 rounded-lg font-bold ${transfer.isTrusted ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'}">
          ${transfer.isTrusted ? '✓ Trusted' : '⚠️ New Payee'}
        </span>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-700">
        <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Transfer Amount (₹)</label>
        <div class="flex items-center">
          <span class="text-3xl font-black text-emerald-400 mr-2">₹</span>
          <input type="number" id="entered-amount-field" value="${transfer.amount}" class="w-full bg-transparent text-3xl font-black text-white outline-none" oninput="previewSecurityTier(this.value, ${transfer.isTrusted})" />
        </div>
      </div>

      <div id="security-tier-preview" class="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs"></div>
    </div>

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
      <p class="text-[11px] text-slate-300">Requires a <strong>Single Guardian OTP</strong> issued directly by Ramesh.</p>
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

function processEnteredTransaction(name, phone, isTrusted) {
  if (state.isScreenSharing) {
    alert("⚠️ BLOCKED: AnyDesk Remote Screen Sharing is active! For your safety, outgoing payments are frozen.");
    return;
  }

  const amtInput = document.getElementById('entered-amount-field');
  const amount = amtInput ? Number(amtInput.value) || 500 : 500;

  if (amount > 50000) {
    // SINGLE GUARDIAN OTP (>₹50k)
    startSingleGuardianOtpFlow(name, amount, isTrusted);
  } else if (amount > 10000 || !isTrusted || state.isOnCall || state.isNightTime) {
    // GUARDIAN CO-SIGN (>₹10k)
    routeToGuardianApproval(name, amount, isTrusted);
  } else {
    // DIRECT BIOMETRIC (<=₹10k)
    showBiometricDialog(amount, name);
  }
}

// TIER 2: GUARDIAN CO-SIGN ROUTE (>₹10k)
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

  updateMiniAIGuide(`Because this payment of ₹${amount.toLocaleString('en-IN')} exceeds 10,000 rupees, an approval request was sent to Ramesh.`, 'over10kNotice');

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

// TIER 3: SINGLE GUARDIAN OTP FLOW (>₹50,000)
function startSingleGuardianOtpFlow(payee, amount, isTrusted) {
  const approvalReq = {
    id: Date.now(),
    payee,
    amount,
    isTrusted,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  state.pendingApprovals.unshift(approvalReq);
  saveState();

  updateMiniAIGuide(`High-value transfer of ₹${amount.toLocaleString('en-IN')}. Please enter the Single Guardian OTP sent to your son Ramesh.`, 'over50kOtpNotice');

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
        <h3 class="text-lg font-black text-white mt-1">Guardian OTP Verification</h3>
        <p class="text-xs text-slate-300 mt-1 leading-snug">
          To protect large savings, enter the 6-digit Guardian OTP issued by <strong>Ramesh</strong>.
        </p>
      </div>

      <!-- Single Guardian OTP Input (6 Digits) -->
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 text-left space-y-2">
        <div class="flex justify-between text-xs">
          <span class="text-amber-300 font-bold">Guardian Ramesh's Security OTP:</span>
          <span class="text-emerald-400 font-mono font-bold">(OTP: 849201)</span>
        </div>
        <div class="flex justify-center space-x-1.5">
          <input type="text" maxlength="1" value="8" class="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-amber-500/40 rounded-xl text-white" readonly />
          <input type="text" maxlength="1" value="4" class="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-amber-500/40 rounded-xl text-white" readonly />
          <input type="text" maxlength="1" value="9" class="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-amber-500/40 rounded-xl text-white" readonly />
          <input type="text" maxlength="1" value="2" class="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-amber-500/40 rounded-xl text-white" readonly />
          <input type="text" maxlength="1" value="0" class="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-amber-500/40 rounded-xl text-white" readonly />
          <input type="text" maxlength="1" value="1" class="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-amber-500/40 rounded-xl text-white" readonly />
        </div>
      </div>

      <p class="text-[10px] text-slate-400">
        🛡️ Once verified, funds enter a 15-minute revocable escrow buffer.
      </p>

      <button onclick="completeSingleGuardianOtpVerification('${payee}', ${amount})" class="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-950/40 transition">
        Validate Guardian OTP & Enter Safe Escrow
      </button>
    </div>
  `;

  showToast("Guardian OTP required: Waiting for Ramesh to issue OTP (849201).", "warning");
}

function completeSingleGuardianOtpVerification(payee, amount) {
  if (state.pendingApprovals.length > 0) {
    state.pendingApprovals.shift();
  }

  state.balance -= amount;

  const escrowDuration = state.isNightTime ? 1800 : 900; // 30 mins if night mode, else 15 mins
  const escrowItem = {
    id: Date.now(),
    payee,
    amount,
    remainingSeconds: escrowDuration
  };
  state.activeEscrows.unshift(escrowItem);

  state.lastTransaction = {
    id: `SEC-${Math.floor(10000 + Math.random() * 90000)}`,
    payee,
    amount,
    time: 'Just Now',
    guardianSigned: 'Ramesh Rao (Guardian OTP: 849201)',
    status: 'In Escrow (Safe Buffer)'
  };

  state.auditLog.unshift({
    id: Date.now(),
    type: 'escrow',
    title: `₹ ${amount.toLocaleString('en-IN')} to ${payee}`,
    subtitle: 'Guardian OTP Verified (>₹50,000 Rule)',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'In Escrow'
  });

  saveState();
  updateMiniAIGuide(`Guardian OTP verified! ₹${amount.toLocaleString('en-IN')} has been placed in the safe escrow buffer.`, null);
  showToast("Guardian OTP Success! Funds placed in Safe Escrow.", "success");
  openEscrowVaultDialog();
}

// TIER 1: DIRECT BIOMETRIC VERIFICATION (≤₹10,000)
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
        <p class="text-xs text-slate-400 mt-1">Touch fingerprint sensor to approve ₹${amount.toLocaleString('en-IN')}</p>
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
  modal.classList.remove('hidden');

  setTimeout(() => {
    executeSafeTransfer(amount, payee);
  }, 1800);
}

function executeSafeTransfer(amount, payee) {
  state.balance -= amount;
  
  state.lastTransaction = {
    id: `SEC-${Math.floor(10000 + Math.random() * 90000)}`,
    payee,
    amount,
    time: 'Just Now',
    guardianSigned: 'Biometric Verified (≤₹10,000)',
    status: 'Settled'
  };

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

// GUARDIAN CO-SIGN APPROVAL / REJECTION
function guardianApproveTransfer(id) {
  const index = state.pendingApprovals.findIndex(p => p.id === id);
  if (index === -1) return;

  const req = state.pendingApprovals.splice(index, 1)[0];

  if (req.amount > 50000) {
    saveState();
    startSingleGuardianOtpFlow(req.payee, req.amount, req.isTrusted);
    return;
  }

  state.balance -= req.amount;

  const escrowDuration = state.isNightTime ? 1800 : 900;
  const escrowItem = {
    id: Date.now(),
    payee: req.payee,
    amount: req.amount,
    remainingSeconds: escrowDuration
  };
  state.activeEscrows.unshift(escrowItem);

  state.lastTransaction = {
    id: `SEC-${Math.floor(10000 + Math.random() * 90000)}`,
    payee: req.payee,
    amount: req.amount,
    time: 'Just Now',
    guardianSigned: 'Co-Signed by Ramesh Rao',
    status: 'In Safe Escrow'
  };

  state.auditLog.unshift({
    id: Date.now(),
    type: 'escrow',
    title: `₹ ${req.amount.toLocaleString('en-IN')} to ${req.payee}`,
    subtitle: 'Co-Signed by Ramesh (>₹10k Rule)',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'In Escrow'
  });

  saveState();
  updateMiniAIGuide(`Your son Ramesh approved the payment of ₹${req.amount.toLocaleString('en-IN')}. It is now in safe escrow.`, null);
  showToast("Guardian Approved: Placed in Safe Escrow.", "success");
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
// 9. TRANSACTION RECEIPT GENERATOR
// =========================================================================
function openLastTransactionReceipt() {
  const tx = state.lastTransaction;
  const modal = document.getElementById('receipt-modal');
  const mount = document.getElementById('receipt-card-mount');
  if (!modal || !mount) return;

  mount.innerHTML = `
    <div class="space-y-4">
      <!-- Receipt Header -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <div>
            <h3 class="font-black text-white text-sm">Securis Official Receipt</h3>
            <span class="text-[10px] text-slate-400">Guarded Digital Banking</span>
          </div>
        </div>
        <button onclick="closeReceiptModal()" class="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs">
          ✕
        </button>
      </div>

      <!-- Receipt Body -->
      <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative overflow-hidden">
        <!-- Security Watermark Stamp -->
        <div class="receipt-stamp absolute right-3 top-3 px-2 py-0.5 rounded text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/60">
          GUARDIAN VERIFIED
        </div>

        <div class="text-center py-2 border-b border-slate-900">
          <span class="text-xs text-slate-400">Amount Sent:</span>
          <div class="text-3xl font-black text-white mt-0.5">₹ ${tx.amount.toLocaleString('en-IN')}.00</div>
        </div>

        <div class="space-y-1.5 text-xs">
          <div class="flex justify-between">
            <span class="text-slate-400">Transaction Ref:</span>
            <span class="font-mono font-bold text-slate-200">${tx.id}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Paid To:</span>
            <span class="font-bold text-white">${tx.payee}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Date & Time:</span>
            <span class="text-slate-300">${tx.time}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Co-Sign Authority:</span>
            <span class="font-bold text-emerald-400">${tx.guardianSigned}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Status:</span>
            <span class="font-bold text-sky-400">${tx.status}</span>
          </div>
        </div>
      </div>

      <!-- Receipt Actions -->
      <div class="grid grid-cols-2 gap-2 pt-2">
        <button onclick="window.print()" class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center space-x-1.5">
          <i class="fa-solid fa-print"></i>
          <span>Print Receipt</span>
        </button>
        <button onclick="closeReceiptModal()" class="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center">
          <span>Done</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeReceiptModal() {
  const modal = document.getElementById('receipt-modal');
  if (modal) modal.classList.add('hidden');
}

// =========================================================================
// 10. INTERACTIVE SENIOR ONBOARDING TOUR
// =========================================================================
function openOnboardingTour(step = 1) {
  const modal = document.getElementById('onboarding-modal');
  const mount = document.getElementById('onboarding-card-mount');
  if (!modal || !mount) return;

  if (step === 1) {
    mount.innerHTML = `
      <div class="space-y-4">
        <div class="w-16 h-16 rounded-full bg-emerald-600/20 border-2 border-emerald-500 mx-auto flex items-center justify-center text-emerald-400 text-3xl">
          👴
        </div>
        <div>
          <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Step 1 of 3</span>
          <h3 class="text-lg font-black text-white mt-1">Welcome to Securis</h3>
          <p class="text-xs text-slate-300 mt-2 leading-relaxed">
            Securis is built specifically to protect your hard-earned money. No confusing small text or hidden options—just simple, safe banking.
          </p>
        </div>
        <div class="pt-3">
          <button onclick="openOnboardingTour(2)" class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">
            Next: Guardian Protection →
          </button>
        </div>
      </div>
    `;
  } else if (step === 2) {
    mount.innerHTML = `
      <div class="space-y-4">
        <div class="w-16 h-16 rounded-full bg-sky-600/20 border-2 border-sky-500 mx-auto flex items-center justify-center text-sky-400 text-3xl">
          👨‍💼
        </div>
        <div>
          <span class="text-[10px] text-sky-400 font-bold uppercase tracking-widest">Step 2 of 3</span>
          <h3 class="text-lg font-black text-white mt-1">How Guardians Protect You</h3>
          <p class="text-xs text-slate-300 mt-2 leading-relaxed">
            Your son <strong>Ramesh</strong> and daughter <strong>Priya</strong> co-sign transfers over ₹10,000 and ₹50,000. If a scammer pressures you, your guardians can block it in seconds.
          </p>
        </div>
        <div class="pt-3 flex space-x-2">
          <button onclick="openOnboardingTour(1)" class="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">Back</button>
          <button onclick="openOnboardingTour(3)" class="w-2/3 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition">
            Next: Voice AI →
          </button>
        </div>
      </div>
    `;
  } else if (step === 3) {
    mount.innerHTML = `
      <div class="space-y-4">
        <div class="w-16 h-16 rounded-full bg-indigo-600/20 border-2 border-indigo-500 mx-auto flex items-center justify-center text-indigo-400 text-3xl">
          🤖
        </div>
        <div>
          <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Step 3 of 3</span>
          <h3 class="text-lg font-black text-white mt-1">Meet Mini Securis</h3>
          <p class="text-xs text-slate-300 mt-2 leading-relaxed">
            Don't want to type? Tap the microphone icon anytime to say <em>"Check my balance"</em> or <em>"Send 500 to Suresh"</em>. Mini Securis will guide you every step!
          </p>
        </div>
        <div class="pt-3 flex space-x-2">
          <button onclick="openOnboardingTour(2)" class="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">Back</button>
          <button onclick="closeOnboardingTour()" class="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">
            Get Started! ✓
          </button>
        </div>
      </div>
    `;
  }

  modal.classList.remove('hidden');
}

function closeOnboardingTour() {
  const modal = document.getElementById('onboarding-modal');
  if (modal) modal.classList.add('hidden');
  showToast("Tour complete! Mini Securis is standing by.", "success");
}

function toggleUltraContrast() {
  state.ultraContrast = !state.ultraContrast;
  saveState();
  showToast(`Ultra High-Contrast Mode: ${state.ultraContrast ? 'ON' : 'OFF'}`, "info");
}

// =========================================================================
// 11. ESCROW BUFFER & CANCEL FLOW
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
          <p class="text-xs text-slate-400 mt-1">High-risk transfers enter a revocable buffer with instant 1-tap refund.</p>
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
      <span class="text-amber-400 font-black text-base">🛡️ Safe Escrow Buffer</span>
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
      subtitle: 'Cancelled within Escrow Buffer',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Refunded'
    });
  }

  saveState();
  updateMiniAIGuide("Transaction cancelled. Your money has been safely restored to your account.", 'escrowRefunded');
  showToast("Escrow cancelled. Funds safely restored to your account.", "success");
  closeUserModal();
}

function interactiveAIGuideFlow(action) {
  if (action === 'guide') {
    openMiniSecurisChatModal();
  } else if (action === 'safetyCheck') {
    if (state.isScreenSharing) {
      updateMiniAIGuide("🚨 DANGER! Remote screen sharing is ACTIVE. AnyDesk may be controlling your phone!", 'screenShareAlert');
    } else if (state.isOnCall) {
      updateMiniAIGuide("⚠️ DANGER! You are on an active phone call. Do NOT send money!", 'scamWarning');
    } else {
      updateMiniAIGuide("All systems safe! No active calls or screen-sharing apps detected.", null);
    }
  }
}

// =========================================================================
// 12. SCENARIO TRIGGERS & SIMULATORS
// =========================================================================
function triggerScenario(type) {
  if (state.isLocked) {
    showToast("Dad's app is currently locked by Guardian. Unlock first.", "error");
    return;
  }

  if (type === 'safe') {
    state.isOnCall = false;
    state.isScreenSharing = false;
    saveState();
    handlePayeeSelected('Suresh (Milkman)', '9876543212', 2000, true);
  } else if (type === 'over10k') {
    state.isOnCall = false;
    state.isScreenSharing = false;
    saveState();
    handlePayeeSelected('Ramesh (Son)', '9876543210', 15000, true);
  } else if (type === 'over50k') {
    state.isOnCall = false;
    state.isScreenSharing = false;
    saveState();
    handlePayeeSelected('Dr. Verma (Clinic)', '9876543213', 60000, true);
  }
}

function toggleScreenShareSimulator() {
  state.isScreenSharing = !state.isScreenSharing;
  saveState();
  if (state.isScreenSharing) {
    updateMiniAIGuide("Danger! Remote screen sharing detected (AnyDesk). Outgoing transfers paused!", 'screenShareAlert');
    showToast("🚨 AnyDesk Screen-Sharing Detected! Transfers frozen.", "error");
  } else {
    showToast("Screen-sharing shield disengaged.", "info");
  }
}

function toggleNightTimeMode() {
  state.isNightTime = !state.isNightTime;
  saveState();
  if (state.isNightTime) {
    updateMiniAIGuide("Night-time mode engaged. Late-night transfers enter a 30-minute panic cool-down buffer.", 'nightTimeAlert');
    showToast("🌙 Night-Time Cool-Down Protocol ACTIVE (30m Escrow).", "warning");
  } else {
    showToast("Night-time protocol set to standard 15-minute escrow.", "info");
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
    showToast("Guardians locked Dad's app remotely.", "error");
  } else {
    showToast("Dad's app unlocked successfully.", "success");
  }
}

function triggerSOS() {
  alert("🚨 EMERGENCY SOS ACTIVATED!\n- Guardians Ramesh & Priya notified.\n- Outgoing digital transfers temporarily frozen.\n- Anti-Fraud helpline contacted.");
  showToast("🚨 SOS Alert Sent to Ramesh & Priya!", "error");
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
