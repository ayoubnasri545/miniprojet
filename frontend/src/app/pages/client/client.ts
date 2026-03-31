import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client.html',
  styleUrls: ['./client.css']
})
export class ClientComponent implements OnInit {
  
  ticket: any = null;
  lastTicket: any = null;
  etablissementNom: string = '';
  etablissementImage: string = '.';
  lieuNom: string = '';
  services: any[] = [];
  myTickets: any[] = [];
  loading: boolean = false;
  
  // Données de test pour les temps d'attente
  waitTimes: { [key: number]: number } = {
    1: 5, 2: 8, 3: 10, 4: 15,
    5: 12, 6: 20, 7: 7, 8: 9
  };
  
  constructor(private http: HttpClient) {}
  
  ngOnInit() {
    const etabSaved = localStorage.getItem('selected_etablissement');
    const lieuSaved = localStorage.getItem('selected_lieu');
    const userId = localStorage.getItem('user_id');
    
    if (etabSaved) {
      const etab = JSON.parse(etabSaved);
      this.etablissementNom = etab.nom;
      this.etablissementImage = etab.image;
    }
    
    if (lieuSaved) {
      const lieu = JSON.parse(lieuSaved);
      this.lieuNom = lieu.nom;
    }
    
    this.loadServices();
    this.loadMyTickets();
  }
  
  loadServices() {
    const etablissementId = localStorage.getItem('etablissement_id') || '1';
    
    this.http.get(`http://127.0.0.1:8000/services/${etablissementId}`)
      .subscribe({
        next: (data: any) => {
          this.services = data;
        },
        error: (err) => {
          console.error('Erreur:', err);
          if (this.etablissementNom === 'Poste Tunisienne') {
            this.services = [
              { id: 1, nom: 'Retrait d\'argent' },
              { id: 2, nom: 'Transfert d\'argent' },
              { id: 3, nom: 'Paiement factures' },
              { id: 4, nom: 'Services postaux' }
            ];
          } else {
            this.services = [
              { id: 5, nom: 'Virement bancaire' },
              { id: 6, nom: 'Demande de crédit' },
              { id: 7, nom: 'Épargne' },
              { id: 8, nom: 'Change devises' }
            ];
          }
        }
      });
  }
  
  loadMyTickets() {
    this.loading = true;
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
      this.loading = false;
      return;
    }
    
    this.http.get(`http://127.0.0.1:8000/tickets/user/${userId}`)
      .subscribe({
        next: (data: any) => {
          this.myTickets = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement tickets:', err);
          // Données de test
          this.myTickets = [
            { id: 1, numero: 42, service_id: 1, status: 'done', created_at: new Date(Date.now() - 3600000).toISOString(), guichet_id: 1 },
            { id: 2, numero: 43, service_id: 1, status: 'processing', created_at: new Date(Date.now() - 1800000).toISOString(), guichet_id: 1 },
            { id: 3, numero: 44, service_id: 2, status: 'waiting', created_at: new Date(Date.now() - 600000).toISOString(), guichet_id: null }
          ];
          this.loading = false;
        }
      });
  }
  
  prendreTicket(serviceId: number) {
    this.loading = true;
    const etablissementId = localStorage.getItem('etablissement_id') || '1';
    const userId = localStorage.getItem('user_id');
    
    this.http.post(`http://127.0.0.1:8000/ticket/${serviceId}?etablissement_id=${etablissementId}&user_id=${userId}`, {})
      .subscribe({
        next: (res: any) => {
          this.lastTicket = res;
          this.ticket = res;
          this.loading = false;
          this.loadMyTickets();
          
          // Auto fermeture de la notification après 5 secondes
          setTimeout(() => {
            this.closeNotification();
          }, 5000);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
          // Simuler un ticket pour test
          const fakeTicket = {
            id: Math.floor(Math.random() * 1000),
            numero: Math.floor(Math.random() * 100) + 1,
            service_id: serviceId,
            status: 'waiting',
            created_at: new Date().toISOString(),
            guichet_id: null
          };
          this.lastTicket = fakeTicket;
          this.myTickets.unshift(fakeTicket);
          
          setTimeout(() => {
            this.closeNotification();
          }, 5000);
        }
      });
  }
  
  closeNotification() {
    this.lastTicket = null;
  }
  
  getServiceName(serviceId: number): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.nom : 'Inconnu';
  }
  
  getServiceIcon(serviceId: number): string {
    const icons: { [key: number]: string } = {
      1: '💰', 2: '📦', 3: '💳', 4: '📮',
      5: '💸', 6: '🏦', 7: '📈', 8: '💱'
    };
    return icons[serviceId] || '🎫';
  }
  
  getEstimatedWaitTime(serviceId: number): number {
    return this.waitTimes[serviceId] || 10;
  }
  
  getStatusClass(status: string): string {
    if (status === 'waiting') return 'status-waiting-row';
    if (status === 'processing') return 'status-processing-row';
    if (status === 'done') return 'status-done-row';
    return '';
  }
  
  getWaitTime(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Moins d\'1 min';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h ${diffMinutes % 60}min`;
  }
  
  getWaitingCount(): number {
    return this.myTickets.filter(t => t.status === 'waiting').length;
  }
  
  getProcessingCount(): number {
    return this.myTickets.filter(t => t.status === 'processing').length;
  }
  
  getDoneCount(): number {
    return this.myTickets.filter(t => t.status === 'done').length;
  }
}