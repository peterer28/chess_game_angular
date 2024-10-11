import { CheckState, Coords, LastMove, SafeSquares } from "./models";
import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { knight } from "./pieces/knight";
import { Color, FENChar } from "./pieces/models";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./pieces/piece";
import { Queen } from "./pieces/queen";
import { Rook } from "./pieces/rook";

export class ChessBoard{
    private chessBoard:(Piece|null)[][];
    private _PlayerColor = Color.White;
    private _safeSquares: SafeSquares;
    private readonly chessBoardSize: number = 8;
    private _lastMove: LastMove|undefined;
    private _checkState: CheckState = {isInCheck: false};

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
        ];
        this._safeSquares = this.findSafeSquares();
    }

    public get playerColor(): Color{
        return this._PlayerColor;
    }

    public get chessBoardView(): (FENChar|null)[][]{
        return this.chessBoard.map(row => {
            return row.map(piece => piece instanceof Piece ? piece.FENChar : null);
        })
    }

    public get safeSquares(): SafeSquares{
        return this._safeSquares;
    }

    public get lastMove(): LastMove|undefined{
        return this._lastMove; 
    }

    public get checkState(): CheckState{
        return this._checkState;
    }

    public static isSquareDark(x: number, y: number): boolean{
        return x % 2 === 0 && y % 2 === 0 || x % 2 === 1 && y % 2 === 1;
    }

    public areCoordsValid(x: number, y: number): boolean{
        return x >= 0 && y >= 0 && x < this.chessBoardSize && y < this.chessBoardSize;
    }

    public isInCheck(playerColor: Color, checkingCurrentPosition: boolean): boolean{
        for(let x = 0; x<this.chessBoardSize; x++){
            for(let y = 0; y<this.chessBoardSize; y++){
                const piece: Piece|null = this.chessBoard[x][y];
                if(!piece || piece.color === playerColor) continue;

                for(const {x: dx, y: dy} of piece.directions){
                    let newX: number = x + dx;
                    let newY: number = y + dy;

                    if(!this.areCoordsValid(newX, newY)) continue;
                    
                    if(piece instanceof Pawn || piece instanceof knight || piece instanceof King){
                        //pawns can only attack diagonally
                        if(piece instanceof Pawn && dy === 0) continue;

                        const attackedPiece: Piece|null = this.chessBoard[newX][newY];
                        if(attackedPiece instanceof King && attackedPiece.color === playerColor) {
                            if(checkingCurrentPosition) this._checkState = {isInCheck: true, x: newX, y: newY};
                            return true;
                        }
                    }
                    else{
                        while(this.areCoordsValid(newX, newY)){
                            const attackedPiece: Piece|null = this.chessBoard[newX][newY];
                            if(attackedPiece instanceof King && attackedPiece.color === playerColor) {
                                if(checkingCurrentPosition) this._checkState = {isInCheck: true, x: newX, y: newY};
                                return true;
                            }

                            if(attackedPiece !== null) break;

                            newX += dx;
                            newY += dy;
                        }
                    }
                }
            }
        }
        if(checkingCurrentPosition) this._checkState = {isInCheck: false};
        return false;
    }

    private isPositionSafeAfterMove(piece: Piece, prevX: number, prevY: number, newX: number, newY: number): boolean{
        const newPiece: Piece|null = this.chessBoard[newX][newY];
        //can't put a piece over an occupied square with the same color piece
        if(newPiece && newPiece.color === piece.color) return false;

        //simulate position
        this.chessBoard[prevX][prevY] = null;
        this.chessBoard[newX][newY] = piece;

        const isPositionSafe: boolean = !this.isInCheck(piece.color, false);

        //restore position back 
        this.chessBoard[prevX][prevY] = piece;
        this.chessBoard[newX][newY] = newPiece;

        return isPositionSafe;
    }

    private findSafeSquares(): SafeSquares{
        const SafeSquares: SafeSquares = new Map<string, Coords[]>();
        
        for(let x = 0; x<this.chessBoardSize; x++){
            for(let y = 0; y<this.chessBoardSize; y++){
                const piece: Piece|null = this.chessBoard[x][y];
                if(!piece || piece.color !== this._PlayerColor) continue;

                const pieceSafeSquares: Coords[] = [];

                for(const {x: dx, y: dy} of piece.directions){
                    let newX: number = x + dx;
                    let newY: number = y + dy;

                    if(!this.areCoordsValid(newX, newY)) continue;

                    let newPiece: Piece|null = this.chessBoard[newX][newY];
                    if(newPiece && newPiece.color === piece.color) continue;
                    
                    //need to restrict pawn movements in certain directions
                    if(piece instanceof Pawn){
                        //can't move pawn two squares straight if there is a piece in front of it
                        if(dx === 2 || dx === -2){
                            if(newPiece) continue;
                            if(this.chessBoard[newX + (dx === 2 ? -1: 1)][newY]) continue;
                        }

                        //can't move pawn one square straight if there is a piece in front of it
                        if((dx === 1 || dx === -1) && dy === 0 && newPiece) continue;

                        //can't move pawn diagonally if there is no piece, or piece is the same color as it
                        if((dy === 1 || dy === -1) && (!newPiece || piece.color === newPiece.color)) continue;
                    }
                    if(piece instanceof Pawn || piece instanceof knight || piece instanceof King){
                        if(this.isPositionSafeAfterMove(piece, x, y, newX, newY))
                            pieceSafeSquares.push({x: newX, y: newY});
                    }
                    else{
                        while(this.areCoordsValid(newX, newY)){
                            newPiece = this.chessBoard[newX][newY];
                            if(newPiece && newPiece.color === piece.color) break;

                            if(this.isPositionSafeAfterMove(piece, x, y, newX, newY))
                                pieceSafeSquares.push({x: newX, y: newY});
                            if(newPiece !== null) break;

                            newX += dx;
                            newY += dx;
                        }
                    }
                }
                
                if(piece instanceof King){
                    if(this.canCastle(piece, true))
                        pieceSafeSquares.push({x, y:6})

                    if(this.canCastle(piece, false))
                        pieceSafeSquares.push({x, y: 2});
                }
                else if(piece instanceof Pawn && this.canCaptureEnPassant(piece, x, y)){
                    pieceSafeSquares.push({x: x +(piece.color === Color.White ? 1 : -1), y: this._lastMove!.prevY});
                }

                if(pieceSafeSquares.length)
                    SafeSquares.set(x + "," + y, pieceSafeSquares);
            }        
        }
        return SafeSquares; 
    }

    private canCaptureEnPassant(pawn: Pawn, pawnX: number, pawnY: number): boolean{
        if(!this._lastMove) return false;
        const {piece, prevX, prevY, currX, currY} = this._lastMove;
        if(
            !(piece instanceof Pawn) ||
            pawn.color !== this._PlayerColor ||
            Math.abs(currX - prevX) !== 2 ||
            pawnX !== currX ||
            Math.abs(pawnY - currY) !== 1            
        ) return false;

        const pawnNewPositionX: number = pawnX + (pawn.color === Color.White ? 1 : -1)
        const pawnNewPositionY: number = currY;

        this.chessBoard[currX][currY] = null;
        const isPositionSafe: boolean = this.isPositionSafeAfterMove(pawn, pawnX, pawnY, pawnNewPositionX, pawnNewPositionY);
        this.chessBoard[currX][currY] = piece;

        return isPositionSafe;
    }

    private canCastle(king: King, kingSideCastle: boolean): boolean{
        if(king.hasMoved) return false;

        const kingPositionX: number = king.color === Color.White ? 0 : 7;
        const kingPositionY: number = 4;
        const rookPositionX: number = kingPositionX;
        const rookPositionY: number = kingSideCastle ? 7 : 0;
        const rook: Piece|null = this.chessBoard[rookPositionX][rookPositionY];

        if(!(rook instanceof Rook) || rook.hasMoved || this._checkState.isInCheck) return false;
        
        const firstNextKingPositionY: number = kingPositionY + (kingSideCastle ? 1 : -1);
        const secondNextKingPositionY: number = kingPositionY + (kingSideCastle ? 2 : -2);
        
        if(this.chessBoard[kingPositionX][firstNextKingPositionY] || this.chessBoard[kingPositionX][secondNextKingPositionY]) return false;
        
        if(!kingSideCastle && this.chessBoard[kingPositionX][1]) return false;

        return this.isPositionSafeAfterMove(king, kingPositionX, kingPositionY, kingPositionX, firstNextKingPositionY) && 
            this.isPositionSafeAfterMove(king, kingPositionX, kingPositionY, kingPositionX, secondNextKingPositionY);
    }

    public move(prevX: number, prevY: number, newX: number, newY: number, ): void{
        if(!this.areCoordsValid(prevX, prevY)  || !this.areCoordsValid(newX, newY)) return;
        const piece: Piece|null = this.chessBoard[prevX][prevY];
        if(!piece || piece.color !== this._PlayerColor) return;

        const pieceSafeSquares: Coords []|undefined = this._safeSquares.get(prevX + "," + prevY);
        if(!pieceSafeSquares || !pieceSafeSquares.find(coords => coords.x === newX && coords.y === newY))
            throw new Error("Square is nor safe");
        
        if((piece instanceof Pawn || piece instanceof King || piece instanceof Rook) && !piece.hasMoved)
            piece.hasMoved = true;
        
        this.handlingSpecialMoves(piece, prevX, prevY, newX, newY);
        //update board
        this.chessBoard[prevX][prevY] = null;
        this.chessBoard[newX][newY] = piece;

        this._lastMove={prevX, prevY, currX:newX, currY:newY, piece};
        this._PlayerColor = this._PlayerColor === Color.White ? Color.Black : Color.White;
        this.isInCheck(this._PlayerColor, true);
        this._safeSquares = this.findSafeSquares();            
    }

    private handlingSpecialMoves(piece:Piece, prevX: number, prevY: number, newX: number, newY: number): void{
        if(piece instanceof King && Math.abs(newY - prevY) === 2){
            //newY > prevY === king side castle

            const rookPositionX: number = prevX;
            const rookPositionY: number = newY > prevY ? 7 : 0;
            const rook = this.chessBoard[rookPositionX][rookPositionY] as Rook;
            const rookNewPositionY: number = newY > prevY ? 5 : 3;
            this.chessBoard[rookPositionX][rookNewPositionY] = null; 
            this.chessBoard[rookPositionX][rookNewPositionY] = rook;
            rook.hasMoved = true;
        }
    }
}