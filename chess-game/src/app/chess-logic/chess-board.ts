import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { knight } from "./pieces/knight";
import { Color } from "./pieces/models";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./pieces/piece";
import { Queen } from "./pieces/queen";
import { Rook } from "./pieces/rook";

export class ChessBoard{
    private chessBoard:(Piece|null)[][];
    private _PlayerColor = Color.White;
    
    constructor(){
        this.chessBoard = [
            [
                new Rook(Color.White), new knight(Color.White), new Bishop(Color.White), new Queen(Color.White),
                new King(Color.White), new Bishop(Color.White), new knight(Color.White), new Rook(Color.White)
            ],
            [
                new Pawn(Color.White), new Pawn(Color.White),new Pawn(Color.White), new Pawn(Color.White), 
                new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), 
            ],
            [ null, null, null, null, null, null, null, null ],
            [ null, null, null, null, null, null, null, null ],
            [ null, null, null, null, null, null, null, null ],
            [ null, null, null, null, null, null, null, null ],
            [
                new Pawn(Color.Black), new Pawn(Color.Black),new Pawn(Color.Black), new Pawn(Color.Black), 
                new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), 
            ],
            [
                new Rook(Color.Black), new knight(Color.Black), new Bishop(Color.Black), new Queen(Color.Black),
                new King(Color.Black), new Bishop(Color.Black), new knight(Color.Black), new Rook(Color.Black)
            ]
        ]
    }

    public get playerColor(): Color{
        return this._PlayerColor;
    }

    public get chessBoardView(): (FENchar|null)[][]{
        return this.chessBoard.map(row => {
            return row.map(piece => piece instanceof Piece ? piece.FENChar : null);
        })
    }
}