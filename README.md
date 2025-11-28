# 🧠 LearnSense AI - Intelligent Learning Platform

![LearnSense AI Logo](https://img.shields.io/badge/LearnSense-AI-blue?style=for-the-badge&logo=brain)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-purple?style=for-the-badge)
![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini-orange?style=for-the-badge&logo=google)

**AI-powered learning platform with Google Gemini integration for personalized educational experiences.**

LearnSense AI is an AI-powered learning platform built with HTML, CSS, JavaScript, and Google Gemini Flash 2.0. Developed for Version Control Systems coursework to demonstrate Git operations, branching, merging, and conflict handling.

---

## 📁 Directory Structure

```
learnsense-ai/
├── 📄 index.html              # Main application page
├── 🎨 style.css               # Styling and animations
├── ⚙️ script.js               # Core JavaScript functionality
├── 🔧 .env                    # API key configuration
├── 📝 .env.example            # Environment variables template
├── 🚫 .gitignore              # Git ignore rules
├── 📖 README.md               # Project documentation
└── 📸 screenshots/            # Project screenshots
    ├── branch-graph.png
    ├── conflict.png
    └── ui.png
```

---

## 🎯 Key Features

- **🤖 AI-Powered Explanations**: Get personalized explanations tailored to your knowledge level
- **📊 Learning Analytics**: Track your progress with detailed analytics and insights
- **🎯 Adaptive Learning**: Content adapts to your learning pace and style
- **🧠 Smart Recommendations**: Get personalized topic suggestions based on your interests
- **💬 Interactive AI Tutor**: Chat with an AI tutor for personalized guidance
- **🌍 Multi-Language Support**: Learn in your preferred language
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 🛠️ AI Tools & Features

#### Core Learning Tools

- **Topic Explanations**: AI-generated content at beginner, intermediate, advanced, and expert levels
- **Quiz Generator**: Personalized quizzes with instant feedback
- **Study Plans**: Structured 7-day learning roadmaps
- **Code Examples**: Practical code demonstrations for programming topics
- **Mind Maps**: Visual representations of concept connections
- **Flashcards**: Interactive study cards for memorization
- **Quick Summaries**: Concise overviews for rapid review

#### Advanced AI Features

- **AI Tutor Chat**: Interactive Q&A with intelligent tutoring
- **Multi-Language Translation**: Translate content to any language
- **Video Script Generator**: Create educational video content
- **Podcast Outline Creator**: Generate podcast episode structures

#### Analytics & Progress Tracking

- **Learning Statistics**: Track sessions, topics, and performance
- **Progress Charts**: Visual representation of learning journey
- **Study Time Tracking**: Monitor time spent on different topics
- **Completion Rates**: Measure learning effectiveness
- **Knowledge Scoring**: Quantify your learning progress

#### Technical Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **AI Engine**: Google Gemini 2.0 Flash
- **Styling**: Custom CSS with CSS Variables and Animations
- **Charts**: Chart.js for analytics visualization
- **Icons**: Font Awesome for UI icons
- **Storage**: LocalStorage for user data persistence

---

## 🌿 Branch Structure

### 📋 All Branches Created

- **master** - Main production branch
- **feature-explainer** - Topic explanation functionality
- **feature-quiz** - Quiz generation feature
- **feature-studyplan** - Study plan creation
- **experiment-ui** - UI design experiments
- **bugfix-layout** - Layout bug fixes
- **feature-conflict** - Branch created for merge conflict demonstration

### 📊 Branch Visualization
*Screenshot of git branch structure will be shown here*

---

## ✅ BLOCK 1 — Merge Conflict & Resolution

### ⚠️ Conflict Demonstration

**What caused the conflict?**
- Created conflict between `master` and `feature-conflict` branches
- Both modified `<title>` tag in `index.html`

**Steps performed:**

1. **Created conflict branch**

```bash
git checkout -b feature-conflict
git add index.html
git commit -m "Changed title in conflict branch to supercharged by GEMINI to create conflict"
```

1. **Made conflicting change on master**

```bash
git checkout master
git add index.html
git commit -m "Changed title on master branch to Smart Study Partner to create Conflict with the Conflict branch"
```

1. **Triggered conflict**

```bash
git merge feature-conflict
```

**Resolution:**

- Manual conflict resolution in `index.html`
- Final resolved line: `<title>LearnSense AI - Intelligent Learning Platform</title>`
- Committed with: `git add index.html && git commit -m "RESOLVED MERGE CONFLICT MANUALLY in index.html title"`

---

## ✅ BLOCK 2 — Documentation

### 📝 Assignment Requirements

#### 1️⃣ Introduction

*See introduction at the top of this README*

#### 2️⃣ Git Commands Used

## 🧰 All Git Commands Used in This Project

### 🔹 Project Setup

```bash
mkdir learnsense-ai
cd learnsense-ai
git init
```

### 🔹 First Commit

```bash
git add .
git commit -m "initial project skeleton with base files and .gitignore"
```

### 🔹 Branch Creation

```bash
git branch feature-explainer
git branch feature-quiz
git branch feature-studyplan
git branch experiment-ui
git branch bugfix-layout
git branch feature-conflict
```

### 🔹 Switching Branches

```bash
git checkout feature-explainer
git checkout feature-quiz
git checkout feature-studyplan
git checkout experiment-ui
git checkout bugfix-layout
git checkout feature-conflict
```

### 🔹 Committing Changes

```bash
git add .
git commit -m "Meaningful commit message"
```

### 🔹 Merging Branches

```bash
git checkout master
git merge feature-explainer
git merge feature-quiz
git merge feature-studyplan
git merge experiment-ui
git merge bugfix-layout
```

### 🔹 Creating & Resolving Merge Conflict

```bash
git checkout -b feature-conflict
# modify index.html
git commit -m "conflict change"

git checkout master
# modify same line
git commit -m "conflicting change"

git merge feature-conflict
# resolve conflict
git add index.html
git commit -m "RESOLVED MERGE CONFLICT MANUALLY in index.html title"
```

### 🔹 Remote Setup & Push

```bash
git remote add origin https://github.com/ankan123basu/LEARNSENSE-AI.git
git push -u origin master
git push -u origin feature-explainer
git push -u origin feature-quiz
git push -u origin feature-studyplan
git push -u origin experiment-ui
git push -u origin bugfix-layout
git push -u origin feature-conflict
```

### 🔹 View Branch Tree

```bash
git log --oneline --graph --all
git log --graph --decorate --oneline --all
```

#### 3️⃣ Screenshots Required

## 📸 Screenshots

### 🖥️ 1. Project Folder Screenshot

(Add screenshot)

### 🌿 2. Branch List (git branch)

(Add screenshot)

### 🌳 3. Git Graph (git log --oneline --graph --all)

(Add screenshot)

### 📄 4. Merge Conflict Screenshot

(Add screenshot)

### 💾 5. Final Merged Repository on GitHub

(Add screenshot)

#### 4️⃣ Challenges Faced

## 🧩 Challenges Faced

- Faced difficulty switching between branches initially
- Accidentally created wrong branch names (fixed using `git branch -d`)
- Merge conflict was confusing at first, especially conflict markers
- Used Git Bash editor by mistake (solved by pressing `q`)
- Needed multiple attempts to understand `git log` and `git graph` commands

#### 5️⃣ Conclusion

## 🏁 Conclusion

This project helped me learn:

- How Git tracks changes using commits
- Working directory → staging → repository flow
- Creating and managing feature, bugfix, experiment branches
- Performing merges and handling conflicts
- Visualizing repository using Git Bash graph commands
- Connecting a local repo to GitHub and pushing individual branches
- Writing professional documentation using Markdown

This assignment gave me **real-world version control experience**, improving my confidence with Git and Git

#### 6️⃣ Learning Outcomes

- **Use Git Bash for navigation, staging, committing, and history viewing**
- **Understand version control: working directory, staging area, commits**
- **Perform branching, merging, and conflict resolution**
- **Use GitHub for pushing, pulling, cloning, and remote operations**
- **Create documentation using Markdown and follow best practices**

---

## Quick Start

1. **Clone repository**

```bash
git clone https://github.com/ankan123basu/LEARNSENSE-AI.git
cd learnsense-ai
```

1. **Set up API key**

```bash
cp .env.example .env
# Edit .env with your Gemini API key
```

1. **Run application**

```bash
python -m http.server 8000
# Open <http://localhost:8000>
```

---

## 📞 Contact

- **Name**: Ankan Basu
- **University**: Lovely Professional University
- **Email**: ankanbasu10@gmail.com
- **GitHub**: [@ankan123basu](https://github.com/ankan123basu)
- **LinkedIn**: [ankanbasu10](https://www.linkedin.com/in/ankanbasu10/)

---

**⭐ Star this repo if it helped you!**

*Made with ❤️ and 🧠 by [Ankan Basu](https://github.com/ankan123basu)*
