import postsJson from './data/postList';
import postDetailJson from './data/postDetail';

export default {
    PostApiService: {
        getPostList: async () => {
            return await postsJson;
        },

        getPostData: async () => {
            return await postDetailJson;
        }
    }
}