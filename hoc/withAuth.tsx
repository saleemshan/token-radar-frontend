import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

const withAuth = (WrappedComponent: React.ComponentType) => {
  const AuthComponent = () => {
    const { ready, authenticated } = usePrivy();
    const router = useRouter();

    useEffect(() => {
      if (ready && !authenticated) {
        // Redirect to login page if not authenticated
        router.push('/');
      }
    }, [ready, authenticated, router]);

    if (!ready || !authenticated) {
      // You can render a loading indicator or null while checking
      return (
        <div className="flex flex-1 flex-col items-center justify-center bg-green-200 w-full"></div>
      );
    }

    // Render the wrapped component if authenticated
    return <WrappedComponent />;
  };

  AuthComponent.displayName = `WithAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return AuthComponent;
};

export default withAuth;
