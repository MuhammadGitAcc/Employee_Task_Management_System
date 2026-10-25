import React from "react";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import type { Employee } from "./employee.types";

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (id: string) => void;
  onResetPassword?: (id: string) => void;
  onRemove?: (id: string) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onEdit,
  onResetPassword,
  onRemove,
}) => {
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
      {(onEdit || onResetPassword || onRemove) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {onEdit && (
            <Button variant="secondary" onClick={() => onEdit(employee.id)}>
              Edit
            </Button>
          )}
          {onResetPassword && (
            <Button
              variant="secondary"
              onClick={() => onResetPassword(employee.id)}
            >
              Reset password
            </Button>
          )}
          {onRemove && (
            <Button variant="danger" onClick={() => onRemove(employee.id)}>
              Remove
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default EmployeeCard;
