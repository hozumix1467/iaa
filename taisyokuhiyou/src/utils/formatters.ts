export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Calculate the difference in milliseconds
  const diffMs = now.getTime() - date.getTime();
  
  // Convert to seconds, minutes, hours, days
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Format based on how recent the date is
  if (diffSeconds < 60) {
    return '数秒前';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  } else if (diffHours < 24) {
    return `${diffHours}時間前`;
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else {
    // For older dates, use a formal date format
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
};