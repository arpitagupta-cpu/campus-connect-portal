# CampusConnect

CampusConnect is an educational platform that provides a comprehensive interface for both students and administrators to manage educational resources, assignments, and communications.

## Features

### For Students:
- View and submit assignments
- Access study materials
- Receive announcements
- View results and grades

### For Administrators:
- Manage student information
- Upload and manage assignments
- Share study materials
- Post announcements
- Upload student results

## Technology Stack

- **Frontend**: React, TypeScript, TanStack Query, Shadcn UI components, Tailwind CSS
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Authentication with database fallback

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Firebase project (optional for Google authentication)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/campus-connect.git
cd campus-connect
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add the following:
```
DATABASE_URL=your_postgresql_connection_string
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## Default Login Credentials

- **Admin User**:
  - Username: admin
  - Password: admin123

- **Student User**:
  - Username: student
  - Password: student123

## License

[MIT](LICENSE)