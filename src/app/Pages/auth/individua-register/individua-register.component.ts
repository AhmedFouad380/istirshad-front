import { Component, OnInit } from '@angular/core';
import { InputsComponent } from '../../../shared/inputs/inputs.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SharedSelectComponent } from '../../../shared/shared-select/shared-select.component';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  FormArray,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CitiesService } from '../../../services/cities.service';
import { ToastrService } from 'ngx-toastr';
import { MultiSelectComponent } from "../../../shared/multi-select/multi-select.component";
import { CategoriesService } from '../../../services/categories.service';
import { firebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-individua-register',
  standalone: true,
  imports: [
    InputsComponent,
    NgSelectModule,
    CommonModule,
    SharedSelectComponent,
    ReactiveFormsModule,
    MultiSelectComponent,
  ],
  templateUrl: './individua-register.component.html',
  styleUrls: ['./individua-register.component.css'],
})
export class IndividuaRegisterComponent implements OnInit {
  type: string = 'individual';
  registerForm: FormGroup;
  isSubmitting: boolean = false;
  isSubmitted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private firebaseService: firebaseService,

    private citiesService: CitiesService, // إضافة الخدمة
    private toastr: ToastrService, // إضافة الخدمة
    private categoriesService: CategoriesService
  ) {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      middle_name: ['', Validators.required],
      last_name: ['', Validators.required],
      description: ['', Validators.required],
      gender: [''],

      phone: [
        '966',
        [Validators.required, Validators.pattern(/^966[0-9]{9}$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      birth_day: [''],
      city_id: ['', Validators.required],
            area_id: ['', Validators.required],

    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.route.queryParams.subscribe((params) => {
      this.type = params['type'] || 'individual';

      // رقم الهاتف من الـ URL
      if (params['phone']) {
        this.registerForm.patchValue({
          phone: params['phone'],
        });
      }

      // ✅ لو النوع expert أضف الحقول الإضافية:
      if (this.type === 'expert') {
        this.registerForm.addControl(
          'national_id_number',
          this.fb.control('', Validators.required)
        );
        this.registerForm.addControl(
          'national_id_image',
          this.fb.control(null)
        );

        this.registerForm.addControl(
          'categories',
          this.fb.control([], Validators.required)
        );
        this.registerForm.addControl(
          'education',
          this.fb.array([this.fb.control('')])
        ); // قائمة بالمدخلات
        this.registerForm.addControl(
          'cv',
          this.fb.control(null, [
            this.fileTypeValidator(['pdf', 'doc', 'docx']),
          ])
        );
        this.registerForm.addControl(
          'experience',
          this.fb.array([this.fb.control('')])
        );
      }
    });

const cityCtrl = this.registerForm.get('city_id')!;
  cityCtrl.disable();           // ⛔ مبدئيًا مقفول

  this.registerForm.get('area_id')?.valueChanges.subscribe((areaId) => {

    cityCtrl.reset();
    this.cityOptions = [];

    if (!areaId) {
      cityCtrl.disable();
      return;
    }
    cityCtrl.enable();
    this.loadCities(Number(areaId));
  });
          this.loadareas();

  }

  get educationControls() {
    return this.registerForm.get('education') as FormArray;
  }

  get experienceControls() {
    return this.registerForm.get('experience') as FormArray;
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

  loadCities(areaId: number): void {
  this.citiesService.getCities(areaId).subscribe({
    next: (cities) => {
      this.cityOptions = cities;
    },
    error: (err) => {
      console.error('Failed to load cities:', err);
      this.cityOptions = [];
    },
  });
}

   loadareas(): void {
    this.citiesService.getAreas().subscribe({
      next: (areas) => {
        this.areasOptions = areas;
      },
      error: (err) => {
        console.error('Failed to load cities:', err);
        // يمكنك إضافة مدن افتراضية هنا كنسخة احتياطية
        this.areasOptions = [];
      },
    });
  }
  getFormControl(controlName: string): AbstractControl | null {
    return this.registerForm.get(controlName);
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.isSubmitting = true;

    const values = this.registerForm.value;
    const hasFiles =
      this.selectedFile !== null ||
      (values.cv && values.cv instanceof File) ||
      this.experienceFiles.some((exp) => exp.file !== null);

    let payload: any;

    if (hasFiles) {
      // ✅ تجهيز البيانات باستخدام FormData
      const formData = new FormData();
      formData.append('first_name', values.first_name);
      formData.append('middle_name', values.middle_name);
      formData.append('last_name', values.last_name);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('birth_day', values.birth_day || '');
      formData.append('city_id', values.city_id);
      formData.append('description', values.description);

      if (this.type === 'expert') {
        formData.append('national_id_number', values.national_id_number);

        if (this.selectedFile) {
          formData.append('national_id_image', this.selectedFile);
        }

        values.categories.forEach((cat: any, index: number) => {
          formData.append(`categories[${index}]`, cat);
        });

        values.education.forEach((item: string, index: number) => {
          formData.append(`education[${index}]`, item);
        });

        this.experienceFiles.forEach((exp, index) => {
          if (exp.file) {
            formData.append(`experience[${index}]`, exp.file);
          }
        });

        if (values.cv) {
          formData.append('cv', values.cv);
        }
      }

      payload = formData;
    } else {
      // ✅ JSON Payload بدون ملفات
      payload = {
        ...values,
      };
    }

    // ✅ استدعاء الخدمة
    this.authService.register(payload, this.type).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toastr.success('تم تسجيل الدخول بنجاح');

        const token = res?.data?.token;
        const user = res?.data?.user;
        if (token && user) {
          this.authService.storeToken(token, user);
          this.authService.forceRefresh();
          localStorage.setItem('user', JSON.stringify(user));
          this.authService.checkRedirect();
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Registration error:', err);
      },
    });
  }

  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const cvFile = input.files[0];

      this.registerForm.patchValue({ cv: cvFile });
      this.registerForm.get('cv')?.updateValueAndValidity();

      console.log('📄 CV File selected:', cvFile); // تأكيد أنه اتسجل
    }
  }

  cityOptions: { label: string; value: number }[] = []; // تغيير نوع البيانات
    areasOptions: { label: string; value: number }[] = []; // تغيير نوع البيانات

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
  genderOptions = [
    { label: 'ذكر', value: 'male' },
    { label: 'أنثى', value: 'female' },
  ];
  fileName: string = '';
  selectedFile: File | null = null;
  experienceFiles: { file: File | null; fileName: string }[] = [
    { file: null, fileName: '' }, // عنصر افتراضي موجود دائمًا
  ];
  addExperienceFile() {
    this.experienceFiles.push({ file: null, fileName: '' });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;

      // تحديث الفورم أيضًا
      this.registerForm.patchValue({ national_id_image: this.selectedFile });
      this.registerForm.get('national_id_image')?.updateValueAndValidity();
    }
  }
  fileTypeValidator(allowedTypes: string[]) {
    return (control: AbstractControl) => {
      const file = control.value;
      if (!file) return null;

      const fileName = file.name || '';
      const extension = fileName.split('.').pop()?.toLowerCase();
      if (extension && allowedTypes.includes(extension)) {
        return null; // ✅ valid
      }

      return { invalidFileType: true }; // ❌ invalid
    };
  }
}
