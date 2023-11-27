import { Component, OnInit } from '@angular/core';
import { CardsService } from '../cards.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  cardsList: any[] = [];

  constructor(private cardsService: CardsService) { }

  ngOnInit(): void {
    this.cardsService.getCards().subscribe(
      (data: any) => {
        this.cardsList = data;
      },
      error => {
        console.error("Error fetching cards", error);
      }
    );
  }
}
