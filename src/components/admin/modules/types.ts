export type ModulePanelProps = {
  panelId?: string;
  step?: number;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hide insert/save library buttons (e.g. when editing a library item). */
  hideLibraryActions?: boolean;
};
