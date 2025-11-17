"use client";

import { motion } from "framer-motion";
import { Mail, Phone, Calendar, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date-formatting";
import type { UserCardProps } from "@/types/components";

export function UserCard({
  user,
  onViewProfile,
  onDelete,
}: UserCardProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16">
              {user.profilePicture ? (
                <AvatarImage src={user.profilePicture} />
              ) : null}
              <AvatarFallback
                className={`${
                  user.role === "ADMIN"
                    ? "bg-red-100 text-red-600"
                    : "bg-orange-100 text-orange-600"
                } text-lg`}
              >
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
                      : "bg-orange-100 text-orange-700"
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
                  onClick={() => onViewProfile(user)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(user)}
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
  );
}
