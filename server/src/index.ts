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
  console.log(`[server]: Server is running at ${process.env.SERVER_URL}`)
})

const io: Server = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
  }
});

// game updates
const gameIDs: string[] = [];
const gameIDsInitialized: {[key: string]: boolean} = {};
const gameBoards: {[key: string]: string[]} = {};
const gamePlayers: {[key: string]: string[]} = {};
const gameCurrentPlayers: {[key: string]: number} = {};
const gameWinners: {[key: string]: string} = {};
const gameNewGameStarted: {[key: string]: boolean} = {};

const iconMap: string[] = ['X', 'O'];

io.on('connection', (socket: Socket) => {
  // track connected clients
  console.log('-'.repeat(20));
  console.log(`[server]: New connection ${socket.id}`);

  // room logic
  socket.on('joinGame', (gameID) => {
    // initialize new room with new game
    socket.join(gameID);
    if (!gameIDsInitialized[gameID]) {
      gameIDsInitialized[gameID] = true;
      gameBoards[gameID] = ['', '', '', '', '', '', '', '', ''];
      gamePlayers[gameID] = [];
      gameCurrentPlayers[gameID] = Math.round(Math.random());
      gameWinners[gameID] = '';
      gameNewGameStarted[gameID] = false;
    }

    // add new player
    gamePlayers[gameID].push(socket.id);

    // assign spectator
    if (gamePlayers[gameID].length > 2) {
      io.to(socket.id).emit('spectator', {
        board: gameBoards[gameID],
        currentPlayer: gameCurrentPlayers[gameID],
        winner: gameWinners[gameID],
        spectator: true,
      });
    }

    // start new game with first two players
    if (!gameNewGameStarted[gameID] && gamePlayers[gameID].length === 2) {
      gameNewGameStarted[gameID] = true;
      gamePlayers[gameID].forEach((player, idx) => {
        io.to(player).emit('newGame', {
          board: gameBoards[gameID],
          player: idx,
          currentPlayer: gameCurrentPlayers[gameID],
          winner: gameWinners[gameID],
        });
      });
    }

    // listen for new moves, then emit new state
    socket.on('move', (i) => {
      if (gameBoards[gameID][i] !== '' || !gameNewGameStarted[gameID]) return;
      gameBoards[gameID][i] = iconMap[gameCurrentPlayers[gameID]];
      gameWinners[gameID] = checkWinner(gameBoards[gameID]);
      if (gameWinners[gameID] === '') {
        gameCurrentPlayers[gameID] = gameCurrentPlayers[gameID] === 0 ? 1 : 0;
      };
      io.to(gameID).emit('updateBoard', {
        board: gameBoards[gameID],
        currentPlayer: gameCurrentPlayers[gameID],
        winner: gameWinners[gameID],
      });
    });

    // reset game
    socket.on('resetCall', () => {
      gameBoards[gameID].fill('');
      gameCurrentPlayers[gameID] = Math.round(Math.random());
      gameWinners[gameID] = '';
      io.to(gameID).emit('reset', {
        board: gameBoards[gameID],
        currentPlayer: gameCurrentPlayers[gameID],
        winner: gameWinners[gameID],
      });
    });

    // handle disconnect
    socket.on('disconnect', () => {
      console.log('-'.repeat(20));
      console.log(`[server]: Disconnected ${socket.id}`);
      console.log(`[server]: Clients currently connected: ${io.engine.clientsCount}`);
      let idx = gamePlayers[gameID].indexOf(socket.id);
      gamePlayers[gameID].splice(idx, 1);
      if (gamePlayers[gameID].length === 0) {
        gameIDs.splice(gameIDs.indexOf(gameID), 1);
        delete gameIDsInitialized[gameID];
        delete gameBoards[gameID];
        delete gamePlayers[gameID];
        delete gameCurrentPlayers[gameID];
        delete gameWinners[gameID];
        delete gameNewGameStarted[gameID];
        console.log('-'.repeat(20));
        console.log(`[server]: Game ${gameID} deleted`)
        console.log(`[server]: Games currently active: ${gameIDs}`)
      }
    });
  });
});


const checkWinner = (board: string[]): string => {
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


app.get('/api/newGameID', (req: Request, res: Response) => {
  // generate 6 letter game ID
  const letters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let gameID: string = '';
  for (let i = 0; i < 6; i++) {
    gameID += letters[Math.floor(Math.random() * letters.length)];
  }
  console.log(gameID)
  res.send(gameID);

  console.log('-'.repeat(20));
  console.log(`[server]: New game ID: ${gameID}`);
  
  // add game to maps
  gameIDs.push(gameID);
  gameIDsInitialized[gameID] = false;
});

app.get('/api/checkGameID/:gameID', (req: Request, res: Response) => {
  const gameID: string = req.params.gameID;
  if (!gameIDs.includes(gameID)) {
    res.send('false');
    return;
  }
  res.send('true');
});