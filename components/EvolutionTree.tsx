import React from 'react';
import { AppIdea } from '../types';

interface EvolutionTreeProps {
  ideas: AppIdea[];
  onSelect: (id: string) => void;
}

const EvolutionTree: React.FC<EvolutionTreeProps> = ({ ideas, onSelect }) => {
  const rootIdeas = ideas.filter(i => !i.parentId);
  
  const renderBranches = (parentId: string) => {
    const children = ideas.filter(i => i.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <div className="pl-12 border-l border-indigo-500/20 space-y-8 mt-8">
        {children.map(child => (
          <div key={child.id} className="relative">
            <div className="absolute -left-12 top-10 w-12 h-px bg-indigo-500/20"></div>
            <IdeaNode idea={child} onSelect={onSelect} />
            {renderBranches(child.id)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="py-12 space-y-20 animate-in fade-in">
       <div className="text-center space-y-4">
         <h2 className="text-5xl font-black uppercase tracking-tighter">Evolution Lab</h2>
         <p className="text-slate-500 text-lg">See how your ideas branch and evolve into unique markets.</p>
       </div>

       <div className="max-w-5xl mx-auto space-y-16">
          {rootIdeas.map(root => (
            <div key={root.id}>
              <IdeaNode idea={root} onSelect={onSelect} />
              {renderBranches(root.id)}
            </div>
          ))}
          {rootIdeas.length === 0 && (
            <div className="py-40 text-center text-slate-700 italic font-black uppercase tracking-widest opacity-30">
              No ideas to evolve. Generate something first.
            </div>
          )}
       </div>
    </div>
  );
};

const IdeaNode = ({ idea, onSelect }: { idea: AppIdea, onSelect: (id: string) => void }) => (
  <button 
    onClick={() => onSelect(idea.id)}
    className="w-full text-left glass-card p-8 rounded-[2rem] border border-white/5 hover:border-indigo-500/40 transition-all group flex items-center justify-between"
  >
    <div className="space-y-2">
      <div className="flex gap-2">
        <span className="text-[9px] font-black bg-indigo-600/10 text-indigo-400 px-2 py-1 rounded-md uppercase">{idea.vibeAesthetic}</span>
        <span className="text-[9px] font-black bg-white/5 text-slate-500 px-2 py-1 rounded-md uppercase">Score: {idea.originalityScore}</span>
      </div>
      <h3 className="text-2xl font-black text-white uppercase group-hover:text-indigo-400 transition-colors">{idea.name}</h3>
      <p className="text-xs text-slate-500 line-clamp-1 italic">"{idea.coreConcept}"</p>
    </div>
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
       →
    </div>
  </button>
);

export default EvolutionTree;