const mongoose = require('mongoose');

/**
 * NOTE: Make sure to point this to the correct config!
 * */
const config = require('../../config/default.json');

const mongoUrl = config.mongodb;
console.log('url:', mongoUrl);
mongoose.connect(mongoUrl);
const db = mongoose.connection;

db.on('error', err => console.error('migrateToTokens > Could not connect to Mongo', err));

// once mongo connected, start migration
db.once('open', async () => {
  console.log('Connected to Mongo');

  const Conversations = db.collection('conversations');
  try {
    Conversations.find({
      paidAmount: { $ne: null },
      paidSymbol: { $ne: null },
    }).toArray((err, conversations) => {
      conversations.forEach(async (conversation) => {
        const { paidAmount, paidSymbol } = conversation;
        await Conversations.updateOne(
          { _id: conversation._id },
          {
            $set: {
              payments: [
                {
                  amount: paidAmount,
                  symbol: paidSymbol,
                },
              ],
            },
            $unset: {
              paidAmount: '',
              paidSymbol: '',
            },
          },
        );
      });
    });
    console.log('Done');
  } catch (e) {
    console.error(e);
  }
  process.exit();
});