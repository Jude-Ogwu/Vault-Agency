import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, MessageSquare, Trash2, Ban, Undo, Shield, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface Message {
    id: string;
    transaction_id: string;
    sender_id: string;
    sender_email: string;
    sender_role: string;
    content: string;
    created_at: string;
    is_deleted: boolean;
}

interface ChatPanelProps {
    transactionId: string;
    role: "buyer" | "seller" | "admin";
}

const roleColors: Record<string, string> = {
    buyer: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    seller: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

const roleBadge: Record<string, string> = {
    buyer: "Buyer",
    seller: "Seller",
    admin: "VA",
};

export function ChatPanel({ transactionId, role }: ChatPanelProps) {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [mutedIds, setMutedIds] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isAdmin = role === "admin";

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

    const fetchTransactionDetails = async () => {
        const { data } = await supabase
            .from("transactions")
            .select("muted_ids")
            .eq("id", transactionId)
            .single();

        if (data) {
            setMutedIds(data.muted_ids || []);
        }
    }

    useEffect(() => {
        fetchMessages();
        fetchTransactionDetails();

        // Realtime subscription for messages
        const channel = supabase
            .channel(`chat_${transactionId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `transaction_id=eq.${transactionId}`,
                },
                (payload) => {
                    setMessages((curr) => [...curr, payload.new as Message]);
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "messages",
                    filter: `transaction_id=eq.${transactionId}`,
                },
                (payload) => {
                    setMessages((curr) =>
                        curr.map(msg => msg.id === payload.new.id ? payload.new as Message : msg)
                    );
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "transactions",
                    filter: `id=eq.${transactionId}`,
                },
                (payload) => {
                    setMutedIds(payload.new.muted_ids || []);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [transactionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleDeleteMessage = async (messageId: string) => {
        const { error } = await supabase
            .from("messages")
            .update({ is_deleted: true })
            .eq("id", messageId);

        if (error) {
            toast({
                title: "Error deleting message",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleMuteUser = async (userId: string) => {
        const isMuted = mutedIds.includes(userId);
        const newMutedIds = isMuted
            ? mutedIds.filter(id => id !== userId)
            : [...mutedIds, userId];

        const { error } = await supabase
            .from("transactions")
            .update({ muted_ids: newMutedIds })
            .eq("id", transactionId);

        if (error) {
            toast({
                title: isMuted ? "Error unmuting user" : "Error muting user",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: isMuted ? "User unmuted" : "User muted",
                description: isMuted ? "User can now send messages." : "User has been muted in this chat.",
            });
        }
    };

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
                        const isDeleted = msg.is_deleted;

                        if (isDeleted) {
                            if (!isAdmin && !isMe) return null; // Hide deleted messages from others if not admin
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} opacity-50`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                                            <Trash2 className="h-3 w-3" /> Message deleted
                                        </span>
                                    </div>
                                    {isAdmin && (
                                        <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm border border-dashed border-destructive/50 bg-destructive/5 text-muted-foreground`}>
                                            {msg.content}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isMe ? "items-end" : "items-start"} group`}
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
                                    {isAdmin && !isMe && (
                                        <div className="hidden group-hover:flex items-center gap-1 ml-2">
                                            <button
                                                onClick={() => handleDeleteMessage(msg.id)}
                                                className="text-destructive hover:text-destructive/80 transition-colors"
                                                title="Delete Message"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => handleMuteUser(msg.sender_id)}
                                                className={`${mutedIds.includes(msg.sender_id) ? "text-red-500" : "text-muted-foreground"} hover:text-red-500 transition-colors`}
                                                title={mutedIds.includes(msg.sender_id) ? "Unmute User" : "Mute User"}
                                            >
                                                {mutedIds.includes(msg.sender_id) ? (
                                                    <Undo className="h-3 w-3" />
                                                ) : (
                                                    <Ban className="h-3 w-3" />
                                                )}
                                            </button>
                                        </div>
                                    )}
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
            {/* Input */}
            {user && (mutedIds.includes(user.id) || profile?.can_chat === false) ? (
                <div className="p-4 border-t bg-destructive/10 text-destructive text-center text-sm font-medium flex items-center justify-center gap-2">
                    <Ban className="h-4 w-4" />
                    {profile?.can_chat === false
                        ? "Your chat privileges have been suspended by an administrator."
                        : "You have been muted in this chat by an administrator."
                    }
                </div>
            ) : (
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
            )}
        </div>
    );
}
