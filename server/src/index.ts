import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server, Socket } from 'socket.io';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
}));

const server: http.Server = http.createServer(app);
server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})

const io: Server = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }
});

io.on('connection', (socket: Socket) => {
  console.log(`[server]: New connection ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[server]: Disconnected ${socket.id}`);
  })
});

const board: string[] = new Array(9).fill('');
const player: number = Math.round(Math.random());

app.get('/', (req: Request, res: Response) => {
  res.send("Hello, world!")
})