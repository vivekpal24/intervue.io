export interface ChatMessage {
    id: string;
    sender: string;
    text: string;
    timestamp: number;
}

class ChatService {
    private messages: ChatMessage[] = [];
    private rateLimits = new Map<string, { count: number, resetTime: number }>();

    public addMessage(sender: string, text: string): ChatMessage {
        const trimmedText = text.trim();
        if (!trimmedText) {
            throw new Error('Message cannot be empty.');
        }

        if (trimmedText.length > 200) {
            throw new Error('Message exceeds 200 characters.');
        }

        if (!this.checkRateLimit(sender, 5, 10000)) {
            throw new Error('Rate limit exceeded. Please wait before chatting.');
        }

        const message: ChatMessage = {
            id: Math.random().toString(36).substring(2, 9),
            sender,
            text: trimmedText,
            timestamp: Date.now()
        };

        this.messages.push(message);
        return message;
    }

    public getMessages(): ChatMessage[] {
        return this.messages;
    }

    public clearChat() {
        this.messages = [];
        this.rateLimits.clear();
    }

    private checkRateLimit(sender: string, maxRequests: number, windowMs: number): boolean {
        const now = Date.now();
        const info = this.rateLimits.get(sender);

        if (!info) {
            this.rateLimits.set(sender, { count: 1, resetTime: now + windowMs });
            return true;
        }

        if (now > info.resetTime) {
            info.count = 1;
            info.resetTime = now + windowMs;
            return true;
        }

        if (info.count >= maxRequests) {
            return false;
        }

        info.count++;
        return true;
    }
}

export default new ChatService();
