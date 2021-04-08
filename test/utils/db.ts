import { getConnection, getManager } from 'typeorm';
import { Collection } from '../../src/entities/collection';
import { User } from '../../src/entities/user';
import { Story } from '../../src/entities/story';
import { Comment } from '../../src/entities/comment';
import { collections, comments, stories, users } from './data';
import elasticsearchClient from '../../src/loaders/elasticsearch';

async function seedEs(): Promise<void> {
    let body: any[] = [];
    for (const collection of collections) {
        const cStories = stories.filter(s => {
            const collectionExists = s.collections.find(col => col.id === collection.id);
            return collectionExists !== undefined;
        });
        
        const cComments = comments.filter(c => {
            const collectionExists = c.story.collections.find(col => col.id === collection.id);
            return collectionExists !== undefined;
        });

        for (const story of cStories) {
            body.push(
                { index: { _index: 'story' } },
                {
                    userId: collection.user.id.toString(),
                    collectionId: collection.id.toString(),
                    id: story.id.toString(),
                    author: story.author,
                    time: story.time,
                    title: story.title
                }
            )
        }

        for (const comment of cComments) {
            body.push(
                { index: { _index: 'comment' } },
                {
                    userId: collection.user.id.toString(),
                    collectionId: collection.id.toString(),
                    id: comment.id.toString(),
                    author: comment.author,
                    time: comment.time,
                    text: comment.text
                }
            )
        }
    }

    const { body: bulkResponse } = await elasticsearchClient.bulk({ refresh: true, body });

    if (bulkResponse.errors) {
        const erroredDocuments: any[] = []
        bulkResponse.items.forEach((action: any, i: number) => {
          const operation = Object.keys(action)[0]
          if (action[operation].error) {
            erroredDocuments.push({
              status: action[operation].status,
              error: action[operation].error,
              operation: body[i * 2],
              document: body[i * 2 + 1]
            })
          }
        })

        console.log(erroredDocuments);
        throw Error('Elasticsearch bulk index error');
    }
}

export async function seedDb(): Promise<void> {
    const manager = getManager();
    await manager.save(User, users);
    await manager.save(Collection, collections);
    await manager.save(Story, stories);
    await manager.save(Comment, comments);

    await seedEs();
}

export async function clearDb(): Promise<void> {
    const entities = getConnection().entityMetadatas;
    const manager = getManager();
  
    for (const entity of entities) {
        await manager.query(`TRUNCATE "${entity.tableName}" CASCADE`);
    }

    await clearEs();
};

async function clearEs(): Promise<void> {
    await elasticsearchClient.indices.delete({
        index: '_all' 
    });
}
