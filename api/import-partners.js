const { MongoClient } = require('mongodb');

const sourceUri = 'mongodb+srv://damian:wJwxO0xQYgrLV9AH@altoev.u9lcgej.mongodb.net/lanforge-final?retryWrites=true&w=majority&appName=Altoev';
const targetUri = 'mongodb+srv://damian:wJwxO0xQYgrLV9AH@altoev.u9lcgej.mongodb.net/lanforge-beta?retryWrites=true&w=majority&appName=Altoev';

async function importPartners() {
  const sourceClient = new MongoClient(sourceUri);
  const targetClient = new MongoClient(targetUri);

  try {
    console.log('Connecting to source and target databases...');
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDb = sourceClient.db('lanforge-final');
    const targetDb = targetClient.db('lanforge-beta');

    const sourceCollection = sourceDb.collection('partners');
    const targetCollection = targetDb.collection('partners');

    console.log('Fetching partners from source database...');
    const partners = await sourceCollection.find({}).toArray();
    
    console.log(`Found ${partners.length} partners. Importing to target database...`);
    
    if (partners.length > 0) {
      let upsertCount = 0;
      for (const partner of partners) {
        const { _id, ...updateData } = partner;
        await targetCollection.updateOne(
          { _id: partner._id },
          { $set: updateData },
          { upsert: true }
        );
        upsertCount++;
      }
      console.log(`Successfully upserted ${upsertCount} partners.`);
    } else {
      console.log('No partners found in the source database.');
    }
  } catch (err) {
    console.error('Error importing partners:', err);
  } finally {
    console.log('Closing connections...');
    await sourceClient.close();
    await targetClient.close();
  }
}

importPartners();