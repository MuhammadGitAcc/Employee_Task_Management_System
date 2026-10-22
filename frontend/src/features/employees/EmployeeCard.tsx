import React from "react";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import type { Employee } from "./employee.types";

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (id: string) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        {employee.name}
      </h3>
      <p className="text-sm text-gray-600 mt-1 dark:text-gray-300">
        {employee.jobTitle}
        {employee.department ? ` - ${employee.department}` : ""}
      </p>
      <p className="text-sm text-gray-500 mt-2 break-words dark:text-gray-400">
        {employee.email}
      </p>
      <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
        Role: {employee.role}
      </p>
      {onEdit && (
        <div className="mt-4">
          <Button variant="secondary" onClick={() => onEdit(employee.id)}>
            Edit
          </Button>
        </div>
      )}
    </Card>
  );
};

export default EmployeeCard;
