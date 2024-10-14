import { Component } from '@angular/core';
import { ChessBoard } from 'src/app/chess-logic/chess-board';
import { CheckState, Coords, LastMove, pieceImagePaths, SafeSquares } from 'src/app/chess-logic/models';
import { Color, FENChar } from 'src/app/chess-logic/pieces/models';
import { SelectedSquare } from './models';
import { retry } from 'rxjs';
import { ChessBoardService } from './chess-board.service';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.css']
})
export class ChessBoardComponent {
  public pieceImagePaths = pieceImagePaths;

  private chessBoard = new ChessBoard();
  public chessBoardView: (FENChar | null)[][] = this.chessBoard.chessBoardView;
  public get playerColor(): Color {return this.chessBoard.playerColor; };
  public get safeSquares(): SafeSquares{return this.chessBoard.safeSquares;};
  public get gameOverMessage(): string | undefined {return this.chessBoard.gameOverMessage; };

  private selectedSquare: SelectedSquare = {piece: null};
  private pieceSafeSquares: Coords[] = [];
  private lastMove:LastMove|undefined = this.chessBoard.lastMove;
  private checkState:CheckState = this.chessBoard.checkState;

  public gameHistoryPointer: number = 0;

  //promotion properties
  public isPromotionActive: boolean = false;
  private promotionCoords: Coords|null = null;
  private promotedPiece:FENChar|null = null;
  public promotionPieces(): FENChar[]{
    return this.playerColor === Color.White ?
    [FENChar.WhiteKnight, FENChar.WhiteBishop, FENChar.WhiteRook, FENChar.WhiteQueen] : 
    [FENChar.BlackKnight, FENChar.BlackBishop, FENChar.BlackRook, FENChar.BlackQueen]
  }

  public flipMode: boolean = false;

  constructor(protected chessBoardService: ChessBoardService){ }

  public flipBoard(): void{
    this.flipMode = !this.flipMode;
  }

  public isSquareDark(x: number, y: number): boolean{
    return ChessBoard.isSquareDark(x, y);
  }

  public isSquareSelected(x: number, y: number): boolean{
    if(!this.selectedSquare.piece) return false;
    return this.selectedSquare.x === x && this.selectedSquare.y === y;
  }

  public isSquareSafeForSelectedPiece(x: number, y: number): boolean{
    return this.pieceSafeSquares.some(coords => coords.x === x && coords.y === y);
  }

  public isSquareLastMove(x: number, y: number): boolean{
    if(!this.lastMove) return false;
    const {prevX, prevY, currX, currY} = this.lastMove;
    return x === prevX && y === prevY || x === currX && y === currY;
  }

  public isSquareChecked(x: number, y: number): boolean{
    return this.checkState.isInCheck && this.checkState.x === x && this.checkState.y === y;
  }

  public isSquarePromotionSquare(x: number, y: number): boolean{
    if(!this.promotionCoords) return false;
    return this.promotionCoords.x === x && this.promotionCoords.y === y;    
  }

  private unmarkingPreviouslySelectedAndSafeSquares(): void{
    this.selectedSquare = {piece:null};
    this.pieceSafeSquares = [];

    if(this.isPromotionActive){
      this.isPromotionActive = false;
      this.promotedPiece = null;
      this.promotionCoords = null;
    }
  }

  private selectingPiece(x: number, y: number): void{
    if(this.gameOverMessage !== undefined) return;
    const piece: FENChar | null = this.chessBoardView[x][y];
    if(!piece) return;
    if(this.isWrongPieceSelected(piece)) return;

    const isSameSquareClicked: boolean = !!this.selectedSquare.piece && this.selectedSquare.x === x && this.selectedSquare.y === y;
    this.unmarkingPreviouslySelectedAndSafeSquares();
    if(isSameSquareClicked) return;

    this.selectedSquare = {piece, x, y};
    this.pieceSafeSquares = this.safeSquares.get(x + "," + y) || [];
  }

  private placingPiece(newX: number, newY: number): void{
    if(!this.selectedSquare.piece) return;
    if(!this.isSquareSafeForSelectedPiece(newX, newY)) return;
    
    //pawn promotion
    const isPawnSelected: boolean = this.selectedSquare.piece === FENChar.WhitePawn || this.selectedSquare.piece === FENChar.BlackPawn;
    const isPawOnlastRank: boolean = isPawnSelected && (newX === 7 || newX === 0);
    const shouldOpenPromotionDialog: boolean = !this.isPromotionActive && isPawOnlastRank;

    if(shouldOpenPromotionDialog){
      this.pieceSafeSquares = [];
      this.isPromotionActive = true;
      this.promotionCoords = {x: newX, y: newY};
      // now we  waith for player to choose promoted piece
      return;
    }

    const {x: prevX, y: prevY} = this.selectedSquare;
    this.updateBoard(prevX, prevY, newX, newY, this.promotedPiece);
  }

  protected updateBoard(prevX: number, prevY: number, newX: number, newY: number, promotedPiece: FENChar | null): void {
    this.chessBoard.move(prevX, prevY, newX, newY, promotedPiece);
    this.chessBoardView = this.chessBoard.chessBoardView;
    //this.markLastMoveAndCheckState(this.chessBoard.lastMove, this.chessBoard.checkState);
    this.unmarkingPreviouslySelectedAndSafeSquares();
    this.chessBoardService.chessBoardState$.next(this.chessBoard.boardAsFEN);
    this.gameHistoryPointer++;
  }

  public promotePiece(piece: FENChar): void{
    if(!this.promotionCoords || !this.selectedSquare.piece) return;
    this.promotedPiece = piece; 
    const {x: newX, y: newY} = this.promotionCoords;
    const {x: prevX, y: prevY} = this.selectedSquare;
    this.updateBoard(prevX, prevY, newX, newY, this.promotedPiece);
  }

  public closePawnPromotionDialog(): void{
    this.unmarkingPreviouslySelectedAndSafeSquares();

  }

  /*private markLastMoveAndCheckState(lastMove: LastMove | undefined, checkState: CheckState): void {
    this.lastMove = lastMove;
    this.checkState = checkState;

    if (this.lastMove)
      this.moveSound(this.lastMove.moveType);
    else
      this.moveSound(new Set<MoveType>([MoveType.BasicMove]));
  }*/
  
  public move(x: number, y: number): void{
    this.selectingPiece(x, y);
    this.placingPiece(x, y);
  }

  private isWrongPieceSelected(piece: FENChar): boolean{
    const isWhitePieceSelected: boolean = piece === piece.toUpperCase();
    return isWhitePieceSelected && this.playerColor === Color.Black || !isWhitePieceSelected && this.playerColor === Color.White;
  }

}
