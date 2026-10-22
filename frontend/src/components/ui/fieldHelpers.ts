export const errorIdFor = (id: string): string => `${id}-error`;

export const fieldClasses = (hasError: boolean): string =>
  `mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 ${
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-gray-300 focus:border-primary-500 dark:border-gray-600"
  }`;
