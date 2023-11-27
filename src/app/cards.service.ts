import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class CardsService {

  private baseUrl = 'http://localhost:3000';  // Your backend server URL. Modify if needed.

  constructor(private http: HttpClient) { }

  getCards() {
    return this.http.get(`${this.baseUrl}/cards`);
  }
}
