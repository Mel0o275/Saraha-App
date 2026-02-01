import 'dotenv/config';
import mongoose, { syncIndexes } from 'mongoose';
import { DB_URL } from '../../config/config.service.js';


export const connectDB = async () => {
	try {
		const result = await mongoose.connect(DB_URL);
		console.log('Database connected successfully');

	} catch (error) {
		console.log('Database connection failed');
		console.log(error);
	}
}
