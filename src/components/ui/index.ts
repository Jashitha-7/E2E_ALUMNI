/* ═══════════════════════════════════════════════════════════════════════════
   ALUMNI ASSOCIATION PLATFORM - UI DESIGN SYSTEM
   Component Barrel Export
   ═══════════════════════════════════════════════════════════════════════════ */

// Button Components
export {
  Button,
  IconButton,
  ButtonGroup,
  buttonVariants,
  type ButtonProps,
  type IconButtonProps,
  type ButtonGroupProps,
} from "./Button";

// Card Components
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
  FeatureCard,
  TiltCard,
  cardVariants,
  type CardProps,
  type CardHeaderProps,
  type CardFooterProps,
  type CardImageProps,
  type FeatureCardProps,
  type TiltCardProps,
} from "./Card";

// Glass Panel Components
export {
  GlassPanel,
  GlassContainer,
  GlassOverlay,
  GlassCardStack,
  GlassOrb,
  glassPanelVariants,
  type GlassPanelProps,
  type GlassContainerProps,
  type GlassOverlayProps,
  type GlassCardStackProps,
  type GlassOrbProps,
} from "./GlassPanel";

// Input Components
export {
  Input,
  PasswordInput,
  SearchInput,
  Textarea,
  Select,
  Checkbox,
  Toggle,
  inputVariants,
  type InputProps,
  type SearchInputProps,
  type TextareaProps,
  type SelectProps,
  type SelectOption,
  type CheckboxProps,
  type ToggleProps,
} from "./Input";

// Modal Components
export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  AlertDialog,
  Drawer,
  modalVariants,
  type ModalProps,
  type ModalHeaderProps,
  type AlertDialogProps,
  type DrawerProps,
} from "./Modal";

// Dropdown Components
export {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
  DropdownCheckboxItem,
  Combobox,
  Popover,
  Tooltip,
  dropdownMenuVariants,
  type DropdownProps,
  type DropdownTriggerProps,
  type DropdownMenuProps,
  type DropdownItemProps,
  type DropdownCheckboxItemProps,
  type ComboboxProps,
  type ComboboxOption,
  type PopoverProps,
  type TooltipProps,
} from "./Dropdown";

// Tabs Components
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
} from "./Tabs";

// Toast Components
export {
  ToastProvider,
  ToastViewport,
  Toast,
  toastVariants,
  useToast,
  type ToastItem,
  type ToastProviderProps,
  type ToastViewportProps,
  type ToastProps,
} from "./Toast";

// Chat Components
export {
  ChatWindow,
  ChatHeader,
  ChatMessageList,
  ChatMessageBubble,
  TypingIndicator,
  ChatComposer,
  type ChatMessage,
  type ChatWindowProps,
  type ChatHeaderProps,
  type ChatMessageListProps,
  type ChatMessageBubbleProps,
  type ChatComposerProps,
} from "./Chat";

// 3D & Motion Components
export {
  MouseParallax,
  FloatingElement,
  DepthCard,
  RotatingCard,
  ScrollReveal,
  MagneticButton,
  GlassOrb as Motion3DGlassOrb,
  ParallaxLayer,
  GlowEffect,
  type MouseParallaxProps,
  type FloatingElementProps,
  type DepthCardProps,
  type RotatingCardProps,
  type ScrollRevealProps,
  type MagneticButtonProps,
  type GlassOrbProps as Motion3DGlassOrbProps,
  type ParallaxLayerProps,
  type GlowEffectProps,
} from "./Motion3D";

// Layout Components
export {
  PageLayout,
  Container,
  Section,
  Grid,
  Stack,
  Inline,
  Center,
  Spacer,
  Divider,
  AspectRatio,
  HeroSection,
  SidebarLayout,
  type PageLayoutProps,
  type ContainerProps,
  type SectionProps,
  type GridProps,
  type StackProps,
  type InlineProps,
  type SpacerProps,
  type DividerProps,
  type AspectRatioProps,
  type HeroSectionProps,
  type SidebarLayoutProps,
} from "./Layout";

// Badge & Avatar Components
export {
  Badge,
  badgeVariants,
  Avatar,
  AvatarGroup,
  avatarVariants,
  Spinner,
  Skeleton,
  Progress,
  type BadgeProps,
  type AvatarProps,
  type AvatarGroupProps,
  type SpinnerProps,
  type SkeletonProps,
  type ProgressProps,
} from "./Badge";

// Animation Components & Utilities
export {
  // Easings & durations
  easings,
  durations,
  springs,
  // Animation variants
  fadeVariants,
  fadeUpVariants,
  fadeDownVariants,
  scaleVariants,
  slideInLeftVariants,
  slideInRightVariants,
  popVariants,
  staggerContainerVariants,
  staggerItemVariants,
  // Animated components
  FadeIn,
  FadeInUp,
  ScaleIn,
  SlideIn,
  Stagger,
  StaggerItem,
  Hover3D,
  Parallax,
  AnimatedText,
  CountUp,
  ProgressiveBlur,
  // Hooks
  useAnimateInView,
  useScrollProgress,
  type FadeInProps,
  type FadeInUpProps,
  type ScaleInProps,
  type SlideInProps,
  type StaggerProps,
  type StaggerItemProps,
  type Hover3DProps,
  type ParallaxProps,
  type AnimatedTextProps,
  type CountUpProps,
  type ProgressiveBlurProps,
} from "./Animations";
