import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MockDataService } from '../../services/mock-data.service';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-field-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './field-form.component.html',
  styleUrls: ['./field-form.component.css']
})
export class FieldFormComponent implements OnInit {
  fieldForm: FormGroup;
  isEditMode = false;
  fieldId: string | null = null;
  availableAmenities = ['Lighting', 'Parking', 'Locker Rooms', 'Shower', 'Air Conditioning', 'Water Fountain', 'Equipment Rental', 'Coaching Available', 'Beach Access', 'Changing Rooms'];
  selectedAmenities: string[] = [];

  fieldTypes = [
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'volleyball', label: 'Volleyball' },
    { value: 'other', label: 'Other' }
  ];

  statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  constructor(
    private fb: FormBuilder,
    private mockDataService: MockDataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.fieldForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      pricePerHour: ['', [Validators.required, Validators.min(1)]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      imageUrl: ['', Validators.required],
      status: ['active', Validators.required],
      address: ['', Validators.required],
      startTime: ['08:00', Validators.required],
      endTime: ['22:00', Validators.required]
    });
  }

  ngOnInit() {
    this.fieldId = this.route.snapshot.paramMap.get('id');
    if (this.fieldId) {
      this.isEditMode = true;
      this.loadField(this.fieldId);
    }
  }

  loadField(id: string) {
    this.mockDataService.getFieldById(id).subscribe(field => {
      if (field) {
        this.selectedAmenities = field.amenities;
        this.fieldForm.patchValue({
          name: field.name,
          type: field.type,
          description: field.description,
          pricePerHour: field.pricePerHour,
          capacity: field.capacity,
          imageUrl: field.imageUrl,
          status: field.status,
          address: field.address,
          startTime: field.operatingHours.start,
          endTime: field.operatingHours.end
        });
      }
    });
  }

  toggleAmenity(amenity: string) {
    const index = this.selectedAmenities.indexOf(amenity);
    if (index >= 0) {
      this.selectedAmenities.splice(index, 1);
    } else {
      this.selectedAmenities.push(amenity);
    }
  }

  onSubmit() {
    if (this.fieldForm.valid) {
      const formValue = this.fieldForm.value;
      const field: Field = {
        id: this.fieldId || Date.now().toString(),
        name: formValue.name,
        type: formValue.type,
        description: formValue.description,
        pricePerHour: formValue.pricePerHour,
        capacity: formValue.capacity,
        amenities: this.selectedAmenities,
        imageUrl: formValue.imageUrl,
        status: formValue.status,
        address: formValue.address,
        operatingHours: {
          start: formValue.startTime,
          end: formValue.endTime
        },
        createdAt: new Date()
      };

      if (this.isEditMode) {
        this.mockDataService.updateField(field).subscribe(() => {
          this.router.navigate(['/dashboard/fields']);
        });
      } else {
        this.mockDataService.addField(field).subscribe(() => {
          this.router.navigate(['/dashboard/fields']);
        });
      }
    }
  }

  cancel() {
    this.router.navigate(['/dashboard/fields']);
  }
}
