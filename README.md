# PakAutoSe Generators - E-commerce Platform

A complete e-commerce website for selling generators, generator parts, and providing generator services. Built with Next.js 14, TypeScript, Prisma, and Tailwind CSS.

## Features

### 🛒 E-commerce Features
- **Generator Catalog**: Browse, search, and filter generators
- **Parts Store**: Shop for generator parts and accessories
- **Shopping Cart**: Persistent cart with quantity management
- **Checkout**: Complete checkout flow with shipping and payment
- **Order Tracking**: Track order status from placement to delivery

### 🔧 Services Module
- **Service Requests**: Submit repair, maintenance, and installation requests
- **Multiple Service Types**: Repair, Maintenance, Installation, Inspection, Parts Replacement, Emergency
- **Request Tracking**: Track service request status and updates

### 👤 User Features
- **User Registration/Login**: Email/password and Google OAuth
- **User Dashboard**: View orders, service requests, profile
- **Profile Management**: Update personal info and password
- **Order History**: Complete order history with details

### 🔐 Admin Panel
- **Dashboard**: Stats, revenue, recent orders, low stock alerts
- **Generator Management**: CRUD operations for generators
- **Parts Management**: CRUD operations for parts
- **Order Management**: View and update order status
- **Service Management**: Manage service requests
- **User Management**: Manage user accounts and roles

### 💳 Payment Options
- **Cash on Delivery (COD)**: Default payment method
- **Online Payment**: Stripe integration (ready for configuration)
- **Coupon System**: Discount codes with percentage/fixed amount

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Email**: Resend API
- **File Upload**: UploadThing

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pakautose.git
cd pakautose
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pakautose"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Resend Email (optional)
RESEND_API_KEY="your-resend-api-key"

# Stripe (optional)
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
```

5. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

6. (Optional) Seed the database:
```bash
npx prisma db seed
```

7. Run the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
pakautose/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── src/
│   ├── app/
│   │   ├── (main)/        # Public pages
│   │   │   ├── account/   # User account pages
│   │   │   ├── cart/      # Shopping cart
│   │   │   ├── checkout/  # Checkout flow
│   │   │   ├── generators/# Generator catalog
│   │   │   ├── parts/     # Parts catalog
│   │   │   └── services/  # Service requests
│   │   ├── admin/         # Admin panel
│   │   │   ├── generators/# Generator management
│   │   │   ├── orders/    # Order management
│   │   │   ├── parts/     # Parts management
│   │   │   ├── services/  # Service management
│   │   │   └── users/     # User management
│   │   ├── api/           # API routes
│   │   │   ├── admin/     # Admin API routes
│   │   │   ├── auth/      # Auth API routes
│   │   │   ├── cart/      # Cart API
│   │   │   ├── generators/# Generators API
│   │   │   ├── orders/    # Orders API
│   │   │   ├── parts/     # Parts API
│   │   │   ├── services/  # Services API
│   │   │   └── user/      # User API
│   │   └── auth/          # Auth pages
│   ├── components/
│   │   ├── layout/        # Header, Footer
│   │   └── ui/            # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts        # NextAuth config
│   │   ├── email.ts       # Email utilities
│   │   ├── prisma.ts      # Prisma client
│   │   ├── utils.ts       # Utility functions
│   │   └── validations.ts # Zod schemas
│   ├── store/
│   │   └── cart-store.ts  # Zustand cart store
│   └── types/
│       └── next-auth.d.ts # TypeScript types
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Database Models

- **User**: Customer and admin accounts
- **Generator**: Generator products
- **Part**: Generator parts/accessories
- **Order**: Customer orders
- **OrderItem**: Order line items
- **Cart**: Shopping carts
- **CartItem**: Cart line items
- **ServiceRequest**: Service requests
- **Review**: Product reviews
- **Category**: Product categories
- **Brand**: Product brands
- **Coupon**: Discount codes
- **Notification**: User notifications
- **Setting**: System settings
- **Banner**: Homepage banners
- **AuditLog**: Admin activity logs

## API Routes

### Public API
- `GET /api/generators` - List generators
- `GET /api/generators/[slug]` - Get generator details
- `GET /api/parts` - List parts
- `GET /api/parts/[slug]` - Get part details
- `POST /api/cart` - Add to cart
- `GET /api/cart` - Get cart
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `POST /api/services` - Create service request
- `GET /api/services` - Get user service requests

### Admin API
- `GET/POST /api/admin/generators` - Manage generators
- `GET/PUT/DELETE /api/admin/generators/[id]` - Single generator
- `GET/POST /api/admin/parts` - Manage parts
- `GET/PUT/DELETE /api/admin/parts/[id]` - Single part
- `GET /api/admin/orders` - List all orders
- `PUT /api/admin/orders/[id]` - Update order
- `GET /api/admin/services` - List all service requests
- `PUT /api/admin/services/[id]` - Update service request
- `GET/POST /api/admin/users` - Manage users
- `GET/PUT/DELETE /api/admin/users/[id]` - Single user
- `GET /api/admin/stats` - Dashboard statistics

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Docker
```bash
docker build -t pakautose .
docker run -p 3000:3000 pakautose
```

## License

MIT License

## Support

For support, email support@pakautose.com or call +92 XXX XXXXXXX
