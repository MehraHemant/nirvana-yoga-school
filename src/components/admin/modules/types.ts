export type ModulePanelProps = {
  panelId?: string;
  step?: number;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
