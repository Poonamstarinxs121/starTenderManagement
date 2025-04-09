import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface TenderPreviewExportFormProps {
  basicDetails: any;
  documentSets: any[];
  onBack: () => void;
}

const TenderPreviewExportForm: React.FC<TenderPreviewExportFormProps> = ({
  basicDetails,
  documentSets,
  onBack,
}) => {
  const handleExport = () => {
    try {
      // Create CSV content for basic details
      const basicDetailsContent = [
        ['Basic Details'],
        ['Field', 'Value'],
        ['Participating Company', basicDetails?.participatingCompany || ''],
        ['Tender Name', basicDetails?.tenderName || ''],
        ['Tender ID', basicDetails?.tenderId || ''],
        ['Client Name', basicDetails?.clientName || ''],
        ['Delivery Location', basicDetails?.deliveryLocation || ''],
        ['Publish Date', basicDetails?.publishDate || ''],
        ['End Date', basicDetails?.endDate || ''],
        [], // Empty row for separation
        ['Document Sets'],
        ['Set Name', 'Company', 'Number of Documents', 'Tags']
      ];

      // Add document sets data
      documentSets.forEach(set => {
        basicDetailsContent.push([
          set.documentSetName,
          set.participatingCompany,
          set.documents.length.toString(),
          set.tags.join(', ')
        ]);
      });

      // Convert to CSV string
      const csvContent = basicDetailsContent
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tender-${basicDetails?.tenderId || 'export'}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="font-medium">Participating Company</dt>
                <dd>{basicDetails?.participatingCompany}</dd>
              </div>
              <div>
                <dt className="font-medium">Tender Name</dt>
                <dd>{basicDetails?.tenderName}</dd>
              </div>
              <div>
                <dt className="font-medium">Tender ID</dt>
                <dd>{basicDetails?.tenderId}</dd>
              </div>
              <div>
                <dt className="font-medium">Client Name</dt>
                <dd>{basicDetails?.clientName}</dd>
              </div>
              <div>
                <dt className="font-medium">Delivery Location</dt>
                <dd>{basicDetails?.deliveryLocation}</dd>
              </div>
              <div>
                <dt className="font-medium">Publish Date</dt>
                <dd>{basicDetails?.publishDate}</dd>
              </div>
              <div>
                <dt className="font-medium">End Date</dt>
                <dd>{basicDetails?.endDate}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Sets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentSets.map((set, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h3 className="font-medium mb-2">{set.documentSetName}</h3>
                  <dl className="grid grid-cols-2 gap-2">
                    <div>
                      <dt className="text-sm text-gray-500">Company</dt>
                      <dd>{set.participatingCompany}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Documents</dt>
                      <dd>{set.documents.length} files</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-sm text-gray-500">Tags</dt>
                      <dd className="flex gap-2 flex-wrap">
                        {set.tags.map((tag: string, tagIndex: number) => (
                          <span
                            key={tagIndex}
                            className="bg-gray-100 px-2 py-1 rounded text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between gap-4">
        <Button type="button" variant="outline" onClick={onBack} className="w-full">
          Back
        </Button>
        <Button 
          type="button" 
          className="w-full flex items-center justify-center gap-2"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default TenderPreviewExportForm; 