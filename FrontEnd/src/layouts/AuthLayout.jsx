// AuthLayout is no longer needed — auth pages render their own full-page layout.
// Keeping this as a transparent pass-through wrapper to avoid breaking any imports.
const AuthLayout = ({ children }) => {
  return <>{children}</>;
};

export default AuthLayout;
