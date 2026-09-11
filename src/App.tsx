/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Gallery } from './components/Gallery';
import { Slideshow } from './components/Slideshow';
import { UploadButton } from './components/UploadButton';
import { MediaItem, Folder } from './types';
import { INITIAL_MEDIA, INITIAL_FOLDERS } from './data';
import { Image as ImageIcon, FolderPlus, Edit2, Trash2, X, Download, Loader2 } from 'lucide-react';
import JSZip from 'jszip';

export default function App() {
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);
  
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const filteredMedia = activeFolderId
    ? mediaItems.filter(m => m.folderId === activeFolderId)
    : mediaItems;

  const handleUpload = (newItems: MediaItem[]) => {
    // If we're inside a specific folder, tag the new items with that folder
    const itemsToUpload = newItems.map(item => ({
      ...item,
      folderId: activeFolderId || undefined
    }));
    setMediaItems((prev) => [...itemsToUpload, ...prev]);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const setItemSelection = (id: string, select: boolean) => {
    setSelectedIds(prev => {
      if (select && !prev.includes(id)) return [...prev, id];
      if (!select && prev.includes(id)) return prev.filter(i => i !== id);
      return prev;
    });
  };

  const moveSelected = (newFolderId: string) => {
    setMediaItems(prev => prev.map(m => 
      selectedIds.includes(m.id) 
        ? { ...m, folderId: newFolderId === 'none' ? undefined : newFolderId } 
        : m
    ));
    setSelectedIds([]);
    setIsSelectMode(false);
  };

  // Dialog State
  const [dialog, setDialog] = useState<
    | { type: 'none' }
    | { type: 'create_folder' }
    | { type: 'rename_folder'; folderId: string; currentName: string }
    | { type: 'delete_confirm' }
  >({ type: 'none' });
  const [dialogInput, setDialogInput] = useState('');

  const createFolder = () => {
    setDialogInput('');
    setDialog({ type: 'create_folder' });
  };

  const submitCreateFolder = () => {
    if (dialogInput && dialogInput.trim()) {
      const newFolder: Folder = {
        id: crypto.randomUUID(),
        name: dialogInput.trim(),
        createdAt: Date.now()
      };
      setFolders(prev => [...prev, newFolder]);
      setActiveFolderId(newFolder.id);
    }
    setDialog({ type: 'none' });
  };

  const renameFolder = (folderId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogInput(currentName);
    setDialog({ type: 'rename_folder', folderId, currentName });
  };

  const submitRenameFolder = () => {
    if (dialog.type === 'rename_folder' && dialogInput && dialogInput.trim()) {
      setFolders(prev => prev.map(f => f.id === dialog.folderId ? { ...f, name: dialogInput.trim() } : f));
    }
    setDialog({ type: 'none' });
  };

  const deleteSelected = () => {
    setDialog({ type: 'delete_confirm' });
  };

  const submitDeleteSelected = () => {
    setMediaItems(prev => prev.filter(m => !selectedIds.includes(m.id)));
    setSelectedIds([]);
    setIsSelectMode(false);
    setDialog({ type: 'none' });
  };

  const downloadSelected = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const selectedMedia = mediaItems.filter(m => selectedIds.includes(m.id));

      const fetchPromises = selectedMedia.map(async (item) => {
        try {
          const response = await fetch(item.url);
          const blob = await response.blob();
          const ext = item.type === 'video' ? 'mp4' : 'jpg';
          const filename = `${item.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${item.id.slice(0, 6)}.${ext}`;
          zip.file(filename, blob);
        } catch (e) {
          console.error(`Failed to fetch ${item.url}`, e);
        }
      });

      await Promise.all(fetchPromises);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gallery_export_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsSelectMode(false);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error creating zip:', error);
      alert('Failed to create zip file.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200 relative pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-stone-900 text-white p-2 rounded-xl shadow-sm hidden sm:block">
              <ImageIcon size={20} />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-stone-900">
              Family Gallery
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setIsSelectMode(!isSelectMode); setSelectedIds([]); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isSelectMode ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              {isSelectMode ? 'Cancel' : 'Select'}
            </button>
            <UploadButton onUpload={handleUpload} />
          </div>
        </div>
        
        {/* Folder Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-stone-100 items-center">
          <button
            onClick={() => setActiveFolderId(null)}
            className={`whitespace-nowrap flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFolderId === null 
                ? 'bg-stone-900 text-white shadow-sm' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <div className={`w-5 h-5 rounded flex items-center justify-center ${activeFolderId === null ? 'bg-stone-800' : 'bg-stone-200'}`}>
              <ImageIcon size={12} />
            </div>
            All Media
          </button>
          
          {folders.map(folder => {
            const cover = mediaItems.find(m => m.folderId === folder.id);
            return (
              <button
                key={folder.id}
                onClick={() => setActiveFolderId(folder.id)}
                className={`group whitespace-nowrap flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFolderId === folder.id 
                    ? 'bg-stone-900 text-white shadow-sm' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cover ? (
                  cover.type === 'image' ? (
                    <img src={cover.url} className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-black/10" alt="" />
                  ) : (
                    <video src={cover.url} className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-black/10" />
                  )
                ) : (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${activeFolderId === folder.id ? 'bg-stone-800' : 'bg-stone-200'}`}>
                    <FolderPlus size={12} />
                  </div>
                )}
                <span>{folder.name}</span>
                <div 
                  onClick={(e) => renameFolder(folder.id, folder.name, e)}
                  className={`p-1 rounded-full transition-colors ml-1 ${
                    activeFolderId === folder.id
                      ? 'hover:bg-white/20 text-white/70 hover:text-white'
                      : 'hover:bg-stone-300 text-stone-400 hover:text-stone-700'
                  }`}
                  aria-label="Rename folder"
                >
                  <Edit2 size={12} />
                </div>
              </button>
            );
          })}
          
          <button
            onClick={createFolder}
            className="whitespace-nowrap flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors border border-dashed border-stone-300 ml-2"
          >
            <FolderPlus size={14} />
            New Folder
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {filteredMedia.length > 0 ? (
          <Gallery
            items={filteredMedia}
            onItemClick={setActiveSlideIndex}
            isSelectMode={isSelectMode}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelection}
            onSetSelect={setItemSelection}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
              <ImageIcon className="w-10 h-10 text-stone-400" />
            </div>
            <h2 className="text-2xl font-medium text-stone-900 mb-2">This folder is empty</h2>
            <p className="text-stone-500 max-w-md">
              Start by uploading some family photos or event videos to create your responsive slideshow.
            </p>
          </div>
        )}
      </main>

      {/* Multi-Select Action Bar */}
      {isSelectMode && selectedIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-40 px-4">
          <div className="bg-stone-900 text-white rounded-full shadow-xl flex items-center px-5 py-2.5 gap-4 border border-stone-700">
            <span className="text-sm font-medium">{selectedIds.length} selected</span>
            <div className="h-4 w-px bg-stone-700"></div>
            
            <div className="relative">
              <button 
                onClick={() => setIsMoveMenuOpen(!isMoveMenuOpen)}
                className="bg-transparent text-sm font-medium outline-none cursor-pointer pr-2 py-1 flex items-center gap-2 hover:text-stone-300 transition-colors"
              >
                Move to...
              </button>
              
              {isMoveMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsMoveMenuOpen(false)}></div>
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-56 bg-stone-800 text-white rounded-xl shadow-2xl border border-stone-700 overflow-hidden z-50 flex flex-col max-h-[40vh] overflow-y-auto">
                    <button 
                      onClick={() => { moveSelected('none'); setIsMoveMenuOpen(false); }} 
                      className="w-full text-left px-4 py-3 hover:bg-stone-700 flex items-center gap-3 transition-colors border-b border-stone-700/50"
                    >
                      <div className="w-8 h-8 rounded bg-stone-700 flex items-center justify-center flex-shrink-0">
                        <ImageIcon size={14} className="text-stone-300" />
                      </div>
                      <span className="text-sm font-medium truncate">All Media (No Folder)</span>
                    </button>
                    
                    {folders.map(f => {
                      const cover = mediaItems.find(m => m.folderId === f.id);
                      return (
                        <button 
                          key={f.id}
                          onClick={() => { moveSelected(f.id); setIsMoveMenuOpen(false); }} 
                          className="w-full text-left px-4 py-3 hover:bg-stone-700 flex items-center gap-3 transition-colors"
                        >
                          {cover ? (
                            cover.type === 'image' ? (
                              <img src={cover.url} className="w-8 h-8 rounded object-cover flex-shrink-0 border border-stone-600" alt="" />
                            ) : (
                              <video src={cover.url} className="w-8 h-8 rounded object-cover flex-shrink-0 border border-stone-600" />
                            )
                          ) : (
                            <div className="w-8 h-8 rounded bg-stone-700 flex items-center justify-center flex-shrink-0">
                              <FolderPlus size={14} className="text-stone-300" />
                            </div>
                          )}
                          <span className="text-sm font-medium truncate">{f.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            
            <button onClick={downloadSelected} disabled={isDownloading} className="text-white hover:text-stone-300 transition-colors p-1 ml-2 disabled:opacity-50" title="Download selected">
              {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            </button>
            <button onClick={deleteSelected} className="text-red-400 hover:text-red-300 transition-colors p-1" title="Delete selected">
              <Trash2 size={18} />
            </button>
            <button onClick={() => { setIsSelectMode(false); setSelectedIds([]); }} className="text-stone-400 hover:text-white transition-colors p-1" title="Cancel selection">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Slideshow Modal */}
      {activeSlideIndex !== null && !isSelectMode && (
        <Slideshow
          items={filteredMedia}
          initialIndex={activeSlideIndex}
          onClose={() => setActiveSlideIndex(null)}
        />
      )}

      {/* Custom Dialogs */}
      {dialog.type !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              {dialog.type === 'delete_confirm' ? (
                <>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">Delete Items</h3>
                  <p className="text-stone-600 mb-6">Are you sure you want to delete {selectedIds.length} selected item{selectedIds.length !== 1 ? 's' : ''}? This action cannot be undone.</p>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setDialog({ type: 'none' })} className="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                    <button onClick={submitDeleteSelected} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors">Delete</button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-stone-900 mb-4">
                    {dialog.type === 'create_folder' ? 'New Folder' : 'Rename Folder'}
                  </h3>
                  <input
                    type="text"
                    value={dialogInput}
                    onChange={(e) => setDialogInput(e.target.value)}
                    placeholder="Folder name"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') dialog.type === 'create_folder' ? submitCreateFolder() : submitRenameFolder();
                      if (e.key === 'Escape') setDialog({ type: 'none' });
                    }}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent mb-6"
                  />
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setDialog({ type: 'none' })} className="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                    <button onClick={dialog.type === 'create_folder' ? submitCreateFolder : submitRenameFolder} className="px-4 py-2 rounded-xl text-sm font-medium bg-stone-900 text-white hover:bg-stone-800 transition-colors">Save</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
