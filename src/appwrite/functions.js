import { Account, ID, Databases, Client, Query } from "appwrite";
import conf from "./conf";
import { comment } from "postcss";

const client = new Client();
if (!conf.appwriteproject || !conf.appwriteurl) {
    throw new Error('Appwrite configuration is missing required fields');
}

client
    .setEndpoint(conf.appwriteurl)
    .setProject(conf.appwriteproject);

export const account = new Account(client);
export { ID } from 'appwrite';
const databases = new Databases(client);

export async function add_confessions(confession) {
    if (!confession || typeof confession !== 'string') {
        throw new Error('Confession text is required and must be a string');
    }

    try {
        const documentData = {
            text: confession,
            date: new Date().toISOString().slice(0, 19).replace('T', ' ').split(' ')[0],
            likes: 0,
        };
        console.log(documentData);

        const response = await databases.createDocument(
            conf.appwrite_databaseid,
            conf.appwrite_collectionid,
            ID.unique(),
            documentData
        );
        return response;
    } catch (error) {
        console.error("Error adding confession:", error);
        throw new Error(`Failed to add confession: ${error.message}`);
    }
}

export function get_confessions() {
    return databases.listDocuments(
        conf.appwrite_databaseid, 
        conf.appwrite_collectionid,
        [
            Query.orderDesc('$createdAt')
        ]
    );
}   

export async function handle_likes(confessionId, currentLikes) {
    try {
        // Check if user already liked using localStorage
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
        const hasLiked = likedPosts[confessionId];

        if (hasLiked) {
            // Remove like
            await databases.updateDocument(
                conf.appwrite_databaseid,
                conf.appwrite_collectionid,
                confessionId,
                { likes: currentLikes - 1 }
            );
            
            // Remove from localStorage
            delete likedPosts[confessionId];
            localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
            return false;
        } else {
            // Add like
            await databases.updateDocument(
                conf.appwrite_databaseid,
                conf.appwrite_collectionid,
                confessionId,
                { likes: currentLikes + 1 }
            );
            
            // Save to localStorage
            likedPosts[confessionId] = true;
            localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
            return true;
        }
    } catch (error) {
        console.error('Error handling like:', error);
        throw error;
    }
}

export async function add_comment(confessionId, commentText) {
    try {
        const response = await databases.createDocument(
            conf.appwrite_databaseid,
            conf.appwrite_comments_collectionid,
            ID.unique(),
            {
                comment_id : confessionId,
                comment_text: commentText,
            }
        );
        return response;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
}

export async function get_comments(confessionId) {
    try {
        return await databases.listDocuments(
            conf.appwrite_databaseid,
            conf.appwrite_comments_collectionid,
            [
                Query.equal('comment_id', confessionId),
                Query.orderDesc('$createdAt')
            ]

        );
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
}

export async function add_teacher_complaint_comment(complaintId, commentText) {
    try {
        const response = await databases.createDocument(
            conf.appwrite_databaseid,
            conf.appwrite_teacher_comments_collectionid, 
            ID.unique(),
            {
                comment_id: complaintId,
                comment_text: commentText,
            }
        );
        return response;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
}

export async function get_complaints_comments(complaintId) {
    try {
        return await databases.listDocuments(
            conf.appwrite_databaseid,
            conf.appwrite_teacher_comments_collectionid,
            [
                Query.equal('comment_id', complaintId),
                Query.orderDesc('$createdAt')
            ]
        );
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
}

export async function add_teacher_complaint_likes(complaintId, currentLikes) {
    try {
        const likedTeacherComplaints = JSON.parse(localStorage.getItem('likedTeacherComplaints') || '{}');
        const hasLiked = likedTeacherComplaints[complaintId];

        let newLikes = currentLikes;
        if (hasLiked) {
            // Remove like
            newLikes = Math.max(0, currentLikes - 1);
            delete likedTeacherComplaints[complaintId];
        } else {
            // Add like
            newLikes = currentLikes + 1;
            likedTeacherComplaints[complaintId] = true;
        }

        // Update database
        await databases.updateDocument(
            conf.appwrite_databaseid,
            conf.appwrite_teacher_collectionid,
            complaintId,
            { likes: newLikes }
        );
        
        // Update localStorage
        localStorage.setItem('likedTeacherComplaints', JSON.stringify(likedTeacherComplaints));
        
        return {
            isLiked: !hasLiked,
            likes: newLikes
        };
    } catch (error) {
        console.error('Error handling like:', error);
        throw error;
    }
}

export function checkIfLiked(complaintId) {
    const likedTeacherComplaints = JSON.parse(localStorage.getItem('likedTeacherComplaints') || '{}');
    return !!likedTeacherComplaints[complaintId];
}

export async function get_teacher_complaint_likes(complaintId) {
    try {
        return await databases.listDocuments(
            conf.appwrite_databaseid,
            conf.appwrite_teacher_collectionid,
            [
                Query.equal('$id', complaintId)
            ]
        );
    } catch (error) {
        console.error('Error fetching likes:', error);
        throw error;
    }
}

export function add_complaint(complaint, teacherName) {
    if (!complaint || !teacherName || typeof complaint !== 'string' || typeof teacherName !== 'string') {
        throw new Error('Complaint and teacher name are required and must be strings');
    }

    try {
        const documentData = {
            text: complaint,
            name: teacherName, 
            likes: 0, 
        };
        return databases.createDocument(
            conf.appwrite_databaseid,
            conf.appwrite_teacher_collectionid,
            ID.unique(),
            documentData
        );
    } catch (error) {
        console.error('Error adding complaint:', error);
        throw error;
    }
}

export function get_complaints() {
    return databases.listDocuments(
        conf.appwrite_databaseid,
        conf.appwrite_teacher_collectionid,
        [
            Query.orderDesc('$createdAt')
        ]
    );
}

export async function add_reports(document){ 
    try{ 
       const documentData = { 
           document_id: document.documentid,
           report: document.report,
           type: document.type,
           of : document.of,    
          
         
       };
       return await databases.createDocument(
           conf.appwrite_databaseid,
           conf.appwrite_reports_collectionid|| 'default_reports_collection_id',
           ID.unique(),
           documentData
       );
    } catch(err){ 
        console.error('Error adding report:', err);
        throw err;
    }
}