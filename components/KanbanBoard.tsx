import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
  rectIntersection,
  CollisionDetection
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Phone, Calendar, Building2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLeadStore } from '../store';
import { COLUMNS, Lead, LeadStatus } from '../types';
import { GlassPane } from './ui/Glass';

// --- Sortable Card Component ---
interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: lead.id,
    data: {
      type: "Lead",
      lead
    },
    disabled: lead.isOptimistic // Disable drag for optimistic items
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="opacity-30 h-[120px] bg-gray-200/50 rounded-2xl mb-3 border-2 border-dashed border-gray-300" />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-none outline-none ${lead.isOptimistic ? 'cursor-wait opacity-70' : ''}`}
    >
      <GlassPane
        intensity="low"
        hoverEffect={!lead.isOptimistic}
        onClick={lead.isOptimistic ? undefined : onClick}
        className={`p-4 rounded-2xl mb-3 group relative ${lead.isOptimistic ? 'border-orqio-orange/50 border-dashed' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 leading-tight">{lead.name}</h3>
            {lead.isOptimistic && (
              <span className="text-[10px] bg-orqio-orange/10 text-orqio-orange px-1.5 py-0.5 rounded animate-pulse">
                Salvando...
              </span>
            )}
          </div>
          {lead.nextAction && !lead.isOptimistic && (
            <div className="w-2 h-2 rounded-full bg-orqio-orange animate-pulse" title={`Próxima ação: ${lead.nextAction}`} />
          )}
        </div>

        <div className="flex items-center text-xs text-gray-500 mb-3 gap-1">
          <Building2 size={12} />
          <span className="truncate max-w-[150px]">{lead.company}</span>
        </div>

        {/* Responsible Info */}
        {lead.responsibleName && (
          <div className="flex items-center text-xs text-orqio-orange mb-3 gap-1 font-medium">
            <User size={12} />
            <span className="truncate max-w-[150px]">{lead.responsibleName}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-white/50 px-2 py-1 rounded-lg text-gray-600 border border-white/60">
            <Phone size={10} /> {lead.phone}
          </span>
          {lead.lastInteraction && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-white/50 px-2 py-1 rounded-lg text-gray-600 border border-white/60">
              <Calendar size={10} />
              {new Date(lead.lastInteraction).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </span>
          )}
        </div>
      </GlassPane>
    </div>
  );
};

// --- Column Component ---
interface KanbanColumnProps {
  column: typeof COLUMNS[0];
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, leads, onLeadClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column
    }
  });

  const leadsIds = useMemo(() => leads.map((lead) => lead.id), [leads]);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full min-w-[280px] w-[280px] snap-center transition-all duration-200 ${isOver ? 'scale-[1.02] ring-2 ring-orqio-orange/30 rounded-3xl' : ''}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between mb-4 pl-2 pr-4`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full border-2 bg-white ${column.color}`} />
          <h3 className="font-semibold text-gray-700 text-sm tracking-tight">{column.label}</h3>
        </div>
        <span className="bg-black/5 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-md">{leads.length}</span>
      </div>

      {/* Sortable Context / Drop Zone */}
      <div className={`flex-1 rounded-3xl p-2 transition-colors duration-200 flex flex-col ${isOver ? 'bg-orqio-orange/5' : 'bg-black/[0.02]'}`}>
        <SortableContext items={leadsIds} strategy={verticalListSortingStrategy}>
          <div className="flex-1 overflow-y-auto pr-1 pb-10 scrollbar-thin min-h-[200px]">
            {leads.map(lead => (
              <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
            ))}
            {leads.length === 0 && (
              <div className="h-full min-h-[150px] border-2 border-dashed border-gray-300/30 rounded-2xl flex items-center justify-center">
                <span className="text-sm font-medium text-gray-400">Vazio</span>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

// --- Kanban Board Container ---
interface KanbanBoardProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, onLeadClick }) => {
  const { moveLead } = useLeadStore();

  // Local state for smooth drag-and-drop
  const [items, setItems] = useState<{ [key in LeadStatus]: Lead[] }>({
    [LeadStatus.NEW]: [],
    [LeadStatus.CONTACTED]: [],
    [LeadStatus.RESPONSIBLE]: [],
    [LeadStatus.MEETING]: [],
    [LeadStatus.NEGOTIATION]: [],
    [LeadStatus.WON]: [],
    [LeadStatus.DISQUALIFIED]: []
  });

  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const isDraggingRef = useRef(false);

  // Sync local state with prop leads whenever they change (e.g. initial load or realtime update)
  useEffect(() => {
    if (isDraggingRef.current) return; // Don't sync while dragging to avoid stutter

    const newItems: { [key in LeadStatus]: Lead[] } = {
      [LeadStatus.NEW]: [],
      [LeadStatus.CONTACTED]: [],
      [LeadStatus.RESPONSIBLE]: [],
      [LeadStatus.MEETING]: [],
      [LeadStatus.NEGOTIATION]: [],
      [LeadStatus.WON]: [],
      [LeadStatus.DISQUALIFIED]: []
    };

    leads.forEach(lead => {
      if (newItems[lead.status]) {
        newItems[lead.status].push(lead);
      }
    });

    setItems(newItems);
  }, [leads]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Track original container for DB commit
  const originalContainerRef = useRef<LeadStatus | null>(null);

  const findContainer = (id: string): LeadStatus | undefined => {
    if ((Object.values(LeadStatus) as string[]).includes(id)) {
      return id as LeadStatus;
    }
    return Object.keys(items).find((key) =>
      items[key as LeadStatus].find((item) => item.id === id)
    ) as LeadStatus | undefined;
  };

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Lead") {
      setActiveLead(event.active.data.current.lead);
      isDraggingRef.current = true;
      // Store original container for DB commit comparison
      originalContainerRef.current = event.active.data.current.lead.status;
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Find the containers
    const activeId = active.id;
    const overId = over.id;
    const activeContainer = findContainer(activeId as string);
    const overContainer = findContainer(overId as string);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    // Move in local state for fluid UI
    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      // Find indexes
      const activeIndex = activeItems.findIndex((i) => i.id === activeId);
      const overIndex = (Object.values(LeadStatus) as string[]).includes(overId as string)
        ? overItems.length + 1 // dropped on empty column
        : overItems.findIndex((i) => i.id === overId);

      let newIndex;
      if ((Object.values(LeadStatus) as string[]).includes(overId as string)) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top >
          over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item.id !== active.id)
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length)
        ]
      };
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id;
    const overId = over ? over.id : null;

    // Use original container (stored at drag start) for comparison
    const originalContainer = originalContainerRef.current;
    const overContainer = overId ? findContainer(overId as string) : null;

    // Commit to DB if we actually moved to a different column
    if (
      originalContainer &&
      overContainer &&
      originalContainer !== overContainer
    ) {
      moveLead(activeId as string, overContainer);
    }

    setActiveLead(null);
    isDraggingRef.current = false;
    originalContainerRef.current = null;
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex-1 overflow-auto">
        <div className="h-full flex px-6 gap-4 pb-4 min-w-max">
          {COLUMNS.map((col, index) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="h-full"
            >
              <KanbanColumn
                column={col}
                leads={items[col.id]} // Render from local items state!
                onLeadClick={onLeadClick}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeLead && (
          <div className="rotate-3 scale-105 cursor-grabbing">
            <GlassPane intensity="high" className="p-4 rounded-2xl shadow-2xl">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900">{activeLead.name}</h3>
              </div>
            </GlassPane>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};