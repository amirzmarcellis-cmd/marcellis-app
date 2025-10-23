import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function LinkedInCallback() {
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get('account_id');

  useEffect(() => {
    // Notify parent window that authentication succeeded
    window.parent.postMessage(
      { 
        type: 'linkedin-auth-success',
        accountId: accountId 
      },
      '*'
    );
  }, [accountId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
      <h1 className="text-2xl font-semibold mb-2">LinkedIn Connected!</h1>
      <p className="text-muted-foreground">
        Your account has been successfully connected.
      </p>
      {accountId && (
        <p className="text-sm text-muted-foreground mt-2">
          Account ID: {accountId}
        </p>
      )}
      <p className="text-sm text-muted-foreground mt-4">
        This window will close automatically...
      </p>
    </div>
  );
}
