/**
 * Config Loader
 * Loads environment variables from .env file for local development
 */

async function loadConfig() {
    try {
        const response = await fetch('.env');
        if (!response.ok) {
            console.warn('Could not load .env file');
            return;
        }
        const text = await response.text();
        const config = {};
        
        // Parse .env file format (KEY=VALUE)
        text.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes if present
                config[key] = value;
            }
        });

        // Expose to window for other scripts
        window.API_CONFIG = {
            ...window.API_CONFIG,
            GROQ_API_KEY: config.GROQ_API_KEY,
            // Fallback URL if needed, though we'll likely hardcode the standard Groq endpoint
            GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions'
        };

        console.log('Configuration loaded successfully');
        
        // Dispatch event to signal config is ready
        window.dispatchEvent(new Event('configLoaded'));
        
    } catch (error) {
        console.error('Error loading configuration:', error);
    }
}

// execute immediately
loadConfig();
