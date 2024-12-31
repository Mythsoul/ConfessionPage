import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, MoreHorizontal, Heart, Share2, Flag, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { add_teacher_complaint_likes, add_teacher_complaint_comment, get_complaints_comments, checkIfLiked } from '@/appwrite/functions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { add_reports } from '@/appwrite/functions';


export default function TeacherComplaintCard({ complaint }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportText, setReportText] = useState("");
  const [isreporting , setIsReporting] = useState(false);
  const { toast } = useToast();
  const [commentToReport, setCommentToReport] = useState(null);
  const [showCommentReportDialog, setShowCommentReportDialog] = useState(false);

 
  const reportOptions = [
    { value: "inappropriate", label: "The complaint is inappropriate" },
    { value: "harassment", label: "The complaint is harassment" },
    { value: "misinformation", label: "The complaint is misinformation" },
    { value: "spam", label: "The complaint is spam" },
    { value: "other", label: "Other" }
  ];
const commentReportOptios = [
   { value: "inappropriate", label: "The comment is inappropriate" },
    { value: "harassment", label: "The comment is harassment" },
    { value: "misinformation", label: "The comment is misinformation" },
    { value: "spam", label: "The comment is spam" },
    { value: "other", label: "Other" }
]
  useEffect(() => {
    fetchComments();
    const hasLiked = checkIfLiked(complaint.$id);
    setIsLiked(hasLiked);
    setLikes(complaint.likes || 0);
  }, [complaint.$id]);

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await get_complaints_comments(complaint.$id);
      setComments(response.documents);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLike = async () => {
    try {
      // Optimistically update UI
      const newLikes = isLiked ? likes - 1 : likes + 1;
      setLikes(newLikes);
      setIsLiked(!isLiked);
      
      // Update backend
      const result = await add_teacher_complaint_likes(complaint.$id, likes);
      
      // If backend fails, revert changes
      if (!result) {
        setLikes(likes);
        setIsLiked(isLiked);
      }
      
      toast({
        title: !isLiked ? "Liked! ❤️" : "Unliked! 💔",
        description: !isLiked 
          ? "You've liked this complaint" 
          : "You've unliked this complaint",
        variant: "success",
      });
    } catch (error) {
      // Revert on error
      setLikes(likes);
      setIsLiked(isLiked);
      console.error('Failed to handle like:', error);
      toast({
        title: "Error",
        description: "Failed to process like",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: complaint.name,
        text: complaint.text,
        url: window.location.href,
      });
      toast({
        title: "Shared! 🔗",
        description: "Successfully shared the confession!",
        variant: "success",
      });
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share failed",
        description: "Unable to share the confession",
        variant: "error",
      });
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        await add_teacher_complaint_comment(complaint.$id, newComment.trim());
        setNewComment("");
        await fetchComments();
        toast({
          title: "Comment added! 💭",
          description: "Your thoughts have been shared!",
          variant: "success",
        });
      } catch (error) {
        console.error('Failed to add comment:', error);
        toast({
          title: "Error",
          description: "Failed to add comment",
          variant: "destructive",
        });
      }
    }
  };

  const handleReport = async (complain) => {
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
      documentid: complain,
      report: finalReportText,
      type: reportType,
      of : "teacher"
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

    const selectedOption = commentReportOptios.find(option => option.value === reportType);
    const finalReportText = reportText.trim() 
      ? `${selectedOption.label} - ${reportText}` 
      : selectedOption.label;

    const document = { 
      documentid: commentToReport.$id,
      report: finalReportText,
      type: reportType,
      of: "teacher_comment"
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-xl"
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-purple-400">
              {complaint.name} 
            </h3>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(complaint.$updatedAt), { addSuffix: true })}
            </span>
          </div>
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-gray-400 hover:text-purple-400 transition-colors duration-300">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-0" align="end">
                <div className="rounded-lg overflow-hidden bg-gray-900">
                  <button
                    onClick={() => setShowReportDialog(true)}
                    className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-800 text-gray-300"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
              <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Report Teacher Complaint
                  </DialogTitle>
                  <DialogDescription>
                    Help us understand what's wrong with this complaint.
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
                    className="min-h-[100px] bg-gray-800 text-white"
                  />
                  <Button 
                  
                    disabled={isreporting}
                    onClick={()=>{handleReport(complaint.$id)}}
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
        
        <p className="text-gray-200 text-lg">
          {complaint.text} 
        </p>

        <div className="flex items-center gap-6 pt-4 border-t border-white/5">
          <motion.button
            onClick={handleLike}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors duration-300"
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
            <span>{likes}</span>
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
            className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors duration-300"
            whileTap={{ scale: 0.9 }}
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </motion.button>
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
                  className="w-full rounded-xl border-0 bg-black/20 text-white placeholder:text-gray-500 resize-none p-3 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
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
                        className="rounded-xl p-4 bg-black/20 hover:bg-black/30 group/comment transition-colors duration-300"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <p className="text-gray-200 font-mono">{comment.comment_text}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-gray-500 text-xs">
                            {formatDistanceToNow(new Date(comment.$createdAt), { addSuffix: true })}
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
                              <div className="rounded-lg overflow-hidden bg-gray-900">
                                <button
                                  onClick={() => {
                                    setCommentToReport(comment);
                                    setShowCommentReportDialog(true);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-800 text-gray-300"
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
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
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
                {commentReportOptios.map((option) => (
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
              className="min-h-[100px] bg-gray-800 text-white"
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
  );
}

