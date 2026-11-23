"use client";

import React from "react";
import { RenderSubstitutionTable } from "../blocks/substitution-table-block";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface SubstitutionTablePickerCardProps {
  question: any;
  index?: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const SubstitutionTablePickerCard: React.FC<SubstitutionTablePickerCardProps> = ({
  question: q,
  index,
  isSelected,
  onToggle,
}) => {
  return (
    <PickerCardWrapper index={index}
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={q.subject?.nameBn || q.subject?.nameEn}
      typeLabel="Substitution Table"
    >
      <div className="flex flex-col gap-2 font-body">
        <div className="w-full">
          <RenderSubstitutionTable
            columnA={q.columnA || []}
            columnB={q.columnB || []}
            columnC={q.columnC || []}
          />
        </div>
      </div>
    </PickerCardWrapper>
  );
};
