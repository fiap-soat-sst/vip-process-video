import dotenv from 'dotenv';
import app from './App';

dotenv.config();

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(
    `[server]: Server is up and running at http://localhost:${port} 🚀`
  );
});

app.get('/', (req, res) => {
  res.redirect('/docs');
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/fiap', (req, res) => {
  res.send('soat');
});
