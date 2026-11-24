// Shared design-document and domain types (mirror the backend element schema).

export type ElementType = "text" | "decoration" | "shape" | "image";

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height?: number;
  rotation: number;
  opacity: number;
  locked: boolean;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fill: string;
  fontWeight: string;
  fontStyle: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number;
  charSpacing: number;
  /** Binding to structured wizard data, e.g. "groom_name". */
  field?: string;
  /** Per-element locale for the multilingual engine. */
  locale?: string;
  direction?: "ltr" | "rtl";
  script?: string;
}

export interface DecorationElement extends BaseElement {
  type: "decoration";
  asset: string;
  fill: string;
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  shape: "rect" | "line";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rx?: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  /** Natural (pre-crop) pixel size of the source image. */
  naturalW?: number;
  naturalH?: number;
  /** Crop rectangle in natural pixels (Fabric cropX/cropY/width/height). */
  cropX?: number;
  cropY?: number;
  cropW?: number;
  cropH?: number;
}

export type DesignElement = TextElement | DecorationElement | ShapeElement | ImageElement;

export interface PageBackground {
  type: "color" | "image";
  color?: string;
  src?: string;
}

export interface DesignPage {
  name: string;
  width: number;
  height: number;
  background: PageBackground;
  elements: DesignElement[];
}

/** A localized content layer (language-independent content model). */
export interface LanguageLayer {
  locale: string;
  languageName: string;
  direction: "ltr" | "rtl";
  /** field key -> localized string (names/dates kept as structured data too). */
  content: Record<string, string>;
  verified?: boolean; // false when AI-translated and not yet approved
}

export interface WeddingDetails {
  groom_name?: string;
  groom_parents?: string;
  groom_native?: string;
  groom_surname?: string;
  bride_name?: string;
  bride_parents?: string;
  bride_native?: string;
  bride_surname?: string;
  wedding_date?: string;
  wedding_day?: string;
  muhurtham_time?: string;
  venue?: string;
  venue_address?: string;
  reception_date?: string;
  reception_time?: string;
  reception_venue?: string;
  maps_url?: string;
  grandparents?: string;
  invitation_message?: string;
  family_members?: string;
  contact?: string;
  rsvp?: string;
  native_place?: string;
  [key: string]: string | undefined;
}

export interface DesignDocument {
  version: number;
  templateId: string | null;
  width: number;
  height: number;
  palette: Record<string, string>;
  fonts: Record<string, string>;
  pages: DesignPage[];
  activePage: number;
  languages: LanguageLayer[];
  primaryLocale: string;
  details: WeddingDetails;
  /** Dynamic layout mode: manual (default), auto-fit, or locked. */
  layoutMode?: "manual" | "auto" | "locked";
}

export interface ProjectSummary {
  id: string;
  project_name: string;
  bride_name: string | null;
  groom_name: string | null;
  wedding_date: string | null;
  language: string;
  template_id: string | null;
  thumbnail_path: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends ProjectSummary {
  project_data: { design?: DesignDocument } & Record<string, unknown>;
}

export interface Template {
  id: string;
  template_name: string;
  category: string;
  preview_path: string | null;
  configuration: {
    width: number;
    height: number;
    palette: Record<string, string>;
    fonts: Record<string, string>;
    layout: string;
    decorations: string[];
    pages: DesignPage[];
    [k: string]: unknown;
  };
  supported_languages: string[];
}

export interface LanguageEntry {
  locale: string;
  name: string;
  native_name: string;
  direction: "ltr" | "rtl";
  script: string;
  fonts: string[];
}

export interface FontEntry {
  family: string;
  scripts: string[];
  weights: number[];
  styles: string[];
  serif: boolean;
  source: string;
  license: string;
  available: boolean;
}

export interface Wording {
  id: string;
  title: string;
  language: string;
  category: string;
  body: string;
}

export type FieldType =
  | "text" | "multiline" | "date" | "time" | "datetime" | "address"
  | "phone" | "email" | "image" | "url" | "select" | "boolean" | "list";

export interface OccasionField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  group: string;
  placeholder?: string;
  options?: string[];
}

export interface Occasion {
  id: string;
  name: string;
  category: string;
  card_types: string[];
  fields: OccasionField[];
  custom?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}
