import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadStatus, Note } from './types';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';

export const useLeadStore = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const { user } = useAuth();

  // Fetch leads on load
  useEffect(() => {
    if (!user) return;

    const fetchLeads = async () => {
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          notes (*)
        `)
        .order('created_at', { ascending: false });

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        return;
      }

      // Transform data to match frontend types if needed
      // Supabase returns snake_case, frontend uses camelCase.
      // We might need a mapper or update types. Let's map for now to be safe.
      const mappedLeads: Lead[] = (leadsData || []).map((l: any) => ({
        id: l.id,
        name: l.name,
        company: l.company,
        phone: l.phone,
        email: l.email,
        status: l.status as LeadStatus,
        createdAt: l.created_at,
        responsibleName: l.responsible_name,
        responsiblePhone: l.responsible_phone,
        origin: l.origin,
        owner: l.owner,
        lastInteraction: l.last_interaction,
        nextAction: l.next_action,
        notes: (l.notes || []).map((n: any) => ({
          id: n.id,
          content: n.content,
          createdAt: n.created_at
        })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }));

      setLeads(mappedLeads);
    };

    fetchLeads();

    // subscriptions
    const channel = supabase
      .channel('public:leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        // Handle different events
        if (payload.eventType === 'INSERT') {
          const newLeadRaw = payload.new as any;
          const newLead: Lead = {
            id: newLeadRaw.id,
            name: newLeadRaw.name,
            company: newLeadRaw.company,
            phone: newLeadRaw.phone,
            email: newLeadRaw.email,
            status: newLeadRaw.status as LeadStatus,
            createdAt: newLeadRaw.created_at,
            responsibleName: newLeadRaw.responsible_name,
            responsiblePhone: newLeadRaw.responsible_phone,
            origin: newLeadRaw.origin,
            owner: newLeadRaw.owner,
            lastInteraction: newLeadRaw.last_interaction,
            nextAction: newLeadRaw.next_action,
            notes: [] // New leads from DB won't have notes in payload usually
          };
          setLeads(prev => {
            if (prev.find(l => l.id === newLead.id)) return prev; // Avoid duplicates
            return [newLead, ...prev];
          });
        }
        else if (payload.eventType === 'UPDATE') {
          const updatedRaw = payload.new as any;
          setLeads(prev => prev.map(l => {
            if (l.id === updatedRaw.id) {
              // Start with existing lead to preserve notes (which aren't in the update payload)
              return {
                ...l,
                name: updatedRaw.name,
                company: updatedRaw.company,
                phone: updatedRaw.phone,
                email: updatedRaw.email,
                status: updatedRaw.status as LeadStatus,
                responsibleName: updatedRaw.responsible_name,
                responsiblePhone: updatedRaw.responsible_phone,
                origin: updatedRaw.origin,
                lastInteraction: updatedRaw.last_interaction,
                nextAction: updatedRaw.next_action,
                // owner and createdAt usually don't change
              };
            }
            return l;
          }));
        }
        else if (payload.eventType === 'DELETE') {
          setLeads(prev => prev.filter(l => l.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [user]);

  // No changes to fetchLeads or subscription logic...
  // Just updating the actions below

  const addLead = useCallback(async (leadData: Omit<Lead, 'id' | 'createdAt' | 'notes'> & { initialNote?: string }) => {
    if (!user) return;

    const { initialNote, ...dbData } = leadData;

    // OPTIMISTIC UPDATE: Create a temporary lead
    const tempId = Math.random().toString(36).substr(2, 9);
    const tempLead: Lead = {
      id: tempId,
      name: dbData.name,
      company: dbData.company,
      phone: dbData.phone,
      email: dbData.email,
      status: LeadStatus.NEW,
      createdAt: new Date().toISOString(),
      responsibleName: dbData.responsibleName,
      origin: dbData.origin,
      owner: user.id || 'me',
      lastInteraction: new Date().toISOString(),
      isOptimistic: true,
      notes: initialNote ? [{
        id: 'temp-note',
        content: initialNote,
        createdAt: new Date().toISOString()
      }] : []
    } as any;

    setLeads(prev => [tempLead, ...prev]);

    // Insert Lead
    const { data: newLead, error } = await supabase
      .from('leads')
      .insert([{
        name: dbData.name,
        company: dbData.company,
        phone: dbData.phone,
        email: dbData.email,
        status: LeadStatus.NEW,
        owner: user.id,
        origin: dbData.origin,
        responsible_name: dbData.responsibleName,
        responsible_phone: dbData.responsiblePhone,
        next_action: dbData.nextAction, // Ensuring this is also sent if present
      }])
      .select()
      .single();

    if (error) {
      console.error("Error adding lead", error);
      alert("Erro ao adicionar lead");
      // Revert optimistic update
      setLeads(prev => prev.filter(l => l.id !== tempId));
      return;
    }

    // Insert Initial Note
    if (initialNote && newLead) {
      await supabase.from('notes').insert({
        lead_id: newLead.id,
        content: initialNote,
        user_id: user.id
      });
    }

    // Replace temp lead with real lead (optional, or let subscription handle it)
    // Actually, subscription is safest, but we can update ID locally to avoid glitches if subscription is slow
    setLeads(prev => prev.map(l => {
      if (l.id === tempId) {
        // Create a new object for the lead with the real ID and NO isOptimistic flag
        const { isOptimistic, ...rest } = l;
        return { ...rest, id: newLead.id };
      }
      return l;
    }));

  }, [user]);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    // OPTIMISTIC UPDATE
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));

    // Map CamelCase to snake_case for DB
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.company) dbUpdates.company = updates.company;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.responsibleName) dbUpdates.responsible_name = updates.responsibleName;
    if (updates.responsiblePhone) dbUpdates.responsible_phone = updates.responsiblePhone;
    if (updates.lastInteraction) dbUpdates.last_interaction = updates.lastInteraction;
    if (updates.nextAction) dbUpdates.next_action = updates.nextAction;

    const { error } = await supabase
      .from('leads')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error("Error updating lead", error);
      // Revert could be implemented here fetching original state
    }
  }, []);

  const moveLead = useCallback(async (id: string, newStatus: LeadStatus) => {
    // OPTIMISTIC UPDATE - CRITICAL for Drag & Drop
    const now = new Date().toISOString();
    setLeads(prev => prev.map(l => l.id === id ? {
      ...l,
      status: newStatus,
      lastInteraction: now
    } : l));

    const { error } = await supabase
      .from('leads')
      .update({
        status: newStatus,
        last_interaction: now
      })
      .eq('id', id);

    if (error) {
      console.error("Error moving lead", error);
      // We really should revert here if it fails
    }
  }, []);

  const addNote = useCallback(async (leadId: string, content: string) => {
    if (!user) return;

    // Optimistic Update
    const newNote: Note = {
      id: Math.random().toString(),
      content,
      createdAt: new Date().toISOString()
    };

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          lastInteraction: new Date().toISOString(),
          notes: [newNote, ...l.notes]
        };
      }
      return l;
    }));

    const { error } = await supabase.from('notes').insert({
      lead_id: leadId,
      content,
      user_id: user.id
    });

    if (!error) {
      await supabase.from('leads').update({
        last_interaction: new Date().toISOString()
      }).eq('id', leadId);
    }
  }, [user]);

  const deleteLead = useCallback(async (id: string) => {
    // Optimistic
    setLeads(prev => prev.filter(l => l.id !== id));

    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) console.error("Error deleting lead", error);
  }, []);

  return { leads, addLead, updateLead, moveLead, addNote, deleteLead };
};