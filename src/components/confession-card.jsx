import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Share2, MoreHorizontal, Heart, Flag, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { handle_likes, add_comment, get_comments, add_reports } from '@/appwrite/functions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/contexts/theme';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";


const useShare = () => {
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;
  const canCopy = typeof navigator !== 'undefined' && !!navigator.clipboard;

  const share = async ({ title, text, url }) => {
    if (canShare) {
      try {
        await navigator.share({ title, text, url });
        return { success: true, method: 'native' };
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Sharing failed', error);
          throw error;
        }
      }
    }
    
    if (canCopy) {
      try {
        await navigator.clipboard.writeText(`${text}\n\n\n${url}`);
        return { success: true, method: 'clipboard' };
      } catch (error) {
        console.error('Copy failed', error);
        throw error;
      }
    }
    
    throw new Error('No sharing capabilities');
  };

  return { share, canShare, canCopy };
};

export default function ConfessionCard({ confession, onUpdate }) {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');
  const { toast } = useToast();
  const { theme } = useTheme();
  const [localLikes, setLocalLikes] = useState(confession.likes || 0);
  const { share, canShare, canCopy } = useShare();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportText, setReportText] = useState("");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isreporting , setIsReporting] = useState(false);
  const [commentToReport, setCommentToReport] = useState(null);
  const [showCommentReportDialog, setShowCommentReportDialog] = useState(false);
  const reportOptions = [
    { value: "inappropriate", label: "This confession is inappropriate" },
    { value: "harassment", label: "This confession is harassment" },
    { value: "misinformation", label: "This confession is misinformation" },
    { value: "spam", label: "This confession is spam" },
    { value: "other", label: "Other" }
  ];
const commentreportOptions = [
    { value: "inappropriate", label: "This comment is inappropriate" },
    { value: "harassment", label: "This comment is harassment" },
    { value: "misinformation", label: "This comment is misinformation" },
    { value: "spam", label: "This comment is spam" },
    { value: "other", label: "Other" }
  ];
  
  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    setIsLiked(!!likedPosts[confession.$id]);
  
      fetchComments();
    
  }, [confession.$id, showComments]);

  useEffect(() => {
    const updateTime = () => {
      setTimeAgo(formatDistanceToNow(new Date(confession.$createdAt), { addSuffix: true }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [confession.$createdAt]);

  const fetchComments = async () => {
    try {
      setIsLoadingComments(true);
      const fetchedComments = await get_comments(confession.$id);
      setComments(fetchedComments.documents);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLike = async () => {
    try {
      // Optimistically update UI
      const newLikeStatus = !isLiked;
      setIsLiked(newLikeStatus);
      setLocalLikes(prev => newLikeStatus ? prev + 1 : prev - 1);
      
      // Update backend without triggering reload
      await handle_likes(confession.$id, localLikes);
      
      if (newLikeStatus) {
        toast({
          title: "Liked! 💜",
          description: "Your support means a lot!",
          variant: "success",
        });
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikeStatus);
      setLocalLikes(prev => newLikeStatus ? prev - 1 : prev + 1);
      console.error('Failed to update likes:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        console.log('Adding comment:', newComment);
        await add_comment(confession.$id, newComment);
        setNewComment("");
        fetchComments();
        toast({
          title: "Comment added! 💭",
          description: "Your thoughts have been shared!",
          variant: "success",
        });
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "NIST Confession",
      text: confession.text,
      url: window.location.href
    };

    try {
      const { success, method } = await share(shareData);
      toast({
        title: method === 'native' ? "Shared! 🚀" : "Copied! 📋",
        description: method === 'native' 
          ? "Successfully shared the confession"
          : "Link copied to clipboard!",
        variant: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Couldn't share",
        description: "Something went wrong while sharing",
        variant: "destructive",
      });
    }
  };

  const handleReport = async () => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report reason",
        variant: "destructive",
      });
      return;
    }
    setIsReporting(true);

    // Find the selected report option label
    const selectedOption = reportOptions.find(option => option.value === reportType);
    
    // Use user's text if provided, otherwise use the selected option label
    const finalReportText = reportText.trim() 
      ? `${selectedOption.label} - ${reportText}` 
      : selectedOption.label;

    const document = { 
      documentid: confession.$id,
      report: finalReportText,
      type: reportType,
      of:"confession"
    }

    try {
      await add_reports(document);
      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe",
        variant: "success",
      });
      
      setShowReportDialog(false);
      setReportType("");
      setReportText("");
    } catch (error) {
      toast({
        title: "Failed to submit report",
        description: "Please try again later",
        variant: "destructive",
      });
    }
    setIsReporting(false);
  };

  const handleCommentReport = async () => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report reason",
        variant: "destructive",
      });
      return;
    }
    setIsReporting(true);

    const selectedOption = commentreportOptions.find(option => option.value === reportType);
    const finalReportText = reportText.trim() 
      ? `${selectedOption.label} - ${reportText}` 
      : selectedOption.label;

    const document = { 
      documentid: commentToReport.$id,
      report: finalReportText,
      type: reportType,
      of: "comment"
    }

    try {
      await add_reports(document);
      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe",
        variant: "success",
      });
      
      setShowCommentReportDialog(false);
      setReportType("");
      setReportText("");
      setCommentToReport(null);
    } catch (error) {
      toast({
        title: "Failed to submit report",
        description: "Please try again later",
        variant: "destructive",
      });
    }
    setIsReporting(false);
  };

  return (
    <motion.div
      className={`backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group ${
        theme === 'dark' 
          ? 'bg-white/5 border border-white/10' 
          : 'bg-white border border-gray-100'
      }`}
      whileHover={{ scale: 1.01 }}
      layout 
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            NISTIAN #{confession.$id.slice(-4)}
          </span>
          
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-gray-400 hover:text-purple-400 transition-colors duration-300">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-0" align="end">
                <div className={`rounded-lg overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                }`}>
                  <button
                    onClick={() => {
                      setShowReportDialog(true);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                      theme === 'dark' 
                        ? 'hover:bg-gray-800 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
              <DialogContent className={`sm:max-w-[425px] ${
                theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'
              }`}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Report Confession
                  </DialogTitle>
                  <DialogDescription>
                    Help us understand what's wrong with this confession.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Select
                    value={reportType}
                    onValueChange={setReportType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason for reporting" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Additional details about your report..."
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    className={`min-h-[100px] ${
                      theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
                    }`}
                  />
                  <Button  
                  disabled = {isreporting}
                    onClick={handleReport}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {isreporting ? 'Reporting...' : 'Report'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <p className={`text-lg leading-relaxed ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
        }`}>
          {confession.text}
        </p>

        <div className={`flex items-center justify-between pt-4 border-t ${
          theme === 'dark' ? 'border-white/5' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-6">
            <motion.button 
              onClick={handleLike}
              className={`flex items-center gap-2 transition-all duration-300 ${
                isLiked ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'
              }`}
              whileTap={{ scale: 0.9 }}
            >
             <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-600' : ''}`} />
              <span>{localLikes}</span>
            </motion.button>
            <motion.button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors duration-300"
              whileTap={{ scale: 0.9 }}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length}</span>
            </motion.button>
            <motion.button
              onClick={handleShare}
              className="group relative flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors duration-300"
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="w-4 h-4" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {canShare ? 'Share' : 'Copy link'}
              </span>
            </motion.button>
          </div>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
            {timeAgo}
          </span>
        </div>
        
        <AnimatePresence mode="wait">
          {showComments && (
            <motion.div 
              className="space-y-4 pt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleComment} className="space-y-2">
                <textarea 
                  placeholder="Add a comment..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className={`w-full rounded-xl border-0 placeholder:text-gray-500 resize-none p-3 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-black/20 text-white' 
                      : 'bg-gray-50 text-gray-900'
                  }`}
                />
                <motion.button 
                  type="submit" 
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Comment
                </motion.button>
              </form>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {isLoadingComments ? (
                    [...Array(2)].map((_, i) => (
                      <Skeleton
                        key={`comment-skeleton-${i}`}
                        className="w-full h-16 rounded-xl"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))
                  ) : (
                    comments.map((comment) => (
                      <motion.div 
                        key={comment.$id} 
                        className={`rounded-xl p-4 group/comment transition-colors duration-300 ${
                          theme === 'dark'
                            ? 'bg-black/20 hover:bg-black/30'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <p className={theme === 'dark' ? 'text-gray-200 font-mono' : 'text-gray-700 font-mono'}>
                          {comment.comment_text}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-gray-500 text-xs">
                            {formatDistanceToNow(new Date(comment.$updatedAt))}
                          </p>
                          <Popover>
                            <PopoverTrigger asChild>
                              <motion.button 
                                className="text-gray-500 opacity-0 group-hover/comment:opacity-100 transition-opacity duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </motion.button>
                            </PopoverTrigger>
                            <PopoverContent className="w-40 p-0" align="end">
                              <div className={`rounded-lg overflow-hidden ${
                                theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                              }`}>
                                <button
                                  onClick={() => {
                                    setCommentToReport(comment);
                                    setShowCommentReportDialog(true);
                                  }}
                                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                                    theme === 'dark' 
                                      ? 'hover:bg-gray-800 text-gray-300' 
                                      : 'hover:bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  <Flag className="w-4 h-4" />
                                  Report
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </motion.div>
                    ))

                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Dialog open={showCommentReportDialog} onOpenChange={setShowCommentReportDialog}>
        <DialogContent className={`sm:max-w-[425px] ${
          theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'
        }`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Report Comment
            </DialogTitle>
            <DialogDescription>
              Help us understand what's wrong with this comment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select
              value={reportType}
              onValueChange={setReportType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason for reporting" />
              </SelectTrigger>
              <SelectContent>
                {commentreportOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Additional details about your report..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className={`min-h-[100px] ${
                theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            />
            <Button  
              disabled={isreporting}
              onClick={handleCommentReport}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {isreporting ? 'Reporting...' : 'Report'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )}
