define([
    'api/google-drive-api',
    'ui/spinner/site-global-loading-bar',
    'storage/thought-storage-api',
    'storage/thought-tree'
], function(
    googleDriveApi,
    siteGlobalLoadingBar,
    thoughtStorageApi,
    thoughtStorageTree
) {
    'use strict';

    var appRootFolder = thoughtStorageApi.appRootFolder;
    var thoughtsTree = {};

    var spinner = siteGlobalLoadingBar.create('thought-storage');

    return {
        restoreFromCache: restoreFromCache,
        scanDrive: scanDrive,

        // thoughts tree
        findThoughtById: thoughtStorageTree.findThoughtById,
        getThoughts: thoughtStorageTree.getThoughts,
        logTree: thoughtStorageTree.logTree,
        getRoot: thoughtStorageTree.getRoot,
        addChildrenToTree: thoughtStorageTree.addChildrenToTree,

        // api:
        APP_FOLDER_NAME: thoughtStorageApi.APP_FOLDER_NAME,
        fetchParentThought: fetchParentThought,
        fetchChildThoughts: fetchChildThoughts,
        getThoughtContent: thoughtStorageApi.getThoughtContent,
        create: create,
        update: thoughtStorageApi.update,
        remove: remove,
        updateThoughtName: updateThoughtName,
        getLinkToThought: getLinkToThought
    };

    function fetchChildThoughts(thought) {
        return thoughtStorageApi.fetchChildThoughts(thought)
            .then(function(children) {
                thoughtStorageTree.addChildrenToTree({
                    parentId: thought.id,
                    children: children
                });

                return children;
            });
    }

    function fetchParentThought(thoughtId) {
        return thoughtStorageApi.fetchParentThought(thoughtId)
            .then(function(parentThought) {
                var thought = thoughtStorageTree.findThoughtById(thoughtId);
                if (thought) { // root folder has no parent
                    thought.parent = parentThought;
                }
                return thought;
            });
    }

    function scanDrive() {
        console.debug('thoughtStorage.scanDrive()');
        return thoughtStorageApi.scanDrive()
            .then(function(appRootFolder) {
                thoughtStorageTree.setRoot(appRootFolder);
                console.info('Thought tree root set to the App root folder on Google Drive');
                console.debug('thoughtStorage.scanDrive(), stored thoughtsTree: ', thoughtsTree);
            });
    }

    function restoreFromCache() {
        return thoughtStorageTree.restoreFromCache();
    }

    function create(thought, parentThought) {
        console.info('Creating a new thought: ', thought.name);  
        return thoughtStorageApi.create(thought, parentThought).then(function(createdThought) {
            console.info('Created new thought: ', thought.name);  
            return createdThought;
        });

    }

    function updateThoughtName(thought) {
        var oldThought = this.findThoughtById(thought.id);
        var newThought = thought;
        return Promise.all([
            thoughtStorageApi.updateFileName(newThought),
            thoughtStorageApi.updateThoughtContentFileName(newThought, oldThought)
        ])
        .then(function(responses) {
            oldThought.name = newThought.name;
            return responses;
        });
    }

    function remove(note) {
        return thoughtStorageApi.remove(note).then(function(result) {
            thoughtStorageTree.deleteNode(note);
            return result;
        });
    }

    function getLinkToThought(thought) {
        return 'https://drive.google.com/drive/folders/' + thought.id;
    }

});
