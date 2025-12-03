import { createServer } from 'http';
import { createApp } from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = createApp();
const server = createServer(app);

server.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Server running on http://localhost:${PORT}`);
});
