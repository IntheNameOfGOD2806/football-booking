import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MockDataService } from '../../services/mock-data.service';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-field-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule
  ],
  templateUrl: './field-list.component.html',
  styleUrls: ['./field-list.component.css']
})
export class FieldListComponent implements OnInit {
  fields: Field[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.loadFields();
  }

  loadFields() {
    this.mockDataService.getFields().subscribe(fields => {
      this.fields = fields;
    });
  }

  deleteField(id: string) {
    if (confirm('Are you sure you want to delete this field?')) {
      this.mockDataService.deleteField(id).subscribe(() => {
        this.loadFields();
      });
    }
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'active': 'primary',
      'inactive': 'warn',
      'maintenance': 'accent'
    };
    return colors[status] || '';
  }
}
