import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatbotService } from './chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  isOpen = false;
  messages: { from: 'user' | 'bot', text: string }[] = [];
  userInput = '';
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(private chatbotService: ChatbotService) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
    setTimeout(() => this.scrollToBottom(), 100);
  }

  sendMessage() {
    if (!this.userInput.trim()) return;
    const userMsg = this.userInput;
    this.messages.push({ from: 'user', text: userMsg });
    this.userInput = '';
    this.scrollToBottom();
    // Real API call
    if (this.chatbotService.endpointUrl) {
      this.messages.push({ from: 'bot', text: '...' }); // Loading indicator
      const loadingIndex = this.messages.length - 1;
      this.chatbotService.sendMessage(userMsg).subscribe({
        next: (res) => {
          this.messages[loadingIndex] = { from: 'bot', text: res?.reply || 'No response from server.' };
          this.scrollToBottom();
        },
        error: (err) => {
          let errorMsg = 'Error connecting to server.';
          if (err?.error?.message) errorMsg = err.error.message;
          this.messages[loadingIndex] = { from: 'bot', text: errorMsg };
          this.scrollToBottom();
        }
      });
    } else {
      setTimeout(() => {
        this.messages.push({ from: 'bot', text: 'This is a bot response for: ' + userMsg });
        this.scrollToBottom();
      }, 800);
    }
  }

  scrollToBottom() {
    if (this.chatContainer) {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }, 50);
    }
  }
}
