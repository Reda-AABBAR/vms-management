import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
{ 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full'
},{ 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [AuthGuard], 
},{ 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) 
},
{ 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];
