// External Links Types

export type LinkCategory = 'tips' | 'blog' | 'resources' | 'social' | 'help' | 'other';

export interface ExternalLink {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: LinkCategory;
  icon?: string;
  is_active: boolean;
  display_order: number;
  open_in_new_tab: boolean;
  show_in_footer: boolean;
  show_in_customer_portal: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateExternalLinkRequest {
  title: string;
  description?: string;
  url: string;
  category: LinkCategory;
  icon?: string;
  display_order?: number;
  open_in_new_tab?: boolean;
  show_in_footer?: boolean;
  show_in_customer_portal?: boolean;
}

export interface UpdateExternalLinkRequest {
  title?: string;
  description?: string;
  url?: string;
  category?: LinkCategory;
  icon?: string;
  is_active?: boolean;
  display_order?: number;
  open_in_new_tab?: boolean;
  show_in_footer?: boolean;
  show_in_customer_portal?: boolean;
}
