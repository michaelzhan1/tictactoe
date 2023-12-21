'use client';


import { useRouter } from 'next/navigation'


export default function Home() {
  const router = useRouter();

  const createNewGame = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/newGameID');
    const data = await res.text();
    console.log(data)
    router.push(`/${data}`);
  }

  const joinGame = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const gameID = (e.currentTarget as HTMLFormElement).gameID.value;
    console.log(gameID)
    const res = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/checkGameID/' + gameID);
    const data = await res.text();
    if (data == 'false') {
      alert('Game ID not found!');
      return;
    } else {
      router.push(`/${gameID}`);
    }
  }

  return (
    <>
      <div className="w-screen flex flex-col items-center">
        <div className='mt-32 mb-24'>
          <p className="text-6xl">Tic Tac Toe</p>
        </div>
        <div className="flex flex-wrap items-center justify-center text-center bg-gray-100 py-20">
          <div className="w-80">
            <button type="button" onClick={createNewGame} className='bg-green-300 border border-black p-3'>Create new game</button>
          </div>
          <div className="w-80">
            <form className="flex flex-col items-center" onSubmit={joinGame}>
              <input type='text' name="gameID" id='gameID' placeholder="Enter a game ID" className="w-1/2 placeholder:text-center mb-3 p-3 text-lg border-black border"></input>
              <button type="submit" className='bg-green-300 border border-black p-3'>Join game</button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}