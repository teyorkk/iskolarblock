"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { UserSearchBar } from "@/components/user-management/user-search-bar";
import { UserList } from "@/components/user-management/user-list";
import { UserProfileDialog } from "@/components/user-management/user-profile-dialog";
import { DeleteUserDialog } from "@/components/user-management/delete-user-dialog";
import { EditUserDialog } from "@/components/user-management/edit-user-dialog";
import { Pagination } from "@/components/common/pagination";
import type { User, Application } from "@/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | User["role"]>("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [hasActiveApplications, setHasActiveApplications] = useState(false);
  const [activeApplicationCount, setActiveApplicationCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    setFilteredUsers(
      users.filter((user) => {
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
        const matchesQuery =
          query === "" ||
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query);
        return matchesRole && matchesQuery;
      })
    );
  }, [searchQuery, users, roleFilter]);

  const fetchUsers = async (): Promise<void> => {
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

  const fetchUserApplications = async (userId: string): Promise<void> => {
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

  const handleViewProfile = async (user: User): Promise<void> => {
    setSelectedUser(user);
    setIsProfileDialogOpen(true);
    await fetchUserApplications(user.id);
  };

  const handleEditUser = (user: User): void => {
    setUserToEdit(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async (
    userId: string,
    updates: Partial<User>
  ): Promise<void> => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Failed to update user");
        return;
      }

      toast.success("User updated successfully");

      // Update users list
      setUsers(users.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
      setFilteredUsers(
        filteredUsers.map((u) => (u.id === userId ? { ...u, ...updates } : u))
      );

      // Update selected user if it's the one being edited
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, ...updates });
      }

      setIsEditDialogOpen(false);
      setUserToEdit(null);
    } catch (error) {
      toast.error("An error occurred while updating the user");
      console.error("Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (user: User): Promise<void> => {
    // Check if user has active applications
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: activeApps, error } = await supabase
        .from("Application")
        .select("id, status")
        .eq("userId", user.id)
        .in("status", ["PENDING", "APPROVED", "GRANTED"]);

      if (error) {
        console.error("Error checking applications:", error);
        toast.error("Failed to verify user applications");
        return;
      }

      const hasActive = activeApps && activeApps.length > 0;
      setHasActiveApplications(hasActive);
      setActiveApplicationCount(activeApps?.length || 0);
      setUserToDelete(user);
      setIsDeleteDialogOpen(true);
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while checking user applications");
    }
  };

  const confirmDeleteUser = async (): Promise<void> => {
    if (!userToDelete) return;

    // Don't allow deletion if user has active applications
    if (hasActiveApplications) {
      toast.error("Cannot delete user with active applications");
      return;
    }

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
      setHasActiveApplications(false);
      setActiveApplicationCount(0);

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

  const roleStats = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc.total += 1;
        if (user.role === "ADMIN") acc.admin += 1;
        if (user.role === "USER") acc.user += 1;
        return acc;
      },
      { total: 0, admin: 0, user: 0 }
    );
  }, [users]);

  const filterOptions = useMemo(
    () => [
      { label: "All", value: "ALL" as const, count: roleStats.total },
      { label: "Admins", value: "ADMIN" as const, count: roleStats.admin },
      { label: "Users", value: "USER" as const, count: roleStats.user },
    ],
    [roleStats]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      {/* Main Content */}
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="text-gray-600">
                View and manage all registered users
              </p>
            </div>

            <UserSearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              resultCount={filteredUsers.length}
              activeFilter={roleFilter}
              onFilterChange={setRoleFilter}
              filterOptions={filterOptions}
            />

            <UserList
              users={paginatedUsers}
              onViewProfile={handleViewProfile}
              onDelete={handleDeleteUser}
              isLoading={isLoading}
            />

            {filteredUsers.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredUsers.length}
              />
            )}
          </div>
        </div>
      </div>

      <UserProfileDialog
        user={selectedUser}
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        applications={userApplications}
        isLoadingApplications={isLoadingApplications}
        onDelete={handleDeleteUser}
        onEdit={handleEditUser}
      />

      <DeleteUserDialog
        user={userToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteUser}
        isDeleting={isDeleting}
        hasActiveApplications={hasActiveApplications}
        activeApplicationCount={activeApplicationCount}
      />

      <EditUserDialog
        user={userToEdit}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveUser}
        isSaving={isSaving}
      />
    </div>
  );
}
