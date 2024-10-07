import { Component } from '@angular/core';
import { ChessBoard } from 'src/app/chess-logic/chess-board';
import { pieceImagePaths } from 'src/app/chess-logic/models';
import { Color, FENChar } from 'src/app/chess-logic/pieces/models';

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

  public isSquareDark(x: number, y: number): boolean{
    return ChessBoard.isSquareDark(x, y);
  }
}
