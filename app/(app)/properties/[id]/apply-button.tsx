'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/browser';

interface ApplyButtonProps {
  propertyId: number;
}

export function ApplyButton({ propertyId }: ApplyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No autenticado');
      }

      // Create application
      const { error: insertError } = await supabase.from('applications').insert({
        tenant_id: user.id,
        property_id: propertyId,
        status: 'submitted',
      });

      if (insertError) throw insertError;

      // Refresh the page to show updated state
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al aplicar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleApply}
        disabled={loading}
        className="w-full bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700"
        size="lg"
      >
        {loading ? 'Aplicando...' : 'Aplicar a esta propiedad'}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
