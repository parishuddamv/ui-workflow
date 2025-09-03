
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientService } from '../services/client.service';
import { Client } from '../model/client.model';

@Component({
  selector: 'app-create-client',
  imports: [FormsModule, CommonModule],
  templateUrl: './create-client.component.html',
  styleUrl: './create-client.component.scss'
})
export class CreateClientComponent implements OnInit {
    clients: Client[] = [];
    message: string = '';
  
    constructor(private clientService: ClientService) {}
    newClientName: string = '';
  
  addClient(): void {
    if (!this.newClientName.trim()) {
      this.message = 'Client name cannot be empty';
      return;
    }
    this.clientService.addClient(this.newClientName).subscribe({
      next: (client) => {
        this.clients.push(client);
        this.message = `Client ${client.name} added successfully`;
        this.newClientName = '';
      },
      error: (err) => console.error('Failed to add client', err)
    });
  }
  
    ngOnInit(): void {
      this.loadClients();
    }
  
    loadClients(): void {
      this.clientService.getAllClients().subscribe({
        next: (data) => this.clients = data,
        error: (err) => console.error('Failed to load clients', err)
      });
    }
  
    updateClient(client: Client): void {
      this.clientService.updateClient(client.id, client.name).subscribe({
        next: (updated) => {
          this.message = `Client ${updated.name} updated successfully`;
          console.log('Updated client:', updated);
        },
        error: (err) => console.error('Failed to update client', err)
      });
    }
  }

