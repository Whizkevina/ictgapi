/**
 * TranscriptionService.js
 * Service to handle real-time transcription of live streams and extract
 * scripture references and sermon points.
 */

import config from '../config/config';

// Mock API endpoint - would be replaced with actual transcription service
const TRANSCRIPTION_API = config.api.baseUrl + '/transcribe';
const BIBLE_API = 'https://bible-api.com/';

class TranscriptionService {
  constructor() {
    this.isTranscribing = false;
    this.transcriptionInterval = null;
    this.transcript = '';
    this.detectedScriptures = [];
    this.detectedPoints = [];
    this.onUpdateCallbacks = [];
  }

  /**
   * Start transcribing a video stream
   * @param {string} streamUrl - URL of the video stream
   * @returns {Promise<void>}
   */
  async startTranscription(streamUrl) {
    if (this.isTranscribing) {
      return;
    }

    this.isTranscribing = true;
    this.transcript = '';
    this.detectedScriptures = [];
    this.detectedPoints = [];

    // In a real implementation, this would connect to a streaming transcription API
    // For demo purposes, we'll simulate with intervals
    this.transcriptionInterval = setInterval(() => {
      this._simulateTranscription();
    }, 5000); // Every 5 seconds

    this._notifyUpdateListeners();
    console.log('Started transcription for stream:', streamUrl);
  }

  /**
   * Stop the transcription process
   */
  stopTranscription() {
    if (!this.isTranscribing) {
      return;
    }

    clearInterval(this.transcriptionInterval);
    this.isTranscribing = false;
    console.log('Stopped transcription');
    this._notifyUpdateListeners();
  }

  /**
   * Register a callback to be notified when transcription data updates
   * @param {Function} callback - Function to call with updated data
   */
  onUpdate(callback) {
    this.onUpdateCallbacks.push(callback);
  }

  /**
   * Get the current transcription results
   * @returns {Object} Current transcription data
   */
  getCurrentData() {
    return {
      isActive: this.isTranscribing,
      transcript: this.transcript,
      scriptures: this.detectedScriptures,
      sermonPoints: this.detectedPoints,
    };
  }

  /**
   * Notify all registered callbacks of updates
   * @private
   */
  _notifyUpdateListeners() {
    const data = this.getCurrentData();
    this.onUpdateCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in transcription update callback:', error);
      }
    });
  }

  /**
   * Simulate transcription for demo purposes
   * In a real implementation, this would be replaced with actual API calls
   * @private
   */
  _simulateTranscription() {
    // Simulating transcription - in a real app this would come from an API
    const possibleTranscripts = [
      "Today we're looking at John 3:16-17 which tells us about God's love for the world.",
      "Let's turn to Romans 8:28, which reminds us that all things work together for good.",
      "The first point I want to make today is that faith comes by hearing the Word of God.",
      "Our second key point is that prayer is essential to our spiritual growth.",
      "In Matthew 5:14-16, Jesus tells us that we are the light of the world.",
      "Let me emphasize this third point: community is vital to our spiritual journey.",
    ];

    // Randomly select a new piece of transcript
    const newText = possibleTranscripts[Math.floor(Math.random() * possibleTranscripts.length)];
    this.transcript += ' ' + newText;

    // Detect scripture references in the new text
    this._detectScriptures(newText);

    // Detect sermon points
    this._detectSermonPoints(newText);

    // Notify listeners of the update
    this._notifyUpdateListeners();
  }

  /**
   * Detect scripture references in transcribed text
   * @param {string} text - Text to analyze for scripture references
   * @private
   */
  _detectScriptures(text) {
    // Simple regex pattern to detect common scripture reference formats
    // In a real app, this would be much more sophisticated
    const scriptureRegex = /(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Psalm|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation)\s(\d+):(\d+)(?:-(\d+))?/gi;
    
    let match;
    while ((match = scriptureRegex.exec(text)) !== null) {
      const book = match[1];
      const chapter = match[2];
      const verseStart = match[3];
      const verseEnd = match[4] || verseStart;
      
      // Format the reference nicely
      const reference = `${book} ${chapter}:${verseStart}${verseEnd !== verseStart ? '-' + verseEnd : ''}`;
      
      // Check if we already have this reference
      if (!this.detectedScriptures.some(s => s.reference === reference)) {
        this.detectedScriptures.push({
          type: this.detectedScriptures.length === 0 ? 'Main' : 'Add.',
          reference,
          excerpt: "Loading verse text...", // Would fetch from Bible API in real implementation
        });

        // In a real app, we would fetch the actual verse text from a Bible API
        // this._fetchVerseText(book, chapter, verseStart, verseEnd);
      }
    }
  }

  /**
   * Fetch the actual verse text from a Bible API
   * @param {string} book - Bible book name
   * @param {string} chapter - Chapter number
   * @param {string} verseStart - Starting verse number
   * @param {string} verseEnd - Ending verse number (optional)
   * @private
   */
  async _fetchVerseText(book, chapter, verseStart, verseEnd) {
    try {
      // Format the query for the Bible API
      const query = `${book} ${chapter}:${verseStart}${verseEnd !== verseStart ? '-' + verseEnd : ''}`;
      const response = await fetch(`${BIBLE_API}${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the scripture object with the actual verse text
        const reference = `${book} ${chapter}:${verseStart}${verseEnd !== verseStart ? '-' + verseEnd : ''}`;
        const scriptureIndex = this.detectedScriptures.findIndex(s => s.reference === reference);
        
        if (scriptureIndex !== -1) {
          this.detectedScriptures[scriptureIndex].excerpt = data.text;
          this._notifyUpdateListeners();
        }
      }
    } catch (error) {
      console.error('Error fetching verse text:', error);
    }
  }

  /**
   * Detect sermon points in transcribed text
   * @param {string} text - Text to analyze for sermon points
   * @private
   */
  _detectSermonPoints(text) {
    // Look for phrases that indicate sermon points
    // In a real app, this would use more sophisticated NLP techniques
    const pointPatterns = [
      { regex: /first\s+point\s+is\s+that\s+([^.]+)/i, index: 0 },
      { regex: /second\s+point\s+is\s+that\s+([^.]+)/i, index: 1 },
      { regex: /third\s+point\s+is\s+that\s+([^.]+)/i, index: 2 },
      { regex: /key\s+point\s+is\s+that\s+([^.]+)/i, index: 3 },
      { regex: /let\s+me\s+emphasize\s+this\s+([^:]+):\s+([^.]+)/i, point: 2 }
    ];

    pointPatterns.forEach(pattern => {
      const match = pattern.regex.exec(text);
      if (match) {
        const pointText = match[1];
        
        // Add the point if it's new
        if (!this.detectedPoints.some(p => p.toLowerCase().includes(pointText.toLowerCase()))) {
          // Insert at specified index or append
          if (pattern.index !== undefined && pattern.index < this.detectedPoints.length) {
            this.detectedPoints[pattern.index] = pointText;
          } else {
            this.detectedPoints.push(pointText);
          }
        }
      }
    });
  }
}

// Export singleton instance
const transcriptionService = new TranscriptionService();
export default transcriptionService;
