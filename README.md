# School Helpdesk System

A modern, fast, and integrated ticketing system designed for school facilities and digital infrastructure. Built with a robust full-stack architecture to handle issue reporting, tracking, and management seamlessly.

## Tech Stack

### Frontend (Client)

- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4) + Radix UI + Framer Motion
- **State Management:** TanStack React Query
- **Form Handling:** React Hook Form + Zod
- **Routing:** React Router DOM

### Backend (Server)

- **Runtime:** Bun
- **Framework:** Hono
- **Database:** PostgreSQL (via Docker)
- **ORM:** Prisma
- **AI Integration:** Google Generative AI (Gemini)
- **Storage:** Cloudinary (for attachment uploads)
- **Security:** bcrypt, JWT, Hono Rate Limiter

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/) (latest version)
- [Docker & Docker Compose](https://www.docker.com/) (for PostgreSQL)
- Cloudinary Account (for image hosting API keys)
- Google AI Studio API Key (for Gemini)

---

## Setup & Installation

### 1. Database Setup (Docker)

We use Docker to spin up a PostgreSQL instance quickly.

```bash
# Run the database container in detached mode
docker-compose up -d

```

### 2. Environment Variables

Copy the .env.example file and rename it to .env in the root directory. Fill in your actual credentials.

# Database Configuration

`DATABASE_URL="postgresql://root:PostgresPassword123@localhost:5433/school_tickets?schema=public"`

# Authentication

`JWT_SECRET="your_super_secret_jwt_key_here_min_32_chars"`

# Cloudinary Storage

`CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
CLOUDINARY_API_KEY="your_api_key_here"
CLOUDINARY_API_SECRET="your_api_secret_here"`

# Google Gemini AI

`GEMINI_API_KEY="your_gemini_api_key_here"`

### 3. Install Dependencies & Setup Prisma

# Install dependencies for both server and client (assuming monorepo or run in respective folders)

```bash
bun install
```

# Generate Prisma Client and Push Schema

```bash
bunx prisma generate
bunx prisma db push
```

Running the Application
Development Mode (Hot Reload)
To run the application locally for development:

Terminal 1 (Backend):

```bash
# Navigate to server folder (if separated) or run the server script
bun run dev
```

# Navigate to server folder (if separated) or run the server script

bun run dev
Terminal 2 (Frontend):

```bash
# Navigate to client folder
bun run dev
```

# Navigate to client folder

Production Build Simulation
To test the application as it would run in a production environment:

Backend:

```bash
export NODE_ENV="production"
bun run src/index.ts
```

Frontend:

```bash
bun run build
bun run preview
```

# System Rules & Assumptions

## Role-Based Access Control (RBAC)

### TEACHER (User):

- Can create tickets.
- Can view all own tickets.
- Can only view, update, and track their own tickets.
- Cannot change ticket after it is processed (Status !== SUBMITTED).
- Cannot alter the content (title/description/priority/category) of a ticket.

### ADMIN :

- Can create tickets.
- Can view and manage all tickets across the system.
- Cannot alter the content (title/description/priority/category) of a ticket.
- Has exclusive rights to change ticket Status & Priority.
- Has exclusive right to access Dasboard.

## Key Features

### Authentication & Security

- **Dual-Login System:** Users can log in using either their registered Email or Username.
- **JWT Authorization:** Secure, stateless session management using JSON Web Tokens.
- **Password Encryption:** Passwords are securely hashed using `bcrypt` before hitting the database.
- **Anti-Bot Registration (Honeypot):** Implemented a hidden `secondary_number` field during registration to silently block and mock responses for automated spam bots.

### Advanced Ticket Management

- **Smart Ticket Generation:** Automatically generates human-readable, trace-friendly ticket IDs (Format: `TKT-DDMMYY-XXXX`).
- **Duplicate Prevention:** Prevents users from spamming the system by blocking the creation of tickets with identical titles that are already in `SUBMITTED` or `ONGOING` status.
- **Role-Based Update Rules:** - Creators can only update ticket content while the status is `SUBMITTED`.
  - Admins cannot tamper with user-generated content (title/description) but have exclusive rights to manage Status and Priority.
- **Soft Delete & Trash Bin:** Tickets are not permanently deleted right away (`deleted_at`). Admins have the exclusive capability to view the trash bin and restore accidentally deleted tickets.

### AI-Powered Automation

- **Smart Categorization & Prioritization:** Integrates with **Google Generative AI (Gemini Flash Lite)** to analyze the user's issue description in Indonesian and automatically determine the most appropriate `Category` and `Priority`.

### Cloud Media Handling

- **Cloudinary Integration:** Seamless image attachment uploads for tickets.
- **Strict Validation:** Restricts uploads to specific formats (JPG, PNG, WEBP) and caps file sizes at 5MB to prevent storage abuse.
- **On-the-Fly Optimization:** Automatically crops images, optimizes quality, and converts them to `webp` format during the upload stream to save bandwidth.
- **Storage Cleanup:** Automatically deletes images from the Cloudinary bucket when a user removes an attachment from their ticket.

### Analytics & Search Engine

- **Dynamic Search & Pagination:** Supports complex filtering by Keyword (searches Title and Description), Priority, Status, Category, and Submitter ID.
- **Dashboard Statistics:** Generates comprehensive, role-aware statistical data (total tickets grouped by Status, Priority, and Category) for dashboard visualizations in a single, optimized database transaction.

# Ticket Lifecycle (Status)

- SUBMITTED: Ticket is created and waiting for Admin review.

- ONGOING: Admin is actively working on the issue.

- DONE: The issue has been resolved.

- REJECTED: The ticket is invalid or canceled.

# Future Improvements & Roadmap

## While the current architecture is stable, the following improvements are planned for future scalability:

### 1. Database Query Optimization (Prisma -> Raw SQL)

Currently, the application relies on Prisma ORM for database interactions. While Prisma offers excellent developer experience (DX) and type safety, its abstraction layer and lack of native prepared statements can lead to performance bottlenecks as the dataset grows significantly.

#### Plan:

Refactor high-traffic endpoints (especially TicketService.search and complex aggregation queries like TicketService.getStatistics) to use Raw SQL / Prepared Statements to reduce overhead and improve execution speed.

### 2. Caching Layer

Implement Redis to cache frequently accessed but rarely changing data, such as TicketService.getStatistics or generic Guidebook/Quick Report templates, to reduce database load.

### 3. Real-time Updates (WebSocket)

Integrate WebSockets (using Bun's native WebSocket implementation) to push real-time notifications to Teachers when an Admin changes the status of their ticket, eliminating the need for manual page refreshes.

### 4. Enhanced Security & Advanced Authentication

To further harden the system against unauthorized access and brute-force attacks, the current basic JWT authentication will be upgraded to a comprehensive identity management system.

**Planned Security Upgrades:**

- **Email Verification (`is_verified`):** Restricting system access strictly to users who have successfully verified their email addresses via a time-limited token.
- **OTP & Trusted Devices (MFA):** Implementing a Multi-Factor Authentication layer. Logins from unrecognized devices will trigger an OTP (One-Time Password) sent via email. Successfully verified devices will be registered as "Trusted Devices" using secure tokens.
- **Single Sign-On (SSO):** Integrating **Google OAuth 2.0** to allow school staff to log in seamlessly using their official Google Workspace accounts.
- **Redis-Backed Rate Limiting:** Utilizing Redis to track failed login attempts, OTP requests, and password reset triggers. This will enforce strict cooldown periods (e.g., locking accounts after 5 failed password attempts) to mitigate brute-force and spam attacks.

### 5. Interactive Ticket Replies & Communication

While the backend service (`ReplyService`) and database schema (`TicketReply`) are already fully implemented, the frontend user interface for this feature is planned for the upcoming release. This will transform the static ticket details page into an interactive workspace.

**Planned Capabilities:**

- **Two-Way Threaded Communication:** Allows Teachers and Admins to communicate directly within a specific ticket to ask for clarifications, request additional photos, or provide progress updates.
- **Strict Access Control:** Teachers can only access and reply to threads on their own tickets, while Admins have full visibility. The conversation history is fetched in chronological order for easy reading.
- **Status-Aware Auto-Locking:** To maintain workflow integrity, the reply thread will automatically lock and prevent new messages once a ticket status is marked as `DONE` or `REJECTED`.

### 6. Comprehensive Audit & Activity Logging

To ensure complete transparency and accountability within the system, an advanced Audit Log feature will be implemented. While the foundational backend models (`TicketLog`) and services are currently being structured, this will be expanded system-wide to track all critical modifications.

**Planned Capabilities:**

- **Granular Action Tracking:** Every critical state change such as ticket status updates, priority escalations, content deletions, and user role modifications will be automatically recorded with a precise timestamp and detailed description.
- **Executive Visibility & Security:** To maintain strict security protocols, access to these activity logs will be exclusively restricted to top-tier management (e.g., `SUPER_ADMIN`).
- **Historical Accountability:** Acts as an immutable ledger that identifies exactly _who_ executed a specific change and _when_. This provides an invaluable tool for security audits, troubleshooting miscommunications, and monitoring administrative performance.

### 7. Automated WhatsApp Notifications

Relying exclusively on the web dashboard or email notifications can lead to users missing critical updates. Integrating a WhatsApp bot will bridge this communication gap to ensure instant and reliable message delivery.

**Planned Capabilities:**

**Real-Time Alerts**: Send automated WhatsApp messages directly to the ticket submitter whenever their ticket status changes (e.g., transitioning from ONGOING to DONE).

**Direct Tracking Links**: Embed direct tracking URLs (e.g., ticket.me/tickets/track/:id) within the notification, allowing users to instantly access the full resolution timeline and details on the web.

**Efficient Bot Engine**: Utilize the Baileys library to construct a lightweight and robust background service that handles all outgoing notification traffic seamlessly without overloading the main server.

### 8. Service Level Agreement (SLA) Tracking & Escalation

To maintain high-quality team support and ensure critical issues are addressed promptly, an automated SLA monitoring system will be introduced.

**Planned Capabilities:**

**Priority-Based Deadlines**: Assign strict, automated response and resolution timeframes based on ticket priority. For example, HIGH priority issues will trigger a countdown requiring immediate action within a specifically defined short window.
