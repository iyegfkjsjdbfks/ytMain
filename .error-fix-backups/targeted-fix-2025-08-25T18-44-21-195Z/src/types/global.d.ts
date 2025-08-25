// Global type definitions
declare module 'react' {
  export * from '@types/react';

declare module 'react-dom' {
  export * from '@types/react-dom';

declare module 'react-router-dom' {
  export * from 'react-router-dom';

declare module '@heroicons/react/24/outline' {
  import { ComponentType, SVGProps } from 'react';
  export const XMarkIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const UserIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const PlayIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const ArrowTopRightOnSquareIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const ExclamationTriangleIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const FunnelIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const LightBulbIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const ArrowUpTrayIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const SignalIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const PencilSquareIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const ChatBubbleLeftIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const HeartIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const PaperAirplaneIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const EllipsisVerticalIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const HandThumbUpIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const HandThumbDownIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const ShareIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const BookmarkIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const FlagIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const ChevronDownIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const ChevronUpIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const MagnifyingGlassIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const Bars3Icon: ComponentType<SVGProps<SVGSVGElement>>
  export const BellIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const Cog6ToothIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const HomeIcon: ComponentType<SVGProps<SVGSVGElement>>
  export const FireIcon: ComponentType<SVGProps<SVGSVGElement>>
// Common component props
declare global {
  interface ComponentProps {
    className?: string;
    children?: React.ReactNode;
  
  interface VideoData {
    id: string;
    title: string;
    description?: string;
    thumbnail: string;
    duration: string;
    views: number;
    uploadedAt: string;
    channel: {
      id: string;
      name: string;
      avatar: string;
  
  interface ChannelData {
    id: string;
    name: string;
    avatar: string;
    bannerUrl?: string;
    description?: string;
    subscriberCount: number;
    videoCount: number;
  
  interface CommentData {
    id: string;
    text: string;
    author: {
      name: string;
      avatar: string;
    timestamp: string;
    likes: number;
    replies?: CommentData[];

export {};
