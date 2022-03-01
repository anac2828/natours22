import 'dotenv/config.js';
// import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import mongoose from 'mongoose';
import Tour from '../../models/tourModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// READ DATA
const tours = JSON.parse(
  readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

mongoose.connect(
  'mongodb+srv://ana:natours2828@nodejs.viihm.mongodb.net/NodeJS?retryWrites=true&w=majority',
  () => console.log('Data connection successful!')
);

// SAVE DATA TO MONGODB COLLECTION

const importData = async () => {
  await Tour.create(tours);
  console.log('Data saved!');
  process.exit();
};

const deleteData = async () => {
  await Tour.deleteMany();
  console.log('Data deleted');
  process.exit();
};

if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') deleteData();
