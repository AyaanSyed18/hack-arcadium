'use client';

import React, { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };
type TeamMember = { name: string; role: string; email: string };

const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function RegisterPage() {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there 👋 I\'m the Arcadium registration assistant. I\'ll collect a few details to get you signed up. Ready to start?' }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', discord: '', github: '', linkedin: '',
    teamMembers: [] as TeamMember[]
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  const handleChatSubmit = async () => {
    if (!input.trim() || isStreaming) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input.trim() }];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.trim());

        for (const line of lines) {
          if (line.includes('[DONE]')) continue;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices?.[0]?.delta?.content) {
                botMessage += data.choices[0].delta.content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = botMessage;
                  return updated;
                });
              }
            } catch {}
          }
        }
      }

      // Check if bot returned structured <DATA>
      const dataMatch = botMessage.match(/<DATA>([\s\S]*?)<\/DATA>/);
      if (dataMatch) {
        const extracted = JSON.parse(dataMatch[1].trim());
        setMessages(prev => [...prev, { role: 'assistant', content: '✅ Submitting your registration...' }]);
        const submitRes = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(extracted)
        });
        const submitData = await submitRes.json();
        if (submitData.success) {
          setRegistrationId(submitData.registrationId);
        } else {
          throw new Error(submitData.error || 'Submission failed');
        }
      }

    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, something went wrong: ${err.message}. Please try again or switch to manual entry.`
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setRegistrationId(data.registrationId);
      } else {
        setFormError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setFormError('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTeamMemberCount = (count: number) => {
    const newMembers = [...formData.teamMembers];
    if (count > newMembers.length) {
      for (let i = newMembers.length; i < count; i++) newMembers.push({ name: '', role: '', email: '' });
    } else {
      newMembers.splice(count);
    }
    setFormData({ ...formData, teamMembers: newMembers });
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...formData.teamMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData({ ...formData, teamMembers: newMembers });
  };

  // --- Success Screen ---
  if (registrationId) {
    return (
      <main className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400">
            <CheckIcon />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">You're registered!</h2>
          <p className="text-[#8e8ea0] mb-6">Welcome to Arcadium. Your registration ID is below.</p>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 mb-8">
            <p className="text-xs text-[#8e8ea0] uppercase tracking-widest mb-2">Registration ID</p>
            <code className="text-emerald-400 text-lg font-mono break-all">{registrationId}</code>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Subtle radial glow */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.06), transparent)' }} />

      <div className="relative z-10 flex flex-col min-h-screen max-w-3xl mx-auto w-full px-4">

        {/* Header */}
        <div className="pt-24 pb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
            Arcadium Registration
          </h1>
        </div>

        {/* Mode Switcher — pill tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-[#111111] border border-[#222222] rounded-xl p-1 gap-1">
            <button
              onClick={() => setMode('ai')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'ai'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#8e8ea0] hover:text-white'
              }`}
            >
              <BotIcon />
              AI Assistant
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'manual'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#8e8ea0] hover:text-white'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Manual Entry
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* AI CHAT MODE                                                   */}
        {/* ============================================================ */}
        {mode === 'ai' && (
          <div className="flex flex-col flex-1 pb-8">
            {/* Messages */}
            <div className="flex-1 space-y-6 mb-6 min-h-[400px] max-h-[60vh] overflow-y-auto pr-1">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-emerald-400 mt-1">
                      <BotIcon />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-white'
                      : 'text-[#d1d1d1]'
                  }`}>
                    {msg.content || (
                      <span className="flex gap-1 items-center text-[#555]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#555] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#555] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#555] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar — Claude-style floating box */}
            <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden shadow-xl">
              <div className="flex items-end gap-3 p-3">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Reply here…"
                  disabled={isStreaming}
                  rows={1}
                  className="flex-1 bg-transparent text-white placeholder-[#555] text-[15px] resize-none outline-none py-2 px-2 leading-relaxed max-h-[120px] disabled:opacity-50"
                  style={{ scrollbarWidth: 'none' }}
                />
                <button
                  onClick={handleChatSubmit}
                  disabled={isStreaming || !input.trim()}
                  className="shrink-0 w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed mb-0.5"
                >
                  <SendIcon />
                </button>
              </div>
              <div className="px-5 pb-3 text-xs text-[#444]">Press Enter to send</div>
            </div>
          </div>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="pb-12 space-y-8">

            {/* Personal Details */}
            <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-[#8e8ea0] uppercase tracking-widest mb-5">Personal Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', required: true },
                  { label: 'Email Address', key: 'email', type: 'email', required: true },
                  { label: 'Phone Number', key: 'phone', type: 'tel', required: true },
                  { label: 'Discord Handle', key: 'discord', type: 'text', required: true },
                  { label: 'GitHub Username', key: 'github', type: 'text', required: false },
                  { label: 'LinkedIn URL', key: 'linkedin', type: 'text', required: false },
                ].map(({ label, key, type, required }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-sm text-[#8e8ea0] flex items-center gap-1.5">
                      {label}
                      {required
                        ? <span className="text-emerald-500 text-xs">*</span>
                        : <span className="text-[#555] text-xs">(optional)</span>
                      }
                    </label>
                    <input
                      type={type}
                      required={required}
                      value={(formData as any)[key]}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#252525] rounded-xl px-4 py-3 text-white text-[15px] placeholder-[#333] focus:outline-none focus:border-emerald-500/60 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-[#8e8ea0] uppercase tracking-widest">Team Members</h2>
                  <p className="text-xs text-[#555] mt-1">Max 3 additional members (you + 3 = 4 total)</p>
                </div>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => updateTeamMemberCount(n)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-150 ${
                        formData.teamMembers.length === n
                          ? 'bg-emerald-500 text-black'
                          : 'bg-[#1a1a1a] border border-[#252525] text-[#8e8ea0] hover:border-emerald-500/40'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {formData.teamMembers.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-[#222] rounded-xl">
                  <p className="text-[#555] text-sm">No team members added</p>
                  <p className="text-[#444] text-xs mt-1">Click a number above to add members</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.teamMembers.map((member, index) => (
                    <div key={index} className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-4">
                      <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-3">Member {index + 1}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(['name', 'role', 'email'] as const).map(field => (
                          <div key={field} className="flex flex-col gap-1.5">
                            <label className="text-xs text-[#555] capitalize">{field} *</label>
                            <input
                              type={field === 'email' ? 'email' : 'text'}
                              required
                              value={member[field]}
                              onChange={e => updateTeamMember(index, field, e.target.value)}
                              className="w-full bg-[#111] border border-[#252525] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/60 transition-colors"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error message */}
            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 text-sm">
                {formError}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black font-semibold py-4 rounded-2xl text-[15px] hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? 'Submitting…' : 'Submit Registration →'}
            </button>
          </form>
        )}

      </div>
    </main>
  );
}
