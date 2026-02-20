import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, MessageSquare, Trash2, Ban, Undo, Shield, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ADMIN_EMAIL } from "@/lib/constants";

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
    admin: "EA",
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

    const [transactionDetails, setTransactionDetails] = useState<{ buyer_id: string; seller_email: string; buyer_email: string } | null>(null);

    const fetchTransactionDetails = async () => {
        const { data } = await (supabase
            .from("transactions") as any)
            .select("muted_ids, buyer_id, seller_email, buyer_email")
            .eq("id", transactionId)
            .single();

        if (data) {
            const d = data as any;
            setMutedIds((d.muted_ids as string[]) || []);
            setTransactionDetails(d);
        }
    };

    useEffect(() => {
        fetchMessages();
        fetchTransactionDetails();

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
                        curr.map((msg) => (msg.id === payload.new.id ? (payload.new as Message) : msg))
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
                    setMutedIds((payload.new.muted_ids as string[]) || []);
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
        const msg = messages.find((m) => m.id === messageId);
        if (!isAdmin && msg?.sender_id !== user?.id) {
            toast({
                title: "Permission denied",
                description: "You can only delete your own messages.",
                variant: "destructive",
            });
            return;
        }

        // Optimistic update
        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, is_deleted: true } : m)));

        const { error } = await supabase
            .from("messages")
            // @ts-ignore
            .update({ is_deleted: true } as any)
            .eq("id", messageId);

        if (error) {
            // Revert on error
            setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, is_deleted: false } : m)));
            toast({
                title: "Error deleting message",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleMuteUser = async (userId: string) => {
        if (!isAdmin) {
            toast({
                title: "Permission denied",
                description: "Only administrators can mute users.",
                variant: "destructive",
            });
            return;
        }

        const isMuted = mutedIds.includes(userId);
        const newMutedIds = isMuted
            ? mutedIds.filter((id) => id !== userId)
            : [...mutedIds, userId];

        const { error } = await supabase
            .from("transactions")
            // @ts-ignore
            .update({ muted_ids: newMutedIds } as any)
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
                description: isMuted
                    ? "User can now send messages."
                    : "User has been muted in this chat.",
            });

            // Notify the user
            await supabase.from("notifications").insert({
                user_id: userId,
                title: isMuted ? "Reference: Chat Access Restored" : "Reference: Chat Access Suspended",
                message: isMuted
                    ? "Your chat privileges for this transaction have been restored by EA."
                    : "You have been muted in this transaction chat by EA.",
                type: isMuted ? "success" : "warning",
                link: `/dashboard/transaction/${transactionId}`
            } as any);
        }
    };

    const notifyRecipient = async (content: string) => {
        if (!transactionDetails || !user) return;

        // Determine recipient(s) with their specific dashboard links
        const recipientsArray: { id: string, link: string }[] = [];

        // Find seller ID if possible
        const { data: sellerProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', transactionDetails.seller_email)
            .single();

        const buyerId = transactionDetails.buyer_id;
        const sellerId = sellerProfile ? (sellerProfile as any).id : null;

        // Define logic for who gets notified
        const notifyBuyer = () => {
            if (buyerId && buyerId !== user.id) {
                recipientsArray.push({ id: buyerId, link: `/dashboard?transaction=${transactionId}` });
            }
        };
        const notifySeller = () => {
            if (sellerId && sellerId !== user.id) {
                recipientsArray.push({ id: sellerId, link: `/seller?transaction=${transactionId}` });
            }
        };

        // Notify Admin via ADMIN_EMAIL
        const notifyAdmins = async () => {
            const { data: adminProfile } = await (supabase
                .from('profiles') as any)
                .select('id')
                .eq('email', ADMIN_EMAIL)
                .single();

            if (adminProfile && adminProfile.id !== user.id) {
                recipientsArray.push({ id: adminProfile.id, link: `/admin?transaction=${transactionId}` });
            }
        };

        if (role === 'buyer') {
            notifySeller();
            await notifyAdmins(); // Buyers notify sellers AND admins
        } else if (role === 'seller') {
            notifyBuyer();
            await notifyAdmins(); // Sellers notify buyers AND admins
        } else if (role === 'admin') {
            notifyBuyer();
            notifySeller();
            // Admins notify both parties, but not other admins necessarily (optional, but good to avoid spam)
        }

        // Send notifications
        // Filter duplicates just in case
        const uniqueRecipients = Array.from(new Set(recipientsArray.map(a => a.id)))
            .map(id => recipientsArray.find(a => a.id === id)!);

        for (const recipient of uniqueRecipients) {
            await supabase.from("notifications").insert({
                user_id: recipient.id,
                title: `New Message from ${role === 'admin' ? 'EA' : role}`,
                message: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
                type: "info",
                link: recipient.link,
                read: false // Explicitly set read to false
            } as any);
        }
    };

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
        } as any);

        if (error) {
            toast({
                title: "Failed to send message",
                description: error.message,
                variant: "destructive",
            });
        } else {
            notifyRecipient(newMessage.trim());
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
                            return null; // Completely hide deleted messages
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
                                    {isAdmin && (
                                        <div className="flex items-center gap-1 ml-2">
                                            <button
                                                onClick={() => handleDeleteMessage(msg.id)}
                                                className="text-destructive hover:text-destructive/80 transition-colors p-1"
                                                title="Delete Message"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                            {!isMe && (
                                                <button
                                                    onClick={() => handleMuteUser(msg.sender_id)}
                                                    className={`${mutedIds.includes(msg.sender_id) ? "text-red-500" : "text-muted-foreground"} hover:text-red-500 transition-colors p-1`}
                                                    title={mutedIds.includes(msg.sender_id) ? "Unmute User" : "Mute User"}
                                                >
                                                    {mutedIds.includes(msg.sender_id) ? (
                                                        <Undo className="h-3 w-3" />
                                                    ) : (
                                                        <Ban className="h-3 w-3" />
                                                    )}
                                                </button>
                                            )}
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
