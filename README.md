#  ⚡WeekWise

WeekWise is a minimalist, local-first academic workspace designed to help students track tasks, manage lecture retention, and structure a 15-week semester timeline efficiently. Built with a premium, high-fidelity dark interface inspired by modern developer IDEs and SaaS tools.

## 🚀 Features

- **Dynamic 15-Week Timeline Navigation:** Smooth, segmented sidebar routing optimized for dividing coursework into targeted preparation cycles (Mid-Terms, Revisions, Finals).
- **Local-First Architecture:** Powered by **IndexedDB** via **Dexie.js** for blistering fast queries, persistent state, and full offline-capability. No cloud synchronization bottlenecks.
- **Global Index Search (`Ctrl + K`):** Instantly parse and query through every log, task, and note across all 15 weeks in milliseconds from anywhere in the application.
- **Widescreen Analytics Dashboard:**
  - Real-time **Checklist Completion** gauges.
  - Live **Lecture Retention Rate** progress indicators.
  - Click-activated **Interactive Day-Streak Engine**.
- **Contextual Sidebar Modules:**
  - **Upcoming Deadlines Scanner:** Automatically scans the entire database schema to surface incomplete assignments or high-priority exam targets.
  - **Weekly Timetable Tracker:** A lightweight, persistent calendar schedule logger mapped down to individual days.
  - **Focus Tip Generator:** Random cycle engine delivering technical/motivational metrics to maintain study momentum.

## 🛠️ Tech Stack

- **Framework:** (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Database Layer:** Dexie.js (Wrapper for browser IndexedDB)
- **Icons / Theme:** Zinc / Emerald / Amber palette (Custom Dark UI)

## 📦 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your local environment.
