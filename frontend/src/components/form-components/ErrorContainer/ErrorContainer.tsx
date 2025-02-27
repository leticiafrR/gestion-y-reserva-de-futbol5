import styles from "./ErrorContainer.module.css";

type Props = {
  errors: Array<{
    message: string;
  }>;
};

export const ErrorContainer = ({ errors }: Props) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <ul className={styles.errorContainer}>
      {errors.map((error, index) => (
        <li key={index}>{error.message}</li>
      ))}
    </ul>
  );
};
