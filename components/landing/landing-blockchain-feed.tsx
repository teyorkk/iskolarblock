"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Clock, Blocks, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppBackground } from "@/components/common/app-background";
import type { LiveBlockchainRecord } from "@/types";

interface LandingBlockchainFeedProps {
  records: LiveBlockchainRecord[];
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export function LandingBlockchainFeed({
  records,
}: LandingBlockchainFeedProps): React.JSX.Element {
  const explorerBase =
    (process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL ?? "").replace(
      /\/$/,
      ""
    ) || "https://www.oklink.com/amoy/tx";

  const [searchTerm, setSearchTerm] = useState("");
  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return records;
    return records.filter((record) => {
      const hashMatch = record.transactionHash.toLowerCase().includes(term);
      const typeMatch = record.recordType.toLowerCase().includes(term);
      return hashMatch || typeMatch;
    });
  }, [records, searchTerm]);

  return (
    <section id="blockchain-feed" className="relative overflow-hidden py-16">
      <AppBackground className="opacity-40" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold tracking-[0.3em] text-orange-500 mb-4">
            LIVE BLOCKCHAIN FEED
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Transparent Scholarship Ledger
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Observe the most recent on-chain entries, highlighting the hash,
            application type, and timestamp for each recorded transaction.
          </p>
        </motion.div>

        <Card className="shadow-sm border border-orange-100">
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Blocks className="w-5 h-5 text-orange-500" />
                Latest Transactions
              </CardTitle>
              <div className="relative w-full md:w-96 lg:w-[28rem]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by hash or record type"
                  className="pl-10 w-full"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredRecords.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No blockchain entries match your search.
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto">
                <ul className="divide-y divide-orange-50">
                  {filteredRecords.map((record, index) => (
                    <motion.li
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="p-4 flex flex-col gap-3 rounded-xl border border-orange-100 bg-orange-50/40 md:rounded-none md:border-0 md:bg-transparent md:border-l-0 md:grid md:grid-cols-[minmax(0,2.25fr)_minmax(0,1fr)_auto] md:items-center md:gap-4"
                    >
                      <div className="flex flex-col gap-1 break-all">
                        <span className="text-xs uppercase tracking-widest text-gray-500">
                          Hash
                        </span>
                        <a
                          href={`${explorerBase}/${record.transactionHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-sm text-orange-600 hover:text-orange-700 break-all transition-colors"
                          title="View on blockchain explorer"
                        >
                          {record.transactionHash}
                        </a>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-widest text-gray-500">
                          Record Type
                        </span>
                        <p className="text-sm font-semibold text-gray-900">
                          {record.recordType === "APPLICATION"
                            ? "Application"
                            : "Awarding"}
                        </p>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="w-4 h-4 mr-2 text-orange-500" />
                        {formatTimestamp(record.timestamp)}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
