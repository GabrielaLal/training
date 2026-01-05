# EventHub - Event Management Platform

A full-stack event management platform for learning modern web development patterns.

---

## 🚀 Quick Start

1. **Fork this repository** to your GitHub account
2. **Clone your fork** locally
3. Install dependencies for API and App (see below)
4. Configure environment variables
5. Run `npm run seed` to populate sample data
6. Start building!

---

## Installation

### API (Backend)

```bash
cd api
npm install
```

Create `.env` file in `/api`:

```env
MONGO_URI=your-mongodb-uri
SECRET=your-jwt-secret
BREVO_KEY=your-brevo-api-key
APP_URL=http://localhost:5173
ADMIN_URL=http://localhost:3001
ENVIRONMENT=development
```

Start the server:
```bash
npm run dev
```

Seed sample data (optional):
```bash
npm run seed
```

Test users:
- john@example.com / password123
- jane@example.com / password123
- admin@example.com / admin123

---

### App (Frontend)

```bash
cd app
npm install
npm run dev
```

---

### Admin (Admin Panel)

```bash
cd admin
npm install
npm run dev
```

---

## 🔀 Git Workflow

### One PR per Feature

Each feature should be developed in its own branch and submitted as a **separate Pull Request**.

```bash
# Create feature branch
git checkout -b feature/venue-module

# Make changes, commit
git add .
git commit -m "feat: add venue module with full CRUD"

# Push to your fork
git push origin feature/venue-module

# Create PR from your fork to original repo
```

### PR Best Practices

**✅ DO:**
- One PR per feature (Venue, Calendar Service, Webhook, etc.)
- Full-stack & working (backend + frontend)
- Small but complete (focused on ONE feature)
- Clear commit messages (`feat:`, `fix:`, `refactor:`)

**❌ DON'T:**
- Giant PRs with multiple features
- Incomplete features (only backend or only frontend)
- Broken code or linter errors

---

## 📚 What You'll Learn

### Week 1: Core Patterns
- Controllers vs Services vs Webhooks vs Crons vs Scripts
- MongoDB models and schemas
- Express routing and middleware
- React components and routing
- POST /search pattern for filtering

### Week 2: Integrations
- External API integrations (Google Calendar)
- Webhook handling
- Scheduled jobs (cron)
- Email notifications

### Week 3: Advanced Features
- Payment processing (Stripe)
- QR code generation
- Analytics and reporting

---

## 🎯 Explore the Code

- **Dashboard** (`/dashboard`) - See Week 1 tasks and architecture
- **Event Controller** (`api/src/controllers/event.js`) - Pedagogical comments explaining patterns
- **Auth Pages** - Examples of "smart auth" and UX patterns
- **Info Cards** - Throughout the app explaining each feature

---

Made while Debourax (who knows knows)
