"use client";

import { motion } from "framer-motion";
import { AppBackground } from "@/components/common/app-background";
import type { LandingAboutProps } from "@/types/components";

export function LandingAbout({}: LandingAboutProps): React.JSX.Element {
  return (
    <section id="about" className="relative overflow-hidden py-20">
      <AppBackground className="opacity-30" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            About IskolarBlock
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            IskolarBlock is dedicated to supporting the educational aspirations
            of our youth in Barangay San Miguel. Through transparent and
            efficient scholarship management, we ensure that deserving students
            receive the financial support they need to pursue their dreams.
          </p>
          <div className="bg-orange-50 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Our Commitment
            </h3>
            <p className="text-gray-700">
              We believe in the power of education to transform lives and
              communities. By leveraging blockchain technology, we bring
              unprecedented transparency and efficiency to scholarship
              distribution, ensuring every peso is used for its intended
              purpose.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
