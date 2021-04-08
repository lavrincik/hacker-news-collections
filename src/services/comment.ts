import { Comment } from '../entities/comment';
import { getRepository } from 'typeorm';

export default class CommentService {
    public async getCommentsByStoryId(storyId: number): Promise<Comment[]> {
        const commentRepository = getRepository(Comment);
        return await commentRepository.createQueryBuilder('comment')
            .leftJoin('comment.story', 'story')
            .where('story.id = :storyId', { storyId })
            .getMany();
    }
}