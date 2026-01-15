import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock,
  Trash2,
  Shield
} from 'lucide-react';

interface Comment {
  id: string;
  reportId: string;
  adminEmail: string;
  message: string;
  timestamp: string;
  isInternal: boolean; // Internal notes only visible to admins
}

// Simulated comment storage (in production, use Supabase)
const commentsStore: Record<string, Comment[]> = {};

const ReportComments = ({ reportId }: { reportId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load comments for this report
  useEffect(() => {
    const reportComments = commentsStore[reportId] || [];
    setComments(reportComments);
  }, [reportId]);

  const addComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      const comment: Comment = {
        id: Date.now().toString(),
        reportId,
        adminEmail: 'maheshch1094@gmail.com', // Get from auth store in production
        message: newComment,
        timestamp: new Date().toISOString(),
        isInternal
      };

      if (!commentsStore[reportId]) {
        commentsStore[reportId] = [];
      }
      commentsStore[reportId].push(comment);
      
      setComments([...commentsStore[reportId]]);
      setNewComment('');
      setIsInternal(false);
      
      toast.success(isInternal ? 'Internal note added' : 'Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = (commentId: string) => {
    if (commentsStore[reportId]) {
      commentsStore[reportId] = commentsStore[reportId].filter(c => c.id !== commentId);
      setComments([...commentsStore[reportId]]);
      toast.success('Comment deleted');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments & Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment or internal note..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded"
              />
              <Shield className="w-4 h-4" />
              <span>Internal Note (Admin Only)</span>
            </label>
            <Button onClick={addComment} disabled={loading} size="sm">
              <Send className="w-4 h-4 mr-2" />
              Add {isInternal ? 'Note' : 'Comment'}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded-lg border ${
                  comment.isInternal
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-semibold text-sm">{comment.adminEmail}</span>
                    {comment.isInternal && (
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                        <Shield className="w-3 h-3 mr-1" />
                        Internal
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteComment(comment.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <p className="text-sm mb-2">{comment.message}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(comment.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportComments;
