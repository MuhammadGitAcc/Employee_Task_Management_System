import React, { useState } from "react";
import PageContainer from "~/components/layout/PageContainer";
import PageHeader from "~/components/layout/PageHeader";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import ConfirmDialog from "~/components/ui/ConfirmDialog";
import EmptyState from "~/components/ui/EmptyState";
import ErrorState from "~/components/ui/ErrorState";
import Modal from "~/components/ui/Modal";
import Skeleton from "~/components/ui/Skeleton";
import { useToast } from "~/components/ui/toast.context";
import { useAuth } from "~/features/auth/useAuth";
import { getErrorMessage } from "~/services/api";
import EmployeeCard from "./EmployeeCard";
import EmployeeForm from "./EmployeeForm";
import type { EmployeeInput } from "./employee.types";
import ResetPasswordForm from "./ResetPasswordForm";
import { useEmployees } from "./useEmployees";

const Employees: React.FC = () => {
  const { showToast } = useToast();
  const { can, user } = useAuth();
  const canManage = can("employee:manage");
  const {
    employees,
    status,
    errorMessage,
    reload,
    addEmployee,
    updateEmployee,
    removeEmployee,
    resetPassword,
  } = useEmployees();
  const [addFormKey, setAddFormKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingEmployee = employees.find(
    (employee) => employee.id === editingId
  );
  const [resettingId, setResettingId] = useState<string | null>(null);
  const resettingEmployee = employees.find(
    (employee) => employee.id === resettingId
  );
  const [removingId, setRemovingId] = useState<string | null>(null);
  const removingEmployee = employees.find(
    (employee) => employee.id === removingId
  );
  const sortedEmployees = [...employees].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const allEmails = employees.map((employee) => employee.email);
  const otherEmails = employees
    .filter((employee) => employee.id !== editingId)
    .map((employee) => employee.email);

  const handleAdd = async (input: EmployeeInput, password: string) => {
    await addEmployee({ ...input, password });
    showToast(`Employee "${input.name}" added.`);
    setAddFormKey((key) => key + 1);
  };

  const handleUpdate = async (input: EmployeeInput) => {
    if (!editingEmployee) return;
    await updateEmployee(editingEmployee.id, input);
    showToast(`Employee "${input.name}" updated.`);
    setEditingId(null);
  };

  const handleResetPassword = async (newPassword: string) => {
    if (!resettingEmployee) return;
    await resetPassword(resettingEmployee.id, newPassword);
    showToast(`Password reset for "${resettingEmployee.name}".`);
    setResettingId(null);
  };

  const handleRemove = async () => {
    if (!removingEmployee) return;
    try {
      await removeEmployee(removingEmployee.id);
    } catch (error) {
      showToast(getErrorMessage(error), "error");
      return;
    }
    showToast(`Employee "${removingEmployee.name}" removed.`);
    setRemovingId(null);
  };

  return (
    <PageContainer>
      <PageHeader title="Employees" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {status === "loading" ? (
            <div
              role="status"
              aria-label="Loading employees"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          ) : status === "error" ? (
            <ErrorState
              title="Could not load the employees"
              description={errorMessage}
              action={<Button onClick={reload}>Try again</Button>}
            />
          ) : sortedEmployees.length === 0 ? (
            <EmptyState
              title="No employees yet"
              description={
                canManage
                  ? "Add your first employee using the form."
                  : "No employees have been added yet."
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onEdit={canManage ? setEditingId : undefined}
                  onResetPassword={canManage ? setResettingId : undefined}
                  onRemove={
                    canManage && employee.id !== user?.id
                      ? setRemovingId
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
        {canManage && (
          <div>
            <Card>
              <EmployeeForm
                key={addFormKey}
                existingEmails={allEmails}
                requirePassword
                onSubmit={handleAdd}
              />
            </Card>
          </div>
        )}
      </div>
      <Modal
        isOpen={editingEmployee !== undefined}
        onClose={() => setEditingId(null)}
        title="Edit Employee"
      >
        {editingEmployee && (
          <EmployeeForm
            key={editingEmployee.id}
            initialData={editingEmployee}
            existingEmails={otherEmails}
            onSubmit={handleUpdate}
          />
        )}
      </Modal>
      <Modal
        isOpen={resettingEmployee !== undefined}
        onClose={() => setResettingId(null)}
        title="Reset Password"
      >
        {resettingEmployee && (
          <ResetPasswordForm
            key={resettingEmployee.id}
            employeeName={resettingEmployee.name}
            onSubmit={handleResetPassword}
          />
        )}
      </Modal>
      <ConfirmDialog
        isOpen={removingEmployee !== undefined}
        title="Remove Employee"
        message={`Remove "${removingEmployee?.name ?? ""}"? They will no longer be able to sign in, and their tasks will become unassigned.`}
        confirmLabel="Remove"
        onConfirm={handleRemove}
        onCancel={() => setRemovingId(null)}
      />
    </PageContainer>
  );
};

export default Employees;
