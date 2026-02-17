import { useState, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    read: boolean;
    created_at: string;
    link?: string;
}

export function NotificationCenter() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        if (!user) return;
        const { data } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (data) {
            setNotifications(data as Notification[]);
            setUnreadCount(data.filter(n => !n.read).length);
        }
    };

    useEffect(() => {
        fetchNotifications();

        if (!user) return;

        const channel = supabase
            .channel("notifications")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const newNotification = payload.new as Notification;
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    toast({
                        title: newNotification.title,
                        description: newNotification.message,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, toast]);

    const markAsRead = async (id: string) => {
        await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", id);

        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        if (!user || unreadCount === 0) return;

        await supabase
            .from("notifications")
            .update({ read: true })
            .eq("user_id", user.id)
            .eq("read", false);

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering item click
        const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", id);

        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id));
            // Recalculate unread count if we deleted an unread one
            const wasUnread = notifications.find(n => n.id === id)?.read === false;
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const clearAllNotifications = async () => {
        if (!user) return;
        const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("user_id", user.id);

        if (!error) {
            setNotifications([]);
            setUnreadCount(0);
            toast({ title: "Notifications cleared" });
        }
    };

    if (!user) return null;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    <div className="flex gap-1">
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-6 text-xs px-2">
                                <Check className="mr-1 h-3 w-3" /> Mark all read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Clear all">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete all your notifications.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={clearAllNotifications} className="bg-destructive hover:bg-destructive/90">
                                            Clear All
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        <div className="grid gap-1">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`relative flex flex-col gap-1 p-4 hover:bg-muted/50 transition-colors cursor-pointer group ${!notification.read ? "bg-muted/20 border-l-2 border-primary" : ""
                                        }`}
                                    onClick={() => {
                                        if (!notification.read) {
                                            markAsRead(notification.id);
                                        }
                                        if (notification.link) {
                                            setIsOpen(false);
                                            navigate(notification.link);
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <p className={`text-sm ${!notification.read ? "font-semibold" : ""}`}>
                                            {notification.title}
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive absolute right-2 top-2"
                                            onClick={(e) => deleteNotification(notification.id, e)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                                    <span className="text-[10px] text-muted-foreground/50 mt-1">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
