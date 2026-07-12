"use client";

import { useState } from "react";
import { Search, X, Mail, MapPin, Phone, Link, MessageSquare, ShieldAlert } from "lucide-react";
import DeleteUserButton from "@/components/delete-user-button";

interface TeamMember {
  name: string;
  email: string;
  phone: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  country: string;
  phone: string;
  github?: string | null;
  linkedin?: string | null;
  discord: string;
  teamMembers?: TeamMember[];
  createdAt: string;
}

interface AdminUserListProps {
  initialUsers: User[];
}

export default function AdminUserList({ initialUsers }: AdminUserListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchQuery.toLowerCase().trim();

  // Filter registrations based on name, email, and phone (main user and team members)
  const filteredUsers = initialUsers.filter((user) => {
    if (!query) return true;

    const nameMatch = user.name?.toLowerCase().includes(query);
    const emailMatch = user.email?.toLowerCase().includes(query);
    const phoneMatch = user.phone?.toLowerCase().includes(query);

    // Also check team members
    const teamMatch = user.teamMembers?.some(
      (member) =>
        member.name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.phone?.toLowerCase().includes(query)
    );

    return nameMatch || emailMatch || phoneMatch || teamMatch;
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-neutral-900/50 p-5 rounded-2xl border border-neutral-800/80 backdrop-blur-sm space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-500" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-11 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 text-sm md:text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-neutral-300 transition-colors"
              title="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-neutral-800/40 text-xs text-neutral-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-neutral-500 uppercase tracking-wider">Search Criteria:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-950 border border-neutral-800 text-[10px] font-medium text-neutral-300">
              Name
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-950 border border-neutral-800 text-[10px] font-medium text-neutral-300">
              Email
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-950 border border-neutral-800 text-[10px] font-medium text-neutral-300">
              Phone
            </span>
          </div>
          <div>
            {searchQuery ? (
              <span>
                Found <strong className="text-indigo-400 font-semibold">{filteredUsers.length}</strong> matching{" "}
                {filteredUsers.length === 1 ? "user" : "users"}
              </span>
            ) : (
              <span>
                Showing all <strong className="text-neutral-200 font-semibold">{initialUsers.length}</strong> registered{" "}
                {initialUsers.length === 1 ? "user" : "users"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-neutral-500 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20">
            <div className="bg-neutral-900 p-4 rounded-full mb-4">
              <ShieldAlert className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? "No Matching Registrations" : "No Registrations Yet"}
            </h3>
            <p className="text-neutral-400 max-w-sm text-center text-sm">
              {searchQuery
                ? "Try adjusting your search terms or clear the filter to see all registrations."
                : "Once users complete the bot registration flow, their details will appear here."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20"
              >
                Reset Search
              </button>
            )}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-neutral-700 transition-all duration-300 group flex flex-col h-full"
            >
              {/* User Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {user.name}
                  </h2>
                  <div className="flex items-center gap-1.5 text-sm text-neutral-400 mt-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="font-medium">{user.country || "Not specified"}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-[10px] font-mono text-neutral-500 bg-neutral-950/80 border border-neutral-800 px-2 py-1 rounded-md whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <DeleteUserButton id={user._id} />
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mt-auto bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/40">
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <Mail className="h-4 w-4 text-neutral-500 shrink-0" />
                  <a href={`mailto:${user.email}`} className="hover:text-white transition-colors truncate">
                    {user.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <Phone className="h-4 w-4 text-neutral-500 shrink-0" />
                  <span className="truncate">{user.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <MessageSquare className="h-4 w-4 text-neutral-500 shrink-0" />
                  <span className="truncate font-medium">{user.discord}</span>
                </div>
              </div>

              {/* Social Links */}
              {(user.github || user.linkedin) && (
                <div className="flex items-center gap-4 pt-5 mt-5 border-t border-neutral-800/50">
                  {user.github && (
                    <a
                      href={user.github}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-2 text-xs font-medium transition-colors px-3 py-1.5 rounded-lg"
                    >
                      <Link className="h-3.5 w-3.5" /> GitHub
                    </a>
                  )}
                  {user.linkedin && (
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#0077b5] hover:text-[#00a0dc] flex items-center gap-2 text-xs font-medium transition-colors px-3 py-1.5 rounded-lg"
                    >
                      <Link className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  )}
                </div>
              )}

              {/* Team Members */}
              {user.teamMembers && user.teamMembers.length > 0 && (
                <div className="mt-5 bg-neutral-950/80 rounded-xl p-4 border border-neutral-800">
                  <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    Team Members{" "}
                    <span className="bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded-full">
                      {user.teamMembers.length}
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {user.teamMembers.map((member, i) => (
                      <div
                        key={i}
                        className="flex flex-col gap-1 relative pl-3 border-l-2 border-neutral-800 hover:border-indigo-500/50 transition-colors"
                      >
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-neutral-200">{member.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
                            {member.phone}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-500 truncate">{member.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
