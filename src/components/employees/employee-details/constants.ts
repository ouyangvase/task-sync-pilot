
import { Award } from "lucide-react";
import React from "react";

export const EMPLOYEE_TITLES = [
  "Chief Closing Commander",
  "Imagination Director",
  "Chief Flow Alchemist",
  "Ninja"
];

export const getTitleIcons = (): Record<string, React.ReactNode> => {
  return {
    "Chief Closing Commander": <Award className="h-4 w-4 text-yellow-500" />,
    "Imagination Director": <Award className="h-4 w-4 text-blue-500" />,
    "Chief Flow Alchemist": <Award className="h-4 w-4 text-purple-500" />,
    "Ninja": <Award className="h-4 w-4 text-red-500" />
  };
};
