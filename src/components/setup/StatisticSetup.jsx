import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BarChart3,
  CheckCircle2,
  Check,
  Edit2,
  GripVertical,
  Info,
  Layers,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import Modal from "../Modal";
import SetupTabHeader, {
  SetupPrimaryButton,
  SetupSecondaryButton,
} from "./SetupTabHeader";
import { ToggleSwitch } from "./SetupSettingsUI";
import { useAuth } from "../../hooks/useAuth";
import { usePointTypes } from "../../hooks/usePointTypes";
import { matchAPI } from "../../services/api";

const AUTO_APPEARANCES_LABEL = "__auto_calculate_appearances__";

const EMPTY_FORM = {
  label: "",
  category: "Points",
  sequence: 1,
  isCumulativeToPlayer: true,
  isLowestMostImportant: false,
  isCumulativeToTeam: true,
  isCheckbox: false,
  isHidden: false,
  isArchived: false,
};

function resolveUserId(user) {
  return user?.userId || user?._id || user?.id || null;
}

function isSettingPointType(item) {
  return String(item?.label || "").trim() === AUTO_APPEARANCES_LABEL;
}

function sortPointTypes(items) {
  return [...items].sort(
    (a, b) => (Number(a.sequence) || 1) - (Number(b.sequence) || 1)
  );
}

function buildPointTypeUpdatePayload(userId, item, sequence) {
  return {
    pointId: item.id,
    userId,
    label: item.label,
    category: item.category,
    sequence,
    isCumulativeToPlayer: item.isCumulativeToPlayer ?? true,
    isLowestMostImportant: item.isLowestMostImportant ?? false,
    isCumulativeToTeam: item.isCumulativeToTeam ?? true,
    isCheckbox: item.isCheckbox ?? false,
    isHidden: item.isHidden ?? false,
    isArchived: item.isArchived ?? false,
  };
}

function toBulkPointTypePayload(item, sequence) {
  return {
    label: item.label,
    category: item.category || null,
    sequence,
    isCumulativeToPlayer: item.isCumulativeToPlayer ?? true,
    isLowestMostImportant: item.isLowestMostImportant ?? false,
    isCumulativeToTeam: item.isCumulativeToTeam ?? true,
    isCheckbox: item.isCheckbox ?? false,
    isHidden: item.isHidden ?? false,
    isArchived: item.isArchived ?? false,
  };
}

function YesNoCell({ value }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
      <CheckCircle2 className="h-4 w-4" />
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-500">
      <XCircle className="h-4 w-4 text-red-500" />
      No
    </span>
  );
}

function SectionCard({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm",
        className
      )}
    >
      {(title || subtitle) && (
        <div className="border-b border-gray-100 bg-slate-50/80 px-5 py-4 sm:px-6">
          {title && (
            <h3 className="text-base font-bold text-[#003366]">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      )}
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function PredefinedStatTypesPanel({
  predefinedLoading,
  availablePredefined,
  selectedPredefined,
  onToggle,
  onSelectAll,
  onClearSelection,
  onAdd,
  addingPredefined,
  onCreateCustom,
}) {
  const allSelected =
    availablePredefined.length > 0 &&
    selectedPredefined.length === availablePredefined.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-[#003366]/5 to-[#00ADE5]/5 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#003366] text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#003366]">
                Predefined stat types
              </h3>
              <p className="mt-0.5 text-sm text-gray-500">
                Quick-add common statistics for your league in one step.
              </p>
            </div>
          </div>
          {!predefinedLoading && availablePredefined.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[#00ADE5]/10 px-3 py-1 text-xs font-semibold text-[#0088cc]">
                {selectedPredefined.length} selected
              </span>
              <button
                type="button"
                onClick={allSelected ? onClearSelection : onSelectAll}
                className="rounded-lg border border-[#003366]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#003366] transition hover:border-[#00ADE5] hover:text-[#00ADE5]"
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
            </div>
          )}
        </div>
      </div>

      {predefinedLoading ? (
        <div className="flex items-center justify-center gap-2 px-5 py-12 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#00ADE5]" />
          Loading predefined stat types…
        </div>
      ) : availablePredefined.length === 0 ? (
        <div className="px-5 py-12 text-center sm:px-6">
          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
          <p className="font-medium text-gray-700">
            All predefined stat types are already added
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Use the button below to create a custom stat type.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/90">
                <th className="w-12 px-4 py-3 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Stat name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {availablePredefined.map((item) => {
                const isSelected = selectedPredefined.includes(item.label);
                return (
                  <tr
                    key={item.label}
                    onClick={() => onToggle(item.label)}
                    className={clsx(
                      "cursor-pointer transition-colors",
                      isSelected
                        ? "bg-[#00ADE5]/8 hover:bg-[#00ADE5]/12"
                        : "hover:bg-slate-50/80"
                    )}
                  >
                    <td className="px-4 py-3 text-center">
                      <span
                        className={clsx(
                          "inline-flex h-5 w-5 items-center justify-center rounded-md border-2 transition",
                          isSelected
                            ? "border-[#00ADE5] bg-[#00ADE5] text-white"
                            : "border-gray-300 bg-white"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#003366]/8 text-xs font-bold text-[#003366]">
                          {(item.label || "?").charAt(0).toUpperCase()}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {item.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {item.category || "General"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                        <Layers className="h-3.5 w-3.5 text-[#00ADE5]" />
                        {item.isCheckbox ? "Checkbox" : "Record"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-gray-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-gray-500">
          {availablePredefined.length > 0
            ? `${availablePredefined.length} template${availablePredefined.length === 1 ? "" : "s"} available to add`
            : "Need something unique for your league?"}
        </p>
        <div className="flex flex-wrap gap-3">
          <SetupPrimaryButton
            onClick={onAdd}
            disabled={addingPredefined || !selectedPredefined.length}
            icon={Plus}
          >
            {addingPredefined
              ? "Adding…"
              : selectedPredefined.length
                ? `Add selected (${selectedPredefined.length})`
                : "Add selected"}
          </SetupPrimaryButton>
          <SetupSecondaryButton onClick={onCreateCustom} icon={Sparkles}>
            Create your own stat type
          </SetupSecondaryButton>
        </div>
      </div>
    </div>
  );
}

function StatTypeRowContent({
  item,
  index,
  dragHandleProps,
  reordering,
  onEdit,
  onRemove,
  selected = false,
  onToggleSelect,
  showSelect = false,
}) {
  return (
    <>
      {showSelect && (
        <td className="w-12 px-4 py-4 text-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect?.(item.id)}
            disabled={reordering}
            className="h-4 w-4 rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5] disabled:opacity-50"
            aria-label={`Select ${item.label}`}
          />
        </td>
      )}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...dragHandleProps}
            disabled={reordering}
            className={clsx(
              "inline-flex h-8 w-8 touch-none items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition",
              reordering
                ? "cursor-not-allowed opacity-50"
                : "cursor-grab hover:border-[#00ADE5]/40 hover:bg-[#00ADE5]/5 hover:text-[#00ADE5] active:cursor-grabbing"
            )}
            aria-label={`Drag to reorder ${item.label}`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md bg-[#003366]/8 px-2 text-xs font-bold text-[#003366]">
            {item.sequence ?? index + 1}
          </span>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#003366]/5 text-xs font-bold text-[#003366]">
            {(item.label || "?").charAt(0).toUpperCase()}
          </span>
          <span className="font-semibold text-gray-900">{item.label}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <YesNoCell value={item.isHidden} />
      </td>
      <td className="px-5 py-4">
        <YesNoCell value={item.isArchived} />
      </td>
      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            disabled={reordering}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#00ADE5] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0099c7] disabled:opacity-50"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onRemove(item)}
            disabled={reordering}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </td>
    </>
  );
}

function SortableStatTypeRow({
  item,
  index,
  reordering,
  onEdit,
  onRemove,
  selected,
  onToggleSelect,
  showSelect,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: reordering,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={clsx(
        "bg-white transition-shadow",
        isDragging && "relative z-10 opacity-40",
        !isDragging && "hover:bg-slate-50/80"
      )}
    >
      <StatTypeRowContent
        item={item}
        index={index}
        reordering={reordering}
        onEdit={onEdit}
        onRemove={onRemove}
        dragHandleProps={{ ...attributes, ...listeners }}
        selected={selected}
        onToggleSelect={onToggleSelect}
        showSelect={showSelect}
      />
    </tr>
  );
}

function PointTypeFormModal({
  isOpen,
  onClose,
  onSubmit,
  saving,
  initial,
  nextSequence,
  categoryOptions,
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, sequence: nextSequence });

  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setForm({
        label: initial.label || "",
        category: initial.category || "Points",
        sequence: initial.sequence ?? nextSequence,
        isCumulativeToPlayer: initial.isCumulativeToPlayer ?? true,
        isLowestMostImportant: initial.isLowestMostImportant ?? false,
        isCumulativeToTeam: initial.isCumulativeToTeam ?? true,
        isCheckbox: initial.isCheckbox ?? false,
        isHidden: initial.isHidden ?? false,
        isArchived: initial.isArchived ?? false,
      });
    } else {
      setForm({ ...EMPTY_FORM, sequence: nextSequence });
    }
  }, [isOpen, initial, nextSequence]);

  const setField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  const isEdit = Boolean(initial?.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      panelClassName="flex max-w-xl flex-col"
      innerScroll
      labelledBy="point-type-modal-title"
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-4 text-white sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="point-type-modal-title" className="text-lg font-bold sm:text-xl">
                {isEdit ? "Edit stat type" : "Create your own stat type"}
              </h2>
              <p className="mt-0.5 text-sm text-blue-100/90">
                Configure how this statistic is recorded and displayed.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                required
                value={form.label}
                onChange={(e) => setField("label", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm shadow-sm focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20"
                placeholder="e.g. 2PT FG"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </span>
              <input
                type="text"
                list="stat-category-options"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm shadow-sm focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20"
                placeholder="Points"
              />
              <datalist id="stat-category-options">
                {categoryOptions.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Sequence
              </span>
              <input
                type="number"
                min={0}
                value={form.sequence}
                onChange={(e) =>
                  setField("sequence", Number(e.target.value) || 1)
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm shadow-sm focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20"
              />
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["isCumulativeToPlayer", "Cumulative to player"],
              ["isCumulativeToTeam", "Cumulative to team"],
              ["isLowestMostImportant", "Lowest is most important"],
              ["isCheckbox", "Checkbox stat"],
              ["isHidden", "Hidden"],
              ["isArchived", "Archived"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-slate-50/50 px-3 py-2.5 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setField(key, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4 sm:px-6">
          <SetupSecondaryButton onClick={onClose} disabled={saving}>
            Cancel
          </SetupSecondaryButton>
          <SetupPrimaryButton type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create stat type"}
          </SetupPrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

function IndividualStatTypesTab({
  userId,
  pointTypes,
  predefinedTypes,
  loading,
  predefinedLoading,
  onRefresh,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [addingPredefined, setAddingPredefined] = useState(false);
  const [selectedPredefined, setSelectedPredefined] = useState([]);
  const [savingAppearances, setSavingAppearances] = useState(false);
  const [orderedTypes, setOrderedTypes] = useState([]);
  const [activeDragId, setActiveDragId] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortableIds = useMemo(
    () => orderedTypes.map((item) => item.id),
    [orderedTypes]
  );

  const activeDragItem = useMemo(
    () => orderedTypes.find((item) => item.id === activeDragId) || null,
    [orderedTypes, activeDragId]
  );

  const activeTypes = useMemo(
    () =>
      sortPointTypes(
        pointTypes.filter((item) => !item.isArchived && !isSettingPointType(item))
      ),
    [pointTypes]
  );

  useEffect(() => {
    setOrderedTypes(activeTypes);
    setSelectedIds([]);
  }, [activeTypes]);

  const allSelected =
    orderedTypes.length > 0 && selectedIds.length === orderedTypes.length;

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : orderedTypes.map((item) => item.id));
  };

  const showDeleteResult = (deleteResult) => {
    const deleted = Number(deleteResult.totalDeleted) || 0;
    const skipped = Number(deleteResult.totalSkipped) || 0;

    if (deleted === 0) {
      const reason =
        deleteResult.skipped?.[0]?.reason || "Could not delete selected stat types.";
      throw new Error(reason);
    }

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: skipped > 0 ? "info" : "success",
      title: `${deleted} stat type${deleted === 1 ? "" : "s"} deleted`,
      text:
        skipped > 0
          ? `${skipped} skipped (linked to match scores or not found).`
          : undefined,
      timer: 2400,
      showConfirmButton: false,
    });
  };

  const appearancesSetting = useMemo(
    () => pointTypes.find(isSettingPointType),
    [pointTypes]
  );

  const autoAppearances = Boolean(
    appearancesSetting && !appearancesSetting.isArchived
  );

  const existingLabels = useMemo(
    () => new Set(activeTypes.map((item) => item.label.trim().toLowerCase())),
    [activeTypes]
  );

  const availablePredefined = useMemo(
    () =>
      predefinedTypes.filter(
        (item) => !existingLabels.has(item.label.trim().toLowerCase())
      ),
    [predefinedTypes, existingLabels]
  );

  const categoryOptions = useMemo(() => {
    const fromApi = activeTypes
      .map((item) => item.category)
      .filter(Boolean);
    const fromPredefined = predefinedTypes
      .map((item) => item.category)
      .filter(Boolean);
    return [...new Set([...fromApi, ...fromPredefined, "Points"])];
  }, [activeTypes, predefinedTypes]);

  const nextSequence = useMemo(() => {
    if (!activeTypes.length) return 1;
    return (
      Math.max(...activeTypes.map((item) => Number(item.sequence) || 1)) + 1
    );
  }, [activeTypes]);

  const openCreateModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingItem(null);
  };

  const savePointType = async (form) => {
    if (!userId) return;
    setSaving(true);
    try {
      if (editingItem?.id) {
        await matchAPI.createPointType({
          pointId: editingItem.id,
          userId,
          label: form.label.trim(),
          category: form.category.trim() || null,
          sequence: Number(form.sequence) || 1,
          isCumulativeToPlayer: form.isCumulativeToPlayer,
          isLowestMostImportant: form.isLowestMostImportant,
          isCumulativeToTeam: form.isCumulativeToTeam,
          isCheckbox: form.isCheckbox,
          isHidden: form.isHidden,
          isArchived: form.isArchived,
        });
      } else {
        await matchAPI.createPointTypesBulk({
          userId,
          pointTypes: [
            toBulkPointTypePayload(
              {
                label: form.label.trim(),
                category: form.category.trim() || null,
                isCumulativeToPlayer: form.isCumulativeToPlayer,
                isLowestMostImportant: form.isLowestMostImportant,
                isCumulativeToTeam: form.isCumulativeToTeam,
                isCheckbox: form.isCheckbox,
                isHidden: form.isHidden,
                isArchived: form.isArchived,
              },
              Number(form.sequence) || nextSequence
            ),
          ],
        });
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: editingItem ? "Stat type updated" : "Stat type created",
        timer: 1800,
        showConfirmButton: false,
      });

      closeModal();
      await onRefresh();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: error.message || "Could not save stat type.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (item) => {
    const result = await Swal.fire({
      title: "Delete stat type?",
      text: `"${item.label}" will be permanently deleted. This cannot be undone if match scores are not linked.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed || !userId) return;

    try {
      const response = await matchAPI.deletePointTypes({
        userId,
        pointIds: [item.id],
      });
      showDeleteResult(response?.data || {});
      await onRefresh();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: error.message || "Could not delete stat type.",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!userId || !selectedIds.length) return;

    const result = await Swal.fire({
      title: `Delete ${selectedIds.length} stat type${selectedIds.length === 1 ? "" : "s"}?`,
      text: "Selected stat types will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete selected",
    });

    if (!result.isConfirmed) return;

    setBulkDeleting(true);
    try {
      const response = await matchAPI.deletePointTypes({
        userId,
        pointIds: selectedIds,
      });
      showDeleteResult(response?.data || {});
      setSelectedIds([]);
      await onRefresh();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Bulk delete failed",
        text: error.message || "Could not delete selected stat types.",
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSaveAppearances = async (enabled) => {
    if (!userId) return;
    setSavingAppearances(true);
    try {
      if (appearancesSetting?.id) {
        await matchAPI.createPointType({
          pointId: appearancesSetting.id,
          userId,
          label: AUTO_APPEARANCES_LABEL,
          category: "Settings",
          sequence: 0,
          isCumulativeToPlayer: false,
          isLowestMostImportant: false,
          isCumulativeToTeam: false,
          isCheckbox: true,
          isHidden: true,
          isArchived: !enabled,
        });
      } else if (enabled) {
        await matchAPI.createPointType({
          userId,
          label: AUTO_APPEARANCES_LABEL,
          category: "Settings",
          sequence: 0,
          isCumulativeToPlayer: false,
          isLowestMostImportant: false,
          isCumulativeToTeam: false,
          isCheckbox: true,
          isHidden: true,
          isArchived: false,
        });
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Appearances setting saved",
        timer: 1800,
        showConfirmButton: false,
      });
      await onRefresh();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: error.message || "Could not save appearances setting.",
      });
    } finally {
      setSavingAppearances(false);
    }
  };

  const togglePredefined = (label) => {
    setSelectedPredefined((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const selectAllPredefined = () => {
    setSelectedPredefined(availablePredefined.map((item) => item.label));
  };

  const clearPredefinedSelection = () => {
    setSelectedPredefined([]);
  };

  const handleAddPredefined = async () => {
    if (!userId || !selectedPredefined.length) return;

    setAddingPredefined(true);
    try {
      const pointTypes = selectedPredefined
        .map((label, index) => {
          const preset = predefinedTypes.find((item) => item.label === label);
          if (!preset) return null;
          return toBulkPointTypePayload(preset, nextSequence + index);
        })
        .filter(Boolean);

      const response = await matchAPI.createPointTypesBulk({ userId, pointTypes });
      const result = response?.data || {};
      const created = Number(result.totalCreated) || 0;
      const skipped = Number(result.totalSkipped) || 0;

      setSelectedPredefined([]);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: created > 0 ? "success" : "info",
        title:
          created > 0
            ? `${created} stat type${created === 1 ? "" : "s"} added`
            : "No new stat types added",
        text:
          skipped > 0
            ? `${skipped} skipped (already exist or duplicate).`
            : undefined,
        timer: 2200,
        showConfirmButton: false,
      });
      await onRefresh();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Add failed",
        text: error.message || "Could not add predefined stat types.",
      });
    } finally {
      setAddingPredefined(false);
    }
  };

  const persistSequenceOrder = async (items) => {
    const originalSequence = new Map(
      activeTypes.map((item) => [item.id, Number(item.sequence) || 1])
    );

    const changed = items
      .map((item, index) => ({ item, sequence: index + 1 }))
      .filter(({ item, sequence }) => originalSequence.get(item.id) !== sequence);

    if (!changed.length) return;

    await Promise.all(
      changed.map(({ item, sequence }) =>
        matchAPI.createPointType(buildPointTypeUpdatePayload(userId, item, sequence))
      )
    );
  };

  const handleSortEnd = async (event) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id || reordering || !userId) return;

    const oldIndex = orderedTypes.findIndex((item) => item.id === active.id);
    const newIndex = orderedTypes.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

    const previousOrder = orderedTypes;
    const moved = arrayMove(orderedTypes, oldIndex, newIndex);
    const newOrder = moved.map((item, index) => ({
      ...item,
      sequence: index + 1,
    }));

    setOrderedTypes(newOrder);
    setReordering(true);

    try {
      await persistSequenceOrder(newOrder);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Order updated",
        timer: 1500,
        showConfirmButton: false,
      });
      await onRefresh();
    } catch (error) {
      setOrderedTypes(previousOrder);
      Swal.fire({
        icon: "error",
        title: "Reorder failed",
        text: error.message || "Could not save the new order.",
      });
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#00ADE5]/20 bg-gradient-to-r from-[#00ADE5]/8 to-[#003366]/5 p-4 sm:p-5">
        <div className="flex gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00ADE5]/15 text-[#00ADE5]">
            <Info className="h-5 w-5" />
          </span>
          <div className="space-y-2 text-sm text-gray-700">
            <p className="font-semibold text-[#003366]">
              How to enter player statistics
            </p>
            <ol className="list-decimal space-y-1 pl-4">
              <li>Set up the stat types you want to record below.</li>
              <li>Enter players into teams via Setup → Teams.</li>
              <li>Enter statistics when reporting match results.</li>
              <li>Approve results so stats appear on public pages.</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 bg-slate-50/80 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs font-medium text-gray-500">
            Drag rows by the handle to change display order
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <>
                <span className="inline-flex items-center rounded-full bg-[#00ADE5]/10 px-3 py-1 text-xs font-semibold text-[#0088cc]">
                  {selectedIds.length} selected
                </span>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting || reordering}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {bulkDeleting ? "Deleting…" : `Delete selected (${selectedIds.length})`}
                </button>
              </>
            )}
            {reordering && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00ADE5]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving order…
              </span>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#003366] to-[#004080] text-white">
                <th className="w-12 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    disabled={reordering || bulkDeleting || !orderedTypes.length}
                    className="h-4 w-4 rounded border-white/40 bg-white/10 text-[#00ADE5] focus:ring-[#00ADE5] disabled:opacity-50"
                    aria-label="Select all stat types"
                  />
                </th>
                <th className="w-28 px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Order
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Hidden
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Archive
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                    <Loader2 className="mx-auto mb-2 h-7 w-7 animate-spin text-[#00ADE5]" />
                    Loading stat types…
                  </td>
                </tr>
              ) : orderedTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <BarChart3 className="mx-auto mb-2 h-8 w-8 text-[#00ADE5]/60" />
                    <p className="font-medium text-gray-700">No stat types yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Add predefined types or create your own below.
                    </p>
                  </td>
                </tr>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={(event) => setActiveDragId(event.active.id)}
                  onDragCancel={() => setActiveDragId(null)}
                  onDragEnd={handleSortEnd}
                >
                  <SortableContext
                    items={sortableIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {orderedTypes.map((item, index) => (
                      <SortableStatTypeRow
                        key={item.id}
                        item={item}
                        index={index}
                        reordering={reordering || bulkDeleting}
                        onEdit={openEditModal}
                        onRemove={handleRemove}
                        selected={selectedIds.includes(item.id)}
                        onToggleSelect={toggleSelect}
                        showSelect
                      />
                    ))}
                  </SortableContext>
                  <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
                    {activeDragItem ? (
                      <table className="min-w-full overflow-hidden rounded-xl border border-[#00ADE5]/30 bg-white text-sm shadow-xl ring-2 ring-[#00ADE5]/20">
                        <tbody>
                          <tr>
                            <StatTypeRowContent
                              item={activeDragItem}
                              index={orderedTypes.findIndex(
                                (row) => row.id === activeDragItem.id
                              )}
                              reordering={false}
                              onEdit={() => {}}
                              onRemove={() => {}}
                              dragHandleProps={{}}
                              showSelect={false}
                            />
                          </tr>
                        </tbody>
                      </table>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SectionCard title="Player statistic options">
        <div className="rounded-xl border border-gray-100 bg-slate-50/80 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#003366]">Appearances</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                If any statistic is entered for a player in a match, the system
                will automatically add 1 appearance for that player.
              </p>
            </div>
            <ToggleSwitch
              checked={autoAppearances}
              onChange={(value) => handleSaveAppearances(value)}
              disabled={savingAppearances}
            />
          </div>
          {savingAppearances && (
            <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#00ADE5]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </p>
          )}
        </div>
      </SectionCard>

      <PredefinedStatTypesPanel
        predefinedLoading={predefinedLoading}
        availablePredefined={availablePredefined}
        selectedPredefined={selectedPredefined}
        onToggle={togglePredefined}
        onSelectAll={selectAllPredefined}
        onClearSelection={clearPredefinedSelection}
        onAdd={handleAddPredefined}
        addingPredefined={addingPredefined}
        onCreateCustom={openCreateModal}
      />

      <PointTypeFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={savePointType}
        saving={saving}
        initial={editingItem}
        nextSequence={nextSequence}
        categoryOptions={categoryOptions}
      />
    </div>
  );
}

export default function StatisticSetup() {
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const {
    pointTypes,
    predefinedTypes,
    loading,
    predefinedLoading,
    refresh,
    waitingForCompany,
  } = usePointTypes(userId);

  const activeCount = useMemo(
    () =>
      pointTypes.filter(
        (item) => !item.isArchived && !isSettingPointType(item)
      ).length,
    [pointTypes]
  );

  return (
    <div className="space-y-6">
      <SetupTabHeader
        title="Statistic setup"
        description="Configure individual stat types for your league — add, reorder, edit, or delete player statistics."
        stats={[
          { label: "Active stat types", value: activeCount },
          {
            label: "Predefined available",
            value: predefinedLoading
              ? "…"
              : Math.max(
                  0,
                  predefinedTypes.length -
                    pointTypes.filter(
                      (item) =>
                        !item.isArchived &&
                        !isSettingPointType(item) &&
                        predefinedTypes.some(
                          (preset) =>
                            preset.label.toLowerCase() ===
                            item.label.toLowerCase()
                        )
                    ).length
                ),
          },
        ]}
      />

      {waitingForCompany ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
          <div className="rounded-2xl border border-dashed border-[#003366]/15 bg-slate-50 p-10 text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#00ADE5]" />
            <p className="font-semibold text-[#003366]">
              Select a company to manage statistic setup
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Use the company selector in the top bar, then stat types will load
              for that league.
            </p>
          </div>
        </div>
      ) : (
        <IndividualStatTypesTab
          userId={userId}
          pointTypes={pointTypes}
          predefinedTypes={predefinedTypes}
          loading={loading}
          predefinedLoading={predefinedLoading}
          onRefresh={refresh}
        />
      )}
    </div>
  );
}
