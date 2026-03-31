import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  
  user = { username: '', password: '' };
  selectedEtablissement: any = null;
  selectedLieu: any = null;
  loading: boolean = false;
  errorMessage: string = '';
  
  constructor(private http: HttpClient, private router: Router) {}
  
  ngOnInit() {
    const etabSaved = localStorage.getItem('selected_etablissement');
    const lieuSaved = localStorage.getItem('selected_lieu');
    
    if (etabSaved) {
      this.selectedEtablissement = JSON.parse(etabSaved);
    } else {
      this.router.navigate(['/']);
    }
    
    if (lieuSaved) {
      this.selectedLieu = JSON.parse(lieuSaved);
    } else {
      this.router.navigate(['/']);
    }
  }
  
  login() {
    if (!this.user.username || !this.user.password) {
      this.errorMessage = 'Veuillez saisir vos identifiants';
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    const loginData = {
      username: this.user.username,
      password: this.user.password,
      etablissement_id: this.selectedEtablissement?.id,
      lieu_id: this.selectedLieu?.id
    };
    
    this.http.post('http://127.0.0.1:8000/login', loginData)
      .subscribe({
        next: (res: any) => {
          localStorage.setItem('user_id', res.id);
          localStorage.setItem('service', res.service);
          localStorage.setItem('etablissement_id', res.etablissement_id);
          localStorage.setItem('lieu_id', res.lieu_id);
          localStorage.setItem('user_nom', res.nom);
          
          this.loading = false;
          
          if (res.service == 1) {
            this.router.navigate(['/admin']);
          } else if (res.service == 2) {
            this.router.navigate(['/guichet']);
          } else if (res.service == 3) {
            this.router.navigate(['/client']);
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = 'Identifiants incorrects';
          console.error('Login error:', err);
        }
      });
  }
}