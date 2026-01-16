# Solapur Road Rescuer 🛣️

A modern, comprehensive road issue reporting and management system for Solapur Municipal Corporation.

## 🚀 Features

- **Report Pothole**: Multi-step form with OTP email verification, GPS location, photo upload, and severity assessment
- **Track Reports**: Real-time status tracking with ticket ID
- **User Dashboard**: View all your submitted reports with filtering and export options
- **AI Chatbot (Anvi)**: Gemini-powered assistant for status checks, queries, and human escalation
- **Admin Panel**: Complete management system with maps, work orders, and audit logs
- **Contact Us**: Modern contact page with quick help shortcuts and reassurance badges

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Maps**: Leaflet + React-Leaflet
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **Backend**: Supabase (Auth + Database)
- **Email**: EmailJS for OTP and notifications
- **AI**: Google Gemini Pro API

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Mahesh-ch06/Solapur-Smart-Road.git

# Navigate to project directory
cd solapur-road-rescuer-main

# Install dependencies (use --legacy-peer-deps if needed)
npm install --legacy-peer-deps

# Start development server
npm run dev
```

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# EmailJS (for OTP and notifications)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# Web3Forms (Contact form)
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_key
```

## 📤 Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. **Push to GitHub** (Already done ✅)
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository: `Mahesh-ch06/Solapur-Smart-Road`
   - Vercel will auto-detect Vite configuration
   - Add environment variables in Vercel dashboard:
     - Settings → Environment Variables
     - Add all variables from `.env`
   - Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 🔧 Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## 📸 Screenshots

### Landing Page
Modern hero section with quick access to report and track features.

### Report Flow
5-step process:
1. Email verification with OTP
2. GPS location pinning
3. Description and severity
4. Photo upload
5. Review and submit

### Track Reports
Search by ticket ID with detailed status timeline.

### User Dashboard
View all reports, filter by status, and export data.

### AI Chatbot
Gemini-powered assistant for instant help.

## 🗂️ Project Structure

```
src/
├── components/
│   ├── admin/          # Admin panel components
│   ├── landing/        # Landing page sections
│   ├── map/            # Map components
│   ├── report/         # Report form
│   └── ui/             # shadcn/ui components
├── pages/              # Route pages
├── store/              # Zustand stores
├── utils/              # Utility functions
└── assets/             # Static assets
```

## 🔐 EmailJS Setup (OTP)

1. Create account at [emailjs.com](https://www.emailjs.com/)
2. Create email service (Gmail/Outlook)
3. Create template `template_otp_verify`:
   ```
   Subject: Your OTP for Solapur Road Rescuer

   Hi {{to_name}},

   Your OTP for {{app_name}} is: {{otp_code}}

   This code is valid for 10 minutes.
   ```
4. Add service ID and public key to `.env`

## 📝 License

MIT License - feel free to use this project for your municipality!

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## 📧 Support

For issues or questions, contact via the app's chatbot or create a GitHub issue.

---

Made with ❤️ for Solapur Smart City Initiative
