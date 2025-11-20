import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, CheckCircle, Coins } from "lucide-react";
import { currencyFormatter } from "@/lib/utils/awarding-utils";

interface AwardingStatsCardsProps {
  totalApproved: number;
  pending: number;
  granted: number;
  totalAmount: number;
}

export function AwardingStatsCards({
  totalApproved,
  pending,
  granted,
  totalAmount,
}: AwardingStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved Scholars</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalApproved}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Release</p>
              <p className="text-2xl font-bold text-orange-600">{pending}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Granted Scholars</p>
              <p className="text-2xl font-bold text-green-600">{granted}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Projected Disbursement</p>
              <p className="text-2xl font-bold text-purple-600">
                {currencyFormatter.format(totalAmount)}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


