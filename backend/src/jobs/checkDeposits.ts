import { checkDeposits } from '../controllers/crypto.controller';
import cron from 'node-cron';

cron.schedule('*/30 * * * * *', checkDeposits);