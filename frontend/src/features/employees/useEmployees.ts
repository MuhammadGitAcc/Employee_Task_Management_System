import { useCallback, useEffect, useState } from "react";
import { ApiError } from "~/services/api";
import {
  createEmployee,
  listEmployees,
  removeEmployee as deleteEmployee,
  resetPassword as saveEmployeePassword,
  updateEmployee as saveEmployee,
} from "~/services/employees";
import type {
  Employee,
  EmployeeInput,
  NewEmployeeInput,
} from "./employee.types";

type EmployeesStatus = "loading" | "ready" | "error";

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [status, setStatus] = useState<EmployeesStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listEmployees()
      .then((list) => {
        if (cancelled) return;
        setEmployees(list);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Could not load the employees."
        );
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setStatus("loading");
    setAttempt((previous) => previous + 1);
  }, []);

  const addEmployee = async (input: NewEmployeeInput): Promise<Employee> => {
    const created = await createEmployee(input);
    setEmployees((previous) => [...previous, created]);
    return created;
  };

  const updateEmployee = async (
    id: string,
    input: EmployeeInput
  ): Promise<Employee> => {
    const updated = await saveEmployee(id, input);
    setEmployees((previous) =>
      previous.map((employee) => (employee.id === id ? updated : employee))
    );
    return updated;
  };

  const removeEmployee = async (id: string): Promise<void> => {
    await deleteEmployee(id);
    setEmployees((previous) =>
      previous.filter((employee) => employee.id !== id)
    );
  };

  const resetPassword = (id: string, newPassword: string): Promise<void> =>
    saveEmployeePassword(id, newPassword);

  return {
    employees,
    status,
    errorMessage,
    reload,
    addEmployee,
    updateEmployee,
    removeEmployee,
    resetPassword,
  };
};
