import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, Award } from "lucide-react";

interface BlockchainStatsCardsProps {
  totalRecords: number;
  applicationCount: number;
  awardingCount: number;
  isLoading: boolean;
}

export function BlockchainStatsCards({
  totalRecords,
  applicationCount,
  awardingCount,
  isLoading,
}: BlockchainStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? "…" : totalRecords}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Application Records</p>
              <p className="text-2xl font-bold text-green-600">
                {isLoading ? "…" : applicationCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Awarding Records</p>
              <p className="text-2xl font-bold text-orange-600">
                {isLoading ? "…" : awardingCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

