'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, X, Upload, FileText, Image, File } from 'lucide-react';

interface Attachment {
  id: string;
  filename: string;
  file_url: string;
  file_size: number;
  file_type?: string | null;
  created_at: string;
}

interface TicketAttachmentsPanelProps {
  ticketId: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType?: string | null) {
  if (!fileType) return <File className="h-4 w-4" />;
  if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
  if (fileType.includes('pdf') || fileType.includes('document'))
    return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
}

export function TicketAttachmentsPanel({ ticketId }: TicketAttachmentsPanelProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAttachments = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/attachments`);
      if (!res.ok) throw new Error('Failed to fetch attachments');
      const data = await res.json();
      setAttachments(data);
    } catch (err) {
      console.error('Error fetching attachments:', err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // First upload to storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ticketId', ticketId);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || 'Upload failed');
      }

      const uploadData = await uploadRes.json();

      // Then create attachment record
      const attachmentRes = await fetch(`/api/tickets/${ticketId}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: uploadData.filename,
          file_url: uploadData.fileUrl,
          file_size: uploadData.fileSize,
          file_type: uploadData.fileType,
        }),
      });

      if (!attachmentRes.ok) throw new Error('Failed to create attachment record');

      await fetchAttachments();
    } catch (err) {
      console.error('Error uploading file:', err);
      alert(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  }

  async function handleDelete(attachmentId: string) {
    setDeletingId(attachmentId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/attachments/${attachmentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete attachment');

      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (err) {
      console.error('Error deleting attachment:', err);
    } finally {
      setDeletingId(null);
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          Attachments ({attachments.length})
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="rounded-full"
          onClick={triggerFileInput}
        >
          {uploading ? (
            <>
              <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {attachments.length === 0 ? (
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={uploading}
          className="w-full text-center py-8 border-2 border-dashed border-border rounded-xl bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Paperclip className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No attachments yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Click to upload files</p>
        </button>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/40 hover:bg-card/60 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {getFileIcon(attachment.file_type)}
              </div>

              <div className="flex-1 min-w-0">
                <a
                  href={attachment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:underline truncate block"
                >
                  {attachment.filename}
                </a>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.file_size)} •{' '}
                  {new Date(attachment.created_at).toLocaleDateString()}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                onClick={() => handleDelete(attachment.id)}
                disabled={deletingId === attachment.id}
              >
                {deletingId === attachment.id ? (
                  <div className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
