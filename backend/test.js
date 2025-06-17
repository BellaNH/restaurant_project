import mongoose from "mongoose"

mongoose.connect('mongodb://localhost:27017/testDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log(' Connected to MongoDB');
  mongoose.connection.close();
})
.catch(err => {
  console.error('Connection Error:', err);
});

