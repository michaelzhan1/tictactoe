import io, { Socket } from 'socket.io-client';


const URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
export const socket: Socket = io(URL, { autoConnect: false });