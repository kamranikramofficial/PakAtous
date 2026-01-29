"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star, User as UserIcon } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
    image?: string;
  };
  rating: number;
  comment: string;
  title?: string;
  createdAt: string;
}

interface ReviewSectionProps {
  itemId: string;
  itemType: "GENERATOR" | "PART";
  onCountChange?: (count: number) => void;
}

export function ReviewSection({ itemId, itemType, onCountChange }: ReviewSectionProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/api/reviews?itemId=${itemId}&itemType=${itemType}`);
      setReviews(res.data);
      if (onCountChange) {
        onCountChange(res.data.length);
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [itemId, itemType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
        toast({
            title: "Please login",
            description: "You need to be logged in to write a review.",
            variant: "destructive",
        });
        return;
    }
    
    setSubmitting(true);
    try {
      await axios.post("/api/reviews", {
        itemId,
        itemType,
        rating,
        title,
        comment,
      });

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      setIsOpen(false);
      setRating(5);
      setTitle("");
      setComment("");
      fetchReviews();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
        setSubmitting(false);
    }
  };

  const averageRating = reviews.length
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8 py-8 border-t mt-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Number(averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="font-medium">{averageRating} out of 5</span>
            <span className="text-muted-foreground">
              ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button disabled={!session} variant="outline">
                    {session ? "Write a Review" : "Login to Review"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                    <DialogDescription>
                        Share your experience with this product.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Rating</Label>
                        <div className="flex gap-2">
                             {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${
                                            star <= rating
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input 
                            id="title" 
                            placeholder="Great product!" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="comment">Comment</Label>
                        <Textarea 
                            id="comment" 
                            placeholder="Tell us more about your experience..." 
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {loading ? (
             <div className="text-center py-8">Loading reviews...</div>
        ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg">
                No reviews yet. Be the first to write one!
            </div>
        ) : (
            <div className="grid gap-6">
                {reviews.map((review) => (
                    <div key={review._id} className="border-b pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start gap-4">
                            <Avatar>
                                <AvatarImage src={review.userId?.image} />
                                <AvatarFallback>
                                    <UserIcon className="w-4 h-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">{review.userId?.name || 'Anonymous'}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${
                                                star <= review.rating
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                        />
                                    ))}
                                </div>
                                {review.title && <h4 className="font-medium text-sm text-gray-900">{review.title}</h4>}
                                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
