SafeHex
SafeHex is a web-based Ethical Hacking Integrity Framework built to support safe, authorized, and evidence-based security assessment. The project focuses on target validation, ethical scan control, CVSS-based risk classification, vulnerability result analysis, scan history tracking, and report export.
> **Note:** SafeHex is designed for educational, defensive, and authorized security testing only. Public third-party targets are blocked unless explicitly authorized.
---
🚀 Project Overview
SafeHex provides a modern cybersecurity dashboard where users can submit authorized targets, classify target types, view scan results, analyze vulnerabilities, and export reports. The system avoids random or misleading threat generation by using structured findings, evidence, confidence values, and CVSS-style severity rules.
The project is suitable for academic demonstrations, resume projects, cybersecurity mini-projects, and ethical hacking awareness.
---
✨ Features
Ethical target validation before scan execution
Public third-party website blocking by default
GitHub repository target classification
Localhost and private lab IP support
CVSS-based severity classification
Critical, High, Medium, Low, and Info risk levels
Evidence-based vulnerability findings
Scan history management
CSV report export
Authentication using Convex Auth
Responsive cybersecurity dashboard UI
---
🛠️ Tech Stack
Category	Technology
Frontend	React.js
Language	TypeScript
Styling	Tailwind CSS
Build Tool	Vite
Backend	Convex
Authentication	Convex Auth
Notifications	Sonner
Hosting	Vercel
Version Control	Git & GitHub
---
🧠 How SafeHex Works
```text
User enters target
        ↓
Target type is detected
        ↓
Ethical validation is applied
        ↓
Allowed scan mode is selected
        ↓
Backend generates evidence-based findings
        ↓
CVSS score is mapped to risk level
        ↓
Results are displayed in dashboard
        ↓
Report can be exported
```
---
🎯 Supported Target Types
Target Type	Example	Status
Localhost	`http://localhost:5173`	Allowed
Private IP	`192.168.1.10`	Allowed for lab use
GitHub Repo	`https://github.com/user/repo`	Repository scan mode
Authorized Domain	`https://yourdomain.com`	Allowed only if allowlisted
Public Website	`https://example.com`	Blocked by default
Public IP	`8.8.8.8`	Blocked by default
---
📊 Risk Classification
SafeHex uses CVSS-style severity mapping:
CVSS Score	Risk Level
0.0	Info
0.1 - 3.9	Low
4.0 - 6.9	Medium
7.0 - 8.9	High
9.0 - 10.0	Critical
---
📁 Project Structure
```text
SafeHex/
├── convex/
│   ├── auth.ts
│   ├── schema.ts
│   └── vulnerabilityAnalyzer.ts
├── src/
│   ├── App.tsx
│   ├── SecurityDashboard.tsx
│   ├── ScanForm.tsx
│   ├── ScanResults.tsx
│   ├── ScanHistory.tsx
│   ├── IntegrityFramework.tsx
│   ├── SignInForm.tsx
│   └── SignOutButton.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```
---
⚙️ Installation
Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/safehex.git
cd safehex
```
Install dependencies:
```bash
npm install
```
Start Convex:
```bash
npx convex dev
```
Start the frontend:
```bash
npm run dev
```
Open the app:
```text
http://localhost:5173
```
---
🔐 Environment Setup
Create a `.env.local` file if required by your Convex setup:
```env
VITE_CONVEX_URL=your_convex_deployment_url
```
Do not upload `.env`, `.env.local`, API keys, deploy keys, or secret tokens to GitHub.
---
🌐 Deployment
Recommended deployment:
```text
GitHub + Vercel + Convex
```
Vercel Build Settings
```text
Framework Preset: Vite
Build Command: npx convex deploy --cmd-url-env-var-name VITE_CONVEX_URL --cmd "npm run build"
Output Directory: dist
Install Command: npm install
```
Add this environment variable in Vercel:
```text
CONVEX_DEPLOY_KEY=your_convex_production_deploy_key
```
---
📤 Report Export
SafeHex supports exporting scan results as CSV reports. Each report can include:
Target
Finding title
Category
CVSS score
Risk level
Classification
Evidence
Source
Mitigation
Confidence score
---
🧪 Demo Inputs
Use these safe inputs for project demonstration:
```text
http://localhost:5173
http://localhost:3000
192.168.1.10
https://github.com/YOUR_USERNAME/YOUR_REPOSITORY
```
Avoid scanning public websites unless you own them or have written permission.
---
⚠️ Ethical Use Disclaimer
SafeHex is built only for ethical hacking, educational use, defensive cybersecurity learning, and authorized assessments. Unauthorized scanning of public systems, third-party websites, or external IP addresses may be illegal. The developer is not responsible for misuse of this project.
---
📌 Resume Description
SafeHex – Ethical Hacking Integrity Framework  
Built a React, TypeScript, Tailwind CSS, and Convex-based cybersecurity dashboard that performs ethical target validation, CVSS-based risk classification, vulnerability result analysis, scan history tracking, and report export for authorized security assessments.
---
👨‍💻 Author
Gunasakthi Loganathan  
CSE - Artificial Intelligence & Machine Learning  
Vel Tech High Tech Engineering College
---
📄 License
This project is intended for educational and academic use. You may customize the license based on your requirement.
