"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const comment_1 = require("../entities/comment");
const typeorm_1 = require("typeorm");
class CommentService {
    async getCommentsByStoryId(storyId) {
        const commentRepository = typeorm_1.getRepository(comment_1.Comment);
        return await commentRepository.createQueryBuilder('comment')
            .leftJoin('comment.story', 'story')
            .where('story.id = :storyId', { storyId })
            .getMany();
    }
}
exports.default = CommentService;
//# sourceMappingURL=comment.js.map