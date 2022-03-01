// dotenv module adds the variables in the .env file to process.env
import 'dotenv/config.js';
import mongoose from 'mongoose';
import app from './app.js';

// "env" = express enviroment - The default env is developer
// console.log(app.get('env'));
// node envirement variables set up by the process module
// console.log(process.env);
// you can add enviroment variables to the process module

// *************** UNCAUGHT EXCEPTION ***************
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// *************** DATABASE ****************

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// mongoose.connect will return a promise that will give you access to a connection object
mongoose
  .connect(
    DB
    // Not neccessary with mongoose version 6
    //   {
    //   useNewUrlParse: true,
    //   useCreateIndex: true,
    //   useFindAndModify: false,
    // }
  )
  .then(() => {
    console.log('DB connection successful!');
  });

// ************ SERVER *************

const port = 3000;
const server = app.listen(port, 'localhost', () =>
  console.log('Server started.')
);

// UNHANDLED REJECTS

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  // This will give the server time to close any pending request before shutting down.
  server.close(() => {
    process.exit(1);
  });
});
