import { Routes } from '@angular/router';
import { TaskListComponent } from './task/task-list.component';
import { TaskCreateComponent } from './task/task-create.component';
import { authGuard } from './services/auth.guard'; // Corrected import path
import { CreateClientComponent } from './create-client/create-client.component';
import { TaskEditComponent } from './task-edit/task-edit.component';
import { TaskHistoryComponent } from './task-history/task-history.component';

export const routes: Routes = [
  { path: '', component: TaskListComponent, canActivate: [authGuard] },
  { path: 'create', component: TaskCreateComponent, canActivate: [authGuard] }, 
  {path: 'clients', component: CreateClientComponent, canActivate: [authGuard] }, 
   { path: 'edit/:id', component: TaskEditComponent , canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];