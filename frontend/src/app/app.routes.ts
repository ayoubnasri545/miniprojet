import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { AdminComponent } from './pages/admin/admin';
import { ClientComponent } from './pages/client/client';
import { GuichetComponent } from './pages/guichet/guichet';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'client', component: ClientComponent },
  { path: 'guichet', component: GuichetComponent }
];