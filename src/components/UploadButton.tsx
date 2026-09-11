import { ChangeEvent, useRef } from 'react';
import { Upload } from 'lucide-react';
import { MediaItem } from '../types';

interface UploadButtonProps {
  onUpload: (items: MediaItem[]) => void;
}

export function UploadButton({ onUpload }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: MediaItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      name: file.name,
      createdAt: Date.now(),
    }));

    onUpload(newItems);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*,video/*"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-full hover:bg-stone-800 transition-colors shadow-sm text-sm font-medium"
      >
        <Upload size={18} />
        <span>Upload Media</span>
      </button>
    </div>
  );
}
