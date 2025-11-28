// ===== GEMINI AI REST API INTEGRATION =====
// Using REST API instead of SDK for better compatibility
// API key loaded from config.js for security

// API Configuration (loaded from config.js)
const API_KEY = window.API_CONFIG?.GEMINI_API_KEY || 'AIzaSyDuTMAMHNSzUaCEZS2fbRAeqcSlisy10HQ';
const API_URL = window.API_CONFIG?.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Global API call function
async function callGeminiAPI(prompt) {
    try {
        // Debug: Check if API key is loaded
        if (!API_KEY) {
            throw new Error('API key is not loaded. Check config.js file.');
        }
        
        console.log('Making API call with key:', API_KEY.substring(0, 10) + '...');
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error Response:', errorData);
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

// ===== GLOBAL STATE MANAGEMENT =====
let learningHistory = [];
let currentTopic = '';
let userStats = {
    totalSessions: 0,
    topicsLearned: 0,
    quizScores: [],
    studyTime: 0,
    streakDays: 0,
    completionRate: 0,
    knowledgeScore: 0
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadUserStats();
    updateStatsDisplay();
    initializeChart();
});

function initializeApp() {
    // Load learning history from localStorage
    learningHistory = JSON.parse(localStorage.getItem('learnHistory')) || [];
    
    // Add enter key support for topic input
    document.getElementById('topicInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            explainTopic();
        }
    });
    
    // Initialize tooltips and interactions
    initializeInteractions();
}

function initializeInteractions() {
    // Add hover effects and micro-interactions
    const toolCards = document.querySelectorAll('.tool-card, .feature-box');
    toolCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// ===== LOADING STATES =====
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('active');
}

// ===== AI EXPLAIN FUNCTION =====
async function explainTopic() {
    const topic = document.getElementById("topicInput").value.trim();
    const level = document.getElementById("levelSelect").value;
    const language = document.getElementById("languageSelect").value;
    
    console.log('explainTopic called with:', { topic, level, language });
    
    if (!topic) {
        showNotification('Please enter a topic to learn about!', 'warning');
        return;
    }
    
    showLoading();
    currentTopic = topic;
    
    try {
        const levelDescriptions = {
            beginner: "simple terms for complete beginners",
            intermediate: "moderately detailed explanations",
            advanced: "technical and in-depth coverage",
            expert: "expert-level comprehensive analysis"
        };
        
        const languageStyles = {
            english: "standard English",
            simple: "simple everyday language",
            technical: "technical terminology",
            metaphor: "using metaphors and analogies"
        };
        
        const prompt = `Explain the topic "${topic}" in ${levelDescriptions[level]} using ${languageStyles[language]}. 
        Include:
        - A clear definition
        - Key concepts and principles
        - Practical examples
        - Common applications
        - Related topics to explore next
        
        Format the response with clear headings and bullet points for easy reading. Keep it comprehensive but accessible.`;
        
        console.log('Sending prompt:', prompt.substring(0, 100) + '...');
        
        const result = await callGeminiAPI(prompt);
        
        console.log('Received result:', result.substring(0, 100) + '...');
        
        document.getElementById("output").innerHTML = formatAIResponse(result);
        
        // Update stats and history
        userStats.totalSessions++;
        userStats.topicsLearned++;
        saveUserStats();
        updateStatsDisplay();
        
        saveHistory(`Explained: ${topic} (${level})`);
        showNotification('Explanation generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error in explainTopic:', error);
        showNotification('Error: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ===== QUIZ GENERATOR =====
async function generateQuiz() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Generate 12 comprehensive quiz questions about "${topic}" with the following format:
        
        For each question provide:
        1. The question (clear and challenging)
        2. 4 multiple choice options (A, B, C, D)
        3. The correct answer
        4. A brief explanation of why it's correct
        
        Format each question like:
        
        Question 1: [Question text]
        A) [Option A]
        B) [Option B]  
        C) [Option C]
        D) [Option D]
        Correct Answer: [Letter]
        Explanation: [Brief explanation]
        
        Include a mix of:
        - 4 easy/beginner questions
        - 4 intermediate questions  
        - 4 advanced questions
        
        Make questions progressively more difficult and cover different aspects of the topic.`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatQuizResponse(result);
        saveHistory(`Quiz Generated on: ${topic}`);
        showNotification('Quiz generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating quiz:', error);
        showNotification('Failed to generate quiz. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// ===== STUDY PLAN CREATOR =====
async function createStudyPlan() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Create a comprehensive 7-day study plan to master "${topic}". For each day include:
        
        Day X: [Theme/Focus Area]
        📚 Learning Objectives: [2-3 specific goals]
        ⏰ Study Time: [Recommended time in hours]
        📖 Topics to Cover: [Detailed list]
        🎯 Practice Activities: [2-3 practical exercises]
        ✅ Check Understanding: [Self-assessment questions]
        
        Make the plan progressive, building from fundamentals to advanced concepts. Include a mix of theory, practice, and review sessions.`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatStudyPlanResponse(result);
        saveHistory(`Study Plan Created: ${topic}`);
        showNotification('Study plan created successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating study plan:', error);
        showNotification('Failed to create study plan. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// ===== CODE EXAMPLES GENERATOR =====
async function generateCodeExample() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Generate practical code examples for "${topic}". Include:
        
        1. A basic implementation example
        2. An intermediate use case
        3. An advanced application
        4. Common patterns and best practices
        5. Error handling examples
        
        For each example provide:
        - Clear comments explaining the code
        - Expected output or behavior
        - Key concepts demonstrated
        
        Use appropriate programming languages for the topic (Python, JavaScript, Java, etc.). Format code blocks properly.`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatCodeResponse(result);
        saveHistory(`Code Examples Generated: ${topic}`);
        showNotification('Code examples generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating code examples:', error);
        showNotification('Failed to generate code examples. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// ===== MIND MAP GENERATOR =====
async function generateMindMap() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Create a comprehensive mind map structure for "${topic}". Organize it as follows:
        
        🧠 CENTER: ${topic}
        
        📍 MAIN BRANCHES (4-6 key areas):
        ├── Branch 1: [Main Concept Area]
        │   ├── Sub-concept 1.1
        │   ├── Sub-concept 1.2
        │   └── Sub-concept 1.3
        ├── Branch 2: [Main Concept Area]
        │   ├── Sub-concept 2.1
        │   └── Sub-concept 2.2
        └── ...
        
        For each sub-concept, include:
        - Brief definition
        - Key relationships
        - Practical applications
        
        Use visual hierarchy with emojis and indentation to show relationships clearly.`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatMindMapResponse(result);
        saveHistory(`Mind Map Generated: ${topic}`);
        showNotification('Mind map generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating mind map:', error);
        showNotification('Failed to generate mind map. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// ===== FLASHCARDS GENERATOR =====
async function generateFlashcards() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Generate 10 interactive flashcards for studying "${topic}". Format each flashcard as:
        
        🎴 Flashcard [Number]
        ❓ Question: [Clear, specific question]
        💭 Hint: [Optional hint]
        ✅ Answer: [Detailed answer]
        📚 Related Concept: [Connected topic]
        
        Make questions progressively challenging and cover different aspects of the topic. Include definitions, problem-solving, and application questions.`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatFlashcardsResponse(result);
        saveHistory(`Flashcards Generated: ${topic}`);
        showNotification('Flashcards generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating flashcards:', error);
        showNotification('Failed to generate flashcards. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// ===== QUICK SUMMARY GENERATOR =====
async function generateSummary() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Create a comprehensive but concise summary of "${topic}". Include:
        
        🎯 Core Concept: [One-sentence definition]
        🔑 Key Points: [3-5 main points]
        💡 Why It Matters: [Practical importance]
        🛠️ Common Applications: [2-3 real-world uses]
        📚 Related Topics: [3 connected concepts]
        ⚡ Quick Facts: [2-3 interesting facts]
        
        Keep it under 300 words total. Use clear, accessible language with emojis for visual organization.`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatSummaryResponse(result);
        saveHistory(`Summary Generated: ${topic}`);
        showNotification('Summary generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating summary:', error);
        showNotification('Failed to generate summary. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// ===== ADVANCED AI FEATURES =====

// AI Tutor Chat
async function openAITutor() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `You are an expert AI tutor specializing in "${topic}". Start an interactive tutoring session by:
        
        1. Greeting the student and introducing yourself
        2. Asking about their current knowledge level
        3. Proposing 3 specific areas they'd like to explore
        4. Offering to answer questions or provide explanations
        
        Make it conversational, encouraging, and adaptive to their needs. Use emojis naturally. Keep your response under 250 words and AVOID using asterisks (*) for emphasis. Use plain text formatting instead.`;
        
        const result = await callGeminiAPI(prompt);
        
        // Remove asterisks from the response
        const cleanResult = result.replace(/\*/g, '');
        
        document.getElementById("extraOutput").innerHTML = formatTutorResponse(cleanResult);
        saveHistory(`AI Tutor Session: ${topic}`);
        showNotification('AI tutor ready!', 'success');
        
    } catch (error) {
        console.error('Error starting AI tutor:', error);
        showNotification('Failed to start AI tutor. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Multi-Language Translation
async function translateContent() {
    const content = document.getElementById("output").innerText;
    
    if (!content || content.includes('Your AI-generated explanation')) {
        showNotification('Please generate content first!', 'warning');
        return;
    }
    
    const targetLanguage = prompt('Enter target language (e.g., Hindi, Bengali, Tamil, Telugu, Spanish, French, German, Chinese):');
    
    if (!targetLanguage) return;
    
    showLoading();
    
    try {
        const prompt = `Translate the following content to ${targetLanguage}. 

Important: If the target language is Hindi, Bengali, Tamil, or Telugu, please provide accurate translations using proper scripts (Devanagari for Hindi, Bengali script for Bengali, Tamil script for Tamil, Telugu script for Telugu). Maintain the structure, formatting, and technical accuracy. Keep any code examples unchanged:

${content}`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatTranslationResponse(result, targetLanguage);
        saveHistory(`Translated to ${targetLanguage}`);
        showNotification(`Content translated to ${targetLanguage}!`, 'success');
        
    } catch (error) {
        console.error('Error translating content:', error);
        showNotification('Failed to translate content. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Video Script Generator
async function generateVideoScript() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Create a 5-minute educational video script about "${topic}". Structure it as:
        
        📹 Video Title: [Catchy, SEO-friendly title]
        ⏱️ Duration: 5 minutes
        
        🎬 Opening (0:30):
        - Hook: [Engaging opening]
        - Introduction: [Brief overview]
        - Learning objectives: [What viewers will learn]
        
        📚 Main Content (3:30):
        - Section 1 (1:00): [Key concept 1 with examples]
        - Section 2 (1:00): [Key concept 2 with examples]  
        - Section 3 (1:30): [Key concept 3 with examples]
        
        🎯 Conclusion (1:00):
        - Summary: [Key takeaways]
        - Call to action: [What to do next]
        - Outro: [Closing remarks]
        
        Include visual cues, on-screen text suggestions, and transition notes.`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatVideoScriptResponse(result);
        saveHistory(`Video Script Created: ${topic}`);
        showNotification('Video script created successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating video script:', error);
        showNotification('Failed to generate video script. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Podcast Outline Generator
async function generatePodcastOutline() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Create a 15-minute podcast episode outline about "${topic}". Structure it as:
        
        🎙️ Episode Title: [Engaging title]
        🎧 Episode Duration: 15 minutes
        👥 Host(s): [Suggested host persona]
        
        📋 Episode Structure:
        
        🎵 Intro Music (0:30)
        🎤 Cold Open (1:00): [Hook or surprising fact]
        🎪 Introduction (1:00): [Topic overview and guest intro]
        
        💬 Main Discussion (10 minutes):
        - Part 1 (3:00): [Background and context]
        - Part 2 (3:00): [Deep dive into key aspects]
        - Part 3 (4:00): [Practical applications and examples]
        
        🎯 Segment Ideas:
        - [Interactive element or listener question]
        - [Myth vs Reality segment]
        - [Expert tip or resource recommendation]
        
        📞 Call to Action (1:30): [Listener engagement]
        🎵 Outro Music (1:00): [Closing and preview]
        
        Include talking points, potential questions, and sound effect suggestions.`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatPodcastResponse(result);
        saveHistory(`Podcast Outline Created: ${topic}`);
        showNotification('Podcast outline created successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating podcast outline:', error);
        showNotification('Failed to generate podcast outline. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// ===== RESPONSE FORMATTERS =====
function formatAIResponse(response) {
    // Remove asterisks and format properly
    const cleanResponse = response.replace(/\*/g, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    
    return `<div class="ai-response fade-in">
        <div class="response-header">
            <i class="fas fa-brain"></i> AI Generated Explanation
        </div>
        <div class="response-content">
            ${cleanResponse}
        </div>
        <div class="response-footer">
            <small>Generated by LearnSense AI • ${new Date().toLocaleString()}</small>
        </div>
    </div>`;
}

function formatQuizResponse(response) {
    const cleanResponse = response.replace(/\*/g, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    
    return `<div class="quiz-response fade-in">
        <div class="response-header">
            <i class="fas fa-question-circle"></i> AI Generated Quiz
        </div>
        <div class="response-content">
            ${cleanResponse}
        </div>
        <div class="quiz-actions">
            <button class="secondary-btn" onclick="printQuiz()">
                <i class="fas fa-print"></i> Print Quiz
            </button>
        </div>
    </div>`;
}

function formatStudyPlanResponse(response) {
    const cleanResponse = response.replace(/\*/g, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    
    return `<div class="study-plan-response fade-in">
        <div class="response-header">
            <i class="fas fa-calendar-alt"></i> Study Plan
        </div>
        <div class="response-content">
            ${cleanResponse}
        </div>
        <div class="plan-actions">
            <button class="secondary-btn" onclick="exportStudyPlan()">
                <i class="fas fa-download"></i> Export Plan
            </button>
        </div>
    </div>`;
}

function formatCodeResponse(response) {
    const cleanResponse = response.replace(/\*/g, '').replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>').replace(/\n/g, '<br>');
    
    return `<div class="code-response fade-in">
        <div class="response-header">
            <i class="fas fa-code"></i> Code Examples
        </div>
        <div class="response-content">
            ${cleanResponse}
        </div>
        <div class="code-actions">
            <button class="secondary-btn" onclick="copyCode()">
                <i class="fas fa-copy"></i> Copy Code
            </button>
        </div>
    </div>`;
}

function formatMindMapResponse(response) {
    const cleanResponse = response.replace(/\*/g, '').replace(/\n/g, '<br>');
    
    return `<div class="mindmap-response fade-in">
        <div class="response-header">
            <i class="fas fa-project-diagram"></i> Mind Map
        </div>
        <div class="response-content">
            <pre style="font-family: 'Courier New', monospace; font-size: 10px; line-height: 1.4;">${cleanResponse}</pre>
        </div>
    </div>`;
}

function formatFlashcardsResponse(response) {
    const cleanResponse = response.replace(/\*/g, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    
    return `<div class="flashcards-response fade-in">
        <div class="response-header">
            <i class="fas fa-layer-group"></i> Study Flashcards
        </div>
        <div class="response-content">
            ${cleanResponse}
        </div>
        <div class="flashcard-actions">
            <button class="secondary-btn" onclick="printFlashcards()">
                <i class="fas fa-print"></i> Print Flashcards
            </button>
        </div>
    </div>`;
}

function formatSummaryResponse(response) {
    const cleanResponse = response.replace(/\*/g, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    
    return `<div class="summary-response fade-in">
        <div class="response-header">
            <i class="fas fa-compress-alt"></i> Quick Summary
        </div>
        <div class="response-content">
            ${cleanResponse}
        </div>
    </div>`;
}

function formatTutorResponse(response) {
    // Remove asterisks and other markdown formatting
    const cleanResponse = response.replace(/\*/g, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    
    return `<div class="tutor-response fade-in">
        <div class="response-header">
            <i class="fas fa-comments"></i> AI Tutor Chat
        </div>
        <div class="response-content">
            ${cleanResponse}
        </div>
        <div class="tutor-actions">
            <button class="secondary-btn" onclick="continueTutorChat()">
                <i class="fas fa-reply"></i> Continue Chat
            </button>
        </div>
    </div>`;
}

function formatTranslationResponse(response, language) {
    const cleanResponse = response.replace(/\*/g, '').replace(/\n/g, '<br>');
    
    return `<div class="translation-response fade-in">
        <div class="response-header">
            <i class="fas fa-language"></i> Translated to ${language}
        </div>
        <div class="response-content">
            ${cleanResponse}
        </div>
    </div>`;
}

function formatVideoScriptResponse(response) {
    const cleanResponse = response.replace(/\*/g, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    
    return `<div class="video-script-response fade-in">
        <div class="response-header">
            <i class="fas fa-video"></i> Video Script
        </div>
        <div class="response-content">
            ${cleanResponse}
        </div>
        <div class="script-actions">
            <button class="secondary-btn" onclick="exportScript()">
                <i class="fas fa-download"></i> Export Script
            </button>
        </div>
    </div>`;
}

function formatPodcastResponse(response) {
    const cleanResponse = response.replace(/\*/g, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    
    return `<div class="podcast-response fade-in">
        <div class="response-header">
            <i class="fas fa-podcast"></i> Podcast Outline
        </div>
        <div class="response-content">
            ${cleanResponse}
        </div>
        <div class="podcast-actions">
            <button class="secondary-btn" onclick="exportPodcastOutline()">
                <i class="fas fa-download"></i> Export Outline
            </button>
        </div>
    </div>`;
}

// ===== HISTORY MANAGEMENT =====
function saveHistory(entry) {
    const timestamp = new Date().toISOString();
    learningHistory.push({ entry, timestamp });
    localStorage.setItem("learnHistory", JSON.stringify(learningHistory));
}

function showHistory() {
    if (learningHistory.length === 0) {
        document.getElementById("extraOutput").innerHTML = `
            <div class="history-empty">
                <i class="fas fa-history"></i>
                <p>No learning history yet. Start exploring topics to build your history!</p>
            </div>
        `;
        return;
    }
    
    let historyHTML = `<div class="history-content">
        <div class="response-header">
            <i class="fas fa-history"></i> Learning History
        </div>
        <div class="history-list">`;
    
    learningHistory.slice().reverse().forEach((item, index) => {
        const date = new Date(item.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        historyHTML += `
            <div class="history-item">
                <div class="history-entry">${item.entry}</div>
                <div class="history-timestamp">${formattedDate}</div>
            </div>
        `;
    });
    
    historyHTML += `</div></div>`;
    document.getElementById("extraOutput").innerHTML = historyHTML;
}

function exportHistory() {
    if (learningHistory.length === 0) {
        showNotification('No history to export!', 'warning');
        return;
    }
    
    const historyText = learningHistory.map(item => 
        `${item.timestamp}: ${item.entry}`
    ).join('\n');
    
    const blob = new Blob([historyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learnsense-history-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    
    showNotification('History exported successfully!', 'success');
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all learning history? This cannot be undone.')) {
        learningHistory = [];
        localStorage.removeItem("learnHistory");
        document.getElementById("extraOutput").innerHTML = `
            <div class="history-empty">
                <i class="fas fa-trash"></i>
                <p>Learning history cleared.</p>
            </div>
        `;
        showNotification('History cleared successfully!', 'success');
    }
}

// ===== USER STATS MANAGEMENT =====
function saveUserStats() {
    localStorage.setItem("userStats", JSON.stringify(userStats));
}

function loadUserStats() {
    const savedStats = localStorage.getItem("userStats");
    if (savedStats) {
        userStats = JSON.parse(savedStats);
    }
}

function updateStatsDisplay() {
    // Check if stats elements exist (they were replaced with images)
    const totalSessionsEl = document.getElementById("totalSessions");
    const topicsLearnedEl = document.getElementById("topicsLearned");
    const quizScoreEl = document.getElementById("quizScore");
    
    if (totalSessionsEl) totalSessionsEl.textContent = userStats.totalSessions;
    if (topicsLearnedEl) topicsLearnedEl.textContent = userStats.topicsLearned;
    if (quizScoreEl) {
        const avgScore = userStats.quizScores.length > 0 
            ? Math.round(userStats.quizScores.reduce((a, b) => a + b, 0) / userStats.quizScores.length)
            : 0;
        quizScoreEl.textContent = avgScore + '%';
    }
    
    // These elements are in the analytics section
    const totalTimeEl = document.getElementById("totalTime");
    const completionRateEl = document.getElementById("completionRate");
    const streakDaysEl = document.getElementById("streakDays");
    const knowledgeScoreEl = document.getElementById("knowledgeScore");
    
    if (totalTimeEl) totalTimeEl.textContent = formatTime(userStats.studyTime);
    if (completionRateEl) completionRateEl.textContent = userStats.completionRate + '%';
    if (streakDaysEl) streakDaysEl.textContent = userStats.streakDays;
    if (knowledgeScoreEl) knowledgeScoreEl.textContent = userStats.knowledgeScore;
    
    // Update chart with new data
    updateChart();
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

// ===== CHART INITIALIZATION =====
let progressChart = null;

function initializeChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (progressChart) {
        progressChart.destroy();
    }
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Learning Progress',
                data: generateProgressData(),
                borderColor: '#00ffe7',
                backgroundColor: 'rgba(0, 255, 231, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#cccccc',
                        font: {
                            family: 'Press Start 2P',
                            size: 8
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#cccccc',
                        font: {
                            family: 'Press Start 2P',
                            size: 8
                        }
                    }
                }
            }
        }
    });
}

function generateProgressData() {
    // Generate realistic progress data based on user stats
    const baseProgress = userStats.totalSessions * 5; // 5 points per session
    const topicsBonus = userStats.topicsLearned * 10; // 10 points per topic
    const totalProgress = Math.min(baseProgress + topicsBonus, 100);
    
    // Create a realistic progression
    const data = [];
    let current = 0;
    const increment = totalProgress / 4;
    
    for (let i = 0; i < 4; i++) {
        current = Math.min(current + increment + Math.random() * 10, 100);
        data.push(Math.round(current));
    }
    
    return data;
}

function updateChart() {
    if (progressChart) {
        progressChart.data.datasets[0].data = generateProgressData();
        progressChart.update();
    }
}

// ===== UTILITY FUNCTIONS =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fade-in`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function printQuiz() {
    window.print();
}

function printFlashcards() {
    window.print();
}

function copyCode() {
    const codeText = document.querySelector('.code-response pre').textContent;
    navigator.clipboard.writeText(codeText).then(() => {
        showNotification('Code copied to clipboard!', 'success');
    });
}

function exportStudyPlan() {
    const planText = document.querySelector('.study-plan-response .response-content').textContent;
    downloadFile(planText, 'study-plan.txt');
}

function exportScript() {
    const scriptText = document.querySelector('.video-script-response .response-content').textContent;
    downloadFile(scriptText, 'video-script.txt');
}

function exportPodcastOutline() {
    const outlineText = document.querySelector('.podcast-response .response-content').textContent;
    downloadFile(outlineText, 'podcast-outline.txt');
}

function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('File downloaded successfully!', 'success');
}

function continueTutorChat() {
    const question = prompt('Ask your question to the AI tutor:');
    if (!question) return;
    
    showLoading();
    
    // Store current conversation context
    const currentTopic = document.getElementById("topicInput").value.trim() || 'the current topic';
    
    // Call the actual API for a real response
    callGeminiAPI(`As an expert AI tutor for "${currentTopic}", answer this student question: "${question}". Be conversational, clear, and encouraging. Use emojis naturally. Keep your response under 200 words and avoid using asterisks (*) for emphasis. Use plain text formatting instead.`)
        .then(response => {
            // Remove asterisks and format properly
            const cleanResponse = response.replace(/\*/g, '');
            
            document.getElementById("extraOutput").innerHTML += `
                <div class="tutor-message fade-in">
                    <strong>You:</strong> ${question}<br>
                    <strong>AI Tutor:</strong> ${cleanResponse}
                </div>
            `;
            hideLoading();
            saveHistory(`Tutor Q&A: ${question}`);
        })
        .catch(error => {
            console.error('Error in tutor chat:', error);
            document.getElementById("extraOutput").innerHTML += `
                <div class="tutor-message fade-in">
                    <strong>You:</strong> ${question}<br>
                    <strong>AI Tutor:</strong> I apologize, but I'm having trouble responding right now. Please try again.
                </div>
            `;
            hideLoading();
        });
}

// ===== UTILITY FUNCTIONS FOR PAGES =====
function showAbout() {
    alert('LearnSense AI v1.0\n\nAn intelligent learning platform powered by Google Gemini AI.\n\nFeatures:\n• AI-powered explanations\n• Personalized quizzes\n• Study plans\n• Code examples\n• Mind maps\n• Flashcards\n• And much more!');
}

function showHelp() {
    alert('How to use LearnSense AI:\n\n1. Enter a topic you want to learn about\n2. Select your knowledge level\n3. Click "Explain Topic" for AI-generated content\n4. Use the AI tools for enhanced learning\n5. Track your progress in the analytics section\n\nFor API setup, check the README file.');
}

function showSettings() {
    alert('Settings coming soon!\n\nFuture features:\n• Custom API key configuration\n• Theme customization\n• Learning preferences\n• Notification settings');
}
