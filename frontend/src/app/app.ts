import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly isLoggedIn = signal(false);
  
  constructor(private router: Router) {
   
    const service = localStorage.getItem('service');
    this.isLoggedIn.set(!!service);
  }
  
  logout() {
    localStorage.clear();
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }
}