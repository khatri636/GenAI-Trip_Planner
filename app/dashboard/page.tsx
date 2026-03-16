"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {

  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

      <h1 className="text-4xl font-bold mb-6">
        Travel Dashboard
      </h1>

      <p className="text-gray-400 mb-8">
        Plan and manage your trips easily
      </p>

      <button
        onClick={() => router.push("/plan-trip")}
        className="bg-blue-500 px-6 py-3 rounded-lg hover:bg-blue-600"
      >
        Plan a Trip
      </button>

    </div>
  );
}