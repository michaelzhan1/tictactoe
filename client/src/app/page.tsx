'use client'


import { useState, useEffect } from 'react'
import Board from '@/components/Board'


export default function Home() {
  const [board, setBoard] = useState<string[]>(new Array(9).fill(''));
  const [player, setPlayer] = useState<number>(-1);
  const [winner, setWinner] = useState<string>('');

  // define player state on load
  useEffect(() =>{
    setPlayer(Math.round(Math.random()));
  }, [])

  // check if player as won
  useEffect(() => {
    let temp = checkWinner();
    if (temp) {
      setWinner(temp);
    } else if (player != -1) {
      setPlayer(1 - player);
    }
  }, [board])

  const playerMap: { [key: number]: string } = {
    "-1": '',
    0: 'X',
    1: 'O'
  } 

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

  const updateBoardLogic = (i: number): void => {
    const newBoard = [...board];
    if (newBoard[i] !== '') return;
    newBoard[i] = playerMap[player];
    setBoard(newBoard);
  }

  const resetGame = (): void => {
    setBoard(new Array(9).fill(''));
    setPlayer(Math.round(Math.random()));
    setWinner('');
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
        <div className='mb-24'>
          <p className='text-3xl'>Current turn: {playerMap[player]} </p>
        </div>
        <Board boardState={board} className='grid grid-cols-3 text-center text-8xl' updateBoard={updateBoardLogic} over={winner} />
      </div>
    </>
  )
}