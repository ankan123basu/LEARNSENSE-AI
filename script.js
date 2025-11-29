// ===== GEMINI AI REST API INTEGRATION =====
// Using REST API instead of SDK for better compatibility
// API key loaded from config.js for security

// API Configuration (loaded from config.js)
const API_KEY = window.API_CONFIG?.GEMINI_API_KEY;
const API_URL = window.API_CONFIG?.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Global API call function
async function callGeminiAPI(prompt) {
    try {
        // Debug: Check if API key is loaded
        if (!API_KEY) {
            throw new Error('API key not found. Ensure config.js is loaded before script.js');
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
            
            // Extract detailed error message
            let errorMessage = `API Error: ${response.status}`;
            if (errorData.error && errorData.error.message) {
                errorMessage += ` - ${errorData.error.message}`;
            } else if (errorData.error && errorData.error.status) {
                errorMessage += ` - ${errorData.error.status}`;
            }
            
            throw new Error(errorMessage);
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
        const prompt = `Generate 10 flashcards for studying "${topic}". Return ONLY valid JSON in this exact format:

{
    "flashcards": [
        {
            "number": 1,
            "question": "What is Java?",
            "hint": "Think about programming languages",
            "answer": "Java is a high-level, object-oriented programming language",
            "related": "Programming languages"
        },
        {
            "number": 2,
            "question": "What is a variable in Java?",
            "hint": "Storage for data",
            "answer": "A variable is a container that holds data values in Java",
            "related": "Data types"
        }
    ]
}

Generate 10 cards about "${topic}" with progressively challenging questions. Include definitions, concepts, and applications. RETURN ONLY THE JSON - NO OTHER TEXT.`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = createVisualFlashcards(result, topic);
        saveHistory(`Flashcards Generated: ${topic}`);
        showNotification('Visual flashcards generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating flashcards:', error);
        showNotification('Failed to generate flashcards. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// ===== VISUAL FLASHCARDS =====
function createVisualFlashcards(result, topic) {
    try {
        console.log('Raw flashcard result:', result);
        
        let flashcards;
        
        // Try to parse as JSON
        try {
            // Clean the result first - remove any extra text
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : result;
            flashcards = JSON.parse(jsonString);
            console.log('Parsed flashcards:', flashcards);
        } catch (e) {
            console.log('JSON parsing failed, trying text extraction:', e);
            // If JSON parsing fails, extract from text
            flashcards = extractFlashcardsFromText(result);
            console.log('Extracted flashcards from text:', flashcards);
        }
        
        if (!flashcards || !flashcards.flashcards || flashcards.flashcards.length === 0) {
            console.error('No flashcards found, creating fallback');
            // Create fallback flashcards
            flashcards = createFallbackFlashcards(topic);
        }
        
        let html = `
            <div class="flashcards-header">
                <h3>🎴 Visual Flashcards: ${topic}</h3>
                <p>Interactive study cards for learning</p>
            </div>
            <div class="flashcards-container">
        `;
        
        flashcards.flashcards.forEach((card, index) => {
            html += `
                <div class="flashcard" onclick="flipCard(${index})" id="flashcard-${index}">
                    <div class="flashcard-front">
                        <div class="flashcard-number">${card.number || index + 1}</div>
                        <div class="flashcard-question">${card.question || 'Question here'}</div>
                        ${card.hint ? `<div class="flashcard-hint">💭 Hint: ${card.hint}</div>` : ''}
                    </div>
                    <div class="flashcard-back">
                        <div class="flashcard-number">${card.number || index + 1}</div>
                        <div class="flashcard-answer">${card.answer || 'Answer here'}</div>
                        ${card.related ? `<div class="flashcard-hint">📚 Related: ${card.related}</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
        
    } catch (error) {
        console.error('Error creating visual flashcards:', error);
        return `<div class="error">Error creating flashcards: ${error.message}</div>`;
    }
}

function createFallbackFlashcards(topic) {
    return {
        flashcards: [
            {
                number: 1,
                question: `What is ${topic}?`,
                hint: "Think about the basic definition",
                answer: `${topic} is a fundamental concept that students need to understand`,
                related: "Basic concepts"
            },
            {
                number: 2,
                question: `Why is ${topic} important?`,
                hint: "Think about real-world applications",
                answer: `${topic} is important because it has practical applications in various fields`,
                related: "Applications"
            },
            {
                number: 3,
                question: `How does ${topic} work?`,
                hint: "Think about the mechanism",
                answer: `${topic} works through specific principles and processes`,
                related: "Mechanisms"
            }
        ]
    };
}

function extractFlashcardsFromText(text) {
    const flashcards = { flashcards: [] };
    const lines = text.split('\n');
    let currentCard = {};
    let cardNumber = 0;
    
    console.log('Extracting from text lines:', lines);
    
    lines.forEach(line => {
        line = line.trim();
        
        // Multiple patterns for different formats
        if (line.includes('🎴 Flashcard') || line.includes('Flashcard') || line.includes('Card')) {
            if (Object.keys(currentCard).length > 0) {
                flashcards.flashcards.push({...currentCard, number: cardNumber});
                currentCard = {};
            }
            cardNumber++;
        } else if (line.includes('❓ Question:') || line.includes('Question:') || line.includes('Q:')) {
            currentCard.question = line.replace(/❓ Question:|Question:|Q:/gi, '').trim();
        } else if (line.includes('💭 Hint:') || line.includes('Hint:')) {
            currentCard.hint = line.replace(/💭 Hint:|Hint:/gi, '').trim();
        } else if (line.includes('✅ Answer:') || line.includes('Answer:') || line.includes('A:')) {
            currentCard.answer = line.replace(/✅ Answer:|Answer:|A:/gi, '').trim();
        } else if (line.includes('📚 Related:') || line.includes('Related:')) {
            currentCard.related = line.replace(/📚 Related:|Related:/gi, '').trim();
        }
    });
    
    if (Object.keys(currentCard).length > 0) {
        flashcards.flashcards.push({...currentCard, number: cardNumber});
    }
    
    console.log('Extracted flashcards:', flashcards);
    return flashcards;
}

function flipCard(index) {
    const card = document.getElementById(`flashcard-${index}`);
    if (card) {
        card.classList.toggle('flipped');
        console.log(`Flipped card ${index}`);
    } else {
        console.error(`Card ${index} not found`);
    }
}

// ===== NEW AI FEATURES =====
// ===== ENHANCED VOICE SUPPORT =====
async function speakTextWithExternalTTS(text, language) {
    // Try Google Translate TTS for Indian languages with different endpoint
    const langCodes = {
        'hindi': 'hi',
        'telugu': 'te', 
        'tamil': 'ta',
        'bengali': 'bn',
        'english': 'en',
        'spanish': 'es',
        'french': 'fr',
        'german': 'de',
        'chinese': 'zh'
    };
    
    const langCode = langCodes[language.toLowerCase()];
    
    if (langCode && langCode === 'hi') {
        // Try multiple Google TTS endpoints for Hindi only
        const endpoints = [
            `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(text)}`,
            `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=gtx&q=${encodeURIComponent(text)}`,
            `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&q=${encodeURIComponent(text)}`
        ];
        
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying TTS endpoint: ${endpoint}`);
                const audio = new Audio();
                audio.src = endpoint;
                await audio.play();
                console.log(`TTS successful with ${langCode}`);
                return true;
            } catch (error) {
                console.log(`TTS endpoint failed:`, error);
                continue;
            }
        }
        
        console.log('All TTS endpoints failed, trying Web Speech API');
        return false;
    }
    
    return false;
}

async function generateVoiceExplanation() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    // Ask for language preference
    const targetLanguage = prompt('Enter voice language (e.g., English, Hindi, Spanish, French, German, Chinese):');
    
    if (!targetLanguage) return;
    
    showLoading();
    
    try {
        // Generate explanation first
        const prompt = `Explain "${topic}" in simple terms for voice output in ${targetLanguage}. Keep it concise (2-3 paragraphs) and easy to read aloud. Use clear, simple language suitable for text-to-speech.`;
        const explanation = await callGeminiAPI(prompt);
        
        let useExternalTTS = false;
        
        // Check if we need external TTS for Hindi only
        if (targetLanguage.toLowerCase() === 'hindi') {
            useExternalTTS = await speakTextWithExternalTTS(explanation, targetLanguage);
        }
        
        // Use Web Speech API if external TTS failed or not needed
        if (!useExternalTTS && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(explanation);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // Load voices and try to find matching voice
            let voices = speechSynthesis.getVoices();
            
            // If voices aren't loaded, wait for them
            if (voices.length === 0) {
                await new Promise(resolve => {
                    speechSynthesis.onvoiceschanged = resolve;
                    setTimeout(resolve, 1000); // Fallback timeout
                });
                voices = speechSynthesis.getVoices();
            }
            
            console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
            
            // Try to set voice for the language
            const voice = voices.find(v => 
                v.lang.toLowerCase().includes(targetLanguage.toLowerCase()) ||
                v.name.toLowerCase().includes(targetLanguage.toLowerCase())
            );
            
            if (voice) {
                utterance.voice = voice;
                console.log(`Using voice: ${voice.name} (${voice.lang})`);
                speechSynthesis.speak(utterance);
            } else {
                // Try common language codes
                const langCodes = {
                    'hindi': 'hi-IN',
                    'telugu': 'te-IN',
                    'tamil': 'ta-IN',
                    'bengali': 'bn-IN',
                    'spanish': 'es-ES',
                    'french': 'fr-FR',
                    'german': 'de-DE',
                    'chinese': 'zh-CN'
                };
                
                const langCode = langCodes[targetLanguage.toLowerCase()];
                if (langCode) {
                    utterance.lang = langCode;
                    console.log(`Trying language code: ${langCode}`);
                    speechSynthesis.speak(utterance);
                } else {
                    // Show available languages and use English
                    showNotification(`Voice not available for ${targetLanguage}. Using English. Check console for available languages.`, 'warning');
                    speechSynthesis.speak(utterance);
                }
            }
        }
        
        const ttsMethod = useExternalTTS ? 'External TTS' : 'Web Speech API';
        
        document.getElementById("output").innerHTML = `
            <div class="voice-output">
                <h3>🎤 AI Voice Tutor: ${topic} (${targetLanguage})</h3>
                <p class="voice-text">${explanation}</p>
                <div class="voice-info">
                    <small>🔊 Using: ${ttsMethod}</small>
                </div>
                <div class="voice-controls">
                    <button onclick="speakAgain()" class="primary-btn">
                        <i class="fas fa-redo"></i> Speak Again
                    </button>
                    <button onclick="stopSpeaking()" class="secondary-btn">
                        <i class="fas fa-stop"></i> Stop
                    </button>
                    <button onclick="changeVoiceLanguage()" class="secondary-btn">
                        <i class="fas fa-globe"></i> Change Language
                    </button>
                    <button onclick="showAvailableVoices()" class="secondary-btn">
                        <i class="fas fa-list"></i> Available Voices
                    </button>
                </div>
            </div>
        `;
        
        saveHistory(`Voice Explanation: ${topic} (${targetLanguage})`);
        showNotification(`Voice explanation playing in ${targetLanguage}!`, 'success');
        
    } catch (error) {
        console.error('Error generating voice explanation:', error);
        showNotification('Failed to generate voice explanation. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function showAvailableVoices() {
    const voices = speechSynthesis.getVoices();
    const voiceList = voices.map(v => `${v.name} (${v.lang})`).join('\n');
    console.log('Available voices:\n' + voiceList);
    alert(`Available voices:\n${voiceList}`);
}

function changeVoiceLanguage() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    if (topic) {
        generateVoiceExplanation();
    }
}

async function generateConceptMap() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Create a visual concept map for "${topic}". Format as hierarchical text with indentation and connections:
        
        🧠 ${topic}
        ├── Main Concept 1
        │   ├── Sub-concept 1.1
        │   │   └── Detail 1.1.1
        │   └── Sub-concept 1.2
        ├── Main Concept 2
        │   ├── Sub-concept 2.1
        │   └── Sub-concept 2.2
        └── Main Concept 3
            └── Sub-concept 3.1
        
        Use emojis and clear hierarchy. Show relationships between concepts.`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = `
            <div class="concept-map">
                <h3>🗺️ Concept Map: ${topic}</h3>
                <pre class="map-content">${result}</pre>
            </div>
        `;
        
        saveHistory(`Concept Map: ${topic}`);
        showNotification('Concept map generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating concept map:', error);
        showNotification('Failed to generate concept map. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function generatePracticeProblems() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Generate 8 practice problems for "${topic}". Include a mix of:
        - Multiple choice questions
        - Short answer questions  
        - Problem-solving exercises
        - Real-world applications
        
        Format each problem with:
        📝 Problem [Number]: [Question]
        🎯 Type: [Multiple Choice/Short Answer/Problem Solving]
        💡 Difficulty: [Easy/Medium/Hard]
        ✅ Answer: [Detailed solution]
        📚 Explanation: [Why this answer is correct]`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatPracticeProblems(result);
        saveHistory(`Practice Problems: ${topic}`);
        showNotification('Practice problems generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating practice problems:', error);
        showNotification('Failed to generate practice problems. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// ===== NEW AI LEARNING TOOLS =====
async function generateKeyTerms() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Extract and explain the 15 most important key terms and vocabulary for "${topic}". Format as:

📚 Key Terms for ${topic}

1. **Term Name**
   📝 Definition: [Clear definition]
   💡 Example: [Practical example]
   🔗 Related: [Connected concepts]

2. **Next Term**
   📝 Definition: [Clear definition]
   💡 Example: [Practical example]
   🔗 Related: [Connected concepts]

Include essential terminology, concepts, and jargon students must know.`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatKeyTerms(result);
        saveHistory(`Key Terms: ${topic}`);
        showNotification('Key terms generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating key terms:', error);
        showNotification('Failed to generate key terms. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function generateFAQ() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Generate 12 frequently asked questions and detailed answers about "${topic}". Format as:

❓ FAQ: ${topic}

**Q1: [Common question beginners ask]**
A: [Comprehensive, detailed answer with examples]

**Q2: [Another important question]**
A: [Thorough explanation]

Include questions about:
- Basic concepts and definitions
- Common misconceptions
- Practical applications
- Learning resources
- Career relevance
- Advanced topics`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatFAQ(result);
        saveHistory(`FAQ: ${topic}`);
        showNotification('FAQ generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating FAQ:', error);
        showNotification('Failed to generate FAQ. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function generateExamples() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Generate 10 real-world examples and practical applications of "${topic}". For each example include:

🌍 Real Examples: ${topic}

**Example 1: [Specific application]**
- 🏢 Industry/Context: [Where this is used]
- 🔧 How it works: [Practical implementation]
- 💡 Impact: [Why it matters]
- 📚 Learning value: [What students can learn]

**Example 2: [Another application]**
- 🏢 Industry/Context: [Where this is used]
- 🔧 How it works: [Practical implementation]
- 💡 Impact: [Why it matters]
- 📚 Learning value: [What students can learn]

Include diverse examples from different industries and contexts.`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatExamples(result);
        saveHistory(`Real Examples: ${topic}`);
        showNotification('Real examples generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating examples:', error);
        showNotification('Failed to generate examples. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function generateCheatSheet() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Create a comprehensive cheat sheet for "${topic}". Format as:

📋 Cheat Sheet: ${topic}

**🎯 Quick Overview:**
- One-line definition
- Key purpose/use case
- Main benefit

**⚡ Key Concepts:**
- 5-7 essential concepts
- Brief explanation for each
- Common misconceptions

**🔧 Syntax/Structure:**
- Basic format/syntax
- Common patterns
- Best practices

**💡 Pro Tips:**
- 3-5 expert tips
- Common mistakes to avoid
- Time-saving shortcuts

**📚 Quick Reference:**
- Important commands/functions
- Useful resources
- Related topics

Keep it concise and easy to scan.`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatCheatSheet(result);
        saveHistory(`Cheat Sheet: ${topic}`);
        showNotification('Cheat sheet generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating cheat sheet:', error);
        showNotification('Failed to generate cheat sheet. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function generateInterviewCoach() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Create an AI interview coach session for "${topic}". Include:

🎤 Interview Coach: ${topic}

**📋 Common Interview Questions:**
1. [Beginner question]
   - Expected answer
   - Key points to mention

2. [Intermediate question]
   - Expected answer
   - Technical depth required

3. [Advanced question]
   - Expected answer
   - Expert-level insights

**💼 Scenario-based Questions:**
- Real-world problem scenarios
- Step-by-step approach
- Evaluation criteria

**🎯 Pro Tips:**
- How to structure answers
- What interviewers look for
- Red flags to avoid

**📝 Practice Framework:**
- STAR method examples
- Confidence-building techniques
- Follow-up question preparation`;

        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatInterviewCoach(result);
        saveHistory(`Interview Coach: ${topic}`);
        showNotification('Interview coach session ready!', 'success');
        
    } catch (error) {
        console.error('Error generating interview coach:', error);
        showNotification('Failed to generate interview coach. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// ===== NEW ADVANCED AI FEATURES =====
async function generateWritingHelp() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Provide comprehensive writing assistance for "${topic}". Include:

✍️ AI Writing Assistant: ${topic}

📝 **Essay Structure:**
- Introduction hooks and thesis statement examples
- Body paragraph organization
- Conclusion strategies

🎯 **Key Arguments:**
- Main points to cover
- Supporting evidence ideas
- Counterarguments to address

📚 **Research Guidance:**
- Important sources to consider
- Data and statistics to include
- Expert opinions to reference

✨ **Writing Tips:**
- Style recommendations
- Common mistakes to avoid
- Vocabulary suggestions

🔍 **Quality Checklist:**
- Elements to review before submission`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatWritingHelp(result);
        saveHistory(`Writing Help: ${topic}`);
        showNotification('Writing assistance generated!', 'success');
        
    } catch (error) {
        console.error('Error generating writing help:', error);
        showNotification('Failed to generate writing help. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function generateLearningPath() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Create a comprehensive learning path for mastering "${topic}". Structure as:

🛤️ Learning Path: ${topic}

**Phase 1: Foundation (Weeks 1-2)**
🎯 Goals: [Learning objectives]
📚 Topics: [Fundamental concepts]
🛠️ Activities: [Practical exercises]
✅ Milestone: [Achievement marker]

**Phase 2: Intermediate (Weeks 3-4)**
🎯 Goals: [Learning objectives]
📚 Topics: [Intermediate concepts]
🛠️ Activities: [Hands-on projects]
✅ Milestone: [Achievement marker]

**Phase 3: Advanced (Weeks 5-6)**
🎯 Goals: [Learning objectives]
📚 Topics: [Advanced concepts]
🛠️ Activities: [Complex projects]
✅ Milestone: [Achievement marker]

**Phase 4: Mastery (Weeks 7-8)**
🎯 Goals: [Learning objectives]
📚 Topics: [Expert-level concepts]
🛠️ Activities: [Real-world applications]
✅ Milestone: [Final achievement]

Include recommended resources, time commitments, and assessment methods.`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatLearningPath(result);
        saveHistory(`Learning Path: ${topic}`);
        showNotification('Learning path created!', 'success');
        
    } catch (error) {
        console.error('Error generating learning path:', error);
        showNotification('Failed to generate learning path. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function generateDeepAnalysis() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Provide an in-depth analysis of "${topic}" for advanced learners. Include:

🔬 Deep Analysis: ${topic}

**📊 Historical Context:**
- Origins and evolution
- Key milestones and developments
- Influential figures and contributions

**🔬 Technical Deep Dive:**
- Core principles and mechanisms
- Underlying theories and frameworks
- Technical specifications and standards

**🌍 Global Impact:**
- Economic implications
- Social and cultural effects
- Environmental considerations

**🔮 Future Trends:**
- Emerging developments
- Predicted advancements
- Potential challenges and opportunities

**🎓 Academic Perspectives:**
- Current research areas
- Academic debates and controversies
- Leading institutions and researchers

**💼 Industry Applications:**
- Sector-specific implementations
- Business models and strategies
- Market trends and forecasts`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatDeepAnalysis(result);
        saveHistory(`Deep Analysis: ${topic}`);
        showNotification('Deep analysis completed!', 'success');
        
    } catch (error) {
        console.error('Error generating deep analysis:', error);
        showNotification('Failed to generate deep analysis. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function generateLearningGame() {
    const topic = document.getElementById("topicInput").value.trim() || currentTopic;
    
    if (!topic) {
        showNotification('Please enter a topic first!', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const prompt = `Create an educational game concept for learning "${topic}". Design as:

🎮 Learning Game: ${topic}

**🎯 Game Concept:**
- Game name and theme
- Learning objectives
- Target audience
- Game type (quiz, simulation, puzzle, etc.)

**📖 Game Story:**
- Narrative and setting
- Characters and roles
- Plot progression
- Learning integration

**🎮 Gameplay Mechanics:**
- Core game loop
- Scoring system
- Difficulty progression
- Interactive elements

**🏆 Levels & Challenges:**
- Level descriptions
- Challenge types
- Boss battles (final tests)
- Achievement system

**📚 Learning Integration:**
- How educational content is embedded
- Feedback mechanisms
- Progress tracking
- Assessment methods

**🛠️ Implementation:**
- Materials needed
- Digital or physical format
- Single/multiplayer options
- Accessibility features`;
        
        const result = await callGeminiAPI(prompt);
        
        document.getElementById("extraOutput").innerHTML = formatLearningGame(result);
        saveHistory(`Learning Game: ${topic}`);
        showNotification('Learning game created!', 'success');
        
    } catch (error) {
        console.error('Error generating learning game:', error);
        showNotification('Failed to generate learning game. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// ===== FORMATTING FUNCTIONS =====
function formatKeyTerms(result) {
    return `
        <div class="key-terms">
            <h3>📚 Key Terms & Vocabulary</h3>
            <div class="terms-content">${result.replace(/\n/g, '<br>')}</div>
        </div>
    `;
}

function formatFAQ(result) {
    return `
        <div class="faq-section">
            <h3>❓ Frequently Asked Questions</h3>
            <div class="faq-content">${result.replace(/\n/g, '<br>')}</div>
        </div>
    `;
}

function formatExamples(result) {
    return `
        <div class="examples-section">
            <h3>🌍 Real-World Examples</h3>
            <div class="examples-content">${result.replace(/\n/g, '<br>')}</div>
        </div>
    `;
}

function formatCheatSheet(result) {
    return `
        <div class="cheat-sheet">
            <h3>📋 Quick Reference Cheat Sheet</h3>
            <div class="cheat-content">${result.replace(/\n/g, '<br>')}</div>
        </div>
    `;
}

function formatInterviewCoach(result) {
    return `
        <div class="interview-coach">
            <h3>🎤 AI Interview Coach Session</h3>
            <div class="coach-content">${result.replace(/\n/g, '<br>')}</div>
        </div>
    `;
}

function formatWritingHelp(result) {
    return `
        <div class="writing-help">
            <h3>✍️ AI Writing Assistant</h3>
            <div class="writing-content">${result.replace(/\n/g, '<br>')}</div>
        </div>
    `;
}

function formatLearningPath(result) {
    return `
        <div class="learning-path">
            <h3>🛤️ Personalized Learning Path</h3>
            <div class="path-content">${result.replace(/\n/g, '<br>')}</div>
        </div>
    `;
}

function formatDeepAnalysis(result) {
    return `
        <div class="deep-analysis">
            <h3>🔬 In-Depth Analysis</h3>
            <div class="analysis-content">${result.replace(/\n/g, '<br>')}</div>
        </div>
    `;
}

function formatLearningGame(result) {
    return `
        <div class="learning-game">
            <h3>🎮 Educational Learning Game</h3>
            <div class="game-content">${result.replace(/\n/g, '<br>')}</div>
        </div>
    `;
}

// Helper functions for voice features
async function speakAgain() {
    const text = document.querySelector('.voice-text')?.textContent;
    const languageMatch = document.querySelector('.voice-output h3')?.textContent.match(/\(([^)]+)\)/);
    const language = languageMatch ? languageMatch[1] : 'english';
    
    if (text) {
        // Try external TTS first for Hindi only
        if (language.toLowerCase() === 'hindi') {
            const success = await speakTextWithExternalTTS(text, language);
            if (success) return;
        }
        
        // Fallback to Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    }
}

function stopSpeaking() {
    speechSynthesis.cancel();
}

function formatPracticeProblems(result) {
    return `
        <div class="practice-problems">
            <h3>📚 Practice Problems</h3>
            <div class="problems-content">${result.replace(/\n/g, '<br>')}</div>
        </div>
    `;
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
