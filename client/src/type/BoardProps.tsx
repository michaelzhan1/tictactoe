export interface BoardPropsType {
  boardState: string[];
  className?: string;
  updateBoard: (i: number) => void;
  over: string;
}