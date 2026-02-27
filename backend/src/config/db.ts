import mongoose from 'mongoose';

const connectDB = async (mongoUri: string, retries = 5, delayMs = 5000): Promise<void> => {
    while (retries > 0) {
        try {
            await mongoose.connect(mongoUri);
            console.log('MongoDB connected successfully');
            return;
        } catch (error) {
            console.error(`MongoDB connection failed. Retries left: ${retries - 1}`, error);
            retries -= 1;
            if (retries === 0) {
                console.error('All retries failed. MongoDB connection could not be established.');
                // Don't crash immediately, let the app logic decide what to do
                return;
            }
            await new Promise(res => setTimeout(res, delayMs));
        }
    }
};

export default connectDB;
