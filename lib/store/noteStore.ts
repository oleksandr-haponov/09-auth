import {create} from  'zustand' ;
import { NewNoteData } from '@/types/note';
import {persist} from  'zustand/middleware' ;

type NoteDraftStore = {
 draft: NewNoteData;
 setDraft: (note: NewNoteData) =>  void ;
 clearDraft: () =>  void ;
}

const initialDraft: NewNoteData = {
  title: '',
  content: '',
  tag: 'Todo',
};

export const useNoteDraftStore = create<NoteDraftStore>() ( 
 persist (
  (set) => ({
 draft: initialDraft,
  setDraft: (note) => set( () => ({ draft: note })),
  clearDraft: () => set( () => ({ draft: initialDraft })),
}),
{
// Ключ в localStorage
      name: 'note-draft' ,
      partialize: (state) => ({ draft: state.draft }),
    },
  ),
);