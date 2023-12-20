import { BoardPropsType } from "@/type/BoardProps"


export default function Board(props: BoardPropsType) {
  const board = props.boardState;
  return (
    <>
      <div className={`${props.className}`}>
        {board.map((cell, i) => {
          let classes = "border-black";
          if (i % 3 != 2) classes += " border-e"; 
          if (i % 3 != 0) classes += " border-s";
          if (i >= 3) classes += " border-t";
          if (i <= 5) classes += " border-b"
          return (
            // return a square div
            <div
              key={i}
              className={`flex justify-center items-center ${classes} h-[100px] w-[100px] hover:cursor-pointer ${props.win ? 'pointer-events-none' : 'pointer-events-auto'}`}
              onClick={() => props.updateBoard(i)}
            >
              {cell}
            </div>
          )}
        )}
      </div>
    </>
  )
}