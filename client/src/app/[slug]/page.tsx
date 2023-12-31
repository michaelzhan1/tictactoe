'use client'


import { useState, useEffect } from 'react'
import { socket } from '@/app/socket'
import { SpectatorEvent, NewGameEvent } from '@/type/GameState'
import Board from '@/components/Board'


export default function Page({params}: {params: {slug: string}}) {
  const gameID = params.slug;
  const [board, setBoard] = useState<string[]>(new Array(9).fill(''));
  const [player, setPlayer] = useState<number>(-1);
  const [currentPlayer, setCurrentPlayer] = useState<number>(-1);
  const [winner, setWinner] = useState<string>('');
  const [spectator, setSpectator] = useState<boolean>(false);
  const [waiting, setWaiting] = useState<boolean>(true);
  
  useEffect(() => {
    socket.connect();
    socket.on('connect', () => {
      console.log(`[client] connected with ID ${socket.id}`);
      socket.emit('joinGame', gameID);
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
        <div className={`absolute ${winner ? 'bg-opacity-70' : 'bg-opacity-0'} transition-all duration-150 bg-black w-full h-full flex items-center justify-center ${spectator ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <div className={`bg-white pointer-events-auto text-center text-3xl py-4 px-5 transition-all duration-300 ${winner ? 'translate-y-0' : '-translate-y-[36rem]'}`} >
            <div className='mb-5'>
              { winner != 'D' ? (
                <>
                  { spectator ? (
                    <>
                      {winner} won!
                    </>
                  ) : (
                    <>
                      {winner == playerMap[player] ? 'You won!' : 'You lost!'}
                    </>
                  )}
                </>
              ) : (
                <>
                  Draw!
                </>
              )}
            </div>
            { !spectator && (
              <button type='button' onClick={resetGame} className='bg-green-400 px-3 py-3 hover:bg-green-500'>
                Play again?
              </button>
            )}
          </div>
        </div>
        { waiting ? (
          <div className='mb-8'>
            <p className='text-3xl font-bold'>Waiting for another player...</p>
          </div>
        ) : (
          <>
            {spectator ? (
              <div className='mb-8'>
                <p className='text-3xl font-bold'>You are spectating</p>
              </div>
            ) : (
              <div className='mb-8'>
                <p className='text-3xl font-bold'>You are: {playerMap[player]} </p>
              </div>
            )}
            <div className='mb-16'>
              <p className='text-3xl'>Current turn: {playerMap[currentPlayer]} </p>
            </div>
          </>
        )}
        <Board boardState={board} className='grid grid-cols-3 text-center text-8xl' updateBoard={updateBoardLogic} over={winner} />
      </div>
    </>
  )
}