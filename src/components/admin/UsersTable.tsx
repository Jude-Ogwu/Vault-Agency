import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Ban, Undo, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    created_at: string;
    status: "active" | "suspended";
    suspension_reason: string | null;
    can_chat: boolean;
}

export function UsersTable() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [suspensionReason, setSuspensionReason] = useState("");
    const [suspensionDialogOpen, setSuspensionDialogOpen] = useState(false);
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast({
                title: "Error fetching users",
                description: error.message,
                variant: "destructive",
            });
        } else {
            setUsers(data as UserProfile[]);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSuspendUser = async () => {
        if (!selectedUser) return;

        const { error } = await supabase
            .from("profiles")
            .update({
                status: "suspended",
                suspension_reason: suspensionReason
            })
            .eq("id", selectedUser.id);

        if (error) {
            toast({
                title: "Error suspending user",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "User suspended",
                description: `${selectedUser.email} has been suspended.`,
            });
            fetchUsers();
            setSuspensionDialogOpen(false);
            setSuspensionReason("");
        }
    };

    const handleReactivateUser = async (user: UserProfile) => {
        const { error } = await supabase
            .from("profiles")
            .update({
                status: "active",
                suspension_reason: null
            })
            .eq("id", user.id);

        if (error) {
            toast({
                title: "Error reactivating user",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "User reactivated",
                description: `${user.email} is now active.`,
            });
            fetchUsers();
        }
    };

    const handleDeleteUser = async (user: UserProfile) => {
        const { error } = await supabase.from('profiles').delete().eq('id', user.id);
        if (error) {
            toast({
                title: "Error deleting user",
                description: error.message || "Could not delete user. They may have active transactions.",
                variant: "destructive"
            });
        } else {
            toast({
                title: "User deleted",
                description: "The user has been permanently deleted."
            });
            fetchUsers();
        }
    };

    const toggleChatPermission = async (user: UserProfile) => {
        const { error } = await supabase
            .from("profiles")
            .update({ can_chat: !user.can_chat })
            .eq("id", user.id);

        if (error) {
            toast({
                title: "Error updating chat permissions",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Permissions updated",
                description: `Chat access ${!user.can_chat ? "enabled" : "disabled"} for ${user.email}.`,
            });
            fetchUsers();
        }
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery)
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Chat</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Loading users...
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.full_name || "N/A"}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                            <span className="text-[10px] text-muted-foreground">ID: {user.id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.phone || "N/A"}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === "active" ? "default" : "destructive"}>
                                            {user.status || "active"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={user.can_chat ? "text-green-600" : "text-red-600"}
                                            onClick={() => toggleChatPermission(user)}
                                        >
                                            {user.can_chat ? "Enabled" : "Disabled"}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {user.status === "suspended" ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleReactivateUser(user)}
                                                >
                                                    <Undo className="h-4 w-4 mr-1" />
                                                    Reactivate
                                                </Button>
                                            ) : (
                                                <Dialog open={suspensionDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                                                    setSuspensionDialogOpen(open);
                                                    if (!open) setSelectedUser(null);
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => setSelectedUser(user)}
                                                        >
                                                            <Ban className="h-4 w-4 mr-1" />
                                                            Suspend
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Suspend User</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to suspend {selectedUser?.email}? They will lose access to the platform immediately.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="py-4">
                                                            <label className="text-sm font-medium mb-2 block">Reason for Suspension</label>
                                                            <Input
                                                                value={suspensionReason}
                                                                onChange={(e) => setSuspensionReason(e.target.value)}
                                                                placeholder="Violation of terms, suspicious activity, etc."
                                                            />
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setSuspensionDialogOpen(false)}>Cancel</Button>
                                                            <Button variant="destructive" onClick={handleSuspendUser}>Suspend User</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            )}

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                        title="Delete User Permanently"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Delete User Permanently</DialogTitle>
                                                        <DialogDescription>
                                                            Are you sure you want to delete {user.email}?
                                                            <br /><br />
                                                            <span className="font-bold text-destructive">Warning: This action cannot be undone.</span>
                                                            <br />
                                                            This will permanently remove the user and may fail if they have active transactions or history that needs to be preserved for audit.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter>
                                                        <Button variant="outline">Cancel</Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => handleDeleteUser(user)}
                                                        >
                                                            Delete Permanently
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
