import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

type Slide = {
  title: string; // الجزء المتغير بعد "جدير"
  description: string; // الوصف
  action: string;
  buttonText: string; // نص الزر
  buttonLink: string; // لينك الزر
  image: string; // مسار الصورة
};

@Component({
  selector: 'app-home-main',
  imports: [CommonModule, RouterLink],
  templateUrl: './home-main.component.html',
  styleUrl: './home-main.component.css',
})
export class HomeMainComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,

  ) {}
  slides: Slide[] = [
    {
      title: 'تحتاج استشارة متخصصة؟',
      description:
        'في جدير تجد نخبة من الخبراء المتطوعين في مجالات متعددة: الإدارة، الحوكمة، التقنية، القانون، الموارد البشرية، المالية، الإعلام، الأوقاف، الجودة وغيرها.أكثر من 250 خبيرًا وأكثر من 3800 مستخدم',
      buttonText: 'ابدأ الآن',
      buttonLink: '/Consulting_areas',
      action: 'link',

      image: 'assets/images/main.png',
    },
    {
      title: 'خبراء من كل مكان في خدمتك',
      description:
        'جدير منصة رقمية وتطبيق جوال يقدم خدمات استشارية موجّهة للأفراد والجمعيات الأهلية عبر ربطهم بخبراء متطوعين من مختلف مناطق المملكة.',
      buttonText: 'احصل على استشارتك',
      buttonLink: '/Consulting_areas',
      action: 'link',
      image: 'assets/images/main.png',
    },
    {
      title: 'استشارة واحدة ',
      action: 'download', // 🔹 هنا بدل ما هو لينك عادي
      description:
        'استشر نخبة من الخبراء المعتمدين في مجالات متعددة، واحصل على مشورة تثق بها، نؤمن أن الخبرات ركيزة لنمو المعرفة القطاع غير الربحي وتعظيم أثره',
      buttonText: 'حمل التطبيق',
      buttonLink: '/join-expert',
      image: 'assets/images/main.png',
    },
  ];

  currentIndex = 0;
  intervalId: any;

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    }, 5000);
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    // اختياري: إعادة ضبط المؤقت بعد التنقل اليدوي
    clearInterval(this.intervalId);
    this.startAutoSlide();
  }
  goToDownload(): void {
    const downloadId = 'downloadSection';

    if (this.router.url !== '/') {
      // لو مش على الصفحة الرئيسية، نروح ليها ونستنى بعدها نعمل سكرول
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          const element = document.getElementById(downloadId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500); // ⏱️ ننتظر شوية عشان الصفحة تكون خلصت تحميل
      });
    } else {
      // لو إحنا بالفعل على الصفحة الرئيسية
      const element = document.getElementById(downloadId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}
