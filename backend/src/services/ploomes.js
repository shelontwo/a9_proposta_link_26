const axios = require('axios');

const PLOOMES_API_KEY = process.env.PLOOMES_API_KEY; // Will be undefined in mock mode

/**
 * Service to interact with Ploomes API
 */
const ploomesService = {
  /**
   * Post a comment to a Deal's timeline
   * @param {string|number} dealId - The Ploomes Deal ID
   * @param {string} content - The message content
   */
  async postDealComment(dealId, content) {
    if (!dealId) {
      console.warn('[PloomesService] No Deal ID provided. Skipping.');
      return;
    }

    if (!PLOOMES_API_KEY) {
      console.log('--- [MOCK] Ploomes API Call ---');
      console.log(`Endpoint: /Deals(${dealId})/Comments`);
      console.log(`Payload: { content: "${content}" }`);
      console.log('-------------------------------');
      return { success: true, mock: true };
    }

    // Real API implementation (Future proofing)
    try {
      // Note: This is a hypothetical endpoint structure based on OData/Ploomes typically
      const response = await axios.post(
        `https://api.ploomes.com/Deals(${dealId})/Comments`, // Example endpoint
        { Content: content },
        { headers: { 'User-Key': PLOOMES_API_KEY } }
      );
      return response.data;
    } catch (error) {
      console.error('[PloomesService] API Error:', error.message);
      return { success: false, error: error.message };
    }
  }
};

module.exports = ploomesService;
