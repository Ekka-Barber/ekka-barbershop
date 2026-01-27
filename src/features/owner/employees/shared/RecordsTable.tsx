import { EditableTableRow } from './EditableTableRow';

interface Record {
  id: string;
  date: string;
  description: string;
  amount: string | number;
}

interface EditingRecord {
  id: string;
  description: string;
  amount: string;
}

interface RecordsTableProps {
  records: Record[];
  editingRecord: EditingRecord | null;
  setEditingRecord: (
    record:
      | EditingRecord
      | null
      | ((prev: EditingRecord | null) => EditingRecord | null)
  ) => void;
  onSave: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const RecordsTable = ({
  records,
  editingRecord,
  setEditingRecord,
  onSave,
  onDelete,
}: RecordsTableProps) => {
  if (!records.length) return null;

  return (
    <div className="w-full overflow-x-auto rounded-md border border-border/80 bg-card/80">
      <table className="w-full divide-y divide-border/60">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/4 md:w-auto">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-2/5 md:w-auto">
              Description
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/5 md:w-auto">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/6 md:w-auto">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-background divide-y divide-border/60">
          {records.map((record) => (
            <EditableTableRow
              key={record.id}
              id={record.id}
              date={record.date}
              description={record.description}
              amount={record.amount}
              isEditing={editingRecord?.id === record.id}
              onEdit={() =>
                setEditingRecord({
                  id: record.id,
                  description: record.description.toString(),
                  amount: record.amount.toString(),
                })
              }
              onDelete={() => onDelete(record.id)}
              onSave={onSave}
              onCancel={() => setEditingRecord(null)}
              onDescriptionChange={(value) =>
                setEditingRecord((prev: EditingRecord | null) =>
                  prev ? { ...prev, description: value } : null
                )
              }
              onAmountChange={(value) =>
                setEditingRecord((prev: EditingRecord | null) =>
                  prev ? { ...prev, amount: value } : null
                )
              }
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
