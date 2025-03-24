import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocumentUpload } from "@/lib/hooks/useDocumentUpload";
import { Upload, FileText } from "lucide-react";
import { InsertDocument } from '@shared/schema';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadedById: number;
  relatedOptions?: Array<{ id: number; name: string; type: string }>;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  uploadedById,
  relatedOptions = []
}: DocumentUploadModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [relatedTo, setRelatedTo] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const { uploadDocument, isUploading } = useDocumentUpload();
  
  const documentTypes = [
    { value: 'KYC', label: 'KYC Document' },
    { value: 'BID', label: 'Bid Document' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'MILESTONE', label: 'Project Milestone' },
    { value: 'INVOICE', label: 'Invoice' },
  ];
  
  const reset = () => {
    setTitle('');
    setDescription('');
    setType('');
    setRelatedTo('');
    setFile(null);
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async () => {
    if (!file || !title || !type) return;
    
    // Parse related information
    let relatedToId: number | undefined;
    let relatedToType: string | undefined;
    
    if (relatedTo) {
      const [type, id] = relatedTo.split('-');
      relatedToId = parseInt(id);
      relatedToType = type;
    }
    
    const documentData = {
      title,
      description,
      type,
      relatedToId,
      relatedToType,
      uploadedById
    };
    
    const result = await uploadDocument(file, documentData);
    
    if (result) {
      reset();
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter document description"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Document Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((docType) => (
                  <SelectItem key={docType.value} value={docType.value}>
                    {docType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {relatedOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="related">Related To (Optional)</Label>
              <Select value={relatedTo} onValueChange={setRelatedTo}>
                <SelectTrigger id="related">
                  <SelectValue placeholder="Select related item" />
                </SelectTrigger>
                <SelectContent>
                  {relatedOptions.map((option) => (
                    <SelectItem key={`${option.type}-${option.id}`} value={`${option.type}-${option.id}`}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Upload Document</Label>
            <div
              className={`border-2 border-dashed rounded-md ${
                dragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
              } transition-colors`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                {file ? (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-gray-400" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Drag and drop your file here or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, PNG, JPG up to 10MB
                    </p>
                  </>
                )}
                
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                />
                
                {!file && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Select File
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            disabled={!file || !title || !type || isUploading}
            onClick={handleSubmit}
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentUploadModal;
