import React from 'react';
import React from 'react';

export interface IconProps {
  className?: string;
  size?: number, 

export const LikeIcon = (props: IconProps) => {
  return React.createElement('div', { className: props.className }, '👍');

export const DislikeIcon = (props: IconProps) => {
  return React.createElement('div', { className: props.className }, '👎');

export const CommentIcon = (props: IconProps) => {
  return React.createElement('div', { className: props.className }, '💬');

export const ShareIcon = (props: IconProps) => {
  return React.createElement('div', { className: props.className }, '🔗');

export default {
  LikeIcon,
  DislikeIcon,
  CommentIcon,
  ShareIcon, 