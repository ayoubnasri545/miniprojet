import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-guichet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guichet.html',
  styleUrls: ['./guichet.css']
})
export class GuichetComponent implements OnInit {
  
  current: any = null;
  serviceName: string = '';
  etablissementNom: string = '';
  etablissementImage: string = '.';
  lieuNom: string = '';
  loading: boolean = false;
  message: string = '';
  
  constructor(private http: HttpClient) {}
  
  ngOnInit() {
    const etabSaved = localStorage.getItem('selected_etablissement');
    const lieuSaved = localStorage.getItem('selected_lieu');
    
    if (etabSaved) {
      const etab = JSON.parse(etabSaved);
      this.etablissementNom = etab.nom;
      this.etablissementImage = etab.image;
    }
    
    if (lieuSaved) {
      const lieu = JSON.parse(lieuSaved);
      this.lieuNom = lieu.nom;
    }
    
    this.loadGuichetInfo();
  }
  
  loadGuichetInfo() {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.http.get(`http://127.0.0.1:8000/guichet/${userId}`)
        .subscribe({
          next: (data: any) => {
            this.serviceName = data.service_nom || 'Service';
          },
          error: (err) => {
            console.error('Erreur:', err);
            this.serviceName = 'Guichet standard';
          }
        });
    }
  }
  
  next() {
    this.loading = true;
    this.message = '';
    
    const etablissementId = localStorage.getItem('etablissement_id') || '1';
    
    this.http.get(`http://127.0.0.1:8000/next/${etablissementId}`)
      .subscribe({
        next: (res: any) => {
          if (res.message) {
            this.message = res.message;
            this.current = null;
          } else {
            this.current = res;
            this.message = `Ticket ${res.numero} appelé pour ${this.serviceName}`;
          }
          this.loading = false;
          setTimeout(() => {
            if (this.message && !this.current) {
              this.message = '';
            }
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.message = 'Erreur lors de l\'appel';
          this.loading = false;
        }
      });
  }
}