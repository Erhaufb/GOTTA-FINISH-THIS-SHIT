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

  updatedAmount: number | undefined;
  originalCards: any[] = [];
  cardsList: any[] = [];
  selectedCardData: any = {};
  searchTerm: string = '';

  constructor(private cardsService: CardsService) { }

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(): void {
    // Fetch original cards from localStorage on component initialization
    const storedCards = localStorage.getItem('cards');
    this.originalCards = storedCards ? JSON.parse(storedCards) : [];

    // Update card amounts from local storage
    this.originalCards.forEach((card: any) => {
      const storedAmount = localStorage.getItem(`card_${card.id}`);
      if (storedAmount !== null) {
        card.amount_in_stock = Number(storedAmount);
      }
    });

    // If selected card is present, update it in the original list
    if (this.selectedCardData.id) {
      const selectedCardIndex = this.originalCards.findIndex((card: { id: any; }) => card.id === this.selectedCardData.id);
      if (selectedCardIndex !== -1) {
        this.originalCards[selectedCardIndex] = { ...this.selectedCardData };
      }
    }

    // Apply search filter
    this.filterCards();

    // Save the updated cards to localStorage
    this.saveCardsToLocalStorage();
  }

  updateCardAmount(card: any): void {
    if (this.updatedAmount !== undefined) {
      card.amount_in_stock = this.updatedAmount;

      // Use a unique key for each card in local storage
      localStorage.setItem(`card_${card.id}`, this.updatedAmount.toString());

      // Save the updated cards to localStorage
      this.saveCardsToLocalStorage();

      // Reset the updatedAmount variable
      this.updatedAmount = undefined;
    }
  }

  showCardDetails(card: any): void {
    // Implement logic to display detailed card information
    console.log('Clicked on card:', card);

    // Update selectedCardData
    this.selectedCardData = { ...card };

    // Save the selected card data to localStorage
    localStorage.setItem('selectedCardData', JSON.stringify(this.selectedCardData));

    const newAmount = prompt('Enter the new amount in stock:');
    if (newAmount !== null) {
      // Update only the selected card
      this.selectedCardData.amount_in_stock = Number(newAmount);

      // Use a unique key for the selected card in local storage
      localStorage.setItem(`card_${this.selectedCardData.id}`, newAmount);

      // Update the selected card in the list
      const selectedCardIndex = this.cardsList.findIndex(c => c.id === this.selectedCardData.id);
      if (selectedCardIndex !== -1) {
        this.cardsList[selectedCardIndex].amount_in_stock = this.selectedCardData.amount_in_stock;
      }

      // Save the updated cards to localStorage
      this.saveCardsToLocalStorage();
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
    this.saveCardsToLocalStorage();
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
    event.preventDefault();  // Add this line to prevent the default behavior
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
      this.saveCardsToLocalStorage();
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

      const existingCard = this.originalCards.find(card => card.name === newCard.name);

      if (existingCard) {
        existingCard.amount_in_stock = newCard.amount_in_stock;
        localStorage.setItem(`card_${existingCard.id}`, existingCard.amount_in_stock.toString());
      } else {
        this.originalCards.push(newCard);
        localStorage.setItem(`card_${newCard.id}`, newCard.amount_in_stock.toString());
      }
    }

    // Apply search filter
    this.filterCards();

    // Save the updated cards to localStorage
    this.saveCardsToLocalStorage();
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

  private saveCardsToLocalStorage(): void {
    localStorage.setItem('cards', JSON.stringify(this.originalCards));
  }

  private filterCards(): void {
    // Filter cards based on search term
    if (this.searchTerm) {
      this.cardsList = this.filterCardsByName(this.originalCards, this.searchTerm);
    } else {
      // If there's no search term, display all cards
      this.cardsList = [...this.originalCards];
    }
  }

  private filterCardsByName(cards: any[], searchTerm: string): any[] {
    return cards.filter(card => card.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
}
