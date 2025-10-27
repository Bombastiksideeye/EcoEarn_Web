# EcoEarn Admin Dashboard

A Next.js admin dashboard for the EcoEarn waste management system, converted from Flutter/Dart to maintain the same database structure and functionality.

## Features

- **Dashboard**: Real-time statistics, charts, and analytics
- **Bin Management**: Interactive map with GPS coordinates, fill levels, and QR code generation
- **User Reports**: View and manage user-submitted reports with images
- **Activity Logs**: Monitor user activities and system logs
- **Transactions**: Track financial transactions and admin cash balance
- **Material Pricing**: Configure pricing for different recyclable materials

## Database Collections (Firebase Firestore)

The system uses the same Firebase Firestore collections as the original Flutter app:

- `bins` - Waste bin locations with GPS coordinates, fill levels, images, QR codes
- `reports` - User reports with images, descriptions, locations
- `recycling_requests` - User recycling submissions with materials, quantities
- `userActivities` - User activity logs
- `transactions` - Financial transactions
- `admin_transactions` - Admin cash balance management
- `pricing` - Material pricing configuration
- `users` - User profiles

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Charts**: Recharts
- **Maps**: Leaflet with React-Leaflet
- **Icons**: Lucide React
- **PDF Generation**: jsPDF with html2canvas

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env.local` file with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Admin Dashboard**
   Navigate to `http://localhost:3000/admin`

## Project Structure

```
├── app/
│   ├── admin/
│   │   ├── dashboard/     # Dashboard page
│   │   ├── bins/         # Bin management page
│   │   ├── reports/      # User reports page
│   │   ├── logs/         # Activity logs page
│   │   ├── transactions/ # Transactions page
│   │   └── layout.tsx    # Admin layout
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/
│   ├── Layout.tsx        # Main layout component
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── dashboard/        # Dashboard components
│   └── bins/            # Bin management components
├── lib/
│   ├── firebase.ts       # Firebase configuration
│   └── admin-service.ts  # Admin service layer
└── package.json
```

## Key Components

### AdminService
The `AdminService` class provides all database operations and maintains the same API as the original Flutter service:

- Bin management (add, delete, fetch)
- Report management
- Activity log tracking
- Transaction handling
- Material pricing configuration
- Real-time notifications

### Dashboard Components
- **StatsCard**: Displays key metrics
- **HorizontalBarChart**: Shows recycling statistics
- **MonthlyWasteChart**: Monthly waste collection trends
- **MaterialsSection**: Material pricing management
- **RecentRecycles**: Recent recycling activities

### Bin Management
- **BinMap**: Interactive map with Leaflet
- **BinForm**: Form for adding new bins
- Real-time bin status updates
- QR code generation for bins

## Database Schema

The system maintains compatibility with the existing Firebase collections:

### Bins Collection
```typescript
interface Bin {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  level: number;
  image: string;
  color: string;
  createdAt: Timestamp;
  qrData: string;
}
```

### Reports Collection
```typescript
interface Report {
  id?: string;
  userName: string;
  description: string;
  location: string;
  image: string;
  timestamp: Timestamp;
}
```

### Recycling Requests Collection
```typescript
interface RecyclingRequest {
  id?: string;
  userId: string;
  userName: string;
  materialType: string;
  quantity: number;
  weight: number;
  status: string;
  timestamp: Timestamp;
  profilePicture?: string;
}
```

## Features Implemented

✅ **Dashboard with Statistics**
- User statistics (total, active, inactive)
- Recycling statistics (plastic, glass)
- Monthly waste collection charts
- Material pricing management

✅ **Bin Management**
- Interactive map with GPS coordinates
- Add/delete bins with images
- QR code generation
- Real-time fill level monitoring

✅ **User Reports**
- View all user reports
- Search and filter functionality
- Image display
- Pagination

✅ **Activity Logs**
- User activity tracking
- Search and filter
- Pagination
- Status indicators

✅ **Transactions**
- Transaction statistics
- Admin cash balance
- Transaction management interface

## Migration Notes

This Next.js version maintains full compatibility with the existing Firebase database structure. The admin service layer provides the same functionality as the original Flutter `AdminService` class, ensuring seamless data operations.

Key differences from Flutter version:
- Web-based interface instead of mobile app
- React components instead of Flutter widgets
- Next.js routing instead of Flutter navigation
- Tailwind CSS instead of Flutter styling

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in the `components/` directory
2. Add new pages in `app/admin/` directory
3. Extend `AdminService` for new database operations
4. Update the sidebar navigation in `components/Sidebar.tsx`

## Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Railway**
- **Heroku**

Make sure to set the Firebase environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the EcoEarn waste management system.