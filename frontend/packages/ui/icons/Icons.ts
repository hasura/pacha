import { MRT_Icons } from 'mantine-react-table';
import { BiGitCompare, BiLogoPostgresql, BiRefresh } from 'react-icons/bi';
import { BsSortDown, BsSortUp } from 'react-icons/bs';
import { CgReadme } from 'react-icons/cg';
import { CiCloudOff, CiCloudOn } from 'react-icons/ci';
import {
  FaAngleDown,
  FaAngleLeft,
  FaAngleRight,
  FaArrowDown,
  FaArrowUp,
  FaCopy,
  FaDownload,
  FaFileAlt,
  FaFilter,
  FaLink,
  FaRegBuilding,
  FaTerminal,
} from 'react-icons/fa';
import { FiTable } from 'react-icons/fi';
import { HiOutlineArrowRight, HiOutlineSupport } from 'react-icons/hi';
import { HiOutlineArchiveBox } from 'react-icons/hi2';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { IoEaselOutline } from 'react-icons/io5';
import { LiaUserCheckSolid, LiaUserClockSolid } from 'react-icons/lia';
import { LuBuilding2, LuServer } from 'react-icons/lu';
import { MdOutlinePublic } from 'react-icons/md';
import {
  PiAlignCenterVertical,
  PiArrowClockwise,
  PiArrowCounterClockwise,
  PiArrowLeft,
  PiArrowRight,
  PiArrowsDownUp,
  PiArrowsInLineVertical,
  PiArrowsLeftRight,
  PiArrowsOutLineVertical,
  PiArrowUp,
  PiArrowUpBold,
  PiArrowUpRight,
  PiAt,
  PiBell,
  PiBinoculars,
  PiBracketsCurly,
  PiBroadcast,
  PiCalendar,
  PiCalendarBlank,
  PiCaretDoubleDown,
  PiCaretDoubleLeft,
  PiCaretDoubleRight,
  PiCaretDoubleUp,
  PiCaretDown,
  PiCaretLeft,
  PiCaretRight,
  PiCaretUp,
  PiCaretUpDown,
  PiChartBar,
  PiChartDonut,
  PiChartLine,
  PiChatCircle,
  PiChatCircleBold,
  PiCheck,
  PiCheckCircle,
  PiCheckCircleFill,
  PiChecks,
  PiCircle,
  PiClock,
  PiClockCounterClockwise,
  PiCloud,
  PiCloudLightning,
  PiCodeBlock,
  PiCodeSimple,
  PiCompass,
  PiCompassFill,
  PiCopy,
  PiCornersIn,
  PiCornersOut,
  PiCreditCard,
  PiCube,
  PiDatabase,
  PiDatabaseFill,
  PiDoor,
  PiDotsThreeDuotone,
  PiDotsThreeOutline,
  PiDotsThreeOutlineVertical,
  PiDotsThreeVertical,
  PiDownloadSimple,
  PiEnvelope,
  PiEye,
  PiEyeSlash,
  PiFloppyDisk,
  PiFunnel,
  PiFunnelFill,
  PiFunnelSimple,
  PiGear,
  PiGearFill,
  PiGitBranch,
  PiGlobeHemisphereWest,
  PiGlobeSimple,
  PiGraph,
  PiHand,
  PiInfo,
  PiKey,
  PiLightning,
  PiLink,
  PiList,
  PiListMagnifyingGlass,
  PiLock,
  PiLockSimple,
  PiMagnifyingGlass,
  PiMagnifyingGlassMinus,
  PiMapTrifold,
  PiMapTrifoldFill,
  PiMonitor,
  PiMoon,
  PiPaperPlane,
  PiPencil,
  PiPencilSimple,
  PiPencilSlash,
  PiPlay,
  PiPlayFill,
  PiPlugsConnected,
  PiPlus,
  PiPolygon,
  PiPolygonFill,
  PiProhibit,
  PiPushPin,
  PiPushPinSlash,
  PiQuestion,
  PiReceipt,
  PiRecycle,
  PiRocketLaunch,
  PiShare,
  PiShareNetwork,
  PiShareNetworkFill,
  PiShieldCheck,
  PiSidebarSimpleDuotone,
  PiSignOutBold,
  PiSkipBack,
  PiSkipForward,
  PiSliders,
  PiSlidersHorizontal,
  PiStack,
  PiStar,
  PiStorefront,
  PiSun,
  PiTable,
  PiTerminal,
  PiTextColumns,
  PiTextIndent,
  PiThumbsDown,
  PiThumbsUp,
  PiTrash,
  PiTrendDown,
  PiTrendUp,
  PiUser,
  PiUserCircle,
  PiUsers,
  PiWallet,
  PiWarning,
  PiWarningCircleFill,
  PiX,
  PiXCircle,
} from 'react-icons/pi';
import { SiGraphql, SiHasura } from 'react-icons/si';
import { TbCircleDotted, TbNotes } from 'react-icons/tb';
import { VscDebugAlt, VscPinned } from 'react-icons/vsc';

export const CoreIcons = {
  Metadata: PiCodeSimple,
  Environment: PiProhibit,
  Project: PiCube,
  Build: PiGitBranch,
  Hasura: SiHasura,
  GraphQL: SiGraphql,
  ConnectorHub: PiStorefront,
  Billing: PiWallet,
  Usage: PiChartDonut,
  LocalDev: PiMonitor,
  Analytics: PiChartBar,
};

export const MetadataIcons = {
  Supergraph: PiGlobeSimple,
  Subgraph: PiGraph,
  DataSource: PiDatabase,
  Model: PiTable,
  CommandQuery: PiMagnifyingGlass,
  CommandMutation: PiLightning,
  SubgraphBuild: BiRefresh,
};

export const ProjectRoles = {
  ProjectOwner: PiStar,
  ProjectAdmin: PiKey,
  ProjectUser: PiUser,
  ProjectExecuteGraphQL: PiTerminal,
};

// Basic App Actions
export const ActionIcons = {
  Refresh: PiArrowClockwise,
  Search: PiMagnifyingGlass,
  SearchOff: PiMagnifyingGlassMinus,
  SearchList: PiListMagnifyingGlass,
  Copy: PiCopy,
  Edit: PiPencilSimple,
  Delete: PiTrash,
  Add: PiPlus,
  FormatCode: PiTextIndent,
  Download: PiDownloadSimple,
  Select: PiCaretUpDown,
  Save: PiFloppyDisk,
  Expand: PiArrowsInLineVertical,
  Collapse: PiArrowsOutLineVertical,
  SignOut: PiSignOutBold,
  CompareBuilds: BiGitCompare,
};

// Navbar Icons
export const NavbarIcons = {
  Explorer: PiCompass,
  ExplorerActive: PiCompassFill,
  DatabaseAdmin: PiDatabase,
  DatabaseAdminActive: PiDatabaseFill,
  Chat: PiChatCircle,
  GraphiQL: PiPlay,
  GraphiQLActive: PiPlayFill,
  Settings: PiGear,
  SettingsActive: PiGearFill,
  Insights: PiEye,
  Changes: PiGitBranch,
};

// Visualization
export const VisualizationIcons = {
  ShowRoot: PiShareNetwork,
  ShowRootActive: PiShareNetworkFill,
  CenterGraph: PiAlignCenterVertical,
  ShowRelationships: PiArrowsLeftRight,
  ShowLegend: PiMapTrifold,
  ShowLegendActive: PiMapTrifoldFill,
  ShowSearchDetails: PiListMagnifyingGlass,
  NodeIsActive: PiBinoculars,
  ClusterData: PiPolygon,
  ClusterDataActive: PiPolygonFill,
  ShowDataSources: PiDatabaseFill,
  HideDataSources: PiDatabase,
};

export const BillingIcons = {
  CreditCard: PiCreditCard,
  Receipt: PiReceipt,
};

export const ChatIcons = {
  SendChat: PiArrowUpBold,
  NewChat: PiChatCircleBold,
  LikeMessage: PiThumbsUp,
  DislikeMessage: PiThumbsDown,
  ShareChat: PiShare,
  SqlContent: PiDatabase,
  PythonContent: PiCodeBlock,
  JsonContent: PiBracketsCurly,
  FaFileAlt: FaFileAlt,
  FaCopy: FaCopy,
  FaDownload: FaDownload,
  FaAngleDown: FaAngleDown,
  FaAngleRight: FaAngleRight,
  FaAngleLeft: FaAngleLeft,
  Artifacts: HiOutlineArchiveBox,
  Executing: FaTerminal,
  Table: FiTable,
  CopyLink: FaLink,
  ToolCallExecuted: IoMdCheckmarkCircleOutline,
  PachaUnableToConnect: CiCloudOff,
  PachaConnected: CiCloudOn,
};

// Model Page
export const ModelIcons = {
  PermissionsPartial: PiFunnelSimple,
  PermissionsFull: PiCheck,
  PermissionsNone: PiX,
};

export const UIControlIcons = {
  OpenDrawerSide: PiSidebarSimpleDuotone,
  DarkMode: PiMoon,
  LightMode: PiSun,
  Maximize: PiCornersOut,
  Minimize: PiCornersIn,
  SkipForward: PiSkipForward,
  SkipBackward: PiSkipBack,
  Close: PiX,
  Filter: PiFunnelSimple,
  PasswordShow: PiEye,
  PasswordHide: PiEyeSlash,
  EditDisabled: PiPencilSlash,
  MoreOptions: PiDotsThreeOutlineVertical,
  MoreOptionsHorizontal: PiDotsThreeOutline,
  Undo: PiArrowCounterClockwise,
};

export const FeedbackIcons = {
  Info: PiInfo,
  Warning: PiWarning,
  WarningCircleFill: PiWarningCircleFill,
  Error: PiXCircle,
};

export const CheckIcons = {
  Check: PiCheck,
  CheckAll: PiChecks,
  CheckCircle: PiCheckCircle,
  CheckCircleFill: PiCheckCircleFill,
  Unchecked: PiCircle,
};

export const ArrowIcons = {
  ArrowRight: PiArrowRight,
  ArrowLeft: PiArrowLeft,
  ArrowUp: PiArrowUp,
  ThickArrowRight: HiOutlineArrowRight,
  ChevronRight: PiCaretRight,
  ChevronLeft: PiCaretLeft,
  ChevronUp: PiCaretUp,
  ChevronDown: PiCaretDown,
  ChevronDoubleLeft: PiCaretDoubleLeft,
  ChevronDoubleRight: PiCaretDoubleRight,
  ChevronDoubleUp: PiCaretDoubleUp,
  ChevronDoubleDown: PiCaretDoubleDown,
};

export const FormIcons = {
  Password: PiLockSimple,
  Email: PiAt,
  Secret: PiKey,
};

export const MiscIcons = {
  Clock: PiClock,
  Calendar: PiCalendar,
  CalendarSimple: PiCalendarBlank,
  Rocket: PiRocketLaunch,
  Question: PiQuestion,
  Recycle: PiRecycle,
  List: PiList,
  LineChart: PiChartLine,
  ExternalLink: PiArrowUpRight,
  Link: PiLink,
  Users: PiUsers,
  UserCircle: PiUserCircle,
  UserCheck: LiaUserCheckSolid,
  PendingUser: LiaUserClockSolid,
  QueryTracing: VscDebugAlt,
  Play: PiPlay,
  Explain: IoEaselOutline,
  Broadcast: PiBroadcast,
  Connectors: PiPlugsConnected,
  Postgresql: BiLogoPostgresql,
  Pin: VscPinned,
  Version: PiStack,
  Cloud: PiCloud,
  CloudLightning: PiCloudLightning,
  Lock: PiLock,
  History: PiClockCounterClockwise,
  Bell: PiBell,
  SlidersHorizontal: PiSlidersHorizontal,
  SlidersVertical: PiSliders,
  Send: PiPaperPlane,
  Envelope: PiEnvelope,
  Hand: PiHand,
  FunnelFilter: FaFilter,
  ContactSupport: HiOutlineSupport,
  Docs: CgReadme,
  DottedCircle: TbCircleDotted,
  NotUploaded: CiCloudOff,
  TrendUp: PiTrendUp,
  TrendDown: PiTrendDown,
  DocsLink: TbNotes,
};

export const ShareProjectIcons = {
  RequestAccess: PiDoor,
  Restricted: PiLock,
  Public: PiGlobeHemisphereWest,
  Collaborators: PiUsers,
  Invitations: PiEnvelope,
};

export const TopologyIcons = {
  Api: PiCube,
  Connector: PiLink,
  Database: PiDatabase,
};

// leaving the properties for which we don't have a suitable icon as undefined
export const MantineReactTableIcons: Partial<MRT_Icons> = {
  IconArrowAutofitContent: undefined,
  IconArrowsSort: PiArrowsDownUp,
  IconBaselineDensityLarge: PiArrowsOutLineVertical,
  IconBaselineDensityMedium: PiArrowsOutLineVertical,
  IconBaselineDensitySmall: PiArrowsOutLineVertical,
  IconBoxMultiple: PiStack,
  IconChevronDown: PiCaretDown,
  IconChevronLeft: PiCaretLeft,
  IconChevronLeftPipe: undefined,
  IconChevronRight: PiCaretRight,
  IconChevronRightPipe: undefined,
  IconChevronsDown: PiCaretDoubleDown,
  IconCircleX: PiXCircle,
  IconClearAll: PiX,
  IconColumns: PiTextColumns,
  IconDeviceFloppy: PiFloppyDisk,
  IconDots: PiDotsThreeDuotone,
  IconDotsVertical: PiDotsThreeVertical,
  IconEdit: PiPencil,
  IconEyeOff: PiEyeSlash,
  IconFilter: PiFunnel,
  IconFilterCog: undefined,
  IconFilterOff: PiFunnelFill,
  IconGripHorizontal: undefined,
  IconMaximize: PiCornersOut,
  IconMinimize: PiCornersIn,
  IconPinned: PiPushPin,
  IconPinnedOff: PiPushPinSlash,
  IconSearch: PiMagnifyingGlass,
  IconSearchOff: PiMagnifyingGlassMinus,
  IconSortAscending: BsSortDown,
  IconSortDescending: BsSortUp,
  IconX: PiX,
};

export const DDNPlanIcons = {
  DDNFree: PiUsers,
  DDNBase: FaRegBuilding,
  DDNAdvanced: LuBuilding2,
  DDNPrivate: LuServer,
  UpgradePlan: FaArrowUp,
  DowngradePlan: FaArrowDown,
};

export const DDNInfraIcons = {
  PrivateDDN: PiShieldCheck,
  PublicDDN: MdOutlinePublic,
};

export const Icons = {
  ...CoreIcons,
  ...ProjectRoles,
  ...MetadataIcons,
  ...ActionIcons,
  ...NavbarIcons,
  ...VisualizationIcons,
  ...BillingIcons,
  ...ModelIcons,
  ...UIControlIcons,
  ...FeedbackIcons,
  ...CheckIcons,
  ...ArrowIcons,
  ...FormIcons,
  ...MiscIcons,
  ...TopologyIcons,
  ...DDNPlanIcons,
  ...ShareProjectIcons,
  ...DDNInfraIcons,
  ...ChatIcons,
};
