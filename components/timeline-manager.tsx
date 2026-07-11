"use client"

import { useState } from "react";
import { Edit2, Save, X, Plus, Trash2, CalendarDays } from "lucide-react";
import { updateTimelineEvent, addTimelineEvent, deleteTimelineEvent } from "@/app/admin/timeline-actions";

type Event = {
  _id: string;
  dateStr: string;
  date: string;
  title: string;
  description: string;
  order: number;
};

export default function TimelineManager({ initialEvents }: { initialEvents: Event[] }) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Event>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startEdit = (event: Event) => {
    setEditingId(event._id);
    // Format date for the datetime-local input
    const d = new Date(event.date);
    const dateStr = !isNaN(d.getTime()) ? d.toISOString().slice(0, 16) : '';
    setEditForm({ ...event, date: dateStr });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!editForm.title || !editForm.dateStr || !editForm.date) return alert("Required fields missing");
    setIsLoading(true);

    try {
      const parsedDate = new Date(editForm.date);
      const dataToSave = { ...editForm, date: parsedDate };

      if (isAdding) {
        const res = await addTimelineEvent(dataToSave);
        if (res.success) {
          setIsAdding(false);
          // Assuming revalidatePath refreshes the page component. We can just force a reload or wait for next.js
          window.location.reload(); 
        } else {
          alert(res.error);
        }
      } else if (editingId) {
        const res = await updateTimelineEvent(editingId, dataToSave);
        if (res.success) {
          setEditingId(null);
          // Let Next.js revalidation handle update or update local state
          window.location.reload();
        } else {
          alert(res.error);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    setIsLoading(true);
    const res = await deleteTimelineEvent(id);
    if (res.success) window.location.reload();
    else alert(res.error);
    setIsLoading(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId('new');
    setEditForm({ title: '', dateStr: '', date: '', description: '' });
  };

  return (
    <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800/60 backdrop-blur-sm mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <CalendarDays className="h-6 w-6 text-emerald-400" />
          </div>
          Timeline Management
        </h2>
        <button 
          onClick={startAdd}
          disabled={editingId !== null}
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add Event
        </button>
      </div>

      <div className="space-y-4">
        {events.length === 0 && !isAdding && (
          <p className="text-neutral-500 italic">No timeline events found.</p>
        )}

        {(isAdding ? [...events, { _id: 'new', order: 999 } as Event] : events).map((event) => {
          const isEditing = editingId === event._id;

          if (isEditing) {
            return (
              <div key={event._id} className="bg-neutral-950 p-4 rounded-xl border border-emerald-500/50 space-y-4 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-neutral-400">Title</label>
                    <input 
                      type="text" 
                      value={editForm.title || ''} 
                      onChange={e => setEditForm({...editForm, title: e.target.value})}
                      className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-neutral-400">Display Date String (e.g. 'July 16')</label>
                    <input 
                      type="text" 
                      value={editForm.dateStr || ''} 
                      onChange={e => setEditForm({...editForm, dateStr: e.target.value})}
                      className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-neutral-400">Actual Date & Time (for progress bar)</label>
                    <input 
                      type="datetime-local" 
                      value={editForm.date || ''} 
                      onChange={e => setEditForm({...editForm, date: e.target.value})}
                      className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-neutral-400">Description</label>
                    <input 
                      type="text" 
                      value={editForm.description || ''} 
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                      className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={cancelEdit} className="px-4 py-2 rounded-lg flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                    <X className="h-4 w-4" /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors disabled:opacity-50">
                    <Save className="h-4 w-4" /> Save
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={event._id} className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-neutral-700 transition-colors">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-white font-bold">{event.title}</h3>
                  <p className="text-neutral-500 text-sm mt-1">{event.description || 'No description'}</p>
                </div>
                <div className="text-neutral-400 text-sm">
                  <span className="block text-emerald-400/80 mb-1">{event.dateStr}</span>
                  {new Date(event.date).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => startEdit(event)}
                  disabled={editingId !== null}
                  className="p-2 text-neutral-500 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(event._id)}
                  disabled={editingId !== null}
                  className="p-2 text-red-500/70 hover:text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
