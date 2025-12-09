// @ts-nocheck
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface CrudTableProps {
  tableName: string;
  data: any[];
  columns: { key: string; label: string; type?: 'text' | 'textarea' | 'number' | 'boolean' }[];
  idField: string;
  onDataChange: () => void;
}

export function CrudTable({ tableName, data, columns, idField, onDataChange }: CrudTableProps) {
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    alert('Data persistence is disabled (Supabase removed). Connect a new backend to enable saving.');
    setLoading(false);
  };

  const handleEdit = async () => {
    setLoading(true);
    alert('Data persistence is disabled (Supabase removed). Connect a new backend to enable saving.');
    setLoading(false);
  };

  const handleDelete = async (_id: any) => {
    setLoading(true);
    alert('Data persistence is disabled (Supabase removed). Connect a new backend to enable saving.');
    setLoading(false);
  };

  const openAddDialog = () => {
    setFormData({});
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsEditDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Total Records: {data.length}</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-[#d17728] hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Record</DialogTitle>
              <DialogDescription>Fill in the details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {columns.map((col) => (
                <div key={col.key}>
                  <Label htmlFor={col.key}>{col.label}</Label>
                  {col.type === 'textarea' ? (
                    <Textarea
                      id={col.key}
                      value={formData[col.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })}
                    />
                  ) : col.type === 'boolean' ? (
                    <select
                      id={col.key}
                      value={formData[col.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select...</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : (
                    <Input
                      id={col.key}
                      type={col.type || 'text'}
                      value={formData[col.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={loading} className="bg-[#d17728] hover:bg-orange-700">
                  {loading ? 'Adding...' : 'Add'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item[idField]} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
                    {col.type === 'boolean'
                      ? (item[col.key] ? 'Yes' : 'No')
                      : String(item[col.key] || '-').substring(0, 100)
                    }
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(item)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item[idField])}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>Update the details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {columns.map((col) => (
              <div key={col.key}>
                <Label htmlFor={`edit-${col.key}`}>{col.label}</Label>
                {col.type === 'textarea' ? (
                  <Textarea
                    id={`edit-${col.key}`}
                    value={formData[col.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })}
                  />
                ) : col.type === 'boolean' ? (
                  <select
                    id={`edit-${col.key}`}
                    value={String(formData[col.key])}
                    onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : (
                  <Input
                    id={`edit-${col.key}`}
                    type={col.type || 'text'}
                    value={formData[col.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={loading} className="bg-[#d17728] hover:bg-orange-700">
                {loading ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
