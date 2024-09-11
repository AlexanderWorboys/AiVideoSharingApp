import { Account, Client, ID, Avatars, Databases, Query, Storage } from 'react-native-appwrite';

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.aora',
    projectId: '66cb894e001c9e366986',
    databaseId: '66cb8af0002f343a7218',
    useCollectionId: '66cb8b17003d5dd1920a',
    videoCollectionId: '66cb8b3d002710f382f2',
    storageId: '66cb8c66000b2ef53811'
}

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    useCollectionId,
    videoCollectionId,
    storageId
} = appwriteConfig //saves writing appwriteConfig. everytime

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)
;

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);


export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username)

        await signIn(email, password)

        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.useCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl
            }
        )

        return newUser;

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);

        return session
    } catch (error) {
        throw new Error(error)
    }
}


export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.useCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];

    } catch (error) {
        console.log(error);
    }
}

export const getAllPosts = async () => {
    try {
        const post = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.orderDesc('$createdAt')]
        ) 

        return post.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getLatestPosts = async () => {
    try {
        const post = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.orderDesc('$createdAt', Query.limit(7))]
        ) 

        return post.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const searchPost = async (query) => {
    try {
        const post = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.search('title', query)]
        ) 

        return post.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getUserPosts = async (userId) => {
    try {
        const post = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.equal('creator', userId), Query.orderDesc('$createdAt')]
        ) 

        return post.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const signOut = async () => {
    try {
        const session = await account.deleteSession('current');

        return session;
    } catch (error) {
        throw new Error(error);
    }
}

export const getFilePreview = async (fileId, type) => {
    let fileUrl;
    console.log(fileId);
    
    try {
        if(type ==='video') {
            fileUrl = storage.getFileView(storageId, fileId)
        } else if(type === 'image') {
            fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100)
        } else {
            throw new Error('Invalid file tpye')
        }

        if(!fileUrl) throw Error;

        return fileUrl

    } catch (error) {
        throw new Error(error);
    }
}

export const uploadFile = async (file, type) => {
    if(!file) return;

    const asset = {
        name: file.fileName,
        type: file.mimeType,
        size: file.fileSize,
        uri: file.uri,
    };

    try {
        const uploadedFile = await storage.createFile(
            storageId,
            ID.unique(),
            asset
        );

        const fileUrl = await getFilePreview(uploadedFile.$id, type)
        return fileUrl;
    } catch (error) {
        throw new Error(error);
    }
}

export const createVideo = async (form) => {
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail, 'image'),
            uploadFile(form.video, 'video'),
        ])

        const newPost = await databases.createDocument(
            databaseId,
            videoCollectionId,
            ID.unique(),
            {
                title: form.title,
                thumbnail: thumbnailUrl,
                video: videoUrl,
                prompt: form.prompt,
                creator: form.userId
            }
        )

        return newPost;

    } catch (error) {
        throw new Error(error);
    }
}