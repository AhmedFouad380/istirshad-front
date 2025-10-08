import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fields-section',
  imports: [CommonModule],
  templateUrl: './fields-section.component.html',
  styleUrls: ['./fields-section.component.css'],
})
export class FieldsSectionComponent implements OnInit {
  currentIndex = 0;

  experts = [
    {
      category: 'إدارة وتطوير المشاريع',
      count: 62,
      description:
        'إدارة المشاريع، تنظيم العمل، وتنفيذ خطط التطور المختلفة، ويشمل أيضًا بناء علاقات جديدة مع عملاء محتملين.',
      image: 'assets/images/expoooo.png',
    },
    {
      category: 'الذكاء الاصطناعي',
      count: 45,
      description:
        'تحليل البيانات، بناء النماذج الذكية، تطبيق الحلول التنبؤية، والتعامل مع الأنظمة التلقائية.',
      image: 'assets/images/expoooo.png',
    },
  ];

  ngOnInit(): void {
    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.experts.length;
    }, 6000);
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }
}
