# 🧠 LearnSense AI - Intelligent Learning Platform

<div align="center">

![LearnSense AI Logo](https://img.shields.io/badge/LearnSense-AI-blue?style=for-the-badge&logo=brain)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-purple?style=for-the-badge)
![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini-orange?style=for-the-badge&logo=google)

**An advanced AI-powered learning platform that adapts to your learning style and provides personalized educational experiences.**

[Live Demo](#) • [Report Bug](https://github.com/yourusername/learnsense-ai/issues) • [Request Feature](https://github.com/yourusername/learnsense-ai/issues)

</div>

## 📖 About LearnSense AI

LearnSense AI is a cutting-edge intelligent learning platform that leverages Google's Gemini AI to provide personalized educational experiences. Our platform adapts to your learning style, generates custom content, and tracks your progress in real-time.

### 🎯 Key Features

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

## 🎨 Design & Technology

### Visual Design
- **Glassmorphic UI**: Modern glass-morphism design with blur effects
- **Pixel Fonts**: Retro gaming aesthetic with Press Start 2P font
- **Animated Background**: Floating shapes with smooth animations
- **Dark Theme**: Eye-friendly dark color scheme
- **Responsive Layout**: Adapts to all screen sizes

### Technical Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **AI Engine**: Google Gemini 2.0 Flash
- **Styling**: Custom CSS with CSS Variables and Animations
- **Charts**: Chart.js for analytics visualization
- **Icons**: Font Awesome for UI icons
- **Storage**: LocalStorage for user data persistence

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/learnsense-ai.git
   cd learnsense-ai
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. **Get your Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy and paste it into your `.env` file

4. **Run the application**
   
   **Option A: Using a local server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
   
   **Option B: Using Live Server (VS Code)**
   - Install the Live Server extension
   - Right-click `index.html` and select "Open with Live Server"

5. **Open your browser**
   Navigate to `http://localhost:8000`

## 📱 Usage Guide

### Basic Usage
1. **Enter a Topic**: Type any subject you want to learn about
2. **Select Level**: Choose your knowledge level (Beginner to Expert)
3. **Choose Language Style**: Pick how you want the content explained
4. **Click Explain**: Get AI-generated personalized content

### Using AI Tools
- **Generate Quiz**: Creates personalized quizzes on your topic
- **Study Plan**: Get a structured 7-day learning roadmap
- **Code Examples**: Generate practical code demonstrations
- **Mind Map**: Visualize concept relationships
- **Flashcards**: Create interactive study cards
- **Quick Summary**: Get concise key points

### Advanced Features
- **AI Tutor Chat**: Interactive conversation with AI tutor
- **Translate Content**: Convert explanations to any language
- **Video Scripts**: Generate educational video content
- **Podcast Outlines**: Create podcast episode structures

### Tracking Progress
- View your learning statistics in the Analytics section
- Monitor study time and completion rates
- Export your learning history
- Track your knowledge score improvements

## 🔧 Configuration

### Environment Variables
Create a `.env` file with the following variables:

```env
# Required
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional
VITE_APP_NAME=LearnSense AI
VITE_APP_VERSION=1.0.0
VITE_DEFAULT_LANGUAGE=english
VITE_DEV_MODE=true
VITE_DEBUG_MODE=false
```

### Customization
- **Colors**: Modify CSS variables in `style.css`
- **Fonts**: Change font families in the CSS
- **Animations**: Adjust animation timings and effects
- **API Settings**: Modify prompts and AI parameters in `script.js`

## 🏗️ Project Structure

```
learnsense-ai/
├── index.html          # Main application page
├── style.css           # Styling and animations
├── script.js           # Core functionality and AI integration
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── README.md           # Project documentation
└── package.json        # Project metadata and dependencies
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex functionality
- Test your changes thoroughly
- Update documentation as needed

## 📊 API Integration

### Google Gemini AI
The application uses Google's Gemini 2.0 Flash model for generating educational content. The integration includes:

- **Content Generation**: Explanations, quizzes, and study materials
- **Natural Language Processing**: Understanding user queries and context
- **Personalization**: Adapting content to user preferences
- **Multi-language Support**: Translation and localization

### API Rate Limits
- Free tier: 15 requests per minute
- Paid tier: Higher limits available
- Built-in rate limiting to prevent API abuse

## 🔒 Security & Privacy

### Data Protection
- **Local Storage**: All user data stored locally in browser
- **No Server Storage**: No data sent to external servers except API calls
- **API Key Security**: Environment variables keep API keys secure
- **Privacy Focused**: No tracking or analytics beyond basic usage

### Best Practices
- Keep your API key private
- Don't commit `.env` files to version control
- Use HTTPS in production
- Regularly update dependencies

## 🐛 Troubleshooting

### Common Issues

**API Key Error**
```
Error: Unable to generate explanation. Please check your API key.
```
- Solution: Verify your Gemini API key is correctly set in `.env`

**CORS Issues**
- Solution: Use a local server instead of opening files directly

**Content Not Loading**
- Solution: Check internet connection and API status
- Clear browser cache and reload

**Performance Issues**
- Solution: Close unused browser tabs
- Check browser console for errors

### Getting Help
1. Check the [Issues page](https://github.com/yourusername/learnsense-ai/issues)
2. Search existing issues before creating new ones
3. Provide detailed information about your problem
4. Include browser version and error messages

## 🚀 Future Roadmap

### Upcoming Features
- [ ] User accounts and cloud sync
- [ ] Collaborative learning rooms
- [ ] Voice input/output support
- [ ] Integration with learning management systems
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Custom AI model fine-tuning
- [ ] Gamification elements

### Technology Improvements
- [ ] Progressive Web App (PWA)
- [ ] Offline mode support
- [ ] WebAssembly for performance
- [ ] GraphQL API integration
- [ ] Microservices architecture

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini Team** - For the amazing AI capabilities
- **Font Awesome** - For the beautiful icon set
- **Chart.js** - For the analytics visualization
- **Google Fonts** - For the Press Start 2P font
- **The Open Source Community** - For inspiration and tools

## 📞 Contact

- **Project Maintainer**: [Your Name]
- **Email**: your.email@example.com
- **Twitter**: [@yourusername](https://twitter.com/yourusername)
- **LinkedIn**: [Your LinkedIn](https://linkedin.com/in/yourusername)

---

<div align="center">

**⭐ If this project helped you learn something new, give it a star!**

Made with ❤️ and 🧠 by [LearnSense AI Team](https://github.com/yourusername/learnsense-ai)

</div>
