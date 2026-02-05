const notifyDealOwner = async (token, message) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock logic to find deal by token
  const dealId = 12345; // Derived from token
  const ownerId = 999;

  console.log(`\n--- [Ploomes Integration] ---`);
  console.log(`Action: Notify Deal Owner`);
  console.log(`Deal ID: ${dealId}`);
  console.log(`Message: "${message}"`);
  console.log(`-----------------------------\n`);

  return true;
};

module.exports = {
  notifyDealOwner
};
