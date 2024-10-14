import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChessBoardComponent } from '../chess-board/chess-board.component';
import { StockfishService } from './stockfish.service';
import { ChessBoardService } from '../chess-board/chess-board.service';
import { Subscription, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-computer-mode',
  templateUrl: '../chess-board/chess-board.component.html',
  styleUrls: ['../chess-board/chess-board.component.css']
})
export class ComputerModeComponent extends ChessBoardComponent implements OnInit, OnDestroy{
  private subscription$ = new Subscription();
  constructor(private stockfishService: StockfishService){
    super(inject(ChessBoardService));
  }

  ngOnInit(): void {
    const chessBoardStateSubscription$: Subscription = this.chessBoardService.chessBoardState$.subscribe({
      next: async (FEN: string) => {
        const player: string = FEN.split(" ")[1];
        if(player === "w") return;

        const {prevX, prevY, newX, newY, promotedPiece} = await firstValueFrom(this.stockfishService.getBestMove(FEN));
        this.updateBoard(prevX, prevY, newX, newY, promotedPiece);
      }
    });

    this.subscription$.add(chessBoardStateSubscription$);
  }

  public ngOnDestroy(): void {
      this.subscription$.unsubscribe();
  }
}
