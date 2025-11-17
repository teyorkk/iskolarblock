"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TermsModalProps {
  isOpen: boolean;
  onAccept?: () => void;
  onDecline: () => void;
}

export function TermsModal({ isOpen, onDecline }: TermsModalProps) {
  const handleClose = () => {
    onDecline();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>
            Please read and accept our terms and conditions to continue with
            registration.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-y-auto mt-4 pr-2">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">
                1. Acceptance of Terms
              </h3>
              <p>
                By creating an account with IskolarBlock, you agree to be bound
                by these Terms and Conditions, our Privacy Policy, and all
                applicable laws and regulations. If you do not agree with any of
                these terms, you are prohibited from using or accessing this
                site.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Use License</h3>
              <p>
                Permission is granted to temporarily access the materials
                (documents, forms, information) on IskolarBlock for personal,
                non-commercial transitory viewing only. This is the grant of a
                license, not a transfer of title, and under this license you may
                not:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>modify or copy the materials</li>
                <li>
                  use the materials for any commercial purpose or for any public
                  display
                </li>
                <li>
                  attempt to reverse engineer any software contained on the
                  website
                </li>
                <li>
                  remove any copyright or other proprietary notations from the
                  materials
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. User Account</h3>
              <p>
                To create an account on IskolarBlock, you must provide accurate
                and complete information. You are responsible for safeguarding
                the password and all activities that occur under your account.
                You agree to provide accurate, current, and complete information
                during registration and to update such information to keep it
                accurate, current, and complete.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                4. Privacy Policy
              </h3>
              <p>
                Your privacy is important to us. Our Privacy Policy explains how
                we collect, use, and protect your information when you use our
                service. By using IskolarBlock, you agree to the collection and
                use of information in accordance with our Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                5. Scholarship Applications
              </h3>
              <p>
                IskolarBlock provides a platform for scholarship applications.
                While we strive to ensure accurate information, we make no
                warranties regarding the availability, accuracy, or approval of
                scholarships. Users are responsible for providing truthful and
                accurate information in their applications.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                6. Prohibited Activities
              </h3>
              <p>
                You may not use our service for any illegal or unauthorized
                purpose. You are prohibited from using the site to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Submit fraudulent or false information</li>
                <li>
                  Violate any international, federal, provincial, or local laws
                </li>
                <li>
                  Infringe upon or violate our intellectual property rights
                </li>
                <li>Harass, abuse, insult, harm, defame, or discriminate</li>
                <li>Submit false or misleading information</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                7. Limitation of Liability
              </h3>
              <p>
                In no event shall IskolarBlock, its directors, employees,
                partners, agents, suppliers, or affiliates be liable for any
                indirect, incidental, special, consequential, or punitive
                damages, including without limitation, loss of profits, data,
                use, goodwill, or other intangible losses, resulting from your
                use of the service.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Termination</h3>
              <p>
                We may terminate or suspend your account and bar access to the
                service immediately, without prior notice or liability, under
                our sole discretion, for any reason whatsoever and without
                limitation, including but not limited to a breach of the Terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                9. Changes to Terms
              </h3>
              <p>
                We reserve the right to modify or replace these Terms at any
                time. If a revision is material, we will provide at least 30
                days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                10. Contact Information
              </h3>
              <p>
                Questions about the Terms should be sent to us at
                support@iskolarblock.app.
              </p>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
