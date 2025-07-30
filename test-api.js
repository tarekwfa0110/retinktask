const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test data
const testTexts = {
  short: "This is a very short text that should fail validation because it's less than 200 characters.",
  
  valid: `Artificial intelligence (AI) is a branch of computer science that aims to create intelligent machines that work and react like humans. Some of the activities computers with artificial intelligence are designed for include speech recognition, learning, planning, and problem solving. AI has been used in various applications such as virtual assistants, autonomous vehicles, medical diagnosis, and game playing. The field of AI research was founded on the assumption that human intelligence can be precisely described and simulated by machines. This assumption has led to significant advances in machine learning, natural language processing, and robotics. Today, AI technologies are becoming increasingly integrated into our daily lives, from smartphone apps to smart home devices.`,
  
  long: `Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, such as through variations in the solar cycle. But since the 1800s, human activities have been the main driver of climate change, primarily due to the burning of fossil fuels like coal, oil and gas. Burning fossil fuels generates greenhouse gas emissions that act like a blanket wrapped around the Earth, trapping the sun's heat and raising temperatures. Examples of greenhouse gas emissions that are causing climate change include carbon dioxide and methane. These come from using gasoline for driving a car or coal for heating a building, for example. Clearing land and forests can also release carbon dioxide. Landfills for garbage are a major source of methane emissions. Energy, industry, transport, buildings, agriculture and land use are among the main emitters. Climate change affects everyone, but the poorest and most vulnerable people are being hit hardest. Extreme weather events are becoming more frequent and intense, sea levels are rising, and the Arctic is warming. These changes are affecting food production, water availability, and human health. The good news is that we can still limit climate change if we act now. We need to reduce greenhouse gas emissions, protect and restore forests, and invest in renewable energy sources like wind and solar power.`
};

async function testAPI() {
  console.log('🧪 Testing Retink Text Summarizer API\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    console.log('');

    // Test 2: API info
    console.log('2. Testing API info endpoint...');
    const infoResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ API info:', infoResponse.data.message);
    console.log('');

    // Test 3: Invalid request (too short text)
    console.log('3. Testing validation (too short text)...');
    try {
      await axios.post(`${BASE_URL}/summarize`, {
        text: testTexts.short
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validation working correctly - rejected short text');
        console.log('   Error:', error.response.data.error);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    // Test 4: Valid request
    console.log('4. Testing valid summarization request...');
    const summaryResponse = await axios.post(`${BASE_URL}/summarize`, {
      text: testTexts.valid
    });
    
    const data = summaryResponse.data.data;
    console.log('✅ Summarization successful!');
    console.log(`   Original words: ${data.originalWordCount}`);
    console.log(`   Summary words: ${data.summaryWordCount}`);
    console.log(`   Compression: ${data.compressionRatio}`);
    console.log(`   Summary: "${data.summary}"`);
    console.log('');

    // Test 5: Custom tone and length
    console.log('5. Testing custom tone and length...');
    const customResponse = await axios.post(`${BASE_URL}/summarize`, {
      text: testTexts.long,
      tone: 'academic',
      length: 'long'
    });
    
    const customData = customResponse.data.data;
    console.log('✅ Custom summarization successful!');
    console.log(`   Tone: ${customData.settings.tone}`);
    console.log(`   Length: ${customData.settings.length}`);
    console.log(`   Original words: ${customData.originalWordCount}`);
    console.log(`   Summary words: ${customData.summaryWordCount}`);
    console.log(`   Compression: ${customData.compressionRatio}`);
    console.log(`   Summary: "${customData.summary}"`);
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to server. Make sure the server is running on http://localhost:3000');
      console.log('   Run: npm run dev');
    } else {
      console.log('❌ Test failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI, testTexts }; 