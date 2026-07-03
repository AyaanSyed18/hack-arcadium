import mongoose from 'mongoose';

const uri = 'mongodb+srv://ayaanplayz18_db_user:4UxmoBq3ELW4Ci5t@cluster0.butgefn.mongodb.net/Arcadium?retryWrites=true&w=majority';

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
  } catch (error: any) {
    console.error('Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
