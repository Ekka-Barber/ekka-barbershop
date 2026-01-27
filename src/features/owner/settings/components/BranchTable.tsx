
import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';

import { useIsMobile } from '@shared/hooks/use-mobile';
import type { Branch } from '@shared/types/domains';
import { Button } from '@shared/ui/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/components/table';

import { EditBranchForm } from './EditBranchForm';

interface BranchTableProps {
  branches: Branch[];
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  name: string;
  setName: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  isMain: boolean;
  setIsMain: (value: boolean) => void;
  expandedBranchId: string | null;
  setExpandedBranchId: (id: string | null) => void;
  googleMapsUrl: string;
  setGoogleMapsUrl: (value: string) => void;
}

export const BranchTable = ({
  branches,
  onEdit,
  onDelete,
  onSubmit,
  name,
  setName,
  address,
  setAddress,
  isMain,
  setIsMain,
  expandedBranchId,
  setExpandedBranchId,
  googleMapsUrl,
  setGoogleMapsUrl,
}: BranchTableProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4">
        {branches?.map((branch) => (
          <React.Fragment key={branch.id}>
            <div className="border rounded-lg p-4 shadow-sm">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-grow min-w-0">
                    <h3 className="text-lg font-semibold truncate">
                      {branch.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {branch.address || 'No address'}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium">Main Branch: </span>
                  <span className="text-sm text-muted-foreground">
                    {branch.is_main ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex space-x-2 pt-2 border-t mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (expandedBranchId === branch.id) {
                        setExpandedBranchId(null);
                      } else {
                        onEdit(branch);
                        setExpandedBranchId(branch.id);
                      }
                    }}
                    className="flex-1"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(branch)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              {expandedBranchId === branch.id && (
                <div className="mt-4 p-4 border-t">
                  <EditBranchForm
                    editingBranch={branch}
                    onSubmit={onSubmit}
                    name={name}
                    setName={setName}
                    address={address}
                    setAddress={setAddress}
                    isMain={isMain}
                    setIsMain={setIsMain}
                    onCancel={() => setExpandedBranchId(null)}
                    googleMapsUrl={googleMapsUrl}
                    setGoogleMapsUrl={setGoogleMapsUrl}
                  />
                </div>
              )}
            </div>
          </React.Fragment>
        ))}
        {(!branches || branches.length === 0) && (
          <div className="text-center py-4 text-muted-foreground">
            No branches found
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Main Branch</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches?.map((branch) => (
            <React.Fragment key={branch.id}>
              <TableRow>
                <TableCell>{branch.name}</TableCell>
                <TableCell>{branch.address || '-'}</TableCell>
                <TableCell>{branch.is_main ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (expandedBranchId === branch.id) {
                          setExpandedBranchId(null);
                        } else {
                          onEdit(branch);
                          setExpandedBranchId(branch.id);
                        }
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(branch)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedBranchId === branch.id && (
                <TableRow key={`${branch.id}-edit`}>
                  <TableCell colSpan={4} className="p-4">
                    <EditBranchForm
                      editingBranch={branch}
                      onSubmit={onSubmit}
                      name={name}
                      setName={setName}
                      address={address}
                      setAddress={setAddress}
                      isMain={isMain}
                      setIsMain={setIsMain}
                      onCancel={() => setExpandedBranchId(null)}
                      googleMapsUrl={googleMapsUrl}
                      setGoogleMapsUrl={setGoogleMapsUrl}
                    />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
          {(!branches || branches.length === 0) && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No branches found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
