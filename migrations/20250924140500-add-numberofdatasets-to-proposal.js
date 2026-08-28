module.exports = {
  async up(db, client) {
    const BATCH_SIZE = 100;
    
    // Get total count
    const totalProposals = await db.collection("Proposal").countDocuments({});
    
    // Process in batches
    for (let i = 0; i < totalProposals; i += BATCH_SIZE) {
      const proposals = await db
        .collection("Proposal")
        .find({})
        .skip(i)
        .limit(BATCH_SIZE)
        .toArray();
      
      for (const proposal of proposals) {
        const datasetCount = await db
          .collection("Dataset")
          .countDocuments({ proposalIds: proposal.proposalId });
        
        await db.collection("Proposal").updateOne(
          { _id: proposal._id },
          { $set: { numberOfDatasets: datasetCount } }
        );
      }
      
      console.log(`Processed ${Math.min(i + BATCH_SIZE, totalProposals)}/${totalProposals} proposals`);
    }
  },

  async down(db, client) {
    // No path backward
  },
};
