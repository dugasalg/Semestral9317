const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const gameRoutes = require('./routes/juegoRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/', gameRoutes);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  mongoose.connect('mongodb+srv://dugatabacc:bVfvoFf0WEUhFjm7@clusterulsa.l8kv3qi.mongodb.net/PokemonSalgadoGay', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));
}

module.exports = app;
