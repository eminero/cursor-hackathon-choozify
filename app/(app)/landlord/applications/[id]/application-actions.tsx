'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ApplicationStatus } from '@/types/database';

interface ApplicationActionsProps {
  applicationId: number;
  currentStatus: ApplicationStatus;
}

export function ApplicationActions({ applicationId, currentStatus }: ApplicationActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: ApplicationStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/applications/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Hubo un error al actualizar la aplicación. Por favor intenta de nuevo.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (currentStatus === 'accepted') {
    return (
      <div className="flex gap-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
          <Check className="w-5 h-5" />
          <span className="font-medium">Aplicación Aceptada</span>
        </div>
      </div>
    );
  }

  if (currentStatus === 'rejected') {
    return (
      <div className="flex gap-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
          <X className="w-5 h-5" />
          <span className="font-medium">Aplicación Rechazada</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {currentStatus === 'submitted' && (
        <Button
          onClick={() => handleStatusUpdate('reviewing')}
          disabled={isUpdating}
          variant="outline"
          className="gap-2"
        >
          <Clock className="w-4 h-4" />
          Marcar en Revisión
        </Button>
      )}
      <Button
        onClick={() => handleStatusUpdate('accepted')}
        disabled={isUpdating}
        className="bg-green-600 hover:bg-green-700 gap-2"
      >
        <Check className="w-4 h-4" />
        Aceptar Aplicación
      </Button>
      <Button
        onClick={() => handleStatusUpdate('rejected')}
        disabled={isUpdating}
        variant="destructive"
        className="gap-2"
      >
        <X className="w-4 h-4" />
        Rechazar
      </Button>
    </div>
  );
}
