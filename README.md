<div align="center">
  <h1 align="center">DoIt - Glassmorphic Todo App</h1>
  <p align="center">
    A premium, fully-featured, animated task management application built with specific focus on visual excellence, fluid motion design, and solid functional architecture.
  </p>
</div>

---

## 🎯 The Problem It Solves

Modern task management tools often fall into two opposite extremes: they are either **too simplistic** (a boring, literal list of checkboxes that don't help you prioritize visual data) or **overwhelmingly complex** (corporate-level project tracking software that takes 10 clicks just to save a thought). **DoIt** bridges this massive gap by offering the speed and simplicity of a native checklist, married to the deep analytical power of enterprise tools.

## 🤔 Why Do You Need It?

In an era of deep distraction, a standard piece of paper or a default sticky note app is not enough to truly structure your day. You need:
- **Immediate Context**: Knowing exactly what slice of your life (Health, Work, Personal) demands your attention.
- **Micro-accountability**: Notifications explicitly telling you a deadline is 5 minutes away, rather than a silent red dot.
- **Mental Clarity**: By separating "Overdue" tasks away from "Current" tasks automatically against real-world standard time, you instantly stop getting overwhelmed by the bulk of your backlog.

## 🚀 How Is It Better Than The Rest?

While other todo applications feel like spreadsheets designed for data-entry, **DoIt** is engineered specifically for **fluid psychological momentum**. 
1. **Zero Cognitive Friction:** The entire editing experience happens directly *inline* via dynamic `layout` expansion—no annoying pop-ups blocking your screen when you want to modify a single deadline. 
2. **Live Action Visual Analytics:** Other tools give you text. **DoIt** instantly renders your live, glass-styled `Recharts` Donut breakdown so you can visually digest your task distribution faster than reading.
3. **Liquid Animations:** Powered entirely by `Framer Motion` spring-physics, every single hover, click, dropdown, and task-deletion feels tactile, snappy, and deeply premium rather than static and robotically cheap.

---

## ✨ Features

- **Premium Glassmorphism**: Complete user interface styled with beautiful CSS blurs, subtle borders, and harmonious vibrant gradients to deliver an unparalleled "wow" factor upon load.
- **Dynamic Layout Animations**: Completely fluid UI built on top of `framer-motion`. Tasks seamlessly glide, scale, and snap into place—especially when tasks are added, deleted, or categorized.
- **Categorization & Visual Analytics**: Group tasks efficiently (Work, Personal, Health, etc.) and view your workload instantly via a gorgeous data-driven `recharts` responsive Donut Chart.
- **Live Overdue Tracking**: The system calculates task deadlines against your real-time clock. When a task becomes overdue, it immediately snaps into a separated warning bracket styled in alerts.
- **Native Browser Notifications**: Any task assigned a due date will autonomously alert you via native browser push notifications exactly **5 minutes** before the deadline entirely via local timers.
- **Complete Inline Editor**: Fluidly expand any task to modify titles, descriptions, categories, or local absolute due dates without navigating to new pages or fighting annoying popup modals.
- **Advanced Identity System**: Custom `Supabase` authentication schema mapping localized usernames, passwords (digested via strict `SHA-256`), full identities, and cascade-delete features offering a complete "Delete Account" data-wiping protocol ensuring your privacy.

<br />

## 🛠️ Technology Stack

| Ecosystem | Tool | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19 + TypeScript | Component construction and reliable static typing |
| **Tooling** | Vite | Lightning fast HMR and compilation engine |
| **Styling** | Tailwind CSS + Shadcn UI | Utility-first architecture with radically unstyled reusable primitives |
| **Motion** | Framer Motion | Spring-physics layout animations across entry and interactive states |
| **Data Viz** | Recharts | Live SVG-based composable charting (Category Breakdown) |
| **Backend** | Supabase | PostgreSQL database mapping isolated user schemas and `TIMESTAMPTZ` values |
| **Icons** | Lucide React | Clean, scalable vector icon implementation |

<br />

## 🚀 Quick Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Todo-List.git
cd Todo-List
npm install
```

### 2. Environment Configuration
Create a `.env` file at the root of the project with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Initialization (Supabase SQL Editor)
Run the following SQL snippet inside your Supabase project to generate the required relational schema that powers the cascade functionalities:

```sql
-- 1. Create the Users Table
CREATE TABLE "Users" (
  user_id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  email TEXT,
  age INTEGER
);

-- 2. Create the Todos Table
CREATE TABLE "Todos" (
  todo_id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES "Users"(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'Other',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Start the Application
```bash
npm run dev
```

The application runs seamlessly in `Light Mode` right out of the box with highly specific contrast-tuning, scaling flawlessly between resolutions.

<br />

## 🛡️ Security Note

> Note: For maximum production readiness, this application hashes passwords via a built-in cryptographically secure Web Crypto API (`SHA-256` payload buffering). However, for commercial grade projects, consider migrating to Supabase's fully-managed Auth module to protect against deeper rainbow-table and salt-targeting attacks!

<br />


