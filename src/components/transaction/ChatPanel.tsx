import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface Message {
    id: string;
    transaction_id: string;
    sender_id: string;
    sender_email: string;
    sender_role: string;
    content: string;
    created_at: string;
}

interface ChatPanelProps {
    transactionId: string;
    role: "buyer" | "seller" | "admin";
}

const roleColors: Record<string, string> = {
    buyer: "bg-blue-100 text-blue-800",
    seller: "bg-green-100 text-green-800",
    admin: "bg-purple-100 text-purple-800",
};

const roleBadge: Record<string, string> = {
    buyer: "Buyer",
    seller: "Seller",
    admin: "VA",
};

export function ChatPanel({ transactionId, role }: ChatPanelProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("transaction_id", transactionId)
            .order("created_at", { ascending: true });

        if (!error && data) {
            setMessages(data as Message[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [transactionId]);

    // Auto-scroll disabled per user request

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        setSending(true);
        const { error } = await supabase.from("messages").insert({
            transaction_id: transactionId,
            sender_id: user.id,
            sender_email: user.email!,
            sender_role: role,
            content: newMessage.trim(),
        });

        if (error) {
            toast({
                title: "Failed to send message",
                description: error.message,
                variant: "destructive",
            });
        } else {
            setNewMessage("");
            await fetchMessages();
        }
        setSending(false);
    };

    return (
        <div className="rounded-lg border bg-card">
            <div className="flex items-center gap-2 p-4 border-b">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Label className="font-semibold">Transaction Chat</Label>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
                {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleColors[msg.sender_role] || roleColors.buyer
                                            }`}
                                    >
                                        {roleBadge[msg.sender_role] || msg.sender_role}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {format(new Date(msg.created_at), "MMM d, h:mm a")}
                                    </span>
                                </div>
                                <div
                                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${isMe
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex gap-2 p-4 border-t">
                <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                    className="flex-1"
                />
                <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                    {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </form>
        </div>
    );
}
