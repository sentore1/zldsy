# Service Management System

A comprehensive Next.js-based service management platform for businesses like cleaning, fumigation, security, maintenance, landscaping, and construction support services.

## 🚀 Features

### Customer Portal
- **Service Booking**: Browse services and book with ease
- **Photo Upload**: Upload photos during booking for accurate quotations
- **Real-time Tracking**: Track service progress from booking to completion
- **Customer Information Management**: Store and manage customer details

### Smart Quotation System
- **Automatic Pricing**: Generate quotations based on service and requirements
- **QR Code Verification**: Unique QR codes for each quotation
- **PDF Generation**: Printable quotations
- **Digital Acceptance**: Terms & conditions acceptance
- **Multi-channel Delivery**: Send via Email or WhatsApp

### Service Management
- **Job Assignment**: Assign team members and schedule services
- **Status Tracking**: Track jobs through Pending → Scheduled → In Progress → Completed
- **Weather Tracking**: Monitor weather conditions (Dry, Wet, Rain)
- **Team Coordination**: Manage staff assignments and labor costs

### Invoice & Payment
- **Automatic Generation**: Auto-generate invoices after service completion
- **PDF Export**: Printable invoices with QR codes
- **Payment Tracking**: Monitor payment status and history
- **Multiple Payment Methods**: Support for various payment options

### Customer Feedback
- **Rating System**: 5-star rating system
- **Feedback Collection**: Collect customer comments
- **Google Reviews Integration**: Redirect satisfied customers to Google Reviews
- **Service Recommendations**: Track customer satisfaction

### Business Dashboard
- **Operations Overview**: Today's jobs, ongoing services, tomorrow's schedule
- **Staff Management**: Attendance, assignments, labor costs
- **Inventory & Equipment**: Materials tracking, fuel consumption, equipment allocation
- **Financial Reports**: Revenue, expenses, net profit, profit margin

### Admin Management
- Customers Management
- Services Catalog
- Bookings Management
- Quotations Tracking
- Staff Administration
- Inventory Control
- Equipment & Vehicles
- Invoice Management
- Comprehensive Reports
- System Settings

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **PDF Generation**: jsPDF, html2canvas
- **QR Codes**: qrcode
- **Forms**: React Hook Form
- **Validation**: Zod
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd service-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**

- Create a new project on [Supabase](https://supabase.com)
- Copy your project URL and anon key
- Run the database schema in Supabase SQL Editor:
  - Navigate to `lib/supabase/schema.sql`
  - Execute the SQL script in your Supabase project

4. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_password

# WhatsApp API (Optional)
WHATSAPP_API_KEY=your_whatsapp_api_key

# Weather API (Optional)
WEATHER_API_KEY=your_weather_api_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
service-management-system/
├── app/                      # Next.js App Router
│   ├── admin/               # Admin dashboard pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── customers/       # Customer management
│   │   ├── services/        # Services management
│   │   ├── jobs/            # Jobs management
│   │   ├── invoices/        # Invoice management
│   │   └── ...
│   ├── customer/            # Customer portal
│   │   ├── booking/         # Service booking
│   │   └── track/           # Service tracking
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── lib/                      # Utility libraries
│   ├── supabase/            # Supabase configuration
│   │   ├── client.ts        # Supabase client
│   │   └── schema.sql       # Database schema
│   └── utils.ts             # Utility functions
├── types/                    # TypeScript types
│   └── index.ts             # Type definitions
├── components/              # Reusable components (to be added)
└── public/                  # Static assets
```

## 🗄️ Database Schema

The system uses PostgreSQL via Supabase with the following main tables:

- **customers**: Customer information
- **services**: Service catalog
- **bookings**: Service bookings
- **booking_photos**: Photos uploaded during booking
- **quotations**: Generated quotations
- **quotation_items**: Line items in quotations
- **jobs**: Service execution jobs
- **job_staff**: Staff assigned to jobs
- **job_materials**: Materials used in jobs
- **job_equipment**: Equipment allocated to jobs
- **staff**: Staff members
- **inventory**: Inventory/materials
- **equipment**: Equipment and vehicles
- **invoices**: Generated invoices
- **payments**: Payment records
- **feedback**: Customer feedback
- **expenses**: Business expenses
- **attendance**: Staff attendance

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📝 Customer Workflow

1. Browse available services
2. Book a service with details
3. Upload photos/documents
4. Receive automatic quotation
5. Accept terms & conditions
6. Track service progress
7. Receive invoice
8. Make payment
9. Leave feedback
10. Redirect to Google Review (if satisfied)

## 🎯 Use Cases

Perfect for service-based businesses:
- ✅ Cleaning Services
- ✅ Fumigation & Pest Control
- ✅ Security Services
- ✅ Maintenance & Repairs
- ✅ Landscaping
- ✅ Construction Support
- ✅ Field Service Companies
- ✅ Any on-site service business

## 🔐 Security

- Row Level Security (RLS) enabled on Supabase
- Secure authentication with Supabase Auth
- Environment variables for sensitive data
- Input validation with Zod
- Protected admin routes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@example.com or create an issue in the repository.

## 🎨 Customization

### Adding New Services

1. Navigate to Admin Dashboard → Services
2. Click "Add Service"
3. Fill in service details (name, description, base price, unit)
4. Save and activate

### Customizing Quotation Templates

Edit `lib/utils.ts` to modify quotation generation logic and pricing calculations.

### Adding Payment Gateways

Integrate payment providers by:
1. Installing the provider SDK
2. Creating payment routes in `app/api/payments/`
3. Updating invoice payment flow

## 📊 Reports & Analytics

The system provides:
- Revenue reports
- Expense tracking
- Profit margin analysis
- Staff performance
- Inventory usage
- Customer satisfaction metrics

## 🔄 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Advanced reporting with charts
- [ ] Multi-tenant support
- [ ] Role-based access control
- [ ] Automated scheduling
- [ ] GPS tracking for field staff
- [ ] Customer mobile app
- [ ] Advanced inventory forecasting
- [ ] Integration with accounting software

## 📱 Contact

For more information or demo requests, contact us at:
- Email: info@example.com
- Website: www.example.com
- Phone: +1 234 567 8900

---

Built with ❤️ using Next.js and Supabase
