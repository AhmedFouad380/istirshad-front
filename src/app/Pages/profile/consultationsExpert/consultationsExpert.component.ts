import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpertConsultationsService } from '../../../services/ExpertConsultations.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingComponent } from "../../../shared/loading/loading.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-consultations',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './consultationsExpert.component.html',
  styleUrls: ['./consultationsExpert.component.css'],
})
export class ConsultationsExpertComponent implements OnInit {
  activeTab: 'pending' | 'accepted' | 'completed' = 'pending';
  consultations: any[] = [];
  loading = true;
  error: string | null = null;

  // Schedule popup variables
  showSchedulePopup = false;
  selectedConsultationId!: number;
  selectedDate: string = '';
  selectedTime: string = '';
  hour: string = '09';
  minute: string = '00';

  // Calendar variables
  currentDate: Date = new Date();
  currentMonth: string = '';
  daysInMonth: number[] = [];
  daysOfWeek: string[] = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ];
  monthNames: string[] = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];
  blankDays: number[] = [];
  selectedDay: number = new Date().getDate();

  constructor(
    private consultationsService: ExpertConsultationsService,
    private router: Router,
    private toaster: ToastrService,
    
  ) {}
  ngOnInit() {
    const now = new Date();

    this.clockHours = now.getHours();
    this.clockMinutes = now.getMinutes();

    // Set time (hour, minute, and input)
    this.hour = this.clockHours.toString().padStart(2, '0');
    this.minute = this.clockMinutes.toString().padStart(2, '0');
    this.timeInput = `${this.hour}:${this.minute}`;

    // Set selected date
    this.selectedDay = now.getDate();
    this.currentDate = now;
    this.updateSelectedDate(); // This sets selectedDate in yyyy-mm-dd format

    // Initialize calendar and clock
    this.fetchConsultations();
    this.initCalendar();
    this.updateClockHands();
  }

  initCalendar() {
    this.updateCalendar();
  }

  updateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Set current month display
    this.currentMonth = `${this.monthNames[month]} ${year}`;

    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    this.daysInMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Get blank days at start of month
    const firstDay = new Date(year, month, 1).getDay();
    this.blankDays = Array(firstDay).fill(0);
  }

  changeMonth(direction: number) {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + direction,
      1
    );
    this.updateCalendar();
  }

  selectDay(day: number) {
    this.selectedDay = day;
    this.updateSelectedDate();
  }

  updateSelectedDate() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;
    this.selectedDate = `${year}-${month
      .toString()
      .padStart(2, '0')}-${this.selectedDay.toString().padStart(2, '0')}`;
  }
  fetchConsultations() {
    this.loading = true;
    this.error = null;

    const request$ =
      this.activeTab === 'pending'
        ? this.consultationsService.getNewConsultations()
        : this.consultationsService.getConsultationsByType(this.activeTab);

    request$.subscribe({
      next: (response) => {
        this.consultations = this.mapConsultations(response.data?.data || []);
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'حدث خطأ أثناء جلب البيانات';
        this.loading = false;
        console.error('Error fetching consultations:', error);
      },
    });
  }

  private mapConsultations(apiData: any[]): any[] {
    return apiData.flatMap((consultation) => {
      const consultants = consultation['consultants-list']?.length
        ? consultation['consultants-list']
        : [
            {
              name: 'غير معين',
              image: 'assets/images/default-profile.png',
              description: 'لا يوجد خبير معين بعد',
            },
          ];

      return consultants.map((consultant: any) => ({
        id: consultation.id,
        consultationData: consultation,
        name: consultant.name,
        image: consultant.image,
        rating: Math.round(consultant.rate || 0),
        count: consultant.consultations_count || 0,
        description:
          consultant.description ||
          consultation.description ||
          'لا يوجد وصف متاح',
        status: this.getStatusText(consultation.type),
        tags:
          consultant.categories?.map((cat: any) => cat.title) ||
          [consultation.category].filter(Boolean),
        type: consultation.type,
        title: consultation.title,
        user: consultation.user,
        consultationDescription: consultation.description,
        category: consultation.category,
        start_time: consultation.start_time || '09:30',
        start_date: consultation.start_date || '6 مارس',
      }));
    });
  }

  changeTab(tab: 'pending' | 'accepted' | 'completed') {
    this.activeTab = tab;
    this.fetchConsultations();
  }

  approveConsultation(id: number) {
    this.consultationsService.acceptConsultation(id).subscribe({
      next: () => {
        this.toaster.success('تمت الموافقة على الاستشارة');
        this.selectedConsultationId = id;
        this.showSchedulePopup = true;
      },
      error: (err) => {
        console.error('Error accepting consultation:', err);
        this.error = 'حدث خطأ أثناء الموافقة على الاستشارة';
      },
    });
  }

  rejectConsultation(id: number) {
    this.consultationsService.rejectConsultation(id).subscribe({
      next: () => {
        this.toaster.success('تم رفض الاستشارة');

        this.fetchConsultations(); // Refresh the list
      },
      error: (err) => {
        console.error('Error rejecting consultation:', err);
        this.error = 'حدث خطأ أثناء رفض الاستشارة';
      },
    });
  }
  goToChat(id: number) {
    this.router.navigate(['/ConsultDetails', id]);
  }
  getStatusText(status: string) {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'accepted':
        return 'جاري';
      case 'completed':
        return 'منتهية';
      default:
        return status;
    }
  }

  closePopup() {
    this.showSchedulePopup = false;
  }
  hours: string[] = Array.from({ length: 25 }, (_, i) =>
    i.toString().padStart(2, '0')
  );
  minutes: string[] = Array.from({ length: 61 }, (_, i) =>
    i.toString().padStart(2, '0')
  );
  // Add these new properties to your component class
  clockHours: number = 9;
  clockMinutes: number = 0;
  clockStyle = {
    hour: { transform: 'rotate(0deg)' },
    minute: { transform: 'rotate(0deg)' },
  };

  // Add this method to update the clock hands
  updateClockHands() {
    // Calculate degrees for clock hands
    const hourDegrees = (this.clockHours % 12) * 30 + this.clockMinutes / 2;
    const minuteDegrees = this.clockMinutes * 6;

    // Update clock hand styles
    this.clockStyle = {
      hour: { transform: `rotate(${hourDegrees}deg)` },
      minute: { transform: `rotate(${minuteDegrees}deg)` },
    };
  }

  // Update the hour and minute change handlers
  onHourChange(hour: string) {
    this.hour = hour;
    this.clockHours = parseInt(hour, 10);
    this.updateClockHands();
  }

  onMinuteChange(minute: string) {
    this.minute = minute;
    this.clockMinutes = parseInt(minute, 10);
    this.updateClockHands();
  }
  // Add these new properties
  timeInput: string = '09:00'; // Default time
  useTimeInput: boolean = false;

  // Add this method to handle manual time input
  onTimeInputChange(time: string) {
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      const [hours, minutes] = time.split(':');
      this.hour = hours.padStart(2, '0');
      this.minute = minutes.padStart(2, '0');
      this.clockHours = parseInt(hours, 10);
      this.clockMinutes = parseInt(minutes, 10);
      this.updateClockHands();
    }
  }

  // Update the submit method to handle both input methods
  submitDateTime() {
    if (!this.selectedDate) {
      this.toaster.info('يرجي اختيار تاريخ');
      return;
    }

    // If using manual input, parse the time
    if (this.useTimeInput) {
      if (!this.timeInput) {
        this.toaster.info('يرجي إدخال الوقت');

        return;
      }
      const [hours, minutes] = this.timeInput.split(':');
      this.hour = hours.padStart(2, '0');
      this.minute = minutes.padStart(2, '0');
    }

    this.selectedTime = `${this.hour}:${this.minute}`;

    const payload = {
      consultation_id: this.selectedConsultationId,
      date: this.selectedDate,
      time: this.selectedTime,
    };

    this.consultationsService.updateConsultationDate(payload).subscribe({
      next: () => {
        this.toaster.success('تم تحديد موعد الاستشاره بنجاح');

        this.showSchedulePopup = false;
        this.fetchConsultations();
      },
      error: (err) => {
        console.error('Error scheduling consultation:', err);
        alert('حدث خطأ أثناء إرسال البيانات');
      },
    });
  }
}
