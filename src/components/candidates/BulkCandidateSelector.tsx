import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkCandidateSelectorProps {
  candidates: any[];
  selectedCandidates: Set<string>;
  isGeneratingShortList: boolean;
  onToggleSelection: (candidateId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onCallSelected: () => void;
  onRemoveSelected: () => void;
}

export function BulkCandidateSelector({
  candidates,
  selectedCandidates,
  isGeneratingShortList,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onCallSelected,
  onRemoveSelected,
}: BulkCandidateSelectorProps) {
  
  const renderBulkActions = () => {
    if (selectedCandidates.size === 0) return null;

    return (
      <Card className="p-3 md:p-4 mb-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedCandidates.size} candidate{selectedCandidates.size > 1 ? 's' : ''} selected
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClearSelection}
              className="h-6 text-xs px-2"
            >
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRemoveSelected}
              className="text-destructive hover:text-destructive border-destructive/50 hover:border-destructive"
            >
              <X className="w-4 h-4 mr-1" />
              Remove Selected
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onCallSelected}
              disabled={isGeneratingShortList}
              className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-green-500 dark:hover:bg-green-600"
            >
              <Phone className="w-4 h-4 mr-1" />
              {isGeneratingShortList ? "Calling..." : "Call Selected"}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const renderCandidateCard = (candidate: any, candidateId: string) => {
    return (
      <Card 
        key={candidateId} 
        className={cn(
          "border border-border/50 hover:border-primary/50 transition-colors hover:shadow-lg",
          selectedCandidates.has(candidateId) && "border-primary bg-primary/5"
        )}
      >
        <div className="p-3 md:p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedCandidates.has(candidateId)}
              onChange={() => onToggleSelection(candidateId)}
              className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm md:text-base truncate">
                {candidate["Candidate Name"] || "Unknown"}
              </h4>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {candidateId}
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div>
      {renderBulkActions()}
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Select candidates for bulk actions
        </span>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onSelectAll}
          className="h-6 text-xs px-2"
        >
          Select All
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* This is where you would map your candidates */}
        {candidates.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No candidates available
          </div>
        ) : (
          // For now, just show a placeholder - integrate with your existing candidate mapping
          <div className="col-span-full text-center py-4 text-muted-foreground">
            Candidate cards will be rendered here with checkbox integration
          </div>
        )}
      </div>
    </div>
  );
}