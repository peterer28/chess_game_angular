import { FENChar } from "src/app/chess-logic/models";

export type StockfishQueryParams = {
    fen: string;
    depth: number;
    mode: string;
}

export type ChessMove = {
    prevX: number;
    prevY: number;
    newX: number;
    newY: number;
    promotedPiece: FENChar | null;
}

export type StockfishResponse = {
    succes: boolean; 
    data: string;
}