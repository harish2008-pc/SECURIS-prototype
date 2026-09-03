# 🛡️ Securis v1.3 — Complete Digital Banking Security Suite

> **Hackathon Theme:** Protecting Vulnerable Customers from Digital Financial Fraud  
> **Target Audience:** Senior Citizens, First-Time Digital Banking Users, Digitally Inexperienced Individuals

---

## 🌟 What is Securis?

**Securis** is an intelligent digital financial defense platform designed specifically for senior citizens and digitally inexperienced users. Instead of treating banking as a blind PIN validator, Securis acts as an **active safety buffer** against social engineering, coercive phone calls, and remote screen-takeover scams.

---

## 🚀 Complete Feature Matrix (v1.3)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SECURIS ENGINE v1.3                                  │
├─────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│   FRAUD DEFENSE RULES   │    UI & ACCESSIBILITY    │        GUARDIAN PORTAL            │
│ • >₹10k Guardian Co-Sign│ • Senior Shield (Big UI) │ • Multi-Guardian (Son + Daughter) │
│ • >₹50k Guardian OTP    │ • Downloadable Receipts  │ • Monthly Spending Analytics      │
│ • AnyDesk Screen Shield │ • Onboarding Tour        │ • Remote Emergency App Freeze     │
│ • Night-Time 30m Escrow │ • Ultra High-Contrast    │ • Co-Sign Approval Feed           │
│ • New Payee Interceptor │ • Mini Securis Voice AI  │ • Immutable Audit Trail           │
└─────────────────────────┴──────────────────────────┴───────────────────────────────────┘
```

### 1. Tiered Security Architecture
* **Tier 1 (≤ ₹10,000):** Fast-path **Biometric Fingerprint** verification. Smooth and frictionless for everyday groceries and small bills.
* **Tier 2 (> ₹10,000):** Halts the transfer on Dad's screen and dispatches an **Approval Request to Son Ramesh's Guardian Portal**.
* **Tier 3 (> ₹50,000):** Requires a **Single Guardian OTP (`849201`)** issued directly by Ramesh to protect large retirement savings.

### 2. Specialized Fraud & Threat Interceptors
* **Remote Screen-Share Interceptor (AnyDesk / TeamViewer):** Detects active screen mirroring or remote access apps and completely freezes outgoing transfers to prevent remote phone control theft.
* **Night-Time Panic Transfer Protocol:** Transfers attempted late at night (11:00 PM – 6:00 AM) are automatically held in an extended **30-minute cool-down escrow** to prevent panic decisions under late-night scam calls.
* **New Payee Caution Interceptor:** Warns against unverified payees before any funds can be dispatched.

### 3. Multi-Guardian Ecosystem
* Connects multiple family protectors: **Son Ramesh (Primary Guardian)** and **Daughter Priya (Secondary Guardian)**.
* Includes a **Monthly Spending & Fraud Defense Analytics Chart** tracking:
  * Scams Prevented (e.g. ₹40,000)
  * Safe Routine Spend (e.g. ₹12,500)
  * Daily Spending Quota (₹87,500 / ₹1,00,000 remaining)

### 4. Official Digital Transaction Receipts
* Generates a printable digital bank receipt with:
  * Official Securis Watermark (`SEC-98421`)
  * Recipient, amount, and date/time
  * **Guardian Co-Sign Signature Stamp**
  * One-click **"Print Receipt / Save PDF"** button.

### 5. Mini Securis Conversational AI & Voice Command Center
* Full natural language voice assistant:
  * *"Check my balance"* ➔ Speaks safe balance aloud.
  * *"Send 500 to Suresh"* ➔ Launches biometric payment.
  * *"Send 15000 to Ramesh"* ➔ Escalates to Guardian Co-Sign.
  * *"Show last receipt"* ➔ Opens official receipt modal.
  * *"Is this phone call safe?"* ➔ Runs diagnostic check.

---

## 📂 Project Structure

```
C:\Users\harish\.gemini\antigravity\scratch\securis\
├── index.html            # Main app shell, modals, and dual phone viewports
├── app.js                # State engine, speech recognition, fraud interceptors & receipts
├── styles.css            # Accessible tokens, receipt stamp, and glowing AI halo
├── securis-project.zip   # Packaged archive for GitHub repository upload
└── README.md             # Complete documentation
```

---

## 🏃 How to Run Securis

```powershell
cd C:\Users\harish\.gemini\antigravity\scratch\securis
python -m http.server 3001
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser.
