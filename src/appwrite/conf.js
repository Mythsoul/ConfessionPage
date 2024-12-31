const conf = {
    appwriteurl: String(import.meta.env.VITE_APPWRITE_URL),
    appwriteproject: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwrite_databaseid: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    appwrite_collectionid: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),
    appwrite_comments_collectionid: String(import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID),
    appwrite_teacher_collectionid: String(import.meta.env.VITE_APPWRITE_TEACHER_COLLECTION_ID),
    appwrite_teacher_comments_collectionid: String(import.meta.env.VITE_APPWRITE_TEACHER_COMMENT_COLLECTION_ID),
    appwrite_reports_collectionid: String(import.meta.env.VITE_APPWRITE_REPORTS_COLLECTION_ID),
};  

export default conf;
