// cards.component.ts

import { Component, OnInit } from '@angular/core';
import { CardsService } from '../cards.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  cardsList: any[] = [];

  constructor(private cardsService: CardsService) { }

  ngOnInit(): void {
    // Fetch cards from localStorage on component initialization
    const storedCards = localStorage.getItem('cards');
    this.cardsList = storedCards ? JSON.parse(storedCards) : [];

    // Update card amounts from local storage
    this.cardsList.forEach((card: any) => {
      const storedAmount = localStorage.getItem(`card_${card.id}`);
      if (storedAmount !== null) {
        card.amount_in_stock = Number(storedAmount);
      }
    });
  }

  showCardDetails(card: any): void {
    // Implement logic to display detailed card information
    console.log('Clicked on card:', card);
    const newAmount = prompt('Enter the new amount in stock:');
    if (newAmount !== null) {
      card.amount_in_stock = Number(newAmount);
  
      // Use a unique key for each card in local storage
      localStorage.setItem(`card_${card.id}`, newAmount);
  
      // Save the updated cards to localStorage
      localStorage.setItem('cards', JSON.stringify(this.cardsList));
    }
  }
  

  updateCard(card: any): void {
    // Implement logic to update the card in the database
    console.log('Updated card:', card);
    // Call your service method to update the card in the database
    // Example: this.cardsService.updateCard(card).subscribe(/* handle response */);
  }

  confirmDelete(card: any, index: number): void {
    const isConfirmed = window.confirm('Are you sure you want to delete this card?');
    if (isConfirmed) {
      this.deleteCard(index);
    }
  }

  deleteCard(index: number): void {
    const cardToDelete = this.cardsList[index];

    // Implement logic to delete the card from the database
    console.log('Deleted card:', cardToDelete);
    // Call your service method to delete the card in the database
    // Example: this.cardsService.deleteCard(cardToDelete).subscribe(/* handle response */);

    // Remove the card from the local list and update localStorage
    this.cardsList.splice(index, 1);
    localStorage.setItem('cards', JSON.stringify(this.cardsList));
  }

  onFileDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.readFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;
    if (files && files.length > 0) {
      this.readFile(files[0]);
    }
  }

  readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target?.result as string;
      this.processCSVContents(contents);

      // Save the updated cards to localStorage
      localStorage.setItem('cards', JSON.stringify(this.cardsList));
    };
    reader.readAsText(file);
  }

  processCSVContents(contents: string): void {
    const rows = contents.split('\n');

    for (let i = 1; i < rows.length; i++) {
      const values = this.parseCSVRow(rows[i]);
    
      const newCard = {
        name: values[0],
        rarity: values[1],
        type: values[2],
        nation: values[3],
        amount_in_stock: parseInt(values[4], 10) || 0,
        id: uuidv4(), // Use UUIDs for unique IDs
      };

      const existingCard = this.cardsList.find(card => card.name === newCard.name);

      if (existingCard) {
        existingCard.amount_in_stock = newCard.amount_in_stock;
        localStorage.setItem(`card_${existingCard.id}`, existingCard.amount_in_stock.toString());
      } else {
        this.cardsList.push(newCard);
        localStorage.setItem(`card_${newCard.id}`, newCard.amount_in_stock.toString());
      }
    }

    // Save the updated cards to localStorage
    localStorage.setItem('cards', JSON.stringify(this.cardsList));
  }

  private parseCSVRow(row: string): string[] {
    const regex = /(?:,|\n|^)(?:"([^"]*(?:""[^"]*)*)"|([^",\n]*))/g;
    const values: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(row))) {
      values.push(match[1] || match[2]);
    }

    return values;
  }

  private generateUniqueId(card: any): string {
    const uniqueString = `${card.name}${card.rarity}${card.type}${card.nation}`;
    const hash = this.hashCode(uniqueString);
    return `card_${hash}`;
  }
  
  
  private hashCode(s: string): number {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      const char = s.charCodeAt(i);
      hash = (hash << 5) - hash + char;
    }
    return hash;
  }
}