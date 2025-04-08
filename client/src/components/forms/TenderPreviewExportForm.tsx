import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
                <dt className="font-medium">Star</dt>
                <dd>{basicDetails?.star}</dd>
              </div>
              <div>
                <dt className="font-medium">Sport</dt>
                <dd>{basicDetails?.sport}</dd>
              </div>
              <div>
                <dt className="font-medium">Tender Number</dt>
                <dd>{basicDetails?.tenderNumber}</dd>
              </div>
              <div>
                <dt className="font-medium">Organization</dt>
                <dd>{basicDetails?.organization}</dd>
              </div>
              <div>
                <dt className="font-medium">Location</dt>
                <dd>{basicDetails?.location}</dd>
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
        <Button type="button" className="w-full">
          Export
        </Button>
      </div>
    </div>
  );
};

export default TenderPreviewExportForm; 