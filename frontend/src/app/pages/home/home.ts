import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  
 
  selectedLieuPoste: string = '';
  
 
  selectedLieuBanque: string = '';
  
  
  lieuxData = [
    { id: 1, nom: 'Boumhel', adresse: 'Rue principale, Boumhel', code_postal: '5012', etablissement_id: 1 },
    { id: 2, nom: 'Borj Cédria', adresse: 'Avenue de la République', code_postal: '2070', etablissement_id: 1 },
    { id: 3, nom: 'Tunis Centre', adresse: 'Avenue Habib Bourguiba', code_postal: '1000', etablissement_id: 1 },
    { id: 4, nom: 'Ben Arous', adresse: 'Avenue de la République', code_postal: '2013', etablissement_id: 1 },
    { id: 5, nom: 'Hammam Lif', adresse: 'Avenue Habib Thameur', code_postal: '2050', etablissement_id: 1 },
    { id: 6, nom: 'Tunis Centre', adresse: 'Avenue de la Liberté', code_postal: '1000', etablissement_id: 2 },
    { id: 7, nom: 'Ben Arous', adresse: 'Rue de Carthage', code_postal: '2013', etablissement_id: 2 }
  ];
  
  constructor(private router: Router) {}
  
  selectEtablissementAvecLieu(etablissementId: number, etablissementNom: string, etablissementImage: string, lieuId: string) {
    
    
    if (!lieuId) {
      alert('Veuillez sélectionner une agence');
      return;
    }
    
    
    const lieu = this.lieuxData.find(l => l.id === parseInt(lieuId));
    
    if (!lieu) {
      alert('Agence non trouvée');
      return;
    }
    
    const etablissement = {
      id: etablissementId,
      nom: etablissementNom,
      image: etablissementImage,
      lieu: lieu
    };
    
  
    localStorage.setItem('selected_etablissement', JSON.stringify(etablissement));
    localStorage.setItem('selected_lieu', JSON.stringify(lieu));
    
    
    this.router.navigate(['/login']);
  }
}