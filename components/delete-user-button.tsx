"use client"

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteUser } from "@/app/admin/actions";

export default function DeleteUserButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    const result = await deleteUser(id);
    if (!result.success) {
      alert(result.error || "Failed to delete user");
      setIsDeleting(false);
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 ml-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center self-start"
      title="Delete User"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
