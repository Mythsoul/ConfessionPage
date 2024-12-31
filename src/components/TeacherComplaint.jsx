import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import TeacherComplaintCard from './TeacherComplaintCard';
import { add_complaint, get_complaints } from '@/appwrite/functions';


export default function TeacherComplaints() {
  const [complaint, setComplaint] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await get_complaints();
      setComplaints(response.documents);

    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      toast({
        title: "Error",
        description: "Failed to fetch complaints. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (complaint.trim() && teacherName.trim()) {
      setIsSubmitting(true);
      try {
        await add_complaint(complaint, teacherName);
        setComplaint("");
        setTeacherName("");
        fetchComplaints();
        toast({
          title: "Posted successfully!",
          description: "Your rant has been added 😈",
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Error!",
          description: "Failed to post your rant. Try again!",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <motion.h1 
        className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        Teacher Rants
      </motion.h1>
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8"
      >
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Who's the teacher?</label>
          <Input 
            placeholder="Enter their name..." 
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="text-lg p-4 rounded-xl bg-white/5 text-white placeholder-gray-400"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Spill the tea ☕️</label>
          <Textarea 
            placeholder="What's your story about this teacher..." 
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            className="min-h-[150px] text-lg p-4 rounded-xl bg-white/5 text-white placeholder-gray-400"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full text-lg py-4 px-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Sparkles className="w-6 h-6 mr-2 animate-spin" />
          ) : (
            <Send className="w-6 h-6 mr-2" />
          )}
          {isSubmitting ? 'Posting...' : 'Post Anonymously'}
        </Button>
      </motion.form>

      <div className="space-y-4">
        <AnimatePresence>
          {complaints.map((complaint) => (
            <TeacherComplaintCard key={complaint.$id} complaint={complaint} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

