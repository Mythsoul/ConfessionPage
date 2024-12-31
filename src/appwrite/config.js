import { Client, Databases, ID } from 'appwrite';
import conf from './conf';

const client = new Client();

client
    .setEndpoint(conf.appwriteurl)
    .setProject(conf.appwriteproject);

export { ID };
export const databases = new Databases(client);

