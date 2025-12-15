import { useEffect, useState } from 'react';
import { client } from '@/api/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SessionInfo {
  hasSession: boolean;
  userId?: string;
  email?: string;
  expiresAt?: string | null;
  localStorageKeys: string[];
}

export function SessionDebug() {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await client.auth.getSession();
      
      const info = {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : null,
        localStorageKeys: Object.keys(localStorage).filter(key => 
          key.includes('supabase') || key.includes('auth')
        ),
      };
      
      setSessionInfo(info);
    };

    checkSession();

    // Revisar cada 5 segundos
    const interval = setInterval(checkSession, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!sessionInfo) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          🔍 Session Debug
          <Badge variant={sessionInfo.hasSession ? "default" : "destructive"}>
            {sessionInfo.hasSession ? "Active" : "No Session"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>User ID:</strong> {sessionInfo.userId || 'N/A'}
        </div>
        <div>
          <strong>Email:</strong> {sessionInfo.email || 'N/A'}
        </div>
        <div>
          <strong>Expires:</strong> {sessionInfo.expiresAt || 'N/A'}
        </div>
        <div>
          <strong>LocalStorage Keys:</strong>
          <div className="pl-2 text-muted-foreground">
            {sessionInfo.localStorageKeys.length > 0 
              ? sessionInfo.localStorageKeys.map((key: string) => (
                  <div key={key}>• {key}</div>
                ))
              : 'None'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
