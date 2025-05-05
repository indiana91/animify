import React, { useState } from 'react';
import { Copy, Edit, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ScriptViewerProps {
  script?: string;
  manimCode?: string;
  className?: string;
  isEditable?: boolean;
  onEdit?: (type: 'script' | 'code', content: string) => void;
}

const ScriptViewer: React.FC<ScriptViewerProps> = ({ 
  script, 
  manimCode, 
  className,
  isEditable = false,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState<'script' | 'code'>('code');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [copySuccess, setCopySuccess] = useState<'script' | 'code' | null>(null);
  
  const handleCopy = (type: 'script' | 'code') => {
    const content = type === 'script' ? script : manimCode;
    if (!content) return;
    
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopySuccess(type);
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  const handleEdit = () => {
    setEditContent(activeTab === 'script' ? script || '' : manimCode || '');
    setIsEditing(true);
  };
  
  const handleSave = () => {
    if (onEdit) {
      onEdit(activeTab, editContent);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {activeTab === 'script' ? 'Animation Script' : 'Generated Manim Code'}
        </h2>
        <div className="flex">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(activeTab)}
            disabled={activeTab === 'script' ? !script : !manimCode}
          >
            {copySuccess === activeTab ? (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1.5" />
                Copy
              </>
            )}
          </Button>
          {isEditable && (
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={isEditing ? handleSave : handleEdit}
              disabled={activeTab === 'script' ? !script : !manimCode}
            >
              {isEditing ? (
                'Save'
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-1.5" />
                  Edit
                </>
              )}
            </Button>
          )}
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'script' | 'code')}>
        <TabsList className="mb-4">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="script">Script</TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
          {isEditing && activeTab === 'code' ? (
            <textarea
              className="w-full h-96 p-4 font-mono text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 border-none focus:outline-none resize-none"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
          ) : (
            <pre className="p-4 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-96">
              {manimCode || 'No code generated yet.'}
            </pre>
          )}
        </TabsContent>
        
        <TabsContent value="script" className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
          {isEditing && activeTab === 'script' ? (
            <textarea
              className="w-full h-96 p-4 font-mono text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 border-none focus:outline-none resize-none"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
          ) : (
            <pre className="p-4 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-96">
              {script || 'No script generated yet.'}
            </pre>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScriptViewer;
