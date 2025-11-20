"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LandingLiveImpactProps } from "@/types/components";

export function LandingLiveImpact({
  stats,
}: LandingLiveImpactProps): React.JSX.Element {
  return (
    <section
      id="live-impact"
      className="py-20 bg-gradient-to-b from-white to-orange-50"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-[0.3em] text-orange-500 mb-4">
            LIVE IMPACT
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Real-time Progress of IskolarBlock
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Track how we continually support students across Barangay San Miguel
            through transparent and measurable scholarship distribution.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="transform transition-all duration-300"
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <stat.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-xl">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.prefix}
                    {stat.value}
                    {stat.suffix}
                  </p>
                  <CardDescription className="text-gray-600">
                    {stat.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
