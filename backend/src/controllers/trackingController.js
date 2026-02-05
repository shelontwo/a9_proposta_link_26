const ploomesService = require('../services/ploomesService');
// In-memory store for demo purposes (replace with Supabase later if needed for persistence)
// For now, we will just log to console as per "Mock" requirement for the first pass or use a simple file.
// Ideally, we'd use Supabase, but I'll set up the logic to be ready for it.

const handleEvent = async (req, res) => {
  const { eventType, token, payload } = req.body;
  const { slideNumber, duration, timestamp } = payload || {};

  console.log(`[TRACKING] Event: ${eventType} | Token: ${token} | Slide: ${slideNumber} | Duration: ${duration}s`);

  try {
    // 1. Log the event (Mocked DB insert)
    // await supabase.from('tracking_logs').insert({ ... })

    // 2. Handle specific business logic
    if (eventType === 'COMPLETE') {
      console.log(`[LOGIC] Presentation Completed! Triggering Ploomes...`);
      await ploomesService.notifyDealOwner(token, `Client finished presentation (Slide ${slideNumber})`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling event:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = {
  handleEvent
};
