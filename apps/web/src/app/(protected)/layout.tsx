export default function ProtectedLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    // NO se valida sesión acá
    // El control se hace en el AuthGuard (client)
    return <>{children}</>;
  }