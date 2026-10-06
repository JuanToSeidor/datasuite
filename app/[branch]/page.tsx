import React from "react";
import Link from "next/link";
import { Button } from "caralstable";
import { suiteConfig } from "@/config/suite";

export function generateStaticParams() {
  return suiteConfig.branches.map((branch) => ({
    branch: branch.id,
  }));
}

export default async function BranchPage({ params }: { params: Promise<{ branch: string }> }) {
  const { branch } = await params;

  return (
    <div className="flex-1 p-8 flex flex-col items-center justify-center bg-container border border-neutral-300 rounded-[20px] shadow-sm m-4">
      <div className="max-w-md w-full text-center space-y-6 p-6">
        <h1 className="text-4xl font-bold mb-4 capitalize text-seidor-main-text dark:text-white">
          Crestone {branch}
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          This branch module is currently under construction. Please check back later.
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button variant="info" className="px-6 py-2.5 shadow-md hover:shadow-lg transition-all font-semibold">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

