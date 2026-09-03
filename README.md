# 🛡️ ShieldBank: Proactive Fraud Shield for Vulnerable Customers

> **Hackathon Track:** Protecting Vulnerable Customers from Digital Financial Fraud  
> **Target Audience:** Senior Citizens, First-Time Digital Banking Users, Digitally Inexperienced Individuals

---

## 🎯 The Problem

Financial scams are shifting from technical hacks to **social engineering**:
- **Urgency & Panic Attacks:** Scammers impersonate police, power departments ("Electricity Bill Disconnection"), or tax authorities ("Digital Arrest").
- **Active Phone Manipulation:** 80% of victims are instructed to keep the call running while making transactions or installing screen-sharing software (AnyDesk, TeamViewer).
- **Inadequate Protection:** Traditional banking apps only check if a PIN/password is entered correctly—they don't protect victims under cognitive pressure or manipulation.

---

## 💡 The ShieldBank Solution

ShieldBank introduces a **proactive, dual-layer security architecture**:

| Traditional Banking Apps | ShieldBank (Our Solution) |
| :--- | :--- |
| Cryptic error codes, cluttered with loan/credit banners | **Shield Mode UI:** Minimalist, high contrast, large 20pt+ touch targets |
| Complex PINs frequently forgotten or written on paper | **Vernacular Voice Biometrics + Simple Fingerprint** |
| Instant irreversible wire transfer | **15-Minute Safe Escrow:** One-tap *"I Changed My Mind"* cancellation |
| Ignores environmental pressure | **Active Call & Screen-Sharing Interceptor:** Detects active phone calls |
| Isolated user vulnerable to coercion | **Guardian Co-Sign Network:** Out-of-band dual approval from trusted family |

---

## 📱 Interactive Prototype Overview

The prototype features a **Dual-Phone Side-by-Side Simulator**:
1. **Left Device:** **Grandpa Rao's Phone (Senior Shield Mode)**
   - Minimal 4-card interface: *Send Money*, *Voice Guide*, *Safe Escrow*, *Guardian Info*.
   - Plain-language Recipient Trust Radar.
   - Text-to-Speech audio readout in multiple languages (English, Hindi, Telugu, Spanish).
   - Simulated Biometric Touch Sensor.
   - 15-Minute Revocable Escrow with big red refund button.
2. **Right Device:** **Son Ramesh's Phone (Guardian Companion Portal)**
   - Real-time fraud alert feed.
   - Co-signing actions: `Approve with Guardian OTP`, `Reject & Call Dad`.
   - Emergency 1-tap Account Freeze kill-switch.
3. **Top Controller Bar:** One-click demo triggers for hackathon presentations.

---

## 🚀 How to Run the Prototype

No complex dependencies or `npm install` needed. You can run it directly:

### Option 1: Double-click / Open in Browser
Simply double-click `index.html` in file explorer or open it in Google Chrome or Microsoft Edge.

### Option 2: Quick Local Server (Recommended for audio permissions)
Open your terminal in this directory and run:

```bash
# Using Python
python -m http.server 3000

# OR using Node.js
npx serve .
```
Then open `http://localhost:3000` in your browser.

---

## 🎤 3-Minute Hackathon Demo Script

Follow this exact flow when pitching to the judges:

1. **The Hook (30 sec):**
   > *"Judges, meet 74-year-old Grandpa Rao. He recently received a phone call from someone pretending to be the Electricity Board threatening to cut his power unless he pays ₹15,000 immediately. Under extreme pressure, he opens his banking app..."*

2. **Demonstrate Scenario 1: Everyday Safe Banking (30 sec):**
   - Click `[ 1. Safe Transfer (Suresh ₹500) ]` on the top bar.
   - Show how Grandpa sends money to his trusted milkman with a single tap and fingerprint scan.
   - Highlight the **read-aloud balance button** and **accessible high-contrast UI**.

3. **Demonstrate Scenario 2: The Scam Attack (60 sec):**
   - Click `[ 2. Scam Call Threat (₹15,000) ]` on the top bar.
   - **Point out:** The app immediately senses an **Active Phone Call** + an **Unverified Recipient created 2 days ago**.
   - Listen to the **Mini AI Voice Companion** intervene: *"Warning! Bank officers never ask you to transfer funds..."*
   - Watch the right screen (Son Ramesh's phone) ring with a **Critical Co-Sign Alert**.
   - Click `[ Reject & Call Dad ]` on Ramesh's phone.
   - Show Grandpa's screen halting the transaction and displaying: *"Transfer Blocked by Ramesh: Dad, hang up, it's a scam!"*

4. **Demonstrate Scenario 3: Escrow Buffer & Instant Cancel (30 sec):**
   - Trigger the payment with Guardian OTP approval.
   - Show the **15-Minute Revocable Escrow Buffer** countdown.
   - Tap **"I Changed My Mind - Cancel & Refund"** to show instant zero-fee fund restoration.

5. **Conclusion (30 sec):**
   > *"ShieldBank brings zero friction for everyday verified transfers, and unbreakable protection against social engineering fraud. Thank you!"*
