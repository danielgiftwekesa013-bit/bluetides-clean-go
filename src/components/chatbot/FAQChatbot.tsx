import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Droplets, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const FAQ_RESPONSES: Record<string, string> = {
  'pricing': 'Our pricing varies by service:\n• Clothes: KES 100/kg\n• Duvets: KES 800 each\n• Carpets: KES 750/sqm\n• Blankets: KES 300 each\n• Shoes: KES 150/pair\n• Mats: KES 200 each\n\n📦 Pickup & Delivery: Always FREE!',
  'delivery': '🚚 Great news! All pickups and deliveries are completely FREE! We come to you anywhere in Kenya\'s major cities.',
  'pickup': '📅 You can schedule a pickup through our website:\n1. Go to "Schedule Pickup"\n2. Select date & time\n3. Add your items\n4. We\'ll be there!\n\nRemember: Pickups are FREE!',
  'turnaround': '⏰ Our standard turnaround is 24-48 hours. Express service (same day) is available for an additional fee. Larger items like carpets may take 3-5 days.',
  'loyalty': '🎁 Our loyalty program rewards you:\n• Earn 1 point per KES 100 spent\n• 100 points = KES 100 off your next order\n• Exclusive member discounts\n• Birthday bonuses!',
  'subscription': '📋 Monthly subscription plans:\n• Basic: KES 2,000/month (20kg clothes)\n• Standard: KES 3,500/month (40kg + 2 duvets)\n• Premium: KES 5,000/month (unlimited clothes + home items)\n\nAll plans include FREE pickup & delivery!',
  'services': '👕 We clean:\n• Clothes (regular & dry cleaning)\n• Duvets & Comforters\n• Blankets\n• Carpets & Rugs\n• Mats\n• Shoes\n\nAll with professional care and eco-friendly products!',
  'payment': '💳 We accept:\n• M-Pesa\n• Cash on delivery\n• Credit/Debit cards\n• Bank transfer\n\nPayment is due upon delivery.',
  'contact': '📞 Reach us:\n• WhatsApp: 0725263396 or 0759298247\n• Instagram: @bluetideslaundry\n• TikTok: @bluetideslaundry\n\nWe\'re here to help!',
  'hours': '🕐 Operating hours:\n• Monday-Saturday: 7AM - 8PM\n• Sunday: 9AM - 5PM\n\nPickups can be scheduled anytime during these hours.',
};

const findBestResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  // Check for keyword matches
  if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('how much') || lowerQuery.includes('rate')) {
    return FAQ_RESPONSES.pricing;
  }
  if (lowerQuery.includes('delivery') || lowerQuery.includes('deliver')) {
    return FAQ_RESPONSES.delivery;
  }
  if (lowerQuery.includes('pickup') || lowerQuery.includes('pick up') || lowerQuery.includes('schedule') || lowerQuery.includes('book')) {
    return FAQ_RESPONSES.pickup;
  }
  if (lowerQuery.includes('time') || lowerQuery.includes('long') || lowerQuery.includes('turnaround') || lowerQuery.includes('when')) {
    return FAQ_RESPONSES.turnaround;
  }
  if (lowerQuery.includes('loyalty') || lowerQuery.includes('points') || lowerQuery.includes('reward')) {
    return FAQ_RESPONSES.loyalty;
  }
  if (lowerQuery.includes('subscription') || lowerQuery.includes('plan') || lowerQuery.includes('monthly')) {
    return FAQ_RESPONSES.subscription;
  }
  if (lowerQuery.includes('service') || lowerQuery.includes('clean') || lowerQuery.includes('wash') || lowerQuery.includes('what do you')) {
    return FAQ_RESPONSES.services;
  }
  if (lowerQuery.includes('pay') || lowerQuery.includes('mpesa') || lowerQuery.includes('card')) {
    return FAQ_RESPONSES.payment;
  }
  if (lowerQuery.includes('contact') || lowerQuery.includes('phone') || lowerQuery.includes('whatsapp') || lowerQuery.includes('call')) {
    return FAQ_RESPONSES.contact;
  }
  if (lowerQuery.includes('hour') || lowerQuery.includes('open') || lowerQuery.includes('close')) {
    return FAQ_RESPONSES.hours;
  }
  if (lowerQuery.includes('free')) {
    return FAQ_RESPONSES.delivery;
  }
  if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
    return '👋 Hello! Welcome to Bluetides Laundry! I\'m here to help you with:\n\n• Pricing information\n• Scheduling pickups\n• Delivery times\n• Loyalty & subscriptions\n\nWhat would you like to know?';
  }
  
  return '🤔 I\'m not sure about that specific question. Here are some topics I can help with:\n\n• Pricing & rates\n• Pickup scheduling\n• Delivery information\n• Turnaround times\n• Loyalty program\n• Subscription plans\n• Payment methods\n• Contact information\n\nOr contact us directly on WhatsApp: 0725263396';
};

const FAQChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Hi! I\'m the Bluetides Assistant. How can I help you today?\n\nAsk me about pricing, delivery, subscriptions, or anything else!',
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = findBestResponse(input);
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
      isBot: true,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, botMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    'What are your prices?',
    'Is delivery free?',
    'How do I schedule a pickup?',
  ];

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-ocean shadow-strong flex items-center justify-center transition-all hover:scale-110',
          isOpen && 'hidden'
        )}
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] h-[500px] bg-card rounded-2xl shadow-strong border border-border flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="gradient-ocean p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">Bluetides Assistant</h3>
                <p className="text-xs text-primary-foreground/70">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
            >
              <X className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.isBot ? 'justify-start' : 'justify-end'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line',
                    message.isBot
                      ? 'bg-secondary text-secondary-foreground rounded-bl-md'
                      : 'gradient-ocean text-primary-foreground rounded-br-md'
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon" disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FAQChatbot;
