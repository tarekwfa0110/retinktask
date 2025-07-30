require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Validation middleware
const validateSummarizeRequest = [
  body('text')
    .isString()
    .withMessage('Text must be a string')
    .isLength({ min: 200 })
    .withMessage('Text must be at least 200 characters long')
    .isLength({ max: 10000 })
    .withMessage('Text must not exceed 10,000 characters'),
  body('tone')
    .optional()
    .isIn(['professional', 'casual', 'academic', 'creative'])
    .withMessage('Tone must be one of: professional, casual, academic, creative'),
  body('length')
    .optional()
    .isIn(['short', 'medium', 'long'])
    .withMessage('Length must be one of: short, medium, long')
];

// Utility function to count words
const countWords = (text) => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Utility function to get summary length based on preference
const getSummaryLength = (length) => {
  switch (length) {
    case 'short': return '1-2 sentences';
    case 'long': return '4-6 sentences';
    default: return '2-4 sentences';
  }
};

// Utility function to get tone instruction
const getToneInstruction = (tone) => {
  switch (tone) {
    case 'professional': return 'Use a professional and formal tone.';
    case 'casual': return 'Use a casual and conversational tone.';
    case 'academic': return 'Use an academic and scholarly tone.';
    case 'creative': return 'Use a creative and engaging tone.';
    default: return '';
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Retink Text Summarizer API',
    version: '1.0.0',
    provider: 'Groq',
    endpoints: {
      'POST /summarize': 'Summarize text using AI',
      'GET /health': 'Health check endpoint'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    provider: 'Groq'
  });
});

app.post('/summarize', validateSummarizeRequest, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { text, tone = 'professional', length = 'medium' } = req.body;
    
    // Count words in original text
    const originalWordCount = countWords(text);
    
    // Prepare the prompt
    const summaryLength = getSummaryLength(length);
    const toneInstruction = getToneInstruction(tone);
    
    const prompt = `Summarize this content in ${summaryLength}. ${toneInstruction} Focus on the key points and main ideas:

${text}`;

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise, accurate summaries. Always respond with just the summary, no additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 300,
      temperature: 0.3
    });

    const summary = chatCompletion.choices[0].message.content.trim();
    const summaryWordCount = countWords(summary);

    // Return the response
    res.json({
      success: true,
      data: {
        originalText: text,
        summary: summary,
        originalWordCount: originalWordCount,
        summaryWordCount: summaryWordCount,
        compressionRatio: ((originalWordCount - summaryWordCount) / originalWordCount * 100).toFixed(1) + '%',
        settings: {
          tone: tone,
          length: length
        },
        model: "llama-3.3-70b-versatile"
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Summarization error:', error);
    
    // Handle specific Groq errors
    if (error.status === 429) {
      return res.status(503).json({
        error: 'Service temporarily unavailable due to rate limits',
        message: 'Please try again later'
      });
    }
    
    if (error.status === 401) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'API key is invalid or missing'
      });
    }
    
    if (error.message && error.message.includes('context_length')) {
      return res.status(400).json({
        error: 'Text too long',
        message: 'The provided text exceeds the maximum allowed length'
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate summary. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our end'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Text Summarizer API ready (Groq)`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; 