'use client';


import { useRouter } from 'next/navigation'


export default function Home() {
  const router = useRouter();

  const createNewGame = async () => {
    const res = await fetch('http://localhost:5000/api/newGameID');
    const data = await res.text();
    console.log(data)
    router.push(`/${data}`);
  }

  const joinGame = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const gameID = (e.currentTarget as HTMLFormElement).gameID.value;
    console.log(gameID)
    const res = await fetch('http://localhost:5000/api/checkGameID/' + gameID);
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
      <div className="h-screen w-screen flex flex-col justify-center items-center">
        <div>
          <p className="text-4xl">Tic Tac Toe</p>
        </div>
        <div className="flex flex-wrap items-center justify-center text-center bg-gray-100">
          <div className="w-96">
            <button type="button" onClick={createNewGame}>Create new game</button>
          </div>
          <div className="w-96">
            <form className="flex flex-col items-center" onSubmit={joinGame}>
              <input type='text' name="gameID" id='gameID' placeholder="Enter a game ID" className="w-1/2"></input>
              <button type="submit">Join game</button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}