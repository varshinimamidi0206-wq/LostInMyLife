import React from 'react';
import { ArrowDown, MapPin, Tag, Info, ShieldCheck, FileText, Calendar, Layers, Users } from 'lucide-react';
import { Memory } from '../../types/memory';

interface MemoryConnectionsProps {
  memory: Memory;
}

export const MemoryConnections: React.FC<MemoryConnectionsProps> = ({ memory }) => {
  const title = memory.title || memory.object_name || 'Physical Memory';
  const type = memory.memory_type || 'object';

  // Build authentic context chain strictly supported by saved data
  const nodes: Array<{
    id: string;
    icon: any;
    title: string;
    subtitle: string;
    color: string;
  }> = [
    {
      id: 'entity',
      icon: Layers,
      title: title,
      subtitle: `Memory Classification: ${type.toUpperCase()}`,
      color: 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300',
    },
  ];

  if (memory.location || memory.place_name) {
    nodes.push({
      id: 'location',
      icon: MapPin,
      title: memory.location || memory.place_name || 'Location',
      subtitle: 'Observed Physical Space',
      color: 'border-blue-500/50 bg-blue-950/30 text-blue-300',
    });
  }

  if (memory.captured_at) {
    const formattedDate = new Date(memory.captured_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    nodes.push({
      id: 'time',
      icon: Calendar,
      title: formattedDate,
      subtitle: 'Chronological Anchor',
      color: 'border-purple-500/50 bg-purple-950/30 text-purple-300',
    });
  }

  if (memory.price) {
    nodes.push({
      id: 'price',
      icon: Tag,
      title: `₹${memory.price}`,
      subtitle: memory.brand ? `Brand: ${memory.brand}` : 'Visible Price Tag',
      color: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300',
    });
  }

  if (memory.people_context && memory.people_context.length > 0) {
    nodes.push({
      id: 'people',
      icon: Users,
      title: memory.people_context.join(', '),
      subtitle: 'Social / Situational Atmosphere',
      color: 'border-pink-500/50 bg-pink-950/30 text-pink-300',
    });
  }

  if (memory.visible_text && memory.visible_text.length > 0) {
    nodes.push({
      id: 'text',
      icon: FileText,
      title: `"${memory.visible_text[0]}"`,
      subtitle: 'OCR Inscribed Text',
      color: 'border-amber-500/50 bg-amber-950/30 text-amber-300',
    });
  }

  nodes.push({
    id: 'privacy',
    icon: ShieldCheck,
    title: `Source: ${memory.source?.toUpperCase() || 'CAMERA'}`,
    subtitle: 'Private Memory Indexed for Natural Recall',
    color: 'border-gray-700/80 bg-gray-950/50 text-gray-300',
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <Info className="w-3.5 h-3.5 text-cyan-400" />
        <span>Context Connections</span>
      </div>

      <p className="text-[11px] text-gray-400">
        LostInMyLife connects what, where, when, and visual details so your memories are grounded in real context.
      </p>

      <div className="flex flex-col items-center space-y-2 pt-2">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <React.Fragment key={node.id}>
              <div
                className={`w-full max-w-md flex items-center space-x-3 p-3 rounded-2xl border ${node.color} backdrop-blur-sm transition-all hover:scale-[1.01]`}
              >
                <div className="p-2 rounded-xl bg-gray-950/60 border border-current">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">
                    {node.title}
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    {node.subtitle}
                  </p>
                </div>
              </div>

              {index < nodes.length - 1 && (
                <div className="flex items-center justify-center py-0.5">
                  <ArrowDown className="w-3.5 h-3.5 text-gray-600 animate-bounce" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
