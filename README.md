# Retink Text Summarizer API

A backend API that uses Groq's Llama-3.3-70B-Versatile model to summarize long-form text into concise summaries. Built with Node.js and Express.js.

## Features

- **POST /summarize** - Summarize text using AI
- **GET /health** - Health check endpoint
- **GET /** - API information

### Core Features
- Accepts raw text (minimum 200 characters, maximum 10,000 characters)
- Returns original text, summary, and word counts
- Configurable summary length (short, medium, long)
- Configurable tone (professional, casual, academic, creative)
- Rate limiting (100 requests per 15 minutes per IP)
- Comprehensive error handling
- Security headers with Helmet
- CORS enabled
- Response compression

### Bonus Features
- Customizable summary length and tone
- Compression ratio calculation
- Detailed error responses
- Request validation
- API timeout handling

## Tech Stack

- **Node.js** (v18+)
- **Express.js** - Web framework
- **Groq API** - Llama-3.3-70B-Versatile for text summarization
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Express rate limit
- **Validation** - Express validator
- **Compression** - Response compression

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd retinktask
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp env.example .env
```

Edit `.env` file with your configuration:
```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Get Groq API Key
1. Visit [Groq Platform](https://console.groq.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Add the key to your `.env` file

### 5. Run the application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (for local development)

## API Documentation

### Base URL
```
https://retink-text-summarizer-production.up.railway.app/
```

### Endpoints

#### GET /
Returns API information and available endpoints.

**Response:**
```json
{
  "message": "Retink Text Summarizer API",
  "version": "1.0.0",
  "provider": "Groq",
  "endpoints": {
    "POST /summarize": "Summarize text using AI",
    "GET /health": "Health check endpoint"
  }
}
```

#### GET /health
Health check endpoint to verify API status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-27T16:21:00.000Z",
  "uptime": 123.456,
  "provider": "Groq"
}
```

#### POST /summarize
Summarize text using AI.

**Request Body:**
```json
{
  "text": "Your long text here... (minimum 200 characters)",
  "tone": "professional", // optional: professional, casual, academic, creative
  "length": "medium" // optional: short, medium, long
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalText": "Your original text...",
    "summary": "AI-generated summary...",
    "originalWordCount": 150,
    "summaryWordCount": 25,
    "compressionRatio": "83.3%",
    "settings": {
      "tone": "professional",
      "length": "medium"
    },
    "model": "llama-3.3-70b-versatile"
  },
  "timestamp": "2025-07-27T16:21:00.000Z"
}
```

## Example Requests

### Basic Summarization
```bash
curl -X POST https://retink-text-summarizer-production.up.railway.app/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Artificial intelligence (AI) is a branch of computer science that aims to create intelligent machines that work and react like humans. Some of the activities computers with artificial intelligence are designed for include speech recognition, learning, planning, and problem solving. AI has been used in various applications such as virtual assistants, autonomous vehicles, medical diagnosis, and game playing. The field of AI research was founded on the assumption that human intelligence can be precisely described and simulated by machines. This assumption has led to significant advances in machine learning, natural language processing, and robotics. Today, AI technologies are becoming increasingly integrated into our daily lives, from smartphone apps to smart home devices."
  }'
```

### Custom Tone and Length
```bash
curl -X POST https://retink-text-summarizer-production.up.railway.app/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Climate change refers to long-term shifts in temperatures and weather patterns...",
    "tone": "academic",
    "length": "long"
  }'
```

### Error Response Example
```bash
curl -X POST https://retink-text-summarizer-production.up.railway.app/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Too short"
  }'
```

**Response:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "type": "field",
      "value": "Too short",
      "msg": "Text must be at least 200 characters long",
      "path": "text",
      "location": "body"
    }
  ]
}
```

## Error Handling

The API includes comprehensive error handling for:

- **Validation Errors** (400) - Invalid input data
- **Rate Limiting** (429) - Too many requests
- **API Quota Exceeded** (503) - Groq rate limits
- **Invalid API Key** (500) - Configuration issues
- **Text Too Long** (400) - Exceeds maximum length
- **Internal Server Errors** (500) - Unexpected errors

## Deployment

### Deploy to Render

1. **Create a Render account** at [render.com](https://render.com)
2. **Connect your GitHub repository**
3. **Create a new Web Service**
   - Choose your repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Set environment variables:
     - `GROQ_API_KEY`: Your Groq API key
     - `NODE_ENV`: `production`
     - `PORT`: `10000` (Render's default)
4. **Deploy**

### Deploy to Railway

1. **Create a Railway account** at [railway.app](https://railway.app)
2. **Connect your GitHub repository**
3. **Add environment variables**:
   - `GROQ_API_KEY`: Your Groq API key
   - `NODE_ENV`: `production`
4. **Deploy automatically**

### Deploy to Heroku

1. **Create a Heroku account** and install CLI
2. **Create a new app**:
   ```bash
   heroku create your-app-name
   ```
3. **Set environment variables**:
   ```bash
   heroku config:set GROQ_API_KEY=your_api_key
   heroku config:set NODE_ENV=production
   ```
4. **Deploy**:
   ```bash
   git push heroku main
   ```

## Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - Prevents abuse
- **Input Validation** - Sanitizes user input
- **CORS** - Controlled cross-origin access
- **Environment Variables** - Secure configuration
- **Request Size Limits** - Prevents large payload attacks

## Performance Features

- **Response Compression** - Reduces bandwidth usage
- **Request Timeout** - 30-second timeout for AI calls
- **Efficient Word Counting** - Optimized text processing
- **Error Caching** - Prevents repeated failed requests

## Testing

Run tests (when implemented):
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact: [Your Contact Information]

---

**Built for Retink Media - Software Developer (Backend) Task** 