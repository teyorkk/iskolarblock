"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User as UserIcon,
  Eye,
  Trash2,
  Key,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  bio: string | null;
  role: string;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Application {
  id: string;
  userId: string;
  applicationPeriodId: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  applicationDetails: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.phone?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        toast.error("Failed to fetch users");
        console.error("Error fetching users:", error);
        return;
      }

      if (data) {
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      toast.error("An error occurred while fetching users");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserApplications = async (userId: string) => {
    try {
      setIsLoadingApplications(true);
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("Application")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        setUserApplications([]);
        return;
      }

      if (data) {
        setUserApplications(data);
      }
    } catch (error) {
      console.error("Error:", error);
      setUserApplications([]);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const handleViewProfile = async (user: User) => {
    setSelectedUser(user);
    setIsProfileDialogOpen(true);
    await fetchUserApplications(user.id);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Failed to delete user");
        return;
      }

      toast.success("User deleted successfully");
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setFilteredUsers(filteredUsers.filter((u) => u.id !== userToDelete.id));
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);

      // Close profile dialog if the deleted user was being viewed
      if (selectedUser?.id === userToDelete.id) {
        setIsProfileDialogOpen(false);
        setSelectedUser(null);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the user");
      console.error("Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendPasswordResetOTP = async (user: User) => {
    try {
      setIsSendingOTP(true);
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: "POST",
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Failed to send password reset OTP");
        return;
      }

      toast.success(`Password reset OTP sent to ${user.email}`);
    } catch (error) {
      toast.error("An error occurred while sending password reset OTP");
      console.error("Error:", error);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-orange-100 text-orange-700", icon: Clock },
      UNDER_REVIEW: { color: "bg-blue-100 text-blue-700", icon: Clock },
      APPROVED: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      REJECTED: { color: "bg-red-100 text-red-700", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-700",
      icon: Clock,
    };
    const Icon = config.icon;

    return (
      <Badge variant="secondary" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      {/* Main Content */}
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">
                View and manage all registered users
              </p>
            </div>

            {/* Search and Stats */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                      {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
                    </CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Users List */}
            {isLoading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No users found</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={user.profilePicture || ""} />
                            <AvatarFallback className="bg-red-100 text-red-600 text-lg">
                              {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {user.name || user.email?.split("@")[0] || "Unknown"}
                              </h3>
                              <Badge
                                variant="secondary"
                                className={
                                  user.role === "ADMIN"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                                }
                              >
                                {user.role || "USER"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 truncate mb-1">
                              <Mail className="w-3 h-3 inline mr-1" />
                              {user.email}
                            </p>
                            {user.phone && (
                              <p className="text-sm text-gray-600 truncate mb-1">
                                <Phone className="w-3 h-3 inline mr-1" />
                                {user.phone}
                              </p>
                            )}
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <Calendar className="w-3 h-3 mr-1" />
                              Joined {formatDate(user.createdAt)}
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleViewProfile(user)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteUser(user)}
                                disabled={user.role === "ADMIN"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* User Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="!w-[95vw] sm:!w-[85vw] md:!w-[75vw] !max-w-[75vw] sm:!max-w-[85vw] md:!max-w-[75vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              View detailed information about the user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b">
                <Avatar className="w-20 h-20 flex-shrink-0">
                  <AvatarImage src={selectedUser.profilePicture || ""} />
                  <AvatarFallback className="bg-red-100 text-red-600 text-2xl">
                    {selectedUser.name?.charAt(0) ||
                      selectedUser.email?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 break-words">
                    {selectedUser.name || selectedUser.email?.split("@")[0] || "Unknown"}
                  </h3>
                  <p className="text-gray-600 break-words">{selectedUser.email}</p>
                  <Badge
                    variant="secondary"
                    className={
                      selectedUser.role === "ADMIN"
                        ? "bg-red-100 text-red-700 mt-2"
                        : "bg-blue-100 text-blue-700 mt-2"
                    }
                  >
                    {selectedUser.role || "USER"}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendPasswordResetOTP(selectedUser)}
                    disabled={isSendingOTP}
                    className="w-full sm:w-auto"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    {isSendingOTP ? "Sending..." : "Send Reset OTP"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
                    onClick={() => {
                      setIsProfileDialogOpen(false);
                      handleDeleteUser(selectedUser);
                    }}
                    disabled={selectedUser.role === "ADMIN"}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Profile Information */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-medium">Email:</span>
                  </div>
                  <p className="text-gray-900 pl-6 break-words">{selectedUser.email}</p>
                </div>

                {selectedUser.phone && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="font-medium">Phone:</span>
                    </div>
                    <p className="text-gray-900 pl-6 break-words">{selectedUser.phone}</p>
                  </div>
                )}

                {selectedUser.address && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="font-medium">Address:</span>
                    </div>
                    <p className="text-gray-900 pl-6 break-words">{selectedUser.address}</p>
                  </div>
                )}

                {selectedUser.bio && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <UserIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="font-medium">Bio:</span>
                    </div>
                    <p className="text-gray-900 pl-6 break-words">{selectedUser.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="font-medium">Joined:</span>
                    </div>
                    <p className="text-gray-900 pl-6">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="font-medium">Last Updated:</span>
                    </div>
                    <p className="text-gray-900 pl-6">
                      {formatDate(selectedUser.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Application History */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Application History
                  </h4>
                  {isLoadingApplications && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  )}
                </div>
                {isLoadingApplications ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading applications...</p>
                  </div>
                ) : userApplications.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No applications found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-6 px-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">Application ID</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[140px]">Submitted</TableHead>
                          <TableHead className="min-w-[140px]">Last Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userApplications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium text-xs">
                              {app.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                              {formatDateTime(app.createdAt)}
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                              {formatDateTime(app.updatedAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account{" "}
              <span className="font-semibold">
                {userToDelete?.name || userToDelete?.email}
              </span>{" "}
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
