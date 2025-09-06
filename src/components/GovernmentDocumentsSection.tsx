// components/GovernmentDocumentsSection.tsx
'use client';

import { useState } from 'react';
import { Plus, Edit, Save, X, FileText, Trash2 } from 'lucide-react';
import { DocumentType, GovernmentDocument } from '@/types';


export interface GovernmentDocumentsSectionProps {
  documents: GovernmentDocument[];
  onDocumentsChange: (documents: GovernmentDocument[]) => void;
  holderName: string; // Pre-fill from main form
}

export default function GovernmentDocumentsSection({ 
  documents, 
  onDocumentsChange, 
  holderName 
}: GovernmentDocumentsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<GovernmentDocument, 'id'>>({
    holderName: holderName,
    documentType: 'aadhar',
    documentNumber: '',
    issuingAuthority: '',
    issueDate: ''
  });

  const documentTypes: { value: DocumentType; label: string }[] = [
    { value: 'aadhar', label: 'Aadhar Card' },
    { value: 'pan', label: 'PAN Card' },
    { value: 'uan', label: 'UAN Number' },
    { value: 'voters_id', label: 'Voter ID Card' },
    { value: 'driving_license', label: 'Driving License' },
    { value: 'passport', label: 'Passport' },
    { value: 'education_certificate', label: 'Education Certificate' },
    { value: 'income_certificate', label: 'Income Certificate' },
    { value: 'caste_certificate', label: 'Caste Certificate' },
    { value: 'domicile_certificate', label: 'Domicile Certificate' },
    { value: 'birth_certificate', label: 'Birth Certificate' },
    { value: 'other', label: 'Other Document' }
  ];

  const inputClassName = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border text-gray-900 bg-white";

  const resetForm = () => {
    setFormData({
      holderName: holderName,
      documentType: 'aadhar',
      documentNumber: '',
      issuingAuthority: '',
      issueDate: ''
    });
  };

  const handleAddDocument = () => {
    setShowAddForm(true);
    setEditingId(null);
    resetForm();
  };

  const handleEditDocument = (doc: GovernmentDocument) => {
    setFormData({
      holderName: doc.holderName,
      documentType: doc.documentType,
      customDocumentName: doc.customDocumentName,
      documentNumber: doc.documentNumber,
      issuingAuthority: doc.issuingAuthority,
      issueDate: doc.issueDate
    });
    setEditingId(doc.id);
    setShowAddForm(true);
  };

  const handleSaveDocument = () => {
    if (!formData.documentNumber.trim() || !formData.issuingAuthority.trim()) {
      alert('Please fill in required fields');
      return;
    }

    if (formData.documentType === 'other' && !formData.customDocumentName?.trim()) {
      alert('Please specify the document name for "Other" type');
      return;
    }

    const newDocument: GovernmentDocument = {
      id: editingId || `doc_${Date.now()}`,
      ...formData,
      holderName: holderName // Always use current holder name
    };

    let updatedDocuments: GovernmentDocument[];
    if (editingId) {
      // Update existing document
      updatedDocuments = documents.map(doc => 
        doc.id === editingId ? newDocument : doc
      );
    } else {
      // Add new document
      updatedDocuments = [...documents, newDocument];
    }

    onDocumentsChange(updatedDocuments);
    setShowAddForm(false);
    setEditingId(null);
    resetForm();
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      const updatedDocuments = documents.filter(doc => doc.id !== id);
      onDocumentsChange(updatedDocuments);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    resetForm();
  };

  const getDocumentDisplayName = (doc: GovernmentDocument): string => {
    if (doc.documentType === 'other' && doc.customDocumentName) {
      return doc.customDocumentName;
    }
    return documentTypes.find(type => type.value === doc.documentType)?.label || doc.documentType;
  };

  const getDocumentIcon = (docType: DocumentType): string => {
    const icons: Record<DocumentType, string> = {
      aadhar: '🆔',
      pan: '💳',
      uan: '👥',
      voters_id: '🗳️',
      driving_license: '🚗',
      passport: '📘',
      education_certificate: '🎓',
      income_certificate: '💰',
      caste_certificate: '📄',
      domicile_certificate: '🏠',
      birth_certificate: '👶',
      other: '📋'
    };
    return icons[docType] || '📄';
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium text-gray-900">Government Documents</h4>
        <button
          type="button"
          onClick={handleAddDocument}
          className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Document</span>
        </button>
      </div>

      {/* Documents Cards */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 gap-3 mb-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getDocumentIcon(doc.documentType)}</span>
                    <h5 className="text-sm font-medium text-gray-900">
                      {getDocumentDisplayName(doc)}
                    </h5>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div><strong>Document Number:</strong> {doc.documentNumber}</div>
                    <div><strong>Issuing Authority:</strong> {doc.issuingAuthority}</div>
                    {doc.issueDate && (
                      <div><strong>Issue Date:</strong> {doc.issueDate}</div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1 ml-4">
                  <button
                    type="button"
                    onClick={() => handleEditDocument(doc)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Edit Document"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Delete Document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-4 rounded-lg border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-sm font-medium text-gray-900">
              {editingId ? 'Edit Document' : 'Add New Document'}
            </h5>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Document Type *</label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData({
                  ...formData, 
                  documentType: e.target.value as DocumentType,
                  customDocumentName: e.target.value === 'other' ? formData.customDocumentName : undefined
                })}
                className={inputClassName}
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Document Name (for 'other' type) */}
            {formData.documentType === 'other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Document Name *</label>
                <input
                  type="text"
                  value={formData.customDocumentName || ''}
                  onChange={(e) => setFormData({...formData, customDocumentName: e.target.value})}
                  placeholder="Enter document name"
                  className={inputClassName}
                />
              </div>
            )}

            {/* Document Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Document Number *</label>
              <input
                type="text"
                value={formData.documentNumber}
                onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
                placeholder="Enter document number"
                className={inputClassName}
              />
            </div>

            {/* Issuing Authority */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Issuing Authority *</label>
              <input
                type="text"
                value={formData.issuingAuthority}
                onChange={(e) => setFormData({...formData, issuingAuthority: e.target.value})}
                placeholder="Enter issuing authority"
                className={inputClassName}
              />
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Issue Date</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                className={inputClassName}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDocument}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              <span>{editingId ? 'Update' : 'Add'} Document</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">No government documents added yet.</p>
          <p className="text-xs mt-1">Click "Add Document" to get started.</p>
        </div>
      )}
    </div>
  );
}