# Meta-University-Capstone
Final Passion Project

## **Overview**

**Bloom** is a wellness app that combines daily mood check-ins, journaling, and habit tracking with a personalized plant that grows as users stay engaged. It pairs a clean UI with data-aware nudges (recommendation banners) to help users build healthier routines without feeling overwhelmed.

---

## **Product Specification**

* **Platform:** Web (responsive)
* **Frontend:** React
* **Backend:** Node.js + Express
* **Database:** PostgreSQL (Prisma)
* **Auth:** JWT + Google OAuth
* **Performance:** **Custom LRU Caching** (limits repeated DB queries)
* **Realtime:** **WebSockets (bidirectional, event-driven)**
* **APIs Used:** **Bloomberg APIs**, **Gemini 2.0**
* **Custom Service:** **Daily Quotes API** (in-app, returns random quotes)

---

## **Core Features — MVP**

* ✅ **Account & Security:** Sign up, sign in, sign out; protected routes; secure token handling.
* ✅ **Journaling:** Create, edit, and delete journal entries for reflection.
* ✅ **Mood Check-ins:** Log a daily mood and **view your mood history** over time.
* ✅ **Plant Growth:** See a **virtual plant** grow as you stay engaged.
* ✅ **Habits:** Add new habits and **delete habits** you no longer want to track.

---

## **Stretch Features**

* ✅ **Appearance:** Toggle **dark mode / light mode**.
* ✅ **Quotes:** See **random daily quotes** (via the custom Daily Quotes API).
* ✅ **Insights:** View **charts/visualizations** of mood trends.
* ✅ **AI Chatbot:** Chat with an **AI wellness assistant** (Gemini 2.0).
* ✅ **Social Feed (preview):** View updates from connections.
* ✅ **Profile:** Change profile photo and **save account changes**.
* ✅ **Advanced Views:** Browse **other mood logs** and related insights.

---

## **Technical Challenges**

### **1) Recommendation Banner System**

A behavior-aware system that ranks which banner to show using a **weighted scoring model**. Signals include mood consistency, habit streaks, journaling recency, and comeback behavior. Scores **decay over time** using a mathematical **decay constant**, so older activity loses influence unless reinforced. The highest-priority banner surfaces first; cool-downs prevent repetition.

### **2) Personalized Plant Growth Logic**

Growth isn’t tied to a single fixed threshold. Instead, it evaluates a user’s recent engagement pattern (mood logs, journaling, habit completion) and advances plant stages based on sustained activity, making progress feel earned and personal.

### **3) Social Feed & Dynamic User Recommendations**

A lightweight social layer powered by **WebSockets** for live updates. A **dynamic recommendation** routine suggests connections using activity similarity and shared habits—kept intentionally minimal to avoid clutter, while still useful.

---

## **Security**

* JWT auth with expiration; Google OAuth.
* Bcrypt password hashing.
* Auth middleware for protected routes.
* Input validation & sanitization (helps prevent XSS/SQLi).
* Principle of least privilege for future admin roles.

---

## **Setup & Installation **

```bash
# Clone
git clone https://github.com/yourusername/bloom.git
cd bloom

# Install
cd server && npm install
cd ../client && npm install

# Env
cp .env.example .env
# Add: DATABASE_URL, JWT_SECRET, GOOGLE_OAUTH keys, GEMINI keys, etc.

# Run
cd server && npm run dev
# in a new terminal
cd client && npm start
```

---

## **Future Enhancements**

* Deeper insights (weekly summaries, comparative trends).
* Export reports (PDF/CSV) for mood and habit history.
* Collaborative challenges and shared garden modes.
* Smarter, context-aware quote selection tied to mood patterns.

---
Link to my Google doc

https://docs.google.com/document/d/1yApXW_fFCeYx7zu1no3G8mt6XkqxwC2zeUROsKsnLjc/edit?usp=sharing
