"use client";

import { Users } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { UserCard } from "./user-card";
import type { UserListProps } from "@/types/components";

export function UserList({
  users,
  onViewProfile,
  onDelete,
  isLoading,
}: UserListProps): React.JSX.Element {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onViewProfile={onViewProfile}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

