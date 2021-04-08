export default {
    node_env : process.env.NODE_ENV || 'development',
    jwt : {
        secret: process.env.JWT_SECRET!,
        expiresIn: 60 * 60 * 2
    },
    postgres : {
        host: process.env.POSTGRES_HOST!,
        port: parseInt(process.env.POSTGRES_PORT!),
        user: process.env.POSTGRES_USER!,
        password: process.env.POSTGRES_PASSWORD!,
        database: process.env.POSTGRES_DB!,
    },
    hackernews : {
        databaseUrl : 'https://hacker-news.firebaseio.com/',
        apiVersion : 'v0'
    },
    elasticsearch : {
        url: process.env.ELASTICSEARCH_URL!
    },

    isProduction : function () : boolean {
        return this.node_env === 'production';
    }
}
