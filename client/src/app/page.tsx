import Board from '@/components/Board'


export default function Home() {
  const board = ['x', '', 'o', 'x', '', 'o', 'x', '', 'o'];
  return (
    <>
      <div className='flex h-screen w-screen items-center justify-center'>
        <Board boardState={board} className='grid grid-cols-3 text-center text-8xl' />
      </div>
    </>
  )
}