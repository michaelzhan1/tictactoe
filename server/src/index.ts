import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server, Socket } from 'socket.io';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// set up socket
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST'],
}));

const server: http.Server = http.createServer(app);
server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})

const io: Server = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
  }
});

// game updates
const board: string[] = new Array(9).fill('');
const players: string[] = [];
let currentPlayer: number = Math.round(Math.random());
let winner: string = '';
let newGameStarted: boolean = false;

const iconMap: string[] = ['X', 'O'];

io.on('connection', (socket: Socket) => {
  // track connected clients
  console.log('-'.repeat(20));
  console.log(`[server]: New connection ${socket.id}`);
  console.log(`[server]: Clients currently connected: ${io.engine.clientsCount}`);
  players.push(socket.id);

  // assign spectator
  if (players.length > 2) {
    socket.emit('spectator', {
      board: board,
      currentPlayer: currentPlayer,
      winner: winner,
      spectator: true,
    });
  }

  // on start game
  if (!newGameStarted && players.length === 2) {
    newGameStarted = true;
    players.forEach((player, idx) => {
      io.to(player).emit('newGame', {
        board: board,
        player: idx,
        currentPlayer: currentPlayer,
        winner: '',
      });
    });
  }

  // listen for new moves, then emit new state
  socket.on('move', (i) => {
    if (board[i] !== '') return;
    board[i] = iconMap[currentPlayer];
    winner = checkWinner();
    currentPlayer = currentPlayer === 0 ? 1 : 0;
    io.emit('updateBoard', {
      board: board,
      currentPlayer: currentPlayer,
      winner: winner,
    });
  });

  socket.on('resetCall', () => {
    board.fill('');
    currentPlayer = Math.round(Math.random());
    winner = '';
    io.emit('reset', {
      board: board,
      currentPlayer: currentPlayer,
      winner: winner,
    });
  })

  socket.on('disconnect', () => {
    console.log('-'.repeat(20));
    console.log(`[server]: Disconnected ${socket.id}`);
    console.log(`[server]: Clients currently connected: ${io.engine.clientsCount}`);
    let idx = players.indexOf(socket.id);
    players.splice(idx, 1);
  })
});


const checkWinner = (): string => {
  // check row
  for (let i = 0; i < 9; i += 3) {
    if (board[i] == 'X' && board[i + 1] == 'X' && board[i + 2] == 'X') return 'X';
    if (board[i] == 'O' && board[i + 1] == 'O' && board[i + 2] == 'O') return 'O';
  }
  
  // check col
  for (let i = 0; i < 3; i++) {
    if (board[i] == 'X' && board[i + 3] == 'X' && board[i + 6] == 'X') return 'X';
    if (board[i] == 'O' && board[i + 3] == 'O' && board[i + 6] == 'O') return 'O';
  }
  
  // check front diags
  if (board[0] == 'X' && board[4] == 'X' && board[8] == 'X') return 'X';
  if (board[0] == 'O' && board[4] == 'O' && board[8] == 'O') return 'O';
  
  // check back diag
  if (board[2] == 'X' && board[4] == 'X' && board[6] == 'X') return 'X';
  if (board[2] == 'O' && board[4] == 'O' && board[6] == 'O') return 'O';

  // check draw
  if (!board.includes('')) return 'D';
  return '';
}