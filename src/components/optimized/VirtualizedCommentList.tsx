import React, { memo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Comment } from '../../types';
import { CommentCard } from '../CommentCard';

interface VirtualizedCommentListProps {
  comments: Comment[];
  onReply: (commentId: string, replyText: string) => void;
  onDelete: (commentId: string) => void;
  onLike: (commentId: string) => void;
  onDislike: (commentId: string) => void;
  currentUserId: string;
}

const Row = memo(({ index, style, data }: { index: number; style: React.CSSProperties; data: any }) => {
  const { comments, ...rest } = data;
  const comment = comments[index];
  return (
    <div style={style}>
      <CommentCard comment={comment} {...rest} />
    </div>
  );
});

export const VirtualizedCommentList: React.FC<VirtualizedCommentListProps> = ({
  comments,
  ...rest
}) => {
  const itemData = { comments, ...rest };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          itemCount={comments.length}
          itemSize={120} // Adjust based on your comment card's average height
          width={width}
          itemData={itemData}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
};