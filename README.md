# Solapur Road Rescuer 🛣️

A comprehensive road issue reporting and management system for Solapur city, enabling citizens to report road problems and administrators to manage and resolve them efficiently.

## 🌟 Features

### For Citizens:
- **Easy Reporting**: Report road issues with photos, location, and description
- **Real-time Tracking**: Track your report status with unique ticket ID
- **Email Notifications**: Get updates when status changes
- **User-Friendly Tutorial**: Step-by-step guide on how to use the system
- **Interactive Map**: View reported issues on an interactive map

### For Administrators:
- **Advanced Dashboard**: Comprehensive overview of all reports
- **Enhanced Map View**: 
  - Marker clustering for better visualization
  - Filter by status and severity
  - Color-coded markers (red=open, amber=in-progress, green=resolved)
  - Size-based severity indicators
  - Get directions to report locations
  - Street View integration
  - Geolocation support
- **Work Order Management**:
  - Bulk operations on multiple reports
  - Custom email communication
  - Status updates with email notifications
  - Report rejection workflow
- **Comments System**:
  - Add public comments visible to users
  - Add internal notes (admin-only) for coordination
  - Timestamped comment history
- **Audit Logging**:
  - Complete activity tracking
  - Export logs to CSV
  - Search and filter capabilities
  - Security accountability
- **Statistics**: Live stats showing open, in-progress, and resolved issues

## 🚀 Live Demo

**Production URL**: [https://solapur-road-rescuer-main.vercel.app](https://solapur-road-rescuer-main.vercel.app)

## 📚 Documentation

- [Admin Features Guide](./ADMIN_FEATURES.md) - Comprehensive guide to all admin features
- [Security Implementation](./SECURITY.md) - Security measures and best practices
- [Database Migration](./MIGRATION_REJECTED_STATUS.md) - Database setup instructions

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Mapping**: React Leaflet + react-leaflet-cluster
- **State Management**: Zustand (with persistence)
- **Database**: Supabase (PostgreSQL)
- **Email**: EmailJS
- **Deployment**: Vercel
- **Icons**: Lucide React

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

## 🗄️ Database Setup

1. Create a Supabase project
2. Run the migration SQL to add 'rejected' status:

```sql
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_status_check;
ALTER TABLE public.reports ADD CONSTRAINT reports_status_check 
CHECK (status IN ('open', 'in-progress', 'resolved', 'rejected'));
```

3. Enable Row Level Security (RLS) for production
4. Configure authentication settings

## 📦 Installation & Development

```bash
# Clone the repository
git clone https://github.com/Mahesh-ch06/Solapur-Smart-Road.git

# Navigate to project directory
cd Solapur-Smart-Road

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔒 Security Features

- Comprehensive audit logging
- Protected admin routes
- Input validation
- XSS protection (React auto-escaping)
- SQL injection prevention (Supabase client)
- HTTPS enforced (Vercel)
- Environment variable protection

See [SECURITY.md](./SECURITY.md) for detailed security implementation.

## 📝 Key Admin Routes

- `/admin` - Dashboard overview
- `/admin/map` - Enhanced interactive map
- `/admin/work-orders` - Report management
- `/admin/audit-logs` - Security audit trail

## 🎯 Roadmap

- [x] Basic report submission
- [x] Admin dashboard
- [x] Email notifications
- [x] Interactive map view
- [x] Marker clustering
- [x] Comments system
- [x] Audit logging
- [x] Bulk operations
- [ ] Real-time notifications
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Team assignment
- [ ] PDF export
- [ ] Integration with municipal systems

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Team

Developed for Solapur Smart City initiative

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact: mahesh.ch06@example.com

## 🙏 Acknowledgments

- Lovable.dev for the initial project setup
- shadcn/ui for the beautiful UI components
- Supabase for the backend infrastructure
- React Leaflet community for mapping tools

---

**Made with ❤️ for Solapur**

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
