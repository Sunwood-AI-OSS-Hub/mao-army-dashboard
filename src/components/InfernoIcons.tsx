// Inferno Icons - Lucide React icons wrapper for consistent styling
import * as React from 'react';
import {
  LayoutDashboard as LucideLayoutDashboard,
  Users as LucideUsers,
  ClipboardList as LucideClipboardList,
  MessageSquare as LucideMessageSquare,
  Settings as LucideSettings,
  PlusCircle as LucidePlusCircle,
  Swords as LucideSwords,
  Flag as LucideFlag,
  Flame as LucideFlame,
  Wand2 as LucideWand2,
  Eye as LucideEye,
  ScrollText as LucideScrollText,
  UserPlus as LucideUserPlus,
  CheckCircle2 as LucideCheckCircle2,
  Zap as LucideZap,
  MessageCircle as LucideMessageCircle,
} from 'lucide-react';

// Dashboard
export const Dashboard: React.FC<{ className?: string }> = (props) => (
  <LucideLayoutDashboard {...props} />
);

// Group/Teams
export const Group: React.FC<{ className?: string }> = (props) => (
  <LucideUsers {...props} />
);

// Assignment
export const Assignment: React.FC<{ className?: string }> = (props) => (
  <LucideClipboardList {...props} />
);

// ChatBubble
export const ChatBubble: React.FC<{ className?: string }> = (props) => (
  <LucideMessageSquare {...props} />
);

// Settings
export const Settings: React.FC<{ className?: string }> = (props) => (
  <LucideSettings {...props} />
);

// AddCircle
export const AddCircle: React.FC<{ className?: string }> = (props) => (
  <LucidePlusCircle {...props} />
);

// Swords
export const Swords: React.FC<{ className?: string }> = (props) => (
  <LucideSwords {...props} />
);

// Flag
export const Flag: React.FC<{ className?: string }> = (props) => (
  <LucideFlag {...props} />
);

// Fireplace (use Flame instead)
export const Fireplace: React.FC<{ className?: string }> = (props) => (
  <LucideFlame {...props} />
);

// AutoFixHigh (use Wand2 instead)
export const AutoFixHigh: React.FC<{ className?: string }> = (props) => (
  <LucideWand2 {...props} />
);

// Visibility
export const Visibility: React.FC<{ className?: string }> = (props) => (
  <LucideEye {...props} />
);

// History
export const History: React.FC<{ className?: string }> = (props) => (
  <LucideScrollText {...props} />
);

// PersonAdd
export const PersonAdd: React.FC<{ className?: string }> = (props) => (
  <LucideUserPlus {...props} />
);

// AssignmentTurnedIn (use CheckCircle2 instead)
export const AssignmentTurnedIn: React.FC<{ className?: string }> = (props) => (
  <LucideCheckCircle2 {...props} />
);

// Bolt
export const Bolt: React.FC<{ className?: string }> = (props) => (
  <LucideZap {...props} />
);

// Chat
export const Chat: React.FC<{ className?: string }> = (props) => (
  <LucideMessageCircle {...props} />
);
