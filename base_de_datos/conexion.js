import { Sequelize } from 'sequelize';
import {DB_CONNECTION, DB_USERNAME, DB_PASSWORD,DB_HOST,DB_DATABASE,DB_PORT} from '../config/config.js';
// Option 3: Passing parameters separately (other dialects)
export const sequelize = new Sequelize(
    DB_DATABASE,
    DB_USERNAME,
    DB_PASSWORD,
    {
        host: DB_HOST,
        dialect: DB_CONNECTION,
        port: DB_PORT
    }
);





