'use client'


import { useState, useEffect } from 'react'
import { socket } from './socket'
import { SpectatorEvent, NewGameEvent } from '@/type/GameState'
import Board from '@/components/Board'


export default function Home() {
  const [board, setBoard] = useState<string[]>(new Array(9).fill(''));
  const [player, setPlayer] = useState<number>(-1);
  const [currentPlayer, setCurrentPlayer] = useState<number>(-1);
  const [winner, setWinner] = useState<string>('');
  const [spectator, setSpectator] = useState<boolean>(false);
  const [waiting, setWaiting] = useState<boolean>(false);
  
  useEffect(() => {
    socket.connect();
    socket.on('connect', () => {
      console.log(`[client] connected with ID ${socket.id}`);
    })

    return () => {
      socket.disconnect();
      socket.off('connect');
    }
  }, [])

  // check if player is spectator
  socket.on('spectator', (args: SpectatorEvent) => {
    setBoard(args.board);
    setCurrentPlayer(args.currentPlayer);
    setWinner(args.winner);
    setSpectator(true);
    setWaiting(false);
  });

  // start new game
  socket.on('newGame', (args: NewGameEvent) => {
    setBoard(args.board);
    setPlayer(args.player);
    setCurrentPlayer(args.currentPlayer);
    setWinner(args.winner);
    setSpectator(false);
    setWaiting(false);
  })

  // reset
  socket.on('reset', (args) => {
    setBoard(args.board);
    setCurrentPlayer(args.currentPlayer);
    setWinner(args.winner);
  })

  // listen for board updates
  socket.on('updateBoard', (args) => {
    setBoard(args.board);
    setCurrentPlayer(args.currentPlayer);
    setWinner(args.winner);
  })

  // send board update
  const updateBoardLogic = (i: number): void => {
    console.log('Board clicked')
    if (board[i] !== '' || player != currentPlayer) return;
    socket.emit('move', i);
  }

  const playerMap: { [key: number]: string } = {
    "-1": '',
    0: 'X',
    1: 'O'
  } 

  const resetGame = (): void => {
    socket.emit('resetCall');
  }

  return (
    <>
      <div className='flex flex-col h-screen w-screen items-center justify-center'>
        <div className={`absolute ${winner ? 'bg-opacity-70' : 'bg-opacity-0'} transition-all duration-150 bg-black pointer-events-none w-full h-full flex items-center justify-center`}>
          <div className={`bg-white pointer-events-auto text-center text-3xl py-4 px-5 transition-all duration-300 ${winner ? 'translate-y-0' : '-translate-y-[36rem]'}`} >
            <div className='mb-5'>
              { winner != 'D' ? (
                <>
                  {playerMap[player]} has won!
                </>
              ) : (
                <>
                  Draw!
                </>
              )}
            </div>
            <button type='button' onClick={resetGame} className='bg-green-400 px-3 py-3 hover:bg-green-500'>
              Play again?
            </button>
          </div>
        </div>
        {spectator && (
          <div>
            <p className='text-3xl'>You are spectating</p>
          </div>
        )}
        <div className='mb-24'>
          <p className='text-3xl'>You are: {playerMap[player]} </p>
        </div>
        <div className='mb-24'>
          <p className='text-3xl'>Current turn: {playerMap[currentPlayer]} </p>
        </div>
        <Board boardState={board} className='grid grid-cols-3 text-center text-8xl' updateBoard={updateBoardLogic} over={winner} />
      </div>
    </>
  )
}