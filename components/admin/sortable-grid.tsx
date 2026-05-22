"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SnippetCard, type SnippetCardData } from "@/components/snippet-card";
import { GripVertical } from "lucide-react";
import { updatePostsOrderAction } from "@/app/admin/actions";

function SortableItem({ data, isAdmin }: { data: SnippetCardData; isAdmin: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: data.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative flex h-full ${isDragging ? "opacity-50" : ""}`}>
      {isAdmin && (
        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-50 p-2 cursor-grab active:cursor-grabbing bg-black/50 rounded-full text-white hover:bg-indigo-600 transition"
          {...attributes}
          {...listeners}
          title="اسحب لترتيب المقال"
        >
          <GripVertical className="w-5 h-5" />
        </div>
      )}
      <SnippetCard data={data} isAdmin={isAdmin} />
    </div>
  );
}

export function SortableGrid({ items, isAdmin }: { items: SnippetCardData[]; isAdmin?: boolean }) {
  const [activeItems, setActiveItems] = useState(items);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setActiveItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeItems.findIndex((item) => item.id === active.id);
      const newIndex = activeItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(activeItems, oldIndex, newIndex);
      setActiveItems(newItems);

      startTransition(async () => {
        try {
          const ids = newItems.map(i => i.id);
          await updatePostsOrderAction(ids);
        } catch (err) {
          console.error(err);
          alert("فشل تحديث الترتيب");
          setActiveItems(items); // revert
        }
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {items.map((s) => (
          <div key={s.id} className="flex">
            <SnippetCard data={s} isAdmin={false} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute -top-6 left-0 text-xs font-bold text-indigo-400 animate-pulse">
          جاري الحفظ...
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={activeItems.map(i => i.id)} strategy={rectSortingStrategy}>
          <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 w-full">
            {activeItems.map((item) => (
              <SortableItem key={item.id} data={item} isAdmin={isAdmin} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
