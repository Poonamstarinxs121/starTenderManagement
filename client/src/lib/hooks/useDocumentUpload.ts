import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface DocumentUploadProps {
  title: string;
  description?: string;
  type: string;
  relatedToId?: number;
  relatedToType?: string;
  uploadedById: number;
}

export function useDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadDocument = async (
    file: File,
    documentData: DocumentUploadProps
  ) => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a file to upload',
      });
      return null;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Append other document data
      Object.entries(documentData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload document');
      }

      const result = await response.json();
      
      // Invalidate documents query to refetch the data
      await queryClient.invalidateQueries({
        queryKey: ['/api/documents']
      });

      if (documentData.relatedToId && documentData.relatedToType) {
        await queryClient.invalidateQueries({
          queryKey: ['/api/documents', {
            relatedToId: documentData.relatedToId,
            relatedToType: documentData.relatedToType
          }]
        });
      }

      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });

      return result;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload document',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadDocument, isUploading };
}

export default useDocumentUpload;
