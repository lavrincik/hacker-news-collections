import { Comment } from '../../../src/entities/comment';
import sinon from 'sinon';
import { Repository, SelectQueryBuilder } from 'typeorm';
import proxyquire from 'proxyquire';
import CommentService from '../../../src/services/comment';
import { expect } from 'chai';

describe('services - comment', function() {
    describe('getCommentsByStoryId()', function() {
        it('should return comments by story id', async function() {
            const mComments = [
                new Comment(),
                new Comment()
            ]
            for (let i = 0; i < 2; ++i) {
                mComments[i].id = i;
                mComments[i].author = `comment author${i}`;
                mComments[i].text = `text${i}`;
                mComments[i].time = i;
            }

            const storyId = 1;

            const commentRepository: sinon.SinonStubbedInstance<Repository<Comment>> = sinon.createStubInstance(Repository);
            const queryBuilder: sinon.SinonStubbedInstance<SelectQueryBuilder<Comment>> = sinon.createStubInstance(SelectQueryBuilder);
            queryBuilder.leftJoin.returnsThis();
            queryBuilder.where.withArgs(sinon.match.string, sinon.match({ storyId })).returnsThis();
            queryBuilder.getMany.resolves(mComments);
            commentRepository.createQueryBuilder.returns(queryBuilder as unknown as SelectQueryBuilder<Comment>)

            const typeormStub = {
                getRepository: sinon.stub().returns(commentRepository)
            }
            const MCommentService = proxyquire('../../../src/services/comment.ts', {
                typeorm: typeormStub
            }).default;
            const commentService: CommentService = new MCommentService();

            const comments = await commentService.getCommentsByStoryId(storyId);

            expect(queryBuilder.where).to.be.calledWith(sinon.match.string, sinon.match({ storyId }));
            expect(comments).to.be.equal(mComments);
        })
    })
})