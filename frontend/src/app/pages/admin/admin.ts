import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  
  activeTab: string = 'users';
  
 
  users: any[] = [];
  services: any[] = [];
  etablissements: any[] = [];
  guichets: any[] = [];
  employes: any[] = [];
  
 
  newUser = { nom: '', prenom: '', service: 1, username: '', password: '' };
  newService = { nom: '', guichet_id: '', employe_id: '' };

  showAddUser: boolean = false;
  showAddService: boolean = false;
  message: string = '';
  
  constructor(private http: HttpClient, private router: Router) {}
  
  ngOnInit() {
    this.loadUsers();
    this.loadServices();
    this.loadEtablissements();
    this.loadGuichets();
    this.loadEmployes();
  }

  loadUsers() {
    this.http.get('http://127.0.0.1:8000/users')
      .subscribe({
        next: (res: any) => {
          this.users = res;
          this.employes = res.filter((u: any) => u.service === 2);
        },
        error: (err) => {
          console.error('Erreur chargement employés:', err);
        }
      });
  }
  loadServices() {
    this.http.get('http://127.0.0.1:8000/services')
      .subscribe({
        next: (res: any) => {
          this.services = res;
        },
        error: (err) => {
          console.error('Erreur chargement services:', err);
        }
      });
  }
  

  loadEtablissements() {
    this.http.get('http://127.0.0.1:8000/etablissements')
      .subscribe({
        next: (res: any) => {
          this.etablissements = res;
        },
        error: (err) => {
          console.error('Erreur chargement établissements:', err);
          this.etablissements = [
            { id: 1, nom: 'Poste Tunisienne' },
            { id: 2, nom: 'Banque Centrale de Tunisie' }
          ];
        }
      });
  }
  

  loadGuichets() {
    this.http.get('http://127.0.0.1:8000/guichets')
      .subscribe({
        next: (res: any) => {
          this.guichets = res;
        },
        error: (err) => {
          console.error('Erreur chargement guichets:', err);
          this.guichets = [
            { id: 1, numero: 1 },
            { id: 2, numero: 2 },
            { id: 3, numero: 3 }
          ];
        }
      });
  }
  
  loadEmployes() {
    this.http.get('http://127.0.0.1:8000/users?service=2')
      .subscribe({
        next: (res: any) => {
          this.employes = res;
        },
        error: (err) => {
          console.error('Erreur chargement employés:', err);
          this.employes = [
            { id: 1, nom: 'Ahmed', prenom: 'Ben Ali' },
            { id: 2, nom: 'Sara', prenom: 'Mansour' }
          ];
        }
      });
  }
  
 
  addUser() {
    if (!this.newUser.nom || !this.newUser.username) {
      this.message = '❌ Nom et username requis';
      setTimeout(() => this.message = '', 3000);
      return;
    }
    
    this.http.post('http://127.0.0.1:8000/users', this.newUser)
      .subscribe({
        next: (res: any) => {
          this.users.push(res);
          if (res.service === 2) {
            this.employes.push(res);
          }
          this.newUser = { nom: '', prenom: '', service: 1, username: '', password: '' };
          this.showAddUser = false;
          this.message = 'Employé ajouté';
          setTimeout(() => this.message = '', 3000);
        },
        error: (err) => {
          this.message = '❌ Erreur lors de l\'ajout';
          setTimeout(() => this.message = '', 3000);
        }
      });
  }
  
  
  deleteUser(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      this.http.delete(`http://127.0.0.1:8000/users/${id}`)
        .subscribe({
          next: () => {
       
            this.users = this.users.filter(user => user.id !== id);
            this.employes = this.employes.filter(emp => emp.id !== id);
            this.message = ' Employé supprimé';
            setTimeout(() => this.message = '', 3000);
          },
          error: (err) => {
            this.message = '❌ Erreur lors de la suppression';
            setTimeout(() => this.message = '', 3000);
          }
        });
    }
  }
  
  addService() {
    if (!this.newService.nom) {
      this.message = '❌ Nom du service requis';
      setTimeout(() => this.message = '', 3000);
      return;
    }
    
    const serviceData = {
      nom: this.newService.nom,
      guichet_id: this.newService.guichet_id || null,
      employe_id: this.newService.employe_id || null
    };
    
    this.http.post('http://127.0.0.1:8000/services', serviceData)
      .subscribe({
        next: (res: any) => {
          const guichet = this.guichets.find(g => g.id == this.newService.guichet_id);
          const employe = this.employes.find(e => e.id == this.newService.employe_id);
          
          res.guichet_numero = guichet?.numero;
          res.employe_nom = employe?.nom;
          res.employe_prenom = employe?.prenom;
          
          this.services.push(res);
          this.newService = { nom: '', guichet_id: '', employe_id: '' };
          this.showAddService = false;
          this.message = ' Service ajouté';
          setTimeout(() => this.message = '', 3000);
        },
        error: (err) => {
          this.message = '❌ Erreur lors de l\'ajout';
          setTimeout(() => this.message = '', 3000);
        }
      });
  }
  

  deleteService(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      this.http.delete(`http://127.0.0.1:8000/services/${id}`)
        .subscribe({
          next: () => {
            this.services = this.services.filter(service => service.id !== id);
            this.message = ' Service supprimé';
            setTimeout(() => this.message = '', 3000);
          },
          error: (err) => {
            this.message = '❌ Erreur lors de la suppression';
            setTimeout(() => this.message = '', 3000);
          }
        });
    }
  }
  
  
  getEtablissementName(id: number): string {
    const etab = this.etablissements.find(e => e.id === id);
    return etab ? etab.nom : 'Inconnu';
  }
  
  
  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}