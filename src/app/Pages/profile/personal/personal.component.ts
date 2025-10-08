import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CitiesService } from '../../../services/cities.service';
import { InputsComponent } from '../../../shared/inputs/inputs.component';
import { SharedSelectComponent } from '../../../shared/shared-select/shared-select.component';
import { CategoriesService } from '../../../services/categories.service';
import { MultiSelectComponent } from "../../../shared/multi-select/multi-select.component";

@Component({
  selector: 'app-personal',
  imports: [
    CommonModule,
    InputsComponent,
    ReactiveFormsModule,
    SharedSelectComponent,
    MultiSelectComponent,
  ],
  templateUrl: './personal.component.html',
  styleUrl: './personal.component.css',
})
export class PersonalComponent implements OnInit {
  userData: any = null;
  editForm: FormGroup;
  isSubmitted = false;
  isSubmitting = false;
  isEditMode = false;
  cityOptions: { label: string; value: number }[] = [];

  constructor(
    private fb: FormBuilder,
    private citiesService: CitiesService,
    private authService: AuthService,
    private categoriesService: CategoriesService
  ) {
    this.editForm = this.fb.group({
      first_name: ['', Validators.required],
      middle_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birth_day: [''],
      city_id: [''],
      categories: [[]], // 👈✨ أهي دي!

      description: [''],
      education: this.fb.array([this.fb.control('')]), // واحد افتراضي
      experience: this.fb.array([this.fb.control('')]), // واحد افتراضي
    });
  }
  get educationControls() {
    return this.editForm.get('education') as FormArray;
  }

  get experienceControls() {
    return this.editForm.get('experience') as FormArray;
  }

  addEducationField() {
    this.educationControls.push(this.fb.control(''));
  }

  removeEducationField(index: number) {
    if (this.educationControls.length > 1)
      this.educationControls.removeAt(index);
  }

  addExperienceField() {
    this.experienceControls.push(this.fb.control(''));
  }

  removeExperienceField(index: number) {
    if (this.experienceControls.length > 1)
      this.experienceControls.removeAt(index);
  }

  ngOnInit(): void {
    this.loadCategories();

    this.loadCities();
    const storedData = localStorage.getItem('user');

    if (storedData) {
      this.userData = JSON.parse(storedData);
          this.fetchUserData();

    }
  }
  categoryOptions: { label: string; value: number }[] = [];

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (res) => {
        this.categoryOptions = res.data.data.map((cat: any) => ({
          label: cat.title,
          value: cat.id,
        }));
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      },
    });
  }

  fetchUserData(): void {
    console.log(this.userData);

    const userType = this.userData?.type === 'user' ? 'individual' : 'expert'; // or get from localStorage if stored
    this.authService.getProfile(userType).subscribe({
      next: (response) => {
        this.userData = response?.data;
        localStorage.setItem('user', JSON.stringify(response?.data));
        this.loadFormData();
      },
      error: (error) => {
        console.error('Failed to fetch user data:', error);
        // Fallback to local storage if API fails
        const storedData = localStorage.getItem('user');
        if (storedData) {
          this.userData = JSON.parse(storedData);
          this.loadFormData();
        }
      },
    });
  }

  getCityName(cityId: number): string {
    const city = this.cityOptions.find((c) => c.value === cityId);
    return city ? city.label : 'غير محدد';
  }

  loadFormData(): void {
    this.editForm.patchValue({
      first_name: this.userData.first_name,
      middle_name: this.userData.middle_name || '',
      last_name: this.userData.last_name,
      email: this.userData.email,
      birth_day: this.userData.birth_day || '',
      city_id: this.userData.city_id || '',
      description: this.userData.description || '', // 👈
      categories: this.userData.categories?.map((cat: any) => cat.id) || [], // 👈
    });

    // Populate education
    if (this.userData.education?.length) {
      const eduArray = this.editForm.get('education') as FormArray;
      eduArray.clear();
      this.userData.education.forEach((edu: string) =>
        eduArray.push(this.fb.control(edu))
      );
    }

    // Populate experience
    if (this.userData.experience?.length) {
      const expArray = this.editForm.get('experience') as FormArray;
      expArray.clear();
      this.userData.experience.forEach((exp: any) =>
        expArray.push(this.fb.control(exp.description))
      );
    }
  }

  loadCities(): void {
    // this.citiesService.getCities().subscribe({
    //   next: (cities) => {
    //     this.cityOptions = cities;
    //   },
    //   error: (err) => {
    //     console.error('Failed to load cities:', err);
    //     this.cityOptions = [];
    //   },
    // });
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userData.image = e.target.result;
        // Here you can add code to upload the image to the server
      };
      reader.readAsDataURL(file);
    }
  }

  enableEditMode(): void {
    this.isEditMode = true;
  }

  onSubmit(): void {
    // this.isSubmitted = true;
    if (this.editForm.invalid) {
      return;
    }

    // this.isSubmitting = true;

    const updateData = {
      ...this.editForm.value,
      city_id: Number(this.editForm.value.city_id),
      education: this.educationControls.value.filter(
        (e: string) => e.trim() !== ''
      ),
      experience: this.experienceControls.value.filter(
        (e: string) => e.trim() !== ''
      ),
    };

    const userType = this.userData.type === 'user' ? 'individual' : 'expert'; // or get from localStorage if stored

    // this.authService.updateProfile(updateData, userType).subscribe({
    //   next: (response) => {
    //     this.isSubmitting = false;
    //     console.log(response.data);
    //     this.fetchUserData();
    //     this.userData = response?.data;
    //     localStorage.setItem('user', JSON.stringify(response?.data));
    //     this.isEditMode = false;
    //   },
    //   error: (error) => {
    //     this.isSubmitting = false;
    //     console.error('Error updating profile:', error);
    //   },
    // });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    // Reset form to original values
    this.loadFormData();
  }
}
