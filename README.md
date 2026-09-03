# 🛡️ Securis — Intelligent Banking & Proactive Guardian Shield

> **Hackathon Theme:** Protecting Vulnerable Customers from Digital Financial Fraud  
> **Target Audience:** Senior Citizens, First-Time Digital Banking Users, Digitally Inexperienced Individuals

---

## 🌟 What is Securis?

**Securis** is an intelligent digital financial protection system designed from the ground up for vulnerable customers. Unlike traditional banking apps that execute transactions blindly as long as a PIN is typed, Securis protects users against **social engineering, panic transfers, and coercion**.

Securis provides **two tailored, interconnected interfaces**:
1. **Customer Interface (Senior Shield Mode):** Ultra-simplified, high-contrast, voice-guided experience with plain-language trust indicators.
2. **Guardian Companion Portal:** Shadow oversight dashboard for trusted family members featuring real-time out-of-band co-signing, remote kill-switches, and spending controls.

---

## 🚀 Key Innovations & Features

```
               ┌───────────────────────────────────────────────────────────┐
               │                        SECURIS ENGINE                     │
               └─────────────────────────────┬─────────────────────────────┘
                                             │
      ┌───────────────────────────┬──────────┴────────────┬────────────────────────────┐
      ▼                           ▼                       ▼                            ▼
┌───────────────┐        ┌──────────────────┐    ┌──────────────────┐        ┌────────────────────┐
│ Senior Shield │        │  Active Call &   │    │ 15-Minute Safe   │        │ Guardian Co-Sign   │
│ Accessible UI │        │ Remote App Shield│    │ Revocable Escrow │        │ & Remote Freeze    │
└───────────────┘        └──────────────────┘    └──────────────────┘        └────────────────────┘
```

### 1. Dedicated Dual-Role UI
* **User (Senior View):**
  * 4-card touch grid with 20pt+ typography and 48px+ touch targets.
  * Live **"🔊 Read Out"** balance with vernacular Speech Synthesis.
  * Verified Family Quick-Pay avatars for zero-risk 1-tap transfers.
  * Dynamic SOS Emergency freeze button.
* **Guardian Companion View:**
  * Real-time notification feed with threat telemetry.
  * Remote **"Lock Dad's App"** emergency kill-switch.
  * Audit trail of blocked scams and settled transfers.

### 2. Threat Interceptor & Recipient Trust Radar
* Simulates detection of active phone calls (the #1 vector for "Digital Arrest" and utility scams).
* Evaluates recipient account age and behavioral flags.
* Warns users in plain language before payments proceed.

### 3. Out-of-Band Co-Signing Protocol
* Transactions to unknown recipients or during phone calls trigger a priority approval request on the Guardian's phone.
* Guardian can review the risk context and choose `Approve & Send OTP` or `Reject & Call Loved One`.

### 4. 15-Minute Revocable Escrow Vault
* High-risk payments are held in a 15-minute grace period before settlement.
* Users have a prominent **"🛑 I CHANGED MY MIND - CANCEL & REFUND"** button that immediately reverses the funds with zero fee.

### 5. Multilingual Vernacular Voice Assistant
* Full text-to-speech audio guidance in **English, Hindi (हिन्दी), Telugu (తెలుగు), and Spanish (Español)**.

---

## 📂 Project Structure

```
C:\Users\harish\.gemini\antigravity\scratch\securis\
├── index.html        # Main app shell with role switcher & responsive viewports
├── app.js            # Reactive state engine, Web Speech, escrow timers & threat logic
├── styles.css        # Accessible tokens, biometric scanner animations, & phone shells
└── README.md         # Full documentation & pitch guide
```

---

## 🏃 How to Run Securis

### Option 1: Double-Click (Zero Setup)
Open File Explorer, go to `C:\Users\harish\.gemini\antigravity\scratch\securis`, and double-click [`index.html`](file:///C:/Users/harish/.gemini/antigravity/scratch/securis/index.html).

### Option 2: Local HTTP Server (Recommended for Audio)
In your terminal, navigate to the folder and run:
```powershell
cd C:\Users\harish\.gemini\antigravity\scratch\securis
python -m http.server 3001
```
Then visit `http://localhost:3001` in your browser.

---

## 🎤 3-Minute Hackathon Demo Script

1. **Role 1 (Senior View):**
   * Switch to **Customer (Senior UI)**.
   * Click **Safe Pay (Suresh ₹500)** to show how everyday transactions are frictionless and verified with biometrics.
   * Tap **"Read Out"** to show audio accessibility.

2. **The Threat:**
   * Click **Scam Threat** on the top toolbar.
   * Point out the **"ACTIVE CALL DETECTED"** alarm and listen to the voice warning.
   * Tap **"Request Guardian Co-Sign"**.

3. **Role 2 (Guardian Portal):**
   * Switch to **Guardian Portal** (or view in **Dual View**).
   * Show the priority card detailing: *"Active phone call detected + new recipient"*.
   * Demonstrate **`Reject & Call Dad`** — switch back to Grandpa's phone to see the transaction blocked with a personal note from his son.

4. **Escrow Buffer:**
   * Demonstrate the **15-Minute Safe Escrow** with the one-click refund button.
